import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import UserProgress from "@/models/UserProgress";
import { Etype } from "@/types";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get users leaderboard with rankings and statistics
 *     description: |
 *       Retrieves a comprehensive list of users with their statistics, rankings, and progress data.
 *       Combines data from Clerk authentication service and internal database to provide
 *       complete user profiles including XP, gems, gel, country information, and rankings.
 *       Supports filtering by time period, search queries, and result limiting.
 *       Requires user authentication.
 *     tags:
 *       - Users
 *       - Leaderboard
 *       - Statistics
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *           default: 50
 *         description: Maximum number of users to return
 *         example: 50
 *       - in: query
 *         name: timeFilter
 *         schema:
 *           type: string
 *           enum: [week, month, allTime]
 *           default: allTime
 *         description: Filter users by activity time period
 *         example: "month"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search users by username, name, or country
 *         example: "john"
 *     responses:
 *       '200':
 *         description: Successfully retrieved users leaderboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersLeaderboardResponse'
 *             examples:
 *               leaderboardData:
 *                 summary: Complete users leaderboard
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "user_2abc123def456"
 *                       username: "language_master"
 *                       name: "John Smith"
 *                       email: "john.smith@example.com"
 *                       avatar: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yYWJjMTIzZGVmNDU2In0"
 *                       country: "United States"
 *                       countryFlag: "🇺🇸"
 *                       xp: 15750
 *                       gems: 2340
 *                       gel: 890
 *                       lastActivity: "2024-01-20T14:30:00Z"
 *                       createdAt: "2024-01-01T10:00:00Z"
 *                       rank: 1
 *                     - id: "user_3def456ghi789"
 *                       username: "polyglot_pro"
 *                       name: "Maria Garcia"
 *                       email: "maria.garcia@example.com"
 *                       avatar: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18zZGVmNDU2Z2hpNzg5In0"
 *                       country: "Spain"
 *                       countryFlag: "🇪🇸"
 *                       xp: 14200
 *                       gems: 1980
 *                       gel: 750
 *                       lastActivity: "2024-01-20T12:15:00Z"
 *                       createdAt: "2024-01-02T08:30:00Z"
 *                       rank: 2
 *                     - id: "user_4ghi789jkl012"
 *                       username: "student_alex"
 *                       name: "Alex Johnson"
 *                       email: "alex.johnson@example.com"
 *                       avatar: "https://cdn-icons-png.flaticon.com/128/4322/4322991.png"
 *                       country: "Canada"
 *                       countryFlag: "🇨🇦"
 *                       xp: 12850
 *                       gems: 1650
 *                       gel: 620
 *                       lastActivity: "2024-01-19T20:45:00Z"
 *                       createdAt: "2024-01-03T14:20:00Z"
 *                       rank: 3
 *                     - id: "user_5jkl012mno345"
 *                       username: "beginner_learner"
 *                       name: "Sarah Wilson"
 *                       email: "sarah.wilson@example.com"
 *                       avatar: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ181amtsMDEybW5vMzQ1In0"
 *                       country: "United Kingdom"
 *                       countryFlag: "🇬🇧"
 *                       xp: 8950
 *                       gems: 1200
 *                       gel: 450
 *                       lastActivity: "2024-01-20T09:30:00Z"
 *                       createdAt: "2024-01-05T11:15:00Z"
 *                       rank: 4
 *                   total: 127
 *                   timeFilter: "allTime"
 *                   search: ""
 *               weeklyLeaderboard:
 *                 summary: Weekly leaderboard with time filter
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "user_2abc123def456"
 *                       username: "language_master"
 *                       xp: 2450
 *                       rank: 1
 *                     - id: "user_3def456ghi789"
 *                       username: "polyglot_pro"
 *                       xp: 1890
 *                       rank: 2
 *                   total: 45
 *                   timeFilter: "week"
 *                   search: ""
 *               searchResults:
 *                 summary: Search results for specific query
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "user_2abc123def456"
 *                       username: "john_doe"
 *                       name: "John Doe"
 *                       country: "United States"
 *                       xp: 15750
 *                       rank: 1
 *                   total: 3
 *                   timeFilter: "allTime"
 *                   search: "john"
 *               emptyResults:
 *                 summary: No users found
 *                 value:
 *                   success: true
 *                   data: []
 *                   total: 0
 *                   timeFilter: "allTime"
 *                   search: "nonexistent"
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   error: "Failed to fetch leaderboard data"
 *                   details: "Database connection failed"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LeaderboardUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique Clerk user identifier
 *           example: "user_2abc123def456"
 *         username:
 *           type: string
 *           description: User's display username
 *           example: "language_master"
 *         name:
 *           type: string
 *           description: User's full name
 *           example: "John Smith"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.smith@example.com"
 *         avatar:
 *           type: string
 *           format: uri
 *           description: URL to user's profile picture
 *           example: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yYWJjMTIzZGVmNDU2In0"
 *         country:
 *           type: string
 *           description: User's country
 *           example: "United States"
 *         countryFlag:
 *           type: string
 *           description: Country flag emoji
 *           example: "🇺🇸"
 *         xp:
 *           type: integer
 *           minimum: 0
 *           description: Total experience points (base + progress)
 *           example: 15750
 *         gems:
 *           type: integer
 *           minimum: 0
 *           description: Total gems (base + earned)
 *           example: 2340
 *         gel:
 *           type: integer
 *           minimum: 0
 *           description: Total gel currency (base + earned)
 *           example: 890
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last activity timestamp
 *           example: "2024-01-20T14:30:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *           example: "2024-01-01T10:00:00Z"
 *         rank:
 *           type: integer
 *           minimum: 1
 *           description: User's rank in the leaderboard
 *           example: 1
 *
 *     UsersLeaderboardData:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LeaderboardUser'
 *           description: Array of users in leaderboard order
 *         total:
 *           type: integer
 *           description: Total number of users matching the criteria
 *           example: 127
 *         timeFilter:
 *           type: string
 *           description: Applied time filter
 *           example: "allTime"
 *         search:
 *           type: string
 *           description: Applied search query
 *           example: ""
 *
 *     UsersLeaderboardResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/UsersLeaderboardData'
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
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Failed to fetch leaderboard data"
 *         details:
 *           type: string
 *           description: Detailed error information
 *           example: "Database connection failed"
 *
 *   examples:
 *     UsersApiUsageExample:
 *       summary: How to use the Users API with Axios
 *       description: |
 *         **Step 1: Fetch Users Leaderboard with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const fetchUsersLeaderboard = async (options = {}) => {
 *           try {
 *             const {
 *               limit = 50,
 *               timeFilter = 'allTime',
 *               search = ''
 *             } = options;
 *
 *             const response = await axios.get('/api/users', {
 *               params: {
 *                 limit,
 *                 timeFilter,
 *                 search
 *               },
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to fetch users');
 *             }
 *           } catch (error) {
 *             console.error('Failed to fetch users leaderboard:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const allUsers = await fetchUsersLeaderboard();
 *         const top10 = await fetchUsersLeaderboard({ limit: 10 });
 *         const weeklyTop = await fetchUsersLeaderboard({ timeFilter: 'week', limit: 20 });
 *         const searchResults = await fetchUsersLeaderboard({ search: 'john' });
 *         ```
 *
 *         **Step 2: Process and Display Leaderboard Data**
 *         ```javascript
 *         const displayLeaderboard = async (options = {}) => {
 *           try {
 *             const leaderboardData = await fetchUsersLeaderboard(options);
 *             const { data: users, total, timeFilter, search } = leaderboardData;
 *
 *             console.log(`LEADERBOARD (${timeFilter.toUpperCase()})`);
 *             if (search) {
 *               console.log(`Search: "${search}"`);
 *             }
 *             console.log(`Showing ${users.length} of ${total} users`);
 *             console.log('='.repeat(80));
 *
 *             users.forEach((user, index) => {
 *               const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : '  ';
 *               console.log(`${medal} #${user.rank} ${user.countryFlag} ${user.username}`);
 *               console.log(`     Name: ${user.name}`);
 *               console.log(`     XP: ${user.xp.toLocaleString()}`);
 *               console.log(`     Gems: ${user.gems.toLocaleString()}`);
 *               console.log(`     Gel: ${user.gel.toLocaleString()}`);
 *               console.log(`     Country: ${user.country}`);
 *
 *               if (user.lastActivity) {
 *                 const lastActive = new Date(user.lastActivity);
 *                 const daysAgo = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
 *                 console.log(`     Last Active: ${daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}`);
 *               }
 *
 *               const memberSince = new Date(user.createdAt);
 *               console.log(`     Member Since: ${memberSince.toLocaleDateString()}`);
 *               console.log('');
 *             });
 *
 *             // Display statistics
 *             if (users.length > 0) {
 *               const totalXP = users.reduce((sum, user) => sum + user.xp, 0);
 *               const avgXP = Math.round(totalXP / users.length);
 *               const topXP = users[0].xp;
 *               const countries = [...new Set(users.map(user => user.country))];
 *
 *               console.log('STATISTICS:');
 *               console.log(`  Total XP: ${totalXP.toLocaleString()}`);
 *               console.log(`  Average XP: ${avgXP.toLocaleString()}`);
 *               console.log(`  Top XP: ${topXP.toLocaleString()}`);
 *               console.log(`  Countries Represented: ${countries.length}`);
 *               console.log(`  Most Common Countries: ${getMostCommonCountries(users).join(', ')}`);
 *             }
 *
 *             return leaderboardData;
 *           } catch (error) {
 *             console.error('Error displaying leaderboard:', error);
 *           }
 *         };
 *
 *         const getMostCommonCountries = (users) => {
 *           const countryCounts = users.reduce((acc, user) => {
 *             acc[user.country] = (acc[user.country] || 0) + 1;
 *             return acc;
 *           }, {});
 *
 *           return Object.entries(countryCounts)
 *             .sort(([,a], [,b]) => b - a)
 *             .slice(0, 3)
 *             .map(([country]) => country);
 *         };
 *         ```
 *
 *         **Step 3: Create a Users Service**
 *         ```javascript
 *         class UsersService {
 *           constructor() {
 *             this.client = axios.create({
 *               baseURL: '/api',
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             this.setupInterceptors();
 *             this.cache = new Map();
 *             this.cacheTimeout = 2 * 60 * 1000; // 2 minutes for leaderboard
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
 *           getCacheKey(options) {
 *             return JSON.stringify(options || {});
 *           }
 *
 *           async getLeaderboard(options = {}, useCache = true) {
 *             const cacheKey = this.getCacheKey(options);
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
 *               const response = await this.client.get('/users', {
 *                 params: options
 *               });
 *
 *               if (response.data.success) {
 *                 // Cache the result
 *                 this.cache.set(cacheKey, {
 *                   data: response.data,
 *                   timestamp: Date.now()
 *                 });
 *
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to fetch leaderboard');
 *               }
 *             } catch (error) {
 *               console.error('Users service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async getTopUsers(limit = 10, timeFilter = 'allTime') {
 *             const data = await this.getLeaderboard({ limit, timeFilter });
 *             return data.data;
 *           }
 *
 *           async searchUsers(query, limit = 20) {
 *             const data = await this.getLeaderboard({ search: query, limit });
 *             return data.data;
 *           }
 *
 *           async getUserRank(userId) {
 *             const data = await this.getLeaderboard({ limit: 500 });
 *             const user = data.data.find(u => u.id === userId);
 *             return user ? user.rank : null;
 *           }
 *
 *           async getWeeklyLeaders(limit = 10) {
 *             return this.getTopUsers(limit, 'week');
 *           }
 *
 *           async getMonthlyLeaders(limit = 10) {
 *             return this.getTopUsers(limit, 'month');
 *           }
 *
 *           async getCountryLeaderboard(country, limit = 20) {
 *             const data = await this.getLeaderboard({ limit: 500 });
 *             const countryUsers = data.data
 *               .filter(user => user.country.toLowerCase() === country.toLowerCase())
 *               .slice(0, limit)
 *               .map((user, index) => ({ ...user, countryRank: index + 1 }));
 *
 *             return countryUsers;
 *           }
 *
 *           async getLeaderboardStats() {
 *             const data = await this.getLeaderboard({ limit: 500 });
 *             const users = data.data;
 *
 *             if (users.length === 0) {
 *               return null;
 *             }
 *
 *             const totalXP = users.reduce((sum, user) => sum + user.xp, 0);
 *             const totalGems = users.reduce((sum, user) => sum + user.gems, 0);
 *             const totalGel = users.reduce((sum, user) => sum + user.gel, 0);
 *
 *             const countries = users.reduce((acc, user) => {
 *               acc[user.country] = (acc[user.country] || 0) + 1;
 *               return acc;
 *             }, {});
 *
 *             const topCountries = Object.entries(countries)
 *               .sort(([,a], [,b]) => b - a)
 *               .slice(0, 5)
 *               .map(([country, count]) => ({ country, count }));
 *
 *             return {
 *               totalUsers: users.length,
 *               totalXP,
 *               totalGems,
 *               totalGel,
 *               averageXP: Math.round(totalXP / users.length),
 *               averageGems: Math.round(totalGems / users.length),
 *               averageGel: Math.round(totalGel / users.length),
 *               topXP: users[0]?.xp || 0,
 *               countriesCount: Object.keys(countries).length,
 *               topCountries,
 *               activeUsers: users.filter(user => {
 *                 if (!user.lastActivity) return false;
 *                 const daysSinceActive = (Date.now() - new Date(user.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
 *                 return daysSinceActive <= 7;
 *               }).length
 *             };
 *           }
 *
 *           // Helper methods
 *           formatXP(xp) {
 *             if (xp >= 1000000) {
 *               return `${(xp / 1000000).toFixed(1)}M`;
 *             } else if (xp >= 1000) {
 *               return `${(xp / 1000).toFixed(1)}K`;
 *             }
 *             return xp.toString();
 *           }
 *
 *           getCountryFlag(countryCode) {
 *             const flagMap = {
 *               'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'DE': '🇩🇪',
 *               'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹', 'JP': '🇯🇵',
 *               'CN': '🇨🇳', 'IN': '🇮🇳', 'BR': '🇧🇷', 'MX': '🇲🇽'
 *             };
 *             return flagMap[countryCode] || '🌍';
 *           }
 *
 *           clearCache() {
 *             this.cache.clear();
 *           }
 *         }
 *
 *         export const usersService = new UsersService();
 *         ```
 *
 *     ReactUsersLeaderboardExample:
 *       summary: React component for users leaderboard
 *       description: |
 *         ```typescript
 *         import React, { useState, useEffect } from 'react';
 *         import axios from 'axios';
 *
 *         interface LeaderboardUser {
 *           id: string;
 *           username: string;
 *           name: string;
 *           email: string;
 *           avatar: string;
 *           country: string;
 *           countryFlag: string;
 *           xp: number;
 *           gems: number;
 *           gel: number;
 *           lastActivity: string | null;
 *           createdAt: string;
 *           rank: number;
 *         }
 *
 *         interface LeaderboardFilters {
 *           timeFilter: 'week' | 'month' | 'allTime';
 *           search: string;
 *           limit: number;
 *         }
 *
 *         export function UsersLeaderboard() {
 *           const [users, setUsers] = useState<LeaderboardUser[]>([]);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState<string | null>(null);
 *           const [total, setTotal] = useState(0);
 *           const [filters, setFilters] = useState<LeaderboardFilters>({
 *             timeFilter: 'allTime',
 *             search: '',
 *             limit: 50
 *           });
 *
 *           useEffect(() => {
 *             fetchLeaderboard();
 *           }, [filters]);
 *
 *           const fetchLeaderboard = async () => {
 *             try {
 *               setLoading(true);
 *               setError(null);
 *
 *               const response = await axios.get('/api/users', {
 *                 params: filters
 *               });
 *
 *               if (response.data.success) {
 *                 setUsers(response.data.data);
 *                 setTotal(response.data.total);
 *               } else {
 *                 setError(response.data.error || 'Failed to fetch leaderboard');
 *               }
 *             } catch (err) {
 *               if (axios.isAxiosError(err)) {
 *                 if (err.response?.status === 401) {
 *                   setError('Please log in to view the leaderboard');
 *                 } else {
 *                   setError(err.response?.data?.error || 'Failed to fetch leaderboard');
 *                 }
 *               } else {
 *                 setError('An unexpected error occurred');
 *               }
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           const handleFilterChange = (newFilters: Partial<LeaderboardFilters>) => {
 *             setFilters(prev => ({ ...prev, ...newFilters }));
 *           };
 *
 *           const formatXP = (xp: number) => {
 *             if (xp >= 1000000) {
 *               return `${(xp / 1000000).toFixed(1)}M`;
 *             } else if (xp >= 1000) {
 *               return `${(xp / 1000).toFixed(1)}K`;
 *             }
 *             return xp.toLocaleString();
 *           };
 *
 *           const getLastActivityText = (lastActivity: string | null) => {
 *             if (!lastActivity) return 'Never';
 *
 *             const now = new Date();
 *             const activity = new Date(lastActivity);
 *             const diffInDays = Math.floor((now.getTime() - activity.getTime()) / (1000 * 60 * 60 * 24));
 *
 *             if (diffInDays === 0) return 'Today';
 *             if (diffInDays === 1) return 'Yesterday';
 *             if (diffInDays < 7) return `${diffInDays} days ago`;
 *             if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
 *             return `${Math.floor(diffInDays / 30)} months ago`;
 *           };
 *
 *           const getRankMedal = (rank: number) => {
 *             switch (rank) {
 *               case 1: return '🥇';
 *               case 2: return '🥈';
 *               case 3: return '🥉';
 *               default: return null;
 *             }
 *           };
 *
 *           if (loading) {
 *             return <div className="leaderboard-loading">Loading leaderboard...</div>;
 *           }
 *
 *           if (error) {
 *             return (
 *               <div className="leaderboard-error">
 *                 <h2>Error</h2>
 *                 <p>{error}</p>
 *                 <button onClick={fetchLeaderboard} className="retry-button">
 *                   Try Again
 *                 </button>
 *               </div>
 *             );
 *           }
 *
 *           return (
 *             <div className="users-leaderboard">
 *               <div className="leaderboard-header">
 *                 <h2>Leaderboard</h2>
 *                 <p>Showing {users.length} of {total} users</p>
 *               </div>
 *
 *               <div className="leaderboard-filters">
 *                 <div className="time-filter">
 *                   <label>Time Period:</label>
 *                   <select
 *                     value={filters.timeFilter}
 *                     onChange={(e) => handleFilterChange({
 *                       timeFilter: e.target.value as LeaderboardFilters['timeFilter']
 *                     })}
 *                   >
 *                     <option value="allTime">All Time</option>
 *                     <option value="month">This Month</option>
 *                     <option value="week">This Week</option>
 *                   </select>
 *                 </div>
 *
 *                 <div className="search-filter">
 *                   <input
 *                     type="text"
 *                     placeholder="Search users..."
 *                     value={filters.search}
 *                     onChange={(e) => handleFilterChange({ search: e.target.value })}
 *                   />
 *                 </div>
 *
 *                 <div className="limit-filter">
 *                   <label>Show:</label>
 *                   <select
 *                     value={filters.limit}
 *                     onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
 *                   >
 *                     <option value={10}>Top 10</option>
 *                     <option value={25}>Top 25</option>
 *                     <option value={50}>Top 50</option>
 *                     <option value={100}>Top 100</option>
 *                   </select>
 *                 </div>
 *               </div>
 *
 *               <div className="leaderboard-list">
 *                 {users.map((user) => (
 *                   <div key={user.id} className={`user-card rank-${user.rank <= 3 ? user.rank : 'other'}`}>
 *                     <div className="user-rank">
 *                       <span className="rank-number">#{user.rank}</span>
 *                       {getRankMedal(user.rank) && (
 *                         <span className="rank-medal">{getRankMedal(user.rank)}</span>
 *                       )}
 *                     </div>
 *
 *                     <div className="user-avatar">
 *                       <img src={user.avatar || "/placeholder.svg"} alt={user.username} />
 *                     </div>
 *
 *                     <div className="user-info">
 *                       <div className="user-identity">
 *                         <h3 className="username">{user.username}</h3>
 *                         <p className="name">{user.name}</p>
 *                         <div className="country">
 *                           <span className="flag">{user.countryFlag}</span>
 *                           <span className="country-name">{user.country}</span>
 *                         </div>
 *                       </div>
 *
 *                       <div className="user-stats">
 *                         <div className="stat">
 *                           <span className="stat-label">XP</span>
 *                           <span className="stat-value">{formatXP(user.xp)}</span>
 *                         </div>
 *                         <div className="stat">
 *                           <span className="stat-label">Gems</span>
 *                           <span className="stat-value">{user.gems.toLocaleString()}</span>
 *                         </div>
 *                         <div className="stat">
 *                           <span className="stat-label">Gel</span>
 *                           <span className="stat-value">{user.gel.toLocaleString()}</span>
 *                         </div>
 *                       </div>
 *
 *                       <div className="user-activity">
 *                         <div className="last-activity">
 *                           <span className="activity-label">Last Active:</span>
 *                           <span className="activity-value">
 *                             {getLastActivityText(user.lastActivity)}
 *                           </span>
 *                         </div>
 *                         <div className="member-since">
 *                           <span className="member-label">Member Since:</span>
 *                           <span className="member-value">
 *                             {new Date(user.createdAt).toLocaleDateString()}
 *                           </span>
 *                         </div>
 *                       </div>
 *                     </div>
 *                   </div>
 *                 ))}
 *               </div>
 *
 *               {users.length === 0 && (
 *                 <div className="no-users">
 *                   <p>No users found matching your criteria.</p>
 *                 </div>
 *               )}
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Users
 *     description: Operations for managing and retrieving user information
 *   - name: Leaderboard
 *     description: User rankings and leaderboard functionality
 *   - name: Statistics
 *     description: User statistics and progress tracking
 */
export async function GET(request: Request) {
  try {
    // Check if the user is authenticated and has admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "50");
    const timeFilter = searchParams.get("timeFilter") || "allTime"; // week, month, allTime
    const search = searchParams.get("search") || "";

    // Get all users from Clerk
    const clerkAwait = await clerkClient();
    const clerkUsers = await clerkAwait.users.getUserList({
      limit: 500, // Adjust based on your needs
    });

    // Process each user and get their data
    const leaderboardData = await Promise.all(
      clerkUsers.data.map(async (clerkUser) => {
        try {
          // Get user from database
          const dbUser = await User.findByClerkId(clerkUser.id);

          // Get user progress totals
          const progressData = await UserProgress.getTotalStats(clerkUser.id);

          // Extract data from Clerk public metadata
          const publicMetadata = clerkUser.publicMetadata as Etype;

          // Calculate total XP (base XP + progress XP)
          const baseXp = dbUser?.xp || 0;
          const progressXp = progressData.totalXp || 0;
          const totalXp = baseXp + progressXp;

          // Calculate total gems and gel
          const baseGems = dbUser?.gems || 0;
          const progressGems = progressData.totalGems || 0;
          const totalGems = baseGems + progressGems;

          const baseGel = dbUser?.gel || 0;
          const progressGel = progressData.totalGel || 0;
          const totalGel = baseGel + progressGel;

          // Get current streak (prioritize progress data, fallback to base user data)
          // Get current streak (prioritize progress data, fallback to base user data)

          return {
            id: clerkUser.id,
            username:
              publicMetadata?.userName || clerkUser.username || "Anonymous",
            name:
              publicMetadata?.name ||
              `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
            email:
              publicMetadata?.email ||
              clerkUser.emailAddresses[0]?.emailAddress,
            avatar:
              publicMetadata?.avatar ||
              clerkUser.imageUrl ||
              "https://cdn-icons-png.flaticon.com/128/4322/4322991.png",
            country: publicMetadata?.country || "Unknown",
            countryFlag: getCountryFlag(publicMetadata?.country || "US"),
            xp: totalXp,
            gems: totalGems,
            gel: totalGel,
            lastActivity: null,
            createdAt: clerkUser.createdAt,
          };
        } catch (error) {
          console.error(`Error processing user ${clerkUser.id}:`, error);
          // Return minimal data if there's an error
          return {
            id: clerkUser.id,
            username: clerkUser.username || "Anonymous",
            name: `${clerkUser.firstName || ""} ${
              clerkUser.lastName || ""
            }`.trim(),
            email: clerkUser.emailAddresses[0]?.emailAddress,
            avatar:
              clerkUser.imageUrl ||
              "https://cdn-icons-png.flaticon.com/128/4322/4322991.png",
            country: "Unknown",
            countryFlag: "🌍",
            xp: 0,
            gems: 0,
            gel: 0,
            lastActivity: null,
            createdAt: clerkUser.createdAt,
          };
        }
      })
    );

    // Filter by time period if specified
    let filteredData = leaderboardData;
    if (timeFilter !== "allTime") {
      const now = new Date();
      let cutoffDate: Date;

      if (timeFilter === "week") {
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (timeFilter === "month") {
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        cutoffDate = new Date(0); // Beginning of time
      }

      filteredData = leaderboardData.filter(
        (user) => user.lastActivity && new Date(user.lastActivity) >= cutoffDate
      );
    }

    // Filter by search query if provided
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = filteredData.filter(
        (user) =>
          user.username.toLowerCase().includes(searchLower) ||
          user.name.toLowerCase().includes(searchLower) ||
          user.country.toLowerCase().includes(searchLower)
      );
    }

    // Sort by XP (descending)
    filteredData.sort((a, b) => b.xp - a.xp);

    // Limit results
    const limitedData = filteredData.slice(0, limit);

    // Add rank to each user
    const rankedData = limitedData.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      data: rankedData,
      total: filteredData.length,
      timeFilter,
      search,
    });
  } catch (error) {
    console.error("Error fetching leaderboard data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leaderboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to get country flag emoji
function getCountryFlag(countryCode: string): string {
  const flagMap: Record<string, string> = {
    US: "🇺🇸",
    FR: "🇫🇷",
    ES: "🇪🇸",
    IT: "🇮🇹",
    DE: "🇩🇪",
    GB: "🇬🇧",
    UK: "🇬🇧",
    CA: "🇨🇦",
    AU: "🇦🇺",
    JP: "🇯🇵",
    BR: "🇧🇷",
    MX: "🇲🇽",
    IN: "🇮🇳",
    CN: "🇨🇳",
    RU: "🇷🇺",
    KR: "🇰🇷",
    NL: "🇳🇱",
    SE: "🇸🇪",
    NO: "🇳🇴",
    DK: "🇩🇰",
    FI: "🇫🇮",
    PT: "🇵🇹",
    PL: "🇵🇱",
    TR: "🇹🇷",
    GR: "🇬🇷",
    CH: "🇨🇭",
    AT: "🇦🇹",
    BE: "🇧🇪",
    IE: "🇮🇪",
    NZ: "🇳🇿",
    ZA: "🇿🇦",
    AR: "🇦🇷",
    CL: "🇨🇱",
    CO: "🇨🇴",
    PE: "🇵🇪",
    VE: "🇻🇪",
    EG: "🇪🇬",
    SA: "🇸🇦",
    AE: "🇦🇪",
    IL: "🇮🇱",
    TH: "🇹🇭",
    VN: "🇻🇳",
    PH: "🇵🇭",
    MY: "🇲🇾",
    SG: "🇸🇬",
    ID: "🇮🇩",
  };

  return flagMap[countryCode.toUpperCase()] || "🌍";
}
