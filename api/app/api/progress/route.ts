import { NextRequest, NextResponse } from "next/server";
import UserProgress from "@/models/UserProgress";
import connectDB from "@/lib/db/connect";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const languageId = searchParams.get("languageId");
  if (!languageId) {
    return NextResponse.json(
      { error: "languageId is required" },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    const data = await UserProgress.getCurrentProgressData(userId, languageId);

    return NextResponse.json(data);
  } catch (err) {
    console.error("UserProgress API error:", err);
    return NextResponse.json(
      { error: "Server error", loading: false },
      { status: 500 }
    );
  }
}
