import {  NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import Activity from "@/models/Activity";
import { hasAdminRole } from "@/lib/admin-access";



/**
 * @swagger
 * /api/admin/users/{id}/subscription:
 *   post:
 *     tags:
 *       - Users
 *     summary: Update user subscription (admin only)
 *     description: Changes a user's subscription plan and settings
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
 *               - plan
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [free, premium]
 *                 description: The subscription plan to assign to the user
 *               duration:
 *                 type: string
 *                 description: Number of days for the subscription period
 *               autoRenew:
 *                 type: boolean
 *                 description: Whether the subscription should auto-renew
 *     responses:
 *       200:
 *         description: User subscription updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 subscription:
 *                   type: string
 *                   enum: [free, premium]
 *       400:
 *         description: Bad request - Missing required fields or invalid plan
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

// POST /api/admin/users/[id]/subscription - Update user subscription
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if the user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const check = await (await clerkClient()).users.getUser(userId);
    if (!hasAdminRole(check)) {
      return NextResponse.json({ error: "Yasaklandı" }, { status: 403 });
    }

    // Connect to the database
    await connectDB();

    // Get the user from Clerk
    const user = await (await clerkClient()).users.getUser(id);
    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
    }

    // Get the user from our database
    const dbUser = await User.findOne({ clerkId: id });
    if (!dbUser) {
      return NextResponse.json(
        { error: "Kullanıcı veritabanında bulunamadı" },
        { status: 404 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { plan, duration, autoRenew } = body;

    // Validate required fields
    if (!plan) {
      return NextResponse.json({ error: "Plan gereklidir" }, { status: 400 });
    }

    // Validate plan
    if (!["free", "premium"].includes(plan)) {
      return NextResponse.json(
        { error: "Geçersiz plan. Şunlardan biri olmalı: free, premium" },
        { status: 400 }
      );
    }

    // Get the current subscription from privateMetadata
    const oldSubscription = (user.privateMetadata.subscription as string) || "free";

    // Calculate subscription end date if duration is provided
    let subscriptionEndDate;
    if (duration) {
      subscriptionEndDate = new Date();
      subscriptionEndDate.setDate(
        subscriptionEndDate.getDate() + Number.parseInt(duration)
      );
    }

    // Update the user in Clerk
    (await clerkClient()).users.updateUser(id, {
      privateMetadata: {
        ...user.privateMetadata,
        subscription: plan,
        subscriptionStatus: plan === "free" ? "inactive" : "active",
        subscriptionEndDate: subscriptionEndDate?.toISOString(),
        autoRenew: autoRenew !== undefined ? autoRenew : false,
      },
    });

    // Record the activity
    await Activity.create({
      userId: dbUser._id,
      type: "admin_action",
      description: `Admin updated subscription: ${oldSubscription} → ${plan}`,
      date: new Date(),
      metadata: {
        oldSubscription,
        newSubscription: plan,
        duration,
        subscriptionEndDate: subscriptionEndDate?.toISOString(),
        autoRenew,
        adminId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      subscription: plan,
    });
  } catch (error) {
    console.error("Error updating user subscription:", error);
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
