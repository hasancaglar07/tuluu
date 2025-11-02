import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { auth } from "@clerk/nextjs/server";
import Unit from "@/models/Unit";
import Chapter from "@/models/Chapter";
import { UnitSchema } from "@/lib/validations/unit";
import { authGuard } from "@/lib/utils";
import Language from "@/models/Language";

/**
 * @swagger
 * /api/admin/units:
 *   get:
 *     summary: Get all units or filter by chapter and language
 *     tags: [Units]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: query
 *         name: chapterId
 *         schema:
 *           type: string
 *         description: Filter units by chapter ID
 *       - in: query
 *         name: languageId
 *         schema:
 *           type: string
 *         description: Filter units by language ID
 *     responses:
 *       200:
 *         description: List of units
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new unit
 *     tags: [Units]
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
 *               chapterId:
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
 *         description: Unit created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chapter not found
 *       500:
 *         description: Server error
 */

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const chapterId = url.searchParams.get("chapterId");
    const languageId = url.searchParams.get("languageId");

    await connectDB();

    const query: {
      chapterId?: number;
      languageId?: string;
    } = {};

    if (chapterId) {
      query.chapterId = Number.parseInt(chapterId);
    }
    if (languageId) {
      query.languageId = languageId;
    }

    const units = await Unit.find(query).sort({ order: 1 });

    return NextResponse.json(units, { status: 200 });
  } catch (error) {
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const validated = UnitSchema.safeParse(body);

    const data = validated.data;
    await connectDB();

    // Validate chapter and language exist
    const [chapter, language] = await Promise.all([
      Chapter.findById(data.chapterId),
      Language.findById(data.languageId),
    ]);

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 500 });
    }

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 500 }
      );
    }

    // Determine next order
    const maxOrderUnit = await Unit.findOne({
      chapterId: data.chapterId,
    })
      .sort({ order: -1 })
      .select("order")
      .lean();

    const nextOrder = maxOrderUnit ? maxOrderUnit.order + 1 : 1;

    const newUnit = new Unit({
      ...data,
      order: nextOrder,
      isPremium: data.isPremium ?? false,
      isExpanded: data.isExpanded ?? false,
      imageUrl: data.imageUrl ?? "",
    });

    await newUnit.save();

    return NextResponse.json(
      { status: true, data: { _id: newUnit._id, ...data } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: "Failed to create unit" },
      { status: 500 }
    );
  }
}
