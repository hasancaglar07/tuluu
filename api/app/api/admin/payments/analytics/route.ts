import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import PaymentTransaction from "@/models/PaymentTransaction";
import Subscription from "@/models/Subscription";
import Refund from "@/models/Refund";
import { authGuard } from "@/lib/utils";
import { AnalyticsQuerySchema } from "@/lib/validations/payment";

/**
 * @swagger
 * /api/analytics/payments:
 *   get:
 *     summary: Get payment analytics overview and trend data
 *     description: Returns revenue stats, subscriptions, refund metrics, payment method breakdown, and top customers for a given time range and grouping.
 *     tags:
 *       - Analytics
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *         description: Shortcut to select predefined date ranges. Ignored if `startDate` and `endDate` are provided.
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: ISO start date (e.g., 2024-01-01)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: ISO end date (e.g., 2024-01-31)
 *       - in: query
 *         name: groupBy
 *         required: true
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Grouping level for trend data
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                         totalTransactions:
 *                           type: number
 *                         averageTransactionValue:
 *                           type: number
 *                         activeSubscriptions:
 *                           type: number
 *                         failedPayments:
 *                           type: number
 *                         refundRate:
 *                           type: number
 *                         currency:
 *                           type: string
 *                           example: USD
 *                     trends:
 *                       type: object
 *                       properties:
 *                         period:
 *                           type: string
 *                         groupBy:
 *                           type: string
 *                         data:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                               revenue:
 *                                 type: number
 *                               transactions:
 *                                 type: number
 *                               averageValue:
 *                                 type: number
 *                     paymentMethods:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           provider:
 *                             type: string
 *                           count:
 *                             type: number
 *                           revenue:
 *                             type: number
 *                           percentage:
 *                             type: number
 *                     topCustomers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           totalSpent:
 *                             type: number
 *                           transactionCount:
 *                             type: number
 *                     subscriptions:
 *                       type: object
 *                       properties:
 *                         active:
 *                           type: number
 *                         cancelled:
 *                           type: number
 *                         expired:
 *                           type: number
 *                         trialing:
 *                           type: number
 *                     refunds:
 *                       type: object
 *                       properties:
 *                         totalRefunds:
 *                           type: number
 *                         totalRefundAmount:
 *                           type: number
 *                         refundRate:
 *                           type: number
 *       400:
 *         description: Validation error in query parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 errors:
 *                   type: object
 *       500:
 *         description: Server error while fetching analytics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */

