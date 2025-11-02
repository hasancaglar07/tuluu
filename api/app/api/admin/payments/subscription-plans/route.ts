import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { SubscriptionPlanCreateSchema } from "@/lib/validations/payment";
import { authGuard } from "@/lib/utils";
import { PlanStat, SubscriptionPlanDoc, TransformedPlan } from "@/types";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     SubscriptionPlansResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             plans:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TransformedPlan'
 *             stats:
 *               $ref: '#/components/schemas/PlanStats'
 *     SubscriptionPlanCreateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             plan:
 *               $ref: '#/components/schemas/TransformedPlan'
 *         message:
 *           type: string
 *           example: "Subscription plan created successfully"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Failed to fetch subscription plans"
 *         error:
 *           type: string
 *           example: "Database connection error"
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *           example:
 *             "name": ["Name is required"]
 *             "price": ["Price must be a positive number"]
 *     TransformedPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *           description: "MongoDB ObjectId as string"
 *         name:
 *           type: string
 *           example: "Premium Plan"
 *         slug:
 *           type: string
 *           example: "premium-plan"
 *         description:
 *           type: string
 *           example: "Full access to all premium features"
 *         shortDescription:
 *           type: string
 *           example: "Premium features included"
 *         price:
 *           type: number
 *           example: 2999
 *           description: "Price in cents"
 *         currency:
 *           type: string
 *           example: "USD"
 *         billingCycle:
 *           type: string
 *           enum: [monthly, yearly, weekly, daily]
 *           example: "monthly"
 *         trialPeriodDays:
 *           type: number
 *           example: 14
 *           nullable: true
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Unlimited projects", "24/7 support", "Advanced analytics"]
 *         maxUsers:
 *           type: number
 *           example: 10
 *           nullable: true
 *         maxProjects:
 *           type: number
 *           example: 100
 *           nullable: true
 *         maxStorage:
 *           type: number
 *           example: 1000
 *           description: "Storage limit in GB"
 *           nullable: true
 *         maxApiCalls:
 *           type: number
 *           example: 10000
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *           example: "active"
 *         isPopular:
 *           type: boolean
 *           example: true
 *         isVisible:
 *           type: boolean
 *           example: true
 *         sortOrder:
 *           type: number
 *           example: 1
 *         promotionalPrice:
 *           type: number
 *           example: 1999
 *           description: "Promotional price in cents"
 *           nullable: true
 *         promotionalPeriod:
 *           type: object
 *           nullable: true
 *           properties:
 *             startDate:
 *               type: string
 *               format: date-time
 *               example: "2023-06-01T00:00:00Z"
 *             endDate:
 *               type: string
 *               format: date-time
 *               example: "2023-06-30T23:59:59Z"
 *         stripeProductId:
 *           type: string
 *           example: "prod_stripe_123"
 *           nullable: true
 *         stripePriceId:
 *           type: string
 *           example: "price_stripe_123"
 *           nullable: true
 *         checkoutLink:
 *           type: string
 *           example: "https://checkout.stripe.com/pay/cs_test_123"
 *           nullable: true
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           example:
 *             category: "business"
 *             priority: "high"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T14:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T14:30:00Z"
 *         formattedPrice:
 *           type: string
 *           example: "29.99"
 *           description: "Price formatted as decimal string"
 *         currentPrice:
 *           type: number
 *           example: 1999
 *           description: "Current effective price (promotional or regular)"
 *         isOnPromotion:
 *           type: boolean
 *           example: true
 *           description: "Whether the plan is currently on promotion"
 *     PlanStats:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           example: 5
 *           description: "Total number of plans"
 *         active:
 *           type: number
 *           example: 3
 *           description: "Number of active plans"
 *         inactive:
 *           type: number
 *           example: 1
 *           description: "Number of inactive plans"
 *         archived:
 *           type: number
 *           example: 1
 *           description: "Number of archived plans"
 *     SubscriptionPlanCreateRequest:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - currency
 *         - billingCycle
 *       properties:
 *         name:
 *           type: string
 *           example: "Premium Plan"
 *           description: "Name of the subscription plan"
 *         slug:
 *           type: string
 *           example: "premium-plan"
 *           description: "URL-friendly identifier"
 *         description:
 *           type: string
 *           example: "Full access to all premium features with priority support"
 *         shortDescription:
 *           type: string
 *           example: "Premium features included"
 *         price:
 *           type: number
 *           example: 2999
 *           description: "Price in cents (e.g., 2999 = $29.99)"
 *           minimum: 0
 *         currency:
 *           type: string
 *           example: "USD"
 *           description: "ISO currency code"
 *         billingCycle:
 *           type: string
 *           enum: [monthly, yearly, weekly, daily]
 *           example: "monthly"
 *         trialPeriodDays:
 *           type: number
 *           example: 14
 *           minimum: 0
 *           nullable: true
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Unlimited projects", "24/7 support", "Advanced analytics"]
 *         maxUsers:
 *           type: number
 *           example: 10
 *           minimum: 1
 *           nullable: true
 *         maxProjects:
 *           type: number
 *           example: 100
 *           minimum: 1
 *           nullable: true
 *         maxStorage:
 *           type: number
 *           example: 1000
 *           description: "Storage limit in GB"
 *           minimum: 1
 *           nullable: true
 *         maxApiCalls:
 *           type: number
 *           example: 10000
 *           minimum: 1
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *           example: "active"
 *           default: "active"
 *         isPopular:
 *           type: boolean
 *           example: true
 *           default: false
 *         isVisible:
 *           type: boolean
 *           example: true
 *           default: true
 *         sortOrder:
 *           type: number
 *           example: 1
 *           minimum: 0
 *           default: 0
 *         promotionalPrice:
 *           type: number
 *           example: 1999
 *           description: "Promotional price in cents"
 *           minimum: 0
 *           nullable: true
 *         promotionalPeriod:
 *           type: object
 *           nullable: true
 *           properties:
 *             startDate:
 *               type: string
 *               format: date-time
 *               example: "2023-06-01T00:00:00Z"
 *             endDate:
 *               type: string
 *               format: date-time
 *               example: "2023-06-30T23:59:59Z"
 *         stripeProductId:
 *           type: string
 *           example: "prod_stripe_123"
 *           nullable: true
 *         stripePriceId:
 *           type: string
 *           example: "price_stripe_123"
 *           nullable: true
 *         checkoutLink:
 *           type: string
 *           example: "https://checkout.stripe.com/pay/cs_test_123"
 *           nullable: true
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           example:
 *             category: "business"
 *             priority: "high"
 */

