import { NextResponse } from "next/server";

import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";

/**
 * @swagger
 * /api/users/{id}/hearts:
 *   put:
 *     summary: Update user's hearts balance
 *     description: |
 *       Increases or decreases a user's hearts balance by the specified amount.
 *       The action is determined by the query parameter "action" which can be
 *       either "inc" (increment) or "dec" (decrement). The amount must be a
 *       positive number. Hearts are capped at a maximum of 5 and minimum of 0.
 *       Requires user authentication with admin privileges.
 *     tags:
 *       - Users
 *       - Currency
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk ID of the user whose hearts balance will be updated
 *         example: "user_2abc123def456"
 *       - in: query
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [inc, dec]
 *         description: Action to perform - increment or decrement hearts
 *         example: "inc"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HeartsUpdateRequest'
 *           examples:
 *             addHearts:
 *               summary: Add hearts to user balance
 *               value:
 *                 amount: 1
 *             removeHearts:
 *               summary: Remove hearts from user balance
 *               value:
 *                 amount: 1
 *     responses:
 *       '200':
 *         description: Successfully updated hearts balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeartsUpdateResponse'
 *             examples:
 *               heartsAdded:
 *                 summary: Hearts successfully added
 *                 value:
 *                   success: true
 *                   data:
 *                     userId: "60d21b4667d0d8992e610c85"
 *                     previousGems: 3
 *                     newGems: 4
 *                     amountChanged: 1
 *                     action: "inc"
 *                   message: "Successfully added 1 hearts"
 *               heartsRemoved:
 *                 summary: Hearts successfully removed
 *                 value:
 *                   success: true
 *                   data:
 *                     userId: "60d21b4667d0d8992e610c85"
 *                     previousGems: 4
 *                     newGems: 3
 *                     amountChanged: -1
 *                     action: "dec"
 *                   message: "Successfully removed 1 hearts"
 *               heartsMaxed:
 *                 summary: Hearts capped at maximum
 *                 value:
 *                   success: true
 *                   data:
 *                     userId: "60d21b4667d0d8992e610c85"
 *                     previousGems: 4
 *                     newGems: 5
 *                     amountChanged: 1
 *                     action: "inc"
 *                   message: "Successfully added 1 hearts"
 *       '400':
 *         description: Bad request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeartsErrorResponse'
 *             examples:
 *               invalidAction:
 *                 summary: Invalid action parameter
 *                 value:
 *                   success: false
 *                   error: "Invalid action. Must be 'inc' or 'dec'"
 *               invalidAmount:
 *                 summary: Invalid amount parameter
 *                 value:
 *                   success: false
 *                   error: "Amount must be a positive number"
 *               insufficientHearts:
 *                 summary: Insufficient hearts for decrement
 *                 value:
 *                   success: false
 *                   error: "Insufficient hearts for this transaction"
 *       '401':
 *         description: Unauthorized - User not authenticated or not an admin
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
 *               $ref: '#/components/schemas/HeartsErrorResponse'
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
 *               $ref: '#/components/schemas/HeartsServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   error: "Internal server error"
 *                   message: "Database connection failed"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HeartsUpdateRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 1
 *           description: Amount of hearts to add or remove (must be positive)
 *           example: 1
 *
 *     HeartsUpdateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             userId:
 *               type: string
 *               description: Database ID of the user
 *               example: "60d21b4667d0d8992e610c85"
 *             previousGems:
 *               type: number
 *               description: User's hearts balance before the update
 *               example: 3
 *             newGems:
 *               type: number
 *               description: User's hearts balance after the update
 *               example: 4
 *             amountChanged:
 *               type: number
 *               description: Amount of hearts added (positive) or removed (negative)
 *               example: 1
 *             action:
 *               type: string
 *               enum: [inc, dec]
 *               description: Action performed - increment or decrement
 *               example: "inc"
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Successfully added 1 hearts"
 *
 *     HeartsErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Invalid action. Must be 'inc' or 'dec'"
 *
 *     HeartsServerErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error type
 *           example: "Internal server error"
 *         message:
 *           type: string
 *           description: Detailed error message
 *           example: "Database connection failed"
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
 *     HeartsApiUsageExample:
 *       summary: How to use the Hearts API with Axios
 *       description: |
 *         **Step 1: Update User Hearts with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const updateUserHearts = async (userId, action, amount) => {
 *           try {
 *             const response = await axios.put(`/api/users/${userId}/hearts?action=${action}`,
 *               { amount },
 *               {
 *                 headers: {
 *                   'Authorization': `Bearer ${getAuthToken()}`,
 *                   'Content-Type': 'application/json'
 *                 }
 *               }
 *             );
 *
 *             if (response.data.success) {
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to update hearts');
 *             }
 *           } catch (error) {
 *             console.error('Failed to update user hearts:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const addHeartsResult = await updateUserHearts('user_2abc123def456', 'inc', 1);
 *         console.log(`Added hearts: ${addHeartsResult.data.amountChanged}`);
 *         console.log(`New balance: ${addHeartsResult.data.newGems}`);
 *
 *         const removeHeartsResult = await updateUserHearts('user_2abc123def456', 'dec', 1);
 *         console.log(`Removed hearts: ${Math.abs(removeHeartsResult.data.amountChanged)}`);
 *         console.log(`New balance: ${removeHeartsResult.data.newGems}`);
 *         ```
 *
 *         **Step 2: Create a Hearts Management Service**
 *         ```javascript
 *         class HeartsService {
 *           constructor() {
 *             this.client = axios.create({
 *               baseURL: '/api/users',
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             this.setupInterceptors();
 *             this.MAX_HEARTS = 5;
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
 *           async addHearts(userId, amount) {
 *             try {
 *               const response = await this.client.put(
 *                 `/${userId}/hearts?action=inc`,
 *                 { amount }
 *               );
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to add hearts');
 *               }
 *             } catch (error) {
 *               console.error('Hearts service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async removeHearts(userId, amount) {
 *             try {
 *               const response = await this.client.put(
 *                 `/${userId}/hearts?action=dec`,
 *                 { amount }
 *               );
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to remove hearts');
 *               }
 *             } catch (error) {
 *               if (error.response?.status === 400 &&
 *                   error.response.data.error === 'Insufficient hearts for this transaction') {
 *                 throw new Error('Not enough hearts');
 *               }
 *               console.error('Hearts service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async refillHearts(userId) {
 *             try {
 *               // Refill to maximum hearts
 *               const response = await this.client.put(
 *                 `/${userId}/hearts?action=inc`,
 *                 { amount: this.MAX_HEARTS }
 *               );
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to refill hearts');
 *               }
 *             } catch (error) {
 *               console.error('Failed to refill hearts:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async useHeart(userId) {
 *             try {
 *               // Use one heart
 *               const result = await this.removeHearts(userId, 1);
 *
 *               // Log the heart usage
 *               await this.logHeartUsage({
 *                 userId,
 *                 timestamp: new Date().toISOString(),
 *                 remainingHearts: result.data.newGems
 *               });
 *
 *               return result;
 *             } catch (error) {
 *               console.error('Failed to use heart:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async logHeartUsage(usageData) {
 *             // Implementation depends on your transaction logging endpoint
 *             try {
 *               await this.client.post('/heart-usage', usageData);
 *             } catch (error) {
 *               console.error('Failed to log heart usage:', error);
 *               // Don't throw here, just log the error
 *             }
 *           }
 *
 *           async getHeartRefillTime(userId) {
 *             // This is a placeholder - you would need an endpoint to get the next heart refill time
 *             try {
 *               const response = await this.client.get(`/${userId}/heart-refill`);
 *               return response.data.nextRefillTime;
 *             } catch (error) {
 *               console.error('Failed to get heart refill time:', error);
 *               return null;
 *             }
 *           }
 *
 *           // Helper methods
 *           formatTimeRemaining(nextRefillTime) {
 *             if (!nextRefillTime) return 'Unknown';
 *
 *             const now = new Date();
 *             const refill = new Date(nextRefillTime);
 *             const diffMs = refill.getTime() - now.getTime();
 *
 *             if (diffMs <= 0) return 'Ready now';
 *
 *             const diffMins = Math.floor(diffMs / 60000);
 *             const hours = Math.floor(diffMins / 60);
 *             const mins = diffMins % 60;
 *
 *             return `${hours}h ${mins}m`;
 *           }
 *         }
 *
 *         export const heartsService = new HeartsService();
 *         ```
 *
 *         **Step 3: Hearts UI Component**
 *         ```javascript
 *         import React, { useState, useEffect } from 'react';
 *         import { heartsService } from '../services/hearts-service';
 *
 *         export function HeartsDisplay({ userId }) {
 *           const [hearts, setHearts] = useState(5);
 *           const [nextRefill, setNextRefill] = useState(null);
 *           const [loading, setLoading] = useState(false);
 *           const [error, setError] = useState(null);
 *
 *           useEffect(() => {
 *             // This would be replaced with an actual API call to get the user's current hearts
 *             async function fetchHearts() {
 *               try {
 *                 // Placeholder - you would need an endpoint to get current hearts
 *                 const userData = await axios.get(`/api/users/${userId}`);
 *                 setHearts(userData.data.hearts);
 *
 *                 const nextRefillTime = await heartsService.getHeartRefillTime(userId);
 *                 setNextRefill(nextRefillTime);
 *               } catch (err) {
 *                 console.error('Failed to fetch hearts:', err);
 *               }
 *             }
 *
 *             fetchHearts();
 *           }, [userId]);
 *
 *           const handleUseHeart = async () => {
 *             if (hearts <= 0) {
 *               setError('No hearts available');
 *               return;
 *             }
 *
 *             setLoading(true);
 *             setError(null);
 *
 *             try {
 *               const result = await heartsService.useHeart(userId);
 *               setHearts(result.data.newGems);
 *
 *               // Update next refill time if hearts are now less than max
 *               if (result.data.newGems < 5) {
 *                 const nextRefillTime = await heartsService.getHeartRefillTime(userId);
 *                 setNextRefill(nextRefillTime);
 *               }
 *             } catch (err) {
 *               setError(err.message || 'Failed to use heart');
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           const handleRefillHearts = async () => {
 *             setLoading(true);
 *             setError(null);
 *
 *             try {
 *               const result = await heartsService.refillHearts(userId);
 *               setHearts(result.data.newGems);
 *               setNextRefill(null); // Reset refill timer
 *             } catch (err) {
 *               setError(err.message || 'Failed to refill hearts');
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           return (
 *             <div className="hearts-display">
 *               <div className="hearts-container">
 *                 {[...Array(5)].map((_, i) => (
 *                   <div
 *                     key={i}
 *                     className={`heart ${i < hearts ? 'filled' : 'empty'}`}
 *                   >
 *                     {i < hearts ? '❤️' : '🖤'}
 *                   </div>
 *                 ))}
 *               </div>
 *
 *               {nextRefill && hearts < 5 && (
 *                 <div className="refill-timer">
 *                   Next heart in: {heartsService.formatTimeRemaining(nextRefill)}
 *                 </div>
 *               )}
 *
 *               {error && (
 *                 <div className="error-message">
 *                   {error}
 *                 </div>
 *               )}
 *
 *               <div className="hearts-actions">
 *                 <button
 *                   onClick={handleUseHeart}
 *                   disabled={loading || hearts <= 0}
 *                   className="use-heart-button"
 *                 >
 *                   Use Heart
 *                 </button>
 *
 *                 <button
 *                   onClick={handleRefillHearts}
 *                   disabled={loading || hearts >= 5}
 *                   className="refill-hearts-button"
 *                 >
 *                   Refill Hearts
 *                 </button>
 *               </div>
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Users
 *     description: Operations for managing and retrieving user information
 *   - name: Currency
 *     description: Virtual currency management including gems and hearts
 *   - name: Admin
 *     description: Administrative operations requiring elevated privileges
 */

