import { type NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import UserQuest from "@/models/UserQuest";
import User from "@/models/User";
import { authGuard } from "@/lib/utils";

// GET /api/admin/quests/[id]/completions - Get users who completed this quest
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const authe = await authGuard();
    if (authe instanceof NextResponse) {
      return authe; // early return on unauthorized or forbidden
    }
    const { id } = await params;

    // Connect to database
    await connectDB();

    const questId = id;
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get completed user quests for this quest
    const completedUserQuests = await UserQuest.find({
      questId,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get user details for each completion
    const userCompletions = await Promise.all(
      completedUserQuests.map(async (userQuest) => {
        try {
          // Try to get user details from User model
          const user = await User.findOne({
            userId: userQuest.userId,
          }).lean();

          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(userQuest.userId);

          return {
            id: userQuest._id,
            userId: userQuest.userId,
            name:
              `${clerkUser.firstName ?? ""} ${
                clerkUser.lastName ?? ""
              }`.trim() || `User ${clerkUser.id.slice(0, 8)}`,
            email: clerkUser.emailAddresses?.[0]?.emailAddress || "N/A",
            avatar: clerkUser.imageUrl || null,
            completedAt: userQuest.completedAt,
            timeSpent: userQuest.timeSpent || 0,
            attempts: userQuest.attempts || 1,
            totalRewardsValue: userQuest.totalRewardsValue || 0,
            rewardsClaimed: userQuest.rewardsClaimed || [],
          };
        } catch (error) {
          console.error("Error fetching user details:", error);
          return {
            id: userQuest._id,
            userId: userQuest.userId,
            name: `User ${userQuest.userId.slice(0, 8)}`,
            email: "N/A",
            avatar: null,
            completedAt: userQuest.completedAt,
            timeSpent: userQuest.timeSpent || 0,
            attempts: userQuest.attempts || 1,
            totalRewardsValue: userQuest.totalRewardsValue || 0,
            rewardsClaimed: userQuest.rewardsClaimed || [],
          };
        }
      })
    );

    // Get total count for pagination
    const totalCount = await UserQuest.countDocuments({
      questId,
      status: "completed",
    });

    return NextResponse.json({
      success: true,
      data: {
        completions: userCompletions,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching quest completions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch quest completions",
      },
      { status: 500 }
    );
  }
}
