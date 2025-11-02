import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import { UserProgressAddRewardSchema } from "@/lib/validations/userprogress";
import UserProgress from "@/models/UserProgress";

/**
 * @swagger
 * /api/add-reward:
 *   post:
 *     summary: Add reward to user progress
 *     description: |
 *       Adds a reward (XP, gems, or gel) to a user's progress for a specific lesson.
 *       Tracks the reward history with reason and timestamp. Supports various reward types
 *       and maintains a complete audit trail of all rewards earned by the user.
 *       Requires user authentication.
 *     tags:
 *       - Rewards
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddRewardRequest'
 *           examples:
 *             xpReward:
 *               summary: Award XP points
 *               value:
 *                 type: "xp"
 *                 amount: 50
 *                 reason: "Perfect lesson completion"
 *                 lessonId: "507f1f77bcf86cd799439011"
 *             gemsReward:
 *               summary: Award gems
 *               value:
 *                 type: "gems"
 *                 amount: 10
 *                 reason: "Daily streak bonus"
 *                 lessonId: "507f1f77bcf86cd799439012"
 *             gelReward:
 *               summary: Award gel
 *               value:
 *                 type: "gel"
 *                 amount: 5
 *                 reason: "Special achievement unlock"
 *                 lessonId: "507f1f77bcf86cd799439013"
 *             bonusReward:
 *               summary: Bonus reward for achievement
 *               value:
 *                 type: "xp"
 *                 amount: 100
 *                 reason: "Week completion bonus"
 *                 lessonId: "507f1f77bcf86cd799439014"
 *     responses:
 *       '201':
 *         description: Successfully added reward to user progress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddRewardResponse'
 *             examples:
 *               successExample:
 *                 summary: Reward added successfully
 *                 value:
 *                   message: "Reward added successfully"
 *                   rewardHistory:
 *                     - _id: "507f1f77bcf86cd799439020"
 *                       type: "xp"
 *                       amount: 50
 *                       reason: "Perfect lesson completion"
 *                       lessonId: "507f1f77bcf86cd799439011"
 *                       awardedAt: "2024-01-15T10:30:00Z"
 *                     - _id: "507f1f77bcf86cd799439021"
 *                       type: "gems"
 *                       amount: 10
 *                       reason: "Daily streak bonus"
 *                       lessonId: "507f1f77bcf86cd799439012"
 *                       awardedAt: "2024-01-14T15:45:00Z"
 *                     - _id: "507f1f77bcf86cd799439022"
 *                       type: "gel"
 *                       amount: 5
 *                       reason: "Special achievement unlock"
 *                       lessonId: "507f1f77bcf86cd799439013"
 *                       awardedAt: "2024-01-13T09:20:00Z"
 *       '400':
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Request validation failed
 *                 value:
 *                   message: "Validation error"
 *                   errors:
 *                     type: ["Invalid enum value. Expected 'xp' | 'gems' | 'gel'"]
 *                     amount: ["Expected number, received string"]
 *                     lessonId: ["Invalid ObjectId format"]
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
 *         description: Not found - User progress not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               progressNotFound:
 *                 value:
 *                   message: "User progress not found"
 *       '500':
 *         description: Internal server error - Server failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   error: "Server error"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AddRewardRequest:
 *       type: object
 *       required:
 *         - type
 *         - amount
 *         - reason
 *         - lessonId
 *       properties:
 *         type:
 *           type: string
 *           enum: [xp, gems, gel]
 *           description: Type of reward to award
 *           example: "xp"
 *         amount:
 *           type: integer
 *           minimum: 1
 *           description: Amount of the reward to award
 *           example: 50
 *         reason:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Reason for awarding the reward
 *           example: "Perfect lesson completion"
 *         lessonId:
 *           type: string
 *           format: objectId
 *           description: The lesson ID associated with this reward
 *           example: "507f1f77bcf86cd799439011"
 *
 *     RewardHistoryEntry:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the reward entry
 *           example: "507f1f77bcf86cd799439020"
 *         type:
 *           type: string
 *           enum: [xp, gems, gel]
 *           description: Type of reward awarded
 *           example: "xp"
 *         amount:
 *           type: integer
 *           minimum: 1
 *           description: Amount of the reward awarded
 *           example: 50
 *         reason:
 *           type: string
 *           description: Reason for the reward
 *           example: "Perfect lesson completion"
 *         lessonId:
 *           type: string
 *           format: objectId
 *           description: Associated lesson ID
 *           example: "507f1f77bcf86cd799439011"
 *         awardedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the reward was awarded
 *           example: "2024-01-15T10:30:00Z"
 *
 *     AddRewardResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Reward added successfully"
 *         rewardHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RewardHistoryEntry'
 *           description: Complete reward history for the user
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: General validation error message
 *           example: "Validation error"
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *           description: Field-specific validation errors
 *           example:
 *             type: ["Invalid enum value. Expected 'xp' | 'gems' | 'gel'"]
 *             amount: ["Expected number, received string"]
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Unauthorized"
 *         message:
 *           type: string
 *           description: Alternative error message format
 *           example: "User progress not found"
 *
 *   examples:
 *     AddRewardUsageExample:
 *       summary: How to use the Add Reward API with Axios
 *       description: |
 *         **Step 1: Basic Reward Addition with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const addReward = async (rewardData) => {
 *           try {
 *             const response = await axios.post('/api/add-reward', rewardData, {
 *               headers: {
 *                 'Content-Type': 'application/json',
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.status === 201) {
 *               console.log('Reward added successfully!');
 *               return {
 *                 success: true,
 *                 data: response.data
 *               };
 *             }
 *           } catch (error) {
 *             console.error('Failed to add reward:', error);
 *             return {
 *               success: false,
 *               error: error.response?.data || error.message
 *             };
 *           }
 *         };
 *
 *         // Usage examples
 *         await addReward({
 *           type: 'xp',
 *           amount: 50,
 *           reason: 'Perfect lesson completion',
 *           lessonId: '507f1f77bcf86cd799439011'
 *         });
 *
 *         await addReward({
 *           type: 'gems',
 *           amount: 10,
 *           reason: 'Daily streak bonus',
 *           lessonId: '507f1f77bcf86cd799439012'
 *         });
 *         ```
 *
 *         **Step 2: Reward System with Different Types**
 *         ```javascript
 *         class RewardSystem {
 *           constructor() {
 *             this.client = axios.create({
 *               baseURL: '/api',
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
 *           }
 *
 *           async awardXP(amount, reason, lessonId) {
 *             return this.addReward('xp', amount, reason, lessonId);
 *           }
 *
 *           async awardGems(amount, reason, lessonId) {
 *             return this.addReward('gems', amount, reason, lessonId);
 *           }
 *
 *           async awardGel(amount, reason, lessonId) {
 *             return this.addReward('gel', amount, reason, lessonId);
 *           }
 *
 *           async addReward(type, amount, reason, lessonId) {
 *             try {
 *               const response = await this.client.post('/add-reward', {
 *                 type,
 *                 amount,
 *                 reason,
 *                 lessonId
 *               });
 *               return response.data;
 *             } catch (error) {
 *               this.handleError(error);
 *               throw error;
 *             }
 *           }
 *
 *           handleError(error) {
 *             if (axios.isAxiosError(error)) {
 *               const status = error.response?.status;
 *               const errorData = error.response?.data;
 *
 *               switch (status) {
 *                 case 400:
 *                   console.error('Validation errors:', errorData.errors);
 *                   break;
 *                 case 401:
 *                   console.error('Unauthorized access');
 *                   this.handleUnauthorized();
 *                   break;
 *                 case 404:
 *                   console.error('User progress not found');
 *                   break;
 *                 case 500:
 *                   console.error('Server error occurred');
 *                   break;
 *               }
 *             }
 *           }
 *
 *           handleUnauthorized() {
 *             localStorage.removeItem('authToken');
 *             window.location.href = '/login';
 *           }
 *
 *           // Predefined reward scenarios
 *           async awardPerfectLesson(lessonId) {
 *             return Promise.all([
 *               this.awardXP(50, 'Perfect lesson completion', lessonId),
 *               this.awardGems(5, 'Perfect lesson bonus', lessonId)
 *             ]);
 *           }
 *
 *           async awardStreakBonus(lessonId, streakDays) {
 *             const bonusAmount = Math.min(streakDays * 5, 100); // Cap at 100
 *             return this.awardXP(bonusAmount, `${streakDays}-day streak bonus`, lessonId);
 *           }
 *
 *           async awardFirstTimeCompletion(lessonId) {
 *             return Promise.all([
 *               this.awardXP(25, 'First time completion', lessonId),
 *               this.awardGems(3, 'New lesson bonus', lessonId),
 *               this.awardGel(1, 'Discovery bonus', lessonId)
 *             ]);
 *           }
 *         }
 *
 *         export const rewardSystem = new RewardSystem();
 *         ```
 *
 *         **Step 3: Error Handling and Validation**
 *         ```javascript
 *         const addRewardWithValidation = async (rewardData) => {
 *           // Client-side validation
 *           const validationErrors = validateRewardData(rewardData);
 *           if (validationErrors.length > 0) {
 *             throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
 *           }
 *
 *           try {
 *             const response = await axios.post('/api/add-reward', rewardData);
 *             return response.data;
 *           } catch (error) {
 *             if (axios.isAxiosError(error)) {
 *               const errorData = error.response?.data;
 *
 *               if (error.response?.status === 400 && errorData?.errors) {
 *                 // Handle server validation errors
 *                 const serverErrors = Object.entries(errorData.errors)
 *                   .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
 *                   .join('; ');
 *                 throw new Error(`Server validation failed: ${serverErrors}`);
 *               }
 *             }
 *             throw error;
 *           }
 *         };
 *
 *         function validateRewardData(data) {
 *           const errors = [];
 *
 *           if (!['xp', 'gems', 'gel'].includes(data.type)) {
 *             errors.push('Invalid reward type');
 *           }
 *
 *           if (!Number.isInteger(data.amount) || data.amount < 1) {
 *             errors.push('Amount must be a positive integer');
 *           }
 *
 *           if (!data.reason || data.reason.trim().length === 0) {
 *             errors.push('Reason is required');
 *           }
 *
 *           if (!data.lessonId || !/^[0-9a-fA-F]{24}$/.test(data.lessonId)) {
 *             errors.push('Valid lesson ID is required');
 *           }
 *
 *           return errors;
 *         }
 *         ```
 *
 *     ReactRewardSystemExample:
 *       summary: React component for reward management
 *       description: |
 *         ```typescript
 *         import React, { useState, useCallback } from 'react';
 *         import axios from 'axios';
 *
 *         interface RewardData {
 *           type: 'xp' | 'gems' | 'gel';
 *           amount: number;
 *           reason: string;
 *           lessonId: string;
 *         }
 *
 *         interface RewardHistoryEntry {
 *           _id: string;
 *           type: string;
 *           amount: number;
 *           reason: string;
 *           lessonId: string;
 *           awardedAt: string;
 *         }
 *
 *         interface RewardManagerProps {
 *           lessonId: string;
 *           onRewardAdded: (rewardHistory: RewardHistoryEntry[]) => void;
 *         }
 *
 *         export function RewardManager({ lessonId, onRewardAdded }: RewardManagerProps) {
 *           const [rewardType, setRewardType] = useState<'xp' | 'gems' | 'gel'>('xp');
 *           const [amount, setAmount] = useState<number>(10);
 *           const [reason, setReason] = useState<string>('');
 *           const [loading, setLoading] = useState(false);
 *           const [error, setError] = useState<string | null>(null);
 *           const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
 *
 *           const addReward = useCallback(async (rewardData: RewardData) => {
 *             setLoading(true);
 *             setError(null);
 *             setValidationErrors({});
 *
 *             try {
 *               const response = await axios.post('/api/add-reward', rewardData);
 *
 *               if (response.status === 201) {
 *                 onRewardAdded(response.data.rewardHistory);
 *                 // Reset form
 *                 setAmount(10);
 *                 setReason('');
 *                 return true;
 *               }
 *             } catch (err) {
 *               if (axios.isAxiosError(err)) {
 *                 const errorData = err.response?.data;
 *
 *                 if (err.response?.status === 400 && errorData?.errors) {
 *                   setValidationErrors(errorData.errors);
 *                   setError('Please fix the validation errors');
 *                 } else if (err.response?.status === 404) {
 *                   setError('User progress not found');
 *                 } else if (err.response?.status === 401) {
 *                   setError('You are not authorized to add rewards');
 *                 } else {
 *                   setError(errorData?.error || 'Failed to add reward');
 *                 }
 *               } else {
 *                 setError('An unexpected error occurred');
 *               }
 *               return false;
 *             } finally {
 *               setLoading(false);
 *             }
 *           }, [onRewardAdded]);
 *
 *           const handleSubmit = async (e: React.FormEvent) => {
 *             e.preventDefault();
 *
 *             if (!reason.trim()) {
 *               setError('Please provide a reason for the reward');
 *               return;
 *             }
 *
 *             await addReward({
 *               type: rewardType,
 *               amount,
 *               reason: reason.trim(),
 *               lessonId
 *             });
 *           };
 *
 *           const quickRewards = [
 *             { type: 'xp' as const, amount: 25, reason: 'Perfect lesson completion' },
 *             { type: 'xp' as const, amount: 50, reason: 'Exceptional performance' },
 *             { type: 'gems' as const, amount: 5, reason: 'Daily streak bonus' },
 *             { type: 'gems' as const, amount: 10, reason: 'Weekly challenge completion' },
 *             { type: 'gel' as const, amount: 3, reason: 'Special achievement unlock' }
 *           ];
 *
 *           return (
 *             <div className="reward-manager">
 *               <h3>Add Reward</h3>
 *
 *               <form onSubmit={handleSubmit} className="reward-form">
 *                 <div className="form-group">
 *                   <label htmlFor="reward-type">Reward Type:</label>
 *                   <select
 *                     id="reward-type"
 *                     value={rewardType}
 *                     onChange={(e) => setRewardType(e.target.value as 'xp' | 'gems' | 'gel')}
 *                     disabled={loading}
 *                   >
 *                     <option value="xp">XP Points</option>
 *                     <option value="gems">Gems</option>
 *                     <option value="gel">Gel</option>
 *                   </select>
 *                   {validationErrors.type && (
 *                     <div className="validation-error">
 *                       {validationErrors.type.join(', ')}
 *                     </div>
 *                   )}
 *                 </div>
 *
 *                 <div className="form-group">
 *                   <label htmlFor="amount">Amount:</label>
 *                   <input
 *                     id="amount"
 *                     type="number"
 *                     min="1"
 *                     value={amount}
 *                     onChange={(e) => setAmount(parseInt(e.target.value) || 1)}
 *                     disabled={loading}
 *                   />
 *                   {validationErrors.amount && (
 *                     <div className="validation-error">
 *                       {validationErrors.amount.join(', ')}
 *                     </div>
 *                   )}
 *                 </div>
 *
 *                 <div className="form-group">
 *                   <label htmlFor="reason">Reason:</label>
 *                   <input
 *                     id="reason"
 *                     type="text"
 *                     value={reason}
 *                     onChange={(e) => setReason(e.target.value)}
 *                     placeholder="Why is this reward being given?"
 *                     disabled={loading}
 *                     maxLength={200}
 *                   />
 *                   {validationErrors.reason && (
 *                     <div className="validation-error">
 *                       {validationErrors.reason.join(', ')}
 *                     </div>
 *                   )}
 *                 </div>
 *
 *                 {error && (
 *                   <div className="error-message">
 *                     {error}
 *                   </div>
 *                 )}
 *
 *                 <button
 *                   type="submit"
 *                   disabled={loading || !reason.trim()}
 *                   className="add-reward-button"
 *                 >
 *                   {loading ? 'Adding Reward...' : 'Add Reward'}
 *                 </button>
 *               </form>
 *
 *               <div className="quick-rewards">
 *                 <h4>Quick Rewards:</h4>
 *                 <div className="quick-reward-buttons">
 *                   {quickRewards.map((reward, index) => (
 *                     <button
 *                       key={index}
 *                       onClick={() => addReward({ ...reward, lessonId })}
 *                       disabled={loading}
 *                       className="quick-reward-button"
 *                     >
 *                       +{reward.amount} {reward.type.toUpperCase()}
 *                       <br />
 *                       <small>{reward.reason}</small>
 *                     </button>
 *                   ))}
 *                 </div>
 *               </div>
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Rewards
 *     description: Operations related to awarding and tracking user rewards
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const body = await req.json();

    const validated = UserProgressAddRewardSchema.safeParse(body);

    const { type, amount, reason, lessonId } = validated.data;

    // Call your static method to add the reward
    const updatedProgress = await UserProgress.addReward(
      userId,
      lessonId,
      type,
      amount,
      reason
    );

    if (!updatedProgress) {
      return NextResponse.json(
        { message: "User progress not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Reward added successfully",
        rewardHistory: updatedProgress.rewardHistory,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("UserProgress API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
