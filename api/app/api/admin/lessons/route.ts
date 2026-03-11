import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { auth } from "@clerk/nextjs/server";
import Language from "@/models/Language";
import Chapter from "@/models/Chapter";
import Unit from "@/models/Unit";
import Lesson from "@/models/Lesson";
import Exercise from "@/models/Exercise";
import { authGuard } from "@/lib/utils";
import { LessonSchema } from "@/lib/validations/lesson";
import { MongoServerError } from "mongodb";

const ADMIN_LESSONS_AGGREGATE_CACHE_TTL_MS = 20 * 1000;

type AdminLessonsAggregatePayload = {
  languages: Array<Record<string, unknown>>;
};

type AdminLessonsAggregateCacheValue = {
  expiresAt: number;
  payload: AdminLessonsAggregatePayload;
};

const globalForAdminLessonsAggregateCache = globalThis as typeof globalThis & {
  _adminLessonsAggregateCache?: Map<string, AdminLessonsAggregateCacheValue>;
};

const adminLessonsAggregateCache =
  globalForAdminLessonsAggregateCache._adminLessonsAggregateCache ?? new Map();
globalForAdminLessonsAggregateCache._adminLessonsAggregateCache =
  adminLessonsAggregateCache;

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
      const now = Date.now();
      const cachedAggregate = adminLessonsAggregateCache.get("aggregate");
      if (cachedAggregate && cachedAggregate.expiresAt > now) {
        return NextResponse.json(cachedAggregate.payload, { status: 200 });
      }

      const normalizeThemeMetadata = (metadata?: {
        islamicContent?: boolean;
        ageGroup?: string;
        moralValues?: string[];
        educationalFocus?: string | null;
        difficultyLevel?: string;
      }) => ({
        islamicContent: metadata?.islamicContent ?? false,
        ageGroup: metadata?.ageGroup ?? "all",
        moralValues: metadata?.moralValues ?? [],
        educationalFocus: metadata?.educationalFocus ?? "",
        difficultyLevel: metadata?.difficultyLevel ?? "beginner",
      });

      type AggregatedExercise = {
        _id: string;
        lessonId: string;
        type: string;
        componentType: string;
        moralValue: string;
        valuePoints: number;
        questionPreview: string;
        instruction: string;
        sourceText: string;
        sourceLanguage: string;
        targetLanguage: string;
        correctAnswer: string[];
        options: string[];
        isNewWord: boolean;
        audioUrl: string;
        neutralAnswerImage: string;
        badAnswerImage: string;
        correctAnswerImage: string;
        order: number;
        educationContent: unknown;
        mediaPack: unknown;
        hoverHint: unknown;
        answerAudioUrl: string;
        ttsVoiceId: string;
        autoRevealMilliseconds: number | null;
      };

      const languages = await Language.find({ isActive: true })
        .sort({ createdAt: 1 })
        .lean();
      const languageIds = languages.map((language) => String(language._id));

      if (languageIds.length === 0) {
        const emptyPayload: AdminLessonsAggregatePayload = { languages: [] };
        adminLessonsAggregateCache.set("aggregate", {
          expiresAt: now + ADMIN_LESSONS_AGGREGATE_CACHE_TTL_MS,
          payload: emptyPayload,
        });
        return NextResponse.json(emptyPayload, { status: 200 });
      }

      const [chapters, units, lessons, exercises] = await Promise.all([
        Chapter.find({ languageId: { $in: languageIds } })
          .sort({ order: 1 })
          .lean(),
        Unit.find({ languageId: { $in: languageIds } })
          .sort({ order: 1 })
          .lean(),
        Lesson.find({ languageId: { $in: languageIds } })
          .sort({ order: 1 })
          .lean(),
        Exercise.find({
          languageId: { $in: languageIds },
          isActive: true,
        })
          .sort({ order: 1 })
          .lean(),
      ]);

      const chaptersByLanguageId = new Map<string, typeof chapters>();
      const unitsByChapterId = new Map<string, typeof units>();
      const lessonsByUnitId = new Map<string, typeof lessons>();
      const exercisesByLessonId = new Map<string, AggregatedExercise[]>();

      for (const chapter of chapters) {
        const key = String(chapter.languageId);
        const chapterList = chaptersByLanguageId.get(key) ?? [];
        chapterList.push(chapter);
        chaptersByLanguageId.set(key, chapterList);
      }

      for (const unit of units) {
        const key = String(unit.chapterId);
        const unitList = unitsByChapterId.get(key) ?? [];
        unitList.push(unit);
        unitsByChapterId.set(key, unitList);
      }

      for (const lesson of lessons) {
        const key = String(lesson.unitId);
        const lessonList = lessonsByUnitId.get(key) ?? [];
        lessonList.push(lesson);
        lessonsByUnitId.set(key, lessonList);
      }

      for (const exercise of exercises) {
        const lessonKey = String(exercise.lessonId);
        const exerciseList = exercisesByLessonId.get(lessonKey) ?? [];
        exerciseList.push({
          _id: String(exercise._id),
          lessonId: String(exercise.lessonId ?? ""),
          type: exercise.type,
          componentType: (exercise as any).componentType || "multiple_choice",
          moralValue: (exercise as any).moralValue || "kindness",
          valuePoints: (exercise as any).valuePoints || 0,
          questionPreview: (exercise as any).questionPreview || "",
          instruction: exercise.instruction,
          sourceText: exercise.sourceText,
          sourceLanguage: exercise.sourceLanguage,
          targetLanguage: exercise.targetLanguage,
          correctAnswer: exercise.correctAnswer ?? [],
          options: exercise.options ?? [],
          isNewWord: exercise.isNewWord,
          audioUrl: exercise.audioUrl,
          neutralAnswerImage: exercise.neutralAnswerImage,
          badAnswerImage: exercise.badAnswerImage,
          correctAnswerImage: exercise.correctAnswerImage,
          order: exercise.order,
          educationContent: exercise.educationContent ?? null,
          mediaPack: exercise.mediaPack ?? null,
          hoverHint: exercise.hoverHint ?? null,
          answerAudioUrl: exercise.answerAudioUrl ?? "",
          ttsVoiceId: exercise.ttsVoiceId ?? "",
          autoRevealMilliseconds: exercise.autoRevealMilliseconds ?? null,
        });
        exercisesByLessonId.set(lessonKey, exerciseList);
      }

      const payload: AdminLessonsAggregatePayload = {
        languages: languages.map((language) => {
          const languageId = String(language._id);
          const chapterList = chaptersByLanguageId.get(languageId) ?? [];

          return {
            _id: languageId,
            name: language.name,
            nativeName: language.nativeName,
            flag: language.flag,
            baseLanguage: language.baseLanguage,
            imageUrl: language.imageUrl || "",
            locale: language.locale,
            isActive: language.isActive,
            category: language.category ?? "language_learning",
            themeMetadata: normalizeThemeMetadata(
              language.themeMetadata as
                | {
                    islamicContent?: boolean;
                    ageGroup?: string;
                    moralValues?: string[];
                    educationalFocus?: string | null;
                    difficultyLevel?: string;
                  }
                | undefined
            ),
            chapters: chapterList.map((chapter) => {
              const chapterIdKey = String(chapter._id);
              const unitList = unitsByChapterId.get(chapterIdKey) ?? [];

              return {
                _id: chapterIdKey,
                title: chapter.title,
                description: chapter.description,
                isPremium: chapter.isPremium,
                isExpanded: true,
                imageUrl: chapter.imageUrl || "",
                isActive: chapter.isActive ?? true,
                order: chapter.order ?? 0,
                contentType: chapter.contentType ?? "lesson",
                moralLesson: chapter.moralLesson ?? null,
                miniGame: chapter.miniGame ?? null,
                units: unitList.map((unit) => {
                  const unitIdKey = String(unit._id);
                  const lessonList = lessonsByUnitId.get(unitIdKey) ?? [];

                  return {
                    _id: unitIdKey,
                    title: unit.title,
                    description: unit.description,
                    isPremium: unit.isPremium,
                    isExpanded: true,
                    imageUrl: unit.imageUrl || "",
                    order: unit.order,
                    color: unit.color,
                    isActive: unit.isActive ?? true,
                    lessons: lessonList.map((lesson) => {
                      const lessonIdKey = String(lesson._id);
                      return {
                        _id: lessonIdKey,
                        title: lesson.title,
                        description: lesson.description,
                        isPremium: lesson.isPremium,
                        isActive: lesson.isActive,
                        isTest: lesson.isTest,
                        order: lesson.order,
                        xpReward: lesson.xpReward,
                        teachingPhase: (lesson as any).teachingPhase || "teach",
                        moralValue: (lesson as any).moralValue || "kindness",
                        valuePointsReward: (lesson as any).valuePointsReward || 0,
                        pedagogyFocus: (lesson as any).pedagogyFocus || "",
                        moralStory: (lesson as any).moralStory || null,
                        imageUrl: lesson.imageUrl || "",
                        languageId: lesson.languageId,
                        chapterId: lesson.chapterId,
                        unitId: lesson.unitId,
                        moralLesson: (lesson as any).moralLesson || null,
                        miniGame: (lesson as any).miniGame || null,
                        storyPages: lesson.storyPages || [],
                        storyMetadata: lesson.storyMetadata || null,
                        exercises: exercisesByLessonId.get(lessonIdKey) ?? [],
                      };
                    }),
                  };
                }),
              };
            }),
          };
        }),
      };

      adminLessonsAggregateCache.set("aggregate", {
        expiresAt: now + ADMIN_LESSONS_AGGREGATE_CACHE_TTL_MS,
        payload,
      });

      return NextResponse.json(payload, { status: 200 });
    }
    const query: {
      unitId?: string;
      chapterId?: string;
      languageId?: string;
    } = {};

    if (unitId) {
      query.unitId = unitId;
    }
    if (chapterId) {
      query.chapterId = chapterId;
    }
    if (languageId) {
      query.languageId = languageId;
    }

    const lessons = await Lesson.find(query).sort({ order: 1 });

    return NextResponse.json(lessons, { status: 200 });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Dersler getirilemedi: " + error },
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
          message: "Doğrulama hatası",
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
      return NextResponse.json({ error: "Bölüm bulunamadı" }, { status: 500 });
    }

    if (!language) {
      return NextResponse.json(
        { error: "Dil bulunamadı" },
        { status: 500 }
      );
    }

    if (!unit) {
      return NextResponse.json({ error: "Ünite bulunamadı" }, { status: 500 });
    }

    //check if the order already exist for lesson with same unit
    const checkOrder = await Lesson.findOne({
      unitId: data?.unitId,
      order: data?.order,
    });

    if (checkOrder) {
      return NextResponse.json(
        {
          message: `${data?.order} sırası bu ünitedeki başka bir ders tarafından kullanılıyor`,
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
          message: "Aynı ünitede bu sıraya sahip bir ders zaten var. Farklı bir sıra kullanın.",
        },
        { status: 400 }
      );
    }
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Ders oluşturulamadı" },
      { status: 500 }
    );
  }
}
