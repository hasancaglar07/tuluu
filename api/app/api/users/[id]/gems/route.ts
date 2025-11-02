import { NextResponse } from "next/server";

import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";

/**
 * @swagger
 * /api/users/{id}/gems:
 *   put:
 *     summary: Update user's gems balance
 *     description: |
 *       Increases or decreases a user's gems balance by the specified amount.
 *       The action is determined by the query parameter "action" which can be
 *       either "inc" (increment) or "dec" (decrement). The amount must be a
 *       positive number. Prevents negative balances and enforces maximum gem limits.
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
 *         description: Clerk ID of the user whose gems balance will be updated
 *         example: "user_2abc123def456"
 *       - in: query
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [inc, dec]
 *         description: Action to perform - increment or decrement gems
 *         example: "inc"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GemsUpdateRequest'
 *           examples:
 *             addGems:
 *               summary: Add gems to user balance
 *               value:
 *                 amount: 100
 *             removeGems:
 *               summary: Remove gems from user balance
 *               value:
 *                 amount: 50
 *     responses:
 *       '200':
 *         description: Successfully updated gems balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GemsUpdateResponse'
 *             examples:
 *               gemsAdded:
 *                 summary: Gems successfully added
 *                 value:
 *                   success: true
 *                   data:
 *                     userId: "60d21b4667d0d8992e610c85"
 *                     previousGems: 250
 *                     newGems: 350
 *                     amountChanged: 100
 *                     action: "inc"
 *                   message: "Successfully added 100 gems"
 *               gemsRemoved:
 *                 summary: Gems successfully removed
 *                 value:
 *                   success: true
 *                   data:
 *                     userId: "60d21b4667d0d8992e610c85"
 *                     previousGems: 350
 *                     newGems: 300
 *                     amountChanged: -50
 *                     action: "dec"
 *                   message: "Successfully removed 50 gems"
 *       '400':
 *         description: Bad request - Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GemsErrorResponse'
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
 *               insufficientGems:
 *                 summary: Insufficient gems for decrement
 *                 value:
 *                   success: false
 *                   error: "Insufficient gems for this transaction"
 *               maxGemsExceeded:
 *                 summary: Maximum gems limit exceeded
 *                 value:
 *                   success: false
 *                   error: "Cannot exceed maximum gem limit of 999999"
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
 *               $ref: '#/components/schemas/GemsErrorResponse'
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
 *               $ref: '#/components/schemas/GemsServerErrorResponse'
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
 *     GemsUpdateRequest:
 *       type: object
 *       required:
 *         - amount
 *       properties:
 *         amount:
 *           type: number
 *           minimum: 1
 *           description: Amount of gems to add or remove (must be positive)
 *           example: 100
 *
 *     GemsUpdateResponse:
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
 *               description: User's gems balance before the update
 *               example: 250
 *             newGems:
 *               type: number
 *               description: User's gems balance after the update
 *               example: 350
 *             amountChanged:
 *               type: number
 *               description: Amount of gems added (positive) or removed (negative)
 *               example: 100
 *             action:
 *               type: string
 *               enum: [inc, dec]
 *               description: Action performed - increment or decrement
 *               example: "inc"
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Successfully added 100 gems"
 *
 *     GemsErrorResponse:
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
 *     GemsServerErrorResponse:
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
 *     GemsApiUsageExample:
 *       summary: How to use the Gems API with Axios
 *       description: |
 *         **Step 1: Update User Gems with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const updateUserGems = async (userId, action, amount) => {
 *           try {
 *             const response = await axios.put(`/api/users/${userId}/gems?action=${action}`,
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
 *               throw new Error(response.data.error || 'Failed to update gems');
 *             }
 *           } catch (error) {
 *             console.error('Failed to update user gems:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const addGemsResult = await updateUserGems('user_2abc123def456', 'inc', 100);
 *         console.log(`Added gems: ${addGemsResult.data.amountChanged}`);
 *         console.log(`New balance: ${addGemsResult.data.newGems}`);
 *
 *         const removeGemsResult = await updateUserGems('user_2abc123def456', 'dec', 50);
 *         console.log(`Removed gems: ${Math.abs(removeGemsResult.data.amountChanged)}`);
 *         console.log(`New balance: ${removeGemsResult.data.newGems}`);
 *         ```
 *
 *         **Step 2: Create a Gems Management Service**
 *         ```javascript
 *         class GemsService {
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
 *           async addGems(userId, amount) {
 *             try {
 *               const response = await this.client.put(
 *                 `/${userId}/gems?action=inc`,
 *                 { amount }
 *               );
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to add gems');
 *               }
 *             } catch (error) {
 *               console.error('Gems service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async removeGems(userId, amount) {
 *             try {
 *               const response = await this.client.put(
 *                 `/${userId}/gems?action=dec`,
 *                 { amount }
 *               );
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to remove gems');
 *               }
 *             } catch (error) {
 *               if (error.response?.status === 400 &&
 *                   error.response.data.error === 'Insufficient gems for this transaction') {
 *                 throw new Error('Not enough gems');
 *               }
 *               console.error('Gems service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async awardGems(userId, amount, reason) {
 *             try {
 *               // First add the gems
 *               const result = await this.addGems(userId, amount);
 *
 *               // Then log the transaction (assuming you have a transaction logging endpoint)
 *               await this.logGemsTransaction({
 *                 userId,
 *                 amount,
 *                 type: 'award',
 *                 reason,
 *                 timestamp: new Date().toISOString()
 *               });
 *
 *               return result;
 *             } catch (error) {
 *               console.error('Failed to award gems:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async purchaseWithGems(userId, amount, itemId, itemName) {
 *             try {
 *               // First check if user has enough gems
 *               const result = await this.removeGems(userId, amount);
 *
 *               // Then log the transaction
 *               await this.logGemsTransaction({
 *                 userId,
 *                 amount: -amount,
 *                 type: 'purchase',
 *                 itemId,
 *                 itemName,
 *                 timestamp: new Date().toISOString()
 *               });
 *
 *               return {
 *                 ...result,
 *                 purchase: {
 *                   itemId,
 *                   itemName,
 *                   cost: amount
 *                 }
 *               };
 *             } catch (error) {
 *               console.error('Purchase failed:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async logGemsTransaction(transactionData) {
 *             // Implementation depends on your transaction logging endpoint
 *             try {
 *               await this.client.post('/transactions', transactionData);
 *             } catch (error) {
 *               console.error('Failed to log transaction:', error);
 *               // Don't throw here, just log the error
 *             }
 *           }
 *
 *           // Helper methods
 *           formatGems(amount) {
 *             return amount.toLocaleString();
 *           }
 *         }
 *
 *         export const gemsService = new GemsService();
 *         ```
 *
 *         **Step 3: Admin Gems Management Component**
 *         ```javascript
 *         import React, { useState } from 'react';
 *         import { gemsService } from '../services/gems-service';
 *
 *         export function AdminGemsManager() {
 *           const [userId, setUserId] = useState('');
 *           const [amount, setAmount] = useState(100);
 *           const [reason, setReason] = useState('');
 *           const [loading, setLoading] = useState(false);
 *           const [result, setResult] = useState(null);
 *           const [error, setError] = useState(null);
 *
 *           const handleAddGems = async (e) => {
 *             e.preventDefault();
 *             if (!userId || !amount || amount <= 0) {
 *               setError('Please provide a valid user ID and amount');
 *               return;
 *             }
 *
 *             setLoading(true);
 *             setError(null);
 *             setResult(null);
 *
 *             try {
 *               const response = await gemsService.awardGems(userId, amount, reason);
 *               setResult(response);
 *             } catch (err) {
 *               setError(err.message || 'Failed to add gems');
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           const handleRemoveGems = async (e) => {
 *             e.preventDefault();
 *             if (!userId || !amount || amount <= 0) {
 *               setError('Please provide a valid user ID and amount');
 *               return;
 *             }
 *
 *             setLoading(true);
 *             setError(null);
 *             setResult(null);
 *
 *             try {
 *               const response = await gemsService.removeGems(userId, amount);
 *               setResult(response);
 *             } catch (err) {
 *               setError(err.message || 'Failed to remove gems');
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           return (
 *             <div className="admin-gems-manager">
 *               <h2>Gems Management</h2>
 *
 *               {error && (
 *                 <div className="error-message">
 *                   {error}
 *                 </div>
 *               )}
 *
 *               {result && (
 *                 <div className="result-message">
 *                   <h3>Transaction Complete</h3>
 *                   <p>Previous balance: {result.data.previousGems}</p>
 *                   <p>New balance: {result.data.newGems}</p>
 *                   <p>Changed: {result.data.amountChanged}</p>
 *                   <p>{result.message}</p>
 *                 </div>
 *               )}
 *
 *               <form className="gems-form">
 *                 <div className="form-group">
 *                   <label htmlFor="userId">User ID</label>
 *                   <input
 *                     type="text"
 *                     id="userId"
 *                     value={userId}
 *                     onChange={(e) => setUserId(e.target.value)}
 *                     placeholder="Enter Clerk user ID"
 *                     required
 *                   />
 *                 </div>
 *
 *                 <div className="form-group">
 *                   <label htmlFor="amount">Amount</label>
 *                   <input
 *                     type="number"
 *                     id="amount"
 *                     value={amount}
 *                     onChange={(e) => setAmount(parseInt(e.target.value))}
 *                     min="1"
 *                     required
 *                   />
 *                 </div>
 *
 *                 <div className="form-group">
 *                   <label htmlFor="reason">Reason (optional)</label>
 *                   <input
 *                     type="text"
 *                     id="reason"
 *                     value={reason}
 *                     onChange={(e) => setReason(e.target.value)}
 *                     placeholder="e.g., Achievement reward, Contest prize"
 *                   />
 *                 </div>
 *
 *                 <div className="form-actions">
 *                   <button
 *                     onClick={handleAddGems}
 *                     disabled={loading}
 *                     className="add-button"
 *                   >
 *                     {loading ? 'Processing...' : 'Add Gems'}
 *                   </button>
 *
 *                   <button
 *                     onClick={handleRemoveGems}
 *                     disabled={loading}
 *                     className="remove-button"
 *                   >
 *                     {loading ? 'Processing...' : 'Remove Gems'}
 *                   </button>
 *                 </div>
 *               </form>
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Users
 *     description: Operations for managing and retrieving user information
 *   - name: Currency
 *     description: Virtual currency management including gems and gel
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
      // Increment gems
      newGemAmount = user.gems + amount;

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
      // Decrement gems
      newGemAmount = user.gems - amount;

      // Prevent negative gems
      if (newGemAmount < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Insufficient gems for this transaction",
          },
          { status: 400 }
        );
      }
    }

    // Update user's gems
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { gems: newGemAmount },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "Failed to update user gems" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        userId: updatedUser._id,
        previousGems: user.gems,
        newGems: updatedUser.gems,
        amountChanged: action === "inc" ? amount : -amount,
        action,
      },
      message: `Successfully ${
        action === "inc" ? "added" : "removed"
      } ${amount} gems`,
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
