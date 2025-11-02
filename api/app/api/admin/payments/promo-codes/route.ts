import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import PromoCode from "@/models/PromoCode";
import { PromoCodeCreateSchema } from "@/lib/validations/payment";

/**
 * @swagger
 * /api/promo-codes:
 *   get:
 *     summary: Get a paginated list of promo codes
 *     tags:
 *       - Promo Codes
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of promo codes per page
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: discountType
 *         schema:
 *           type: string
 *         description: Filter by discount type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by promo code or name (partial, case-insensitive)
 *     responses:
 *       200:
 *         description: Successfully retrieved promo codes
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
 *                     promoCodes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PromoCode'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         expired:
 *                           type: integer
 *                         totalUses:
 *                           type: integer
 *       500:
 *         description: Server error
 */

export async function GET(request: NextRequest) {
  try {
    // **Connect to database**
    await connectDB();

    // **Extract query parameters**
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const isActive = searchParams.get("isActive");
    const discountType = searchParams.get("discountType");
    const search = searchParams.get("search");

    // **Build filter query**
    const filter: Record<string, unknown> = {};
    if (isActive !== null) filter.isActive = isActive === "true";
    if (discountType) filter.discountType = discountType;
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    // **Calculate pagination**
    const skip = (page - 1) * limit;

    // **Execute queries in parallel**
    const [promoCodes, totalCount] = await Promise.all([
      PromoCode.find(filter)
        .populate("metadata.createdBy", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PromoCode.countDocuments(filter),
    ]);

    // **Transform promo codes for frontend**
    const transformedPromoCodes = promoCodes.map((code) => ({
      id: code._id.toString(),
      code: code.code,
      name: code.name,
      description: code.description,
      discountType: code.discountType,
      discountValue: code.discountValue,
      maxDiscountAmount: code.maxDiscountAmount,
      startDate: code.startDate,
      endDate: code.endDate,
      isActive: code.isActive,
      maxUses: code.maxUses,
      maxUsesPerUser: code.maxUsesPerUser,
      currentUses: code.currentUses,
      applicableItems: code.applicableItems,
      userRestrictions: code.userRestrictions,
      campaignId: code.campaignId,
      source: code.source,
      metadata: code.metadata,
      createdAt: code.createdAt,
      updatedAt: code.updatedAt,
      // **Virtual fields**
      isValid:
        code.isActive &&
        code.endDate &&
        new Date() >= new Date(code.startDate) &&
        new Date() <= new Date(code.endDate) &&
        (!code.maxUses || code.currentUses < code.maxUses),
      usagePercentage: code.maxUses
        ? (code.currentUses / code.maxUses) * 100
        : 0,
      remainingUses: code.maxUses
        ? Math.max(0, code.maxUses - code.currentUses)
        : null,
    }));

    // **Calculate pagination metadata**
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // **Get promo code statistics**
    const stats = await PromoCode.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
          expired: {
            $sum: {
              $cond: [{ $lt: ["$endDate", new Date()] }, 1, 0],
            },
          },
          totalUses: { $sum: "$currentUses" },
        },
      },
    ]);

    const promoStats = stats[0] || {
      total: 0,
      active: 0,
      expired: 0,
      totalUses: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        promoCodes: transformedPromoCodes,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
        stats: promoStats,
      },
    });
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch promo codes",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/promo-codes:
 *   post:
 *     summary: Create a new promo code
 *     tags:
 *       - Promo Codes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PromoCodeCreate'
 *     responses:
 *       201:
 *         description: Promo code created successfully
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
 *                   $ref: '#/components/schemas/PromoCode'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Promo code already exists
 *       500:
 *         description: Server error
 */

export async function POST(request: NextRequest) {
  try {
    // **Connect to database**
    await connectDB();

    // **Parse and validate request body**
    const body = await request.json();
    const validation = PromoCodeCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // **Check if code already exists**
    const existingCode = await PromoCode.findOne({ code: data.code });
    if (existingCode) {
      return NextResponse.json(
        { success: false, message: "Promo code already exists" },
        { status: 409 }
      );
    }

    // **Create promo code**
    const promoCode = new PromoCode({
      ...data,
      currentUses: 0,
    });

    await promoCode.save();

    // **Transform for frontend response**
    const transformedPromoCode = {
      id: promoCode._id.toString(),
      code: promoCode.code,
      name: promoCode.name,
      description: promoCode.description,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      startDate: promoCode.startDate,
      endDate: promoCode.endDate,
      isActive: promoCode.isActive,
      maxUses: promoCode.maxUses,
      currentUses: promoCode.currentUses,
      applicableItems: promoCode.applicableItems,
      createdAt: promoCode.createdAt,
      updatedAt: promoCode.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: transformedPromoCode,
        message: "Promo code created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating promo code:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create promo code",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
