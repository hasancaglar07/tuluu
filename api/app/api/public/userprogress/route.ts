import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { UserProgressSchema } from "@/lib/validations/userprogress";
import UserProgress from "@/models/UserProgress";

/**
 * @swagger
 * /api/public/userprogress:
 *   post:
 *     summary: Start learning a new language
 *     description: |
 *       Creates a new user progress record to start learning a specific language.
 *       This endpoint initializes the user's learning journey for a language,
 *       setting up the initial progress state and determining the starting point.
 *       This is a public endpoint that doesn't require authentication.
 *     tags:
 *       - Public User Progress
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StartLearningRequest'
 *           examples:
 *             startSpanish:
 *               summary: Start learning Spanish
 *               value:
 *                 userId: "user_123abc"
 *                 languageId: "507f1f77bcf86cd799439011"
 *             startFrench:
 *               summary: Start learning French
 *               value:
 *                 userId: "user_456def"
 *                 languageId: "507f1f77bcf86cd799439012"
 *             startGerman:
 *               summary: Start learning German
 *               value:
 *                 userId: "user_789ghi"
 *                 languageId: "507f1f77bcf86cd799439013"
 *     responses:
 *       '201':
 *         description: Successfully created user progress and started learning
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StartLearningResponse'
 *             examples:
 *               successExample:
 *                 summary: Successfully started learning
 *                 value:
 *                   status: true
 *                   progress:
 *                     _id: "507f1f77bcf86cd799439020"
 *                     userId: "user_123abc"
 *                     languageId: "507f1f77bcf86cd799439011"
 *                     currentChapterId: "507f1f77bcf86cd799439021"
 *                     currentUnitId: "507f1f77bcf86cd799439031"
 *                     currentLessonId: "507f1f77bcf86cd799439041"
 *                     completedLessons: []
 *                     completedUnits: []
 *                     completedChapters: []
 *                     totalXp: 0
 *                     totalGems: 0
 *                     totalGel: 0
 *                     totalHeart: 5
 *                     totalStreak: 0
 *                     isCompleted: false
 *                     createdAt: "2024-01-15T10:30:00Z"
 *                     updatedAt: "2024-01-15T10:30:00Z"
 *       '500':
 *         description: Validation error or server failure
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
 *                   message: "validation error"
 *                   errors:
 *                     userId: ["Required"]
 *                     languageId: ["Invalid ObjectId format"]
 *               serverError:
 *                 summary: Server error during processing
 *                 value:
 *                   error: "Failed to create progress"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     StartLearningRequest:
 *       type: object
 *       required:
 *         - userId
 *         - languageId
 *       properties:
 *         userId:
 *           type: string
 *           description: The unique identifier of the user starting to learn
 *           example: "user_123abc"
 *         languageId:
 *           type: string
 *           format: objectId
 *           description: The unique identifier of the language to start learning
 *           example: "507f1f77bcf86cd799439011"
 *
 *     UserProgressRecord:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the progress record
 *           example: "507f1f77bcf86cd799439020"
 *         userId:
 *           type: string
 *           description: User identifier
 *           example: "user_123abc"
 *         languageId:
 *           type: string
 *           format: objectId
 *           description: Language identifier
 *           example: "507f1f77bcf86cd799439011"
 *         currentChapterId:
 *           type: string
 *           format: objectId
 *           description: Current chapter the user is working on
 *           example: "507f1f77bcf86cd799439021"
 *         currentUnitId:
 *           type: string
 *           format: objectId
 *           description: Current unit the user is working on
 *           example: "507f1f77bcf86cd799439031"
 *         currentLessonId:
 *           type: string
 *           format: objectId
 *           description: Current lesson the user is working on
 *           example: "507f1f77bcf86cd799439041"
 *         completedLessons:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               lessonId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of completed lesson
 *                 example: "507f1f77bcf86cd799439042"
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the lesson was completed
 *                 example: "2024-01-14T15:45:00Z"
 *           description: List of completed lessons
 *         completedUnits:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               unitId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of completed unit
 *                 example: "507f1f77bcf86cd799439032"
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the unit was completed
 *                 example: "2024-01-13T12:30:00Z"
 *           description: List of completed units
 *         completedChapters:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               chapterId:
 *                 type: string
 *                 format: objectId
 *                 description: ID of completed chapter
 *                 example: "507f1f77bcf86cd799439022"
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *                 description: When the chapter was completed
 *                 example: "2024-01-12T09:15:00Z"
 *           description: List of completed chapters
 *         totalXp:
 *           type: integer
 *           minimum: 0
 *           description: Total experience points earned
 *           example: 0
 *         totalGems:
 *           type: integer
 *           minimum: 0
 *           description: Total gems earned
 *           example: 0
 *         totalGel:
 *           type: integer
 *           minimum: 0
 *           description: Total gel earned
 *           example: 0
 *         totalHeart:
 *           type: integer
 *           minimum: 0
 *           description: Current heart count
 *           example: 5
 *         totalStreak:
 *           type: integer
 *           minimum: 0
 *           description: Current learning streak in days
 *           example: 0
 *         isCompleted:
 *           type: boolean
 *           description: Whether the language course is completed
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the progress record was created
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the progress record was last updated
 *           example: "2024-01-15T10:30:00Z"
 *
 *     StartLearningResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         progress:
 *           $ref: '#/components/schemas/UserProgressRecord'
 *           description: The created user progress record
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: General validation error message
 *           example: "validation error"
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *           description: Field-specific validation errors
 *           example:
 *             userId: ["Required"]
 *             languageId: ["Invalid ObjectId format"]
 *
 *     ServerErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Server error message
 *           example: "Failed to create progress"
 *
 *   examples:
 *     PublicUserProgressUsageExample:
 *       summary: How to use the Public User Progress API with Axios
 *       description: |
 *         **Step 1: Start Learning a Language with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const startLearningLanguage = async (userId, languageId) => {
 *           try {
 *             const response = await axios.post('/api/public/userprogress', {
 *               userId,
 *               languageId
 *             }, {
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             if (response.status === 201) {
 *               console.log('Successfully started learning!');
 *               return {
 *                 success: true,
 *                 data: response.data
 *               };
 *             }
 *           } catch (error) {
 *             console.error('Failed to start learning:', error);
 *             return {
 *               success: false,
 *               error: error.response?.data || error.message
 *             };
 *           }
 *         };
 *
 *         // Usage
 *         const result = await startLearningLanguage('user_123abc', '507f1f77bcf86cd799439011');
 *         if (result.success) {
 *           console.log('Progress created:', result.data.progress);
 *         }
 *         ```
 *
 *         **Step 2: Handle Different Response Scenarios**
 *         ```javascript
 *         const handleStartLearning = async (userData) => {
 *           try {
 *             const response = await axios.post('/api/public/userprogress', userData);
 *             const result = response.data;
 *
 *             if (result.status) {
 *               // Successfully started learning
 *               const progress = result.progress;
 *
 *               // Update UI with initial progress
 *               updateProgressUI({
 *                 languageId: progress.languageId,
 *                 currentChapter: progress.currentChapterId,
 *                 currentUnit: progress.currentUnitId,
 *                 currentLesson: progress.currentLessonId,
 *                 totalXp: progress.totalXp,
 *                 totalGems: progress.totalGems,
 *                 hearts: progress.totalHeart,
 *                 streak: progress.totalStreak
 *               });
 *
 *               // Navigate to first lesson
 *               navigateToLesson(progress.currentLessonId);
 *
 *               return progress;
 *             }
 *           } catch (error) {
 *             if (axios.isAxiosError(error)) {
 *               const status = error.response?.status;
 *               const errorData = error.response?.data;
 *
 *               if (status === 500) {
 *                 if (errorData.errors) {
 *                   // Handle validation errors
 *                   handleValidationErrors(errorData.errors);
 *                 } else {
 *                   // Handle server errors
 *                   showError('Server error occurred while starting learning');
 *                 }
 *               } else {
 *                 showError('An unexpected error occurred');
 *               }
 *             }
 *             throw error;
 *           }
 *         };
 *
 *         const handleValidationErrors = (errors) => {
 *           Object.entries(errors).forEach(([field, messages]) => {
 *             console.error(`${field}: ${messages.join(', ')}`);
 *             showFieldError(field, messages[0]);
 *           });
 *         };
 *         ```
 *
 *         **Step 3: Create a Service Class for User Progress**
 *         ```javascript
 *         class UserProgressService {
 *           constructor() {
 *             this.client = axios.create({
 *               baseURL: '/api/public',
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             this.setupInterceptors();
 *           }
 *
 *           setupInterceptors() {
 *             // Request interceptor
 *             this.client.interceptors.request.use(
 *               (config) => {
 *                 // Add any common headers or processing
 *                 console.log(`Making request to ${config.url}`);
 *                 return config;
 *               },
 *               (error) => Promise.reject(error)
 *             );
 *
 *             // Response interceptor
 *             this.client.interceptors.response.use(
 *               (response) => response,
 *               (error) => {
 *                 this.logError(error);
 *                 return Promise.reject(error);
 *               }
 *             );
 *           }
 *
 *           logError(error) {
 *             if (axios.isAxiosError(error)) {
 *               console.error('API Error:', {
 *                 status: error.response?.status,
 *                 data: error.response?.data,
 *                 url: error.config?.url
 *               });
 *             }
 *           }
 *
 *           async startLearning(userId, languageId) {
 *             const response = await this.client.post('/userprogress', {
 *               userId,
 *               languageId
 *             });
 *             return response.data;
 *           }
 *
 *           async validateUserData(userId, languageId) {
 *             const errors = [];
 *
 *             if (!userId || typeof userId !== 'string') {
 *               errors.push('Valid user ID is required');
 *             }
 *
 *             if (!languageId || !/^[0-9a-fA-F]{24}$/.test(languageId)) {
 *               errors.push('Valid language ID is required');
 *             }
 *
 *             return errors;
 *           }
 *
 *           async startLearningWithValidation(userId, languageId) {
 *             // Client-side validation
 *             const validationErrors = await this.validateUserData(userId, languageId);
 *             if (validationErrors.length > 0) {
 *               throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
 *             }
 *
 *             try {
 *               const result = await this.startLearning(userId, languageId);
 *
 *               if (result.status) {
 *                 // Log successful start
 *                 console.log(`User ${userId} started learning language ${languageId}`);
 *
 *                 // Store progress locally for quick access
 *                 this.cacheProgress(result.progress);
 *
 *                 return result.progress;
 *               } else {
 *                 throw new Error('Failed to start learning - invalid response');
 *               }
 *             } catch (error) {
 *               // Enhanced error handling
 *               if (axios.isAxiosError(error)) {
 *                 const errorData = error.response?.data;
 *                 if (errorData?.errors) {
 *                   const serverErrors = Object.entries(errorData.errors)
 *                     .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
 *                     .join('; ');
 *                   throw new Error(`Server validation failed: ${serverErrors}`);
 *                 }
 *               }
 *               throw error;
 *             }
 *           }
 *
 *           cacheProgress(progress) {
 *             try {
 *               localStorage.setItem(`progress_${progress.userId}_${progress.languageId}`,
 *                 JSON.stringify(progress));
 *             } catch (error) {
 *               console.warn('Failed to cache progress:', error);
 *             }
 *           }
 *
 *           getCachedProgress(userId, languageId) {
 *             try {
 *               const cached = localStorage.getItem(`progress_${userId}_${languageId}`);
 *               return cached ? JSON.parse(cached) : null;
 *             } catch (error) {
 *               console.warn('Failed to retrieve cached progress:', error);
 *               return null;
 *             }
 *           }
 *         }
 *
 *         export const userProgressService = new UserProgressService();
 *         ```
 *
 *     ReactStartLearningExample:
 *       summary: React component for starting language learning
 *       description: |
 *         ```typescript
 *         import React, { useState } from 'react';
 *         import axios from 'axios';
 *
 *         interface Language {
 *           _id: string;
 *           name: string;
 *           flag: string;
 *           imageUrl: string;
 *         }
 *
 *         interface StartLearningProps {
 *           userId: string;
 *           availableLanguages: Language[];
 *           onLearningStarted: (progress: any) => void;
 *           onError: (error: string) => void;
 *         }
 *
 *         export function StartLearningComponent({
 *           userId,
 *           availableLanguages,
 *           onLearningStarted,
 *           onError
 *         }: StartLearningProps) {
 *           const [selectedLanguage, setSelectedLanguage] = useState<string>('');
 *           const [starting, setStarting] = useState(false);
 *           const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
 *
 *           const startLearning = async (languageId: string) => {
 *             setStarting(true);
 *             setValidationErrors({});
 *
 *             try {
 *               const response = await axios.post('/api/public/userprogress', {
 *                 userId,
 *                 languageId
 *               });
 *
 *               if (response.status === 201 && response.data.status) {
 *                 onLearningStarted(response.data.progress);
 *               } else {
 *                 onError('Failed to start learning - invalid response');
 *               }
 *             } catch (error) {
 *               if (axios.isAxiosError(error)) {
 *                 const errorData = error.response?.data;
 *
 *                 if (error.response?.status === 500) {
 *                   if (errorData?.errors) {
 *                     setValidationErrors(errorData.errors);
 *                     onError('Please fix the validation errors');
 *                   } else {
 *                     onError(errorData?.error || 'Server error occurred');
 *                   }
 *                 } else {
 *                   onError('An unexpected error occurred');
 *                 }
 *               } else {
 *                 onError('Network error occurred');
 *               }
 *             } finally {
 *               setStarting(false);
 *             }
 *           };
 *
 *           const handleLanguageSelect = (languageId: string) => {
 *             setSelectedLanguage(languageId);
 *           };
 *
 *           const handleStartLearning = () => {
 *             if (!selectedLanguage) {
 *               onError('Please select a language to start learning');
 *               return;
 *             }
 *             startLearning(selectedLanguage);
 *           };
 *
 *           return (
 *             <div className="start-learning-component">
 *               <h2>Start Learning a New Language</h2>
 *
 *               <div className="language-selection">
 *                 <h3>Choose your language:</h3>
 *                 <div className="languages-grid">
 *                   {availableLanguages.map((language) => (
 *                     <div
 *                       key={language._id}
 *                       className={`language-option ${selectedLanguage === language._id ? 'selected' : ''}`}
 *                       onClick={() => handleLanguageSelect(language._id)}
 *                     >
 *                       <div className="language-flag">{language.flag}</div>
 *                       <img
 *                         src={language.imageUrl || "/placeholder.svg"}
 *                         alt={`${language.name} flag`}
 *                         className="language-image"
 *                       />
 *                       <h4>{language.name}</h4>
 *                     </div>
 *                   ))}
 *                 </div>
 *
 *                 {validationErrors.languageId && (
 *                   <div className="validation-error">
 *                     {validationErrors.languageId.join(', ')}
 *                   </div>
 *                 )}
 *               </div>
 *
 *               {validationErrors.userId && (
 *                 <div className="validation-error">
 *                   User ID error: {validationErrors.userId.join(', ')}
 *                 </div>
 *               )}
 *
 *               <div className="start-learning-actions">
 *                 <button
 *                   onClick={handleStartLearning}
 *                   disabled={starting || !selectedLanguage}
 *                   className="start-learning-button"
 *                 >
 *                   {starting ? 'Starting...' : 'Start Learning'}
 *                 </button>
 *               </div>
 *
 *               {starting && (
 *                 <div className="loading-indicator">
 *                   <p>Setting up your learning journey...</p>
 *                   <div className="progress-spinner"></div>
 *                 </div>
 *               )}
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Public User Progress
 *     description: Public operations for managing user learning progress
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validated = UserProgressSchema.safeParse(body);
    if (!validated.success) {
      return Response.json(
        {
          message: "validation error",
          errors: validated.error.flatten().fieldErrors,
        },
        { status: 500 }
      );
    }

    await connectDB();

    // Determine next order

    const progress = await UserProgress.startLearningLanguage(
      validated.data.userId,
      validated.data.languageId
    );

    return NextResponse.json({ status: true, progress }, { status: 201 });
  } catch (error) {
    console.error("Error creating progress:", error);
    return NextResponse.json(
      { error: "Failed to create progress" },
      { status: 500 }
    );
  }
}
