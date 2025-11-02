import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";
import Exercise from "@/models/Exercise";
import { UserProgressSchema } from "@/lib/validations/userprogress";
import UserProgress from "@/models/UserProgress";

export async function GET() {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    await connectDB();
    const languages = await Exercise.find({});

    return NextResponse.json(languages, { status: 200 });
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { error: "Failed to fetch languages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const body = await req.json();

    const validated = UserProgressSchema.safeParse(body);
    if (!validated.success) {
      return Response.json(
        {
          message: "validation error",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 500 }
      );
    }

    await connectDB();

    // Determine next order

    const progress = await UserProgress.startLearningLanguage(
      validated.data.userId,
      validated.data.languageId
    );

    return NextResponse.json({ status: true, progress }, { status: 201 });
  } catch (error) {
    console.error("Error creating progress:", error);
    return NextResponse.json(
      { error: "Failed to create progress" },
      { status: 500 }
    );
  }
}
