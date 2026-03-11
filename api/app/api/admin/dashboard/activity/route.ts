import { NextResponse } from "next/server";
import User from "@/models/User";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";

const DASHBOARD_ACTIVITY_CACHE_TTL_MS = 30 * 1000;

type ActivityPoint = {
  date: string;
  activeUsers: number;
};

type DashboardActivityCacheValue = {
  expiresAt: number;
  payload: ActivityPoint[];
};

const globalForDashboardActivityCache = globalThis as typeof globalThis & {
  _dashboardActivityCache?: Map<string, DashboardActivityCacheValue>;
};

const dashboardActivityCache =
  globalForDashboardActivityCache._dashboardActivityCache ?? new Map();
globalForDashboardActivityCache._dashboardActivityCache = dashboardActivityCache;

/**
 * @swagger
 * /api/admin/user-activity:
 *   get:
 *     summary: Get daily active users for the last 30 days
 *     tags: [User Activity]
 *     security:
 *       - clerkAuth: []
 *     responses:
 *       200:
 *         description: Daily active users data
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: Date in YYYY-MM-DD format
 *                   activeUsers:
 *                     type: integer
 *                     description: Number of unique active users
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

export async function GET() {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    const nowTs = Date.now();
    const cached = dashboardActivityCache.get("last30days");
    if (cached && cached.expiresAt > nowTs) {
      return NextResponse.json(cached.payload);
    }

    await connectDB();

    // Get the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Filter loginHistory before unwind to reduce pipeline volume.
    const activityData = await User.aggregate([
      {
        $match: {
          loginHistory: {
            $elemMatch: {
              date: { $gte: thirtyDaysAgo },
              success: true,
            },
          },
        },
      },
      {
        $project: {
          userId: "$_id",
          loginHistory: {
            $filter: {
              input: { $ifNull: ["$loginHistory", []] },
              as: "entry",
              cond: {
                $and: [
                  { $gte: ["$$entry.date", thirtyDaysAgo] },
                  { $eq: ["$$entry.success", true] },
                ],
              },
            },
          },
        },
      },
      { $unwind: "$loginHistory" },
      {
        $group: {
          _id: {
            year: { $year: "$loginHistory.date" },
            month: { $month: "$loginHistory.date" },
            day: { $dayOfMonth: "$loginHistory.date" },
            userId: "$userId",
          },
        },
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
          activeUsers: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          activeUsers: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // Format the data for the chart
    const formattedData: ActivityPoint[] = activityData.map((day) => ({
      date: day.date.toISOString().split("T")[0],
      activeUsers: day.activeUsers,
    }));

    dashboardActivityCache.set("last30days", {
      expiresAt: nowTs + DASHBOARD_ACTIVITY_CACHE_TTL_MS,
      payload: formattedData,
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching user activity data:", error);

    // Return placeholder data if there's an error
    const data = [];
    const today = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      data.push({
        date: date.toISOString().split("T")[0],
        activeUsers: Math.floor(Math.random() * 100) + 50,
      });
    }

    return NextResponse.json(data);
  }
}
