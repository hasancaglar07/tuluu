import Stripe from "stripe";

// Allow build without STRIPE_SECRET_KEY (will fail at runtime if actually used)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
});

const STRIPE_STATS_CACHE_TTL_MS = 60 * 1000;
const STRIPE_REVENUE_CHART_CACHE_TTL_MS = 5 * 60 * 1000;

type StripeStats = {
  totalRevenue: number;
  activeSubscriptions: number;
  failedPayments: number;
  refundRate: number;
};

type StripeStatsCacheValue = {
  expiresAt: number;
  payload: StripeStats;
};

type StripeRevenuePoint = {
  month: string;
  revenue: number;
  subscriptions: number;
};

type StripeRevenueCacheValue = {
  expiresAt: number;
  payload: StripeRevenuePoint[];
};

const globalForStripeCaches = globalThis as typeof globalThis & {
  _stripeStatsCache?: StripeStatsCacheValue;
  _stripeRevenueChartCache?: StripeRevenueCacheValue;
};

// Helper to check if Stripe is properly configured
function ensureStripeConfigured() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured. Please add it to your environment variables.");
  }
}

export async function getStripeStats() {
  ensureStripeConfigured();
  try {
    const now = Date.now();
    const cachedStats = globalForStripeCaches._stripeStatsCache;
    if (cachedStats && cachedStats.expiresAt > now) {
      return cachedStats.payload;
    }

    const thirtyDaysAgoUnix = Math.floor(now / 1000) - 30 * 24 * 60 * 60;

    const [charges, subscriptions, refunds] = await Promise.all([
      stripe.charges.list({
        limit: 100,
        created: {
          gte: thirtyDaysAgoUnix, // Last 30 days
        },
      }),
      stripe.subscriptions.list({
        status: "active",
        limit: 100,
      }),
      stripe.refunds.list({
        limit: 100,
        created: {
          gte: thirtyDaysAgoUnix,
        },
      }),
    ]);

    const totalRevenue =
      charges.data
        .filter((charge) => charge.status === "succeeded")
        .reduce((sum, charge) => sum + charge.amount, 0) / 100; // Convert from cents

    // Get failed payments
    const failedCharges = charges.data.filter(
      (charge) => charge.status === "failed"
    );

    const totalRefunded =
      refunds.data.reduce((sum, refund) => sum + refund.amount, 0) / 100;
    const refundRate =
      totalRevenue > 0 ? (totalRefunded / totalRevenue) * 100 : 0;

    const payload: StripeStats = {
      totalRevenue,
      activeSubscriptions: subscriptions.data.length,
      failedPayments: failedCharges.length,
      refundRate: Math.round(refundRate * 100) / 100,
    };

    globalForStripeCaches._stripeStatsCache = {
      expiresAt: now + STRIPE_STATS_CACHE_TTL_MS,
      payload,
    };

    return payload;
  } catch (error) {
    console.error("Error fetching Stripe stats:", error);
    throw error;
  }
}

export async function getStripeRevenueChart() {
  ensureStripeConfigured();
  try {
    const now = new Date();
    const cacheNow = Date.now();
    const cachedChart = globalForStripeCaches._stripeRevenueChartCache;
    if (cachedChart && cachedChart.expiresAt > cacheNow) {
      return cachedChart.payload;
    }

    const monthsMeta: Array<{
      month: string;
      startUnix: number;
      endUnix: number;
    }> = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      monthsMeta.push({
        month: date.toLocaleDateString("tr-TR", {
          month: "short",
          year: "numeric",
        }),
        startUnix: Math.floor(date.getTime() / 1000),
        endUnix: Math.floor(nextDate.getTime() / 1000),
      });
    }

    const chargesByMonth = await Promise.all(
      monthsMeta.map((monthMeta) =>
        stripe.charges.list({
          created: {
            gte: monthMeta.startUnix,
            lt: monthMeta.endUnix,
          },
          limit: 100,
        })
      )
    );

    const months: StripeRevenuePoint[] = monthsMeta.map((monthMeta, index) => {
      const charges = chargesByMonth[index];

      const revenue =
        charges.data
          .filter((charge) => charge.status === "succeeded")
          .reduce((sum, charge) => sum + charge.amount, 0) / 100;

      return {
        month: monthMeta.month,
        revenue,
        subscriptions: charges.data.length,
      };
    });

    globalForStripeCaches._stripeRevenueChartCache = {
      expiresAt: cacheNow + STRIPE_REVENUE_CHART_CACHE_TTL_MS,
      payload: months,
    };

    return months;
  } catch (error) {
    console.error("Error fetching Stripe revenue chart:", error);
    throw error;
  }
}

