import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const client = await clerkClient();

    // Get users list to verify connection
    const users = await client.users.getUserList({ limit: 10 });

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Clerk Users API",
      totalUsers: users.totalCount,
      sampleUsers: users.data.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        firstName: user.firstName,
        emailAddresses: user.emailAddresses,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error connecting to Clerk Users API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to connect to Clerk Users API",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
