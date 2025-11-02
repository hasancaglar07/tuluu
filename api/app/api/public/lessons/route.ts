import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import Language from "@/models/Language";
import Chapter from "@/models/Chapter";
import Unit from "@/models/Unit";
import Lesson from "@/models/Lesson";
import UserProgress from "@/models/UserProgress";
import User from "@/models/User";
import Exercise from "@/models/Exercise";
import { auth } from "@clerk/nextjs/server";

export interface RewardType {
  xp: number;
  gems: number;
  gel: number;
  hearts: number;
  streak: number;
  xpBoost: XpBoostType | null;
}

export interface CurrentLessonType {
  lessonId: string; // If you're using ObjectId, change this to `Types.ObjectId`
  progress: number;
  lastAccessed: Date;
}
export interface XpBoostType {
  durationMinutes: number;
  multiplier: number;
}
export interface UserProgressType {
  userId: string;
  languageId: string;
  isCompleted: boolean;
  completedAt?: Date | null;

  completedChapters: {
    chapterId: string;
    completedAt: Date;
    rewards: RewardType;
  }[];

  completedUnits: {
    unitId: string;
    completedAt: Date;
    rewards: RewardType;
  }[];

  completedLessons: {
    lessonId: string;
    completedAt: Date;
    rewards: RewardType;
  }[];

