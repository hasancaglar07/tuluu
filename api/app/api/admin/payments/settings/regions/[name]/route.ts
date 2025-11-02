import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import PaymentSettings from "@/models/PaymentSettings";
import { UpdateRegionSchema } from "@/lib/validations/payment-settings";

/**
 * @swagger
 * /api/payment-settings/region/{name}:
 *   get:
 *     summary: Get a specific payment region
 *     tags:
 *       - Payment Settings
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Region name (URL-encoded)
 *     responses:
 *       200:
 *         description: Region found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     region:
 *                       $ref: '#/components/schemas/PaymentRegion'
 *                     isDefault:
 *                       type: boolean
 *       404:
 *         description: Region not found
 *
 *   put:
 *     summary: Update a specific payment region
 *     tags:
 *       - Payment Settings
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Region name (URL-encoded)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRegionRequest'
 *     responses:
 *       200:
 *         description: Region updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     region:
 *                       $ref: '#/components/schemas/PaymentRegion'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Region not found or settings missing
 *
 *   delete:
 *     summary: Delete a specific payment region
 *     tags:
 *       - Payment Settings
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Region name (URL-encoded)
 *     responses:
 *       200:
 *         description: Region deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     remainingRegions:
 *                       type: number
 *       400:
 *         description: Cannot delete the default region
 *       404:
 *         description: Region not found or settings missing
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentRegion:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, pending, inactive]
 *         name:
 *           type: string
 *         currency:
 *           type: string
 *         priceMultiplier:
 *           type: number
 *         taxRate:
 *           type: number
 *         countryCode:
 *           type: string
 *           nullable: true
 *         timezone:
 *           type: string
 *           nullable: true
 *         paymentMethods:
 *           type: array
 *           items:
 *             type: string
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *
 *     UpdateRegionRequest:
 *       type: object
 *       required:
 *         - status
 *         - name
 *         - currency
 *         - priceMultiplier
 *         - taxRate
 *         - paymentMethods
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, pending, inactive]
 *         name:
 *           type: string
 *         currency:
 *           type: string
 *         priceMultiplier:
 *           type: number
 *         taxRate:
 *           type: number
 *         countryCode:
 *           type: string
 *           nullable: true
 *         timezone:
 *           type: string
 *           nullable: true
 *         paymentMethods:
 *           type: array
 *           items:
 *             type: string
 *         metadata:
 *           type: object
 *           additionalProperties: true
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    // **Connect to database**
    await connectDB();

    // **Get region name from params**
    const { name } = await params;
    const regionName = decodeURIComponent(name);

    // **Parse and validate request body**
    const body = await request.json();
    const validation = UpdateRegionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // **Find existing settings**
    const settings = await PaymentSettings.findOne({ isActive: true });

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          message: "No payment settings found",
        },
        { status: 404 }
      );
    }

    // **Find region to update**
    const regionIndex = settings.regional.regions.findIndex(
      (region) => region.name === regionName
    );

    if (regionIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: `Region '${regionName}' not found`,
        },
        { status: 404 }
      );
    }

    // **Update region**
    settings.regional.regions[regionIndex].set(updateData);

    // **Save updated settings**
    await settings.save();

    return NextResponse.json({
      success: true,
      data: {
        region: settings.regional.regions[regionIndex],
      },
      message: `Region '${regionName}' updated successfully`,
    });
  } catch (error) {
    console.error("Error updating region:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update region",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    // **Connect to database**
    await connectDB();

    // **Get region name from params**
    const { name } = await params;
    const regionName = decodeURIComponent(name);

    // **Find existing settings**
    const settings = await PaymentSettings.findOne({ isActive: true });

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          message: "No payment settings found",
        },
        { status: 404 }
      );
    }

    // **Find region to delete**
    const regionIndex = settings.regional.regions.findIndex(
      (region) => region.name === regionName
    );

    if (regionIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: `Region '${regionName}' not found`,
        },
        { status: 404 }
      );
    }

    // **Check if it's the default region**
    if (settings.regional.defaultRegion === regionName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot delete the default region. Please set a different default region first.",
        },
        { status: 400 }
      );
    }

    // **Remove region**
    settings.regional.regions.splice(regionIndex, 1);

    // **Save updated settings**
    await settings.save();

    return NextResponse.json({
      success: true,
      message: `Region '${regionName}' deleted successfully`,
      data: {
        remainingRegions: settings.regional.regions.length,
      },
    });
  } catch (error) {
    console.error("Error deleting region:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete region",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    // **Connect to database**
    await connectDB();

    // **Get region name from params**
    const { name } = await params;
    const regionName = decodeURIComponent(name);

    // **Find existing settings**
    const settings = await PaymentSettings.findOne({ isActive: true }).lean();

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          message: "No payment settings found",
        },
        { status: 404 }
      );
    }

    // **Find specific region**
    const region = settings.regional.regions.find(
      (region) => region.name === regionName
    );

    if (!region) {
      return NextResponse.json(
        {
          success: false,
          message: `Region '${regionName}' not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        region,
        isDefault: settings.regional.defaultRegion === regionName,
      },
    });
  } catch (error) {
    console.error("Error fetching region:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch region",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
