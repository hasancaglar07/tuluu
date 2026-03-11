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

const STRUCTURE_CACHE_TTL_MS = 3 * 60 * 1000;

type LanguageStructureCacheValue = {
  expiresAt: number;
  chapters: any[];
  units: any[];
  lessons: any[];
  exercises: any[];
};

const DEFAULT_VALUE_POINTS = {
  patience: 0,
  gratitude: 0,
  kindness: 0,
  honesty: 0,
  sharing: 0,
  mercy: 0,
  justice: 0,
  respect: 0,
};

const DEFAULT_DAILY_LIMITS = {
  minutesAllowed: 0,
  minutesUsed: 0,
  lastResetAt: null as Date | null,
};

const DEFAULT_PARENTAL_CONTROLS = {
  enabled: false,
  guardianContact: "",
};

const globalForLanguageStructureCache = globalThis as typeof globalThis & {
  _languageStructureCache?: Map<string, LanguageStructureCacheValue>;
};

const languageStructureCache =
  globalForLanguageStructureCache._languageStructureCache ?? new Map();

globalForLanguageStructureCache._languageStructureCache =
  languageStructureCache;

const getCachedLanguageStructure = async (languageId: string) => {
  const now = Date.now();
  const cached = languageStructureCache.get(languageId);

  if (cached && cached.expiresAt > now) {
    return {
      chapters: cached.chapters,
      units: cached.units,
      lessons: cached.lessons,
      exercises: cached.exercises,
    };
  }

  const [chapters, units, lessons, exercises] = await Promise.all([
    Chapter.find({ languageId })
      .select(
        "_id title isPremium imageUrl order description contentType moralLesson miniGame"
      )
      .sort({ order: 1 })
      .lean(),
    Unit.find({ languageId })
      .select("_id chapterId title description isPremium color imageUrl order")
      .sort({ order: 1 })
      .lean(),
    Lesson.find({ languageId, isActive: true })
      .select(
        "_id title chapterId unitId description isPremium imageUrl xpReward order storyPages storyMetadata"
      )
      .sort({ order: 1 })
      .lean(),
    Exercise.find({ languageId, isActive: true })
      .select(
        "_id lessonId type instruction sourceText sourceLanguage targetLanguage correctAnswer options isNewWord audioUrl neutralAnswerImage badAnswerImage correctAnswerImage isActive order educationContent mediaPack hoverHint answerAudioUrl ttsVoiceId autoRevealMilliseconds"
      )
      .sort({ order: 1 })
      .lean(),
  ]);

  languageStructureCache.set(languageId, {
    expiresAt: now + STRUCTURE_CACHE_TTL_MS,
    chapters,
    units,
    lessons,
    exercises,
  });

  return { chapters, units, lessons, exercises };
};
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
 *           enum: [multiple_choice, fill_blank, translation, listening]
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
        { error: "languageId is required" },
        { status: 400 }
      );
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
      educationalFocus: metadata?.educationalFocus ?? null,
      difficultyLevel: metadata?.difficultyLevel ?? "beginner",
    });

    const normalizeLanguage = (language: any) => ({
      ...language,
      category: language.category ?? "language_learning",
      themeMetadata: normalizeThemeMetadata(language.themeMetadata),
    });

    const [languageDoc, progressDoc, structure] = await Promise.all([
      Language.findById(languageId)
        .select(
          "_id name imageUrl baseLanguage nativeName flag isActive category themeMetadata"
        )
        .lean(),
      UserProgress.findOne({ userId, languageId })
        .select(
          "isCompleted completedChapters completedUnits completedLessons currentLesson valuePoints dailyLimits parentalControls"
        )
        .lean(),
      getCachedLanguageStructure(languageId),
    ]);

    if (!languageDoc) {
      return NextResponse.json({ error: "Language not found" }, { status: 404 });
    }

    const { chapters, units, lessons, exercises } = structure;
    const sortByOrder = (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0);

    const unitsByChapter = new Map<string, any[]>();
    units.forEach((unit) => {
      const key = unit.chapterId.toString();
      if (!unitsByChapter.has(key)) {
        unitsByChapter.set(key, []);
      }
      unitsByChapter.get(key)?.push(unit);
    });

    const lessonsByUnit = new Map<string, any[]>();
    lessons.forEach((lessonItem) => {
      const key = lessonItem.unitId.toString();
      if (!lessonsByUnit.has(key)) {
        lessonsByUnit.set(key, []);
      }
      lessonsByUnit.get(key)?.push(lessonItem);
    });

    const exercisesByLesson = new Map<string, any[]>();
    exercises.forEach((exercise) => {
      const key = exercise.lessonId.toString();
      if (!exercisesByLesson.has(key)) {
        exercisesByLesson.set(key, []);
      }
      exercisesByLesson.get(key)?.push(exercise);
    });

    const completedChapterIds = new Set(
      (progressDoc?.completedChapters ?? []).map((item: any) =>
        item.chapterId?.toString()
      )
    );
    const completedUnitIds = new Set(
      (progressDoc?.completedUnits ?? []).map((item: any) =>
        item.unitId?.toString()
      )
    );
    const completedLessonIds = new Set(
      (progressDoc?.completedLessons ?? []).map((item: any) =>
        item.lessonId?.toString()
      )
    );

    const chapterById = new Map<string, any>();
    chapters.forEach((chapter) => {
      chapterById.set(chapter._id.toString(), chapter);
    });

    const unitById = new Map<string, any>();
    units.forEach((unit) => {
      unitById.set(unit._id.toString(), unit);
    });

    const lessonById = new Map<string, any>();
    lessons.forEach((lessonItem) => {
      lessonById.set(lessonItem._id.toString(), lessonItem);
    });

    const formattedChapters = chapters.map((chapter) => {
      const chapterUnits = (
        unitsByChapter.get(chapter._id.toString()) ?? []
      ).sort(sortByOrder);

      const formattedUnits = chapterUnits.map((unit) => {
        const unitLessons = (
          lessonsByUnit.get(unit._id.toString()) ?? []
        ).sort(sortByOrder);
        const formattedLessons = unitLessons.map((lessonItem) => {
          const lessonExercises = (
            exercisesByLesson.get(lessonItem._id.toString()) ?? []
          ).sort(sortByOrder);

          const formattedExercises = lessonExercises.map((exercise) => ({
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
            educationContent: (exercise as any).educationContent ?? null,
            mediaPack: (exercise as any).mediaPack ?? null,
            hoverHint: (exercise as any).hoverHint ?? null,
            answerAudioUrl: (exercise as any).answerAudioUrl ?? "",
            ttsVoiceId: (exercise as any).ttsVoiceId ?? "",
            autoRevealMilliseconds:
              (exercise as any).autoRevealMilliseconds ?? null,
          }));

          return {
            _id: lessonItem._id,
            title: lessonItem.title,
            chapterId: lessonItem.chapterId,
            unitId: lessonItem.unitId,
            description: lessonItem.description || "",
            isPremium: lessonItem.isPremium || false,
            isCompleted: completedLessonIds.has(lessonItem._id.toString()),
            imageUrl: lessonItem.imageUrl || "",
            xpReward: lessonItem.xpReward || 10,
            order: lessonItem.order || 10,
            moralLesson: chapter.moralLesson || null,
            miniGame: chapter.miniGame || null,
            storyPages: lessonItem.storyPages || [],
            storyMetadata: lessonItem.storyMetadata || null,
            exercises: formattedExercises,
          };
        });

        return {
          _id: unit._id,
          title: unit.title,
          description: unit.description || "",
          isPremium: unit.isPremium || false,
          isCompleted: completedUnitIds.has(unit._id.toString()),
          color: unit.color || "bg-[#ff2dbd]",
          isExpanded: true,
          imageUrl: unit.imageUrl || "",
          order: unit.order || 0,
          lessons: formattedLessons,
        };
      });

      return {
        _id: chapter._id,
        title: chapter.title,
        isPremium: chapter.isPremium || false,
        isCompleted: completedChapterIds.has(chapter._id.toString()),
        isExpanded: true,
        imageUrl: chapter.imageUrl || "",
        order: chapter.order || 0,
        description: chapter.description,
        contentType: chapter.contentType || "lesson",
        moralLesson: chapter.moralLesson || null,
        miniGame: chapter.miniGame || null,
        units: formattedUnits,
      };
    });

    const progressCurrentLessonId =
      progressDoc?.currentLesson?.lessonId?.toString() ?? null;

    let currentLesson = progressCurrentLessonId
      ? lessonById.get(progressCurrentLessonId) ?? null
      : null;

    if (!currentLesson) {
      for (const chapter of chapters) {
        const chapterUnits =
          unitsByChapter.get(chapter._id.toString())?.sort(sortByOrder) ?? [];

        for (const unit of chapterUnits) {
          const unitLessons =
            lessonsByUnit.get(unit._id.toString())?.sort(sortByOrder) ?? [];

          const firstUncompleted = unitLessons.find(
            (lessonItem) => !completedLessonIds.has(lessonItem._id.toString())
          );

          if (firstUncompleted) {
            currentLesson = firstUncompleted;
            break;
          }
        }

        if (currentLesson) {
          break;
        }
      }
    }

    if (!currentLesson) {
      currentLesson = lessons[0] ?? null;
    }

    const currentUnit = currentLesson
      ? unitById.get(currentLesson.unitId?.toString()) ?? null
      : units[0] ?? null;

    const currentChapter = currentUnit
      ? chapterById.get(currentUnit.chapterId?.toString()) ?? null
      : chapters[0] ?? null;

    const normalizedValuePoints = {
      ...DEFAULT_VALUE_POINTS,
      ...(progressDoc?.valuePoints ?? {}),
    };

    const normalizedDailyLimits = {
      ...DEFAULT_DAILY_LIMITS,
      ...(progressDoc?.dailyLimits ?? {}),
    };

    const normalizedParentalControls = {
      ...DEFAULT_PARENTAL_CONTROLS,
      ...(progressDoc?.parentalControls ?? {}),
    };

    const normalizedLanguage = normalizeLanguage(languageDoc);
    const specificLanguage = {
      _id: normalizedLanguage._id,
      name: normalizedLanguage.name,
      imageUrl: normalizedLanguage.imageUrl,
      baseLanguage: normalizedLanguage.baseLanguage,
      nativeName: normalizedLanguage.nativeName,
      flag: normalizedLanguage.flag,
      isCompleted: progressDoc?.isCompleted || false,
      isActive: normalizedLanguage.isActive,
      category: normalizedLanguage.category,
      themeMetadata: normalizedLanguage.themeMetadata,
      chapters: formattedChapters,
    };

    const lessonsForLanguage = formattedChapters.flatMap((chapter) =>
      chapter.units.flatMap((unit) => unit.lessons)
    );

    return NextResponse.json(
      {
        chapters: specificLanguage.chapters,
        lessonContents: lessonsForLanguage,
        currentChapter: currentChapter,
        currentUnit: currentUnit,
        currentLesson: currentLesson,
        valuePoints: normalizedValuePoints,
        dailyLimits: normalizedDailyLimits,
        parentalControls: normalizedParentalControls,
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
