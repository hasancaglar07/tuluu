import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import Quest from "@/models/Quest";
import UserQuest from "@/models/UserQuest";
import {
  UpdateQuestSchema,
  QuestStatusChangeSchema,
} from "@/lib/validations/quest";
import { authGuard } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const authe = await authGuard();
    if (authe instanceof NextResponse) {
      return authe; // early return on unauthorized or forbidden
    }

    const { id } = await params;

    // Connect to database
    await connectDB();

    // Find quest by ID
    const quest = await Quest.findById(id).lean();
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Get detailed user quest statistics
    const userQuestStats = await UserQuest.aggregate([
      { $match: { questId: quest._id } },
      {
        $group: {
          _id: null,
          usersAssigned: { $sum: 1 },
          usersCompleted: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          usersStarted: {
            $sum: {
              $cond: [
                { $in: ["$status", ["started", "in_progress", "completed"]] },
                1,
                0,
              ],
            },
          },
          usersAbandoned: {
            $sum: { $cond: [{ $eq: ["$status", "abandoned"] }, 1, 0] },
          },
          usersExpired: {
            $sum: { $cond: [{ $eq: ["$status", "expired"] }, 1, 0] },
          },
          averageProgress: { $avg: "$overallProgress" },
          totalRewardsValue: { $sum: "$totalRewardsValue" },
        },
      },
    ]);

    const stats = userQuestStats[0] || {
      usersAssigned: 0,
      usersCompleted: 0,
      usersStarted: 0,
      usersAbandoned: 0,
      usersExpired: 0,
      averageProgress: 0,
      totalRewardsValue: 0,
    };

    // Get recent user quest activities
    const recentActivities = await UserQuest.find({ questId: quest._id })
      .sort({ lastActivityAt: -1 })
      .limit(10)
      .select("clerkId status overallProgress lastActivityAt completedAt")
      .lean();

    // Calculate completion rate
    const completionRate =
      stats.usersAssigned > 0
        ? Math.round((stats.usersCompleted / stats.usersAssigned) * 100)
        : 0;

    // Transform quest to match admin page format with detailed analytics
    const transformedQuest = {
      id: quest._id.toString(),
      title: quest.title,
      description: quest.description,
      type: quest.type,
      goal: quest.goal,
      reward: quest.rewards?.[0] || { type: "xp", value: 0 },
      startDate: quest.startDate,
      endDate: quest.endDate,
      status: quest.status,
      targetSegment: quest.targetSegment,
      targetCriteria: quest.targetCriteria,
      completionRate,
      usersAssigned: stats.usersAssigned,
      usersCompleted: stats.usersCompleted,
      usersStarted: stats.usersStarted,
      usersAbandoned: stats.usersAbandoned,
      usersExpired: stats.usersExpired,
      averageProgress: Math.round(stats.averageProgress || 0),
      totalRewardsValue: stats.totalRewardsValue,
      difficulty: quest.difficulty,
      category: quest.category,
      priority: quest.priority,
      conditions: quest.conditions,
      rewards: quest.rewards,
      maxParticipants: quest.maxParticipants,
      isRepeatable: quest.isRepeatable,
      cooldownPeriod: quest.cooldownPeriod,
      isVisible: quest.isVisible,
      isFeatured: quest.isFeatured,
      requiresApproval: quest.requiresApproval,
      tags: quest.tags,
      notes: quest.notes,
      createdBy: quest.createdBy,
      lastModifiedBy: quest.lastModifiedBy,
      createdAt: quest.createdAt,
      updatedAt: quest.updatedAt,
      recentActivities: recentActivities.map((activity) => ({
        userId: activity.userId,
        status: activity.status,
        progress: activity.overallProgress,
        lastActivity: activity.lastActivityAt,
        completedAt: activity.completedAt,
      })),
    };

    return NextResponse.json({
      success: true,
      data: transformedQuest,
    });
  } catch (error) {
    console.error("Error fetching quest:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch quest",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { id } = await params;

    // Parse request body
    const body = await request.json();

    // Validate request body with Zod
    const validatedData = UpdateQuestSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          error: "Invalid quest data",
          details: validatedData.error.format(),
        },
        { status: 400 }
      );
    }

    // Find existing quest
    const existingQuest = await Quest.findById(id);
    if (!existingQuest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Update quest fields
    type UpdateFields = {
      lastModifiedBy: string;
      updatedAt: Date;
    } & typeof validatedData.data;

    const updateFields: UpdateFields = {
      lastModifiedBy: userId,
      updatedAt: new Date(),
      ...validatedData.data,
    };

    // Convert date strings to Date objects
    if (updateFields.startDate) {
      updateFields.startDate = new Date(updateFields.startDate);
    }
    if (updateFields.endDate) {
      updateFields.endDate = new Date(updateFields.endDate);
    }

    // Update the quest
    const updatedQuest = await Quest.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedQuest) {
      return NextResponse.json(
        { error: "Failed to update quest" },
        { status: 500 }
      );
    }

    // Get updated statistics
    const userQuestStats = await UserQuest.aggregate([
      { $match: { questId: updatedQuest._id } },
      {
        $group: {
          _id: null,
          usersAssigned: { $sum: 1 },
          usersCompleted: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          usersStarted: {
            $sum: {
              $cond: [
                { $in: ["$status", ["started", "in_progress", "completed"]] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const stats = userQuestStats[0] || {
      usersAssigned: 0,
      usersCompleted: 0,
      usersStarted: 0,
    };

    const completionRate =
      stats.usersAssigned > 0
        ? Math.round((stats.usersCompleted / stats.usersAssigned) * 100)
        : 0;

    // Transform response to match admin page format
    const transformedQuest = {
      id: updatedQuest._id.toString(),
      title: updatedQuest.title,
      description: updatedQuest.description,
      type: updatedQuest.type,
      goal: updatedQuest.goal,
      reward: updatedQuest.rewards?.[0] || { type: "xp", value: 0 },
      startDate: updatedQuest.startDate,
      endDate: updatedQuest.endDate,
      status: updatedQuest.status,
      targetSegment: updatedQuest.targetSegment,
      completionRate,
      usersAssigned: stats.usersAssigned,
      usersCompleted: stats.usersCompleted,
      usersStarted: stats.usersStarted,
      difficulty: updatedQuest.difficulty,
      category: updatedQuest.category,
      priority: updatedQuest.priority,
      isVisible: updatedQuest.isVisible,
      isFeatured: updatedQuest.isFeatured,
      createdAt: updatedQuest.createdAt,
      updatedAt: updatedQuest.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: transformedQuest,
      message: "Quest updated successfully",
    });
  } catch (error) {
    console.error("Error updating quest:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update quest",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { id } = await params;

    // Find quest
    const quest = await Quest.findById(id);
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    // Check if quest has active user assignments
    const activeUserQuests = await UserQuest.countDocuments({
      questId: id,
      status: { $in: ["assigned", "started", "in_progress"] },
    });

    if (activeUserQuests > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete quest with active user assignments",
          details: `${activeUserQuests} users are currently working on this quest`,
        },
        { status: 400 }
      );
    }

    // Delete the quest
    await Quest.findByIdAndDelete(id);

    // Optionally, clean up completed user quest records
    // await UserQuest.deleteMany({ questId: id })

    return NextResponse.json({
      success: true,
      message: "Quest deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quest:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete quest",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint for status changes (pause/resume/activate)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Validate action with Zod
    const validatedData = QuestStatusChangeSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { action } = validatedData.data;

    // Find quest
    const quest = await Quest.findById(id);
    if (!quest) {
      return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    let newStatus = quest.status;

    // Handle different actions
    switch (action) {
      case "pause":
        newStatus = "paused";
        break;
      case "resume":
        newStatus = "active";
        break;
      case "activate":
        newStatus = "active";
        break;
      case "deactivate":
        newStatus = "paused";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Update quest status
    const updatedQuest = await Quest.findByIdAndUpdate(
      id,
      {
        status: newStatus,
        lastModifiedBy: userId,
        updatedAt: new Date(),
      },
      { new: true }
    ).exec(); // better error visibility

    return NextResponse.json({
      success: true,
      data: {
        id: updatedQuest!._id.toString(),
        status: newStatus,
        action: action,
        updatedAt: updatedQuest!.updatedAt,
      },
      message: `Quest ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error updating quest status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update quest status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
