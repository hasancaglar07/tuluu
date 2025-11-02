import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import ShopItem from "@/models/ShopItem";
import UserPurchase from "@/models/UserPurchase";
import { authGuard } from "@/lib/utils";

// GET /api/admin/shop/analytics - Get shop analytics
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30"; // days

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number.parseInt(period));

    // Get overall shop analytics
    const shopAnalytics = await ShopItem.getShopAnalytics();

    // Get top selling items
    const topSellingItems = await ShopItem.find({ status: "active" })
      .sort({ purchases: -1 })
      .limit(5)
      .select("name purchases revenue")
      .lean();

    // Get top selling categories
    const topCategories = await ShopItem.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$category",
          totalPurchases: { $sum: "$purchases" },
          totalRevenue: { $sum: "$revenue" },
          itemCount: { $sum: 1 },
        },
      },
      { $sort: { totalPurchases: -1 } },
      { $limit: 5 },
    ]);

    // Get recent purchase trends (last 7 days)
    const dailyTrends = await UserPurchase.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          purchases: { $sum: 1 },
          revenue: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Calculate conversion rate (mock data for now)
    const totalViews = Number(shopAnalytics?.totalViews) || 0;
    const totalPurchases = Number(shopAnalytics?.totalPurchases) || 0;
    const conversionRate =
      totalViews > 0 ? ((totalPurchases / totalViews) * 100).toFixed(1) : "0.0";

    // Find top selling item name
    const topSellingItem = topSellingItems[0]?.name || "No sales yet";
    const topSellingCategory = topCategories[0]?._id || "No sales yet";

    return NextResponse.json({
      analytics: {
        totalRevenue: shopAnalytics?.totalRevenue || 0,
        totalPurchases: shopAnalytics?.totalPurchases || 0,
        averageOrderValue: shopAnalytics?.averageOrderValue || 0,
        conversionRate: `${conversionRate}%`,
        topSellingItem,
        topSellingCategory,
        activeItems: shopAnalytics?.activeItems || 0,
        inactiveItems: shopAnalytics?.inactiveItems || 0,
      },
      topSellingItems: topSellingItems.map((item) => ({
        name: item.name,
        purchases: item.purchases,
        revenue: item.revenue,
      })),
      topCategories: topCategories.map((cat) => ({
        name: cat._id,
        purchases: cat.totalPurchases,
        revenue: cat.totalRevenue,
        itemCount: cat.itemCount,
      })),
      dailyTrends: dailyTrends.map((day) => ({
        date: day._id,
        purchases: day.purchases,
        revenue: day.revenue,
      })),
    });
  } catch (error) {
    console.error("Error fetching shop analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch shop analytics" },
      { status: 500 }
    );
  }
}
