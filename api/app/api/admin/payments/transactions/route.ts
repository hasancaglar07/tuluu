import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import PaymentTransaction, {
  PaymentTransactionDocument,
} from "@/models/PaymentTransaction";
import User from "@/models/User";
import {
  PaymentTransactionCreateSchema,
  PaymentTransactionQuerySchema,
} from "@/lib/validations/payment";
import { FilterQuery } from "mongoose";
import { authGuard } from "@/lib/utils";

/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionPlanResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/TransformedPlan'
 *     SubscriptionPlanUpdateResponse:
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
 *           example: "Subscription plan updated successfully"
 *     SubscriptionPlanDeleteResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Subscription plan archived successfully"
 *     SubscriptionPlanStatusResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *             status:
 *               type: string
 *               enum: [active, inactive, archived]
 *               example: "active"
 *             active:
 *               type: boolean
 *               example: true
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: "2023-06-15T14:30:00Z"
 *         message:
 *           type: string
 *           example: "Quest activated successfully"
 *     SubscriptionPlanUpdateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Updated Premium Plan"
 *         slug:
 *           type: string
 *           example: "updated-premium-plan"
 *         description:
 *           type: string
 *           example: "Updated description for premium features"
 *         shortDescription:
 *           type: string
 *           example: "Updated short description"
 *         price:
 *           type: number
 *           example: 3499
 *           description: "Price in cents"
 *           minimum: 0
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
 *           minimum: 0
 *           nullable: true
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Updated feature 1", "Updated feature 2", "New feature 3"]
 *         maxUsers:
 *           type: number
 *           example: 15
 *           minimum: 1
 *           nullable: true
 *         maxProjects:
 *           type: number
 *           example: 150
 *           minimum: 1
 *           nullable: true
 *         maxStorage:
 *           type: number
 *           example: 1500
 *           description: "Storage limit in GB"
 *           minimum: 1
 *           nullable: true
 *         maxApiCalls:
 *           type: number
 *           example: 15000
 *           minimum: 1
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
 *           example: 2
 *           minimum: 0
 *         promotionalPrice:
 *           type: number
 *           example: 2499
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
 *               example: "2023-07-01T00:00:00Z"
 *             endDate:
 *               type: string
 *               format: date-time
 *               example: "2023-07-31T23:59:59Z"
 *         stripeProductId:
 *           type: string
 *           example: "prod_updated_123"
 *           nullable: true
 *         stripePriceId:
 *           type: string
 *           example: "price_updated_123"
 *           nullable: true
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           example:
 *             category: "premium"
 *             lastUpdated: "2023-06-15"
 *     SubscriptionPlanStatusRequest:
 *       type: object
 *       required:
 *         - active
 *       properties:
 *         active:
 *           type: boolean
 *           example: true
 *           description: "Set to true to activate the plan, false to deactivate"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Subscription plan not found"
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
 *           nullable: true
 *         promotionalPeriod:
 *           type: object
 *           nullable: true
 *           properties:
 *             startDate:
 *               type: string
 *               format: date-time
 *             endDate:
 *               type: string
 *               format: date-time
 *         stripeProductId:
 *           type: string
 *           example: "prod_stripe_123"
 *           nullable: true
 *         stripePriceId:
 *           type: string
 *           example: "price_stripe_123"
 *           nullable: true
 *         metadata:
 *           type: object
 *           additionalProperties: true
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
 */

