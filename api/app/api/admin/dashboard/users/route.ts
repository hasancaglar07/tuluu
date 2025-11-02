import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";

/**
 * @openapi
 * /api/users/statistics:
 *   get:
 *     summary: Get total user count with monthly percentage change
 *     description: Returns the total count of users and the percentage change compared to the previous month, plus a trend indicator.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Successful response with user statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Total number of users
 *                   example: 1500
 *                 percentageChange:
 *                   type: number
 *                   format: float
 *                   description: Percentage change compared to last month
 *                   example: 12.5
 *                 trend:
 *                   type: string
 *                   enum: [up, down]
 *                   description: Trend direction
 *                   example: up
 *       500:
 *         description: Server error fetching user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch user data
 */
export async function GET() {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }
    await connectDB();

    // Get current user count
    const totalUsers = await User.countDocuments();

    // Get user count from last month
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $lt: lastMonth },
    });

    const percentageChange = calculatePercentageChange(
      totalUsers,
      lastMonthUsers
    );

    return NextResponse.json({
      count: totalUsers,
      percentageChange,
      trend: percentageChange >= 0 ? "up" : "down",
    });
  } catch (error) {
    console.error("Error fetching total users:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

// Helper function to calculate percentage change
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
