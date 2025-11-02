import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { auth } from "@clerk/nextjs/server";
import Unit from "@/models/Unit";
import { authGuard } from "@/lib/utils";
import { UnitSchema } from "@/lib/validations/unit";

/**
 * @swagger
 * /api/admin/units/{id}:
 *   get:
 *     summary: Get a unit by ID
 *     tags: [Units]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: chapterId
 *         schema:
 *           type: string
 *         description: Chapter ID for the unit
 *       - in: query
 *         name: languageId
 *         schema:
 *           type: string
 *         description: Language ID for the unit
 *     responses:
 *       200:
 *         description: Unit details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Unit not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a unit
 *     tags: [Units]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: chapterId
 *         schema:
 *           type: string
 *         description: Chapter ID for the unit
 *       - in: query
 *         name: languageId
 *         schema:
 *           type: string
 *         description: Language ID for the unit
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
 *         description: Unit updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Unit not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a unit
 *     tags: [Units]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: chapterId
 *         schema:
 *           type: string
 *         description: Chapter ID for the unit
 *       - in: query
 *         name: languageId
 *         schema:
 *           type: string
 *         description: Language ID for the unit
 *     responses:
 *       200:
 *         description: Unit deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Unit not found
 *       500:
 *         description: Server error
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const url = new URL(req.url);
    const chapterId = url.searchParams.get("chapterId");
    const languageId = url.searchParams.get("languageId");

    await connectDB();

    const query: {
      id: number;
      chapterId?: number;
      languageId?: string;
    } = {
      id: Number.parseInt(id),
    };

    if (chapterId) {
      query.chapterId = Number.parseInt(chapterId);
    }
    if (languageId) {
      query.languageId = languageId;
    }

    const unit = await Unit.findOne(query);

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    return NextResponse.json(unit, { status: 200 });
  } catch (error) {
    console.error("Error fetching unit:", error);
    return NextResponse.json(
      { error: "Failed to fetch unit" },
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
    const validated = UnitSchema.safeParse(data);
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

    const unit = await Unit.findById({ _id: id });
    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 500 });
    }

    // 🛠️ Update language
    const updated = await Unit.findOneAndUpdate({ _id: id }, validated.data, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Unit not found" }, { status: 500 });
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
    const unit = await Unit.disableById(id);

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Unit disabled successfully", unit },
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
