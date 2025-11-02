import { type NextRequest, NextResponse } from "next/server";
import { getStripeStats } from "@/lib/stripe";
import { authGuard } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }
    const stats = await getStripeStats();

    // Add mock change percentages (in real app, compare with previous period)
    const statsWithChanges = {
      ...stats,
      revenueChange: 12.5,
      subscriptionsChange: 8.2,
      failedPaymentsChange: -3.1,
      refundRateChange: -0.3,
    };

    return NextResponse.json({
      success: true,
      data: statsWithChanges,
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment statistics" },
      { status: 500 }
    );
  }
}
