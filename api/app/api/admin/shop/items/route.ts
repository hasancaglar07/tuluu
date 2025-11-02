import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import connectDB from "@/lib/db/connect";
import ShopItem from "@/models/ShopItem";
import ShopCategory from "@/models/ShopCategory";
import { FilterQuery } from "mongoose";
import dayjs from "dayjs";

// Validation schema for shop item creation
const createShopItemSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(10).max(500),
  type: z.enum([
    "power-up",
    "cosmetic",
    "consumable",
    "currency",
    "bundle",
    "content",
  ]),
  category: z.string().min(1),
  price: z.number().positive(),
  currency: z.enum(["gems", "coins", "USD"]),
  stockType: z.enum(["unlimited", "limited"]),
  stockQuantity: z.number().optional(),
  eligibility: z.string().optional(),
  isLimitedTime: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sendNotification: z.boolean().default(false),
  notificationMessage: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

interface ShopItemInput {
  name: string;
  description?: string;
  price: number;
  currency: "USD" | "gems" | "coins";
  isLimitedTime?: boolean;
  startDate?: Date;
  endDate?: Date;
  stockType?: "unlimited" | "limited";
  stockQuantity?: number;
  createdBy: string;
  lastModifiedBy: string;
  status: "active" | "draft";
}

// GET /api/admin/shop/items - Fetch all shop items with filtering
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const type = searchParams.get("type") || "";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "50");

    // Build filter query
    const filter: FilterQuery<DocumentType> = {};

    // Search filter (name or description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category && category !== "all") {
      filter.category = category;
    }

    // Status filter
    if (status && status !== "all") {
      filter.status = status;
    }

    // Type filter
    if (type && type !== "all") {
      filter.type = type;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch items with pagination
    const [items, totalCount] = await Promise.all([
      ShopItem.find(filter)
        .sort({ featured: -1, sortOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ShopItem.countDocuments(filter),
    ]);

    // Transform data for frontend
    const transformedItems = items.map((item) => ({
      id: item._id,
      name: item.name,
      description: item.description,
      type: item.type,
      category: item.category,
      price: item.price,
      currency: item.currency,
      image: item.image,
      stock:
        item.stockType === "unlimited"
          ? "Unlimited"
          : `Limited (${item.stockQuantity || 0})`,
      status: item.status,
      purchases: item.purchases,
      revenue: item.revenue,
      views: item.views,
      eligibility: item.eligibility,
      createdAt: item.createdAt
        ? dayjs(new Date(item.createdAt as unknown as string)).format(
            "YYYY-MM-DD"
          )
        : "",
      isLimitedTime: item.isLimitedTime,
      startDate: item.startDate,
      endDate: item.endDate,
      featured: item.featured,
      tags: item.tags,
      sortOrder: item.sortOrder,
    }));

    return NextResponse.json({
      items: transformedItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching shop items:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop items" },
      { status: 500 }
    );
  }
}

// POST /api/admin/shop/items - Create new shop item
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createShopItemSchema.parse(body);

    // Convert date strings to Date objects if provided
    const itemData: ShopItemInput = {
      ...validatedData,
      startDate: validatedData.startDate
        ? new Date(validatedData.startDate)
        : undefined,
      endDate: validatedData.endDate
        ? new Date(validatedData.endDate)
        : undefined,
      createdBy: userId,
      lastModifiedBy: userId,
      status: body.isActive ? "active" : "draft",
    };

    if (validatedData.startDate) {
      itemData.startDate = new Date(validatedData.startDate);
    }
    if (validatedData.endDate) {
      itemData.endDate = new Date(validatedData.endDate);
    }

    // Create new shop item
    const newItem = new ShopItem(itemData);
    await newItem.save();

    // Update category item count
    await ShopCategory.findOneAndUpdate(
      { name: validatedData.category },
      { $inc: { itemCount: 1 } }
    );

    // Transform response data
    const responseItem = {
      id: newItem._id,
      name: newItem.name,
      description: newItem.description,
      type: newItem.type,
      category: newItem.category,
      price: newItem.price,
      currency: newItem.currency,
      image: newItem.image,
      stock:
        newItem.stockType === "unlimited"
          ? "Unlimited"
          : `Limited (${newItem.stockQuantity || 0})`,
      status: newItem.status,
      purchases: newItem.purchases,
      revenue: newItem.revenue,
      views: newItem.views,
      eligibility: newItem.eligibility,
      createdAt: dayjs(new Date(newItem.createdAt as unknown as string)).format(
        "YYYY-MM-DD"
      ),
      isLimitedTime: newItem.isLimitedTime,
      startDate: newItem.startDate,
      endDate: newItem.endDate,
      featured: newItem.featured,
      tags: newItem.tags,
      sortOrder: newItem.sortOrder,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Shop item created successfully",
        data: {
          item: responseItem,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating shop item:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create shop item" },
      { status: 500 }
    );
  }
}
