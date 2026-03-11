import { NextResponse } from "next/server";
import UserProgress from "@/models/UserProgress";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";

const DASHBOARD_LESSONS_CACHE_TTL_MS = 30 * 1000;

type DashboardLessonsPayload = {
  count: number;
  percentageChange: number;
  trend: "up" | "down" | "neutral";
};

type DashboardLessonsCacheValue = {
  expiresAt: number;
  payload: DashboardLessonsPayload;
};

const globalForDashboardLessonsCache = globalThis as typeof globalThis & {
  _dashboardLessonsCache?: Map<string, DashboardLessonsCacheValue>;
};

const dashboardLessonsCache =
  globalForDashboardLessonsCache._dashboardLessonsCache ?? new Map();
globalForDashboardLessonsCache._dashboardLessonsCache = dashboardLessonsCache;

/**
 * @swagger
 * /api/admin/completed-lessons:
 *   get:
 *     summary: Get total completed lessons and compare with previous month
 *     tags: [Completed Lessons]
 *     security:
 *       - clerkAuth: []
 *     responses:
 *       200:
 *         description: Completed lessons statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Total number of completed lessons
 *                 percentageChange:
 *                   type: number
 *                   description: Percentage change compared to previous month
 *                 trend:
 *                   type: string
 *                   enum: [up, down]
 *                   description: Whether the trend is increasing or decreasing
 *       500:
 *         description: Server error
 */

export async function GET() {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    const now = Date.now();
    const cached = dashboardLessonsCache.get("summary");
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.payload);
    }

    await connectDB();

    const startOfCurrentMonth = new Date();
    startOfCurrentMonth.setDate(1);
    startOfCurrentMonth.setHours(0, 0, 0, 0);

    // Use a single aggregate pass to compute total and previous baseline.
    const aggregateResult = await UserProgress.aggregate([
      {
        $project: {
          completedCount: {
            $size: {
              $filter: {
                input: { $ifNull: ["$completedLessons", []] },
                as: "lesson",
                cond: { $eq: ["$$lesson.isCompleted", true] },
              },
            },
          },
          completedBeforeCurrentMonth: {
            $size: {
              $filter: {
                input: { $ifNull: ["$completedLessons", []] },
                as: "lesson",
                cond: {
                  $and: [
                    { $eq: ["$$lesson.isCompleted", true] },
                    { $lt: ["$$lesson.completedAt", startOfCurrentMonth] },
                  ],
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalCompletedLessons: { $sum: "$completedCount" },
          completedBeforeCurrentMonth: {
            $sum: "$completedBeforeCurrentMonth",
          },
        },
      },
    ]);

    const totalCompletedLessons = aggregateResult[0]?.totalCompletedLessons ?? 0;
    const previousBaseline = aggregateResult[0]?.completedBeforeCurrentMonth ?? 0;

    const percentageChange = calculatePercentageChange(
      totalCompletedLessons,
      previousBaseline
    );

    const payload: DashboardLessonsPayload = {
      count: totalCompletedLessons,
      percentageChange,
      trend:
        percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "neutral",
    };

    dashboardLessonsCache.set("summary", {
      expiresAt: now + DASHBOARD_LESSONS_CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching completed lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson data" },
      { status: 500 }
    );
  }
}

// Helper function to calculate percentage change
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
