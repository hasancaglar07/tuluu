import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";
import { ChapterSchema } from "@/lib/validations/chapter";
import Chapter from "@/models/Chapter";

/**
 * @swagger
 * /api/admin/chapters/{id}:
 *   get:
 *     summary: Get a chapter by ID
 *     tags: [Chapters]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: languageId
 *         schema:
 *           type: string
 *         description: Language ID for the chapter
 *     responses:
 *       200:
 *         description: Chapter details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chapter not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a chapter
 *     tags: [Chapters]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: languageId
 *         schema:
 *           type: string
 *         description: Language ID for the chapter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *       200:
 *         description: Chapter updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chapter not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a chapter
 *     tags: [Chapters]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: languageId
 *         schema:
 *           type: string
 *         description: Language ID for the chapter
 *     responses:
 *       200:
 *         description: Chapter deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chapter not found
 *       500:
 *         description: Server error
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const url = new URL(req.url);
    const languageId = url.searchParams.get("languageId");

    await connectDB();

    const query: { id: string; languageId?: string } = {
      id: id,
    };
    if (languageId) {
      query.languageId = languageId;
    }
    if (languageId) query.languageId = languageId;

    const chapter = await Chapter.findOne(query);

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json(chapter, { status: 200 });
  } catch (error) {
    console.error("Error fetching chapter:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const data = await req.json();

    // Validate data partially
    const validated = ChapterSchema.safeParse(data);
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

    const chapter = await Chapter.findById({ _id: id });
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 500 });
    }

    // 🛠️ Update language
    const updated = await Chapter.findOneAndUpdate(
      { _id: id },
      validated.data,
      {
        new: true,
      }
    );

    if (!updated) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 500 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating chapter:", error);
    return NextResponse.json(
      { error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    await connectDB();

    // Instead of deleting, disable the chapter
    const chapter = await Chapter.disableById(id);

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Chapter disabled successfully", chapter },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error disabling chapter:", error);
    return NextResponse.json(
      { error: "Failed to disable chapter" },
      { status: 500 }
    );
  }
}
