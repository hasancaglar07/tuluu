import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import UserProgress from "@/models/UserProgress";
import UserAchievement from "@/models/UserAchievement";
import Activity from "@/models/Activity";
import Report from "@/models/Report";

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user details by ID (admin only)
 *     description: Retrieves detailed information about a specific user
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID (Clerk ID)
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 clerkId:
 *                   type: string
 *                 email:
 *                   type: string
 *                 joinDate:
 *                   type: string
 *                   format: date-time
 *                 lastActive:
 *                   type: string
 *                   format: date-time
 *                 xp:
 *                   type: number
 *                 gems:
 *                   type: number
 *                 gel:
 *                   type: number
 *                 hearts:
 *                   type: number
 *                 streak:
 *                   type: number
 *                 publicMetadata:
 *                   type: object
 *                 privateMetadata:
 *                   type: object
 *                 userCompletedLessons:
 *                   type: number
 *                 userTotalLessons:
 *                   type: number
 *                 userAchievements:
 *                   type: array
 *                   items:
 *                     type: object
 *                 userRecentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *                 userReports:
 *                   type: array
 *                   items:
 *                     type: object
 *                 userLoginHistory:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user details (admin only)
 *     description: Updates information for a specific user
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
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               bio:
 *                 type: string
 *               language:
 *                 type: string
 *               country:
 *                 type: string
 *               timezone:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: uri
 *               role:
 *                 type: string
 *                 enum: [free, paid, admin]
 *               status:
 *                 type: string
 *                 enum: [active, banned, suspended]
 *               subscription:
 *                 type: string
 *                 enum: [free, premium]
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete a user (admin only)
 *     description: Permanently deletes a user from both Clerk and the database
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID (Clerk ID)
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       401:
 *         description: Unauthorized - User is not authenticated
 *       403:
 *         description: Forbidden - User does not have admin privileges
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
// GET /api/admin/users/[id] - Get a user by ID
export async function GET(
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

    // Get the admin user from Clerk
    const clerk = await clerkClient();
    const adminUser = await clerk.users.getUser(userId);

    // Check if user has admin role in privateMetadata
    if (adminUser.privateMetadata.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Connect to the database
    await connectDB();

    // Get the user from Clerk
    const user = await clerk.users.getUser(id);
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
    // Get user progress data
    const userProgress = await UserProgress.findOne({ userId: dbUser._id });
    const userCompletedLessons = userProgress?.completedLessons?.length || 0;

    // For demo purposes, we'll set a fixed number for total lessons
    // In a real app, you would fetch this from a lessons collection
    const userTotalLessons = 100; // This should be fetched from your lessons collection

    // Get user achievements
    const userAchievements = await UserAchievement.find({
      userId: dbUser._id,
    })
      .populate("achievementId")
      .sort({ earnedDate: -1 })
      .limit(10);

    // Get user recent activity using the static method
    const userRecentActivity = await Activity.getRecentActivity(dbUser._id, 10);

    // Get user reports
    const userReports = await Report.find({ userId: id })
      .sort({ date: -1 })
      .limit(10);

    // Get user login history from the database
    const userLoginHistory = dbUser.loginHistory || [];

    // Combine the data
    const userData = {
      id: dbUser._id,
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      joinDate: user.createdAt,
      lastActive: user.lastActiveAt || user.createdAt,
      // Game data from MongoDB
      xp: dbUser.xp || 0,
      gems: dbUser.gems || 0,
      gel: dbUser.gel || 0,
      hearts: dbUser.hearts || 0,
      streak: dbUser.streak || 0,
      // Metadata from Clerk
      publicMetadata: user.publicMetadata,
      privateMetadata: user.privateMetadata,
      // Additional data
      userCompletedLessons,
      userTotalLessons,
      userAchievements,
      userRecentActivity,
      userReports,
      userLoginHistory: userLoginHistory.slice(0, 10), // Get the 10 most recent login records
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update a user
export async function PUT(
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

    // Get the admin user from Clerk
    const clerk = await clerkClient();
    const adminUser = await clerk.users.getUser(userId);

    // Check if user has admin role in privateMetadata
    if (adminUser.privateMetadata.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Connect to the database
    await connectDB();

    // Get the user from Clerk
    const user = await clerk.users.getUser(id);
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
    const {
      name,
      email,
      bio,
      language,
      country,
      timezone,
      avatar,
      role,
      status,
      subscription,
    } = body;

    // Update public metadata in Clerk
    const publicMetadataUpdates: Record<string, unknown> = {};
    if (name !== undefined) publicMetadataUpdates.name = name;
    if (bio !== undefined) publicMetadataUpdates.bio = bio;
    if (language !== undefined) publicMetadataUpdates.language = language;
    if (country !== undefined) publicMetadataUpdates.country = country;
    if (timezone !== undefined) publicMetadataUpdates.timezone = timezone;
    if (avatar !== undefined) publicMetadataUpdates.avatar = avatar;

    // Update private metadata in Clerk
    const privateMetadataUpdates: Record<string, unknown> = {};
    if (role !== undefined) privateMetadataUpdates.role = role;
    if (status !== undefined) privateMetadataUpdates.status = status;
    if (subscription !== undefined)
      privateMetadataUpdates.subscription = subscription;

    // Update the user in Clerk
    await clerk.users.updateUser(id, {
      ...(email && { emailAddress: [email] }),
      ...(name && {
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" "),
      }),
      ...(Object.keys(publicMetadataUpdates).length > 0 && {
        publicMetadata: {
          ...user.publicMetadata,
          ...publicMetadataUpdates,
        },
      }),
      ...(Object.keys(privateMetadataUpdates).length > 0 && {
        privateMetadata: {
          ...user.privateMetadata,
          ...privateMetadataUpdates,
        },
      }),
    });

    // Get the updated user
    const updatedUser = await clerk.users.getUser(id);

    // Combine the data
    const userData = {
      id: updatedUser.id,
      clerkId: updatedUser.id,
      email: updatedUser.emailAddresses[0]?.emailAddress || "",
      joinDate: updatedUser.createdAt,
      lastActive: updatedUser.lastActiveAt || updatedUser.createdAt,
      // Game data from MongoDB
      xp: dbUser.xp || 0,
      gems: dbUser.gems || 0,
      gel: dbUser.gel || 0,
      hearts: dbUser.hearts || 0,
      streak: dbUser.streak || 0,
      // Metadata from Clerk
      publicMetadata: updatedUser.publicMetadata,
      privateMetadata: updatedUser.privateMetadata,
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete a user
export async function DELETE(
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

    // Get the admin user from Clerk
    const clerk = await clerkClient();
    const adminUser = await clerk.users.getUser(userId);

    // Check if user has admin role in privateMetadata
    if (adminUser.privateMetadata.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Connect to the database
    await connectDB();

    // Get the user from Clerk
    const user = await clerk.users.getUser(id);
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

    // Delete the user from Clerk
    await clerk.users.deleteUser(id);

    // Delete the user from our database
    await User.findByIdAndDelete(dbUser._id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
