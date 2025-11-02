import { NextResponse } from "next/server";
import UserProgress from "@/models/UserProgress";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";

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
    await connectDB();

    // Aggregate to count all completed lessons
    const aggregateResult = await UserProgress.aggregate([
      { $unwind: "$completedLessons" },
      { $match: { "completedLessons.isCompleted": true } },
      { $count: "totalCompletedLessons" },
    ]);

    const totalCompletedLessons =
      aggregateResult[0]?.totalCompletedLessons || 0;

    // Get completed lessons from last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastMonthResult = await UserProgress.aggregate([
      { $unwind: "$completedLessons" },
      {
        $match: {
          "completedLessons.isCompleted": true,
          "completedLessons.completedAt": { $lt: lastMonth },
        },
      },
      { $count: "totalCompletedLessons" },
    ]);

    const lastMonthCompletedLessons =
      lastMonthResult[0]?.totalCompletedLessons || 0;

    const percentageChange = calculatePercentageChange(
      totalCompletedLessons,
      lastMonthCompletedLessons
    );

    return NextResponse.json({
      count: totalCompletedLessons,
      percentageChange,
      trend: percentageChange >= 0 ? "up" : "down",
    });
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
