import { NextResponse } from "next/server";
import ShopPromotion from "@/models/ShopPromotion";
import { authGuard } from "@/lib/utils";
import connectDB from "@/lib/db/connect";

/**
 * GET /api/admin/shop/promotions/analytics
 * Fetch promotions analytics data
 */
export async function GET() {
  try {
    const check = await authGuard();
    if (check instanceof NextResponse) return check;

    // Connect to database
    await connectDB();

    // Get promotion analytics
    const analyticsData = await ShopPromotion.getPromotionAnalytics();
    const analytics = analyticsData[0] || {
      activePromotions: 0,
      upcomingPromotions: 0,
      expiredPromotions: 0,
      totalRedemptions: 0,
    };

    // Calculate conversion rate (mock calculation)
    const conversionRate = analytics.totalRedemptions > 0 ? "8.3%" : "0%";

    return NextResponse.json({
      analytics: {
        ...analytics,
        conversionRate,
      },
    });
  } catch (error) {
    console.error("Error fetching promotion analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
