import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import ChapterModel from "@/models/Chapter";
import { authGuard } from "@/lib/utils";
import { ChapterSchema } from "@/lib/validations/chapter";
import Language from "@/models/Language";
import Chapter from "@/models/Chapter";

/**
 * @swagger
 * /api/admin/chapters:
 *   get:
 *     summary: Get all chapters or filter by language
 *     tags: [Chapters]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: query
 *         name: languageId
 *         schema:
 *           type: string
 *         description: Filter chapters by language ID
 *     responses:
 *       200:
 *         description: List of chapters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new chapter
 *     tags: [Chapters]
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               languageId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               isPremium:
 *                 type: boolean
 *               isExpanded:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Chapter created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Language not found
 *       500:
 *         description: Server error
 */

export async function GET(req: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    const url = new URL(req.url);
    const languageId = url.searchParams.get("languageId");

    await connectDB();

    const query = languageId ? { languageId } : {};

    const chapters = await Chapter.find(query).sort({ order: 1 });

    return NextResponse.json(chapters, { status: 200 });
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // Early return on unauthorized/forbidden
    }

    const body = await req.json();

    // Validate input using Zod
    const validated = ChapterSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if language exists by ID
    const language = await Language.findById(validated.data.languageId);
    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 }
      );
    }

    // Find max order for chapters in this language
    const maxOrderChapter = await ChapterModel.findOne({
      languageId: validated.data.languageId,
    })
      .sort({ order: -1 }) // descending order
      .select("order")
      .lean();

    const nextOrder = maxOrderChapter ? maxOrderChapter.order + 1 : 1;

    // Create and save new chapter with defaults from validation schema
    const newChapter = new ChapterModel({
      ...validated.data,
      isPremium: validated.data.isPremium ?? false,
      isExpanded: validated.data.isExpanded ?? false,
      imageUrl: validated.data.imageUrl ?? "",
      order: nextOrder,
    });

    await newChapter.save();

    // Return created chapter with 201 Created status
    return NextResponse.json(
      { status: true, data: { _id: newChapter._id, ...validated.data } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating chapter:", error);
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
