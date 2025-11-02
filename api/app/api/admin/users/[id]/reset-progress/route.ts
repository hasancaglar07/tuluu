import {  NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import UserProgress from "@/models/UserProgress";
import UserAchievement from "@/models/UserAchievement";
import Activity from "@/models/Activity";



/**
 * @swagger
 * /api/admin/users/{id}/reset-progress:
 *   post:
 *     tags:
 *       - Users
 *     summary: Reset user progress (admin only)
 *     description: Reset various aspects of a user's progress (lessons, XP, gems, achievements, streak)
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID (Clerk ID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               resetLessons:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to reset lesson progress
 *               resetXP:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to reset XP
 *               resetGems:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to reset gems
 *               resetAchievements:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to reset achievements
 *               resetStreak:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to reset streak
 *               reason:
 *                 type: string
 *                 description: Reason for resetting progress
 *     responses:
 *       200:
 *         description: User progress reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 resetItems:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request - Missing required fields
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
// POST /api/admin/users/[id]/reset-progress - Reset user progress
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if the user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const check = (await clerkClient()).users.getUser(userId);
    // Check if user has admin role in privateMetadata
    if ((await check).privateMetadata.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Connect to the database
    await connectDB();

    // Get the user from our database
    const dbUser = await User.findOne({ clerkId: id });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the request body
    const body = await request.json();
    const {
      resetLessons = false,
      resetXP = false,
      resetGems = false,
      resetAchievements = false,
      resetStreak = false,
      reason,
    } = body;

    // Validate required fields
    if (!reason) {
      return NextResponse.json(
        { error: "Reason is required" },
        { status: 400 }
      );
    }

    // Track what was reset
    const resetItems = [];

    // Reset lessons progress
    if (resetLessons) {
      await UserProgress.deleteMany({ userId: dbUser._id });
      resetItems.push("lessons");
    }

    // Reset XP
    if (resetXP) {
      const oldXP = dbUser.xp;
      dbUser.xp = 0;
      resetItems.push(`XP (${oldXP} → 0)`);
    }

    // Reset gems
    if (resetGems) {
      const oldGems = dbUser.gems;
      dbUser.gems = 0;
      resetItems.push(`gems (${oldGems} → 0)`);
    }

    // Reset achievements
    if (resetAchievements) {
      await UserAchievement.deleteMany({ userId: dbUser._id });
      resetItems.push("achievements");
    }

    // Reset streak
    if (resetStreak) {
      const oldStreak = dbUser.streak;
      dbUser.streak = 0;
      resetItems.push(`streak (${oldStreak} → 0)`);
    }

    // Save the user if any changes were made
    if (resetXP || resetGems || resetStreak) {
      await dbUser.save();
    }

    // Record the activity
    await Activity.create({
      userId: dbUser._id,
      type: "admin_action",
      description: `Admin reset user progress: ${resetItems.join(
        ", "
      )} (${reason})`,
      date: new Date(),
      metadata: {
        resetLessons,
        resetXP,
        resetGems,
        resetAchievements,
        resetStreak,
        reason,
        adminId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      resetItems,
    });
  } catch (error) {
    console.error("Error resetting user progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
