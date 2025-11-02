import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import UserQuest from "@/models/UserQuest";
import { authGuard } from "@/lib/utils";

// GET /api/admin/quests/[id]/analytics - Get analytics data for this quest
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
    const days = Number.parseInt(searchParams.get("days") || "30");

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all user quests for this quest
    const allUserQuests = await UserQuest.find({ questId }).lean();

    // Calculate basic statistics
    const totalAssigned = allUserQuests.length;
    const totalStarted = allUserQuests.filter((uq) =>
      ["started", "in_progress", "completed"].includes(uq.status)
    ).length;
    const totalCompleted = allUserQuests.filter(
      (uq) => uq.status === "completed"
    ).length;
    const totalAbandoned = allUserQuests.filter((uq) =>
      ["abandoned", "expired"].includes(uq.status)
    ).length;

    // Calculate completion rate by user level (mock data for now, would need user level info)
    const completionByLevel = {
      free: Math.floor(Math.random() * 30) + 30, // 30-60%
      premium: Math.floor(Math.random() * 30) + 50, // 50-80%
    };

    // Calculate completion by language (mock data, would need user language preference)
    const completionByLanguage = {
      spanish: Math.floor(Math.random() * 30) + 60, // 60-90%
      french: Math.floor(Math.random() * 30) + 40, // 40-70%
      english: Math.floor(Math.random() * 30) + 50, // 50-80%
    };

    // Calculate completion by platform (mock data, would need user platform info)
    const completionByPlatform = {
      mobile: Math.floor(Math.random() * 30) + 50, // 50-80%
      desktop: Math.floor(Math.random() * 30) + 40, // 40-70%
      tablet: Math.floor(Math.random() * 30) + 30, // 30-60%
    };

    // Get daily activity for the specified period
    const dailyActivity = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayStarted = allUserQuests.filter((uq) => {
        const startedAt = uq.startedAt || uq.assignedAt;
        return startedAt >= date && startedAt < nextDate;
      }).length;

      const dayCompleted = allUserQuests.filter((uq) => {
        return (
          uq.completedAt && uq.completedAt >= date && uq.completedAt < nextDate
        );
      }).length;

      dailyActivity.push({
        date: date.toISOString().split("T")[0],
        usersStarted: dayStarted,
        usersCompleted: dayCompleted,
        completionRate:
          dayStarted > 0 ? Math.round((dayCompleted / dayStarted) * 100) : 0,
      });
    }

    // Calculate average time to completion
    const completedQuests = allUserQuests.filter(
      (uq) => uq.status === "completed" && uq.startedAt && uq.completedAt
    );

    let averageTimeToComplete = 0;
    if (completedQuests.length > 0) {
      const totalTime = completedQuests.reduce((sum, uq) => {
        if (uq.completedAt instanceof Date && uq.startedAt instanceof Date) {
          const timeSpent = uq.completedAt.getTime() - uq.startedAt.getTime();
          return sum + timeSpent;
        }
        return sum; // Skip if either date is invalid
      }, 0);

      averageTimeToComplete = Math.round(
        totalTime / completedQuests.length / (1000 * 60 * 60 * 24)
      ); // Convert to days
    }

    // Calculate average progress for active quests
    const activeQuests = allUserQuests.filter((uq) =>
      ["started", "in_progress"].includes(uq.status)
    );
    const averageProgress =
      activeQuests.length > 0
        ? Math.round(
            activeQuests.reduce(
              (sum, uq) => sum + (uq.overallProgress || 0),
              0
            ) / activeQuests.length
          )
        : 0;

    const analytics = {
      overview: {
        totalAssigned,
        totalStarted,
        totalCompleted,
        totalAbandoned,
        completionRate:
          totalAssigned > 0
            ? Math.round((totalCompleted / totalAssigned) * 100)
            : 0,
        averageTimeToComplete,
        averageProgress,
        abandonmentRate:
          totalAssigned > 0
            ? Math.round((totalAbandoned / totalAssigned) * 100)
            : 0,
      },
      dailyActivity,
      segmentation: {
        byLevel: completionByLevel,
        byLanguage: completionByLanguage,
        byPlatform: completionByPlatform,
      },
      recentActivities: allUserQuests
        .filter((uq) => uq.lastActivityAt)
        .sort((a, b) => b.lastActivityAt.getTime() - a.lastActivityAt.getTime())
        .slice(0, 10)
        .map((uq) => ({
          userId: uq.userId,
          status: uq.status,
          progress: uq.overallProgress || 0,
          lastActivity: uq.lastActivityAt,
        })),
    };

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching quest analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch quest analytics",
      },
      { status: 500 }
    );
  }
}
