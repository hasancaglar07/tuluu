import { NextResponse } from "next/server";
import Quest, { QuestDocument } from "@/models/Quest";
import { auth } from "@clerk/nextjs/server";
import { FilterQuery } from "mongoose";
import connectDB from "@/lib/db/connect";

/**
 * @swagger
 * /api/quests:
 *   get:
 *     summary: Get available quests for the authenticated user
 *     description: |
 *       Retrieves a list of quests available to the authenticated user with optional filtering.
 *       Quests can be filtered by type, status, category, difficulty, and featured status.
 *       Only active quests within their date range are returned by default.
 *       Requires user authentication.
 *     tags:
 *       - Quests
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, special]
 *         description: Filter quests by type/duration
 *         example: "daily"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, expired, draft]
 *         description: Filter quests by status (defaults to "active")
 *         example: "active"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter quests by category
 *         example: "learning"
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard, expert]
 *         description: Filter quests by difficulty level
 *         example: "medium"
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Filter to show only featured quests
 *         example: true
 *     responses:
 *       '200':
 *         description: Successfully retrieved quests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestsResponse'
 *             examples:
 *               dailyQuests:
 *                 summary: Daily quests example
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "507f1f77bcf86cd799439011"
 *                       title: "Complete 3 Lessons"
 *                       description: "Complete 3 lessons in any language to earn XP"
 *                       status: "active"
 *                       difficulty: "easy"
 *                       duration: "daily"
 *                       progress: 1
 *                       total: 3
 *                       xpReward: 50
 *                       heartsReward: 2
 *                       expiresIn: "18h 45m"
 *                       category: "learning"
 *                       conditions:
 *                         - id: "507f1f77bcf86cd799439021"
 *                           type: "complete_lessons"
 *                           target: 3
 *                           timeframe: "daily"
 *                       priority: 5
 *                       isFeatured: false
 *                     - id: "507f1f77bcf86cd799439012"
 *                       title: "Maintain Streak"
 *                       description: "Keep your learning streak alive for 7 days"
 *                       status: "active"
 *                       difficulty: "medium"
 *                       duration: "weekly"
 *                       progress: 3
 *                       total: 7
 *                       xpReward: 100
 *                       expiresIn: "4j 12h"
 *                       category: "streak"
 *                       conditions:
 *                         - id: "507f1f77bcf86cd799439022"
 *                           type: "maintain_streak"
 *                           target: 7
 *                           timeframe: "weekly"
 *                       priority: 8
 *                       isFeatured: true
 *               featuredQuests:
 *                 summary: Featured quests only
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "507f1f77bcf86cd799439013"
 *                       title: "Language Master Challenge"
 *                       description: "Complete 50 lessons across any languages this month"
 *                       status: "active"
 *                       difficulty: "hard"
 *                       duration: "monthly"
 *                       progress: 23
 *                       total: 50
 *                       xpReward: 500
 *                       heartsReward: 10
 *                       expiresIn: "12j"
 *                       category: "challenge"
 *                       conditions:
 *                         - id: "507f1f77bcf86cd799439023"
 *                           type: "complete_lessons"
 *                           target: 50
 *                           timeframe: "monthly"
 *                       priority: 10
 *                       isFeatured: true
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   success: false
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
 *                   success: false
 *                   error: "Failed to fetch quests"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     QuestCondition:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the condition
 *           example: "507f1f77bcf86cd799439021"
 *         type:
 *           type: string
 *           description: Type of condition to fulfill
 *           example: "complete_lessons"
 *         target:
 *           type: integer
 *           minimum: 1
 *           description: Target value to achieve for this condition
 *           example: 3
 *         timeframe:
 *           type: string
 *           enum: [daily, weekly, monthly, unlimited]
 *           description: Timeframe within which the condition must be met
 *           example: "daily"
 *
 *     Quest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the quest
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           description: Title of the quest
 *           example: "Complete 3 Lessons"
 *         description:
 *           type: string
 *           description: Detailed description of the quest
 *           example: "Complete 3 lessons in any language to earn XP"
 *         status:
 *           type: string
 *           enum: [active, completed, expired, draft]
 *           description: Current status of the quest
 *           example: "active"
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Difficulty level of the quest
 *           example: "easy"
 *         duration:
 *           type: string
 *           enum: [daily, weekly, monthly, special]
 *           description: Duration/type of the quest
 *           example: "daily"
 *         progress:
 *           type: integer
 *           minimum: 0
 *           description: Current progress towards quest completion
 *           example: 1
 *         total:
 *           type: integer
 *           minimum: 1
 *           description: Total target value needed to complete the quest
 *           example: 3
 *         xpReward:
 *           type: integer
 *           minimum: 0
 *           description: XP points awarded for completing the quest
 *           example: 50
 *         heartsReward:
 *           type: integer
 *           minimum: 0
 *           description: Hearts awarded for completing the quest (optional)
 *           example: 2
 *         expiresIn:
 *           type: string
 *           description: Human-readable time remaining until quest expires
 *           example: "18h 45m"
 *         category:
 *           type: string
 *           description: Category of the quest
 *           example: "learning"
 *         conditions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestCondition'
 *           description: Conditions that must be met to complete the quest
 *         priority:
 *           type: integer
 *           description: Priority level for quest ordering
 *           example: 5
 *         isFeatured:
 *           type: boolean
 *           description: Whether this quest is featured
 *           example: false
 *
 *     QuestsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Quest'
 *           description: Array of available quests
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Unauthorized"
 *
 *   examples:
 *     QuestsApiUsageExample:
 *       summary: How to use the Quests API with Axios
 *       description: |
 *         **Step 1: Fetch All Active Quests**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const fetchQuests = async (filters = {}) => {
 *           try {
 *             const response = await axios.get('/api/quests', {
 *               params: filters,
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to fetch quests');
 *             }
 *           } catch (error) {
 *             console.error('Failed to fetch quests:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const allQuests = await fetchQuests();
 *         const dailyQuests = await fetchQuests({ type: 'daily' });
 *         const featuredQuests = await fetchQuests({ featured: true });
 *         const hardQuests = await fetchQuests({ difficulty: 'hard' });
 *         ```
 *
 *         **Step 2: Filter and Display Quests**
 *         ```javascript
 *         const displayQuests = async () => {
 *           try {
 *             const quests = await fetchQuests();
 *
 *             // Group quests by duration
 *             const questsByDuration = quests.reduce((acc, quest) => {
 *               if (!acc[quest.duration]) {
 *                 acc[quest.duration] = [];
 *               }
 *               acc[quest.duration].push(quest);
 *               return acc;
 *             }, {});
 *
 *             // Display daily quests
 *             if (questsByDuration.daily) {
 *               console.log('Daily Quests:');
 *               questsByDuration.daily.forEach(quest => {
 *                 console.log(`- ${quest.title}: ${quest.progress}/${quest.total} (${quest.expiresIn})`);
 *               });
 *             }
 *
 *             // Display featured quests
 *             const featured = quests.filter(q => q.isFeatured);
 *             if (featured.length > 0) {
 *               console.log('Featured Quests:');
 *               featured.forEach(quest => {
 *                 console.log(`- ${quest.title}: ${quest.xpReward} XP reward`);
 *               });
 *             }
 *
 *             return questsByDuration;
 *           } catch (error) {
 *             console.error('Error displaying quests:', error);
 *           }
 *         };
 *         ```
 *
 *         **Step 3: Create a Quest Management Service**
 *         ```javascript
 *         class QuestService {
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
 *           async getQuests(filters = {}) {
 *             const response = await this.client.get('/quests', { params: filters });
 *             return response.data;
 *           }
 *
 *           async getDailyQuests() {
 *             return this.getQuests({ type: 'daily' });
 *           }
 *
 *           async getWeeklyQuests() {
 *             return this.getQuests({ type: 'weekly' });
 *           }
 *
 *           async getFeaturedQuests() {
 *             return this.getQuests({ featured: true });
 *           }
 *
 *           async getQuestsByDifficulty(difficulty) {
 *             return this.getQuests({ difficulty });
 *           }
 *
 *           async getQuestsByCategory(category) {
 *             return this.getQuests({ category });
 *           }
 *
 *           // Helper methods for quest analysis
 *           calculateTotalRewards(quests) {
 *             return quests.reduce((total, quest) => {
 *               return {
 *                 xp: total.xp + quest.xpReward,
 *                 hearts: total.hearts + (quest.heartsReward || 0)
 *               };
 *             }, { xp: 0, hearts: 0 });
 *           }
 *
 *           getCompletableQuests(quests) {
 *             return quests.filter(quest => quest.progress >= quest.total);
 *           }
 *
 *           getExpiringQuests(quests, hoursThreshold = 24) {
 *             return quests.filter(quest => {
 *               const timeLeft = this.parseTimeRemaining(quest.expiresIn);
 *               return timeLeft > 0 && timeLeft <= hoursThreshold * 60; // Convert to minutes
 *             });
 *           }
 *
 *           parseTimeRemaining(expiresIn) {
 *             // Parse "18h 45m" format to minutes
 *             const matches = expiresIn.match(/(?:(\d+)j)?(?:\s*(\d+)h)?(?:\s*(\d+)m)?/);
 *             if (!matches) return 0;
 *
 *             const days = parseInt(matches[1] || '0');
 *             const hours = parseInt(matches[2] || '0');
 *             const minutes = parseInt(matches[3] || '0');
 *
 *             return days * 24 * 60 + hours * 60 + minutes;
 *           }
 *         }
 *
 *         export const questService = new QuestService();
 *         ```
 *
 *     ReactQuestDashboardExample:
 *       summary: React component for quest dashboard
 *       description: |
 *         ```typescript
 *         import React, { useState, useEffect } from 'react';
 *         import axios from 'axios';
 *
 *         interface Quest {
 *           id: string;
 *           title: string;
 *           description: string;
 *           status: 'active' | 'completed' | 'expired';
 *           difficulty: 'easy' | 'medium' | 'hard';
 *           duration: 'daily' | 'weekly' | 'monthly' | 'special';
 *           progress: number;
 *           total: number;
 *           xpReward: number;
 *           heartsReward?: number;
 *           expiresIn: string;
 *           category: string;
 *           isFeatured: boolean;
 *         }
 *
 *         interface QuestFilters {
 *           type?: string;
 *           difficulty?: string;
 *           category?: string;
 *           featured?: boolean;
 *         }
 *
 *         export function QuestDashboard() {
 *           const [quests, setQuests] = useState<Quest[]>([]);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState<string | null>(null);
 *           const [filters, setFilters] = useState<QuestFilters>({});
 *           const [selectedTab, setSelectedTab] = useState<'all' | 'daily' | 'weekly' | 'featured'>('all');
 *
 *           useEffect(() => {
 *             fetchQuests();
 *           }, [filters]);
 *
 *           const fetchQuests = async () => {
 *             try {
 *               setLoading(true);
 *               setError(null);
 *
 *               const response = await axios.get('/api/quests', {
 *                 params: filters
 *               });
 *
 *               if (response.data.success) {
 *                 setQuests(response.data.data);
 *               } else {
 *                 setError(response.data.error || 'Failed to fetch quests');
 *               }
 *             } catch (err) {
 *               if (axios.isAxiosError(err)) {
 *                 if (err.response?.status === 401) {
 *                   setError('Please log in to view quests');
 *                 } else {
 *                   setError(err.response?.data?.error || 'Failed to fetch quests');
 *                 }
 *               } else {
 *                 setError('An unexpected error occurred');
 *               }
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           const handleTabChange = (tab: typeof selectedTab) => {
 *             setSelectedTab(tab);
 *
 *             switch (tab) {
 *               case 'daily':
 *                 setFilters({ type: 'daily' });
 *                 break;
 *               case 'weekly':
 *                 setFilters({ type: 'weekly' });
 *                 break;
 *               case 'featured':
 *                 setFilters({ featured: true });
 *                 break;
 *               default:
 *                 setFilters({});
 *             }
 *           };
 *
 *           const getDifficultyColor = (difficulty: string) => {
 *             switch (difficulty) {
 *               case 'easy': return 'text-green-600';
 *               case 'medium': return 'text-yellow-600';
 *               case 'hard': return 'text-red-600';
 *               default: return 'text-gray-600';
 *             }
 *           };
 *
 *           const getProgressPercentage = (quest: Quest) => {
 *             return Math.min(100, (quest.progress / quest.total) * 100);
 *           };
 *
 *           if (loading) {
 *             return <div className="quest-dashboard-loading">Loading quests...</div>;
 *           }
 *
 *           if (error) {
 *             return (
 *               <div className="quest-dashboard-error">
 *                 <p>Error: {error}</p>
 *                 <button onClick={fetchQuests} className="retry-button">
 *                   Retry
 *                 </button>
 *               </div>
 *             );
 *           }
 *
 *           return (
 *             <div className="quest-dashboard">
 *               <div className="quest-header">
 *                 <h2>Quests</h2>
 *                 <div className="quest-tabs">
 *                   <button
 *                     className={`tab ${selectedTab === 'all' ? 'active' : ''}`}
 *                     onClick={() => handleTabChange('all')}
 *                   >
 *                     All Quests
 *                   </button>
 *                   <button
 *                     className={`tab ${selectedTab === 'daily' ? 'active' : ''}`}
 *                     onClick={() => handleTabChange('daily')}
 *                   >
 *                     Daily
 *                   </button>
 *                   <button
 *                     className={`tab ${selectedTab === 'weekly' ? 'active' : ''}`}
 *                     onClick={() => handleTabChange('weekly')}
 *                   >
 *                     Weekly
 *                   </button>
 *                   <button
 *                     className={`tab ${selectedTab === 'featured' ? 'active' : ''}`}
 *                     onClick={() => handleTabChange('featured')}
 *                   >
 *                     Featured
 *                   </button>
 *                 </div>
 *               </div>
 *
 *               <div className="quests-grid">
 *                 {quests.map((quest) => (
 *                   <div key={quest.id} className={`quest-card ${quest.isFeatured ? 'featured' : ''}`}>
 *                     <div className="quest-card-header">
 *                       <h3>{quest.title}</h3>
 *                       <div className="quest-badges">
 *                         <span className={`difficulty-badge ${getDifficultyColor(quest.difficulty)}`}>
 *                           {quest.difficulty}
 *                         </span>
 *                         <span className="duration-badge">{quest.duration}</span>
 *                         {quest.isFeatured && <span className="featured-badge">⭐</span>}
 *                       </div>
 *                     </div>
 *
 *                     <p className="quest-description">{quest.description}</p>
 *
 *                     <div className="quest-progress">
 *                       <div className="progress-bar">
 *                         <div
 *                           className="progress-fill"
 *                           style={{ width: `${getProgressPercentage(quest)}%` }}
 *                         />
 *                       </div>
 *                       <span className="progress-text">
 *                         {quest.progress}/{quest.total}
 *                       </span>
 *                     </div>
 *
 *                     <div className="quest-rewards">
 *                       <div className="reward">
 *                         <span className="reward-icon">⚡</span>
 *                         <span>{quest.xpReward} XP</span>
 *                       </div>
 *                       {quest.heartsReward && (
 *                         <div className="reward">
 *                           <span className="reward-icon">❤️</span>
 *                           <span>{quest.heartsReward} Hearts</span>
 *                         </div>
 *                       )}
 *                     </div>
 *
 *                     <div className="quest-footer">
 *                       <span className="expires-in">Expires in: {quest.expiresIn}</span>
 *                       <span className="category">{quest.category}</span>
 *                     </div>
 *                   </div>
 *                 ))}
 *               </div>
 *
 *               {quests.length === 0 && (
 *                 <div className="no-quests">
 *                   <p>No quests available with the current filters.</p>
 *                 </div>
 *               )}
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Quests
 *     description: Operations related to user quests and challenges
 */
