import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Quest from "@/models/Quest";
import { authGuard } from "@/lib/utils";

// GET /api/admin/quests/[id]/history - Get audit history for this quest
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
    const limit = Number.parseInt(searchParams.get("limit") || "20");

    // Get the quest to access its audit log
    const quest = await Quest.findById(questId).lean();

    if (!quest) {
      return NextResponse.json(
        { success: false, error: "Quest not found" },
        { status: 404 }
      );
    }

    // For now, create a basic audit log based on quest timestamps
    // In a real application, you'd have a separate audit log collection
    const auditLog = [];

    // Quest creation
    auditLog.push({
      id: 1,
      action: "Quest Created",
      user: "Admin User", // In real app, get from quest.createdBy
      timestamp: quest.createdAt,
      details: {
        title: quest.title,
        type: quest.type,
        status: "draft",
      },
    });

    // Quest updates (based on updatedAt vs createdAt)
    if (
      quest.updatedAt &&
      quest.updatedAt.getTime() !== quest.createdAt.getTime()
    ) {
      auditLog.push({
        id: 2,
        action: "Quest Updated",
        user: "Admin User", // In real app, get from quest.lastModifiedBy
        timestamp: quest.updatedAt,
        details: {
          status: quest.status,
          isVisible: quest.isVisible,
        },
      });
    }

    // Quest activation (if status is active and start date is set)
    if (quest.status === "active" && quest.startDate) {
      auditLog.push({
        id: 3,
        action: "Quest Activated",
        user: "Admin User",
        timestamp: quest.startDate,
        details: {
          status: "active",
          startDate: quest.startDate,
          endDate: quest.endDate,
        },
      });
    }

    // System notifications (mock - would be based on actual notification logs)
    if (quest.status === "active") {
      const notificationTime = new Date(quest.startDate);
      notificationTime.setMinutes(notificationTime.getMinutes() + 5);

      auditLog.push({
        id: 4,
        action: "Notifications Sent",
        user: "System",
        timestamp: notificationTime,
        details: {
          type: "quest_activation",
          recipients: quest.targetSegment,
        },
      });
    }

    // Reward updates (if rewards were modified)
    if (quest.rewards && quest.rewards.length > 0) {
      auditLog.push({
        id: 5,
        action: "Rewards Updated",
        user: "Admin User",
        timestamp: quest.updatedAt || quest.createdAt,
        details: {
          rewards: quest.rewards,
        },
      });
    }

    // Status changes based on current status
    if (quest.status === "paused") {
      auditLog.push({
        id: 6,
        action: "Quest Paused",
        user: "Admin User",
        timestamp: quest.updatedAt,
        details: {
          previousStatus: "active",
          newStatus: "paused",
        },
      });
    }

    if (
      quest.status === "expired" &&
      quest.endDate &&
      new Date() > quest.endDate
    ) {
      auditLog.push({
        id: 7,
        action: "Quest Expired",
        user: "System",
        timestamp: quest.endDate,
        details: {
          previousStatus: "active",
          newStatus: "expired",
        },
      });
    }

    // Sort by timestamp (newest first)
    auditLog.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLog = auditLog.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: {
        history: paginatedLog,
        pagination: {
          page,
          limit,
          total: auditLog.length,
          pages: Math.ceil(auditLog.length / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching quest history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch quest history",
      },
      { status: 500 }
    );
  }
}
