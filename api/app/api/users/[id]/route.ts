import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import UserProgress from "@/models/UserProgress";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user's total stats
 *     description: |
 *       Retrieves a user's total stats by combining static stats from the user document
 *       with earned stats from their progress history. Returns comprehensive statistics
 *       including XP, gems, gel, hearts, and streak. Requires user authentication.
 *     tags:
 *       - Users
 *       - Stats
 *       - Profile
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk ID of the user whose stats to retrieve
 *         example: "user_2abc123def456"
 *     responses:
 *       '200':
 *         description: User stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserTotalStats'
 *             examples:
 *               userStats:
 *                 summary: User's total stats
 *                 value:
 *                   xp: 1250
 *                   gems: 350
 *                   gel: 75
 *                   hearts: 5
 *                   streak: 15
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   error: "Unauthorized"
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *             examples:
 *               userNotFound:
 *                 value:
 *                   error: "User not found in database"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   error: "Internal server error"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserTotalStats:
 *       type: object
 *       properties:
 *         xp:
 *           type: integer
 *           description: Total experience points (static + earned)
 *           example: 1250
 *         gems:
 *           type: integer
 *           description: Total gems (static + earned)
 *           example: 350
 *         gel:
 *           type: integer
 *           description: Total gel/coins (static + earned)
 *           example: 75
 *         hearts:
 *           type: integer
 *           minimum: 0
 *           maximum: 5
 *           description: Current hearts count
 *           example: 5
 *         streak:
 *           type: integer
 *           description: Current learning streak
 *           example: 15
 *
 *     UserErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "User not found in database"
 *
 *   examples:
 *     UserStatsApiUsageExample:
 *       summary: How to use the User Stats API with Axios
 *       description: |
 *         **Step 1: Get User Stats with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const getUserStats = async (userId) => {
 *           try {
 *             const response = await axios.get(`/api/users/${userId}`, {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             return response.data;
 *           } catch (error) {
 *             console.error('Failed to get user stats:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage example
 *         const userStats = await getUserStats('user_2abc123def456');
 *         console.log(`User XP: ${userStats.xp}`);
 *         console.log(`User Gems: ${userStats.gems}`);
 *         console.log(`User Streak: ${userStats.streak}`);
 *         ```
 *
 *         **Step 2: Create a User Stats Service**
 *         ```javascript
 *         class UserStatsService {
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
 *           async getUserStats(userId) {
 *             try {
 *               const response = await this.client.get(`/${userId}`);
 *               return response.data;
 *             } catch (error) {
 *               console.error('User stats service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           // Helper methods
 *           formatXP(xp) {
 *             return xp.toLocaleString();
 *           }
 *
 *           formatGems(gems) {
 *             return gems.toLocaleString();
 *           }
 *
 *           getXPLevel(xp) {
 *             // Example level calculation
 *             return Math.floor(Math.sqrt(xp / 100)) + 1;
 *           }
 *
 *           getXPProgress(xp) {
 *             // Example progress calculation
 *             const currentLevel = this.getXPLevel(xp);
 *             const xpForCurrentLevel = Math.pow(currentLevel - 1, 2) * 100;
 *             const xpForNextLevel = Math.pow(currentLevel, 2) * 100;
 *             const xpInCurrentLevel = xp - xpForCurrentLevel;
 *             const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
 *             return {
 *               currentLevel,
 *               nextLevel: currentLevel + 1,
 *               xpInCurrentLevel,
 *               xpNeededForNextLevel,
 *               progressPercent: Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)
 *             };
 *           }
 *
 *           getStreakEmoji(streak) {
 *             if (streak >= 100) return '🔥🔥🔥';
 *             if (streak >= 30) return '🔥🔥';
 *             if (streak >= 7) return '🔥';
 *             return '✨';
 *           }
 *         }
 *
 *         export const userStatsService = new UserStatsService();
 *         ```
 *
 *         **Step 3: User Stats Display Component**
 *         ```javascript
 *         import React, { useState, useEffect } from 'react';
 *         import { userStatsService } from '../services/user-stats-service';
 *
 *         export function UserStatsDisplay({ userId }) {
 *           const [stats, setStats] = useState(null);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState(null);
 *
 *           useEffect(() => {
 *             async function fetchStats() {
 *               try {
 *                 setLoading(true);
 *                 const userStats = await userStatsService.getUserStats(userId);
 *                 setStats(userStats);
 *                 setError(null);
 *               } catch (err) {
 *                 setError(err.message || 'Failed to load user stats');
 *                 console.error('Error loading user stats:', err);
 *               } finally {
 *                 setLoading(false);
 *               }
 *             }
 *
 *             fetchStats();
 *           }, [userId]);
 *
 *           if (loading) {
 *             return <div className="loading">Loading stats...</div>;
 *           }
 *
 *           if (error) {
 *             return <div className="error">{error}</div>;
 *           }
 *
 *           if (!stats) {
 *             return <div className="no-stats">No stats available</div>;
 *           }
 *
 *           const level = userStatsService.getXPLevel(stats.xp);
 *           const progress = userStatsService.getXPProgress(stats.xp);
 *           const streakEmoji = userStatsService.getStreakEmoji(stats.streak);
 *
 *           return (
 *             <div className="user-stats">
 *               <div className="stat-card level">
 *                 <h3>Level</h3>
 *                 <div className="stat-value">{level}</div>
 *                 <div className="progress-bar">
 *                   <div
 *                     className="progress"
 *                     style={{ width: `${progress.progressPercent}%` }}
 *                   ></div>
 *                 </div>
 *                 <div className="progress-text">
 *                   {progress.xpInCurrentLevel} / {progress.xpNeededForNextLevel} XP
 *                 </div>
 *               </div>
 *
 *               <div className="stat-card xp">
 *                 <h3>XP</h3>
 *                 <div className="stat-value">{userStatsService.formatXP(stats.xp)}</div>
 *               </div>
 *
 *               <div className="stat-card gems">
 *                 <h3>Gems</h3>
 *                 <div className="stat-value">💎 {userStatsService.formatGems(stats.gems)}</div>
 *               </div>
 *
 *               <div className="stat-card gel">
 *                 <h3>Coins</h3>
 *                 <div className="stat-value">🪙 {stats.gel}</div>
 *               </div>
 *
 *               <div className="stat-card hearts">
 *                 <h3>Hearts</h3>
 *                 <div className="stat-value">
 *                   {Array(5).fill(0).map((_, i) => (
 *                     <span key={i} className={i < stats.hearts ? 'heart-filled' : 'heart-empty'}>
 *                       {i < stats.hearts ? '❤️' : '🖤'}
 *                     </span>
 *                   ))}
 *                 </div>
 *               </div>
 *
 *               <div className="stat-card streak">
 *                 <h3>Streak</h3>
 *                 <div className="stat-value">
 *                   {streakEmoji} {stats.streak} days
 *                 </div>
 *               </div>
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Users
 *     description: Operations for managing and retrieving user information
 *   - name: Stats
 *     description: User statistics and progress tracking
 *   - name: Profile
 *     description: User profile data and management
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

    // Get the user from our database
    const user = await User.findByClerkId(id);
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const earned = await UserProgress.getTotalStats(userId);
    // Combine static + earned stats
    const total = {
      xp: user.xp + earned.totalXp,
      gems: user.gems + earned.totalGems,
      gel: user.gel + earned.totalGel,
      hearts: user.hearts,
      streak: user.streak,
    };

    return NextResponse.json(total, { status: 200 });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
