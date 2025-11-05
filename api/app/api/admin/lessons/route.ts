import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { auth } from "@clerk/nextjs/server";
import Language, { LanguageDocument } from "@/models/Language";
import Chapter, { ChapterDocument } from "@/models/Chapter";
import Unit, { UnitDocument } from "@/models/Unit";
import Lesson, { LessonDocument } from "@/models/Lesson";
import { authGuard } from "@/lib/utils";
import { LessonSchema } from "@/lib/validations/lesson";
import { MongoServerError } from "mongodb";

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Get lessons or full course structure
 *     tags: [Lesson]
 *     description: Returns either a filtered list of lessons or the full nested structure of languages → chapters → units → lessons (when `action=aggregate`).
 *     parameters:
 *       - in: query
 *         name: unitId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the unit to filter lessons
 *       - in: query
 *         name: chapterId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the chapter to filter lessons
 *       - in: query
 *         name: languageId
 *         schema:
 *           type: string
 *         required: false
 *         description: ID of the language to filter lessons
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         required: false
 *         description: Set to "aggregate" to return the full nested course structure
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     summary: Create a new lesson
 *     tags: [Lesson]
 *     description: Validates and creates a new lesson inside a unit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonInput'
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 *
 * components:
 *   schemas:
 *     LessonInput:
 *       type: object
 *       required:
 *         - title
 *         - languageId
 *         - chapterId
 *         - unitId
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         languageId:
 *           type: string
 *         chapterId:
 *           type: string
 *         unitId:
 *           type: string
 *         isPremium:
 *           type: boolean
 *         isActive:
 *           type: boolean
 *         isTest:
 *           type: boolean
 *         xpReward:
 *           type: number
 *         imageUrl:
 *           type: string
 *     Lesson:
 *       allOf:
 *         - $ref: '#/components/schemas/LessonInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *             order:
 *               type: number
 */

export async function GET(req: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    const url = new URL(req.url);
    const unitId = url.searchParams.get("unitId");
    const chapterId = url.searchParams.get("chapterId");
    const languageId = url.searchParams.get("languageId");
    const action = url.searchParams.get("action");

    await connectDB();

    if (action === "aggregate") {
      // Fetch only active programs so disabled entries do not return after deletion
      const languages = await Language.find({ isActive: true });

      // Create the result structure
      const result = {
        languages: await Promise.all(
          languages.map(async (language: LanguageDocument) => {
            // Fetch chapters for this language
            const chapters = await Chapter.find({ languageId: language.id });

            return {
              _id: language.id,
              name: language.name,
              nativeName: language.nativeName,
              flag: language.flag,
              baseLanguage: language.baseLanguage,
              locale: language.locale,
              isActive: language.isActive,
              chapters: await Promise.all(
                chapters.map(async (chapter: ChapterDocument) => {
                  // Fetch units for this chapter
                  const units = await Unit.find({
                    languageId: language.id,
                    chapterId: chapter.id,
                  });

                  return {
                    _id: chapter.id,
                    title: chapter.title,
                    description: chapter.description,
                    isPremium: chapter.isPremium,
                    isExpanded: true, // Default to expanded in the UI
                    imageUrl: chapter.imageUrl || "",
                    isActive: chapter.isActive || true,
                    order: chapter.order || 0,
                    units: await Promise.all(
                      units.map(async (unit: UnitDocument) => {
                        // Fetch lessons for this unit
                        const lessons = await Lesson.find({
                          languageId: language.id,
                          chapterId: chapter.id,
                          unitId: unit.id,
                        });

                        return {
                          _id: unit.id,
                          title: unit.title,
                          description: unit.description,
                          isPremium: unit.isPremium,
                          isExpanded: true, // Default to expanded in the UI
                          imageUrl: unit.imageUrl || "",
                          order: unit.order,
                          color: unit.color,
                          isActive: chapter.isActive || true,
                          lessons: lessons.map((lesson: LessonDocument) => ({
                            _id: lesson.id,
                            title: lesson.title,
                            description: lesson.description,
                            isPremium: lesson.isPremium,
                            isActive: lesson.isActive,
                            isTest: lesson.isTest,
                            order: lesson.order,
                            xpReward: lesson.xpReward,
                            imageUrl: lesson.imageUrl || "",
                            languageId: lesson.languageId,
                            chapterId: lesson.chapterId,
                            unitId: lesson.unitId,
                          })),
                        };
                      })
                    ),
                  };
                })
              ),
            };
          })
        ),
      };
      return NextResponse.json(result, { status: 200 });
    }
    const query: {
      unitId?: number;
      chapterId?: number;
      languageId?: string;
    } = {};

    if (unitId) {
      query.unitId = Number.parseInt(unitId);
    }
    if (chapterId) {
      query.chapterId = Number.parseInt(chapterId);
    }
    if (languageId) {
      query.languageId = languageId;
    }

    const lessons = await Lesson.find(query).sort({ order: 1 });

    return NextResponse.json(lessons, { status: 200 });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" + error },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const validated = LessonSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          message: "validation error",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validated.data;
    await connectDB();

    // Validate chapter and language exist
    const [chapter, language, unit] = await Promise.all([
      Chapter.findById(data?.chapterId),
      Language.findById(data?.languageId),
      Unit.findById(data?.unitId),
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

    if (!unit) {
      return NextResponse.json({ error: "Unit not found" }, { status: 500 });
    }

    //check if the order already exist for lesson with same unit
    const checkOrder = await Lesson.findOne({
      unitId: data?.unitId,
      order: data?.order,
    });

    if (checkOrder) {
      return NextResponse.json(
        {
          message: `Order ${data?.order} is already taken by a Lesson for this unit`,
        },
        { status: 400 }
      );
    }

    // Determine next order
    const maxOrderUnit = await Lesson.findOne({
      unitId: data?.unitId,
    })
      .sort({ order: -1 })
      .select("order")
      .lean();

    const nextOrder = maxOrderUnit ? maxOrderUnit.order + 1 : data?.order;

    const newLesson = new Lesson({
      ...data,
      order: nextOrder,
      isActive: data?.isActive ?? true,
      isTest: data?.isTest ?? false,
      imageUrl: data?.imageUrl ?? "",
      xpReward: data?.xpReward ?? 1,
    });

    await newLesson.save();

    return NextResponse.json(
      { status: true, data: { _id: newLesson._id, ...data } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json(
        {
          message: "A lesson order with the same unit already exists. Use a different order.",
        },
        { status: 400 }
      );
    }
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
