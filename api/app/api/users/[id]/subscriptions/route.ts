import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import PaymentTransaction from "@/models/PaymentTransaction";
import User from "@/models/User";
import mongoose from "mongoose";
import connectDB from "@/lib/db/connect";
import { z } from "zod";
import { createPaymentTransactionSchema } from "@/lib/validations/subscrption";



/**
 * @swagger
 * /api/users/{id}/subscriptions:
 *   post:
 *     summary: Create a new subscription transaction
 *     description: |
 *       Creates a new subscription payment transaction for a user. Validates input data,
 *       checks for existing pending transactions to prevent duplicates, generates unique
 *       transaction IDs, and stores comprehensive transaction records with payment provider
 *       data. Supports integration with payment providers like Stripe and includes billing
 *       information, session tracking, and transaction metadata. Requires user authentication.
 *     tags:
 *       - Users
 *       - Subscriptions
 *       - Payments
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk ID of the user creating the subscription
 *         example: "user_2abc123def456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubscriptionRequest'
 *           examples:
 *             stripeSubscription:
 *               summary: Create Stripe subscription transaction
 *               value:
 *                 planId: "60d21b4667d0d8992e610c85"
 *                 amount: 999
 *                 currency: "USD"
 *                 provider: "stripe"
 *                 billingCycle: "monthly"
 *                 description: "Premium Monthly Plan"
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *                 sessionId: "cs_test_1234567890"
 *             annualSubscription:
 *               summary: Create annual subscription
 *               value:
 *                 planId: "60d21b4667d0d8992e610c86"
 *                 amount: 9999
 *                 currency: "USD"
 *                 provider: "stripe"
 *                 billingCycle: "yearly"
 *                 description: "Premium Annual Plan"
 *                 email: "user@example.com"
 *                 name: "John Doe"
 *     responses:
 *       '200':
 *         description: Subscription transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateSubscriptionResponse'
 *             examples:
 *               newTransaction:
 *                 summary: New transaction created
 *                 value:
 *                   success: true
 *                   message: "Transaction created successfully"
 *                   data:
 *                     transaction:
 *                       id: "60d21b4667d0d8992e610c90"
 *                       transactionId: "txn_1704067200_abc123def456"
 *                       status: "pending"
 *                       amount: 999
 *                       currency: "USD"
 *                       createdAt: "2024-01-20T14:30:00Z"
 *                     transactionId: "txn_1704067200_abc123def456"
 *                     isExisting: false
 *               existingTransaction:
 *                 summary: Existing pending transaction found
 *                 value:
 *                   success: true
 *                   message: "Existing pending transaction found"
 *                   data:
 *                     transaction:
 *                       id: "60d21b4667d0d8992e610c90"
 *                       transactionId: "txn_1704067200_abc123def456"
 *                       status: "pending"
 *                       amount: 999
 *                       currency: "USD"
 *                       createdAt: "2024-01-20T14:00:00Z"
 *                     transactionId: "txn_1704067200_abc123def456"
 *                     isExisting: true
 *       '400':
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validationError:
 *                 value:
 *                   message: "validation error"
 *                   errors:
 *                     planId: ["Plan ID is required"]
 *                     amount: ["Amount must be a positive number"]
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   success: false
 *                   error: "Unauthorized"
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionErrorResponse'
 *             examples:
 *               userNotFound:
 *                 value:
 *                   success: false
 *                   error: "User not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   message: "Internal server error"
 *
 *   put:
 *     summary: Update subscription transaction status
 *     description: |
 *       Updates an existing subscription transaction status, typically to mark it as
 *       completed after payment processing. When a transaction is marked as completed,
 *       it automatically updates the user's subscription status, assigns the subscription
 *       plan, and calculates subscription end dates based on the billing cycle. Supports
 *       updating with payment provider data and handles transaction settlement tracking.
 *     tags:
 *       - Users
 *       - Subscriptions
 *       - Payments
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk ID of the user whose subscription to update
 *         example: "user_2abc123def456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSubscriptionRequest'
 *           examples:
 *             completeTransaction:
 *               summary: Mark transaction as completed
 *               value:
 *                 sessionId: "cs_test_1234567890"
 *                 status: "completed"
 *                 stripeData:
 *                   paymentIntentId: "pi_1234567890"
 *                   customerId: "cus_1234567890"
 *                   subscriptionId: "sub_1234567890"
 *             failTransaction:
 *               summary: Mark transaction as failed
 *               value:
 *                 transactionId: "txn_1704067200_abc123def456"
 *                 status: "failed"
 *                 stripeData:
 *                   errorCode: "card_declined"
 *                   errorMessage: "Your card was declined"
 *     responses:
 *       '200':
 *         description: Transaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateSubscriptionResponse'
 *             examples:
 *               transactionCompleted:
 *                 summary: Transaction completed and subscription activated
 *                 value:
 *                   success: true
 *                   message: "Transaction completed successfully"
 *                   data:
 *                     transaction:
 *                       id: "60d21b4667d0d8992e610c90"
 *                       transactionId: "txn_1704067200_abc123def456"
 *                       status: "completed"
 *                       amount: 999
 *                       currency: "USD"
 *                       processedAt: "2024-01-20T14:35:00Z"
 *                       settledAt: "2024-01-20T14:35:00Z"
 *                     subscriptionUpdated: true
 *               transactionFailed:
 *                 summary: Transaction marked as failed
 *                 value:
 *                   success: true
 *                   message: "Transaction failed successfully"
 *                   data:
 *                     transaction:
 *                       id: "60d21b4667d0d8992e610c90"
 *                       transactionId: "txn_1704067200_abc123def456"
 *                       status: "failed"
 *                       amount: 999
 *                       currency: "USD"
 *                       processedAt: "2024-01-20T14:35:00Z"
 *                       settledAt: null
 *                     subscriptionUpdated: false
 *       '400':
 *         description: Bad request - Missing required parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionErrorResponse'
 *             examples:
 *               missingParameters:
 *                 value:
 *                   success: false
 *                   message: "Either sessionId or transactionId is required"
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   success: false
 *                   error: "Unauthorized"
 *       '404':
 *         description: User or transaction not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionErrorResponse'
 *             examples:
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   success: false
 *                   error: "User not found"
 *               transactionNotFound:
 *                 summary: Pending transaction not found
 *                 value:
 *                   success: false
 *                   message: "Pending transaction not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   message: "Internal server error"
 *
 *   get:
 *     summary: Get user's subscription transaction history
 *     description: |
 *       Retrieves a paginated list of subscription transactions for a specific user.
 *       Supports filtering by transaction status and includes comprehensive transaction
 *       details with payment provider information. Returns transaction history with
 *       populated subscription plan details and pagination metadata. Useful for
 *       displaying billing history and transaction tracking.
 *     tags:
 *       - Users
 *       - Subscriptions
 *       - Transactions
 *       - History
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk ID of the user whose subscription history to retrieve
 *         example: "user_2abc123def456"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled, refunded]
 *         description: Filter transactions by status
 *         example: "completed"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of transactions to return per page
 *         example: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *     responses:
 *       '200':
 *         description: Successfully retrieved subscription transaction history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionHistoryResponse'
 *             examples:
 *               transactionHistory:
 *                 summary: User subscription transaction history
 *                 value:
 *                   success: true
 *                   data:
 *                     transactions:
 *                       - _id: "60d21b4667d0d8992e610c90"
 *                         transactionId: "txn_1704067200_abc123def456"
 *                         userId: "60d21b4667d0d8992e610c85"
 *                         type: "subscription"
 *                         status: "completed"
 *                         amount: 999
 *                         currency: "USD"
 *                         paymentProvider: "stripe"
 *                         paymentMethodType: "card"
 *                         itemType: "subscription"
 *                         planId:
 *                           _id: "60d21b4667d0d8992e610c85"
 *                           name: "Premium Monthly"
 *                           price: 999
 *                           currency: "USD"
 *                           billingCycle: "monthly"
 *                         description: "Subscription to plan 60d21b4667d0d8992e610c85"
 *                         billingAddress:
 *                           email: "user@example.com"
 *                           name: "John Doe"
 *                         providerData:
 *                           sessionId: "cs_test_1234567890"
 *                           billingCycle: "monthly"
 *                           paymentIntentId: "pi_1234567890"
 *                           customerId: "cus_1234567890"
 *                           subscriptionId: "sub_1234567890"
 *                         createdAt: "2024-01-20T14:30:00Z"
 *                         processedAt: "2024-01-20T14:35:00Z"
 *                         settledAt: "2024-01-20T14:35:00Z"
 *                       - _id: "60d21b4667d0d8992e610c91"
 *                         transactionId: "txn_1703980800_def456ghi789"
 *                         userId: "60d21b4667d0d8992e610c85"
 *                         type: "subscription"
 *                         status: "completed"
 *                         amount: 999
 *                         currency: "USD"
 *                         paymentProvider: "stripe"
 *                         paymentMethodType: "card"
 *                         itemType: "subscription"
 *                         planId:
 *                           _id: "60d21b4667d0d8992e610c85"
 *                           name: "Premium Monthly"
 *                           price: 999
 *                           currency: "USD"
 *                           billingCycle: "monthly"
 *                         description: "Subscription to plan 60d21b4667d0d8992e610c85"
 *                         billingAddress:
 *                           email: "user@example.com"
 *                           name: "John Doe"
 *                         providerData:
 *                           sessionId: "cs_test_0987654321"
 *                           billingCycle: "monthly"
 *                           paymentIntentId: "pi_0987654321"
 *                           customerId: "cus_1234567890"
 *                           subscriptionId: "sub_1234567890"
 *                         createdAt: "2024-01-19T14:30:00Z"
 *                         processedAt: "2024-01-19T14:35:00Z"
 *                         settledAt: "2024-01-19T14:35:00Z"
 *                     pagination:
 *                       page: 1
 *                       limit: 10
 *                       total: 25
 *                       pages: 3
 *               emptyHistory:
 *                 summary: No transactions found
 *                 value:
 *                   success: true
 *                   data:
 *                     transactions: []
 *                     pagination:
 *                       page: 1
 *                       limit: 10
 *                       total: 0
 *                       pages: 0
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   success: false
 *                   message: "Unauthorized"
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionErrorResponse'
 *             examples:
 *               userNotFound:
 *                 value:
 *                   success: false
 *                   message: "User not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   message: "Internal server error"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSubscriptionRequest:
 *       type: object
 *       required:
 *         - planId
 *         - amount
 *         - email
 *         - name
 *       properties:
 *         planId:
 *           type: string
 *           format: objectId
 *           description: ID of the subscription plan
 *           example: "60d21b4667d0d8992e610c85"
 *         amount:
 *           type: integer
 *           minimum: 1
 *           description: Amount in cents (e.g., 999 for $9.99)
 *           example: 999
 *         currency:
 *           type: string
 *           enum: [USD, EUR, GBP, CAD, AUD]
 *           default: "USD"
 *           description: Currency code
 *           example: "USD"
 *         provider:
 *           type: string
 *           enum: [stripe, paypal, apple, google]
 *           default: "stripe"
 *           description: Payment provider
 *           example: "stripe"
 *         billingCycle:
 *           type: string
 *           enum: [monthly, yearly, weekly, daily]
 *           description: Billing cycle for the subscription
 *           example: "monthly"
 *         description:
 *           type: string
 *           description: Description of the subscription
 *           example: "Premium Monthly Plan"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "user@example.com"
 *         name:
 *           type: string
 *           description: User's full name
 *           example: "John Doe"
 *         sessionId:
 *           type: string
 *           description: Payment provider session ID (e.g., Stripe session ID)
 *           example: "cs_test_1234567890"
 *
 *     TransactionSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: objectId
 *           description: Transaction database ID
 *           example: "60d21b4667d0d8992e610c90"
 *         transactionId:
 *           type: string
 *           description: Unique transaction identifier
 *           example: "txn_1704067200_abc123def456"
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled, refunded]
 *           description: Transaction status
 *           example: "pending"
 *         amount:
 *           type: integer
 *           description: Amount in cents
 *           example: 999
 *         currency:
 *           type: string
 *           description: Currency code
 *           example: "USD"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the transaction was created
 *           example: "2024-01-20T14:30:00Z"
 *         processedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the transaction was processed
 *           example: "2024-01-20T14:35:00Z"
 *         settledAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the transaction was settled
 *           example: "2024-01-20T14:35:00Z"
 *
 *     CreateSubscriptionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Transaction created successfully"
 *         data:
 *           type: object
 *           properties:
 *             transaction:
 *               $ref: '#/components/schemas/TransactionSummary'
 *             transactionId:
 *               type: string
 *               description: Unique transaction identifier
 *               example: "txn_1704067200_abc123def456"
 *             isExisting:
 *               type: boolean
 *               description: Whether this is an existing transaction
 *               example: false
 *
 *     UpdateSubscriptionRequest:
 *       type: object
 *       properties:
 *         sessionId:
 *           type: string
 *           description: Payment provider session ID
 *           example: "cs_test_1234567890"
 *         transactionId:
 *           type: string
 *           description: Transaction ID to update
 *           example: "txn_1704067200_abc123def456"
 *         status:
 *           type: string
 *           enum: [completed, failed, cancelled, refunded]
 *           default: "completed"
 *           description: New transaction status
 *           example: "completed"
 *         stripeData:
 *           type: object
 *           description: Additional payment provider data
 *           properties:
 *             paymentIntentId:
 *               type: string
 *               example: "pi_1234567890"
 *             customerId:
 *               type: string
 *               example: "cus_1234567890"
 *             subscriptionId:
 *               type: string
 *               example: "sub_1234567890"
 *             errorCode:
 *               type: string
 *               example: "card_declined"
 *             errorMessage:
 *               type: string
 *               example: "Your card was declined"
 *
 *     UpdateSubscriptionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Transaction completed successfully"
 *         data:
 *           type: object
 *           properties:
 *             transaction:
 *               $ref: '#/components/schemas/TransactionSummary'
 *             subscriptionUpdated:
 *               type: boolean
 *               description: Whether the user's subscription was updated
 *               example: true
 *
 *     SubscriptionPlan:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Plan ID
 *           example: "60d21b4667d0d8992e610c85"
 *         name:
 *           type: string
 *           description: Plan name
 *           example: "Premium Monthly"
 *         price:
 *           type: integer
 *           description: Plan price in cents
 *           example: 999
 *         currency:
 *           type: string
 *           description: Plan currency
 *           example: "USD"
 *         billingCycle:
 *           type: string
 *           description: Plan billing cycle
 *           example: "monthly"
 *
 *     SubscriptionTransaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Transaction database ID
 *           example: "60d21b4667d0d8992e610c90"
 *         transactionId:
 *           type: string
 *           description: Unique transaction identifier
 *           example: "txn_1704067200_abc123def456"
 *         userId:
 *           type: string
 *           format: objectId
 *           description: User's database ID
 *           example: "60d21b4667d0d8992e610c85"
 *         type:
 *           type: string
 *           description: Transaction type
 *           example: "subscription"
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled, refunded]
 *           description: Transaction status
 *           example: "completed"
 *         amount:
 *           type: integer
 *           description: Amount in cents
 *           example: 999
 *         currency:
 *           type: string
 *           description: Currency code
 *           example: "USD"
 *         paymentProvider:
 *           type: string
 *           description: Payment provider used
 *           example: "stripe"
 *         paymentMethodType:
 *           type: string
 *           description: Payment method type
 *           example: "card"
 *         itemType:
 *           type: string
 *           description: Type of item purchased
 *           example: "subscription"
 *         planId:
 *           $ref: '#/components/schemas/SubscriptionPlan'
 *         description:
 *           type: string
 *           description: Transaction description
 *           example: "Subscription to plan 60d21b4667d0d8992e610c85"
 *         billingAddress:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               format: email
 *               example: "user@example.com"
 *             name:
 *               type: string
 *               example: "John Doe"
 *         providerData:
 *           type: object
 *           description: Payment provider specific data
 *           properties:
 *             sessionId:
 *               type: string
 *               example: "cs_test_1234567890"
 *             billingCycle:
 *               type: string
 *               example: "monthly"
 *             paymentIntentId:
 *               type: string
 *               example: "pi_1234567890"
 *             customerId:
 *               type: string
 *               example: "cus_1234567890"
 *             subscriptionId:
 *               type: string
 *               example: "sub_1234567890"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the transaction was created
 *           example: "2024-01-20T14:30:00Z"
 *         processedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the transaction was processed
 *           example: "2024-01-20T14:35:00Z"
 *         settledAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the transaction was settled
 *           example: "2024-01-20T14:35:00Z"
 *
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         limit:
 *           type: integer
 *           description: Number of items per page
 *           example: 10
 *         total:
 *           type: integer
 *           description: Total number of transactions
 *           example: 25
 *         pages:
 *           type: integer
 *           description: Total number of pages
 *           example: 3
 *
 *     SubscriptionHistoryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             transactions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SubscriptionTransaction'
 *               description: Array of subscription transactions
 *             pagination:
 *               $ref: '#/components/schemas/PaginationInfo'
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Validation error message
 *           example: "validation error"
 *         errors:
 *           type: object
 *           description: Field-specific validation errors
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *           example:
 *             planId: ["Plan ID is required"]
 *             amount: ["Amount must be a positive number"]
 *
 *     SubscriptionErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "User not found"
 *         message:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "User not found"
 *
 *     SubscriptionServerErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Internal server error"
 *         error:
 *           description: Detailed error information (only in development)
 *           example: null
 *
 *   examples:
 *     SubscriptionsApiUsageExample:
 *       summary: How to use the Subscriptions API with Axios
 *       description: |
 *         **Step 1: Create a Subscription Transaction**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const createSubscription = async (userId, subscriptionData) => {
 *           try {
 *             const response = await axios.post(`/api/users/${userId}/subscriptions`, subscriptionData, {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`,
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to create subscription');
 *             }
 *           } catch (error) {
 *             console.error('Failed to create subscription:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const monthlySubscription = await createSubscription('user_2abc123def456', {
 *           planId: '60d21b4667d0d8992e610c85',
 *           amount: 999,
 *           currency: 'USD',
 *           provider: 'stripe',
 *           billingCycle: 'monthly',
 *           description: 'Premium Monthly Plan',
 *           email: 'user@example.com',
 *           name: 'John Doe',
 *           sessionId: 'cs_test_1234567890'
 *         });
 *
 *         const annualSubscription = await createSubscription('user_2abc123def456', {
 *           planId: '60d21b4667d0d8992e610c86',
 *           amount: 9999,
 *           currency: 'USD',
 *           provider: 'stripe',
 *           billingCycle: 'yearly',
 *           description: 'Premium Annual Plan',
 *           email: 'user@example.com',
 *           name: 'John Doe'
 *         });
 *         ```
 *
 *         **Step 2: Update Subscription Transaction Status**
 *         ```javascript
 *         const updateSubscriptionStatus = async (userId, updateData) => {
 *           try {
 *             const response = await axios.put(`/api/users/${userId}/subscriptions`, updateData, {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`,
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to update subscription');
 *             }
 *           } catch (error) {
 *             console.error('Failed to update subscription:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const completePayment = await updateSubscriptionStatus('user_2abc123def456', {
 *           sessionId: 'cs_test_1234567890',
 *           status: 'completed',
 *           stripeData: {
 *             paymentIntentId: 'pi_1234567890',
 *             customerId: 'cus_1234567890',
 *             subscriptionId: 'sub_1234567890'
 *           }
 *         });
 *
 *         const failPayment = await updateSubscriptionStatus('user_2abc123def456', {
 *           transactionId: 'txn_1704067200_abc123def456',
 *           status: 'failed',
 *           stripeData: {
 *             errorCode: 'card_declined',
 *             errorMessage: 'Your card was declined'
 *           }
 *         });
 *         ```
 *
 *         **Step 3: Get Subscription History**
 *         ```javascript
 *         const getSubscriptionHistory = async (userId, options = {}) => {
 *           try {
 *             const {
 *               status,
 *               limit = 10,
 *               page = 1
 *             } = options;
 *
 *             const params = new URLSearchParams({
 *               limit: limit.toString(),
 *               page: page.toString()
 *             });
 *
 *             if (status) params.append('status', status);
 *
 *             const response = await axios.get(`/api/users/${userId}/subscriptions?${params}`, {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to get subscription history');
 *             }
 *           } catch (error) {
 *             console.error('Failed to get subscription history:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const allTransactions = await getSubscriptionHistory('user_2abc123def456');
 *         const completedTransactions = await getSubscriptionHistory('user_2abc123def456', {
 *           status: 'completed'
 *         });
 *         const recentTransactions = await getSubscriptionHistory('user_2abc123def456', {
 *           limit: 5,
 *           page: 1
 *         });
 *         ```
 *
 *         **Step 4: Create a Subscriptions Service**
 *         ```javascript
 *         class SubscriptionsService {
 *           constructor() {
 *             this.client = axios.create({
 *               baseURL: '/api/users',
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             this.setupInterceptors();
 *           }
 *
 *           setupInterceptors() {
 *             this.client.interceptors.request.use(
 *               (config) => {
 *                 const token = localStorage.getItem('authToken');
 *                 if (token) {
 *                   config.headers.Authorization = `Bearer ${token}`;
 *                 }
 *                 return config;
 *               }
 *             );
 *
 *             this.client.interceptors.response.use(
 *               (response) => response,
 *               (error) => {
 *                 if (error.response?.status === 401) {
 *                   this.handleUnauthorized();
 *                 }
 *                 return Promise.reject(error);
 *               }
 *             );
 *           }
 *
 *           handleUnauthorized() {
 *             localStorage.removeItem('authToken');
 *             window.location.href = '/login';
 *           }
 *
 *           async createSubscription(userId, planId, userInfo, options = {}) {
 *             try {
 *               const subscriptionData = {
 *                 planId,
 *                 amount: options.amount,
 *                 currency: options.currency || 'USD',
 *                 provider: options.provider || 'stripe',
 *                 billingCycle: options.billingCycle || 'monthly',
 *                 description: options.description,
 *                 email: userInfo.email,
 *                 name: userInfo.name,
 *                 sessionId: options.sessionId
 *               };
 *
 *               const response = await this.client.post(`/${userId}/subscriptions`, subscriptionData);
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to create subscription');
 *               }
 *             } catch (error) {
 *               console.error('Subscription service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async updateSubscriptionStatus(userId, transactionIdentifier, status, providerData = {}) {
 *             try {
 *               const updateData = {
 *                 status,
 *                 ...transactionIdentifier, // sessionId or transactionId
 *                 stripeData: providerData
 *               };
 *
 *               const response = await this.client.put(`/${userId}/subscriptions`, updateData);
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to update subscription');
 *               }
 *             } catch (error) {
 *               console.error('Subscription update error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async getSubscriptionHistory(userId, options = {}) {
 *             try {
 *               const params = new URLSearchParams();
 *
 *               if (options.status) params.append('status', options.status);
 *               if (options.limit) params.append('limit', options.limit.toString());
 *               if (options.page) params.append('page', options.page.toString());
 *
 *               const response = await this.client.get(`/${userId}/subscriptions?${params}`);
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to get subscription history');
 *               }
 *             } catch (error) {
 *               console.error('Subscription history error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async completePayment(userId, sessionId, stripeData) {
 *             return this.updateSubscriptionStatus(
 *               userId,
 *               { sessionId },
 *               'completed',
 *               stripeData
 *             );
 *           }
 *
 *           async failPayment(userId, transactionId, errorData) {
 *             return this.updateSubscriptionStatus(
 *               userId,
 *               { transactionId },
 *               'failed',
 *               errorData
 *             );
 *           }
 *
 *           async cancelSubscription(userId, transactionId) {
 *             return this.updateSubscriptionStatus(
 *               userId,
 *               { transactionId },
 *               'cancelled'
 *             );
 *           }
 *
 *           async getActiveSubscriptions(userId) {
 *             return this.getSubscriptionHistory(userId, { status: 'completed' });
 *           }
 *
 *           async getPendingTransactions(userId) {
 *             return this.getSubscriptionHistory(userId, { status: 'pending' });
 *           }
 *
 *           // Helper methods
 *           formatAmount(amount, currency = 'USD') {
 *             return new Intl.NumberFormat('en-US', {
 *               style: 'currency',
 *               currency: currency,
 *               minimumFractionDigits: 2
 *             }).format(amount / 100);
 *           }
 *
 *           formatDate(dateString) {
 *             return new Date(dateString).toLocaleDateString();
 *           }
 *
 *           getStatusColor(status) {
 *             switch (status) {
 *               case 'completed': return '#22c55e';
 *               case 'pending': return '#f59e0b';
 *               case 'failed': return '#ef4444';
 *               case 'cancelled': return '#6b7280';
 *               case 'refunded': return '#8b5cf6';
 *               default: return '#6b7280';
 *             }
 *           }
 *         }
 *
 *         export const subscriptionsService = new SubscriptionsService();
 *         ```
 *
 * tags:
 *   - name: Users
 *     description: Operations for managing and retrieving user information
 *   - name: Subscriptions
 *     description: Subscription management and lifecycle operations
 *   - name: Payments
 *     description: Payment processing and transaction management
 *   - name: Transactions
 *     description: Financial transaction tracking and history
 *   - name: History
 *     description: Historical data retrieval and analytics
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();
    // Find user by clerkId
    const user = await User.findByClerkId(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // **Parse and validate request body**
    const body = await request.json();
    const {
      planId,
      amount,
      currency = "USD",
      provider = "stripe",
      billingCycle,
      description,
      email,
      name,
      sessionId, // Stripe session ID for tracking
    } = body;

    // **Input validation**
    const validated = createPaymentTransactionSchema.safeParse(body);
    if (!validated.success) {
      return Response.json(
        {
          message: "validation error",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 500 }
      );
    }

    // **Generate unique transaction ID**
    const transactionId =
      sessionId ||
      `txn_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // **Check for existing pending transaction**
    const existingTransaction = await PaymentTransaction.findOne({
      userId: user._id,
      planId: new mongoose.Types.ObjectId(planId),
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }, // Last 30 minutes
    });

    if (existingTransaction) {
      console.log(`🔄 Found existing pending transaction for user ${id}`);
      return NextResponse.json({
        success: true,
        message: "Existing pending transaction found",
        data: {
          transaction: existingTransaction,
          transactionId: existingTransaction.transactionId,
          isExisting: true,
        },
      });
    }

    // **Create new PaymentTransaction record**
    const transactionData = {
      transactionId,
      userId: user._id,
      type: "subscription",
      status: "pending",
      amount: Math.round(amount), // Ensure integer (cents)
      currency: currency.toUpperCase(),
      paymentProvider: provider,
      paymentMethodType: "card", // Default for Stripe
      itemType: "subscription",
      planId: new mongoose.Types.ObjectId(planId),
      description: description || `Subscription to plan ${planId}`,
      billingAddress: {
        email: email,
        name: name,
      },
      providerData: {
        sessionId,
        billingCycle,
        createdAt: new Date().toISOString(),
        userAgent: request.headers.get("user-agent"),
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
      },
    };

    // **Save transaction to database**
    const transaction = new PaymentTransaction(transactionData);
    await transaction.save();

    console.log(
      `✅ Created pending transaction ${transactionId} for user ${id}`
    );

    // **Return success response**
    return NextResponse.json({
      success: true,
      message: "Transaction created successfully",
      data: {
        transaction: {
          id: transaction._id,
          transactionId: transaction.transactionId,
          status: transaction.status,
          amount: transaction.amount,
          currency: transaction.currency,
          createdAt: transaction.createdAt,
        },
        transactionId: transaction.transactionId,
        isExisting: false,
      },
    });
  } catch (error) {
    console.error("❌ Error creating subscription transaction:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();
    // Find user by clerkId
    const user = await User.findByClerkId(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // **Parse request body**
    const body = await request.json();
    const { sessionId, transactionId, status = "completed", stripeData } = body;

    // **Input validation**
    if (!sessionId && !transactionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Either sessionId or transactionId is required",
        },
        { status: 400 }
      );
    }

    // **Find pending transaction**
    const query = {
      userId: user._id,
      status: "pending",
      ...(sessionId && { "providerData.sessionId": sessionId }),
      ...(transactionId && { transactionId }),
    };

    const transaction = await PaymentTransaction.findOne(query);

    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Pending transaction not found" },
        { status: 404 }
      );
    }

    // **Update transaction status**
    const updateData = {
      status,
      processedAt: new Date(),
      ...(status === "completed" && { settledAt: new Date() }),
      ...(stripeData && {
        providerData: {
          ...transaction.providerData,
          ...stripeData,
          completedAt: new Date().toISOString(),
        },
      }),
    };

    // **Update transaction in database**
    const updatedTransaction = await PaymentTransaction.findByIdAndUpdate(
      transaction._id,
      updateData,
      { new: true }
    );

    if (!updatedTransaction) {
      return NextResponse.json(
        { success: false, error: "transacton not found" },
        { status: 404 }
      );
    }

    // **If payment completed successfully, update user subscription**
    if (status === "completed") {
      // **Update user subscription status**
      await User.findByIdAndUpdate(user._id, {
        subscriptionStatus: "active",
        subscriptionPlanId: transaction.planId,
        subscriptionStartDate: new Date(),
        // Calculate end date based on billing cycle
        subscriptionEndDate: calculateSubscriptionEndDate(
          transaction.providerData?.billingCycle
        ),
        updatedAt: new Date(),
      });

      console.log(
        `✅ Completed subscription for user ${id}, transaction ${transaction.transactionId}`
      );
    }

    // **Return success response**
    return NextResponse.json({
      success: true,
      message: `Transaction ${status} successfully`,
      data: {
        transaction: {
          id: updatedTransaction._id,
          transactionId: updatedTransaction.transactionId,
          status: updatedTransaction.status,
          amount: updatedTransaction.amount,
          currency: updatedTransaction.currency,
          processedAt: updatedTransaction.processedAt,
          settledAt: updatedTransaction.settledAt,
        },
        subscriptionUpdated: status === "completed",
      },
    });
  } catch (error) {
    console.error("❌ Error updating subscription transaction:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // **Authentication & Authorization**
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { id } = await params;
    // **Extract user ID from URL params**
    const url = new URL(request.url);

    // **Parse query parameters**
    const { searchParams } = url;
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    // **Connect to database**
    await connectDB();

    // **Find user**
    const user = await User.findByClerkId(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // **Build query**
    const query = {
      userId: user._id,
      itemType: "subscription",
      ...(status && { status }),
    };

    // **Get transactions with pagination**
    const transactions = await PaymentTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("planId");

    // **Get total count**
    const total = await PaymentTransaction.countDocuments(query);

    // **Return transactions**
    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching subscription transactions:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to calculate subscription end date
 */
function calculateSubscriptionEndDate(billingCycle: string): Date {
  const now = new Date();

  switch (billingCycle) {
    case "monthly":
      return new Date(now.setMonth(now.getMonth() + 1));
    case "quarterly":
      return new Date(now.setMonth(now.getMonth() + 3));
    case "yearly":
      return new Date(now.setFullYear(now.getFullYear() + 1));
    case "lifetime":
      return new Date(now.setFullYear(now.getFullYear() + 100)); // 100 years from now
    default:
      return new Date(now.setMonth(now.getMonth() + 1)); // Default to monthly
  }
}