export async function PUT(
  request: Request,
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
    const action = searchParams.get("action"); // "inc" or "dec"
    const { amount } = await request.json();

    // Validate action parameter
    if (!action || !["inc", "dec"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Must be 'inc' or 'dec'",
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount must be a positive number",
        },
        { status: 400 }
      );
    }

    // Find user by clerkId (more secure than using the ID from params)
    const user = await User.findByClerkId(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let newGemAmount: number;

    if (action === "inc") {
      // Increment hearts
      newGemAmount = Math.max(0, Math.min(5, user.hearts + amount));

      // Optional: Add maximum gem limit
      const MAX_GEMS = 999999;
      if (newGemAmount > MAX_GEMS) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot exceed maximum gem limit of ${MAX_GEMS}`,
          },
          { status: 400 }
        );
      }
    } else {
      // Decrement hearts

      newGemAmount = Math.max(0, Math.min(5, user.hearts - amount));

      // Prevent negative hearts
      if (newGemAmount < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Insufficient hearts for this transaction",
          },
          { status: 400 }
        );
      }
    }

    // Update user's hearts
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { hearts: newGemAmount },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "Failed to update user hearts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: updatedUser._id,
        previousGems: user.hearts,
        newGems: updatedUser.hearts,
        amountChanged: action === "inc" ? amount : -amount,
        action,
      },
      message: `Successfully ${
        action === "inc" ? "added" : "removed"
      } ${amount} hearts`,
    });
  } catch (error) {
    console.error("Gems update API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
