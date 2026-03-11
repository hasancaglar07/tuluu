import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";

const DASHBOARD_USERS_CACHE_TTL_MS = 30 * 1000;

type DashboardUsersPayload = {
  count: number;
  percentageChange: number;
  trend: "up" | "down" | "neutral";
};

type DashboardUsersCacheValue = {
  expiresAt: number;
  payload: DashboardUsersPayload;
};

const globalForDashboardUsersCache = globalThis as typeof globalThis & {
  _dashboardUsersCache?: Map<string, DashboardUsersCacheValue>;
};

const dashboardUsersCache =
  globalForDashboardUsersCache._dashboardUsersCache ?? new Map();
globalForDashboardUsersCache._dashboardUsersCache = dashboardUsersCache;

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

    const now = Date.now();
    const cached = dashboardUsersCache.get("summary");
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.payload);
    }

    await connectDB();

    // Get current user count
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const [totalUsers, lastMonthUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({
        createdAt: { $lt: lastMonth },
      }),
    ]);

    const percentageChange = calculatePercentageChange(
      totalUsers,
      lastMonthUsers
    );

    const payload: DashboardUsersPayload = {
      count: totalUsers,
      percentageChange,
      trend:
        percentageChange > 0 ? "up" : percentageChange < 0 ? "down" : "neutral",
    };

    dashboardUsersCache.set("summary", {
      expiresAt: now + DASHBOARD_USERS_CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload);
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
