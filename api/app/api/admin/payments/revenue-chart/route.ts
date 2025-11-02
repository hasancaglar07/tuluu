import { type NextRequest, NextResponse } from "next/server";
import { getStripeRevenueChart } from "@/lib/stripe";
import { authGuard } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }

    const chartData = await getStripeRevenueChart();

    return NextResponse.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("Error fetching revenue chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch revenue chart data" },
      { status: 500 }
    );
  }
}
