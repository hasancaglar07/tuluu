import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import UserPurchase from "@/models/UserPurchase";
import ShopItem from "@/models/ShopItem";

interface Purchase {
  _id: string;
  userId: string; // populated
  createdAt: Date;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: "USD" | "gems" | "coins";
  status: "completed" | "pending" | "failed" | "refunded";
  paymentMethod?: "gems" | "coins" | "stripe" | "paypal";
  transactionId: string;
  refundReason?: string;
  refundDate?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * GET /api/admin/shop/items/[id]/purchases
 *
 * Retrieves purchase history for a specific shop item
 * Returns detailed purchase records with user information and purchase details
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing the item ID
 * @returns JSON response with purchase history data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to the database
    await connectDB();

    const { id: itemId } = await params;

    // Validate that the item exists
    const item = await ShopItem.findById(itemId);
    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: "Shop item not found",
        },
        { status: 404 }
      );
    }

    // Extract query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status"); // 'completed', 'pending', 'refunded'
    const sortBy = searchParams.get("sortBy") || "purchaseDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build filter query
    const filter: Record<string, unknown> = { itemId };
    if (status) {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Fetch purchases with user information
    const purchases = (await UserPurchase.find(filter)
      .populate("userId", "username email avatar") // Populate user details
      .sort(sort)
      .skip(skip)
      .limit(limit));

    // Get total count for pagination
    const totalPurchases = await UserPurchase.countDocuments(filter);

    // Transform data to match the expected structure
    const purchaseHistory = purchases.map((purchase) => ({
      id: purchase._id,
      userId: purchase.userId,
      purchaseDate: purchase.createdAt ? purchase.createdAt : null,
      quantity: purchase.quantity,
      unitPrice: purchase.unitPrice,
      totalAmount: purchase.totalAmount,
      currency: purchase.currency,
      status: purchase.status,
      paymentMethod: purchase.paymentMethod || "gems",
      transactionId: purchase.transactionId,
      refundReason: purchase.refundReason || null,
      refundDate: purchase.refundDate
        ? purchase.refundDate
        : null,
      metadata: purchase.metadata || {},
    }));

    // Calculate summary statistics
    const completedPurchases = await UserPurchase.countDocuments({
      itemId,
      status: "completed",
    });
    const totalRevenue = await UserPurchase.aggregate([
      { $match: { itemId, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const refundedPurchases = await UserPurchase.countDocuments({
      itemId,
      status: "refunded",
    });

    return NextResponse.json({
      success: true,
      data: {
        purchases: purchaseHistory,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPurchases / limit),
          totalItems: totalPurchases,
          itemsPerPage: limit,
          hasNextPage: page < Math.ceil(totalPurchases / limit),
          hasPreviousPage: page > 1,
        },
        summary: {
          totalPurchases,
          completedPurchases,
          refundedPurchases,
          totalRevenue: totalRevenue[0]?.total || 0,
          currency: item.currency,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch purchase history",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/shop/items/[id]/purchases/refund
 *
 * Process a refund for a specific purchase
 * Updates the purchase status and handles refund logic
 *
 * @param request - Next.js request object with refund details
 * @param params - Route parameters containing the item ID
 * @returns JSON response with refund result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id: itemId } = await params;
    const body = await request.json();
    const { purchaseId, reason, refundAmount } = body;

    // Validate required fields
    if (!purchaseId || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: "Purchase ID and reason are required",
        },
        { status: 400 }
      );
    }

    // Find the purchase
    const purchase = await UserPurchase.findOne({
      _id: purchaseId,
      itemId,
    });

    if (!purchase) {
      return NextResponse.json(
        {
          success: false,
          error: "Purchase not found",
        },
        { status: 404 }
      );
    }

    // Check if already refunded
    if (purchase.status === "refunded") {
      return NextResponse.json(
        {
          success: false,
          error: "Purchase already refunded",
        },
        { status: 400 }
      );
    }

    // Update purchase with refund information
    purchase.status = "refunded";
    purchase.refundReason = reason;
    purchase.refundDate = new Date();
    purchase.refundAmount = refundAmount || purchase.totalAmount;

    await purchase.save();

    // TODO: Implement actual refund logic here
    // - Return gems to user
    // - Process payment refund if applicable
    // - Send notification to user

    return NextResponse.json({
      success: true,
      data: {
        message: "Refund processed successfully",
        purchaseId,
        refundAmount: purchase.refundAmount,
        refundDate: purchase.refundDate,
      },
    });
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process refund",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
