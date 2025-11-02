import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    // Check if Clerk environment variables are set
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const secretKey = process.env.CLERK_SECRET_KEY;

    if (!publishableKey || !secretKey) {
      return NextResponse.json({
        connected: false,
        error: "Clerk environment variables not configured",
        details: {
          publishableKey: !!publishableKey,
          secretKey: !!secretKey,
        },
      });
    }

    // Test Clerk connection by getting application info
    const client = await clerkClient();

    // Try to get the current application info
    // This will throw an error if the keys are invalid
    const users = await client.users.getUserList({ limit: 1 });

    return NextResponse.json({
      connected: true,
      info: {
        applicationId: publishableKey.split("_")[1], // Extract app ID from publishable key
        environment: process.env.NODE_ENV || "development",
        usersCount: users.totalCount,
      },
    });
  } catch (error) {
    console.error("Clerk connection error:", error);
    return NextResponse.json({
      connected: false,
      error: "Failed to connect to Clerk",
      details: error.message,
    });
  }
}