export async function GET(request: Request) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const featured = searchParams.get("featured") === "true";

    // Build filter object
    const filter: FilterQuery<QuestDocument> = {};

    // Only show active quests by default
    if (!status) {
      filter.status = "active";
    } else {
      filter.status = status;
    }

    if (type) filter.type = type;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (featured) filter.isFeatured = true;

    // Ensure we only show quests that are currently active (within date range)
    const now = new Date();
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
    filter.isVisible = true;

    // Fetch quests with filtering
    const quests = await Quest.find(filter)
      .sort({ priority: -1, startDate: 1 })
      .lean();

    // Transform quests to match frontend structure
    const transformedQuests = quests.map((quest) => {
      // Calculate time remaining
      const timeRemaining = quest.endDate
        ? Math.max(0, quest.endDate.getTime() - now.getTime())
        : 0;
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
      );

      let expiresIn = "";
      if (days > 0) expiresIn = `${days}j${hours > 0 ? ` ${hours}h` : ""}`;
      else if (hours > 0) expiresIn = `${hours}h ${minutes}m`;
      else if (minutes > 0) expiresIn = `${minutes}m`;
      else expiresIn = "Bientôt";

      // Map quest difficulty to frontend difficulty
      let frontendDifficulty: "easy" | "medium" | "hard";
      switch (quest.difficulty) {
        case "easy":
          frontendDifficulty = "easy";
          break;
        case "medium":
          frontendDifficulty = "medium";
          break;
        case "hard":
        case "expert":
          frontendDifficulty = "hard";
          break;
        default:
          frontendDifficulty = "medium";
      }

      // Map quest type to frontend duration
      let frontendDuration: "daily" | "weekly" | "monthly" | "special";
      switch (quest.type) {
        case "daily":
          frontendDuration = "daily";
          break;
        case "weekly":
          frontendDuration = "weekly";
          break;
        case "monthly":
          frontendDuration = "monthly";
          break;
        default:
          frontendDuration = "special";
      }

      // Extract rewards
      const xpReward =
        (quest.rewards.find((r) => r.type === "xp")?.value as number) || 0;
      const heartsReward =
        (quest.rewards.find((r) => r.type === "hearts")?.value as number) || 0;

      // Get total from first condition or default to 1
      const total =
        quest.conditions.length > 0 ? quest.conditions[0].target : 1;

      return {
        id: quest._id.toString(),
        title: quest.title,
        description: quest.description,
        status: "active" as const, // Will be updated with user progress data
        difficulty: frontendDifficulty,
        duration: frontendDuration,
        progress: 0, // Will be updated with user progress data
        total,
        xpReward,
        heartsReward: heartsReward > 0 ? heartsReward : undefined,
        expiresIn,
        category: quest.category,
        conditions: quest.conditions.map((c) => ({
          id: c._id.toString(),
          type: c.type,
          target: c.target,
          timeframe: c.timeframe,
        })),
        priority: quest.priority || 0,
        isFeatured: quest.isFeatured || false,
      };
    });

    return NextResponse.json({
      success: true,
      data: transformedQuests,
    });
  } catch (error) {
    console.error("Quests API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch quests",
      },
      { status: 500 }
    );
  }
}
