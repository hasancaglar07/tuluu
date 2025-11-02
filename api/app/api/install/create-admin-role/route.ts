import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Update user metadata in Clerk to include admin role
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        role: "admin",
        subscription: "free",
        subscriptionStatus: "active",
        status: "active",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Admin role created successfully",
      metadata: {
        role: "admin",
        subscription: "free",
        subscriptionStatus: "active",
        status: "active",
      },
    });
  } catch (error) {
    console.error("Error creating admin role:", error);
    return NextResponse.json(
      { error: "Failed to create admin role" },
      { status: 500 }
    );
  }
}
