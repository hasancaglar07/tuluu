import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import UserPurchase from "@/models/UserPurchase";
import ShopItem from "@/models/ShopItem";

/**
 * GET /api/admin/shop/items/[id]/analytics
 *
 * Retrieves comprehensive analytics data for a specific shop item
 * Includes sales metrics, revenue data, user engagement, and performance trends
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing the item ID
 * @returns JSON response with analytics data
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

    // Extract query parameters for date range
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // '7d', '30d', '90d', '1y'

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Aggregate sales metrics
    const salesMetrics = await UserPurchase.aggregate([
      {
        $match: {
          itemId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0],
            },
          },
          totalQuantity: { $sum: "$quantity" },
          completedSales: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          refundedSales: {
            $sum: { $cond: [{ $eq: ["$status", "refunded"] }, 1, 0] },
          },
          averageOrderValue: { $avg: "$totalAmount" },
          uniqueCustomers: { $addToSet: "$userId" },
        },
      },
    ]);

    // Get daily sales data for chart
    const dailySales = await UserPurchase.aggregate([
      {
        $match: {
          itemId,
          createdAt: { $gte: startDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          sales: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
          quantity: { $sum: "$quantity" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get top customers
    const topCustomers = await UserPurchase.aggregate([
      {
        $match: {
          itemId,
          status: "completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalPurchases: { $sum: 1 },
          totalSpent: { $sum: "$totalAmount" },
          totalQuantity: { $sum: "$quantity" },
          lastPurchase: { $max: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $sort: { totalSpent: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Calculate conversion metrics
    const viewsData = item.views || 0;
    const conversionRate =
      Number(viewsData) > 0
        ? ((salesMetrics[0]?.completedSales || 0) / Number(viewsData)) * 100
        : 0;

    // Get performance comparison with previous period
    const previousPeriodStart = new Date(
      startDate.getTime() - (now.getTime() - startDate.getTime())
    );
    const previousMetrics = await UserPurchase.aggregate([
      {
        $match: {
          itemId,
          createdAt: { $gte: previousPeriodStart, $lt: startDate },
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Calculate growth rates
    const currentSales = salesMetrics[0]?.completedSales || 0;
    const currentRevenue = salesMetrics[0]?.totalRevenue || 0;
    const previousSales = previousMetrics[0]?.totalSales || 0;
    const previousRevenue = previousMetrics[0]?.totalRevenue || 0;

    const salesGrowth =
      previousSales > 0
        ? ((currentSales - previousSales) / previousSales) * 100
        : 0;
    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    // Build analytics response
    const analyticsData = {
      overview: {
        totalSales: salesMetrics[0]?.totalSales || 0,
        completedSales: salesMetrics[0]?.completedSales || 0,
        refundedSales: salesMetrics[0]?.refundedSales || 0,
        totalRevenue: salesMetrics[0]?.totalRevenue || 0,
        totalQuantity: salesMetrics[0]?.totalQuantity || 0,
        averageOrderValue: salesMetrics[0]?.averageOrderValue || 0,
        uniqueCustomers: salesMetrics[0]?.uniqueCustomers?.length || 0,
        currency: item.currency,
      },
      performance: {
        views: viewsData,
        conversionRate: Math.round(conversionRate * 100) / 100,
        salesGrowth: Math.round(salesGrowth * 100) / 100,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        refundRate:
          currentSales > 0
            ? Math.round(
                ((salesMetrics[0]?.refundedSales || 0) / currentSales) *
                  100 *
                  100
              ) / 100
            : 0,
      },
      trends: {
        period,
        dailySales: dailySales.map((day) => ({
          date: day._id,
          sales: day.sales,
          revenue: day.revenue,
          quantity: day.quantity,
        })),
      },
      customers: {
        topCustomers: topCustomers.map((customer) => ({
          id: customer._id.toString(),
          username: customer.user.username,
          email: customer.user.email,
          avatar: customer.user.avatar || "/placeholder.svg?height=32&width=32",
          totalPurchases: customer.totalPurchases,
          totalSpent: customer.totalSpent,
          totalQuantity: customer.totalQuantity,
          lastPurchase: customer.lastPurchase.toISOString(),
        })),
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/shop/items/[id]/analytics/refresh
 *
 * Manually refresh analytics data and recalculate metrics
 * Useful for updating cached analytics or fixing data inconsistencies
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing the item ID
 * @returns JSON response with refresh result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    // Recalculate total sales and revenue
    const totalStats = await UserPurchase.aggregate([
      {
        $match: { itemId, status: "completed" },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    // Update item analytics
    const stats = totalStats[0] || {
      totalSales: 0,
      totalRevenue: 0,
      totalQuantity: 0,
    };

    await ShopItem.findByIdAndUpdate(itemId, {
      $set: {
        "analytics.totalSales": stats.totalSales,
        "analytics.totalRevenue": stats.totalRevenue,
        "analytics.totalQuantity": stats.totalQuantity,
        "analytics.lastUpdated": new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Analytics refreshed successfully",
        stats,
      },
    });
  } catch (error) {
    console.error("Error refreshing analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
