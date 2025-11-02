import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import UserProgress from "@/models/UserProgress"; // adjust based on your actual path
import { UserProgressAddLessonSchema } from "@/lib/validations/userprogress";
import { getWeekProgressFromStreakHistory } from "@/lib/utils";
import Lesson from "@/models/Lesson";
import Unit from "@/models/Unit";
import Chapter from "@/models/Chapter";

/**
 * @swagger
 * /api/complete-lesson:
 *   post:
 *     summary: Mark lesson as completed and update user progress
 *     description: |
 *       Marks a lesson as completed, awards XP/gems/gel, updates streak information,
 *       and determines the next lesson in the learning path. Handles progression
 *       through units and chapters automatically. Requires user authentication.
 *     tags:
 *       - Lesson Progress
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CompleteLessonRequest'
 *           examples:
 *             basicCompletion:
 *               summary: Basic lesson completion
 *               value:
 *                 lessonId: "507f1f77bcf86cd799439011"
 *                 xp: 25
 *                 gems: 5
 *                 gel: 2
 *             withXpBoost:
 *               summary: Lesson completion with XP boost
 *               value:
 *                 lessonId: "507f1f77bcf86cd799439012"
 *                 xp: 30
 *                 gems: 8
 *                 gel: 3
 *                 xpBoost: 1.5
 *             minimumRewards:
 *               summary: Minimum rewards completion
 *               value:
 *                 lessonId: "507f1f77bcf86cd799439013"
 *                 xp: 10
 *                 gems: 1
 *     responses:
 *       '200':
 *         description: Successfully completed lesson and updated progress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompleteLessonResponse'
 *             examples:
 *               nextLessonAvailable:
 *                 summary: Next lesson in same unit available
 *                 value:
 *                   message: "Lesson marked as completed"
 *                   completedLessonsCount: 15
 *                   currentStreak: 7
 *                   lastStreakDate: "2024-01-15T10:30:00Z"
 *                   streakHistory:
 *                     - date: "2024-01-15"
 *                       lessonsCompleted: 3
 *                       xpEarned: 75
 *                     - date: "2024-01-14"
 *                       lessonsCompleted: 2
 *                       xpEarned: 50
 *                   weekProgress:
 *                     totalLessons: 12
 *                     totalXp: 300
 *                     daysActive: 5
 *                   nextLesson:
 *                     _id: "507f1f77bcf86cd799439014"
 *                     title: "Advanced Greetings"
 *                     order: 3
 *                     xpReward: 25
 *                   currentUnit:
 *                     _id: "507f1f77bcf86cd799439015"
 *                     title: "Basic Conversations"
 *                     order: 1
 *                   currentChapter:
 *                     _id: "507f1f77bcf86cd799439016"
 *                     title: "Getting Started"
 *                     order: 1
 *               unitProgression:
 *                 summary: Progressed to next unit
 *                 value:
 *                   message: "Lesson marked as completed"
 *                   completedLessonsCount: 20
 *                   currentStreak: 10
 *                   lastStreakDate: "2024-01-15T10:30:00Z"
 *                   streakHistory:
 *                     - date: "2024-01-15"
 *                       lessonsCompleted: 4
 *                       xpEarned: 100
 *                   weekProgress:
 *                     totalLessons: 18
 *                     totalXp: 450
 *                     daysActive: 6
 *                   nextLesson:
 *                     _id: "507f1f77bcf86cd799439017"
 *                     title: "Numbers Introduction"
 *                     order: 1
 *                     xpReward: 20
 *                   currentUnit:
 *                     _id: "507f1f77bcf86cd799439018"
 *                     title: "Numbers and Counting"
 *                     order: 2
 *                   currentChapter:
 *                     _id: "507f1f77bcf86cd799439018"
 *                     title: "Numbers and Counting"
 *                     order: 2
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
 *         description: Not found - User progress not found or lesson already completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               progressNotFound:
 *                 value:
 *                   error: "User progress not found or already completed"
 *       '500':
 *         description: Internal server error - Validation error or server failure
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ServerErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Request validation failed
 *                 value:
 *                   message: "Validation error"
 *                   errors:
 *                     lessonId: ["Required"]
 *                     xp: ["Expected number, received string"]
 *               serverError:
 *                 summary: Server error during processing
 *                 value:
 *                   error: "Server error"
 *                   loading: false
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CompleteLessonRequest:
 *       type: object
 *       required:
 *         - lessonId
 *         - xp
 *         - gems
 *       properties:
 *         lessonId:
 *           type: string
 *           format: objectId
 *           description: The unique identifier of the completed lesson
 *           example: "507f1f77bcf86cd799439011"
 *         xp:
 *           type: integer
 *           minimum: 0
 *           description: Experience points earned for completing the lesson
 *           example: 25
 *         gems:
 *           type: integer
 *           minimum: 0
 *           description: Gems earned for completing the lesson
 *           example: 5
 *         gel:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Gel earned for completing the lesson (optional)
 *           example: 2
 *         xpBoost:
 *           type: number
 *           minimum: 1
 *           nullable: true
 *           description: XP multiplier boost (optional)
 *           example: 1.5
 *
 *     StreakHistoryEntry:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the streak entry
 *           example: "2024-01-15"
 *         lessonsCompleted:
 *           type: integer
 *           minimum: 0
 *           description: Number of lessons completed on this date
 *           example: 3
 *         xpEarned:
 *           type: integer
 *           minimum: 0
 *           description: Total XP earned on this date
 *           example: 75
 *
 *     WeekProgress:
 *       type: object
 *       properties:
 *         totalLessons:
 *           type: integer
 *           minimum: 0
 *           description: Total lessons completed this week
 *           example: 12
 *         totalXp:
 *           type: integer
 *           minimum: 0
 *           description: Total XP earned this week
 *           example: 300
 *         daysActive:
 *           type: integer
 *           minimum: 0
 *           maximum: 7
 *           description: Number of days active this week
 *           example: 5
 *
 *     LessonInfo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Lesson identifier
 *           example: "507f1f77bcf86cd799439014"
 *         title:
 *           type: string
 *           description: Lesson title
 *           example: "Advanced Greetings"
 *         order:
 *           type: integer
 *           minimum: 1
 *           description: Lesson order within the unit
 *           example: 3
 *         xpReward:
 *           type: integer
 *           minimum: 0
 *           description: XP reward for completing this lesson
 *           example: 25
 *
 *     UnitInfo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unit identifier
 *           example: "507f1f77bcf86cd799439015"
 *         title:
 *           type: string
 *           description: Unit title
 *           example: "Basic Conversations"
 *         order:
 *           type: integer
 *           minimum: 1
 *           description: Unit order within the chapter
 *           example: 1
 *
 *     ChapterInfo:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Chapter identifier
 *           example: "507f1f77bcf86cd799439016"
 *         title:
 *           type: string
 *           description: Chapter title
 *           example: "Getting Started"
 *         order:
 *           type: integer
 *           minimum: 1
 *           description: Chapter order within the language course
 *           example: 1
 *
 *     CompleteLessonResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Lesson marked as completed"
 *         completedLessonsCount:
 *           type: integer
 *           minimum: 0
 *           description: Total number of lessons completed by the user
 *           example: 15
 *         currentStreak:
 *           type: integer
 *           minimum: 0
 *           description: Current learning streak in days
 *           example: 7
 *         lastStreakDate:
 *           type: string
 *           format: date-time
 *           description: Date of the last streak activity
 *           example: "2024-01-15T10:30:00Z"
 *         streakHistory:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StreakHistoryEntry'
 *           description: Historical streak data
 *         weekProgress:
 *           $ref: '#/components/schemas/WeekProgress'
 *           description: Progress summary for the current week
 *         nextLesson:
 *           $ref: '#/components/schemas/LessonInfo'
 *           nullable: true
 *           description: Next lesson to complete (null if course is finished)
 *         currentUnit:
 *           $ref: '#/components/schemas/UnitInfo'
 *           description: Current unit information
 *         currentChapter:
 *           $ref: '#/components/schemas/ChapterInfo'
 *           description: Current chapter information
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
 *             lessonId: ["Required"]
 *             xp: ["Expected number, received string"]
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Unauthorized"
 *
 *     ServerErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Server error message
 *           example: "Server error"
 *         loading:
 *           type: boolean
 *           description: Loading state indicator
 *           example: false
 *
 *   examples:
 *     CompleteLessonUsageExample:
 *       summary: How to use the Complete Lesson API with Axios
 *       description: |
 *         **Step 1: Basic Lesson Completion with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const completeLesson = async (lessonId, rewards) => {
 *           try {
 *             const response = await axios.post('/api/complete-lesson', {
 *               lessonId,
 *               xp: rewards.xp,
 *               gems: rewards.gems,
 *               gel: rewards.gel || 0,
 *               xpBoost: rewards.xpBoost || null
 *             }, {
 *               headers: {
 *                 'Content-Type': 'application/json',
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.status === 200) {
 *               console.log('Lesson completed successfully!');
 *               return {
 *                 success: true,
 *                 data: response.data
 *               };
 *             }
 *           } catch (error) {
 *             console.error('Failed to complete lesson:', error);
 *             return {
 *               success: false,
 *               error: error.response?.data || error.message
 *             };
 *           }
 *         };
 *
 *         // Usage
 *         const result = await completeLesson('507f1f77bcf86cd799439011', {
 *           xp: 25,
 *           gems: 5,
 *           gel: 2
 *         });
 *         ```
 *
 *         **Step 2: Handle Different Response Scenarios**
 *         ```javascript
 *         const handleLessonCompletion = async (lessonData) => {
 *           try {
 *             const response = await axios.post('/api/complete-lesson', lessonData);
 *             const result = response.data;
 *
 *             // Update UI with progress information
 *             updateProgressUI({
 *               streak: result.currentStreak,
 *               completedLessons: result.completedLessonsCount,
 *               weekProgress: result.weekProgress
 *             });
 *
 *             // Handle next lesson navigation
 *             if (result.nextLesson) {
 *               console.log(`Next lesson: ${result.nextLesson.title}`);
 *               // Navigate to next lesson or show completion celebration
 *               showLessonCompletionModal(result);
 *             } else {
 *               console.log('Unit or chapter completed!');
 *               showUnitCompletionCelebration(result);
 *             }
 *
 *             return result;
 *           } catch (error) {
 *             if (axios.isAxiosError(error)) {
 *               const status = error.response?.status;
 *               const errorData = error.response?.data;
 *
 *               switch (status) {
 *                 case 401:
 *                   handleUnauthorized();
 *                   break;
 *                 case 404:
 *                   showError('Lesson not found or already completed');
 *                   break;
 *                 case 500:
 *                   if (errorData.errors) {
 *                     handleValidationErrors(errorData.errors);
 *                   } else {
 *                     showError('Server error occurred');
 *                   }
 *                   break;
 *                 default:
 *                   showError('An unexpected error occurred');
 *               }
 *             }
 *             throw error;
 *           }
 *         };
 *         ```
 *
 *         **Step 3: Create Axios Service with Interceptors**
 *         ```javascript
 *         class LessonService {
 *           constructor() {
 *             this.client = axios.create({
 *               baseURL: '/api',
 *               timeout: 10000
 *             });
 *
 *             this.setupInterceptors();
 *           }
 *
 *           setupInterceptors() {
 *             // Request interceptor
 *             this.client.interceptors.request.use(
 *               (config) => {
 *                 const token = localStorage.getItem('authToken');
 *                 if (token) {
 *                   config.headers.Authorization = `Bearer ${token}`;
 *                 }
 *                 return config;
 *               },
 *               (error) => Promise.reject(error)
 *             );
 *
 *             // Response interceptor
 *             this.client.interceptors.response.use(
 *               (response) => response,
 *               (error) => {
 *                 if (error.response?.status === 401) {
 *                   this.handleTokenExpiry();
 *                 }
 *                 return Promise.reject(error);
 *               }
 *             );
 *           }
 *
 *           handleTokenExpiry() {
 *             localStorage.removeItem('authToken');
 *             window.location.href = '/login';
 *           }
 *
 *           async completeLesson(lessonData) {
 *             const response = await this.client.post('/complete-lesson', lessonData);
 *             return response.data;
 *           }
 *
 *           async getLessonProgress(lessonId) {
 *             const response = await this.client.get(`/lesson-progress/${lessonId}`);
 *             return response.data;
 *           }
 *         }
 *
 *         export const lessonService = new LessonService();
 *         ```
 *
 *     ReactLessonCompletionExample:
 *       summary: React component for lesson completion
 *       description: |
 *         ```typescript
 *         import React, { useState } from 'react';
 *         import axios from 'axios';
 *
 *         interface LessonCompletionProps {
 *           lessonId: string;
 *           expectedRewards: {
 *             xp: number;
 *             gems: number;
 *             gel?: number;
 *           };
 *           onLessonCompleted: (result: any) => void;
 *           onError: (error: string) => void;
 *         }
 *
 *         export function LessonCompletionComponent({
 *           lessonId,
 *           expectedRewards,
 *           onLessonCompleted,
 *           onError
 *         }: LessonCompletionProps) {
 *           const [completing, setCompleting] = useState(false);
 *           const [completed, setCompleted] = useState(false);
 *           const [result, setResult] = useState(null);
 *
 *           const handleCompleteLesson = async (xpBoost = null) => {
 *             setCompleting(true);
 *
 *             try {
 *               const response = await axios.post('/api/complete-lesson', {
 *                 lessonId,
 *                 xp: expectedRewards.xp,
 *                 gems: expectedRewards.gems,
 *                 gel: expectedRewards.gel || 0,
 *                 xpBoost
 *               });
 *
 *               const completionResult = response.data;
 *               setResult(completionResult);
 *               setCompleted(true);
 *               onLessonCompleted(completionResult);
 *
 *             } catch (error) {
 *               let errorMessage = 'Failed to complete lesson';
 *
 *               if (axios.isAxiosError(error)) {
 *                 const errorData = error.response?.data;
 *                 if (error.response?.status === 404) {
 *                   errorMessage = 'Lesson already completed or not found';
 *                 } else if (error.response?.status === 500 && errorData?.errors) {
 *                   errorMessage = 'Invalid lesson data provided';
 *                 } else if (errorData?.error) {
 *                   errorMessage = errorData.error;
 *                 }
 *               }
 *
 *               onError(errorMessage);
 *             } finally {
 *               setCompleting(false);
 *             }
 *           };
 *
 *           if (completed && result) {
 *             return (
 *               <div className="lesson-completion-success">
 *                 <h2>🎉 Lesson Completed!</h2>
 *
 *                 <div className="rewards-summary">
 *                   <div className="reward-item">
 *                     <span>XP Earned:</span>
 *                     <span>{expectedRewards.xp}</span>
 *                   </div>
 *                   <div className="reward-item">
 *                     <span>Gems Earned:</span>
 *                     <span>{expectedRewards.gems}</span>
 *                   </div>
 *                   {expectedRewards.gel > 0 && (
 *                     <div className="reward-item">
 *                       <span>Gel Earned:</span>
 *                       <span>{expectedRewards.gel}</span>
 *                     </div>
 *                   )}
 *                 </div>
 *
 *                 <div className="progress-summary">
 *                   <div className="stat">
 *                     <span>Current Streak:</span>
 *                     <span>{result.currentStreak} days</span>
 *                   </div>
 *                   <div className="stat">
 *                     <span>Total Lessons:</span>
 *                     <span>{result.completedLessonsCount}</span>
 *                   </div>
 *                   <div className="stat">
 *                     <span>This Week:</span>
 *                     <span>{result.weekProgress.totalLessons} lessons</span>
 *                   </div>
 *                 </div>
 *
 *                 {result.nextLesson ? (
 *                   <div className="next-lesson">
 *                     <h3>Next Lesson:</h3>
 *                     <p>{result.nextLesson.title}</p>
 *                     <button onClick={() => navigateToLesson(result.nextLesson._id)}>
 *                       Continue Learning
 *                     </button>
 *                   </div>
 *                 ) : (
 *                   <div className="unit-completed">
 *                     <h3>🏆 Unit Completed!</h3>
 *                     <p>Great job! You've finished this unit.</p>
 *                   </div>
 *                 )}
 *               </div>
 *             );
 *           }
 *
 *           return (
 *             <div className="lesson-completion">
 *               <h2>Complete Lesson</h2>
 *
 *               <div className="expected-rewards">
 *                 <h3>You will earn:</h3>
 *                 <ul>
 *                   <li>{expectedRewards.xp} XP</li>
 *                   <li>{expectedRewards.gems} Gems</li>
 *                   {expectedRewards.gel > 0 && <li>{expectedRewards.gel} Gel</li>}
 *                 </ul>
 *               </div>
 *
 *               <div className="completion-actions">
 *                 <button
 *                   onClick={() => handleCompleteLesson()}
 *                   disabled={completing}
 *                   className="complete-button"
 *                 >
 *                   {completing ? 'Completing...' : 'Complete Lesson'}
 *                 </button>
 *
 *                 <button
 *                   onClick={() => handleCompleteLesson(2.0)}
 *                   disabled={completing}
 *                   className="complete-with-boost-button"
 *                 >
 *                   {completing ? 'Completing...' : 'Complete with 2x XP Boost'}
 *                 </button>
 *               </div>
 *             </div>
 *           );
 *         }
 *
 *         // Helper function for navigation
 *         const navigateToLesson = (lessonId: string) => {
 *           window.location.href = `/lesson/${lessonId}`;
 *         };
 *         ```
 *
 * tags:
 *   - name: Lesson Progress
 *     description: Operations related to lesson completion and progress tracking
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    // Validate input using Zod
    const validated = UserProgressAddLessonSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { lessonId, xp, gems, gel = 0, xpBoost = null } = validated.data;
    await connectDB();

    const result = await UserProgress.addCompletedLesson(userId, {
      lessonId,
      xp,
      gems,
      gel,
      xpBoost,
    });

    if (!result) {
      return NextResponse.json(
        { error: "User progress not found or already completed" },
        { status: 404 }
      );
    }

    const weekProgress = await getWeekProgressFromStreakHistory(
      result.streakHistory || []
    );

    const currentLesson = await Lesson.findById(lessonId);
    if (!currentLesson) throw new Error("Lesson not found");

    const nextLesson = await Lesson.findOne({
      chapterId: currentLesson.chapterId, // if you group by chapter
      unitId: currentLesson.unitId, // if you group by chapter
      order: currentLesson.order + 1,
    });

    const currentUnit = await Unit.findById(currentLesson.unitId);
    if (!currentUnit) throw new Error("Current unit not found");

    const currentChapter = await Chapter.findById(currentLesson.chapterId);
    if (!currentChapter) throw new Error("Current Chapter not found");

    //check if nextLesson exist
    if (!nextLesson) {
      // Step 1: Find the current unit

      // Step 2: Find the next unit in the same chapter
      const nextUnit = await Unit.findOne({
        chapterId: currentLesson.chapterId,
        order: currentUnit.order + 1,
      });

      if (nextUnit) {
        // Step 3: Find the first lesson in the next unit (not a test)
        const firstLessonOfNextUnit = await Lesson.findOne({
          unitId: nextUnit._id,
          isTest: { $ne: true }, // not true
        }).sort({ order: 1 });

        return NextResponse.json({
          message: "Lesson marked as completed",
          completedLessonsCount: result.completedLessons.length,
          currentStreak: result.currentStreak,
          lastStreakDate: result.lastStreakDate,
          streakHistory: result.streakHistory ?? [],
          weekProgress: weekProgress,
          nextLesson: firstLessonOfNextUnit,
          currentUnit: nextUnit,
          currentChapter: nextUnit,
        });
      }
    }

    return NextResponse.json({
      message: "Lesson marked as completed",
      completedLessonsCount: result.completedLessons.length,
      currentStreak: result.currentStreak,
      lastStreakDate: result.lastStreakDate,
      streakHistory: result.streakHistory ?? [],
      weekProgress: weekProgress,
      nextLesson: nextLesson,
      currentUnit: currentUnit,
      currentChapter: currentChapter,
    });
  } catch (err) {
    console.error("UserProgress API error:", err);
    return NextResponse.json(
      { error: "Server error", loading: false },
      { status: 500 }
    );
  }
}
