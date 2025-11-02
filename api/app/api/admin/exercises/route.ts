/**
 * @swagger
 * components:
 *   schemas:
 *     Exercise:
 *       type: object
 *       required:
 *         - title
 *         - type
 *         - content
 *         - order
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the exercise
 *         title:
 *           type: string
 *           description: Title of the exercise
 *         type:
 *           type: string
 *           enum: [multiple_choice, fill_in_the_blank, listening, speaking, matching]
 *           description: Type of the exercise
 *         content:
 *           type: object
 *           description: Content details specific to the exercise type
 *         order:
 *           type: integer
 *           description: Order in which the exercise appears
 *         isActive:
 *           type: boolean
 *           description: Whether the exercise is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date the exercise was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date the exercise was last updated
 *     ExerciseInput:
 *       type: object
 *       required:
 *         - title
 *         - type
 *         - content
 *       properties:
 *         title:
 *           type: string
 *         type:
 *           type: string
 *           enum: [multiple_choice, fill_in_the_blank, listening, speaking, matching]
 *         content:
 *           type: object
 *         isActive:
 *           type: boolean
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *
 * /api/exercises:
 *   get:
 *     summary: Get all exercises
 *     description: Returns a list of all language learning exercises.
 *     tags:
 *       - Exercises
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of exercises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exercise'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   post:
 *     summary: Create a new exercise
 *     description: Creates a new language learning exercise
 *     tags:
 *       - Exercises
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExerciseInput'
 *     responses:
 *       201:
 *         description: Exercise created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exercise'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Failed to create exercise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";
import Exercise from "@/models/Exercise";
import { exerciseSchema } from "@/lib/validations/exercise";

export async function GET() {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    await connectDB();
    const languages = await Exercise.find({});

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

    const validated = exerciseSchema.safeParse(body);
    if (!validated.success) {
      return Response.json(
        {
          message: "validation error",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Determine next order
    const maxOrderUnit = await Exercise.findOne()
      .sort({ order: -1 })
      .select("order")
      .lean();

    const nextOrder = maxOrderUnit ? maxOrderUnit.order + 1 : 1;

    const newExercise = new Exercise({
      ...validated.data,
      order: nextOrder,
      isActive:
        validated.data.isActive !== undefined ? validated.data.isActive : true,
    });

    await newExercise.save();

    return NextResponse.json(
      { status: true, data: { _id: newExercise._id, ...validated.data } },
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
