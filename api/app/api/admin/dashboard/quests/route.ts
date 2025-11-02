import { NextResponse } from "next/server";
import UserQuest from "@/models/UserQuest";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";

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
    await connectDB();

    // Get current active quests
    const activeQuests = await UserQuest.countDocuments({
      status: { $in: ["assigned", "started", "in_progress"] },
    });

    // Get new quests created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newQuestsThisMonth = await UserQuest.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    return NextResponse.json({
      count: activeQuests,
      newThisMonth: newQuestsThisMonth,
    });
  } catch (error) {
    console.error("Error fetching active quests:", error);
    return NextResponse.json(
      { error: "Failed to fetch quest data" },
      { status: 500 }
    );
  }
}
