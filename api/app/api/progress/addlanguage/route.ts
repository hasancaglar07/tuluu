import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import { UserProgressSchema } from "@/lib/validations/userprogress";
import UserProgress from "@/models/UserProgress";
import { auth } from "@clerk/nextjs/server";

/**
 * @swagger
 * /api/start-learning:
 *   post:
 *     summary: Start learning a new language
 *     description: |
 *       Initializes user progress for a specific language. Creates a new learning session
 *       and sets up the initial progress tracking for the user. Validates the request data
 *       and establishes the foundation for language learning progress.
 *     tags:
 *       - Learning Progress
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
 *         description: Successfully started learning language
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StartLearningResponse'
 *             examples:
 *               successExample:
 *                 summary: Language learning started successfully
 *                 value:
 *                   status: true
 *                   progress:
 *                     _id: "507f1f77bcf86cd799439020"
 *                     userId: "user_123abc"
 *                     languageId: "507f1f77bcf86cd799439011"
 *                     currentChapter:
 *                       chapterId: "507f1f77bcf86cd799439014"
 *                       progress: 0
 *                       lastAccessed: "2024-01-15T10:30:00Z"
 *                     currentUnit:
 *                       unitId: "507f1f77bcf86cd799439015"
 *                       progress: 0
 *                       lastAccessed: "2024-01-15T10:30:00Z"
 *                     currentLesson:
 *                       lessonId: "507f1f77bcf86cd799439016"
 *                       progress: 0
 *                       lastAccessed: "2024-01-15T10:30:00Z"
 *                     completedLessons: []
 *                     completedUnits: []
 *                     completedChapters: []
 *                     completedExercises: []
 *                     totalXp: 0
 *                     totalGems: 0
 *                     totalGel: 0
 *                     streak: 0
 *                     isCompleted: false
 *                     createdAt: "2024-01-15T10:30:00Z"
 *                     updatedAt: "2024-01-15T10:30:00Z"
 *       '500':
 *         description: Internal server error - Validation error or failed to create progress
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Request validation failed
 *                 value:
 *                   message: "validation error"
 *                   errors:
 *                     userId: ["Required"]
 *                     languageId: ["Invalid ObjectId format"]
 *               serverError:
 *                 summary: Server error during progress creation
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
 *     ProgressChapter:
 *       type: object
 *       properties:
 *         chapterId:
 *           type: string
 *           format: objectId
 *           description: Current chapter ID
 *           example: "507f1f77bcf86cd799439014"
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Progress percentage in the current chapter
 *           example: 0
 *         lastAccessed:
 *           type: string
 *           format: date-time
 *           description: Last time this chapter was accessed
 *           example: "2024-01-15T10:30:00Z"
 *
 *     ProgressUnit:
 *       type: object
 *       properties:
 *         unitId:
 *           type: string
 *           format: objectId
 *           description: Current unit ID
 *           example: "507f1f77bcf86cd799439015"
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Progress percentage in the current unit
 *           example: 0
 *         lastAccessed:
 *           type: string
 *           format: date-time
 *           description: Last time this unit was accessed
 *           example: "2024-01-15T10:30:00Z"
 *
 *     ProgressLesson:
 *       type: object
 *       properties:
 *         lessonId:
 *           type: string
 *           format: objectId
 *           description: Current lesson ID
 *           example: "507f1f77bcf86cd799439016"
 *         progress:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Progress percentage in the current lesson
 *           example: 0
 *         lastAccessed:
 *           type: string
 *           format: date-time
 *           description: Last time this lesson was accessed
 *           example: "2024-01-15T10:30:00Z"
 *
 *     CompletedItem:
 *       type: object
 *       properties:
 *         itemId:
 *           type: string
 *           format: objectId
 *           description: ID of the completed item (lesson, unit, or chapter)
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the item was completed
 *         xpEarned:
 *           type: integer
 *           minimum: 0
 *           description: XP points earned for completion
 *
 *     UserProgressData:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique progress record identifier
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
 *         currentChapter:
 *           $ref: '#/components/schemas/ProgressChapter'
 *           description: Current chapter progress
 *         currentUnit:
 *           $ref: '#/components/schemas/ProgressUnit'
 *           description: Current unit progress
 *         currentLesson:
 *           $ref: '#/components/schemas/ProgressLesson'
 *           description: Current lesson progress
 *         completedLessons:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CompletedItem'
 *           description: List of completed lessons
 *         completedUnits:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CompletedItem'
 *           description: List of completed units
 *         completedChapters:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CompletedItem'
 *           description: List of completed chapters
 *         completedExercises:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: List of completed exercise IDs
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
 *         streak:
 *           type: integer
 *           minimum: 0
 *           description: Current learning streak in days
 *           example: 0
 *         isCompleted:
 *           type: boolean
 *           description: Whether the entire language course is completed
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the progress was created
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the progress was last updated
 *           example: "2024-01-15T10:30:00Z"
 *
 *     StartLearningResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           description: Indicates if the language learning was started successfully
 *           example: true
 *         progress:
 *           $ref: '#/components/schemas/UserProgressData'
 *           description: The created user progress data
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
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Failed to create progress"
 *
 *   examples:
 *     StartLearningUsageExample:
 *       summary: How to use the Start Learning API
 *       description: |
 *         **Step 1: Start Learning with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const startLearningLanguage = async (userId, languageId) => {
 *           try {
 *             const response = await axios.post('/api/start-learning', {
 *               userId,
 *               languageId
 *             }, {
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             if (response.data.status) {
 *               console.log('Language learning started successfully!');
 *               console.log('Progress data:', response.data.progress);
 *               return response.data.progress;
 *             } else {
 *               throw new Error('Failed to start learning');
 *             }
 *           } catch (error) {
 *             if (error.response) {
 *               // Server responded with error status
 *               console.error('Server error:', error.response.data);
 *               if (error.response.data.errors) {
 *                 console.error('Validation errors:', error.response.data.errors);
 *               }
 *             } else if (error.request) {
 *               // Request was made but no response received
 *               console.error('Network error:', error.request);
 *             } else {
 *               // Something else happened
 *               console.error('Error:', error.message);
 *             }
 *             throw error;
 *           }
 *         };
 *         ```
 *
 *         **Step 2: Handle Different Response Scenarios**
 *         ```javascript
 *         const handleStartLearning = async (userId, languageId) => {
 *           try {
 *             const progressData = await startLearningLanguage(userId, languageId);
 *
 *             // Success - redirect to first lesson
 *             const firstLessonId = progressData.currentLesson.lessonId;
 *             window.location.href = `/lesson/${firstLessonId}`;
 *
 *           } catch (error) {
 *             if (error.response?.status === 500) {
 *               if (error.response.data.errors) {
 *                 // Handle validation errors
 *                 const errors = error.response.data.errors;
 *                 if (errors.userId) {
 *                   alert('Invalid user ID');
 *                 }
 *                 if (errors.languageId) {
 *                   alert('Invalid language selection');
 *                 }
 *               } else {
 *                 // Handle server error
 *                 alert('Server error: ' + error.response.data.error);
 *               }
 *             } else {
 *               alert('Failed to start learning. Please try again.');
 *             }
 *           }
 *         };
 *         ```
 *
 *         **Step 3: Create Axios Instance with Interceptors**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         // Create axios instance with base configuration
 *         const apiClient = axios.create({
 *           baseURL: '/api',
 *           timeout: 10000,
 *           headers: {
 *             'Content-Type': 'application/json'
 *           }
 *         });
 *
 *         // Add request interceptor for authentication
 *         apiClient.interceptors.request.use(
 *           (config) => {
 *             const token = localStorage.getItem('authToken');
 *             if (token) {
 *               config.headers.Authorization = `Bearer ${token}`;
 *             }
 *             return config;
 *           },
 *           (error) => Promise.reject(error)
 *         );
 *
 *         // Add response interceptor for error handling
 *         apiClient.interceptors.response.use(
 *           (response) => response,
 *           (error) => {
 *             if (error.response?.status === 401) {
 *               // Handle unauthorized - redirect to login
 *               window.location.href = '/login';
 *             }
 *             return Promise.reject(error);
 *           }
 *         );
 *
 *         // Use the configured client
 *         const startLearning = async (userId, languageId) => {
 *           const response = await apiClient.post('/start-learning', {
 *             userId,
 *             languageId
 *           });
 *           return response.data;
 *         };
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
 *           nativeName: string;
 *         }
 *
 *         interface StartLearningProps {
 *           userId: string;
 *           availableLanguages: Language[];
 *           onLearningStarted: (progressData: any) => void;
 *         }
 *
 *         export function StartLearningComponent({
 *           userId,
 *           availableLanguages,
 *           onLearningStarted
 *         }: StartLearningProps) {
 *           const [selectedLanguage, setSelectedLanguage] = useState<string>('');
 *           const [loading, setLoading] = useState(false);
 *           const [error, setError] = useState<string | null>(null);
 *           const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
 *
 *           const handleStartLearning = async () => {
 *             if (!selectedLanguage) {
 *               setError('Please select a language to learn');
 *               return;
 *             }
 *
 *             setLoading(true);
 *             setError(null);
 *             setValidationErrors({});
 *
 *             try {
 *               const response = await axios.post('/api/start-learning', {
 *                 userId,
 *                 languageId: selectedLanguage
 *               });
 *
 *               if (response.data.status) {
 *                 console.log('Learning started successfully!');
 *                 onLearningStarted(response.data.progress);
 *               } else {
 *                 setError('Failed to start learning');
 *               }
 *             } catch (err) {
 *               if (axios.isAxiosError(err)) {
 *                 if (err.response?.status === 500) {
 *                   const errorData = err.response.data;
 *                   if (errorData.errors) {
 *                     // Handle validation errors
 *                     setValidationErrors(errorData.errors);
 *                     setError('Please fix the validation errors');
 *                   } else {
 *                     setError(errorData.error || 'Server error occurred');
 *                   }
 *                 } else {
 *                   setError('Network error. Please try again.');
 *                 }
 *               } else {
 *                 setError('An unexpected error occurred');
 *               }
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           return (
 *             <div className="start-learning-container">
 *               <h2>Start Learning a New Language</h2>
 *
 *               <div className="language-selection">
 *                 <label htmlFor="language-select">Choose a language:</label>
 *                 <select
 *                   id="language-select"
 *                   value={selectedLanguage}
 *                   onChange={(e) => setSelectedLanguage(e.target.value)}
 *                   disabled={loading}
 *                 >
 *                   <option value="">Select a language...</option>
 *                   {availableLanguages.map(language => (
 *                     <option key={language._id} value={language._id}>
 *                       {language.flag} {language.name} ({language.nativeName})
 *                     </option>
 *                   ))}
 *                 </select>
 *                 {validationErrors.languageId && (
 *                   <div className="validation-error">
 *                     {validationErrors.languageId.join(', ')}
 *                   </div>
 *                 )}
 *               </div>
 *
 *               {error && (
 *                 <div className="error-message">
 *                   {error}
 *                 </div>
 *               )}
 *
 *               {Object.keys(validationErrors).length > 0 && (
 *                 <div className="validation-errors">
 *                   <h4>Validation Errors:</h4>
 *                   {Object.entries(validationErrors).map(([field, errors]) => (
 *                     <div key={field}>
 *                       <strong>{field}:</strong> {errors.join(', ')}
 *                     </div>
 *                   ))}
 *                 </div>
 *               )}
 *
 *               <button
 *                 onClick={handleStartLearning}
 *                 disabled={loading || !selectedLanguage}
 *                 className="start-learning-button"
 *               >
 *                 {loading ? 'Starting...' : 'Start Learning'}
 *               </button>
 *             </div>
 *           );
 *         }
 *         ```
 *
 *     AxiosServiceExample:
 *       summary: Dedicated service class for learning API calls
 *       description: |
 *         ```typescript
 *         import axios, { AxiosInstance, AxiosResponse } from 'axios';
 *
 *         interface StartLearningRequest {
 *           userId: string;
 *           languageId: string;
 *         }
 *
 *         interface StartLearningResponse {
 *           status: boolean;
 *           progress: any;
 *         }
 *
 *         interface ValidationError {
 *           message: string;
 *           errors: Record<string, string[]>;
 *         }
 *
 *         class LearningApiService {
 *           private client: AxiosInstance;
 *
 *           constructor(baseURL: string = '/api') {
 *             this.client = axios.create({
 *               baseURL,
 *               timeout: 15000,
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             this.setupInterceptors();
 *           }
 *
 *           private setupInterceptors() {
 *             // Request interceptor
 *             this.client.interceptors.request.use(
 *               (config) => {
 *                 const token = this.getAuthToken();
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
 *                 this.handleResponseError(error);
 *                 return Promise.reject(error);
 *               }
 *             );
 *           }
 *
 *           private getAuthToken(): string | null {
 *             return localStorage.getItem('authToken');
 *           }
 *
 *           private handleResponseError(error: any) {
 *             if (error.response?.status === 401) {
 *               // Handle unauthorized
 *               this.handleUnauthorized();
 *             } else if (error.response?.status >= 500) {
 *               // Handle server errors
 *               console.error('Server error:', error.response.data);
 *             }
 *           }
 *
 *           private handleUnauthorized() {
 *             localStorage.removeItem('authToken');
 *             window.location.href = '/login';
 *           }
 *
 *           async startLearning(request: StartLearningRequest): Promise<StartLearningResponse> {
 *             try {
 *               const response: AxiosResponse<StartLearningResponse> = await this.client.post(
 *                 '/start-learning',
 *                 request
 *               );
 *               return response.data;
 *             } catch (error) {
 *               if (axios.isAxiosError(error)) {
 *                 if (error.response?.status === 500) {
 *                   const errorData = error.response.data;
 *                   if (errorData.errors) {
 *                     throw new ValidationError(errorData.message, errorData.errors);
 *                   } else {
 *                     throw new Error(errorData.error || 'Failed to start learning');
 *                   }
 *                 }
 *               }
 *               throw error;
 *             }
 *           }
 *
 *           // Additional methods for other learning-related API calls
 *           async getLanguages() {
 *             const response = await this.client.get('/languages');
 *             return response.data;
 *           }
 *
 *           async getUserProgress(userId: string, languageId: string) {
 *             const response = await this.client.get(`/user-progress/${userId}/${languageId}`);
 *             return response.data;
 *           }
 *         }
 *
 *         // Custom error class for validation errors
 *         class ValidationError extends Error {
 *           constructor(
 *             message: string,
 *             public errors: Record<string, string[]>
 *           ) {
 *             super(message);
 *             this.name = 'ValidationError';
 *           }
 *         }
 *
 *         // Export singleton instance
 *         export const learningApi = new LearningApiService();
 *
 *         // Usage example
 *         export const useStartLearning = () => {
 *           const startLearning = async (userId: string, languageId: string) => {
 *             try {
 *               const result = await learningApi.startLearning({ userId, languageId });
 *               return { success: true, data: result };
 *             } catch (error) {
 *               if (error instanceof ValidationError) {
 *                 return {
 *                   success: false,
 *                   error: error.message,
 *                   validationErrors: error.errors
 *                 };
 *               }
 *               return {
 *                 success: false,
 *                 error: error instanceof Error ? error.message : 'Unknown error'
 *               };
 *             }
 *           };
 *
 *           return { startLearning };
 *         };
 *         ```
 *
 * tags:
 *   - name: Learning Progress
 *     description: Operations related to starting and managing language learning progress
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
