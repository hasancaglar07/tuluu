import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";
import { LanguageSchema } from "@/lib/validations/language";
import Language from "@/models/Language";

/**
 * @swagger
 * tags:
 *   - name: Language
 *     description: Manage languages in the App
 * /api/languages/{id}:
 *   get:
 *     summary: Get a language by ID
 *     description: Retrieves a single language by its unique ID.
 *     tags: [Language]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the language to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Language found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Language'
 *       404:
 *         description: Language not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/languages/{id}:
 *   put:
 *     summary: Update a language by ID
 *     description: Updates the details of a language.
 *     tags: [Language]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the language to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LanguageInput'
 *     responses:
 *       200:
 *         description: Language updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Language'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: Language not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/languages/{id}:
 *   delete:
 *     summary: Disable a language by ID
 *     description: Disables a language instead of deleting it permanently.
 *     tags: [Language]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the language to disable
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Language disabled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 language:
 *                   $ref: '#/components/schemas/Language'
 *       404:
 *         description: Language not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/NotFound'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   responses:
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Resource not found"
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
    const language = await Language.findById(id);

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(language, { status: 200 });
  } catch (error) {
    console.error("Error fetching language:", error);
    return NextResponse.json(
      { error: "Failed to fetch language" },
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
    const validatedFields = LanguageSchema.safeParse(body);
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Invalid data",
          errors: validatedFields.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    await connectDB();

    // 🛠️ Update language
    const updated = await Language.findOneAndUpdate(
      { _id: id },
      validatedFields.data,
      {
        new: true,
      }
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: true,
        data: {
          name: updated?.name,
          baseLanguage: updated?.baseLanguage,
          isActive: updated?.isActive,
          flag: updated?.flag,
          nativeName: updated?.nativeName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating language:", error);
    return NextResponse.json(
      { error: "Failed to update language" },
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

    // Instead of deleting, disable the language
    const language = await Language.disableById(id);

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Language disabled successfully", language },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error disabling language:", error);
    return NextResponse.json(
      { error: "Failed to disable language" },
      { status: 500 }
    );
  }
}