export async function GET(request: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) return auth;

    // **Connect to database**
    await connectDB();

    // **Extract and validate query parameters**
    const { searchParams } = new URL(request.url);
    const queryValidation = AnalyticsQuerySchema.safeParse({
      period: searchParams.get("period"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      groupBy: searchParams.get("groupBy"),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: queryValidation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { period, startDate, endDate, groupBy } = queryValidation.data;

    // **Calculate date range**
    let dateRange: { start: Date; end: Date };
    const now = new Date();

    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    } else {
      const daysMap = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 };
      const days = daysMap[period];
      dateRange = {
        start: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
        end: now,
      };
    }

    // **Get revenue overview**
    const revenueStats = await PaymentTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: "completed",
          type: { $ne: "refund" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$netAmount" },
          totalTransactions: { $sum: 1 },
          averageTransactionValue: { $avg: "$netAmount" },
        },
      },
    ]);

    // **Get subscription metrics**
    const subscriptionStats = await Subscription.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    // **Get failed payments**
    const failedPayments = await PaymentTransaction.countDocuments({
      createdAt: { $gte: dateRange.start, $lte: dateRange.end },
      status: "failed",
    });

    // **Get refund metrics**
    const refundStats = await Refund.aggregate([
      {
        $match: {
          requestedAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: "processed",
        },
      },
      {
        $group: {
          _id: null,
          totalRefunds: { $sum: 1 },
          totalRefundAmount: { $sum: "$amount" },
        },
      },
    ]);

    // **Get revenue trend data**
    const groupByFormat = {
      day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      week: { $dateToString: { format: "%Y-W%U", date: "$createdAt" } },
      month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
    };

    const revenueTrend = await PaymentTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: "completed",
          type: { $ne: "refund" },
        },
      },
      {
        $group: {
          _id: groupByFormat[groupBy],
          revenue: { $sum: "$netAmount" },
          transactions: { $sum: 1 },
          averageValue: { $avg: "$netAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // **Get payment method breakdown**
    const paymentMethodStats = await PaymentTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$paymentProvider",
          count: { $sum: 1 },
          revenue: { $sum: "$netAmount" },
        },
      },
    ]);

    // **Get top customers**
    const topCustomers = await PaymentTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange.start, $lte: dateRange.end },
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$netAmount" },
          transactionCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);

    // **Calculate metrics**
    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      averageTransactionValue: 0,
    };
    const activeSubscriptions =
      subscriptionStats.find((s: { _id: string }) => s._id === "active")
        ?.count || 0;
    const refunds = refundStats[0] || { totalRefunds: 0, totalRefundAmount: 0 };

    // **Calculate refund rate**
    const refundRate =
      revenue.totalRevenue > 0
        ? (refunds.totalRefundAmount / revenue.totalRevenue) * 100
        : 0;

    // **Format response data**
    const analyticsData = {
      overview: {
        totalRevenue: revenue.totalRevenue,
        totalTransactions: revenue.totalTransactions,
        averageTransactionValue: revenue.averageTransactionValue,
        activeSubscriptions,
        failedPayments,
        refundRate: Math.round(refundRate * 100) / 100,
        currency: "USD", // Default currency
      },
      trends: {
        period: `${dateRange.start.toISOString().split("T")[0]} to ${
          dateRange.end.toISOString().split("T")[0]
        }`,
        groupBy,
        data: revenueTrend.map((item: RevenueItem) => ({
          date: item._id,
          revenue: item.revenue,
          transactions: item.transactions,
          averageValue: item.averageValue,
        })),
      },
      paymentMethods: paymentMethodStats.map((method: PaymentMethodStat) => ({
        provider: method._id,
        count: method.count,
        revenue: method.revenue,
        percentage:
          revenue.totalRevenue > 0
            ? Math.round((method.revenue / revenue.totalRevenue) * 100 * 100) /
              100
            : 0,
      })),

      topCustomers: topCustomers.map((customer: Customer) => ({
        id: customer._id.toString(),
        username: customer.user.username,
        email: customer.user.email,
        avatar: customer.user.avatar,
        totalSpent: customer.totalSpent,
        transactionCount: customer.transactionCount,
      })),

      subscriptions: {
        active:
          subscriptionStats.find((s: SubscriptionStat) => s._id === "active")
            ?.count || 0,
        cancelled:
          subscriptionStats.find((s: SubscriptionStat) => s._id === "cancelled")
            ?.count || 0,
        expired:
          subscriptionStats.find((s: SubscriptionStat) => s._id === "expired")
            ?.count || 0,
        trialing:
          subscriptionStats.find((s: SubscriptionStat) => s._id === "trialing")
            ?.count || 0,
      },

      refunds: {
        totalRefunds: refunds.totalRefunds,
        totalRefundAmount: refunds.totalRefundAmount,
        refundRate,
      },
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error) {
    console.error("Error fetching payment analytics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment analytics",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
interface RevenueItem {
  _id: string; // or Date if it's a date object
  revenue: number;
  transactions: number;
  averageValue: number;
}
interface PaymentMethodStat {
  _id: string;
  count: number;
  revenue: number;
}

interface Customer {
  _id: string;
  user: {
    username: string;
    email: string;
    avatar?: string;
  };
  totalSpent: number;
  transactionCount: number;
}

interface SubscriptionStat {
  _id: string; // "active", "cancelled", "expired", "trialing"
  count: number;
}