/**
 * @swagger
 * /api/subscription-plans:
 *   get:
 *     summary: Get subscription plans
 *     description: |
 *       Retrieves a list of subscription plans with optional filtering.
 *       Returns transformed plan data with computed fields like current pricing and promotion status.
 *       Also includes aggregated statistics about plan statuses.
 *     tags:
 *       - Subscription Plans
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, archived]
 *         description: Filter plans by status
 *         required: false
 *         example: "active"
 *       - in: query
 *         name: isVisible
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter plans by visibility
 *         required: false
 *         example: "true"
 *       - in: query
 *         name: billingCycle
 *         schema:
 *           type: string
 *           enum: [monthly, yearly, weekly, daily]
 *         description: Filter plans by billing cycle
 *         required: false
 *         example: "monthly"
 *     responses:
 *       '200':
 *         description: Successfully retrieved subscription plans
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionPlansResponse'
 *             examples:
 *               success_response:
 *                 summary: Successful response with plans and stats
 *                 value:
 *                   success: true
 *                   data:
 *                     plans:
 *                       - id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                         name: "Basic Plan"
 *                         slug: "basic-plan"
 *                         description: "Perfect for getting started"
 *                         price: 999
 *                         currency: "USD"
 *                         billingCycle: "monthly"
 *                         status: "active"
 *                         isPopular: false
 *                         isVisible: true
 *                         formattedPrice: "9.99"
 *                         currentPrice: 999
 *                         isOnPromotion: false
 *                       - id: "64a7b8c9d1e2f3a4b5c6d7e9"
 *                         name: "Premium Plan"
 *                         slug: "premium-plan"
 *                         description: "Full access to all features"
 *                         price: 2999
 *                         currency: "USD"
 *                         billingCycle: "monthly"
 *                         status: "active"
 *                         isPopular: true
 *                         isVisible: true
 *                         promotionalPrice: 1999
 *                         formattedPrice: "29.99"
 *                         currentPrice: 1999
 *                         isOnPromotion: true
 *                     stats:
 *                       total: 5
 *                       active: 3
 *                       inactive: 1
 *                       archived: 1
 *               filtered_response:
 *                 summary: Filtered response (active plans only)
 *                 value:
 *                   success: true
 *                   data:
 *                     plans:
 *                       - id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                         name: "Basic Plan"
 *                         status: "active"
 *                         isVisible: true
 *                         price: 999
 *                         formattedPrice: "9.99"
 *                     stats:
 *                       total: 1
 *                       active: 1
 *                       inactive: 0
 *                       archived: 0
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to fetch subscription plans"
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /api/subscription-plans:
 *   post:
 *     summary: Create a new subscription plan
 *     description: |
 *       Creates a new subscription plan with the provided data.
 *       All required fields must be provided and will be validated against the schema.
 *       Returns the created plan with computed fields like formatted price.
 *     tags:
 *       - Subscription Plans
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionPlanCreateRequest'
 *           examples:
 *             basic_plan:
 *               summary: Create a basic plan
 *               value:
 *                 name: "Basic Plan"
 *                 slug: "basic-plan"
 *                 description: "Perfect for individuals getting started"
 *                 shortDescription: "Essential features"
 *                 price: 999
 *                 currency: "USD"
 *                 billingCycle: "monthly"
 *                 trialPeriodDays: 7
 *                 features: ["5 projects", "Basic support", "1GB storage"]
 *                 maxUsers: 1
 *                 maxProjects: 5
 *                 maxStorage: 1
 *                 maxApiCalls: 1000
 *                 status: "active"
 *                 isPopular: false
 *                 isVisible: true
 *                 sortOrder: 1
 *             premium_plan_with_promotion:
 *               summary: Create a premium plan with promotional pricing
 *               value:
 *                 name: "Premium Plan"
 *                 slug: "premium-plan"
 *                 description: "Full access to all premium features with priority support"
 *                 shortDescription: "Everything you need"
 *                 price: 2999
 *                 currency: "USD"
 *                 billingCycle: "monthly"
 *                 trialPeriodDays: 14
 *                 features: ["Unlimited projects", "Priority support", "100GB storage", "Advanced analytics"]
 *                 maxUsers: 10
 *                 maxProjects: null
 *                 maxStorage: 100
 *                 maxApiCalls: 50000
 *                 status: "active"
 *                 isPopular: true
 *                 isVisible: true
 *                 sortOrder: 2
 *                 promotionalPrice: 1999
 *                 promotionalPeriod:
 *                   startDate: "2023-06-01T00:00:00Z"
 *                   endDate: "2023-06-30T23:59:59Z"
 *                 stripeProductId: "prod_premium_123"
 *                 stripePriceId: "price_premium_123"
 *                 metadata:
 *                   category: "premium"
 *                   targetAudience: "businesses"
 *             enterprise_plan:
 *               summary: Create an enterprise plan
 *               value:
 *                 name: "Enterprise Plan"
 *                 slug: "enterprise-plan"
 *                 description: "Custom solution for large organizations"
 *                 price: 9999
 *                 currency: "USD"
 *                 billingCycle: "yearly"
 *                 features: ["Unlimited everything", "Dedicated support", "Custom integrations"]
 *                 status: "active"
 *                 isPopular: false
 *                 isVisible: false
 *                 sortOrder: 3
 *     responses:
 *       '201':
 *         description: Successfully created subscription plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionPlanCreateResponse'
 *             example:
 *               success: true
 *               data:
 *                 plan:
 *                   id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                   name: "Premium Plan"
 *                   slug: "premium-plan"
 *                   description: "Full access to all premium features"
 *                   price: 2999
 *                   currency: "USD"
 *                   billingCycle: "monthly"
 *                   status: "active"
 *                   isPopular: true
 *                   isVisible: true
 *                   formattedPrice: "29.99"
 *                   createdAt: "2023-06-15T14:30:00Z"
 *                   updatedAt: "2023-06-15T14:30:00Z"
 *               message: "Subscription plan created successfully"
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation errors
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     "name": ["Name is required"]
 *                     "price": ["Price must be a positive number"]
 *                     "currency": ["Currency must be a valid ISO code"]
 *                     "billingCycle": ["Invalid billing cycle"]
 *               missing_required_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     "name": ["Required"]
 *                     "price": ["Required"]
 *                     "currency": ["Required"]
 *                     "billingCycle": ["Required"]
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to create subscription plan"
 *               error: "Database connection error"
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) return auth;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as
      | SubscriptionPlanDoc["status"]
      | null;
    const isVisible = searchParams.get("isVisible");
    const billingCycle = searchParams.get("billingCycle") as
      | SubscriptionPlanDoc["billingCycle"]
      | null;

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (isVisible !== null) filter.isVisible = isVisible === "true";
    if (billingCycle) filter.billingCycle = billingCycle;

    const plans = (await SubscriptionPlan.find(filter)
      .sort({ sortOrder: 1, price: 1 })
      .lean()) as SubscriptionPlanDoc[];

    const transformedPlans: TransformedPlan[] = plans.map((plan) => ({
      id: plan._id.toString(),
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      shortDescription: plan.shortDescription,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      trialPeriodDays: plan.trialPeriodDays,
      features: plan.features,
      maxUsers: plan.maxUsers,
      maxProjects: plan.maxProjects,
      maxStorage: plan.maxStorage,
      maxApiCalls: plan.maxApiCalls,
      status: plan.status,
      isPopular: plan.isPopular,
      isVisible: plan.isVisible,
      sortOrder: plan.sortOrder,
      promotionalPrice: plan.promotionalPrice,
      promotionalPeriod: plan.promotionalPeriod,
      stripeProductId: plan.stripeProductId,
      stripePriceId: plan.stripePriceId,
      checkoutLink: plan.checkoutLink,
      metadata: plan.metadata,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      formattedPrice: (plan.price / 100).toFixed(2),
      currentPrice:
        plan.promotionalPrice &&
        plan.promotionalPeriod &&
        new Date() >= new Date(plan.promotionalPeriod.startDate ?? 0) &&
        new Date() <= new Date(plan.promotionalPeriod.endDate ?? 0)
          ? plan.promotionalPrice
          : plan.price,
      isOnPromotion: !!(
        plan.promotionalPrice &&
        plan.promotionalPeriod &&
        new Date() >= new Date(plan.promotionalPeriod.startDate ?? 0) &&
        new Date() <= new Date(plan.promotionalPeriod.endDate ?? 0)
      ),
    }));

    const stats = (await SubscriptionPlan.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])) as PlanStat[];

    const planStats = {
      total: plans.length,
      active: stats.find((s) => s._id === "active")?.count || 0,
      inactive: stats.find((s) => s._id === "inactive")?.count || 0,
      archived: stats.find((s) => s._id === "archived")?.count || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        plans: transformedPlans,
        stats: planStats,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch subscription plans",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) return auth;

    // **Connect to database**
    await connectDB();

    // **Parse and validate request body**
    const body = await request.json();
    const validation = SubscriptionPlanCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // **Create subscription plan**
    const plan = new SubscriptionPlan(data);
    await plan.save();

    // **Transform for frontend response**
    const transformedPlan = {
      id: plan._id.toString(),
      name: plan.name,
      description: plan.description,
      shortDescription: plan.shortDescription,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      trialPeriodDays: plan.trialPeriodDays,
      features: plan.features,
      status: plan.status,
      isPopular: plan.isPopular,
      isVisible: plan.isVisible,
      sortOrder: plan.sortOrder,
      metadata: plan.metadata,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      formattedPrice: (plan.price / 100).toFixed(2),
    };

    return NextResponse.json(
      {
        success: true,
        data: { plan: transformedPlan },
        message: "Subscription plan created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create subscription plan",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
