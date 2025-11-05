import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import UserProgress from "@/models/UserProgress";
import { auth } from "@clerk/nextjs/server";

const VALUE_POINT_KEYS = new Set([
  "patience",
  "gratitude",
  "kindness",
  "honesty",
  "sharing",
  "mercy",
  "justice",
  "respect",
]);

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { languageId, valuePoints } = body as {
      languageId?: string;
      valuePoints?: Record<string, number>;
    };

    if (!languageId) {
      return NextResponse.json(
        { error: "languageId is required" },
        { status: 400 }
      );
    }

    if (!valuePoints || typeof valuePoints !== "object") {
      return NextResponse.json(
        { error: "valuePoints payload is required" },
        { status: 400 }
      );
    }

    const sanitizedUpdates: Record<string, number> = {};

    Object.entries(valuePoints).forEach(([key, value]) => {
      if (VALUE_POINT_KEYS.has(key) && typeof value === "number") {
        sanitizedUpdates[key] = value;
      }
    });

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid valuePoints provided" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedProgress = await UserProgress.updateValuePoints(
      userId,
      languageId,
      sanitizedUpdates
    );

    if (!updatedProgress) {
      return NextResponse.json(
        { error: "Progress not found for language" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedProgress.valuePoints,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating value points:", error);
    return NextResponse.json(
      { error: "Failed to update value points" },
      { status: 500 }
    );
  }
}
