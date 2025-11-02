import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import Activity from "@/models/Activity";


/**
 * @swagger
 * /api/admin/users/{id}/credit:
 *   post:
 *     tags:
 *       - Users
 *     summary: Adjust user credits (admin only)
 *     description: Add or remove user credits (XP, gems, hearts, gel)
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
 *               - type
 *               - amount
 *               - reason
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [xp, gems, hearts, gel]
 *                 description: The type of credit to adjust
 *               amount:
 *                 type: integer
 *                 description: The amount to add (positive) or remove (negative)
 *               reason:
 *                 type: string
 *                 description: Reason for adjusting the credits
 *     responses:
 *       200:
 *         description: User credits adjusted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 type:
 *                   type: string
 *                   enum: [xp, gems, hearts, gel]
 *                 oldValue:
 *                   type: integer
 *                 newValue:
 *                   type: integer
 *                 difference:
 *                   type: integer
 *       400:
 *         description: Bad request - Missing required fields or invalid type
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
// POST /api/admin/users/[id]/credit - Adjust user credits (XP, gems, hearts, gel)
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

    // Get the user from our database
    const dbUser = await User.findByClerkId(id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get the request body
    const body = await request.json();
    const { type, amount, reason } = body;

    // Validate required fields
    if (!type || amount === undefined || !reason) {
      return NextResponse.json(
        { error: "Type, amount, and reason are required" },
        { status: 400 }
      );
    }

    // Validate type
    if (!["xp", "gems", "hearts", "gel"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be one of: xp, gems, hearts, gel" },
        { status: 400 }
      );
    }
    type StatKey = "xp" | "gems" | "gel";
    function isStatKey(key: string): key is StatKey {
      return ["xp", "gems", "gel"].includes(key);
    }
    // Get the current value
    let oldValue, newValue;
    if (isStatKey(type)) {
      oldValue = dbUser[type] || 0;
      // Calculate the new value (ensure it doesn't go below 0)
      newValue = Math.max(0, oldValue + amount);

      // Update the user in the database
      dbUser[type] = newValue;
      await dbUser.save();
    }

    // Record the activity
    await Activity.create({
      userId: dbUser._id,
      type: "admin_action",
      description: `Admin adjusted ${type}: ${oldValue} → ${newValue} (${reason})`,
      date: new Date(),
      metadata: {
        creditType: type,
        oldValue,
        newValue,
        amount,
        reason,
        adminId: userId,
      },
    });

    return NextResponse.json({
      success: true,
      type,
      oldValue,
      newValue,
      difference: amount,
    });
  } catch (error) {
    console.error("Error adjusting user credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
