import { type NextRequest, NextResponse } from "next/server";

import ShopItem, { type ShopItemDocument } from "@/models/ShopItem";
import ShopCategory from "@/models/ShopCategory";

import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import PaymentSettings from "@/models/PaymentSettings";
import type { FilterQuery } from "mongoose";

// Define a type for lean shop item objects
interface LeanShopItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  currency: string;
  type: "currency" | "consumable" | "permanent" | "subscription" | "bundle";
  stockType: "unlimited" | "limited" | "out_of_stock";
  stockQuantity?: number;
  featured: boolean;
  tags?: string[];
  isLimitedTime?: boolean;
  startDate?: Date;
  endDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder?: number;
}

/**
 * @swagger
 * /api/shop:
 *   get:
 *     summary: Get shop items, categories, and settings
 *     description: |
 *       Retrieves shop items with optional filtering, categories, limited-time offers,
 *       and payment settings. Supports pagination and various filtering options.
 *       Returns comprehensive shop data needed for the frontend store interface.
 *       Requires user authentication.
 *     tags:
 *       - Shop
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter items by category (use "all" for no filtering)
 *         example: "gems"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *         example: 20
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter to show only featured items
 *         example: true
 *     responses:
 *       '200':
 *         description: Successfully retrieved shop data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShopResponse'
 *             examples:
 *               shopData:
 *                 summary: Complete shop data
 *                 value:
 *                   success: true
 *                   data:
 *                     items:
 *                       - id: "507f1f77bcf86cd799439011"
 *                         name: "500 Gems"
 *                         description: "Get 500 gems to unlock premium content"
 *                         price: 4.99
 *                         image: "https://cdn-icons-png.flaticon.com/128/11280/11280638.png"
 *                         category: "gems"
 *                         currency: "USD"
 *                         type: "currency"
 *                         stockType: "unlimited"
 *                         stockQuantity: null
 *                         featured: true
 *                         popular: true
 *                         discount: 0
 *                         gemsAmount: 500
 *                         isLimitedTime: false
 *                         tags: ["popular", "best-value"]
 *                       - id: "507f1f77bcf86cd799439012"
 *                         name: "Heart Refill"
 *                         description: "Instantly refill all your hearts"
 *                         price: 1.99
 *                         image: "https://cdn-icons-png.flaticon.com/128/833/833472.png"
 *                         category: "hearts"
 *                         currency: "USD"
 *                         type: "consumable"
 *                         stockType: "unlimited"
 *                         stockQuantity: null
 *                         featured: false
 *                         popular: false
 *                         discount: 0
 *                         isLimitedTime: false
 *                         tags: ["instant"]
 *                     categories:
 *                       - id: "507f1f77bcf86cd799439021"
 *                         name: "Gems"
 *                         description: "Premium currency for unlocking content"
 *                         color: "#3B82F6"
 *                         icon: "💎"
 *                         itemCount: 5
 *                         sortOrder: 1
 *                       - id: "507f1f77bcf86cd799439022"
 *                         name: "Hearts"
 *                         description: "Lives for continuing your learning"
 *                         color: "#EF4444"
 *                         icon: "❤️"
 *                         itemCount: 3
 *                         sortOrder: 2
 *                     limitedOffers:
 *                       - id: "507f1f77bcf86cd799439031"
 *                         name: "Weekend Special - 1000 Gems"
 *                         description: "Limited time offer with 20% bonus gems"
 *                         price: 7.99
 *                         currency: "USD"
 *                         endDate: "2024-01-21T23:59:59Z"
 *                         image: "https://cdn-icons-png.flaticon.com/128/11280/11280638.png"
 *                         discount: 20
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 3
 *                       totalItems: 45
 *                       hasNextPage: true
 *                       hasPrevPage: false
 *                     settings:
 *                       heartCostInGems: 500
 *                       heartRefillTimeHours: 5
 *                       maxHearts: 5
 *                       maxHeartsPerPurchase: 5
 *                       gemExchangeRate: 100
 *                       heartExchangeRate: 1
 *                       defaultCurrency: "USD"
 *                       paymentsEnabled: true
 *                       testMode: true
 *                       regionalPricing: false
 *                       defaultRegion: "United States"
 *                       enabledProviders: ["stripe", "paypal"]
 *                       companyName: "TULU"
 *                       supportEmail: "support@tulu.com"
 *               featuredItems:
 *                 summary: Featured items only
 *                 value:
 *                   success: true
 *                   data:
 *                     items:
 *                       - id: "507f1f77bcf86cd799439011"
 *                         name: "1000 Gems Bundle"
 *                         description: "Best value gem package"
 *                         price: 9.99
 *                         featured: true
 *                         popular: true
 *                         discount: 15
 *                         gemsAmount: 1000
 *                     categories: []
 *                     limitedOffers: []
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 1
 *                       totalItems: 3
 *                       hasNextPage: false
 *                       hasPrevPage: false
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   error: "Unauthorized"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   error: "Failed to fetch shop data"
 *                   message: "Database connection failed"
 */

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const featuredOnly = searchParams.get("featured") === "true";

    // Build filter object
    const filter: FilterQuery<ShopItemDocument> = { status: "active" };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (featuredOnly) {
      filter.featured = true;
    }

    // Check for limited time offers
    const now = new Date();
    const limitedTimeFilter = {
      ...filter,
      isLimitedTime: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    // Fetch data in parallel
    const [shopItems, categories, paymentSettings, limitedOffers] =
      await Promise.all([
        ShopItem.find(filter)
          .sort({ featured: -1, sortOrder: 1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean<LeanShopItem[]>(),

        ShopCategory.getActiveCategories(),

        PaymentSettings.getActiveSettings(),

        ShopItem.find(limitedTimeFilter)
          .sort({ endDate: 1 })
          .limit(5)
          .lean<LeanShopItem[]>(),
      ]);

    // Get total count for pagination
    const totalItems = await ShopItem.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    // Transform shop items to match frontend structure
    const transformedItems = shopItems.map((item) => ({
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      image:
        item.image ||
        "https://cdn-icons-png.flaticon.com/128/11280/11280638.png",
      category: item.category,
      currency: item.currency,
      type: item.type,
      stockType: item.stockType,
      stockQuantity: item.stockQuantity,
      featured: item.featured,
      popular: item.featured, // Map featured to popular for frontend compatibility
      discount: calculateDiscount(item),
      gemsAmount: item.type === "currency" ? item.price : undefined,
      isLimitedTime: item.isLimitedTime,
      startDate: item.startDate,
      endDate: item.endDate,
      tags: item.tags,
    }));

    // Transform categories
    const transformedCategories = categories.map((cat) => ({
      _id: cat._id,
      name: cat.name,
      description: cat.description,
      color: cat.color,
      icon: cat.icon,
      itemCount: cat.itemCount,
      sortOrder: cat.sortOrder,
    }));

    // Extract payment settings for heart cost calculation
    const heartCostInGems =
      paymentSettings?.currencies?.hearts?.gemsCost || 500;
    const gemExchangeRate =
      paymentSettings?.currencies?.gems?.exchangeRate || 100;
    const heartExchangeRate =
      paymentSettings?.currencies?.hearts?.exchangeRate || 1;
    const heartRefillTimeHours =
      paymentSettings?.currencies?.hearts?.refillTimeHours || 5;
    const maxHearts = paymentSettings?.currencies?.hearts?.maxAmount || 5;
    const maxHeartsPerPurchase =
      paymentSettings?.currencies?.hearts?.minPurchase || 5;
    const defaultCurrency =
      paymentSettings?.currencies?.defaultCurrency || "USD";

    // Transform limited offers
    const transformedLimitedOffers = limitedOffers.map((item) => ({
      _id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      currency: item.currency,
      endDate: item.endDate,
      image: item.image,
      discount: calculateDiscount(item),
    }));

    const response = {
      success: true,
      data: {
        items: transformedItems,
        categories: transformedCategories,
        limitedOffers: transformedLimitedOffers,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        settings: {
          // Heart settings
          heartCostInGems,
          heartRefillTimeHours,
          maxHearts,
          maxHeartsPerPurchase,

          // Currency settings
          gemExchangeRate,
          heartExchangeRate,
          defaultCurrency,

          // Payment settings
          paymentsEnabled: paymentSettings?.general?.enablePayments || true,
          testMode: paymentSettings?.general?.testMode || true,

          // Regional settings
          regionalPricing: paymentSettings?.regional?.regionalPricing || false,
          defaultRegion:
            paymentSettings?.regional?.defaultRegion || "United States",

          // Provider settings
          enabledProviders: paymentSettings?.enabledProviders || [],

          // Company info
          companyName: paymentSettings?.general?.companyName || "TULU",
          supportEmail:
            paymentSettings?.general?.supportEmail || "support@tulu.com",
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Shop API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch shop data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Calculate discount percentage for an item
 * This function determines if an item should have a discount based on various criteria
 *
 * @param item - The shop item (lean object from MongoDB)
 * @returns The discount percentage (0-100)
 */
function calculateDiscount(item: LeanShopItem): number {
  // Check if item has sale tag
  if (item.tags?.includes("sale")) {
    return 20; // 20% discount for sale items
  }

  // Featured currency items get a discount
  if (item.featured && item.type === "currency") {
    return 15; // 15% discount for featured currency items
  }

  // Limited time offers get automatic discount
  if (item.isLimitedTime && item.startDate && item.endDate) {
    const now = new Date();
    const startTime = new Date(item.startDate).getTime();
    const endTime = new Date(item.endDate).getTime();
    const currentTime = now.getTime();

    // Only apply discount if we're within the time range
    if (currentTime >= startTime && currentTime <= endTime) {
      // Calculate time remaining percentage
      const totalDuration = endTime - startTime;
      const timeRemaining = endTime - currentTime;
      const timeRemainingPercentage = (timeRemaining / totalDuration) * 100;

      // Higher discount as time runs out
      if (timeRemainingPercentage < 25) {
        return 30; // 30% discount in final 25% of time
      } else if (timeRemainingPercentage < 50) {
        return 20; // 20% discount in final 50% of time
      } else {
        return 10; // 10% discount for limited time offers
      }
    }
  }

  // Bundle items get a discount
  if (item.type === "bundle") {
    return 25; // 25% discount for bundles
  }

  return 0; // No discount by default
}
