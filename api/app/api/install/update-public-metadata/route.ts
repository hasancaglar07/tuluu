import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const { userId, publicMetadata } = await request.json();

    if (!userId || !publicMetadata) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and public metadata are required",
        },
        { status: 400 }
      );
    }

    const client = await clerkClient();

    // Update user's public metadata
    const updatedUser = await client.users.updateUser(userId, {
      publicMetadata: {
        ...publicMetadata,
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Public metadata updated successfully",
      metadata: updatedUser.publicMetadata,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        emailAddresses: updatedUser.emailAddresses,
        publicMetadata: updatedUser.publicMetadata,
      },
    });
  } catch (error) {
    console.error("Error updating public metadata:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update public metadata",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
