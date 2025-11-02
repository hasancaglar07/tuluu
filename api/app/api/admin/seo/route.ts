import { type NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import User from "@/models/User";

/**
 * @swagger
 * /api/admin/seo:
 *   get:
 *     tags:
 *       - SEO
 *     summary: Get all SEO entries (admin only)
 *     description: Retrieves all SEO entries sorted by last modified date
 *     security:
 *       - clerkAuth: []
 *     responses:
 *       200:
 *         description: SEO entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   path:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   ogImage:
 *                     type: string
 *                   canonicalUrl:
 *                     type: string
 *                   locale:
 *                     type: string
 *                   robots:
 *                     type: string
 *                   structuredData:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   lastModified:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
 *   post:
 *     tags:
 *       - SEO
 *     summary: Create a new SEO entry (admin only)
 *     description: Creates a new SEO entry for a specific path and locale
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - path
 *               - title
 *               - locale
 *               - robots
 *             properties:
 *               path:
 *                 type: string
 *                 description: The URL path (must start with /)
 *               title:
 *                 type: string
 *                 maxLength: 60
 *                 description: The page title
 *               description:
 *                 type: string
 *                 maxLength: 160
 *                 description: The meta description
 *               ogImage:
 *                 type: string
 *                 format: uri
 *                 description: The Open Graph image URL
 *               canonicalUrl:
 *                 type: string
 *                 format: uri
 *                 description: The canonical URL
 *               locale:
 *                 type: string
 *                 description: The locale (e.g., en, fr)
 *               robots:
 *                 type: string
 *                 description: The robots meta tag content
 *               structuredData:
 *                 type: string
 *                 description: JSON-LD structured data
 *     responses:
 *       201:
 *         description: SEO entry created successfully
 *       400:
 *         description: Bad request - Validation error or duplicate entry
 *       500:
 *         description: Internal server error
 */

// GET /api/admin/users - Get all users
export async function GET(req: NextRequest) {
  try {
    // Check if the user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = (await clerkClient()).users.getUser(userId);
    // Check if user has admin role in privateMetadata
    if ((await user).privateMetadata.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
    // Check if the user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = (await clerkClient()).users.getUser(userId);
    if ((await adminUser).privateMetadata.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the request body
    const body = await req.json();
    const { email, name, role, subscription, password } = body;

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    // Create the user in Clerk
    const clerkUser = (await clerkClient()).users.createUser({
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

    // Create user in MongoDB
    await connectDB();
    await User.create({
      clerkId: (await clerkUser).id,
      email,
      xp: 0,
      gems: 0,
      gel: 0,
      hearts: 5,
      streak: 0,
      joinDate: new Date(),
      lastActive: new Date(),
    });

    return NextResponse.json({
      success: true,
      userId: (await clerkUser).id,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
