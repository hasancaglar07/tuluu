import connectDB from "@/lib/db/connect";
import UserProgress from "@/models/UserProgress";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/is-unit-completed:
 *   get:
 *     summary: Check if a unit is completed by a user
 *     description: |
 *       Verifies whether a specific user has completed a particular learning unit.
 *       Returns completion status information. Requires user authentication.
 *     tags:
 *       - Unit Progress
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to check completion status for
 *         example: "user_123abc"
 *       - in: query
 *         name: unitId
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: The unit ID to check completion status for
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       '200':
 *         description: Successfully retrieved unit completion status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnitCompletionResponse'
 *             examples:
 *               unitCompleted:
 *                 summary: Unit is completed
 *                 value:
 *                   isCompleted: true
 *                   completedAt: "2024-01-15T10:30:00Z"
 *                   completedLessons: 5
 *                   totalLessons: 5
 *               unitInProgress:
 *                 summary: Unit is in progress
 *                 value:
 *                   isCompleted: false
 *                   completedLessons: 3
 *                   totalLessons: 5
 *                   progress: 60
 *               unitNotStarted:
 *                 summary: Unit not started
 *                 value:
 *                   isCompleted: false
 *                   completedLessons: 0
 *                   totalLessons: 5
 *                   progress: 0
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
 *       '500':
 *         description: Internal server error - Missing data or server failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingData:
 *                 summary: Missing required query parameters
 *                 value:
 *                   error: "data missing"
 *               serverError:
 *                 summary: Server error during processing
 *                 value:
 *                   error: "Internal server error"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UnitCompletionResponse:
 *       type: object
 *       properties:
 *         isCompleted:
 *           type: boolean
 *           description: Whether the unit is completed by the user
 *           example: true
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the unit was completed (only present if completed)
 *           example: "2024-01-15T10:30:00Z"
 *         completedLessons:
 *           type: integer
 *           minimum: 0
 *           description: Number of lessons completed in this unit
 *           example: 5
 *         totalLessons:
 *           type: integer
 *           minimum: 0
 *           description: Total number of lessons in this unit
 *           example: 5
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Percentage of unit completion (only present if not completed)
 *           example: 60
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
 *     UnitCompletionUsageExample:
 *       summary: How to use the Is Unit Completed API with Axios
 *       description: |
 *         **Step 1: Basic Unit Completion Check with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const checkUnitCompletion = async (userId, unitId) => {
 *           try {
 *             const response = await axios.get('/api/is-unit-completed', {
 *               params: { userId, unitId },
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             return response.data;
 *           } catch (error) {
 *             console.error('Failed to check unit completion:', error);
 *
 *             if (axios.isAxiosError(error)) {
 *               const status = error.response?.status;
 *               const errorMessage = error.response?.data?.error;
 *
 *               if (status === 401) {
 *                 console.error('Authentication required');
 *               } else if (status === 500 && errorMessage === 'data missing') {
 *                 console.error('Missing userId or unitId parameter');
 *               } else {
 *                 console.error('Server error:', errorMessage);
 *               }
 *             }
 *
 *             throw error;
 *           }
 *         };
 *
 *         // Usage
 *         const unitStatus = await checkUnitCompletion('user_123abc', '507f1f77bcf86cd799439011');
 *         console.log('Unit completion status:', unitStatus);
 *         ```
 *
 *         **Step 2: Handle Different Completion States**
 *         ```javascript
 *         const renderUnitStatus = (unitStatus) => {
 *           if (unitStatus.isCompleted) {
 *             return {
 *               status: 'completed',
 *               message: `Completed on ${new Date(unitStatus.completedAt).toLocaleDateString()}`,
 *               progressText: 'All lessons completed',
 *               progressPercentage: 100
 *             };
 *           } else if (unitStatus.completedLessons > 0) {
 *             return {
 *               status: 'in-progress',
 *               message: `${unitStatus.completedLessons} of ${unitStatus.totalLessons} lessons completed`,
 *               progressText: `${unitStatus.progress}% complete`,
 *               progressPercentage: unitStatus.progress
 *             };
 *           } else {
 *             return {
 *               status: 'not-started',
 *               message: 'Not started yet',
 *               progressText: '0% complete',
 *               progressPercentage: 0
 *             };
 *           }
 *         };
 *
 *         const checkAndDisplayUnitStatus = async (userId, unitId) => {
 *           try {
 *             const unitStatus = await checkUnitCompletion(userId, unitId);
 *             const statusInfo = renderUnitStatus(unitStatus);
 *
 *             // Update UI based on status
 *             updateUnitStatusUI(unitId, statusInfo);
 *
 *             return statusInfo;
 *           } catch (error) {
 *             // Handle error
 *             updateUnitStatusUI(unitId, {
 *               status: 'error',
 *               message: 'Failed to check status',
 *               progressText: 'Unknown',
 *               progressPercentage: 0
 *             });
 *
 *             throw error;
 *           }
 *         };
 *         ```
 *
 *         **Step 3: Create a Reusable Hook for Unit Completion**
 *         ```javascript
 *         import { useState, useEffect, useCallback } from 'react';
 *         import axios from 'axios';
 *
 *         export function useUnitCompletion(userId, unitId) {
 *           const [unitStatus, setUnitStatus] = useState(null);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState(null);
 *
 *           const checkCompletion = useCallback(async () => {
 *             if (!userId || !unitId) {
 *               setLoading(false);
 *               return;
 *             }
 *
 *             setLoading(true);
 *             setError(null);
 *
 *             try {
 *               const response = await axios.get('/api/is-unit-completed', {
 *                 params: { userId, unitId }
 *               });
 *
 *               setUnitStatus(response.data);
 *             } catch (err) {
 *               const errorMessage = axios.isAxiosError(err)
 *                 ? err.response?.data?.error || 'Failed to check unit status'
 *                 : 'An unexpected error occurred';
 *
 *               setError(errorMessage);
 *             } finally {
 *               setLoading(false);
 *             }
 *           }, [userId, unitId]);
 *
 *           useEffect(() => {
 *             checkCompletion();
 *           }, [checkCompletion]);
 *
 *           return {
 *             unitStatus,
 *             loading,
 *             error,
 *             isCompleted: unitStatus?.isCompleted || false,
 *             progress: unitStatus?.progress || 0,
 *             completedLessons: unitStatus?.completedLessons || 0,
 *             totalLessons: unitStatus?.totalLessons || 0,
 *             refreshStatus: checkCompletion
 *           };
 *         }
 *         ```
 *
 *     ReactUnitCompletionExample:
 *       summary: React component for unit completion status
 *       description: |
 *         ```typescript
 *         import React from 'react';
 *         import axios from 'axios';
 *
 *         interface UnitCompletionStatus {
 *           isCompleted: boolean;
 *           completedAt?: string;
 *           completedLessons: number;
 *           totalLessons: number;
 *           progress?: number;
 *         }
 *
 *         interface UnitCompletionProps {
 *           userId: string;
 *           unitId: string;
 *           unitTitle: string;
 *           onNavigateToUnit: (unitId: string) => void;
 *         }
 *
 *         export function UnitCompletionStatus({
 *           userId,
 *           unitId,
 *           unitTitle,
 *           onNavigateToUnit
 *         }: UnitCompletionProps) {
 *           const [status, setStatus] = React.useState<UnitCompletionStatus | null>(null);
 *           const [loading, setLoading] = React.useState(true);
 *           const [error, setError] = React.useState<string | null>(null);
 *
 *           React.useEffect(() => {
 *             const checkUnitStatus = async () => {
 *               try {
 *                 setLoading(true);
 *                 setError(null);
 *
 *                 const response = await axios.get('/api/is-unit-completed', {
 *                   params: { userId, unitId }
 *                 });
 *
 *                 setStatus(response.data);
 *               } catch (err) {
 *                 if (axios.isAxiosError(err)) {
 *                   const errorMessage = err.response?.data?.error || 'Failed to check unit status';
 *                   setError(errorMessage);
 *                 } else {
 *                   setError('An unexpected error occurred');
 *                 }
 *               } finally {
 *                 setLoading(false);
 *               }
 *             };
 *
 *             checkUnitStatus();
 *           }, [userId, unitId]);
 *
 *           if (loading) {
 *             return <div className="unit-status-loading">Checking unit status...</div>;
 *           }
 *
 *           if (error) {
 *             return <div className="unit-status-error">Error: {error}</div>;
 *           }
 *
 *           if (!status) {
 *             return <div className="unit-status-unknown">Status unavailable</div>;
 *           }
 *
 *           return (
 *             <div className={`unit-status ${status.isCompleted ? 'completed' : 'in-progress'}`}>
 *               <h3>{unitTitle}</h3>
 *
 *               <div className="progress-container">
 *                 <div
 *                   className="progress-bar"
 *                   style={{ width: `${status.isCompleted ? 100 : status.progress || 0}%` }}
 *                 />
 *               </div>
 *
 *               <div className="status-details">
 *                 {status.isCompleted ? (
 *                   <>
 *                     <span className="completion-badge">✅ Completed</span>
 *                     {status.completedAt && (
 *                       <span className="completion-date">
 *                         on {new Date(status.completedAt).toLocaleDateString()}
 *                       </span>
 *                     )}
 *                   </>
 *                 ) : (
 *                   <span className="progress-text">
 *                     {status.completedLessons} of {status.totalLessons} lessons completed
 *                     {status.progress !== undefined && ` (${status.progress}%)`}
 *                   </span>
 *                 )}
 *               </div>
 *
 *               <button
 *                 onClick={() => onNavigateToUnit(unitId)}
 *                 className={`unit-button ${status.isCompleted ? 'review' : 'continue'}`}
 *               >
 *                 {status.isCompleted ? 'Review Unit' : status.completedLessons > 0 ? 'Continue Unit' : 'Start Unit'}
 *               </button>
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Unit Progress
 *     description: Operations related to checking and managing unit completion status
 */
export async function GET(req: Request) {
  try {
    // Check if the user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const user = searchParams.get("userId");
    const unitId = searchParams.get("unitId");

    if (!user || !unitId) {
      return NextResponse.json({ error: "data missing" }, { status: 500 });
    }

    // Connect to the database
    await connectDB();

    // Get the user from our database
    const result = await UserProgress.isUnitCompleted(user, unitId);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
