import { type NextRequest, NextResponse } from "next/server";
import { getStripeStats } from "@/lib/stripe";
import { authGuard } from "@/lib/utils";

const PAYMENTS_STATS_CACHE_TTL_MS = 60 * 1000;

type PaymentsStatsPayload = {
  success: true;
  data: {
    totalRevenue: number;
    activeSubscriptions: number;
    failedPayments: number;
    refundRate: number;
    revenueChange: number;
    subscriptionsChange: number;
    failedPaymentsChange: number;
    refundRateChange: number;
  };
};

type PaymentsStatsCacheValue = {
  expiresAt: number;
  payload: PaymentsStatsPayload;
};

const globalForPaymentsStatsCache = globalThis as typeof globalThis & {
  _paymentsStatsCache?: Map<string, PaymentsStatsCacheValue>;
};

const paymentsStatsCache =
  globalForPaymentsStatsCache._paymentsStatsCache ?? new Map();
globalForPaymentsStatsCache._paymentsStatsCache = paymentsStatsCache;

export async function GET(_request: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }
    const now = Date.now();
    const cached = paymentsStatsCache.get("summary");
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.payload);
    }

    const stats = await getStripeStats();

    // Add mock change percentages (in real app, compare with previous period)
    const payload: PaymentsStatsPayload = {
      success: true,
      data: {
        ...stats,
        revenueChange: 12.5,
        subscriptionsChange: 8.2,
        failedPaymentsChange: -3.1,
        refundRateChange: -0.3,
      },
    };

    paymentsStatsCache.set("summary", {
      expiresAt: now + PAYMENTS_STATS_CACHE_TTL_MS,
      payload,
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment statistics" },
      { status: 500 }
    );
  }
}
