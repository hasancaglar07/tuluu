import connectDB from "@/lib/db/connect";
import Lesson from "@/models/Lesson";
import Unit from "@/models/Unit";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/units/{id}:
 *   get:
 *     summary: Get unit details with lesson test and navigation data
 *     description: |
 *       Retrieves comprehensive unit information including the unit's test lesson,
 *       unit metadata, last completed unit context, and the next available lesson.
 *       This endpoint is used for unit progression and test preparation in the
 *       learning flow. Requires user authentication.
 *     tags:
 *       - Units
 *       - Lessons
 *       - Learning Progress
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Unique identifier of the unit
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: lastUnit
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID of the last completed unit for context
 *         example: "507f1f77bcf86cd799439010"
 *     responses:
 *       '200':
 *         description: Successfully retrieved unit details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnitDetailsResponse'
 *             examples:
 *               unitWithTest:
 *                 summary: Unit with test lesson and navigation data
 *                 value:
 *                   lessonTest:
 *                     _id: "507f1f77bcf86cd799439021"
 *                     title: "Spanish Basics - Unit Test"
 *                     description: "Test your knowledge of basic Spanish vocabulary and grammar"
 *                     unitId: "507f1f77bcf86cd799439011"
 *                     order: 999
 *                     isTest: true
 *                     difficulty: "beginner"
 *                     estimatedTime: 15
 *                     questions:
 *                       - type: "multiple_choice"
 *                         question: "What does 'Hola' mean in English?"
 *                         options: ["Hello", "Goodbye", "Thank you", "Please"]
 *                         correctAnswer: 0
 *                         points: 10
 *                       - type: "translation"
 *                         question: "Translate: 'Good morning'"
 *                         correctAnswer: "Buenos días"
 *                         points: 15
 *                     totalPoints: 100
 *                     passingScore: 70
 *                     attempts: 3
 *                     timeLimit: 900
 *                     status: "active"
 *                     createdAt: "2024-01-15T10:00:00Z"
 *                     updatedAt: "2024-01-20T14:30:00Z"
 *                   unit:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     title: "Spanish Basics"
 *                     description: "Learn fundamental Spanish vocabulary and basic grammar structures"
 *                     courseId: "507f1f77bcf86cd799439001"
 *                     order: 1
 *                     level: "beginner"
 *                     estimatedDuration: 120
 *                     totalLessons: 8
 *                     completedLessons: 0
 *                     isLocked: false
 *                     prerequisites: []
 *                     learningObjectives:
 *                       - "Master basic Spanish greetings"
 *                       - "Learn common vocabulary for daily situations"
 *                       - "Understand basic sentence structure"
 *                     topics:
 *                       - "Greetings and introductions"
 *                       - "Numbers 1-20"
 *                       - "Basic verbs"
 *                       - "Family vocabulary"
 *                     status: "active"
 *                     createdAt: "2024-01-15T09:00:00Z"
 *                     updatedAt: "2024-01-15T09:00:00Z"
 *                   lastUnit:
 *                     _id: "507f1f77bcf86cd799439010"
 *                     title: "Introduction to Spanish"
 *                     description: "Welcome to Spanish learning journey"
 *                     order: 0
 *                     level: "beginner"
 *                     totalLessons: 3
 *                     completedLessons: 3
 *                     isCompleted: true
 *                     completedAt: "2024-01-14T16:45:00Z"
 *                   nextLesson:
 *                     _id: "507f1f77bcf86cd799439031"
 *                     title: "Basic Greetings"
 *                     description: "Learn how to greet people in Spanish"
 *                     unitId: "507f1f77bcf86cd799439011"
 *                     order: 1
 *                     isTest: false
 *                     difficulty: "beginner"
 *                     estimatedTime: 10
 *                     type: "vocabulary"
 *                     status: "available"
 *                     isLocked: false
 *               unitTestOnly:
 *                 summary: Unit test without additional context
 *                 value:
 *                   lessonTest:
 *                     _id: "507f1f77bcf86cd799439022"
 *                     title: "Advanced Grammar - Unit Test"
 *                     unitId: "507f1f77bcf86cd799439012"
 *                     isTest: true
 *                     totalPoints: 150
 *                     passingScore: 80
 *                   unit:
 *                     _id: "507f1f77bcf86cd799439012"
 *                     title: "Advanced Grammar"
 *                     order: 5
 *                     level: "intermediate"
 *                     totalLessons: 12
 *                   lastUnit: null
 *                   nextLesson:
 *                     _id: "507f1f77bcf86cd799439041"
 *                     title: "Subjunctive Mood Introduction"
 *                     order: 1
 *                     isTest: false
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
 *         description: Unit test not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               testNotFound:
 *                 value:
 *                   error: "lessonTest not found in database"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   error: "Internal server error"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TestQuestion:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [multiple_choice, translation, fill_blank, matching, audio, speaking]
 *           description: Type of question
 *           example: "multiple_choice"
 *         question:
 *           type: string
 *           description: The question text or prompt
 *           example: "What does 'Hola' mean in English?"
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Available answer options (for multiple choice)
 *           example: ["Hello", "Goodbye", "Thank you", "Please"]
 *         correctAnswer:
 *           oneOf:
 *             - type: integer
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *           description: Correct answer (index for multiple choice, text for others)
 *           example: 0
 *         points:
 *           type: integer
 *           minimum: 1
 *           description: Points awarded for correct answer
 *           example: 10
 *         explanation:
 *           type: string
 *           description: Explanation for the correct answer
 *           example: "Hola is the most common way to say hello in Spanish"
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Question difficulty level
 *           example: "easy"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags for categorizing the question
 *           example: ["vocabulary", "greetings"]
 *
 *     LessonTest:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the test lesson
 *           example: "507f1f77bcf86cd799439021"
 *         title:
 *           type: string
 *           description: Title of the test lesson
 *           example: "Spanish Basics - Unit Test"
 *         description:
 *           type: string
 *           description: Description of what the test covers
 *           example: "Test your knowledge of basic Spanish vocabulary and grammar"
 *         unitId:
 *           type: string
 *           format: objectId
 *           description: ID of the unit this test belongs to
 *           example: "507f1f77bcf86cd799439011"
 *         order:
 *           type: integer
 *           description: Order of the test within the unit (usually last)
 *           example: 999
 *         isTest:
 *           type: boolean
 *           description: Indicates this is a test lesson
 *           example: true
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Difficulty level of the test
 *           example: "beginner"
 *         estimatedTime:
 *           type: integer
 *           description: Estimated time to complete in minutes
 *           example: 15
 *         questions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TestQuestion'
 *           description: Array of test questions
 *         totalPoints:
 *           type: integer
 *           description: Total points available in the test
 *           example: 100
 *         passingScore:
 *           type: integer
 *           description: Minimum score required to pass
 *           example: 70
 *         attempts:
 *           type: integer
 *           description: Maximum number of attempts allowed
 *           example: 3
 *         timeLimit:
 *           type: integer
 *           description: Time limit for the test in seconds
 *           example: 900
 *         status:
 *           type: string
 *           enum: [active, inactive, draft]
 *           description: Current status of the test
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the test was created
 *           example: "2024-01-15T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the test was last updated
 *           example: "2024-01-20T14:30:00Z"
 *
 *     Unit:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the unit
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           description: Title of the unit
 *           example: "Spanish Basics"
 *         description:
 *           type: string
 *           description: Detailed description of the unit
 *           example: "Learn fundamental Spanish vocabulary and basic grammar structures"
 *         courseId:
 *           type: string
 *           format: objectId
 *           description: ID of the course this unit belongs to
 *           example: "507f1f77bcf86cd799439001"
 *         order:
 *           type: integer
 *           description: Order of the unit within the course
 *           example: 1
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Difficulty level of the unit
 *           example: "beginner"
 *         estimatedDuration:
 *           type: integer
 *           description: Estimated time to complete unit in minutes
 *           example: 120
 *         totalLessons:
 *           type: integer
 *           description: Total number of lessons in the unit
 *           example: 8
 *         completedLessons:
 *           type: integer
 *           description: Number of lessons completed by the user
 *           example: 0
 *         isLocked:
 *           type: boolean
 *           description: Whether the unit is locked for the user
 *           example: false
 *         prerequisites:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: IDs of units that must be completed first
 *           example: []
 *         learningObjectives:
 *           type: array
 *           items:
 *             type: string
 *           description: Learning objectives for the unit
 *           example: ["Master basic Spanish greetings", "Learn common vocabulary"]
 *         topics:
 *           type: array
 *           items:
 *             type: string
 *           description: Topics covered in the unit
 *           example: ["Greetings and introductions", "Numbers 1-20"]
 *         status:
 *           type: string
 *           enum: [active, inactive, draft]
 *           description: Current status of the unit
 *           example: "active"
 *         isCompleted:
 *           type: boolean
 *           description: Whether the user has completed this unit
 *           example: false
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the unit was completed
 *           example: "2024-01-14T16:45:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the unit was created
 *           example: "2024-01-15T09:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the unit was last updated
 *           example: "2024-01-15T09:00:00Z"
 *
 *     NextLesson:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the lesson
 *           example: "507f1f77bcf86cd799439031"
 *         title:
 *           type: string
 *           description: Title of the lesson
 *           example: "Basic Greetings"
 *         description:
 *           type: string
 *           description: Description of the lesson
 *           example: "Learn how to greet people in Spanish"
 *         unitId:
 *           type: string
 *           format: objectId
 *           description: ID of the unit this lesson belongs to
 *           example: "507f1f77bcf86cd799439011"
 *         order:
 *           type: integer
 *           description: Order of the lesson within the unit
 *           example: 1
 *         isTest:
 *           type: boolean
 *           description: Whether this is a test lesson
 *           example: false
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Difficulty level of the lesson
 *           example: "beginner"
 *         estimatedTime:
 *           type: integer
 *           description: Estimated time to complete in minutes
 *           example: 10
 *         type:
 *           type: string
 *           enum: [vocabulary, grammar, conversation, listening, reading, writing]
 *           description: Type of lesson content
 *           example: "vocabulary"
 *         status:
 *           type: string
 *           enum: [available, locked, completed]
 *           description: Current status for the user
 *           example: "available"
 *         isLocked:
 *           type: boolean
 *           description: Whether the lesson is locked for the user
 *           example: false
 *
 *     UnitDetailsResponse:
 *       type: object
 *       properties:
 *         lessonTest:
 *           $ref: '#/components/schemas/LessonTest'
 *           description: The test lesson for this unit
 *         unit:
 *           $ref: '#/components/schemas/Unit'
 *           description: The unit information
 *         lastUnit:
 *           allOf:
 *             - $ref: '#/components/schemas/Unit'
 *           nullable: true
 *           description: The previously completed unit (if any)
 *         nextLesson:
 *           $ref: '#/components/schemas/NextLesson'
 *           description: The next available lesson in the unit
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
 *     UnitsApiUsageExample:
 *       summary: How to use the Units API with Axios
 *       description: |
 *         **Step 1: Fetch Unit Details with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const fetchUnitDetails = async (unitId, lastUnitId = null) => {
 *           try {
 *             const params = {};
 *             if (lastUnitId) {
 *               params.lastUnit = lastUnitId;
 *             }
 *
 *             const response = await axios.get(`/api/units/${unitId}`, {
 *               params,
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             return response.data;
 *           } catch (error) {
 *             console.error('Failed to fetch unit details:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const unitDetails = await fetchUnitDetails('507f1f77bcf86cd799439011');
 *         const unitWithContext = await fetchUnitDetails('507f1f77bcf86cd799439011', '507f1f77bcf86cd799439010');
 *         ```
 *
 *         **Step 2: Process Unit Data and Display Information**
 *         ```javascript
 *         const displayUnitDetails = async (unitId, lastUnitId = null) => {
 *           try {
 *             const data = await fetchUnitDetails(unitId, lastUnitId);
 *             const { lessonTest, unit, lastUnit, nextLesson } = data;
 *
 *             console.log(`UNIT: ${unit.title}`);
 *             console.log('='.repeat(50));
 *             console.log(`Description: ${unit.description}`);
 *             console.log(`Level: ${unit.level}`);
 *             console.log(`Order: ${unit.order}`);
 *             console.log(`Total Lessons: ${unit.totalLessons}`);
 *             console.log(`Completed: ${unit.completedLessons}/${unit.totalLessons}`);
 *             console.log(`Estimated Duration: ${unit.estimatedDuration} minutes`);
 *             console.log(`Status: ${unit.isLocked ? 'Locked' : 'Available'}`);
 *             console.log('');
 *
 *             // Learning objectives
 *             if (unit.learningObjectives && unit.learningObjectives.length > 0) {
 *               console.log('LEARNING OBJECTIVES:');
 *               unit.learningObjectives.forEach((objective, index) => {
 *                 console.log(`  ${index + 1}. ${objective}`);
 *               });
 *               console.log('');
 *             }
 *
 *             // Topics covered
 *             if (unit.topics && unit.topics.length > 0) {
 *               console.log('TOPICS COVERED:');
 *               unit.topics.forEach((topic, index) => {
 *                 console.log(`  • ${topic}`);
 *               });
 *               console.log('');
 *             }
 *
 *             // Unit test information
 *             if (lessonTest) {
 *               console.log('UNIT TEST:');
 *               console.log(`  Title: ${lessonTest.title}`);
 *               console.log(`  Description: ${lessonTest.description}`);
 *               console.log(`  Questions: ${lessonTest.questions ? lessonTest.questions.length : 'N/A'}`);
 *               console.log(`  Total Points: ${lessonTest.totalPoints}`);
 *               console.log(`  Passing Score: ${lessonTest.passingScore}`);
 *               console.log(`  Time Limit: ${lessonTest.timeLimit ? Math.floor(lessonTest.timeLimit / 60) : 'No'} minutes`);
 *               console.log(`  Max Attempts: ${lessonTest.attempts}`);
 *               console.log(`  Estimated Time: ${lessonTest.estimatedTime} minutes`);
 *               console.log('');
 *             }
 *
 *             // Last unit context
 *             if (lastUnit) {
 *               console.log('PREVIOUS UNIT:');
 *               console.log(`  ${lastUnit.title} (Order: ${lastUnit.order})`);
 *               console.log(`  Completed: ${lastUnit.isCompleted ? 'Yes' : 'No'}`);
 *               if (lastUnit.completedAt) {
 *                 console.log(`  Completed At: ${new Date(lastUnit.completedAt).toLocaleDateString()}`);
 *               }
 *               console.log('');
 *             }
 *
 *             // Next lesson
 *             if (nextLesson) {
 *               console.log('NEXT LESSON:');
 *               console.log(`  Title: ${nextLesson.title}`);
 *               console.log(`  Description: ${nextLesson.description}`);
 *               console.log(`  Type: ${nextLesson.type}`);
 *               console.log(`  Order: ${nextLesson.order}`);
 *               console.log(`  Difficulty: ${nextLesson.difficulty}`);
 *               console.log(`  Estimated Time: ${nextLesson.estimatedTime} minutes`);
 *               console.log(`  Status: ${nextLesson.status}`);
 *               console.log(`  Locked: ${nextLesson.isLocked ? 'Yes' : 'No'}`);
 *             }
 *
 *             return data;
 *           } catch (error) {
 *             if (error.response?.status === 404) {
 *               console.error('Unit test not found');
 *             } else if (error.response?.status === 401) {
 *               console.error('Authentication required');
 *             } else {
 *               console.error('Error fetching unit details:', error);
 *             }
 *           }
 *         };
 *         ```
 *
 *         **Step 3: Create a Unit Service**
 *         ```javascript
 *         class UnitService {
 *           constructor() {
 *             this.client = axios.create({
 *               baseURL: '/api/units',
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             this.setupInterceptors();
 *             this.cache = new Map();
 *             this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
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
 *           getCacheKey(unitId, lastUnitId) {
 *             return `unit_${unitId}_${lastUnitId || 'none'}`;
 *           }
 *
 *           async getUnitDetails(unitId, lastUnitId = null, useCache = true) {
 *             const cacheKey = this.getCacheKey(unitId, lastUnitId);
 *
 *             // Check cache
 *             if (useCache && this.cache.has(cacheKey)) {
 *               const cached = this.cache.get(cacheKey);
 *               if (Date.now() - cached.timestamp < this.cacheTimeout) {
 *                 return cached.data;
 *               }
 *             }
 *
 *             try {
 *               const params = {};
 *               if (lastUnitId) {
 *                 params.lastUnit = lastUnitId;
 *               }
 *
 *               const response = await this.client.get(`/${unitId}`, { params });
 *
 *               // Cache the result
 *               this.cache.set(cacheKey, {
 *                 data: response.data,
 *                 timestamp: Date.now()
 *               });
 *
 *               return response.data;
 *             } catch (error) {
 *               console.error('Unit service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async getUnitTest(unitId) {
 *             const data = await this.getUnitDetails(unitId);
 *             return data.lessonTest;
 *           }
 *
 *           async getUnitInfo(unitId) {
 *             const data = await this.getUnitDetails(unitId);
 *             return data.unit;
 *           }
 *
 *           async getNextLesson(unitId) {
 *             const data = await this.getUnitDetails(unitId);
 *             return data.nextLesson;
 *           }
 *
 *           async getUnitProgress(unitId) {
 *             const data = await this.getUnitDetails(unitId);
 *             const { unit } = data;
 *
 *             return {
 *               unitId: unit._id,
 *               title: unit.title,
 *               totalLessons: unit.totalLessons,
 *               completedLessons: unit.completedLessons,
 *               progressPercentage: Math.round((unit.completedLessons / unit.totalLessons) * 100),
 *               isCompleted: unit.isCompleted || false,
 *               isLocked: unit.isLocked,
 *               estimatedTimeRemaining: unit.estimatedDuration * (1 - (unit.completedLessons / unit.totalLessons))
 *             };
 *           }
 *
 *           async validateUnitAccess(unitId) {
 *             try {
 *               const data = await this.getUnitDetails(unitId);
 *               const { unit } = data;
 *
 *               return {
 *                 hasAccess: !unit.isLocked,
 *                 isLocked: unit.isLocked,
 *                 prerequisites: unit.prerequisites || [],
 *                 reason: unit.isLocked ? 'Unit is locked. Complete prerequisites first.' : null
 *               };
 *             } catch (error) {
 *               if (error.response?.status === 404) {
 *                 return {
 *                   hasAccess: false,
 *                   isLocked: true,
 *                   reason: 'Unit not found'
 *                 };
 *               }
 *               throw error;
 *             }
 *           }
 *
 *           async getTestPreview(unitId) {
 *             const data = await this.getUnitDetails(unitId);
 *             const { lessonTest } = data;
 *
 *             if (!lessonTest) {
 *               return null;
 *             }
 *
 *             return {
 *               testId: lessonTest._id,
 *               title: lessonTest.title,
 *               description: lessonTest.description,
 *               totalQuestions: lessonTest.questions ? lessonTest.questions.length : 0,
 *               totalPoints: lessonTest.totalPoints,
 *               passingScore: lessonTest.passingScore,
 *               timeLimit: lessonTest.timeLimit,
 *               maxAttempts: lessonTest.attempts,
 *               estimatedTime: lessonTest.estimatedTime,
 *               difficulty: lessonTest.difficulty,
 *               questionTypes: lessonTest.questions ?
 *                 [...new Set(lessonTest.questions.map(q => q.type))] : []
 *             };
 *           }
 *
 *           // Helper methods
 *           formatDuration(minutes) {
 *             if (minutes < 60) {
 *               return `${minutes} minutes`;
 *             }
 *             const hours = Math.floor(minutes / 60);
 *             const remainingMinutes = minutes % 60;
 *             return `${hours}h ${remainingMinutes}m`;
 *           }
 *
 *           calculateCompletionTime(unit) {
 *             if (!unit.completedLessons || !unit.totalLessons) return null;
 *             const progressRatio = unit.completedLessons / unit.totalLessons;
 *             const remainingTime = unit.estimatedDuration * (1 - progressRatio);
 *             return Math.ceil(remainingTime);
 *           }
 *
 *           clearCache() {
 *             this.cache.clear();
 *           }
 *         }
 *
 *         export const unitService = new UnitService();
 *         ```
 *
 *     ReactUnitDetailsExample:
 *       summary: React component for unit details
 *       description: |
 *         ```typescript
 *         import React, { useState, useEffect } from 'react';
 *         import { useParams } from 'react-router-dom';
 *         import axios from 'axios';
 *
 *         interface UnitDetails {
 *           lessonTest: any;
 *           unit: any;
 *           lastUnit: any;
 *           nextLesson: any;
 *         }
 *
 *         export function UnitDetailsPage() {
 *           const { unitId } = useParams<{ unitId: string }>();
 *           const [unitDetails, setUnitDetails] = useState<UnitDetails | null>(null);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState<string | null>(null);
 *
 *           useEffect(() => {
 *             if (unitId) {
 *               fetchUnitDetails();
 *             }
 *           }, [unitId]);
 *
 *           const fetchUnitDetails = async () => {
 *             try {
 *               setLoading(true);
 *               setError(null);
 *
 *               const response = await axios.get(`/api/units/${unitId}`);
 *               setUnitDetails(response.data);
 *             } catch (err) {
 *               if (axios.isAxiosError(err)) {
 *                 if (err.response?.status === 404) {
 *                   setError('Unit not found');
 *                 } else if (err.response?.status === 401) {
 *                   setError('Please log in to view unit details');
 *                 } else {
 *                   setError(err.response?.data?.error || 'Failed to fetch unit details');
 *                 }
 *               } else {
 *                 setError('An unexpected error occurred');
 *               }
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           const formatDuration = (minutes: number) => {
 *             if (minutes < 60) return `${minutes} min`;
 *             const hours = Math.floor(minutes / 60);
 *             const remainingMinutes = minutes % 60;
 *             return `${hours}h ${remainingMinutes}m`;
 *           };
 *
 *           const calculateProgress = () => {
 *             if (!unitDetails?.unit) return 0;
 *             const { completedLessons, totalLessons } = unitDetails.unit;
 *             return Math.round((completedLessons / totalLessons) * 100);
 *           };
 *
 *           if (loading) {
 *             return <div className="unit-details-loading">Loading unit details...</div>;
 *           }
 *
 *           if (error) {
 *             return (
 *               <div className="unit-details-error">
 *                 <h2>Error</h2>
 *                 <p>{error}</p>
 *                 <button onClick={fetchUnitDetails}>Try Again</button>
 *               </div>
 *             );
 *           }
 *
 *           if (!unitDetails) {
 *             return <div>No unit details available</div>;
 *           }
 *
 *           const { unit, lessonTest, lastUnit, nextLesson } = unitDetails;
 *           const progress = calculateProgress();
 *
 *           return (
 *             <div className="unit-details">
 *               <div className="unit-header">
 *                 <div className="unit-breadcrumb">
 *                   {lastUnit && (
 *                     <span className="previous-unit">
 *                       {lastUnit.title} →
 *                     </span>
 *                   )}
 *                   <span className="current-unit">{unit.title}</span>
 *                 </div>
 *
 *                 <h1 className="unit-title">{unit.title}</h1>
 *                 <p className="unit-description">{unit.description}</p>
 *
 *                 <div className="unit-meta">
 *                   <span className="unit-level">{unit.level}</span>
 *                   <span className="unit-duration">
 *                     {formatDuration(unit.estimatedDuration)}
 *                   </span>
 *                   <span className="unit-lessons">
 *                     {unit.totalLessons} lessons
 *                   </span>
 *                 </div>
 *               </div>
 *
 *               <div className="unit-progress">
 *                 <div className="progress-header">
 *                   <h3>Progress</h3>
 *                   <span className="progress-text">
 *                     {unit.completedLessons}/{unit.totalLessons} lessons completed
 *                   </span>
 *                 </div>
 *                 <div className="progress-bar">
 *                   <div
 *                     className="progress-fill"
 *                     style={{ width: `${progress}%` }}
 *                   />
 *                 </div>
 *                 <div className="progress-percentage">{progress}%</div>
 *               </div>
 *
 *               {unit.learningObjectives && (
 *                 <div className="learning-objectives">
 *                   <h3>Learning Objectives</h3>
 *                   <ul>
 *                     {unit.learningObjectives.map((objective: string, index: number) => (
 *                       <li key={index}>{objective}</li>
 *                     ))}
 *                   </ul>
 *                 </div>
 *               )}
 *
 *               {unit.topics && (
 *                 <div className="unit-topics">
 *                   <h3>Topics Covered</h3>
 *                   <div className="topics-grid">
 *                     {unit.topics.map((topic: string, index: number) => (
 *                       <div key={index} className="topic-tag">
 *                         {topic}
 *                       </div>
 *                     ))}
 *                   </div>
 *                 </div>
 *               )}
 *
 *               {nextLesson && (
 *                 <div className="next-lesson">
 *                   <h3>Next Lesson</h3>
 *                   <div className="lesson-card">
 *                     <div className="lesson-info">
 *                       <h4>{nextLesson.title}</h4>
 *                       <p>{nextLesson.description}</p>
 *                       <div className="lesson-meta">
 *                         <span className="lesson-type">{nextLesson.type}</span>
 *                         <span className="lesson-difficulty">{nextLesson.difficulty}</span>
 *                         <span className="lesson-time">
 *                           {formatDuration(nextLesson.estimatedTime)}
 *                         </span>
 *                       </div>
 *                     </div>
 *                     <button
 *                       className="start-lesson-button"
 *                       disabled={nextLesson.isLocked}
 *                     >
 *                       {nextLesson.isLocked ? 'Locked' : 'Start Lesson'}
 *                     </button>
 *                   </div>
 *                 </div>
 *               )}
 *
 *               {lessonTest && (
 *                 <div className="unit-test">
 *                   <h3>Unit Test</h3>
 *                   <div className="test-card">
 *                     <div className="test-info">
 *                       <h4>{lessonTest.title}</h4>
 *                       <p>{lessonTest.description}</p>
 *
 *                       <div className="test-stats">
 *                         <div className="test-stat">
 *                           <span className="stat-label">Questions:</span>
 *                           <span className="stat-value">
 *                             {lessonTest.questions?.length || 'N/A'}
 *                           </span>
 *                         </div>
 *                         <div className="test-stat">
 *                           <span className="stat-label">Points:</span>
 *                           <span className="stat-value">{lessonTest.totalPoints}</span>
 *                         </div>
 *                         <div className="test-stat">
 *                           <span className="stat-label">Passing Score:</span>
 *                           <span className="stat-value">{lessonTest.passingScore}</span>
 *                         </div>
 *                         <div className="test-stat">
 *                           <span className="stat-label">Time Limit:</span>
 *                           <span className="stat-value">
 *                             {lessonTest.timeLimit ?
 *                               formatDuration(Math.floor(lessonTest.timeLimit / 60)) :
 *                               'No limit'
 *                             }
 *                           </span>
 *                         </div>
 *                         <div className="test-stat">
 *                           <span className="stat-label">Attempts:</span>
 *                           <span className="stat-value">{lessonTest.attempts}</span>
 *                         </div>
 *                       </div>
 *                     </div>
 *
 *                     <button className="take-test-button">
 *                       Take Unit Test
 *                     </button>
 *                   </div>
 *                 </div>
 *               )}
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Units
 *     description: Operations for managing learning units and their structure
 *   - name: Lessons
 *     description: Individual lesson management within units
 *   - name: Learning Progress
 *     description: Tracking and managing user progress through units and lessons
 */
export async function GET(
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

    // Connect to the database
    await connectDB();

    const url = new URL(request.url);
    const lastUnitId = url.searchParams.get("lastUnit");
 
    // Get the user from our database
    const lessonTest = await Lesson.findTestById(id);
    const unit = await Unit.findById(id);
    const lastUnit = await Unit.findById(lastUnitId);
    const nextLesson = await Lesson.findOne({
      unitId: id, // replace with actual ID or variable
      $or: [{ isTest: false }, { isTest: { $exists: false } }],
    }).sort({ order: 1 });


    if (!lessonTest) {
      return NextResponse.json(
        { error: "there is no lessonTest found in database" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { lessonTest, unit, lastUnit, nextLesson },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
