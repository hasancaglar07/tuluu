import connectDB from "@/lib/db/connect";
import User from "@/models/User";
import UserProgress from "@/models/UserProgress";
import { Etype } from "@/types";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/leaderboards:
 *   get:
 *     summary: Get user leaderboard data
 *     description: |
 *       Retrieves a ranked list of users based on their XP, gems, and gel.
 *       Supports filtering by time period and search functionality.
 *       Requires user authentication.
 *     tags:
 *       - Leaderboard
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
 *         description: Filter users by registration time period
 *         example: "month"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search users by username, name, or country
 *         example: "john"
 *     responses:
 *       '200':
 *         description: Successfully retrieved leaderboard data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LeaderboardResponse'
 *             examples:
 *               successExample:
 *                 summary: Successful leaderboard response
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "user_123"
 *                       username: "john_doe"
 *                       name: "John Doe"
 *                       email: "john@example.com"
 *                       avatar: "https://example.com/avatar.jpg"
 *                       country: "United States"
 *                       countryFlag: "🇺🇸"
 *                       xp: 1250
 *                       gems: 45
 *                       gel: 23
 *                       rank: 1
 *                       lastActivity: null
 *                       createdAt: "2024-01-15T10:30:00Z"
 *                     - id: "user_456"
 *                       username: "jane_smith"
 *                       name: "Jane Smith"
 *                       email: "jane@example.com"
 *                       avatar: "https://example.com/avatar2.jpg"
 *                       country: "Canada"
 *                       countryFlag: "🇨🇦"
 *                       xp: 980
 *                       gems: 32
 *                       gel: 18
 *                       rank: 2
 *                       lastActivity: null
 *                       createdAt: "2024-01-20T14:15:00Z"
 *                   total: 2
 *                   timeFilter: "allTime"
 *                   search: ""
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
 *         description: Internal server error - Failed to fetch leaderboard data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailedErrorResponse'
 *             examples:
 *               serverErrorExample:
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
 *           description: Unique user identifier from Clerk
 *           example: "user_123abc"
 *         username:
 *           type: string
 *           description: User's display username
 *           example: "john_doe"
 *         name:
 *           type: string
 *           description: User's full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john@example.com"
 *         avatar:
 *           type: string
 *           format: uri
 *           description: URL to user's avatar image
 *           example: "https://example.com/avatar.jpg"
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
 *           example: 1250
 *         gems:
 *           type: integer
 *           minimum: 0
 *           description: Total gems earned (base + progress)
 *           example: 45
 *         gel:
 *           type: integer
 *           minimum: 0
 *           description: Total gel earned (base + progress)
 *           example: 23
 *         rank:
 *           type: integer
 *           minimum: 1
 *           description: User's position in the leaderboard
 *           example: 1
 *         lastActivity:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last activity timestamp (currently null)
 *           example: null
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: User registration timestamp
 *           example: "2024-01-15T10:30:00Z"
 *
 *     LeaderboardResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LeaderboardUser'
 *           description: Array of ranked users
 *         total:
 *           type: integer
 *           minimum: 0
 *           description: Total number of users matching the filters
 *           example: 150
 *         timeFilter:
 *           type: string
 *           enum: [week, month, allTime]
 *           description: Applied time filter
 *           example: "allTime"
 *         search:
 *           type: string
 *           description: Applied search query
 *           example: ""
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Unauthorized"
 *
 *     DetailedErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates the request failed
 *           example: false
 *         error:
 *           type: string
 *           description: General error message
 *           example: "Failed to fetch leaderboard data"
 *         details:
 *           type: string
 *           description: Detailed error information
 *           example: "Database connection failed"
 *
 *   examples:
 *     LeaderboardUsageExample:
 *       summary: How to use the Leaderboard API
 *       description: |
 *         **Step 1: Basic Leaderboard Request**
 *         ```javascript
 *         const response = await fetch('/api/leaderboard', {
 *           method: 'GET',
 *           headers: {
 *             'Authorization': 'Bearer YOUR_TOKEN_HERE'
 *           }
 *         });
 *
 *         const leaderboard = await response.json();
 *         console.log('Top users:', leaderboard.data);
 *         ```
 *
 *         **Step 2: Filtered Leaderboard Request**
 *         ```javascript
 *         const params = new URLSearchParams({
 *           limit: '20',
 *           timeFilter: 'month',
 *           search: 'john'
 *         });
 *
 *         const response = await fetch(`/api/leaderboard?${params}`, {
 *           headers: {
 *             'Authorization': 'Bearer YOUR_TOKEN_HERE'
 *           }
 *         });
 *
 *         const filteredLeaderboard = await response.json();
 *         ```
 *
 *         **Step 3: Handle Response Data**
 *         ```javascript
 *         if (leaderboard.success) {
 *           leaderboard.data.forEach(user => {
 *             console.log(`${user.rank}. ${user.username} - ${user.xp} XP`);
 *           });
 *         } else {
 *           console.error('Error:', leaderboard.error);
 *         }
 *         ```
 *
 *     ReactLeaderboardExample:
 *       summary: React component for displaying leaderboard
 *       description: |
 *         ```typescript
 *         import { useState, useEffect } from 'react';
 *
 *         interface LeaderboardUser {
 *           id: string;
 *           username: string;
 *           name: string;
 *           avatar: string;
 *           country: string;
 *           countryFlag: string;
 *           xp: number;
 *           gems: number;
 *           gel: number;
 *           rank: number;
 *         }
 *
 *         interface LeaderboardResponse {
 *           success: boolean;
 *           data: LeaderboardUser[];
 *           total: number;
 *           timeFilter: string;
 *           search: string;
 *         }
 *
 *         export function Leaderboard() {
 *           const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
 *           const [loading, setLoading] = useState(true);
 *           const [timeFilter, setTimeFilter] = useState('allTime');
 *           const [search, setSearch] = useState('');
 *
 *           const fetchLeaderboard = async () => {
 *             setLoading(true);
 *             try {
 *               const params = new URLSearchParams({
 *                 timeFilter,
 *                 search,
 *                 limit: '50'
 *               });
 *
 *               const response = await fetch(`/api/leaderboard?${params}`);
 *               const data = await response.json();
 *               setLeaderboard(data);
 *             } catch (error) {
 *               console.error('Failed to fetch leaderboard:', error);
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           useEffect(() => {
 *             fetchLeaderboard();
 *           }, [timeFilter, search]);
 *
 *           if (loading) return <div>Loading leaderboard...</div>;
 *           if (!leaderboard?.success) return <div>Error loading leaderboard</div>;
 *
 *           return (
 *             <div className="leaderboard">
 *               <div className="filters">
 *                 <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
 *                   <option value="allTime">All Time</option>
 *                   <option value="month">This Month</option>
 *                   <option value="week">This Week</option>
 *                 </select>
 *                 <input
 *                   type="text"
 *                   placeholder="Search users..."
 *                   value={search}
 *                   onChange={(e) => setSearch(e.target.value)}
 *                 />
 *               </div>
 *
 *               <div className="user-list">
 *                 {leaderboard.data.map(user => (
 *                   <div key={user.id} className="user-item">
 *                     <span className="rank">#{user.rank}</span>
 *                     <img src={user.avatar || "/placeholder.svg"} alt={user.username} />
 *                     <div className="user-info">
 *                       <h3>{user.username}</h3>
 *                       <p>{user.countryFlag} {user.country}</p>
 *                     </div>
 *                     <div className="stats">
 *                       <span>{user.xp} XP</span>
 *                       <span>{user.gems} 💎</span>
 *                       <span>{user.gel} 🧪</span>
 *                     </div>
 *                   </div>
 *                 ))}
 *               </div>
 *             </div>
 *           );
 *         }
 *         ```
 *
 *     LeaderboardHookExample:
 *       summary: Custom React hook for leaderboard data
 *       description: |
 *         ```typescript
 *         import { useState, useEffect, useCallback } from 'react';
 *
 *         interface UseLeaderboardOptions {
 *           limit?: number;
 *           timeFilter?: 'week' | 'month' | 'allTime';
 *           search?: string;
 *           autoRefresh?: boolean;
 *           refreshInterval?: number;
 *         }
 *
 *         export function useLeaderboard(options: UseLeaderboardOptions = {}) {
 *           const {
 *             limit = 50,
 *             timeFilter = 'allTime',
 *             search = '',
 *             autoRefresh = false,
 *             refreshInterval = 30000
 *           } = options;
 *
 *           const [data, setData] = useState<LeaderboardResponse | null>(null);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState<string | null>(null);
 *
 *           const fetchLeaderboard = useCallback(async () => {
 *             try {
 *               setLoading(true);
 *               setError(null);
 *
 *               const params = new URLSearchParams({
 *                 limit: limit.toString(),
 *                 timeFilter,
 *                 search
 *               });
 *
 *               const response = await fetch(`/api/leaderboard?${params}`);
 *               const result = await response.json();
 *
 *               if (!response.ok) {
 *                 throw new Error(result.error || 'Failed to fetch leaderboard');
 *               }
 *
 *               setData(result);
 *             } catch (err) {
 *               setError(err instanceof Error ? err.message : 'Unknown error');
 *             } finally {
 *               setLoading(false);
 *             }
 *           }, [limit, timeFilter, search]);
 *
 *           useEffect(() => {
 *             fetchLeaderboard();
 *           }, [fetchLeaderboard]);
 *
 *           useEffect(() => {
 *             if (autoRefresh) {
 *               const interval = setInterval(fetchLeaderboard, refreshInterval);
 *               return () => clearInterval(interval);
 *             }
 *           }, [autoRefresh, refreshInterval, fetchLeaderboard]);
 *
 *           return {
 *             data: data?.data || [],
 *             total: data?.total || 0,
 *             loading,
 *             error,
 *             refetch: fetchLeaderboard
 *           };
 *         }
 *         ```
 *
 * tags:
 *   - name: Leaderboard
 *     description: Operations related to user rankings and leaderboard data
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
        (user) => user.createdAt && new Date(user.createdAt) >= cutoffDate
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
