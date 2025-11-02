import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import Activity from "@/models/Activity";
import User from "@/models/User";



/**
 * @swagger
 * /api/admin/users/{id}/ban:
 *   post:
 *     tags:
 *       - Users
 *     summary: Ban, suspend, or activate a user (admin only)
 *     description: Changes a user's status to banned, suspended, or active
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
 *               - action
 *               - reason
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [ban, suspend, activate]
 *                 description: The action to perform on the user account
 *               duration:
 *                 type: string
 *                 description: Number of days for suspension (required if action is 'suspend')
 *               reason:
 *                 type: string
 *                 description: Reason for the action
 *     responses:
 *       200:
 *         description: User status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                   enum: [active, banned, suspended]
 *       400:
 *         description: Bad request - Missing required fields or invalid action
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

// POST /api/admin/users/[id]/ban - Ban or suspend a user
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

    const role = (await clerkClient()).users.getUser(userId);
    // Check if user has admin role in privateMetadata
    if ((await role).privateMetadata.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Connect to the database
    await connectDB();

    // Get the user from Clerk
    const user = (await clerkClient()).users.getUser(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the user from our database
    const dbUser = await User.findOne({ clerkId: id });
    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { action, duration, reason } = body;

    // Validate required fields
    if (!action || !reason) {
      return NextResponse.json(
        { error: "Action and reason are required" },
        { status: 400 }
      );
    }

    // Validate action
    if (!["ban", "suspend", "activate"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be one of: ban, suspend, activate" },
        { status: 400 }
      );
    }

    // If suspending, validate duration
    if (action === "suspend" && !duration) {
      return NextResponse.json(
        { error: "Duration is required for suspension" },
        { status: 400 }
      );
    }

    // Get the current status from privateMetadata
    const oldStatus =
      ((await user).privateMetadata.status as string) || "active";

    // Calculate the new status
    const newStatus =
      action === "activate"
        ? "active"
        : action === "ban"
        ? "banned"
        : "suspended";

    // If suspending, calculate the end date
    let suspensionEndDate;
    if (action === "suspend") {
      suspensionEndDate = new Date();
      suspensionEndDate.setDate(
        suspensionEndDate.getDate() + Number.parseInt(duration)
      );
    }

    // Update the user in Clerk
    (await clerkClient()).users.updateUser(id, {
      privateMetadata: {
        ...(await user).privateMetadata,
        status: newStatus,
        suspensionEndDate: suspensionEndDate?.toISOString(),
      },
    });

    // Record the activity
    await Activity.create({
      userId: dbUser._id,
      type: "admin_action",
      description: `Admin ${action}ed user account: ${reason}`,
      date: new Date(),
      metadata: {
        action,
        oldStatus,
        newStatus,
        reason,
        adminId: userId,
        duration: action === "suspend" ? duration : undefined,
        suspensionEndDate: suspensionEndDate?.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      status: newStatus,
    });
  } catch (error) {
    console.error("Error banning/suspending user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
