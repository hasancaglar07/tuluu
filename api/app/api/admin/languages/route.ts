import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";
import Language from "@/models/Language";
import { LanguageSchema } from "@/lib/validations/language";
import Chapter from "@/models/Chapter";
import Unit from "@/models/Unit";
import Lesson from "@/models/Lesson";
import UserProgress from "@/models/UserProgress";
import User from "@/models/User";
import Exercise from "@/models/Exercise";
import { auth } from "@clerk/nextjs/server";

/**
 * @swagger
 * components:
 *   schemas:
 *     Language:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "664abfd6c85b6a2f8a5e82d1"
 *         name:
 *           type: string
 *           example: "French"
 *         baseLanguage:
 *           type: string
 *           example: "fr"
 *         isActive:
 *           type: boolean
 *           example: true
 *         flag:
 *           type: string
 *           example: "🇫🇷"
 *         nativeName:
 *           type: string
 *           example: "Français"
 *     LanguageInput:
 *       type: object
 *       required:
 *         - name
 *         - baseLanguage
 *       properties:
 *         name:
 *           type: string
 *           example: "French"
 *         baseLanguage:
 *           type: string
 *           example: "fr"
 *         isActive:
 *           type: boolean
 *           example: true
 *         flag:
 *           type: string
 *           example: "🇫🇷"
 *         nativeName:
 *           type: string
 *           example: "Français"
 */

/**
 * @swagger
 * /api/languages/{id}:
 *   get:
 *     summary: Get language by ID
 *     tags: [Language]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The language ID
 *     responses:
 *       200:
 *         description: Language found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Language'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Language not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update a language by ID
 *     tags: [Language]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The language ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LanguageInput'
 *     responses:
 *       200:
 *         description: Language updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Language'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Language not found
 *       500:
 *         description: Server error
 */

export interface RewardType {
  xp: number;
  gems: number;
  gel: number;
  hearts: number;
  streak: number;
  xpBoost: XpBoostType | null;
}

export interface CurrentLessonType {
  lessonId: string; // If you're using ObjectId, change this to `Types.ObjectId`
  progress: number;
  lastAccessed: Date;
}
export interface XpBoostType {
  durationMinutes: number;
  multiplier: number;
}

export interface UserProgressType {
  userId: string;
  languageId: string;
  isCompleted: boolean;
  completedAt?: Date | null;

  completedChapters: {
    chapterId: string;
    completedAt: Date;
    rewards: RewardType;
  }[];

  completedUnits: {
    unitId: string;
    completedAt: Date;
    rewards: RewardType;
  }[];

  completedLessons: {
    lessonId: string;
    completedAt: Date;
    rewards: RewardType;
  }[];

