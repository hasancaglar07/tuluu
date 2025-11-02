import { type NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import { authGuard } from "@/lib/utils";

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

// GET /api/admin/users - Get all users
export async function GET(req: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    // Connect to the database
    await connectDB();

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const subscription = searchParams.get("subscription") || "";
    const sortBy = searchParams.get("sortBy") || "joinDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Get all users from Clerk
    const clerkUsers = (await clerkClient()).users.getUserList({
      limit: 500, // Get a large number of users, we'll handle pagination ourselves
    });

    // Filter users based on search, role, status, subscription
    let filteredUsers = (await clerkUsers).data;

    // Filter by search (name or email)
    if (search) {
      filteredUsers = filteredUsers.filter((user) => {
        const name =
          (user.publicMetadata.name as string) || user.firstName || "";
        const email = user.emailAddresses[0]?.emailAddress || "";
        return (
          name.toLowerCase().includes(search.toLowerCase()) ||
          email.toLowerCase().includes(search.toLowerCase())
        );
      });
    }

    // Filter by role
    if (role && role !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.privateMetadata.role === role
      );
    }

    // Filter by status
    if (status && status !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.privateMetadata.status === status
      );
    }

    // Filter by subscription
    if (subscription && subscription !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.privateMetadata.subscription === subscription
      );
    }

    // Sort users
    filteredUsers.sort((a, b) => {
      let valueA, valueB;

      // Handle different sort fields
      switch (sortBy) {
        case "name":
          valueA = (a.publicMetadata.name as string) || a.firstName || "";
          valueB = (b.publicMetadata.name as string) || b.firstName || "";
          break;
        case "role":
          valueA = (a.privateMetadata.role as string) || "free";
          valueB = (b.privateMetadata.role as string) || "free";
          break;
        case "status":
          valueA = (a.privateMetadata.status as string) || "active";
          valueB = (b.privateMetadata.status as string) || "active";
          break;
        case "subscription":
          valueA = (a.privateMetadata.subscription as string) || "free";
          valueB = (b.privateMetadata.subscription as string) || "free";
          break;
        case "joinDate":
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
      }

      // Sort in ascending or descending order
      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    // Get total count
    const total = filteredUsers.length;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Get user IDs for database lookup
    const userIds = paginatedUsers.map((user) => user.id);

    // Get additional user data from MongoDB
    const dbUsers = await User.find({ clerkId: { $in: userIds } });

    // Map Clerk users to our response format
    const users = paginatedUsers.map((clerkUser) => {
      // Find corresponding DB user
      const dbUser = dbUsers.find((u) => u.clerkId === clerkUser.id);

      // Create combined user object
      return {
        id: clerkUser.id,
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        joinDate: clerkUser.createdAt,
        lastActive: clerkUser.lastActiveAt || clerkUser.createdAt,
        // Game data from MongoDB
        xp: dbUser?.xp || 0,
        gems: dbUser?.gems || 0,
        gel: dbUser?.gel || 0,
        hearts: dbUser?.hearts || 0,
        streak: dbUser?.streak || 0,
        // Metadata from Clerk
        publicMetadata: clerkUser.publicMetadata,
        privateMetadata: clerkUser.privateMetadata,
      };
    });

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create a new user
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerk = await clerkClient();
    const adminUser = await clerk.users.getUser(userId);
    if (adminUser.privateMetadata.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, role, subscription, password } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // 1. Create user in Clerk
    const newClerkUser = await clerk.users.createUser({
      emailAddress: [email],
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" "),
      password,
      publicMetadata: {
        name,
      },
      privateMetadata: {
        role: role || "free",
        status: "active",
        subscription: subscription || "free",
        subscriptionStatus: "active",
      },
    });

    // 2. Create user in MongoDB
    await connectDB();
    const dbUser = await User.create({
      clerkId: newClerkUser.id,
      email,
      xp: 0,
      gems: 0,
      gel: 0,
      hearts: 5,
      streak: 0,
    });

    // 3. Return full user object in requested format
    return NextResponse.json({
      id: dbUser._id.toString(),
      clerkId: newClerkUser.id,
      email: newClerkUser.emailAddresses[0]?.emailAddress || email,
      xp: dbUser.xp,
      gems: dbUser.gems,
      gel: dbUser.gel,
      hearts: dbUser.hearts,
      streak: dbUser.streak,
      publicMetadata: newClerkUser.publicMetadata,
      privateMetadata: newClerkUser.privateMetadata,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
