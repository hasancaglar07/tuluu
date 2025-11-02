import { type NextRequest, NextResponse } from "next/server";
import ShopPromotion, { ShopPromotionDocument } from "@/models/ShopPromotion";
import { FilterQuery } from "mongoose";
import connectDB from "@/lib/db/connect";
import { authGuard } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/admin/shop/promotions
 * Fetch promotions with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const authCheck = await authGuard();
    if (authCheck instanceof NextResponse) {
      return authCheck; // early return on unauthorized or forbidden
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "20");

    // Build query
    const query: FilterQuery<ShopPromotionDocument> = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (type && type !== "all") {
      query.type = type;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * pageSize;
    const [promotions, total] = await Promise.all([
      ShopPromotion.find(query)
        .populate("shopItemIds", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      ShopPromotion.countDocuments(query),
    ]);

    // Add progress calculation
    const promotionsWithProgress = promotions.map((promo) => ({
      ...promo,
      id: promo._id,
      progress: promo.target
        ? Math.round((promo.redemptions / promo.target) * 100)
        : null,
    }));

    return NextResponse.json({
      promotions: promotionsWithProgress,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/shop/promotions
 * Create a new promotion
 */
export async function POST(request: NextRequest) {
  try {
    const authCheck = await authGuard();
    if (authCheck instanceof NextResponse) {
      return authCheck; // early return on unauthorized or forbidden
    }

    const { userId } = await auth();

    await connectDB();

    const data = await request.json();

    // Validate required fields
    if (
      !data.name ||
      !data.description ||
      !data.type ||
      !data.discount ||
      !data.startDate ||
      !data.endDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (startDate >= endDate) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Create new promotion
    const promotion = new ShopPromotion({
      ...data,
      startDate,
      endDate,
      createdBy: userId,
      lastModifiedBy: userId,
    });

    await promotion.save();

    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error) {
    console.error("Error creating promotion:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
