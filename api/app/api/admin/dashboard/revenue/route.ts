import { authGuard } from "@/lib/utils";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-05-28.basil",
});

/**
 * @swagger
 * /api/admin/revenue/analytics:
 *   get:
 *     summary: Get revenue analytics for current and previous month
 *     tags: [Revenue]
 *     security:
 *       - clerkAuth: []
 *     responses:
 *       200:
 *         description: Revenue analytics data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 amount:
 *                   type: number
 *                   description: Total revenue amount for current month (in dollars)
 *                 percentageChange:
 *                   type: number
 *                   description: Percentage change compared to last month
 *                 trend:
 *                   type: string
 *                   enum: [up, down]
 *                   description: Revenue trend direction
 *                 simulated:
 *                   type: boolean
 *                   description: Indicates if the data is simulated (only present on errors)
 *       500:
 *         description: Server error
 */

export async function GET() {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }
    // Get start and end of current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();

    // Get all successful payments for the current month
    const charges = await stripe.charges.list({
      created: {
        gte: Math.floor(startOfMonth.getTime() / 1000),
        lte: Math.floor(endOfMonth.getTime() / 1000),
      },
      limit: 100,
    });

    // Calculate total revenue
    const revenue = charges.data.reduce((sum, charge) => {
      return sum + charge.amount / 100; // Convert from cents to dollars
    }, 0);

    // Get last month's revenue for comparison
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);

    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setSeconds(endOfLastMonth.getSeconds() - 1);

    const lastMonthCharges = await stripe.charges.list({
      created: {
        gte: Math.floor(startOfLastMonth.getTime() / 1000),
        lte: Math.floor(endOfLastMonth.getTime() / 1000),
      },
      limit: 100,
    });

    const lastMonthRevenue = lastMonthCharges.data.reduce((sum, charge) => {
      return sum + charge.amount / 100;
    }, 0);

    const percentageChange = calculatePercentageChange(
      revenue,
      lastMonthRevenue
    );

    return NextResponse.json({
      amount: revenue,
      percentageChange,
      trend: percentageChange >= 0 ? "up" : "down",
    });
  } catch (error) {
    console.error("Error fetching revenue data:", error);

    // Return simulated data for development
    const revenue = 1352;
    const lastMonthRevenue = 1208;
    const percentageChange = calculatePercentageChange(
      revenue,
      lastMonthRevenue
    );

    return NextResponse.json({
      amount: revenue,
      percentageChange,
      trend: percentageChange >= 0 ? "up" : "down",
      simulated: true, // Flag to indicate this is simulated data
    });
  }
}

// Helper function to calculate percentage change
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}