export async function getStripeTransactions(limit = 50) {
  ensureStripeConfigured();
  try {
    const charges = await stripe.charges.list({
      limit,
      expand: ["data.customer"],
    });

    return charges.data.map((charge) => ({
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency.toUpperCase(),
      status: charge.status as "succeeded" | "pending" | "failed",
      customer: {
        id: charge.customer?.toString() || "",
        name: (charge.customer as any)?.name || "Unknown",
        email: (charge.customer as any)?.email || "unknown@example.com",
      },
      paymentMethod: charge.payment_method_details?.type || "card",
      description: charge.description || "Payment",
      createdAt: new Date(charge.created * 1000).toISOString(),
      stripePaymentIntentId: charge.payment_intent?.toString(),
    }));
  } catch (error) {
    console.error("Error fetching Stripe transactions:", error);
    throw error;
  }
}

export async function getStripeRefunds(limit = 50) {
  ensureStripeConfigured();
  try {
    const refunds = await stripe.refunds.list({
      limit,
      expand: ["data.charge.customer"],
    });

    return refunds.data.map((refund) => ({
      id: refund.id,
      amount: refund.amount / 100,
      currency: refund.currency.toUpperCase(),
      status: refund.status as "succeeded" | "pending" | "failed",
      reason: refund.reason || "requested_by_customer",
      transactionId: refund.charge?.toString() || "",
      customer: {
        id: (refund.charge as any)?.customer?.id || "",
        name: (refund.charge as any)?.customer?.name || "Unknown",
        email: (refund.charge as any)?.customer?.email || "unknown@example.com",
      },
      createdAt: new Date(refund.created * 1000).toISOString(),
      stripeRefundId: refund.id,
    }));
  } catch (error) {
    console.error("Error fetching Stripe refunds:", error);
    throw error;
  }
}

export async function getStripeInvoice(invoiceId: string) {
  ensureStripeConfigured();
  try {
    const invoice = (await stripe.invoices.retrieve(invoiceId, {
      expand: ["customer", "subscription"],
    })) as Stripe.Invoice;

    return {
      id: invoice.id,
      number: invoice.number || `INV-${invoice.id?.slice(-6)}`,
      date: new Date(invoice.created * 1000).toLocaleDateString(),
      dueDate: invoice.due_date
        ? new Date(invoice.due_date * 1000).toLocaleDateString()
        : new Date(invoice.created * 1000).toLocaleDateString(),
      status: invoice.status as "paid" | "pending" | "overdue",
      customer: {
        name: (invoice.customer as Stripe.Customer)?.name || "Unknown Customer",
        email:
          (invoice.customer as Stripe.Customer)?.email || "unknown@example.com",
        address:
          (invoice.customer as Stripe.Customer)?.address?.line1 ||
          "No address provided",
      },
      company: {
        name: "Duolingo Clone",
        address: "456 Business Ave, Suite 100, San Francisco, CA 94107",
        email: "billing@duolingoclone.com",
        phone: "+1 (555) 123-4567",
      },
      items: invoice.lines.data.map((item) => ({
        description: item.description || "Subscription",
        quantity: item.quantity || 1,
        unitPrice: (item.amount || 0) / 100,
        amount: (item.amount || 0) / 100,
      })),
      subtotal: (invoice.subtotal || 0) / 100,
      tax: (invoice.tax || 0) / 100,
      total: (invoice.total || 0) / 100,
      paymentMethod: "Credit Card",
      transactionId: invoice.payment_intent?.toString() || invoice.id,
      stripeInvoiceId: invoice.id,
    };
  } catch (error) {
    console.error("Error fetching Stripe invoice:", error);
    throw error;
  }
}