/**
 * @swagger
 * /api/subscription-plans/{id}:
 *   get:
 *     summary: Get subscription plan by ID
 *     description: |
 *       Retrieves a single subscription plan by its ID.
 *       Returns the plan with transformed data including formatted pricing.
 *       This endpoint does not require authentication.
 *     tags:
 *       - Subscription Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the subscription plan
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     responses:
 *       '200':
 *         description: Successfully retrieved subscription plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionPlanResponse'
 *             examples:
 *               basic_plan:
 *                 summary: Basic plan response
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                     name: "Basic Plan"
 *                     slug: "basic-plan"
 *                     description: "Perfect for getting started"
 *                     price: 999
 *                     currency: "USD"
 *                     billingCycle: "monthly"
 *                     features: ["5 projects", "Basic support"]
 *                     status: "active"
 *                     isPopular: false
 *                     isVisible: true
 *                     formattedPrice: "9.99"
 *                     createdAt: "2023-06-15T14:30:00Z"
 *                     updatedAt: "2023-06-15T14:30:00Z"
 *               premium_plan_with_promotion:
 *                 summary: Premium plan with promotional pricing
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "64a7b8c9d1e2f3a4b5c6d7e9"
 *                     name: "Premium Plan"
 *                     slug: "premium-plan"
 *                     description: "Full access to all features"
 *                     price: 2999
 *                     currency: "USD"
 *                     billingCycle: "monthly"
 *                     promotionalPrice: 1999
 *                     promotionalPeriod:
 *                       startDate: "2023-06-01T00:00:00Z"
 *                       endDate: "2023-06-30T23:59:59Z"
 *                     features: ["Unlimited projects", "Priority support"]
 *                     status: "active"
 *                     isPopular: true
 *                     isVisible: true
 *                     formattedPrice: "29.99"
 *       '404':
 *         description: Subscription plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Subscription plan not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to fetch subscription plan"
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /api/subscription-plans/{id}:
 *   put:
 *     summary: Update subscription plan
 *     description: |
 *       Updates a subscription plan with the provided data.
 *       Completely replaces the plan data with the new values.
 *       Requires authentication.
 *     tags:
 *       - Subscription Plans
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the subscription plan
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionPlanUpdateRequest'
 *           examples:
 *             update_basic_plan:
 *               summary: Update basic plan details
 *               value:
 *                 name: "Updated Basic Plan"
 *                 description: "Updated description for basic plan"
 *                 price: 1299
 *                 features: ["10 projects", "Enhanced support", "2GB storage"]
 *                 maxProjects: 10
 *                 maxStorage: 2
 *             update_with_promotion:
 *               summary: Update plan with promotional pricing
 *               value:
 *                 name: "Premium Plan - Summer Sale"
 *                 price: 2999
 *                 promotionalPrice: 1999
 *                 promotionalPeriod:
 *                   startDate: "2023-07-01T00:00:00Z"
 *                   endDate: "2023-08-31T23:59:59Z"
 *                 isPopular: true
 *             update_enterprise_plan:
 *               summary: Update enterprise plan
 *               value:
 *                 name: "Enterprise Plan"
 *                 price: 9999
 *                 billingCycle: "yearly"
 *                 features: ["Unlimited everything", "Dedicated support"]
 *                 maxUsers: null
 *                 maxProjects: null
 *                 status: "active"
 *     responses:
 *       '200':
 *         description: Successfully updated subscription plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionPlanUpdateResponse'
 *             example:
 *               success: true
 *               data:
 *                 plan:
 *                   id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                   name: "Updated Premium Plan"
 *                   slug: "updated-premium-plan"
 *                   description: "Updated premium features"
 *                   price: 3499
 *                   currency: "USD"
 *                   billingCycle: "monthly"
 *                   status: "active"
 *                   formattedPrice: "34.99"
 *                   updatedAt: "2023-06-15T15:30:00Z"
 *               message: "Subscription plan updated successfully"
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation error"
 *               errors:
 *                 "price": ["Price must be a positive number"]
 *                 "billingCycle": ["Invalid billing cycle"]
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Subscription plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Subscription plan not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/subscription-plans/{id}:
 *   delete:
 *     summary: Archive subscription plan
 *     description: |
 *       Archives a subscription plan instead of permanently deleting it.
 *       Sets the plan status to "archived" and visibility to false.
 *       This preserves data integrity while removing the plan from active use.
 *       Requires authentication.
 *     tags:
 *       - Subscription Plans
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the subscription plan
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     responses:
 *       '200':
 *         description: Successfully archived subscription plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionPlanDeleteResponse'
 *             example:
 *               success: true
 *               message: "Subscription plan archived successfully"
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Subscription plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Subscription plan not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to delete subscription plan"
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /api/subscription-plans/{id}:
 *   patch:
 *     summary: Update subscription plan status
 *     description: |
 *       Updates only the status of a subscription plan (active/inactive).
 *       This is a lightweight operation for toggling plan availability.
 *       Requires authentication.
 *     tags:
 *       - Subscription Plans
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the subscription plan
 *         example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubscriptionPlanStatusRequest'
 *           examples:
 *             activate_plan:
 *               summary: Activate subscription plan
 *               value:
 *                 active: true
 *             deactivate_plan:
 *               summary: Deactivate subscription plan
 *               value:
 *                 active: false
 *     responses:
 *       '200':
 *         description: Successfully updated subscription plan status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionPlanStatusResponse'
 *             examples:
 *               activated:
 *                 summary: Plan activated successfully
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                     status: "active"
 *                     active: true
 *                     updatedAt: "2023-06-15T15:30:00Z"
 *                   message: "Quest activated successfully"
 *               deactivated:
 *                 summary: Plan deactivated successfully
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                     status: "inactive"
 *                     active: false
 *                     updatedAt: "2023-06-15T15:30:00Z"
 *                   message: "Quest deactivated successfully"
 *       '400':
 *         description: Validation error or invalid action
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     "active": ["Active field is required"]
 *               invalid_action:
 *                 summary: Invalid action
 *                 value:
 *                   success: false
 *                   error: "Invalid action"
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: Subscription plan not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Quest not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Failed to update quest status"
 *               details: "Database connection error"
 */

