import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import Activity from "@/models/Activity";

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   post:
 *     tags:
 *       - Users
 *     summary: Update user role (admin only)
 *     description: Changes a user's role (free, paid, admin)
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
 *               - role
 *               - reason
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [free, paid, admin]
 *                 description: The new role to assign to the user
 *               reason:
 *                 type: string
 *                 description: Reason for changing the user's role
 *     responses:
 *       200:
 *         description: User role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 role:
 *                   type: string
 *                   enum: [free, paid, admin]
 *       400:
 *         description: Bad request - Missing required fields or invalid role
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
// POST /api/admin/users/[id]/role - Update user role
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

    // Get the user from Clerk
    const user = (await clerkClient()).users.getUser(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the user from our database
    const dbUser = await User.findByClerkId(id);
    if (!dbUser) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { role, reason } = body;

    // Validate required fields
    if (!role || !reason) {
      return NextResponse.json(
        { error: "Role and reason are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["admin", "free"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be one of: admin, free" },
        { status: 400 }
      );
    }

    // Get the current role from privateMetadata
    const oldRole = ((await user).privateMetadata.role as string) || "free";

    // Update the user in Clerk
    (await clerkClient()).users.updateUser(id, {
      privateMetadata: {
        ...(await user).privateMetadata,
        role,
      },
    });

    // Record the activity
    await Activity.create({
      userId: dbUser._id,
      type: "admin_action",
      description: `Admin updated role: ${oldRole} → ${role} (${reason})`,
      date: new Date(),
      metadata: {
        oldRole,
        newRole: role,
        reason,
        adminId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      role,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
