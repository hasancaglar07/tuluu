import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";
import { exerciseSchema } from "@/lib/validations/exercise";
import Exercise from "@/models/Exercise";

/**
 * @swagger
 * /api/admin/exercises/{id}:
 *   get:
 *     summary: Get a exercise by ID
 *     tags: [Exercises]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exercise details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Exercise not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a exercise
 *     tags: [Exercises]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               nativeName:
 *                 type: string
 *               flag:
 *                 type: string
 *               baseExercise:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Exercise updated
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Exercise not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a exercise
 *     tags: [Exercises]
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exercise deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Exercise not found
 *       500:
 *         description: Server error
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    const { id } = await params;

    await connectDB();
    const exercise = await Exercise.findById(id);

    if (!exercise) {
      return NextResponse.json(
        { error: "Egzersiz bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(exercise, { status: 200 });
  } catch (error) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json(
      { error: "Egzersiz getirilemedi" },
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
    const body = await req.json();

    // ✅ Zod validation
    const validatedFields = exerciseSchema.safeParse(body);
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Geçersiz veri",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 500 }
      );
    }

    await connectDB();

    // 🛠️ Update exercise
    const updated = await Exercise.findOneAndUpdate(
      { _id: id },
      validatedFields.data,
      {
        new: true,
      }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Egzersiz bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        data: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating exercise:", error);
    return NextResponse.json(
      { error: "Egzersiz güncellenemedi" },
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

    // Permanently delete the exercise (hard delete)
    const exercise = await Exercise.findByIdAndDelete(id);

    if (!exercise) {
      return NextResponse.json(
        { error: "Egzersiz bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Egzersiz başarıyla silindi", exercise },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error disabling exercise:", error);
    return NextResponse.json(
      { error: "Egzersiz devre dışı bırakılamadı" },
      { status: 500 }
    );
  }
}