export async function GET(request: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }
    // **Connect to database**
    await connectDB();

    // **Extract and validate query parameters**
    const { searchParams } = new URL(request.url);
    const queryValidation = PaymentTransactionQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      status: searchParams.get("status"),
      type: searchParams.get("type"),
      paymentProvider: searchParams.get("paymentProvider"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
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

    const {
      page,
      limit,
      status,
      type,
      paymentProvider,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = queryValidation.data;

    // **Build filter query**
    const filter: FilterQuery<PaymentTransactionDocument> = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (paymentProvider) filter.paymentProvider = paymentProvider;

    // **Date range filter**
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // **Calculate pagination**
    const pageNum = Number.parseInt(page);
    const limitNum = Number.parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // **Build sort object**
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // **Execute queries in parallel**
    const [transactions, totalCount] = await Promise.all([
      PaymentTransaction.find(filter)
        .populate("userId", "username email avatar")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      PaymentTransaction.countDocuments(filter),
    ]);

    // **Transform transactions for frontend**
    const transformedTransactions: TransformedTransaction[] = transactions.map(
      (transaction) => ({
        id: transaction._id.toString(),
        transactionId: transaction.transactionId ?? "",
        user: {
          id: transaction.userId._id.toString(),
          username: "",
          email: "",
          avatar: "",
        },
        type: transaction.type,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        netAmount: transaction.netAmount,
        paymentProvider: transaction.paymentProvider,
        paymentMethodType: transaction.paymentMethodType,
        lastFourDigits: transaction.lastFourDigits ?? "",
        cardBrand: transaction.cardBrand ?? "",
        itemType: transaction.itemType,
        description: transaction.description,
        receiptUrl: transaction.receiptUrl ?? "",
        failureReason: transaction.failureReason ?? "",
        processedAt: transaction.processedAt
          ? transaction.processedAt.toISOString()
          : "",
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
      })
    );

    // **Calculate pagination metadata**
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // **Get summary statistics**
    const summaryStats = await PaymentTransaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$netAmount", 0],
            },
          },
          totalTransactions: { $sum: 1 },
          completedTransactions: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          failedTransactions: {
            $sum: {
              $cond: [{ $eq: ["$status", "failed"] }, 1, 0],
            },
          },
          refundedTransactions: {
            $sum: {
              $cond: [{ $eq: ["$status", "refunded"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const summary = summaryStats[0] || {
      totalRevenue: 0,
      totalTransactions: 0,
      completedTransactions: 0,
      failedTransactions: 0,
      refundedTransactions: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        transactions: transformedTransactions,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNum,
        },
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching payment transactions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment transactions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authGuard();
    if (auth instanceof NextResponse) {
      return auth; // early return on unauthorized or forbidden
    }
    // **Connect to database**
    await connectDB();

    // **Parse and validate request body**
    const body = await request.json();
    const validation = PaymentTransactionCreateSchema.safeParse(body);

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

    // **Verify user exists**
    const user = await User.findById(data.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // **Generate unique transaction ID**
    const transactionId = `TXN_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // **Create payment transaction**
    const transaction = new PaymentTransaction({
      ...data,
      transactionId,
      status: "pending", // Default status
      netAmount: data.amount, // Will be calculated in pre-save middleware
    });

    await transaction.save();

    // **Populate user data for response**
    await transaction.populate("userId", "username email avatar");

    // **Transform for frontend response**
    const transformedTransaction = {
      id: transaction._id.toString(),
      transactionId: transaction.transactionId,
      user: {
        id: transaction.userId._id.toString(),
        username: "",
        email: "",
        avatar: "",
      },
      type: transaction.type,
      status: transaction.status,
      amount: transaction.amount,
      currency: transaction.currency,
      netAmount: transaction.netAmount,
      paymentProvider: transaction.paymentProvider,
      paymentMethodType: transaction.paymentMethodType,
      itemType: transaction.itemType,
      description: transaction.description,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: transformedTransaction,
        message: "Payment transaction created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating payment transaction:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment transaction",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
export type TransformedTransaction = {
  id: string;
  transactionId: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatar: string;
  };
  type: string;
  status: string;
  amount: number;
  currency: string;
  netAmount: number;
  paymentProvider: string;
  paymentMethodType: string;
  lastFourDigits: string;
  cardBrand: string;
  itemType: string;
  description: string;
  receiptUrl: string;
  failureReason: string | null;
  processedAt: string; // or Date if you're using Date objects
  createdAt: string; // or Date
  updatedAt: string; // or Date
};
