import connectDB from "@/lib/db/connect";
import { seoUpdateSchema } from "@/lib/validations/seo";
import { SEO } from "@/models/Seo";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/admin/seo/{id}:
 *   get:
 *     tags:
 *       - SEO
 *     summary: Get SEO entry by ID (admin only)
 *     description: Retrieves a specific SEO entry by its ID
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The SEO entry ID
 *     responses:
 *       200:
 *         description: SEO entry retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 path:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 ogImage:
 *                   type: string
 *                 canonicalUrl:
 *                   type: string
 *                 locale:
 *                   type: string
 *                 robots:
 *                   type: string
 *                 structuredData:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 lastModified:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: SEO entry not found
 *       500:
 *         description: Internal server error
 *   put:
 *     tags:
 *       - SEO
 *     summary: Update SEO entry by ID (admin only)
 *     description: Updates a specific SEO entry by its ID
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The SEO entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - locale
 *               - robots
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 60
 *                 description: The page title
 *               description:
 *                 type: string
 *                 maxLength: 160
 *                 description: The meta description
 *               ogImage:
 *                 type: string
 *                 format: uri
 *                 description: The Open Graph image URL
 *               canonicalUrl:
 *                 type: string
 *                 format: uri
 *                 description: The canonical URL
 *               locale:
 *                 type: string
 *                 description: The locale (e.g., en, fr)
 *               robots:
 *                 type: string
 *                 description: The robots meta tag content
 *               structuredData:
 *                 type: string
 *                 description: JSON-LD structured data
 *     responses:
 *       200:
 *         description: SEO entry updated successfully
 *       400:
 *         description: Bad request - Validation error or duplicate entry
 *       404:
 *         description: SEO entry not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - SEO
 *     summary: Delete SEO entry by ID (admin only)
 *     description: Deletes a specific SEO entry by its ID
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The SEO entry ID
 *     responses:
 *       200:
 *         description: SEO entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: SEO entry not found
 *       500:
 *         description: Internal server error
 */

// Schema for validating SEO entry updates

// GET handler to fetch a specific SEO entry by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    // Find the SEO entry by ID
    const seoEntry = await SEO.findById(id);

    if (!seoEntry) {
      return NextResponse.json(
        { message: "SEO entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(seoEntry);
  } catch (error) {
    console.error("Error fetching SEO entry:", error);
    return NextResponse.json(
      { message: "Failed to fetch SEO entry" },
      { status: 500 }
    );
  }
}

// PUT handler to update a specific SEO entry
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate the request body against the schema
    const validatedData = seoUpdateSchema.parse(body);

    await connectDB();

    // Find the SEO entry by ID
    const seoEntry = await SEO.findById(id);

    if (!seoEntry) {
      return NextResponse.json(
        { message: "SEO entry not found" },
        { status: 404 }
      );
    }

    // Check if another entry with the same path and locale exists (excluding this one)
    if (body.path && body.locale && body.path !== seoEntry.path) {
      const existingEntry = await SEO.findOne({
        path: body.path,
        locale: body.locale,
        _id: { $ne: id },
      });

      if (existingEntry) {
        return NextResponse.json(
          { message: "An SEO entry with this path and locale already exists" },
          { status: 400 }
        );
      }
    }

    // Update the SEO entry
    const updatedSEOEntry = await SEO.findByIdAndUpdate(
      id,
      {
        ...validatedData,
        lastModified: new Date(),
      },
      { new: true }
    );

    return NextResponse.json(updatedSEOEntry);
  } catch (error) {
    console.error("Error updating SEO entry:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update SEO entry" },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a specific SEO entry
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    // Find and delete the SEO entry by ID
    const deletedSEOEntry = await SEO.findByIdAndDelete(id);

    if (!deletedSEOEntry) {
      return NextResponse.json(
        { message: "SEO entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "SEO entry deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting SEO entry:", error);
    return NextResponse.json(
      { message: "Failed to delete SEO entry" },
      { status: 500 }
    );
  }
}
