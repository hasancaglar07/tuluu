import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { auth } from "@clerk/nextjs/server";
import Lesson from "@/models/Lesson";
import { authGuard } from "@/lib/utils";
import { LessonSchema } from "@/lib/validations/lesson";
import { ExerciseResponse } from "@/types";
import Exercise from "@/models/Exercise";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Get a specific lesson and its exercises
 *     tags: [Lesson]
 *     description: Retrieves a lesson by ID along with its associated exercises.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The lesson ID
 *     responses:
 *       200:
 *         description: Lesson and exercises retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonWithExercises'
 *       400:
 *         description: Invalid lesson ID format
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Lesson not found or internal error
 *
 *   put:
 *     summary: Update a specific lesson
 *     tags: [Lesson]
 *     description: Validates and updates a lesson by ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonInput'
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Lesson not found or internal error
 *
 *   delete:
 *     summary: Soft delete (disable) a specific lesson
 *     description: Disables a lesson by setting a flag instead of permanently deleting it.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The lesson ID
 *     responses:
 *       200:
 *         description: Lesson disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 lesson:
 *                   $ref: '#/components/schemas/Lesson'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Lesson not found or internal error
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
 *
 *     Lesson:
 *       allOf:
 *         - $ref: '#/components/schemas/LessonInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *             order:
 *               type: number
 *
 *     Exercise:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         type:
 *           type: string
 *         instruction:
 *           type: string
 *         sourceText:
 *           type: string
 *         sourceLanguage:
 *           type: string
 *         targetLanguage:
 *           type: string
 *         correctAnswer:
 *           type: string
 *         options:
 *           type: array
 *           items:
 *             type: string
 *         isNewWord:
 *           type: boolean
 *         audioUrl:
 *           type: string
 *         neutralAnswerImage:
 *           type: string
 *         badAnswerImage:
 *           type: string
 *         correctAnswerImage:
 *           type: string
 *         isActive:
 *           type: boolean
 *         order:
 *           type: number
 *
 *     LessonWithExercises:
 *       allOf:
 *         - $ref: '#/components/schemas/Lesson'
 *         - type: object
 *           properties:
 *             exercises:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exercise'
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid lesson ID format" },
        { status: 400 }
      );
    }
    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return NextResponse.json(
        { message: "Lesson not found" },
        { status: 500 }
      );
    }

    const exercises = await Exercise.find({ lessonId: id });

    const response = {
      _id: lesson._id, // or use a custom format
      title: lesson.title,
      chapterId: lesson.chapterId,
      languageId: lesson.languageId,
      unitId: lesson.unitId,
      lessonId: lesson._id,
      totalXp: lesson.xpReward,
      isPremium: lesson.isPremium,
      description: lesson.description,
      exercises: exercises.map((ex: ExerciseResponse) => ({
        _id: ex._id,
        type: ex.type,
        instruction: ex.instruction,
        sourceText: ex.sourceText,
        sourceLanguage: ex.sourceLanguage,
        targetLanguage: ex.targetLanguage,
        correctAnswer: ex.correctAnswer,
        options: ex.options,
        isNewWord: ex.isNewWord,
        audioUrl: ex.audioUrl,
        neutralAnswerImage: ex.neutralAnswerImage,
        badAnswerImage: ex.badAnswerImage,
        correctAnswerImage: ex.correctAnswerImage,
        isActive: ex.isActive,
        order: ex.order,
      })),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
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
    const validated = LessonSchema.safeParse(data);
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

    const lesson = await Lesson.findById({ _id: id });
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 500 });
    }

    const checkOrder = await Lesson.findOne({
      order: validated.data?.order,
      _id: { $ne: id }, // Exclude current lesson
      unitId: validated.data?.unitId,
    });

    if (checkOrder) {
      return NextResponse.json(
        {
          message: `Order ${data?.order} is already taken by a Lesson for this unit`,
        },
        { status: 400 }
      );
    }

    // 🛠️ Update language
    const updated = await Lesson.findOneAndUpdate({ _id: id }, validated.data, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "lesson not saved" }, { status: 500 });
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
    const lesson = await Lesson.disableById(id);

    if (!lesson) {
      return NextResponse.json({ error: "Unit not found" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Unit disabled successfully", lesson },
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
