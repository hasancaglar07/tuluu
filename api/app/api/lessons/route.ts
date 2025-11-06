import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Language from "@/models/Language";
import Chapter from "@/models/Chapter";
import Unit from "@/models/Unit";
import Lesson from "@/models/Lesson";
import UserProgress from "@/models/UserProgress";
import Exercise from "@/models/Exercise";
import { auth } from "@clerk/nextjs/server";

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
/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Get complete language learning content structure
 *     description: |
 *       Retrieves the complete hierarchical structure of a language including chapters, units,
 *       lessons, and exercises along with user progress data. Initializes user progress if
 *       it doesn't exist for the specified language.
 *     tags:
 *       - Language Content
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: languageId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: The unique identifier of the language
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       '200':
 *         description: Successfully retrieved language content structure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LanguageContentResponse'
 *             examples:
 *               successExample:
 *                 summary: Complete language content structure
 *                 value:
 *                   chapters:
 *                     - _id: "chapter_123"
 *                       title: "Basics"
 *                       isPremium: false
 *                       isCompleted: true
 *                       isExpanded: true
 *                       imageUrl: "https://example.com/chapter.jpg"
 *                       order: 1
 *                       description: "Learn the basics"
 *                       units:
 *                         - _id: "unit_456"
 *                           title: "Greetings"
 *                           description: "Basic greetings"
 *                           isPremium: false
 *                           isCompleted: true
 *                           color: "bg-[#ff2dbd]"
 *                           isExpanded: true
 *                           imageUrl: "https://example.com/unit.jpg"
 *                           order: 1
 *                           lessons:
 *                             - _id: "lesson_789"
 *                               title: "Hello World"
 *                               chapterId: "chapter_123"
 *                               unitId: "unit_456"
 *                               description: "Learn to say hello"
 *                               isPremium: false
 *                               isCompleted: false
 *                               imageUrl: "https://example.com/lesson.jpg"
 *                               xpReward: 10
 *                               order: 1
 *                               exercises:
 *                                 - _id: "exercise_101"
 *                                   type: "multiple_choice"
 *                                   instruction: "Choose the correct translation"
 *                                   sourceText: "Hello"
 *                                   sourceLanguage: "en"
 *                                   targetLanguage: "es"
 *                                   correctAnswer: "Hola"
 *                                   options: ["Hola", "Adiós", "Gracias"]
 *                                   isNewWord: true
 *                                   audioUrl: "https://example.com/audio.mp3"
 *                                   isActive: true
 *                                   order: 1
 *                   lessonContents:
 *                     - _id: "lesson_789"
 *                       title: "Hello World"
 *                       exercises: []
 *                   currentChapter:
 *                     chapterId: "chapter_123"
 *                     progress: 50
 *                     lastAccessed: "2024-01-15T10:30:00Z"
 *                   currentUnit:
 *                     unitId: "unit_456"
 *                     progress: 75
 *                     lastAccessed: "2024-01-15T10:30:00Z"
 *                   currentLesson:
 *                     lessonId: "lesson_789"
 *                     progress: 25
 *                     lastAccessed: "2024-01-15T10:30:00Z"
 *                   language:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     name: "Spanish"
 *                     imageUrl: "https://example.com/spanish.jpg"
 *                     baseLanguage: "English"
 *                     nativeName: "Español"
 *                     flag: "🇪🇸"
 *                     isCompleted: false
 *                     isActive: true
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   error: "Unauthorized"
 *       '500':
 *         description: Internal server error - Missing languageId or fetch failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingLanguageExample:
 *                 value:
 *                   error: "language not found"
 *               serverErrorExample:
 *                 value:
 *                   error: "Failed to fetch languages"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Exercise:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique exercise identifier
 *         type:
 *           type: string
 *           enum: [multiple_choice, fill_blank, translation, listening, speaking]
 *           description: Type of exercise
 *         instruction:
 *           type: string
 *           description: Exercise instruction text
 *         sourceText:
 *           type: string
 *           description: Source text for translation exercises
 *         sourceLanguage:
 *           type: string
 *           description: Source language code
 *         targetLanguage:
 *           type: string
 *           description: Target language code
 *         correctAnswer:
 *           type: string
 *           description: The correct answer for the exercise
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Multiple choice options
 *         isNewWord:
 *           type: boolean
 *           description: Whether this introduces a new word
 *         audioUrl:
 *           type: string
 *           format: uri
 *           description: URL to audio file for listening exercises
 *         neutralAnswerImage:
 *           type: string
 *           format: uri
 *           description: Image shown for neutral feedback
 *         badAnswerImage:
 *           type: string
 *           format: uri
 *           description: Image shown for incorrect answers
 *         correctAnswerImage:
 *           type: string
 *           format: uri
 *           description: Image shown for correct answers
 *         isActive:
 *           type: boolean
 *           description: Whether the exercise is active
 *         order:
 *           type: integer
 *           description: Display order within the lesson
 *
 *     Lesson:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique lesson identifier
 *         title:
 *           type: string
 *           description: Lesson title
 *         chapterId:
 *           type: string
 *           format: objectId
 *           description: Parent chapter ID
 *         unitId:
 *           type: string
 *           format: objectId
 *           description: Parent unit ID
 *         description:
 *           type: string
 *           description: Lesson description
 *         isPremium:
 *           type: boolean
 *           description: Whether lesson requires premium access
 *         isCompleted:
 *           type: boolean
 *           description: Whether user has completed this lesson
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: Lesson thumbnail image
 *         xpReward:
 *           type: integer
 *           minimum: 0
 *           description: XP points awarded for completion
 *         order:
 *           type: integer
 *           description: Display order within the unit
 *         exercises:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Exercise'
 *           description: List of exercises in this lesson
 *
 *     Unit:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique unit identifier
 *         title:
 *           type: string
 *           description: Unit title
 *         description:
 *           type: string
 *           description: Unit description
 *         isPremium:
 *           type: boolean
 *           description: Whether unit requires premium access
 *         isCompleted:
 *           type: boolean
 *           description: Whether user has completed this unit
 *         color:
 *           type: string
 *           description: CSS color class for UI theming
 *           example: "bg-[#ff2dbd]"
 *         isExpanded:
 *           type: boolean
 *           description: Whether unit is expanded in UI
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: Unit thumbnail image
 *         order:
 *           type: integer
 *           description: Display order within the chapter
 *         lessons:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lesson'
 *           description: List of lessons in this unit
 *
 *     Chapter:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique chapter identifier
 *         title:
 *           type: string
 *           description: Chapter title
 *         isPremium:
 *           type: boolean
 *           description: Whether chapter requires premium access
 *         isCompleted:
 *           type: boolean
 *           description: Whether user has completed this chapter
 *         isExpanded:
 *           type: boolean
 *           description: Whether chapter is expanded in UI
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: Chapter thumbnail image
 *         order:
 *           type: integer
 *           description: Display order within the language
 *         description:
 *           type: string
 *           description: Chapter description
 *         units:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Unit'
 *           description: List of units in this chapter
 *
 *     ProgressData:
 *       type: object
 *       properties:
 *         chapterId:
 *           type: string
 *           format: objectId
 *           description: Current chapter ID
 *         unitId:
 *           type: string
 *           format: objectId
 *           description: Current unit ID
 *         lessonId:
 *           type: string
 *           format: objectId
 *           description: Current lesson ID
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Progress percentage
 *         lastAccessed:
 *           type: string
 *           format: date-time
 *           description: Last access timestamp
 *
 *     Language:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique language identifier
 *         name:
 *           type: string
 *           description: Language name in English
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: Language flag or icon image
 *         baseLanguage:
 *           type: string
 *           description: Base language for learning (usually English)
 *         nativeName:
 *           type: string
 *           description: Language name in its native script
 *         flag:
 *           type: string
 *           description: Country flag emoji
 *         isCompleted:
 *           type: boolean
 *           description: Whether user has completed this language
 *         isActive:
 *           type: boolean
 *           description: Whether language is currently active
 *
 *     LanguageContentResponse:
 *       type: object
 *       properties:
 *         chapters:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Chapter'
 *           description: Complete chapter hierarchy for the language
 *         lessonContents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lesson'
 *           description: Flattened list of all lessons in the language
 *         currentChapter:
 *           $ref: '#/components/schemas/ProgressData'
 *           description: User's current chapter progress
 *         currentUnit:
 *           $ref: '#/components/schemas/ProgressData'
 *           description: User's current unit progress
 *         currentLesson:
 *           $ref: '#/components/schemas/ProgressData'
 *           description: User's current lesson progress
 *         language:
 *           $ref: '#/components/schemas/Language'
 *           description: Language metadata
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *
 *   examples:
 *     LanguageContentUsageExample:
 *       summary: How to use the Language Content API
 *       description: |
 *         **Step 1: Fetch Language Content**
 *         ```javascript
 *         const languageId = '507f1f77bcf86cd799439011';
 *         const response = await fetch(`/api/language-content?languageId=${languageId}`, {
 *           method: 'GET',
 *           headers: {
 *             'Authorization': 'Bearer YOUR_TOKEN_HERE'
 *           }
 *         });
 *
 *         const languageData = await response.json();
 *         console.log('Language structure:', languageData);
 *         ```
 *
 *         **Step 2: Navigate the Content Structure**
 *         ```javascript
 *         // Access chapters
 *         languageData.chapters.forEach(chapter => {
 *           console.log(`Chapter: ${chapter.title}`);
 *
 *           // Access units within chapter
 *           chapter.units.forEach(unit => {
 *             console.log(`  Unit: ${unit.title}`);
 *
 *             // Access lessons within unit
 *             unit.lessons.forEach(lesson => {
 *               console.log(`    Lesson: ${lesson.title} (${lesson.exercises.length} exercises)`);
 *             });
 *           });
 *         });
 *         ```
 *
 *         **Step 3: Track User Progress**
 *         ```javascript
 *         const { currentChapter, currentUnit, currentLesson } = languageData;
 *
 *         console.log('Current Progress:');
 *         console.log(`Chapter: ${currentChapter?.progress}%`);
 *         console.log(`Unit: ${currentUnit?.progress}%`);
 *         console.log(`Lesson: ${currentLesson?.progress}%`);
 *         ```
 *
 *     ReactLanguageViewerExample:
 *       summary: React component for displaying language content
 *       description: |
 *         ```typescript
 *         import { useState, useEffect } from 'react';
 *
 *         interface LanguageContentProps {
 *           languageId: string;
 *         }
 *
 *         export function LanguageContentViewer({ languageId }: LanguageContentProps) {
 *           const [content, setContent] = useState(null);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState(null);
 *
 *           useEffect(() => {
 *             const fetchContent = async () => {
 *               try {
 *                 setLoading(true);
 *                 const response = await fetch(`/api/language-content?languageId=${languageId}`);
 *
 *                 if (!response.ok) {
 *                   throw new Error('Failed to fetch language content');
 *                 }
 *
 *                 const data = await response.json();
 *                 setContent(data);
 *               } catch (err) {
 *                 setError(err.message);
 *               } finally {
 *                 setLoading(false);
 *               }
 *             };
 *
 *             if (languageId) {
 *               fetchContent();
 *             }
 *           }, [languageId]);
 *
 *           if (loading) return <div>Loading language content...</div>;
 *           if (error) return <div>Error: {error}</div>;
 *           if (!content) return <div>No content available</div>;
 *
 *           return (
 *             <div className="language-content">
 *               <div className="language-header">
 *                 <h1>{content.language.flag} {content.language.name}</h1>
 *                 <p>{content.language.nativeName}</p>
 *               </div>
 *
 *               <div className="progress-summary">
 *                 <h2>Your Progress</h2>
 *                 <div className="progress-bars">
 *                   <div>Chapter: {content.currentChapter?.progress || 0}%</div>
 *                   <div>Unit: {content.currentUnit?.progress || 0}%</div>
 *                   <div>Lesson: {content.currentLesson?.progress || 0}%</div>
 *                 </div>
 *               </div>
 *
 *               <div className="chapters">
 *                 {content.chapters.map(chapter => (
 *                   <div key={chapter._id} className="chapter">
 *                     <h3>{chapter.title}</h3>
 *                     <div className="units">
 *                       {chapter.units.map(unit => (
 *                         <div key={unit._id} className="unit">
 *                           <h4>{unit.title}</h4>
 *                           <div className="lessons">
 *                             {unit.lessons.map(lesson => (
 *                               <div key={lesson._id} className="lesson">
 *                                 <span>{lesson.title}</span>
 *                                 <span>{lesson.isCompleted ? '✅' : '⏳'}</span>
 *                                 <span>{lesson.xpReward} XP</span>
 *                               </div>
 *                             ))}
 *                           </div>
 *                         </div>
 *                       ))}
 *                     </div>
 *                   </div>
 *                 ))}
 *               </div>
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Language Content
 *     description: Operations related to language learning content structure and user progress
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const languageId = searchParams.get("languageId");

    if (!languageId) {
      return NextResponse.json(
        { error: "language not found " },
        { status: 500 }
      );
    }
    const lesson = await Lesson.getFirstLessonByLanguage(languageId);

    await UserProgress.findOneAndUpdate(
      {
        userId,
        languageId,
        "currentLesson.lessonId": { $exists: false },
      },
      {
        $set: {
          currentLesson: {
            lessonId: lesson?._id,
            progress: 0,
            lastAccessed: new Date(),
          },
        },
      },
      { new: true }
    );

    const userCountStats = await UserProgress.getUserCountPerLanguage();

    // Step 2: Convert stats array to a dictionary for fast lookup
    const userCountMap = userCountStats.reduce((acc, lang) => {
      acc[lang.languageId] = lang.userCount;
      return acc;
    }, {} as Record<string, number>);

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
      educationalFocus: metadata?.educationalFocus ?? null,
      difficultyLevel: metadata?.difficultyLevel ?? "beginner",
    });

    const normalizeLanguage = (language: any) => ({
      ...language,
      category: language.category ?? "language_learning",
      themeMetadata: normalizeThemeMetadata(language.themeMetadata),
    });

    const languagesFromDb = await Language.find().lean();
    const languages = languagesFromDb.map(normalizeLanguage);

    // Get all UserProgress for user and languages
    const userProgressList = await UserProgress.find({
      userId: userId,
      languageId: { $in: languages.map((lang) => lang._id) },
    }).lean();

    const normalizeProgress = (progress: any) => ({
      ...progress,
      valuePoints: {
        patience: 0,
        gratitude: 0,
        kindness: 0,
        honesty: 0,
        sharing: 0,
        mercy: 0,
        justice: 0,
        respect: 0,
        ...(progress?.valuePoints ?? {}),
      },
      dailyLimits: {
        minutesAllowed: progress?.dailyLimits?.minutesAllowed ?? 0,
        minutesUsed: progress?.dailyLimits?.minutesUsed ?? 0,
        lastResetAt: progress?.dailyLimits?.lastResetAt ?? null,
      },
      parentalControls: {
        enabled: progress?.parentalControls?.enabled ?? false,
        guardianContact: progress?.parentalControls?.guardianContact ?? "",
      },
    });
    const normalizedProgressList = userProgressList.map(normalizeProgress);

    // Define the type for progressMap

    const progressMap: Record<string, UserProgressType> = {};
    normalizedProgressList.forEach((progress) => {
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

                const lessons = await Lesson.find({
                  unitId: unit._id,
                  isActive: true,
                  // isTest: { $ne: true },
                });

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
                      _id: lesson._id,
                      title: lesson.title,
                      chapterId: lesson.chapterId,
                      unitId: lesson.unitId,
                      description: lesson.description || "",
                      isPremium: lesson.isPremium || false,
                      isCompleted: isLessonCompleted,
                      imageUrl: lesson.imageUrl || "",
                      xpReward: lesson.xpReward || 10,
                      order: lesson.order || 10,
                      moralLesson: chapter.moralLesson || null,
                      miniGame: chapter.miniGame || null,
                      storyPages: lesson.storyPages || [],
                      storyMetadata: lesson.storyMetadata || null,
                      exercises: formattedExercises,
                    };
                  })
                );

                return {
                  _id: unit._id,
                  title: unit.title,
                  description: unit.description || "",
                  isPremium: unit.isPremium || false,
                  isCompleted: isUnitCompleted,
                  color: unit.color || "bg-[#ff2dbd]",
                  isExpanded: true,
                  imageUrl: unit.imageUrl || "",
                  order: unit.order || 0,
                  lessons: formattedLessons,
                };
              })
            );

            return {
              _id: chapter._id,
              title: chapter.title,
              isPremium: chapter.isPremium || false,
              isCompleted: isChapterCompleted,
              isExpanded: true,
              imageUrl: chapter.imageUrl || "",
              order: chapter.order || 0,
              description: chapter.description,
              contentType: chapter.contentType || "lesson",
              moralLesson: chapter.moralLesson || null,
              miniGame: chapter.miniGame || null,
              units: formattedUnits,
            };
          })
        );

        return {
          _id: language._id,
          name: language.name,
          imageUrl: language.imageUrl,
          baseLanguage: language.baseLanguage,
          nativeName: language.nativeName,
          flag: language.flag,
          isCompleted: isLanguageCompleted,
          isActive: language.isActive,
          category: language.category,
          themeMetadata: language.themeMetadata,
          userCount: userCountMap[language._id.toString()] || 0,
          chapters: formattedChapters,
        };
      })
    );

    const specificLanguage = lessons.find(
      (lang) => lang._id.toString() === languageId
    );

    const lessonsForLanguage = specificLanguage
      ? specificLanguage.chapters.flatMap((chapter) =>
          chapter.units.flatMap((unit) => unit.lessons)
        )
      : [];

    const currentProgressData = await UserProgress.getCurrentProgressData(
      userId,
      languageId
    );

    const filterChapters = lessons.filter(
      (l) => l._id.toString() === languageId
    );

    return NextResponse.json(
      {
        chapters: filterChapters[0].chapters,
        lessonContents: lessonsForLanguage,
        currentChapter: currentProgressData?.currentChapter,
        currentUnit: currentProgressData?.currentUnit,
        currentLesson: currentProgressData?.currentLesson,
        valuePoints: currentProgressData?.valuePoints,
        dailyLimits: currentProgressData?.dailyLimits,
        parentalControls: currentProgressData?.parentalControls,
        language: {
          _id: specificLanguage?._id,
          name: specificLanguage?.name,
          imageUrl: specificLanguage?.imageUrl,
          baseLanguage: specificLanguage?.baseLanguage,
          nativeName: specificLanguage?.nativeName,
          flag: specificLanguage?.flag,
          isCompleted: specificLanguage?.isCompleted,
          isActive: specificLanguage?.isActive,
          category: specificLanguage?.category,
          themeMetadata: specificLanguage?.themeMetadata,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { error: "Failed to fetch languages" },
      { status: 500 }
    );
  }
}

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
