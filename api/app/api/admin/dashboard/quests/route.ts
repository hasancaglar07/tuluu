import { NextResponse } from "next/server";
import UserQuest from "@/models/UserQuest";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";

const DASHBOARD_QUESTS_CACHE_TTL_MS = 30 * 1000;

type DashboardQuestsPayload = {
  count: number;
  newThisMonth: number;
};

type DashboardQuestsCacheValue = {
  expiresAt: number;
  payload: DashboardQuestsPayload;
};

const globalForDashboardQuestsCache = globalThis as typeof globalThis & {
  _dashboardQuestsCache?: Map<string, DashboardQuestsCacheValue>;
};

const dashboardQuestsCache =
  globalForDashboardQuestsCache._dashboardQuestsCache ?? new Map();
globalForDashboardQuestsCache._dashboardQuestsCache = dashboardQuestsCache;

/**
 * @swagger
 * /api/admin/quests/analytics:
 *   get:
 *     summary: Get quest analytics data
 *     tags: [Quests]
 *     security:
 *       - clerkAuth: []
 *     responses:
 *       200:
 *         description: Quest analytics data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Total number of active quests
 *                 newThisMonth:
 *                   type: integer
 *                   description: Number of new quests created this month
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
    const cached = dashboardQuestsCache.get("summary");
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.payload);
    }

    await connectDB();

    // Get current active quests
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const [activeQuests, newQuestsThisMonth] = await Promise.all([
      UserQuest.countDocuments({
        status: { $in: ["assigned", "started", "in_progress"] },
      }),
      UserQuest.countDocuments({
        createdAt: { $gte: startOfMonth },
      }),
    ]);

    const payload: DashboardQuestsPayload = {
      count: activeQuests,
      newThisMonth: newQuestsThisMonth,
    };

    dashboardQuestsCache.set("summary", {
      expiresAt: now + DASHBOARD_QUESTS_CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching active quests:", error);
    return NextResponse.json(
      { error: "Failed to fetch quest data" },
      { status: 500 }
    );
  }
}
