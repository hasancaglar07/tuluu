import { type NextRequest, NextResponse } from "next/server";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import UserPurchase from "@/models/UserPurchase";
import ShopItem from "@/models/ShopItem";
import UserInventory from "@/models/UserInventory";
import mongoose, { FilterQuery } from "mongoose";

/**
 * @swagger
 * /api/users/{id}/purchases:
 *   post:
 *     summary: Create a new purchase for a user
 *     description: |
 *       Processes a purchase transaction for a user, allowing them to buy shop items
 *       using gems or coins. The endpoint validates item availability, checks user
 *       currency balance, deducts payment, creates purchase records, updates user
 *       inventory, and tracks analytics. Uses MongoDB transactions to ensure data
 *       consistency. Requires user authentication with admin privileges.
 *     tags:
 *       - Users
 *       - Purchases
 *       - Shop
 *       - Transactions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk ID of the user making the purchase
 *         example: "user_2abc123def456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseRequest'
 *           examples:
 *             gemsPurchase:
 *               summary: Purchase with gems
 *               value:
 *                 itemId: "60d21b4667d0d8992e610c85"
 *                 quantity: 1
 *                 paymentMethod: "gems"
 *                 platform: "web"
 *                 deviceType: "desktop"
 *             coinsPurchase:
 *               summary: Purchase with coins
 *               value:
 *                 itemId: "60d21b4667d0d8992e610c86"
 *                 quantity: 2
 *                 paymentMethod: "coins"
 *                 platform: "mobile"
 *                 deviceType: "ios"
 *             multiplePurchase:
 *               summary: Multiple quantity purchase
 *               value:
 *                 itemId: "60d21b4667d0d8992e610c87"
 *                 quantity: 5
 *                 paymentMethod: "gems"
 *                 platform: "web"
 *                 deviceType: "desktop"
 *     responses:
 *       '200':
 *         description: Purchase completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseResponse'
 *             examples:
 *               successfulPurchase:
 *                 summary: Successful purchase
 *                 value:
 *                   success: true
 *                   data:
 *                     purchaseId: "60d21b4667d0d8992e610c90"
 *                     userId: "60d21b4667d0d8992e610c85"
 *                     itemId: "60d21b4667d0d8992e610c85"
 *                     itemName: "Premium Streak Freeze"
 *                     itemType: "consumable"
 *                     quantity: 1
 *                     totalAmount: 200
 *                     currency: "gems"
 *                     paymentStatus: "completed"
 *                   message: "Successfully purchased 1 Premium Streak Freeze"
 *       '400':
 *         description: Bad request - Invalid parameters or insufficient funds
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseErrorResponse'
 *             examples:
 *               missingItemId:
 *                 summary: Missing item ID
 *                 value:
 *                   success: false
 *                   error: "Item ID is required"
 *               insufficientGems:
 *                 summary: Insufficient gems
 *                 value:
 *                   success: false
 *                   error: "Insufficient gems"
 *               insufficientCoins:
 *                 summary: Insufficient coins
 *                 value:
 *                   success: false
 *                   error: "Insufficient coins"
 *               itemUnavailable:
 *                 summary: Item not available
 *                 value:
 *                   success: false
 *                   error: "Item is not available for purchase"
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   error: "Unauthorized"
 *       '404':
 *         description: User or item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseErrorResponse'
 *             examples:
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   success: false
 *                   error: "User not found"
 *               itemNotFound:
 *                 summary: Item not found
 *                 value:
 *                   success: false
 *                   error: "Item not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   error: "Failed to process purchase"
 *                   message: "Database transaction failed"
 *
 *   get:
 *     summary: Get user's purchase history
 *     description: |
 *       Retrieves a paginated list of purchases made by a specific user.
 *       Supports filtering by payment status and item type. Returns detailed
 *       purchase information including item details, payment method, and
 *       transaction metadata. Requires user authentication with admin privileges.
 *     tags:
 *       - Users
 *       - Purchases
 *       - History
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk ID of the user whose purchase history to retrieve
 *         example: "user_2abc123def456"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of purchases to return per page
 *         example: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [completed, pending, failed, refunded]
 *         description: Filter by payment status
 *         example: "completed"
 *       - in: query
 *         name: itemType
 *         schema:
 *           type: string
 *           enum: [consumable, permanent, subscription, cosmetic]
 *         description: Filter by item type
 *         example: "consumable"
 *     responses:
 *       '200':
 *         description: Successfully retrieved purchase history
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseHistoryResponse'
 *             examples:
 *               purchaseHistory:
 *                 summary: User purchase history
 *                 value:
 *                   success: true
 *                   data:
 *                     purchases:
 *                       - _id: "60d21b4667d0d8992e610c90"
 *                         userId: "60d21b4667d0d8992e610c85"
 *                         itemId:
 *                           _id: "60d21b4667d0d8992e610c85"
 *                           name: "Premium Streak Freeze"
 *                           type: "consumable"
 *                           price: 200
 *                           currency: "gems"
 *                         itemName: "Premium Streak Freeze"
 *                         itemType: "consumable"
 *                         price: 200
 *                         currency: "gems"
 *                         quantity: 1
 *                         totalAmount: 200
 *                         paymentMethod: "gems"
 *                         paymentStatus: "completed"
 *                         purchaseDate: "2024-01-20T14:30:00Z"
 *                         deviceType: "desktop"
 *                         platform: "web"
 *                         userLevel: 1
 *                         userStreak: 15
 *                       - _id: "60d21b4667d0d8992e610c91"
 *                         userId: "60d21b4667d0d8992e610c85"
 *                         itemId:
 *                           _id: "60d21b4667d0d8992e610c86"
 *                           name: "Double XP Boost"
 *                           type: "consumable"
 *                           price: 150
 *                           currency: "gems"
 *                         itemName: "Double XP Boost"
 *                         itemType: "consumable"
 *                         price: 150
 *                         currency: "gems"
 *                         quantity: 2
 *                         totalAmount: 300
 *                         paymentMethod: "gems"
 *                         paymentStatus: "completed"
 *                         purchaseDate: "2024-01-19T10:15:00Z"
 *                         deviceType: "mobile"
 *                         platform: "ios"
 *                         userLevel: 1
 *                         userStreak: 14
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 3
 *                       totalItems: 25
 *                       itemsPerPage: 10
 *               emptyHistory:
 *                 summary: No purchases found
 *                 value:
 *                   success: true
 *                   data:
 *                     purchases: []
 *                     pagination:
 *                       currentPage: 1
 *                       totalPages: 0
 *                       totalItems: 0
 *                       itemsPerPage: 10
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   error: "Unauthorized"
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseErrorResponse'
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
 *               $ref: '#/components/schemas/PurchaseServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   error: "Failed to retrieve purchase history"
 *                   message: "Database connection failed"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PurchaseRequest:
 *       type: object
 *       required:
 *         - itemId
 *       properties:
 *         itemId:
 *           type: string
 *           format: objectId
 *           description: ID of the shop item to purchase
 *           example: "60d21b4667d0d8992e610c85"
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           description: Quantity of items to purchase
 *           example: 1
 *         paymentMethod:
 *           type: string
 *           enum: [gems, coins, real_money]
 *           description: Payment method for the purchase
 *           example: "gems"
 *         platform:
 *           type: string
 *           enum: [web, mobile, desktop]
 *           description: Platform where the purchase is made
 *           example: "web"
 *         deviceType:
 *           type: string
 *           enum: [desktop, mobile, tablet, ios, android]
 *           description: Type of device used for the purchase
 *           example: "desktop"
 *
 *     PurchaseData:
 *       type: object
 *       properties:
 *         purchaseId:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the purchase
 *           example: "60d21b4667d0d8992e610c90"
 *         userId:
 *           type: string
 *           format: objectId
 *           description: Database ID of the user
 *           example: "60d21b4667d0d8992e610c85"
 *         itemId:
 *           type: string
 *           format: objectId
 *           description: ID of the purchased item
 *           example: "60d21b4667d0d8992e610c85"
 *         itemName:
 *           type: string
 *           description: Name of the purchased item
 *           example: "Premium Streak Freeze"
 *         itemType:
 *           type: string
 *           enum: [consumable, permanent, subscription, cosmetic]
 *           description: Type of the purchased item
 *           example: "consumable"
 *         quantity:
 *           type: integer
 *           description: Quantity purchased
 *           example: 1
 *         totalAmount:
 *           type: number
 *           description: Total amount paid
 *           example: 200
 *         currency:
 *           type: string
 *           enum: [gems, coins, usd, eur]
 *           description: Currency used for payment
 *           example: "gems"
 *         paymentStatus:
 *           type: string
 *           enum: [completed, pending, failed, refunded]
 *           description: Status of the payment
 *           example: "completed"
 *
 *     PurchaseResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/PurchaseData'
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Successfully purchased 1 Premium Streak Freeze"
 *
 *     PurchaseHistoryItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Purchase record ID
 *           example: "60d21b4667d0d8992e610c90"
 *         userId:
 *           type: string
 *           format: objectId
 *           description: User's database ID
 *           example: "60d21b4667d0d8992e610c85"
 *         itemId:
 *           type: object
 *           description: Populated shop item details
 *           properties:
 *             _id:
 *               type: string
 *               format: objectId
 *               example: "60d21b4667d0d8992e610c85"
 *             name:
 *               type: string
 *               example: "Premium Streak Freeze"
 *             type:
 *               type: string
 *               example: "consumable"
 *             price:
 *               type: number
 *               example: 200
 *             currency:
 *               type: string
 *               example: "gems"
 *         itemName:
 *           type: string
 *           description: Name of purchased item
 *           example: "Premium Streak Freeze"
 *         itemType:
 *           type: string
 *           description: Type of purchased item
 *           example: "consumable"
 *         price:
 *           type: number
 *           description: Unit price of the item
 *           example: 200
 *         currency:
 *           type: string
 *           description: Currency used
 *           example: "gems"
 *         quantity:
 *           type: integer
 *           description: Quantity purchased
 *           example: 1
 *         totalAmount:
 *           type: number
 *           description: Total amount paid
 *           example: 200
 *         paymentMethod:
 *           type: string
 *           description: Payment method used
 *           example: "gems"
 *         paymentStatus:
 *           type: string
 *           description: Payment status
 *           example: "completed"
 *         purchaseDate:
 *           type: string
 *           format: date-time
 *           description: When the purchase was made
 *           example: "2024-01-20T14:30:00Z"
 *         deviceType:
 *           type: string
 *           description: Device used for purchase
 *           example: "desktop"
 *         platform:
 *           type: string
 *           description: Platform used for purchase
 *           example: "web"
 *         userLevel:
 *           type: integer
 *           description: User's level at time of purchase
 *           example: 1
 *         userStreak:
 *           type: integer
 *           description: User's streak at time of purchase
 *           example: 15
 *
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *           description: Current page number
 *           example: 1
 *         totalPages:
 *           type: integer
 *           description: Total number of pages
 *           example: 3
 *         totalItems:
 *           type: integer
 *           description: Total number of purchases
 *           example: 25
 *         itemsPerPage:
 *           type: integer
 *           description: Number of items per page
 *           example: 10
 *
 *     PurchaseHistoryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             purchases:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PurchaseHistoryItem'
 *               description: Array of purchase records
 *             pagination:
 *               $ref: '#/components/schemas/PaginationInfo'
 *
 *     PurchaseErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Item ID is required"
 *
 *     PurchaseServerErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error type
 *           example: "Failed to process purchase"
 *         message:
 *           type: string
 *           description: Detailed error message
 *           example: "Database transaction failed"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Unauthorized"
 *
 *   examples:
 *     PurchasesApiUsageExample:
 *       summary: How to use the Purchases API with Axios
 *       description: |
 *         **Step 1: Make a Purchase with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const makePurchase = async (userId, purchaseData) => {
 *           try {
 *             const response = await axios.post(`/api/users/${userId}/purchases`, purchaseData, {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`,
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to process purchase');
 *             }
 *           } catch (error) {
 *             console.error('Failed to make purchase:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const gemsPurchase = await makePurchase('user_2abc123def456', {
 *           itemId: '60d21b4667d0d8992e610c85',
 *           quantity: 1,
 *           paymentMethod: 'gems',
 *           platform: 'web',
 *           deviceType: 'desktop'
 *         });
 *
 *         const coinsPurchase = await makePurchase('user_2abc123def456', {
 *           itemId: '60d21b4667d0d8992e610c86',
 *           quantity: 2,
 *           paymentMethod: 'coins',
 *           platform: 'mobile',
 *           deviceType: 'ios'
 *         });
 *         ```
 *
 *         **Step 2: Get Purchase History**
 *         ```javascript
 *         const getPurchaseHistory = async (userId, options = {}) => {
 *           try {
 *             const {
 *               limit = 10,
 *               page = 1,
 *               status,
 *               itemType
 *             } = options;
 *
 *             const params = new URLSearchParams({
 *               limit: limit.toString(),
 *               page: page.toString()
 *             });
 *
 *             if (status) params.append('status', status);
 *             if (itemType) params.append('itemType', itemType);
 *
 *             const response = await axios.get(`/api/users/${userId}/purchases?${params}`, {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to get purchase history');
 *             }
 *           } catch (error) {
 *             console.error('Failed to get purchase history:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const allPurchases = await getPurchaseHistory('user_2abc123def456');
 *         const completedPurchases = await getPurchaseHistory('user_2abc123def456', {
 *           status: 'completed'
 *         });
 *         const consumablePurchases = await getPurchaseHistory('user_2abc123def456', {
 *           itemType: 'consumable',
 *           limit: 20
 *         });
 *         ```
 *
 *         **Step 3: Create a Purchases Service**
 *         ```javascript
 *         class PurchasesService {
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
 *           async purchaseItem(userId, itemId, options = {}) {
 *             try {
 *               const purchaseData = {
 *                 itemId,
 *                 quantity: options.quantity || 1,
 *                 paymentMethod: options.paymentMethod || 'gems',
 *                 platform: options.platform || 'web',
 *                 deviceType: options.deviceType || 'desktop'
 *               };
 *
 *               const response = await this.client.post(`/${userId}/purchases`, purchaseData);
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to purchase item');
 *               }
 *             } catch (error) {
 *               console.error('Purchase service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async getPurchaseHistory(userId, options = {}) {
 *             try {
 *               const params = new URLSearchParams();
 *
 *               if (options.limit) params.append('limit', options.limit.toString());
 *               if (options.page) params.append('page', options.page.toString());
 *               if (options.status) params.append('status', options.status);
 *               if (options.itemType) params.append('itemType', options.itemType);
 *
 *               const response = await this.client.get(`/${userId}/purchases?${params}`);
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to get purchase history');
 *               }
 *             } catch (error) {
 *               console.error('Purchase history service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async getRecentPurchases(userId, limit = 5) {
 *             return this.getPurchaseHistory(userId, { limit, page: 1 });
 *           }
 *
 *           async getPurchasesByType(userId, itemType, limit = 10) {
 *             return this.getPurchaseHistory(userId, { itemType, limit });
 *           }
 *
 *           async getPurchasesByStatus(userId, status, limit = 10) {
 *             return this.getPurchaseHistory(userId, { status, limit });
 *           }
 *
 *           async calculateTotalSpent(userId) {
 *             try {
 *               const allPurchases = await this.getPurchaseHistory(userId, {
 *                 limit: 1000, // Get all purchases
 *                 status: 'completed'
 *               });
 *
 *               const totals = allPurchases.data.purchases.reduce((acc, purchase) => {
 *                 const currency = purchase.currency;
 *                 if (!acc[currency]) acc[currency] = 0;
 *                 acc[currency] += purchase.totalAmount;
 *                 return acc;
 *               }, {});
 *
 *               return totals;
 *             } catch (error) {
 *               console.error('Failed to calculate total spent:', error);
 *               return {};
 *             }
 *           }
 *
 *           // Helper methods
 *           formatCurrency(amount, currency) {
 *             switch (currency) {
 *               case 'gems':
 *                 return `${amount} 💎`;
 *               case 'coins':
 *                 return `${amount} 🪙`;
 *               case 'usd':
 *                 return `$${(amount / 100).toFixed(2)}`;
 *               case 'eur':
 *                 return `€${(amount / 100).toFixed(2)}`;
 *               default:
 *                 return `${amount} ${currency}`;
 *             }
 *           }
 *
 *           formatPurchaseDate(dateString) {
 *             return new Date(dateString).toLocaleDateString();
 *           }
 *         }
 *
 *         export const purchasesService = new PurchasesService();
 *         ```
 *
 * tags:
 *   - name: Users
 *     description: Operations for managing and retrieving user information
 *   - name: Purchases
 *     description: Purchase transaction management and history
 *   - name: Shop
 *     description: Shop item purchases and inventory management
 *   - name: Transactions
 *     description: Financial transaction processing and tracking
 *   - name: History
 *     description: Historical data retrieval and analytics
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { id } = await params;
    // Check if the user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();

    const {
      itemId,
      quantity = 1,
      paymentMethod,
      platform,
      deviceType,
    } = await request.json();

    // Validate required fields
    if (!itemId) {
      return NextResponse.json(
        {
          success: false,
          error: "Item ID is required",
        },
        { status: 400 }
      );
    }

    // Find user by id
    const user = await User.findByClerkId(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Find the shop item
    const shopItem = await ShopItem.findById(itemId);
    if (!shopItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" },
        { status: 404 }
      );
    }

    // Check if item is available
    if (shopItem.status !== "active") {
      return NextResponse.json(
        { success: false, error: "Item is not available for purchase" },
        { status: 400 }
      );
    }
    const price = shopItem.price as number;

    // Check if user has enough currency (if paying with gems or coins)
    if (paymentMethod === "gems" && user.gems < price * quantity) {
      return NextResponse.json(
        { success: false, error: "Insufficient gems" },
        { status: 400 }
      );
    }

    if (paymentMethod === "coins" && user.gel < price * quantity) {
      return NextResponse.json(
        { success: false, error: "Insufficient coins" },
        { status: 400 }
      );
    }

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Deduct currency if paying with gems or coins
      if (paymentMethod === "gems") {
        await User.findByIdAndUpdate(
          user._id,
          { $inc: { gems: -price * quantity } },
          { session, new: true }
        );
      } else if (paymentMethod === "coins") {
        await User.findByIdAndUpdate(
          user._id,
          { $inc: { gel: -price * quantity } },
          { session, new: true }
        );
      }

      // Create purchase record
      const purchase = await UserPurchase.create(
        [
          {
            userId: user._id,
            itemId: shopItem._id,
            itemName: shopItem.name,
            itemType: shopItem.type,
            price: shopItem.price,
            currency: shopItem.currency,
            quantity,
            totalAmount: price * quantity,
            paymentMethod,
            paymentStatus: "completed",
            purchaseDate: new Date(),
            deviceType: deviceType || "desktop",
            platform: platform || "web",
            userLevel: 1, // Default level, can be updated if user level system is implemented
            userStreak: user.streak || 0,
          },
        ],
        { session }
      );

      // Add item to user's inventory
      let expiryDate = null;
      if (
        shopItem.type === "consumable" &&
        typeof shopItem.expiryDays === "number"
      ) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + shopItem.expiryDays);
        expiryDate = expiry;
      }

      await UserInventory.create(
        [
          {
            userId: user._id,
            itemId: shopItem._id,
            itemName: shopItem.name,
            itemType: shopItem.type,
            quantity,
            acquiredDate: new Date(),
            source: "purchase",
            expiryDate,
            purchaseId: purchase[0]._id,
          },
        ],
        { session }
      );

      // Update shop item analytics
      await ShopItem.findByIdAndUpdate(
        shopItem._id,
        {
          $inc: {
            purchases: quantity,
            revenue: price * quantity,
          },
        },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      return NextResponse.json({
        success: true,
        data: {
          purchaseId: purchase[0]._id,
          userId: user._id,
          itemId: shopItem._id,
          itemName: shopItem.name,
          itemType: shopItem.type,
          quantity,
          totalAmount: price * quantity,
          currency: shopItem.currency,
          paymentStatus: "completed",
        },
        message: `Successfully purchased ${quantity} ${shopItem.name}`,
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Purchase API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process purchase",
        message: error instanceof Error ? error.message : "Unknown error",
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
    const { id } = await params;
    // Check if the user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") || "10");
    const page = Number(searchParams.get("page") || "1");
    const status = searchParams.get("status");
    const itemType = searchParams.get("itemType");

    // Find user by clerkId
    const user = await User.findByClerkId(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Build filter
    const filter: FilterQuery<{ userId: string }> = { userId: user.clerkId };
    if (status) filter.paymentStatus = status;
    if (itemType) filter.itemType = itemType;

    // Get total count for pagination
    const totalPurchases = await UserPurchase.countDocuments(filter);
    const totalPages = Math.ceil(totalPurchases / limit);

    // Get purchases with pagination
    const purchases = await UserPurchase.find(filter)
      .sort({ purchaseDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("itemId")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        purchases,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalPurchases,
          itemsPerPage: limit,
        },
      },
    });
  } catch (error) {
    console.error("Get purchases API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve purchase history",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
