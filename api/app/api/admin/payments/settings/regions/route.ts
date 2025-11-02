import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import PaymentSettings from "@/models/PaymentSettings";
import { AddRegionSchema } from "@/lib/validations/payment-settings";
import { authGuard } from "@/lib/utils";

/**
 * @swagger
 * /api/settings/regions:
 *   post:
 *     summary: Add a new region to payment settings
 *     tags: [Regions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - status
 *               - currency
 *               - priceMultiplier
 *               - taxRate
 *               - paymentMethods
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Europe"
 *               status:
 *                 type: string
 *                 enum: [active, pending, inactive]
 *                 example: "active"
 *               currency:
 *                 type: string
 *                 example: "EUR"
 *               priceMultiplier:
 *                 type: number
 *                 example: 1.2
 *               taxRate:
 *                 type: number
 *                 example: 0.21
 *               paymentMethods:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["stripe", "paypal"]
 *               metadata:
 *                 type: object
 *                 additionalProperties: true
 *                 example: { regionCode: "EU", locale: "fr-FR" }
 *               countryCode:
 *                 type: string
 *                 example: "FR"
 *               timezone:
 *                 type: string
 *                 example: "Europe/Paris"
 *     responses:
 *       200:
 *         description: Region successfully added
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
 *                       $ref: '#/components/schemas/Region'
 *                     totalRegions:
 *                       type: number
 *       400:
 *         description: Validation error
 *       404:
 *         description: No payment settings found
 *       409:
 *         description: Region already exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/settings/regions:
 *   get:
 *     summary: Get filtered list of regions from settings
 *     tags: [Regions]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, pending, inactive]
 *         description: Filter regions by status
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *         description: Filter regions by currency code
 *     responses:
 *       200:
 *         description: Successfully fetched regional settings
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
 *                     regions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Region'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         active:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         inactive:
 *                           type: number
 *                         currencies:
 *                           type: array
 *                           items:
 *                             type: string
 *                     settings:
 *                       type: object
 *                       properties:
 *                         regionalPricing:
 *                           type: boolean
 *                         taxCalculation:
 *                           type: string
 *                         autoDetectRegion:
 *                           type: boolean
 *                         defaultRegion:
 *                           type: string
 *       404:
 *         description: No payment settings found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Region:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, pending, inactive]
 *         currency:
 *           type: string
 *         priceMultiplier:
 *           type: number
 *         taxRate:
 *           type: number
 *         paymentMethods:
 *           type: array
 *           items:
 *             type: string
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *         countryCode:
 *           type: string
 *         timezone:
 *           type: string
 */

export async function POST(request: NextRequest) {
  const auth = await authGuard();
  if (auth instanceof NextResponse) return auth;

  try {
    // **Connect to database**
    await connectDB();

    // **Parse and validate request body**
    const body = await request.json();
    console.log(body);

    const validation = AddRegionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const regionData = validation.data;

    // **Find existing settings**
    const settings = await PaymentSettings.findOne({ isActive: true });

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          message: "No payment settings found. Please create settings first.",
        },
        { status: 404 }
      );
    }

    // **Check if region already exists**
    const existingRegion = settings.regional.regions.find(
      (region) => region.name === regionData.name
    );

    if (existingRegion) {
      return NextResponse.json(
        {
          success: false,
          message: `Region '${regionData.name}' already exists`,
        },
        { status: 409 }
      );
    }

    // **Add new region**
    settings.regional.regions.push(regionData);

    // **Save updated settings**
    await settings.save();

    return NextResponse.json({
      success: true,
      data: {
        region: regionData,
        totalRegions: settings.regional.regions.length,
      },
      message: `Region '${regionData.name}' added successfully`,
    });
  } catch (error) {
    console.error("Error adding region:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add region",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // **Connect to database**
    await connectDB();

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

    // **Parse query parameters for filtering**
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const currency = searchParams.get("currency");

    // Convert Mongoose DocumentArray to plain array
    let regions = settings.regional.regions.map((region) => region.toObject());

    // **Apply filters**
    if (status) {
      regions = regions.filter((region) => region.status === status);
    }

    if (currency) {
      regions = regions.filter(
        (region) => region.currency === currency.toUpperCase()
      );
    }

    // **Calculate statistics**
    const stats = {
      total: settings.regional.regions.length,
      active: settings.regional.regions.filter((r) => r.status === "active")
        .length,
      pending: settings.regional.regions.filter((r) => r.status === "pending")
        .length,
      inactive: settings.regional.regions.filter((r) => r.status === "inactive")
        .length,
      currencies: [
        ...new Set(settings.regional.regions.map((r) => r.currency)),
      ],
    };

    return NextResponse.json({
      success: true,
      data: {
        regions,
        stats,
        settings: {
          regionalPricing: settings.regional.regionalPricing,
          taxCalculation: settings.regional.taxCalculation,
          autoDetectRegion: settings.regional.autoDetectRegion,
          defaultRegion: settings.regional.defaultRegion,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching regions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch regions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