  currentLesson?: CurrentLessonType;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(req: NextRequest) {
  try {
    const authe = await authGuard();
    if (authe instanceof NextResponse) {
      return authe; // early return on unauthorized or forbidden
    }

    await connectDB();

    const { userId } = await auth();

    const languages = await Language.find({});

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "learn" && userId) {
      const totalStats = await UserProgress.getTotalStats(userId);

      // 4. Get user doc for last login and streak

      const lastLogin = await User.findOne({ clerkId: userId })
        .select("loginHistory")
        .lean();

      const lastHistory =
        lastLogin?.loginHistory?.[lastLogin.loginHistory.length - 1];

      const lastActive = lastHistory?.date
        ? new Date(lastHistory.date).toISOString()
        : null;

      const user = {
        xp: totalStats.totalXp,
        gems: totalStats.totalGems,
        gel: totalStats.totalGel,
        hearts: totalStats?.totalHeart,
        streak: totalStats?.totalStreak,
        lastActive: lastActive,
      };
      const userCountStats = await UserProgress.getUserCountPerLanguage();

      // Step 2: Convert stats array to a dictionary for fast lookup
      const userCountMap = userCountStats.reduce((acc, lang) => {
        acc[lang.languageId] = lang.userCount;
        return acc;
      }, {} as Record<string, number>);
      const languages = await Language.find();

      // Get all UserProgress for user and languages
      const userProgressList = await UserProgress.find({
        userId: userId,
        languageId: { $in: languages.map((lang) => lang._id) },
      }).lean();

      // Define the type for progressMap
      const progressMap: Record<string, UserProgressType> = {};
      userProgressList.forEach((progress) => {
        progressMap[progress.languageId] = progress as UserProgressType;
      });

      const lessons = await Promise.all(
        languages.map(async (language) => {
          const progress = progressMap[language._id.toString()];

          const isLanguageCompleted = progress?.isCompleted || false;

          const chapters = await Chapter.find({ languageId: language._id });

          const formattedChapters = await Promise.all(
            chapters.map(async (chapter) => {
              const isChapterCompleted =
                progress?.completedChapters?.some(
                  (item: { chapterId: string }) =>
                    item.chapterId === chapter._id.toString()
                ) || false;

              const units = await Unit.find({ chapterId: chapter._id });

              const formattedUnits = await Promise.all(
                units.map(async (unit) => {
                  const isUnitCompleted =
                    progress?.completedUnits?.some(
                      (item: { unitId: string }) =>
                        item.unitId === unit._id.toString()
                    ) || false;

                  const lessons = await Lesson.find({ unitId: unit._id });

                  const formattedLessons = await Promise.all(
                    // await Promise.all here, since lessons.map is async
                    lessons.map(async (lesson) => {
                      const isLessonCompleted =
                        progress?.completedLessons?.some(
                          (item: { lessonId: string }) =>
                            item.lessonId === lesson._id.toString()
                        ) || false;

                      const exercises = await Exercise.find({
                        lessonId: lesson._id,
                      });
                      const formattedExercises = exercises.map((exercise) => ({
                        _id: exercise._id,
                        type: exercise.type,
                        instruction: exercise.instruction,
                        sourceText: exercise.sourceText,
                        sourceLanguage: exercise.sourceLanguage,
                        targetLanguage: exercise.targetLanguage,
                        correctAnswer: exercise.correctAnswer,
                        options: exercise.options,
                        isNewWord: exercise.isNewWord,
                        audioUrl: exercise.audioUrl,
                        neutralAnswerImage: exercise.neutralAnswerImage,
                        badAnswerImage: exercise.badAnswerImage,
                        correctAnswerImage: exercise.correctAnswerImage,
                        isActive: exercise.isActive,
                        order: exercise.order,
                      }));

                      return {
                        id: lesson._id,
                        title: lesson.title,
                        chapterId: lesson.chapterId,
                        unitId: lesson.unitId,
                        description: lesson.description || "",
                        isPremium: lesson.isPremium || false,
                        isCompleted: isLessonCompleted,
                        imageUrl: lesson.imageUrl || "",
                        xpReward: lesson.xpReward || 10,
                        order: lesson.order || 10,
                        exercises: formattedExercises,
                      };
                    })
                  );

                  return {
                    id: unit._id,
                    title: unit.title,
                    description: unit.description || "",
                    isPremium: unit.isPremium || false,
                    isCompleted: isUnitCompleted,
                    color: unit.color || "bg-[#ff2dbd]",
                    isExpanded: true,
                    imageUrl: unit.imageUrl || "",
                    lessons: formattedLessons,
                  };
                })
              );

              return {
                id: chapter._id,
                title: chapter.title,
                isPremium: chapter.isPremium || false,
                isCompleted: isChapterCompleted,
                isExpanded: true,
                units: formattedUnits,
              };
            })
          );

          return {
            _id: language._id,
            name: language.name,
            imageUrl: language.imageUrl,
            baseLanguage: language.baseLanguage,
            flag: language.flag,
            isCompleted: isLanguageCompleted,
            userCount: userCountMap[language._id.toString()] || 0,
            chapters: formattedChapters,
          };
        })
      );

      return NextResponse.json(
        { languages: lessons, user: user, progress: userProgressList },
        { status: 200 }
      );
    }

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

    const validated = LanguageSchema.safeParse(body);
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

    const newLanguage = new Language({
      ...validated.data,
      isActive:
        validated.data.isActive !== undefined ? validated.data.isActive : true,
    });

    await newLanguage.save();

    return NextResponse.json(
      { status: true, data: { _id: newLanguage._id, ...validated.data } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating language:", error);
    return NextResponse.json(
      { error: "Failed to create language" },
      { status: 500 }
    );
  }
}
