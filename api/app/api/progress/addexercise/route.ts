import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import UserProgress from "@/models/UserProgress";
import Lesson from "@/models/Lesson"; // Import your Lesson model

/**
 * @swagger
 * /api/exercise-complete:
 *   post:
 *     summary: Mark exercises as completed
 *     description: |
 *       Marks one or more exercises as completed for a specific lesson and updates user progress.
 *       Automatically determines the language from the lesson and updates the user's learning progress.
 *       Requires user authentication and valid lesson/exercise data.
 *     tags:
 *       - Exercise Progress
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExerciseCompleteRequest'
 *           examples:
 *             singleExercise:
 *               summary: Complete single exercise
 *               value:
 *                 lessonId: "507f1f77bcf86cd799439011"
 *                 exerciseIds: ["507f1f77bcf86cd799439012"]
 *             multipleExercises:
 *               summary: Complete multiple exercises
 *               value:
 *                 lessonId: "507f1f77bcf86cd799439011"
 *                 exerciseIds: [
 *                   "507f1f77bcf86cd799439012",
 *                   "507f1f77bcf86cd799439013",
 *                   "507f1f77bcf86cd799439014"
 *                 ]
 *             lessonCompletion:
 *               summary: Complete all exercises in a lesson
 *               value:
 *                 lessonId: "507f1f77bcf86cd799439011"
 *                 exerciseIds: [
 *                   "507f1f77bcf86cd799439012",
 *                   "507f1f77bcf86cd799439013",
 *                   "507f1f77bcf86cd799439014",
 *                   "507f1f77bcf86cd799439015",
 *                   "507f1f77bcf86cd799439016"
 *                 ]
 *     responses:
 *       '200':
 *         description: Successfully marked exercises as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExerciseCompleteResponse'
 *             examples:
 *               successExample:
 *                 summary: Exercises completed successfully
 *                 value:
 *                   message: "Exercises marked as completed"
 *       '400':
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   error: "Missing required fields"
 *               emptyExerciseIds:
 *                 summary: Empty exercise IDs array
 *                 value:
 *                   error: "Missing required fields"
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
 *         description: Not found - Lesson, language, or user progress not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               lessonNotFound:
 *                 summary: Lesson or language not found
 *                 value:
 *                   error: "Lesson or language not found"
 *               progressNotFound:
 *                 summary: User progress not found
 *                 value:
 *                   error: "User progress not found"
 *       '500':
 *         description: Internal server error - Failed to update exercise progress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverErrorExample:
 *                 value:
 *                   error: "Server error"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ExerciseCompleteRequest:
 *       type: object
 *       required:
 *         - lessonId
 *         - exerciseIds
 *       properties:
 *         lessonId:
 *           type: string
 *           format: objectId
 *           description: The unique identifier of the lesson containing the exercises
 *           example: "507f1f77bcf86cd799439011"
 *         exerciseIds:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           minItems: 1
 *           description: Array of exercise IDs to mark as completed
 *           example: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *
 *     ExerciseCompleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Success message confirming exercises were marked as completed
 *           example: "Exercises marked as completed"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Missing required fields"
 *
 *   examples:
 *     ExerciseCompleteUsageExample:
 *       summary: How to use the Exercise Complete API
 *       description: |
 *         **Step 1: Complete Single Exercise**
 *         ```javascript
 *         const completeExercise = async (lessonId, exerciseId) => {
 *           const response = await fetch('/api/exercise-complete', {
 *             method: 'POST',
 *             headers: {
 *               'Content-Type': 'application/json',
 *               'Authorization': 'Bearer YOUR_TOKEN_HERE'
 *             },
 *             body: JSON.stringify({
 *               lessonId,
 *               exerciseIds: [exerciseId]
 *             })
 *           });
 *
 *           const result = await response.json();
 *
 *           if (response.ok) {
 *             console.log('Exercise completed:', result.message);
 *             return true;
 *           } else {
 *             console.error('Failed to complete exercise:', result.error);
 *             return false;
 *           }
 *         };
 *         ```
 *
 *         **Step 2: Complete Multiple Exercises**
 *         ```javascript
 *         const completeMultipleExercises = async (lessonId, exerciseIds) => {
 *           try {
 *             const response = await fetch('/api/exercise-complete', {
 *               method: 'POST',
 *               headers: {
 *                 'Content-Type': 'application/json',
 *                 'Authorization': 'Bearer YOUR_TOKEN_HERE'
 *               },
 *               body: JSON.stringify({
 *                 lessonId,
 *                 exerciseIds
 *               })
 *             });
 *
 *             if (!response.ok) {
 *               const error = await response.json();
 *               throw new Error(error.error || 'Failed to complete exercises');
 *             }
 *
 *             const result = await response.json();
 *             console.log('Exercises completed successfully:', result.message);
 *             return result;
 *           } catch (error) {
 *             console.error('Error completing exercises:', error.message);
 *             throw error;
 *           }
 *         };
 *         ```
 *
 *         **Step 3: Complete Entire Lesson**
 *         ```javascript
 *         const completeLessonExercises = async (lessonId, allExerciseIds) => {
 *           // Mark all exercises in the lesson as completed
 *           const success = await completeMultipleExercises(lessonId, allExerciseIds);
 *
 *           if (success) {
 *             // Optionally trigger lesson completion logic
 *             console.log('All exercises in lesson completed!');
 *
 *             // You might want to:
 *             // - Show completion animation
 *             // - Award XP points
 *             // - Unlock next lesson
 *             // - Update progress indicators
 *           }
 *         };
 *         ```
 *
 *     ReactExerciseTrackerExample:
 *       summary: React component for tracking exercise completion
 *       description: |
 *         ```typescript
 *         import { useState, useCallback } from 'react';
 *
 *         interface Exercise {
 *           id: string;
 *           title: string;
 *           isCompleted: boolean;
 *         }
 *
 *         interface ExerciseTrackerProps {
 *           lessonId: string;
 *           exercises: Exercise[];
 *           onExerciseComplete: (exerciseId: string) => void;
 *           onLessonComplete: () => void;
 *         }
 *
 *         export function ExerciseTracker({
 *           lessonId,
 *           exercises,
 *           onExerciseComplete,
 *           onLessonComplete
 *         }: ExerciseTrackerProps) {
 *           const [completedExercises, setCompletedExercises] = useState<Set<string>>(
 *             new Set(exercises.filter(ex => ex.isCompleted).map(ex => ex.id))
 *           );
 *           const [loading, setLoading] = useState(false);
 *           const [error, setError] = useState<string | null>(null);
 *
 *           const markExerciseComplete = useCallback(async (exerciseId: string) => {
 *             if (completedExercises.has(exerciseId)) {
 *               return; // Already completed
 *             }
 *
 *             setLoading(true);
 *             setError(null);
 *
 *             try {
 *               const response = await fetch('/api/exercise-complete', {
 *                 method: 'POST',
 *                 headers: { 'Content-Type': 'application/json' },
 *                 body: JSON.stringify({
 *                   lessonId,
 *                   exerciseIds: [exerciseId]
 *                 })
 *               });
 *
 *               if (!response.ok) {
 *                 const errorData = await response.json();
 *                 throw new Error(errorData.error || 'Failed to complete exercise');
 *               }
 *
 *               // Update local state
 *               setCompletedExercises(prev => new Set([...prev, exerciseId]));
 *               onExerciseComplete(exerciseId);
 *
 *               // Check if all exercises are now completed
 *               const newCompletedCount = completedExercises.size + 1;
 *               if (newCompletedCount === exercises.length) {
 *                 onLessonComplete();
 *               }
 *             } catch (err) {
 *               setError(err instanceof Error ? err.message : 'Unknown error');
 *             } finally {
 *               setLoading(false);
 *             }
 *           }, [lessonId, completedExercises, exercises.length, onExerciseComplete, onLessonComplete]);
 *
 *           const markMultipleComplete = useCallback(async (exerciseIds: string[]) => {
 *             const newExerciseIds = exerciseIds.filter(id => !completedExercises.has(id));
 *
 *             if (newExerciseIds.length === 0) {
 *               return; // All already completed
 *             }
 *
 *             setLoading(true);
 *             setError(null);
 *
 *             try {
 *               const response = await fetch('/api/exercise-complete', {
 *                 method: 'POST',
 *                 headers: { 'Content-Type': 'application/json' },
 *                 body: JSON.stringify({
 *                   lessonId,
 *                   exerciseIds: newExerciseIds
 *                 })
 *               });
 *
 *               if (!response.ok) {
 *                 const errorData = await response.json();
 *                 throw new Error(errorData.error || 'Failed to complete exercises');
 *               }
 *
 *               // Update local state
 *               setCompletedExercises(prev => new Set([...prev, ...newExerciseIds]));
 *
 *               // Notify about each completed exercise
 *               newExerciseIds.forEach(onExerciseComplete);
 *
 *               // Check if lesson is now complete
 *               const totalCompleted = completedExercises.size + newExerciseIds.length;
 *               if (totalCompleted === exercises.length) {
 *                 onLessonComplete();
 *               }
 *             } catch (err) {
 *               setError(err instanceof Error ? err.message : 'Unknown error');
 *             } finally {
 *               setLoading(false);
 *             }
 *           }, [lessonId, completedExercises, exercises.length, onExerciseComplete, onLessonComplete]);
 *
 *           const progressPercentage = (completedExercises.size / exercises.length) * 100;
 *
 *           return (
 *             <div className="exercise-tracker">
 *               <div className="progress-header">
 *                 <h3>Lesson Progress</h3>
 *                 <span>{completedExercises.size}/{exercises.length} exercises completed</span>
 *               </div>
 *
 *               <div className="progress-bar">
 *                 <div
 *                   className="progress-fill"
 *                   style={{ width: `${progressPercentage}%` }}
 *                 />
 *               </div>
 *
 *               {error && (
 *                 <div className="error-message">
 *                   Error: {error}
 *                 </div>
 *               )}
 *
 *               <div className="exercise-list">
 *                 {exercises.map(exercise => (
 *                   <div
 *                     key={exercise.id}
 *                     className={`exercise-item ${completedExercises.has(exercise.id) ? 'completed' : ''}`}
 *                   >
 *                     <span className="exercise-title">{exercise.title}</span>
 *                     <button
 *                       onClick={() => markExerciseComplete(exercise.id)}
 *                       disabled={loading || completedExercises.has(exercise.id)}
 *                       className="complete-button"
 *                     >
 *                       {completedExercises.has(exercise.id) ? '✅' : '⏳'}
 *                     </button>
 *                   </div>
 *                 ))}
 *               </div>
 *
 *               <button
 *                 onClick={() => markMultipleComplete(exercises.map(ex => ex.id))}
 *                 disabled={loading || completedExercises.size === exercises.length}
 *                 className="complete-all-button"
 *               >
 *                 {loading ? 'Completing...' : 'Complete All Exercises'}
 *               </button>
 *             </div>
 *           );
 *         }
 *         ```
 *
 *     ExerciseProgressHookExample:
 *       summary: Custom React hook for exercise progress management
 *       description: |
 *         ```typescript
 *         import { useState, useCallback, useEffect } from 'react';
 *
 *         interface UseExerciseProgressOptions {
 *           lessonId: string;
 *           initialCompletedExercises?: string[];
 *           onExerciseComplete?: (exerciseId: string) => void;
 *           onLessonComplete?: () => void;
 *         }
 *
 *         interface UseExerciseProgressReturn {
 *           completedExercises: Set<string>;
 *           loading: boolean;
 *           error: string | null;
 *           markComplete: (exerciseId: string) => Promise<boolean>;
 *           markMultipleComplete: (exerciseIds: string[]) => Promise<boolean>;
 *           isExerciseCompleted: (exerciseId: string) => boolean;
 *           getProgressPercentage: (totalExercises: number) => number;
 *           resetProgress: () => void;
 *         }
 *
 *         export function useExerciseProgress({
 *           lessonId,
 *           initialCompletedExercises = [],
 *           onExerciseComplete,
 *           onLessonComplete
 *         }: UseExerciseProgressOptions): UseExerciseProgressReturn {
 *           const [completedExercises, setCompletedExercises] = useState<Set<string>>(
 *             new Set(initialCompletedExercises)
 *           );
 *           const [loading, setLoading] = useState(false);
 *           const [error, setError] = useState<string | null>(null);
 *
 *           const markComplete = useCallback(async (exerciseId: string): Promise<boolean> => {
 *             if (completedExercises.has(exerciseId)) {
 *               return true; // Already completed
 *             }
 *
 *             setLoading(true);
 *             setError(null);
 *
 *             try {
 *               const response = await fetch('/api/exercise-complete', {
 *                 method: 'POST',
 *                 headers: { 'Content-Type': 'application/json' },
 *                 body: JSON.stringify({
 *                   lessonId,
 *                   exerciseIds: [exerciseId]
 *                 })
 *               });
 *
 *               if (!response.ok) {
 *                 const errorData = await response.json();
 *                 throw new Error(errorData.error || 'Failed to complete exercise');
 *               }
 *
 *               setCompletedExercises(prev => new Set([...prev, exerciseId]));
 *               onExerciseComplete?.(exerciseId);
 *               return true;
 *             } catch (err) {
 *               const errorMessage = err instanceof Error ? err.message : 'Unknown error';
 *               setError(errorMessage);
 *               return false;
 *             } finally {
 *               setLoading(false);
 *             }
 *           }, [lessonId, completedExercises, onExerciseComplete]);
 *
 *           const markMultipleComplete = useCallback(async (exerciseIds: string[]): Promise<boolean> => {
 *             const newExerciseIds = exerciseIds.filter(id => !completedExercises.has(id));
 *
 *             if (newExerciseIds.length === 0) {
 *               return true; // All already completed
 *             }
 *
 *             setLoading(true);
 *             setError(null);
 *
 *             try {
 *               const response = await fetch('/api/exercise-complete', {
 *                 method: 'POST',
 *                 headers: { 'Content-Type': 'application/json' },
 *                 body: JSON.stringify({
 *                   lessonId,
 *                   exerciseIds: newExerciseIds
 *                 })
 *               });
 *
 *               if (!response.ok) {
 *                 const errorData = await response.json();
 *                 throw new Error(errorData.error || 'Failed to complete exercises');
 *               }
 *
 *               setCompletedExercises(prev => new Set([...prev, ...newExerciseIds]));
 *               newExerciseIds.forEach(id => onExerciseComplete?.(id));
 *               return true;
 *             } catch (err) {
 *               const errorMessage = err instanceof Error ? err.message : 'Unknown error';
 *               setError(errorMessage);
 *               return false;
 *             } finally {
 *               setLoading(false);
 *             }
 *           }, [lessonId, completedExercises, onExerciseComplete]);
 *
 *           const isExerciseCompleted = useCallback((exerciseId: string) => {
 *             return completedExercises.has(exerciseId);
 *           }, [completedExercises]);
 *
 *           const getProgressPercentage = useCallback((totalExercises: number) => {
 *             if (totalExercises === 0) return 0;
 *             return (completedExercises.size / totalExercises) * 100;
 *           }, [completedExercises]);
 *
 *           const resetProgress = useCallback(() => {
 *             setCompletedExercises(new Set());
 *             setError(null);
 *           }, []);
 *
 *           // Check for lesson completion
 *           useEffect(() => {
 *             // This would need total exercise count to be passed in
 *             // onLessonComplete?.();
 *           }, [completedExercises, onLessonComplete]);
 *
 *           return {
 *             completedExercises,
 *             loading,
 *             error,
 *             markComplete,
 *             markMultipleComplete,
 *             isExerciseCompleted,
 *             getProgressPercentage,
 *             resetProgress
 *           };
 *         }
 *         ```
 *
 * tags:
 *   - name: Exercise Progress
 *     description: Operations related to tracking and updating exercise completion progress
 */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { lessonId, exerciseIds } = await req.json();

    if (!lessonId || !exerciseIds?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🔍 Fetch languageId from lessonId
    const lesson = await Lesson.findById(lessonId).select("languageId");
    if (!lesson || !lesson.languageId) {
      return NextResponse.json(
        { error: "Lesson or language not found" },
        { status: 404 }
      );
    }

    const languageId = lesson.languageId.toString();

    // ✅ Now mark the exercises completed
    const result = await UserProgress.markExerciseCompleted(
      userId,
      languageId,
      lessonId,
      exerciseIds
    );

    if (!result) {
      return NextResponse.json(
        { error: "User progress not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Exercises marked as completed" });
  } catch (err) {
    console.error("Exercise complete error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