  currentLesson?: CurrentLessonType;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @swagger
 * /api/languages:
 *   get:
 *     summary: Get available languages and learning content
 *     description: |
 *       Retrieves available languages for learning. When the "action=learn" parameter is provided
 *       and a user is authenticated, returns detailed language learning content including chapters,
 *       units, lessons, exercises, and user progress information. Without the action parameter,
 *       returns a simple list of available languages.
 *     tags:
 *       - Languages
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [learn]
 *         description: |
 *           When set to "learn", returns detailed learning content and user progress.
 *           Requires authentication.
 *     responses:
 *       '200':
 *         description: Successfully retrieved languages data
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/LanguagesList'
 *                 - $ref: '#/components/schemas/DetailedLanguagesResponse'
 *             examples:
 *               simpleList:
 *                 summary: Simple list of languages
 *                 value:
 *                   - _id: "507f1f77bcf86cd799439011"
 *                     name: "Spanish"
 *                     imageUrl: "/images/spanish.png"
 *                     baseLanguage: "English"
 *                     flag: "🇪🇸"
 *                   - _id: "507f1f77bcf86cd799439012"
 *                     name: "French"
 *                     imageUrl: "/images/french.png"
 *                     baseLanguage: "English"
 *                     flag: "🇫🇷"
 *               detailedContent:
 *                 summary: Detailed language content with user progress
 *                 value:
 *                   languages:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       name: "Spanish"
 *                       imageUrl: "/images/spanish.png"
 *                       baseLanguage: "English"
 *                       flag: "🇪🇸"
 *                       isCompleted: false
 *                       userCount: 1250
 *                       chapters:
 *                         - id: "507f1f77bcf86cd799439021"
 *                           title: "Basics"
 *                           isPremium: false
 *                           isCompleted: false
 *                           isExpanded: true
 *                           units:
 *                             - id: "507f1f77bcf86cd799439031"
 *                               title: "Greetings"
 *                               description: "Learn basic greetings in Spanish"
 *                               isPremium: false
 *                               isCompleted: false
 *                               color: "bg-[#ff2dbd]"
 *                               isExpanded: true
 *                               imageUrl: "/images/greetings.png"
 *                               lessons:
 *                                 - id: "507f1f77bcf86cd799439041"
 *                                   title: "Hello and Goodbye"
 *                                   chapterId: "507f1f77bcf86cd799439021"
 *                                   unitId: "507f1f77bcf86cd799439031"
 *                                   description: "Learn to say hello and goodbye"
 *                                   isPremium: false
 *                                   isCompleted: false
 *                                   imageUrl: "/images/hello.png"
 *                                   xpReward: 10
 *                                   order: 1
 *                                   exercises:
 *                                     - _id: "507f1f77bcf86cd799439051"
 *                                       type: "translate"
 *                                       instruction: "Translate this sentence"
 *                                       sourceText: "Hello"
 *                                       sourceLanguage: "English"
 *                                       targetLanguage: "Spanish"
 *                                       correctAnswer: "Hola"
 *                                       options: ["Hola", "Adiós", "Buenos días", "Gracias"]
 *                                       isNewWord: true
 *                                       audioUrl: "/audio/hello.mp3"
 *                                       neutralAnswerImage: "/images/neutral.png"
 *                                       badAnswerImage: "/images/incorrect.png"
 *                                       correctAnswerImage: "/images/correct.png"
 *                                       isActive: true
 *                                       order: 1
 *                   user:
 *                     xp: 250
 *                     gems: 45
 *                     gel: 12
 *                     hearts: 5
 *                     streak: 7
 *                     lastActive: "2024-01-15T10:30:00Z"
 *                   progress:
 *                     - _id: "507f1f77bcf86cd799439061"
 *                       userId: "user_123abc"
 *                       languageId: "507f1f77bcf86cd799439011"
 *                       currentChapterId: "507f1f77bcf86cd799439021"
 *                       currentUnitId: "507f1f77bcf86cd799439031"
 *                       currentLessonId: "507f1f77bcf86cd799439041"
 *                       completedLessons:
 *                         - lessonId: "507f1f77bcf86cd799439042"
 *                           completedAt: "2024-01-14T15:45:00Z"
 *                       completedUnits: []
 *                       completedChapters: []
 *                       isCompleted: false
 *       '401':
 *         description: Unauthorized - User not authenticated (when using action=learn)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   error: "Unauthorized"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   error: "Failed to fetch languages"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Language:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the language
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Name of the language
 *           example: "Spanish"
 *         imageUrl:
 *           type: string
 *           description: URL to the language image
 *           example: "/images/spanish.png"
 *         baseLanguage:
 *           type: string
 *           description: The base language from which the user is learning
 *           example: "English"
 *         flag:
 *           type: string
 *           description: Flag emoji representing the language
 *           example: "🇪🇸"
 *
 *     LanguagesList:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Language'
 *       description: List of available languages
 *
 *     Exercise:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the exercise
 *           example: "507f1f77bcf86cd799439051"
 *         type:
 *           type: string
 *           description: Type of exercise (e.g., translate, multiple-choice)
 *           example: "translate"
 *         instruction:
 *           type: string
 *           description: Instructions for the exercise
 *           example: "Translate this sentence"
 *         sourceText:
 *           type: string
 *           description: Text to be translated or worked with
 *           example: "Hello"
 *         sourceLanguage:
 *           type: string
 *           description: Source language of the text
 *           example: "English"
 *         targetLanguage:
 *           type: string
 *           description: Target language for translation
 *           example: "Spanish"
 *         correctAnswer:
 *           type: string
 *           description: The correct answer for the exercise
 *           example: "Hola"
 *         options:
 *           type: array
 *           items:
 *             type: string
 *           description: Available options for multiple-choice exercises
 *           example: ["Hola", "Adiós", "Buenos días", "Gracias"]
 *         isNewWord:
 *           type: boolean
 *           description: Whether this exercise introduces a new word
 *           example: true
 *         audioUrl:
 *           type: string
 *           description: URL to audio file for listening exercises
 *           example: "/audio/hello.mp3"
 *         neutralAnswerImage:
 *           type: string
 *           description: Image URL for neutral state
 *           example: "/images/neutral.png"
 *         badAnswerImage:
 *           type: string
 *           description: Image URL for incorrect answers
 *           example: "/images/incorrect.png"
 *         correctAnswerImage:
 *           type: string
 *           description: Image URL for correct answers
 *           example: "/images/correct.png"
 *         isActive:
 *           type: boolean
 *           description: Whether the exercise is active
 *           example: true
 *         order:
 *           type: integer
 *           description: Order of the exercise within the lesson
 *           example: 1
 *
 *     Lesson:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the lesson
 *           example: "507f1f77bcf86cd799439041"
 *         title:
 *           type: string
 *           description: Title of the lesson
 *           example: "Hello and Goodbye"
 *         chapterId:
 *           type: string
 *           format: objectId
 *           description: ID of the parent chapter
 *           example: "507f1f77bcf86cd799439021"
 *         unitId:
 *           type: string
 *           format: objectId
 *           description: ID of the parent unit
 *           example: "507f1f77bcf86cd799439031"
 *         description:
 *           type: string
 *           description: Description of the lesson
 *           example: "Learn to say hello and goodbye"
 *         isPremium:
 *           type: boolean
 *           description: Whether this lesson requires premium access
 *           example: false
 *         isCompleted:
 *           type: boolean
 *           description: Whether the user has completed this lesson
 *           example: false
 *         imageUrl:
 *           type: string
 *           description: URL to the lesson image
 *           example: "/images/hello.png"
 *         xpReward:
 *           type: integer
 *           description: XP points awarded for completing the lesson
 *           example: 10
 *         order:
 *           type: integer
 *           description: Order of the lesson within the unit
 *           example: 1
 *         exercises:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Exercise'
 *           description: Exercises included in this lesson
 *
 *     Unit:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the unit
 *           example: "507f1f77bcf86cd799439031"
 *         title:
 *           type: string
 *           description: Title of the unit
 *           example: "Greetings"
 *         description:
 *           type: string
 *           description: Description of the unit
 *           example: "Learn basic greetings in Spanish"
 *         isPremium:
 *           type: boolean
 *           description: Whether this unit requires premium access
 *           example: false
 *         isCompleted:
 *           type: boolean
 *           description: Whether the user has completed this unit
 *           example: false
 *         color:
 *           type: string
 *           description: Color theme for the unit
 *           example: "bg-[#ff2dbd]"
 *         isExpanded:
 *           type: boolean
 *           description: Whether the unit is expanded in the UI
 *           example: true
 *         imageUrl:
 *           type: string
 *           description: URL to the unit image
 *           example: "/images/greetings.png"
 *         lessons:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lesson'
 *           description: Lessons included in this unit
 *
 *     Chapter:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the chapter
 *           example: "507f1f77bcf86cd799439021"
 *         title:
 *           type: string
 *           description: Title of the chapter
 *           example: "Basics"
 *         isPremium:
 *           type: boolean
 *           description: Whether this chapter requires premium access
 *           example: false
 *         isCompleted:
 *           type: boolean
 *           description: Whether the user has completed this chapter
 *           example: false
 *         isExpanded:
 *           type: boolean
 *           description: Whether the chapter is expanded in the UI
 *           example: true
 *         units:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Unit'
 *           description: Units included in this chapter
 *
 *     DetailedLanguage:
 *       allOf:
 *         - $ref: '#/components/schemas/Language'
 *         - type: object
 *           properties:
 *             isCompleted:
 *               type: boolean
 *               description: Whether the user has completed this language
 *               example: false
 *             userCount:
 *               type: integer
 *               description: Number of users learning this language
 *               example: 1250
 *             chapters:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chapter'
 *               description: Chapters included in this language
 *
 *     UserProgress:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the progress record
 *           example: "507f1f77bcf86cd799439061"
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
 *         isCompleted:
 *           type: boolean
 *           description: Whether the language course is completed
 *           example: false
 *
 *     UserStats:
 *       type: object
 *       properties:
 *         xp:
 *           type: integer
 *           description: Total experience points
 *           example: 250
 *         gems:
 *           type: integer
 *           description: Total gems earned
 *           example: 45
 *         gel:
 *           type: integer
 *           description: Total gel earned
 *           example: 12
 *         hearts:
 *           type: integer
 *           description: Current heart count
 *           example: 5
 *         streak:
 *           type: integer
 *           description: Current learning streak in days
 *           example: 7
 *         lastActive:
 *           type: string
 *           format: date-time
 *           description: Last active timestamp
 *           example: "2024-01-15T10:30:00Z"
 *
 *     DetailedLanguagesResponse:
 *       type: object
 *       properties:
 *         languages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DetailedLanguage'
 *           description: Detailed language data with learning content
 *         user:
 *           $ref: '#/components/schemas/UserStats'
 *           description: User statistics and progress
 *         progress:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserProgress'
 *           description: User progress for each language
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Failed to fetch languages"
 *
 *   examples:
 *     LanguagesApiUsageExample:
 *       summary: How to use the Languages API with Axios
 *       description: |
 *         **Step 1: Fetch Simple Languages List**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const fetchLanguages = async () => {
 *           try {
 *             const response = await axios.get('/api/languages');
 *             return response.data;
 *           } catch (error) {
 *             console.error('Failed to fetch languages:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage
 *         const languages = await fetchLanguages();
 *         console.log('Available languages:', languages);
 *         ```
 *
 *         **Step 2: Fetch Detailed Learning Content**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const fetchLearningContent = async () => {
 *           try {
 *             const response = await axios.get('/api/languages', {
 *               params: { action: 'learn' },
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             return response.data;
 *           } catch (error) {
 *             console.error('Failed to fetch learning content:', error);
 *
 *             if (axios.isAxiosError(error)) {
 *               if (error.response?.status === 401) {
 *                 console.error('Authentication required');
 *                 // Redirect to login
 *                 window.location.href = '/login';
 *               }
 *             }
 *
 *             throw error;
 *           }
 *         };
 *
 *         // Usage
 *         const learningContent = await fetchLearningContent();
 *         console.log('User stats:', learningContent.user);
 *         console.log('Languages with content:', learningContent.languages);
 *         ```
 *
 *         **Step 3: Create a Reusable Hook for Language Data**
 *         ```javascript
 *         import { useState, useEffect } from 'react';
 *         import axios from 'axios';
 *
 *         export function useLanguages(fetchDetailed = false) {
 *           const [languages, setLanguages] = useState([]);
 *           const [userStats, setUserStats] = useState(null);
 *           const [userProgress, setUserProgress] = useState([]);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState(null);
 *
 *           useEffect(() => {
 *             const fetchData = async () => {
 *               try {
 *                 setLoading(true);
 *                 setError(null);
 *
 *                 const params = fetchDetailed ? { action: 'learn' } : {};
 *                 const response = await axios.get('/api/languages', { params });
 *
 *                 if (fetchDetailed) {
 *                   setLanguages(response.data.languages);
 *                   setUserStats(response.data.user);
 *                   setUserProgress(response.data.progress);
 *                 } else {
 *                   setLanguages(response.data);
 *                 }
 *               } catch (err) {
 *                 setError(err.message || 'Failed to fetch languages');
 *               } finally {
 *                 setLoading(false);
 *               }
 *             };
 *
 *             fetchData();
 *           }, [fetchDetailed]);
 *
 *           return {
 *             languages,
 *             userStats,
 *             userProgress,
 *             loading,
 *             error
 *           };
 *         }
 *         ```
 *
 *     ReactLanguageSelectorExample:
 *       summary: React component for language selection
 *       description: |
 *         ```typescript
 *         import React from 'react';
 *         import axios from 'axios';
 *
 *         interface Language {
 *           _id: string;
 *           name: string;
 *           imageUrl: string;
 *           baseLanguage: string;
 *           flag: string;
 *           userCount?: number;
 *         }
 *
 *         export function LanguageSelector() {
 *           const [languages, setLanguages] = React.useState<Language[]>([]);
 *           const [loading, setLoading] = React.useState(true);
 *           const [error, setError] = React.useState<string | null>(null);
 *           const [selectedLanguage, setSelectedLanguage] = React.useState<string | null>(null);
 *
 *           React.useEffect(() => {
 *             const fetchLanguages = async () => {
 *               try {
 *                 setLoading(true);
 *                 const response = await axios.get('/api/languages');
 *                 setLanguages(response.data);
 *               } catch (err) {
 *                 setError('Failed to load languages');
 *                 console.error(err);
 *               } finally {
 *                 setLoading(false);
 *               }
 *             };
 *
 *             fetchLanguages();
 *           }, []);
 *
 *           const handleLanguageSelect = (languageId: string) => {
 *             setSelectedLanguage(languageId);
 *             // Navigate to language learning page or start learning
 *             window.location.href = `/learn?language=${languageId}`;
 *           };
 *
 *           if (loading) {
 *             return <div className="loading">Loading available languages...</div>;
 *           }
 *
 *           if (error) {
 *             return <div className="error">Error: {error}</div>;
 *           }
 *
 *           return (
 *             <div className="language-selector">
 *               <h2>Choose a language to learn</h2>
 *
 *               <div className="languages-grid">
 *                 {languages.map((language) => (
 *                   <div
 *                     key={language._id}
 *                     className={`language-card ${selectedLanguage === language._id ? 'selected' : ''}`}
 *                     onClick={() => handleLanguageSelect(language._id)}
 *                   >
 *                     <div className="language-flag">{language.flag}</div>
 *                     <img
 *                       src={language.imageUrl || "/placeholder.svg"}
 *                       alt={`${language.name} flag`}
 *                       className="language-image"
 *                     />
 *                     <h3>{language.name}</h3>
 *                     <p>Learn from: {language.baseLanguage}</p>
 *                     {language.userCount && (
 *                       <div className="user-count">
 *                         {language.userCount.toLocaleString()} learners
 *                       </div>
 *                     )}
 *                   </div>
 *                 ))}
 *               </div>
 *             </div>
 *           );
 *         }
 *         ```
 *
 *     ReactLanguageLearningDashboardExample:
 *       summary: React component for language learning dashboard
 *       description: |
 *         ```typescript
 *         import React from 'react';
 *         import axios from 'axios';
 *
 *         export function LanguageLearningDashboard() {
 *           const [learningData, setLearningData] = React.useState(null);
 *           const [loading, setLoading] = React.useState(true);
 *           const [error, setError] = React.useState(null);
 *
 *           React.useEffect(() => {
 *             const fetchLearningData = async () => {
 *               try {
 *                 setLoading(true);
 *                 const response = await axios.get('/api/languages', {
 *                   params: { action: 'learn' }
 *                 });
 *                 setLearningData(response.data);
 *               } catch (err) {
 *                 if (axios.isAxiosError(err) && err.response?.status === 401) {
 *                   window.location.href = '/login?redirect=/learn';
 *                 } else {
 *                   setError('Failed to load learning content');
 *                   console.error(err);
 *                 }
 *               } finally {
 *                 setLoading(false);
 *               }
 *             };
 *
 *             fetchLearningData();
 *           }, []);
 *
 *           if (loading) {
 *             return <div className="loading">Loading your learning dashboard...</div>;
 *           }
 *
 *           if (error) {
 *             return <div className="error">Error: {error}</div>;
 *           }
 *
 *           if (!learningData) {
 *             return <div>No learning data available</div>;
 *           }
 *
 *           const { languages, user } = learningData;
 *
 *           return (
 *             <div className="learning-dashboard">
 *               <div className="user-stats">
 *                 <div className="stat">
 *                   <span className="label">XP</span>
 *                   <span className="value">{user.xp}</span>
 *                 </div>
 *                 <div className="stat">
 *                   <span className="label">Gems</span>
 *                   <span className="value">{user.gems}</span>
 *                 </div>
 *                 <div className="stat">
 *                   <span className="label">Streak</span>
 *                   <span className="value">{user.streak} days</span>
 *                 </div>
 *                 <div className="stat">
 *                   <span className="label">Hearts</span>
 *                   <span className="value">{user.hearts}</span>
 *                 </div>
 *               </div>
 *
 *               <h2>Your Languages</h2>
 *
 *               <div className="languages-list">
 *                 {languages.map((language) => (
 *                   <div key={language._id} className="language-progress-card">
 *                     <div className="language-header">
 *                       <span className="language-flag">{language.flag}</span>
 *                       <h3>{language.name}</h3>
 *                       {language.isCompleted && <span className="completed-badge">✓</span>}
 *                     </div>
 *
 *                     <div className="chapters-accordion">
 *                       {language.chapters.map((chapter) => (
 *                         <div key={chapter.id} className="chapter">
 *                           <div className="chapter-header">
 *                             <h4>{chapter.title}</h4>
 *                             {chapter.isPremium && <span className="premium-badge">Premium</span>}
 *                             {chapter.isCompleted && <span className="completed-badge">✓</span>}
 *                           </div>
 *
 *                           {chapter.isExpanded && (
 *                             <div className="units-list">
 *                               {chapter.units.map((unit) => (
 *                                 <div
 *                                   key={unit.id}
 *                                   className={`unit ${unit.isCompleted ? 'completed' : ''}`}
 *                                   style={{ backgroundColor: unit.color }}
 *                                 >
 *                                   <h5>{unit.title}</h5>
 *                                   <p>{unit.description}</p>
 *
 *                                   {unit.isExpanded && (
 *                                     <div className="lessons-list">
 *                                       {unit.lessons.map((lesson) => (
 *                                         <div
 *                                           key={lesson.id}
 *                                           className={`lesson ${lesson.isCompleted ? 'completed' : ''}`}
 *                                           onClick={() => navigateToLesson(lesson.id)}
 *                                         >
 *                                           <img
 *                                             src={lesson.imageUrl || '/images/default-lesson.png'}
 *                                             alt={lesson.title}
 *                                           />
 *                                           <div className="lesson-info">
 *                                             <h6>{lesson.title}</h6>
 *                                             <span className="xp-reward">+{lesson.xpReward} XP</span>
 *                                           </div>
 *                                           {lesson.isPremium && <span className="premium-badge">Premium</span>}
 *                                         </div>
 *                                       ))}
 *                                     </div>
 *                                   )}
 *                                 </div>
 *                               ))}
 *                             </div>
 *                           )}
 *                         </div>
 *                       ))}
 *                     </div>
 *                   </div>
 *                 ))}
 *               </div>
 *             </div>
 *           );
 *         }
 *
 *         // Helper function for navigation
 *         const navigateToLesson = (lessonId) => {
 *           window.location.href = `/lesson/${lessonId}`;
 *         };
 *         ```
 *
 * tags:
 *   - name: Languages
 *     description: Operations related to language learning content and progress
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { userId } = await auth();

    const languages = await Language.find({});

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "learn" && userId) {
      const totalStats = await UserProgress.getTotalStats(userId);

      // 4. Get user doc for last login and streak

      const lastLogin = await User.findOne({ clerkId: userId })
        .select("loginHistory")
        .lean();

      const lastHistory =
        lastLogin?.loginHistory?.[lastLogin.loginHistory.length - 1];

      const lastActive = lastHistory?.date
        ? new Date(lastHistory.date).toISOString()
        : null;

      const user = {
        xp: totalStats.totalXp,
        gems: totalStats.totalGems,
        gel: totalStats.totalGel,
        hearts: totalStats?.totalHeart,
        streak: totalStats?.totalStreak,
        lastActive: lastActive,
      };
      const userCountStats = await UserProgress.getUserCountPerLanguage();
      // Step 2: Convert stats array to a dictionary for fast lookup
      const userCountMap = userCountStats.reduce((acc, lang) => {
        acc[lang.languageId] = lang.userCount;
        return acc;
      }, {} as Record<string, number>);
      const languages = await Language.find();

      // Get all UserProgress for user and languages
      const userProgressList = await UserProgress.find({
        userId: userId,
        languageId: { $in: languages.map((lang) => lang._id) },
      }).lean();

      // Define the type for progressMap
      const progressMap: Record<string, UserProgressType> = {};
      userProgressList.forEach((progress) => {
        progressMap[progress.languageId] = progress as UserProgressType;
      });

      const lessons = await Promise.all(
        languages.map(async (language) => {
          const progress = progressMap[language._id.toString()];

          const isLanguageCompleted = progress?.isCompleted || false;

          const chapters = await Chapter.find({ languageId: language._id });

          const formattedChapters = await Promise.all(
            chapters.map(async (chapter) => {
              const isChapterCompleted =
                progress?.completedChapters?.some(
                  (item: { chapterId: string }) =>
                    item.chapterId === chapter._id.toString()
                ) || false;

              const units = await Unit.find({ chapterId: chapter._id });

              const formattedUnits = await Promise.all(
                units.map(async (unit) => {
                  const isUnitCompleted =
                    progress?.completedUnits?.some(
                      (item: { unitId: string }) =>
                        item.unitId === unit._id.toString()
                    ) || false;

                  const lessons = await Lesson.find({ unitId: unit._id });

                  const formattedLessons = await Promise.all(
                    // await Promise.all here, since lessons.map is async
                    lessons.map(async (lesson) => {
                      const isLessonCompleted =
                        progress?.completedLessons?.some(
                          (item: { lessonId: string }) =>
                            item.lessonId === lesson._id.toString()
                        ) || false;

                      const exercises = await Exercise.find({
                        lessonId: lesson._id,
                      });
                      const formattedExercises = exercises.map((exercise) => ({
                        _id: exercise._id,
                        type: exercise.type,
                        instruction: exercise.instruction,
                        sourceText: exercise.sourceText,
                        sourceLanguage: exercise.sourceLanguage,
                        targetLanguage: exercise.targetLanguage,
                        correctAnswer: exercise.correctAnswer,
                        options: exercise.options,
                        isNewWord: exercise.isNewWord,
                        audioUrl: exercise.audioUrl,
                        neutralAnswerImage: exercise.neutralAnswerImage,
                        badAnswerImage: exercise.badAnswerImage,
                        correctAnswerImage: exercise.correctAnswerImage,
                        isActive: exercise.isActive,
                        order: exercise.order,
                      }));

                      return {
                        id: lesson._id,
                        title: lesson.title,
                        chapterId: lesson.chapterId,
                        unitId: lesson.unitId,
                        description: lesson.description || "",
                        isPremium: lesson.isPremium || false,
                        isCompleted: isLessonCompleted,
                        imageUrl: lesson.imageUrl || "",
                        xpReward: lesson.xpReward || 10,
                        order: lesson.order || 10,
                        exercises: formattedExercises,
                      };
                    })
                  );

                  return {
                    id: unit._id,
                    title: unit.title,
                    description: unit.description || "",
                    isPremium: unit.isPremium || false,
                    isCompleted: isUnitCompleted,
                    color: unit.color || "bg-[#ff2dbd]",
                    isExpanded: true,
                    imageUrl: unit.imageUrl || "",
                    lessons: formattedLessons,
                  };
                })
              );

              return {
                id: chapter._id,
                title: chapter.title,
                isPremium: chapter.isPremium || false,
                isCompleted: isChapterCompleted,
                isExpanded: true,
                units: formattedUnits,
              };
            })
          );

          return {
            _id: language._id,
            name: language.name,
            imageUrl: language.imageUrl,
            baseLanguage: language.baseLanguage,
            flag: language.flag,
            isCompleted: isLanguageCompleted,
            userCount: userCountMap[language._id.toString()] || 0,
            chapters: formattedChapters,
          };
        })
      );

      return NextResponse.json(
        { languages: lessons, user: user, progress: userProgressList },
        { status: 200 }
      );
    }

    return NextResponse.json(languages, { status: 200 });
  } catch (error) {
    console.error("Error fetching languages:", error);
    return NextResponse.json(
      { error: "Failed to fetch languages" },
      { status: 500 }
    );
  }
}
