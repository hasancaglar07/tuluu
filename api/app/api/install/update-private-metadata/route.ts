import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const { userId, privateMetadata } = await request.json();

    if (!userId || !privateMetadata) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and private metadata are required",
        },
        { status: 400 }
      );
    }

    await connectDB();
    await User.create({
      clerkId: userId,
      xp: 0,
      gems: 0,
      gel: 0,
      hearts: 5,
      streak: 0,
    });

    const client = await clerkClient();

    // Update user's private metadata
    const updatedUser = await client.users.updateUser(userId, {
      privateMetadata: {
        ...privateMetadata,
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Private metadata updated successfully",
      metadata: updatedUser.privateMetadata,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        emailAddresses: updatedUser.emailAddresses,
        privateMetadata: updatedUser.privateMetadata,
      },
    });
  } catch (error) {
    console.error("Error updating private metadata:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update private metadata",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
