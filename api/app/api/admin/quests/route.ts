import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import Quest, { QuestDocument } from "@/models/Quest";
import UserQuest from "@/models/UserQuest";
import { CreateQuestSchema, QuestSearchSchema } from "@/lib/validations/quest";
import { FilterQuery } from "mongoose";
import { authGuard } from "@/lib/utils";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     QuestsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TransformedQuest'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationInfo'
 *         summary:
 *           $ref: '#/components/schemas/QuestSummary'
 *     QuestCreateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/TransformedQuest'
 *         message:
 *           type: string
 *           example: "Quest created successfully"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: "Failed to fetch quests"
 *         details:
 *           type: string
 *           example: "Database connection error"
 *         message:
 *           type: string
 *           example: "Validation error"
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *           example:
 *             "title": ["Title is required"]
 *             "startDate": ["Start date must be in the future"]
 *     TransformedQuest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *         title:
 *           type: string
 *           example: "Complete 5 Lessons"
 *         description:
 *           type: string
 *           example: "Complete 5 lessons in any language to earn XP"
 *         type:
 *           type: string
 *           enum: [daily, weekly, monthly, special, achievement]
 *           example: "daily"
 *         goal:
 *           type: string
 *           example: "Complete 5 lessons"
 *         reward:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [xp, gems, hearts, badge, streak_freeze]
 *               example: "xp"
 *             value:
 *               type: number
 *               example: 50
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T00:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2023-06-16T23:59:59Z"
 *         status:
 *           type: string
 *           enum: [draft, active, paused, completed, archived]
 *           example: "active"
 *         targetSegment:
 *           type: string
 *           enum: [all, new_users, active_users, premium_users, inactive_users]
 *           example: "all"
 *         completionRate:
 *           type: number
 *           example: 75
 *           description: "Completion rate as percentage"
 *         usersAssigned:
 *           type: number
 *           example: 1000
 *         usersCompleted:
 *           type: number
 *           example: 750
 *         usersStarted:
 *           type: number
 *           example: 850
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard, expert]
 *           example: "medium"
 *         category:
 *           type: string
 *           enum: [learning, social, achievement, daily, weekly, special]
 *           example: "learning"
 *         priority:
 *           type: number
 *           example: 1
 *           description: "Priority for quest ordering (higher = more important)"
 *         isVisible:
 *           type: boolean
 *           example: true
 *         isFeatured:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T14:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T14:30:00Z"
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         page:
 *           type: number
 *           example: 1
 *         limit:
 *           type: number
 *           example: 50
 *         total:
 *           type: number
 *           example: 150
 *         pages:
 *           type: number
 *           example: 3
 *     QuestSummary:
 *       type: object
 *       properties:
 *         totalActiveQuests:
 *           type: number
 *           example: 25
 *         totalUpcomingQuests:
 *           type: number
 *           example: 5
 *         averageCompletionRate:
 *           type: number
 *           example: 68
 *         totalUsersEngaged:
 *           type: number
 *           example: 5000
 *         totalCompletedQuests:
 *           type: number
 *           example: 12500
 *     QuestCreateRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *         - goal
 *         - rewards
 *         - startDate
 *         - endDate
 *       properties:
 *         title:
 *           type: string
 *           example: "Complete 5 Lessons"
 *           maxLength: 100
 *         description:
 *           type: string
 *           example: "Complete 5 lessons in any language to earn XP and maintain your streak"
 *           maxLength: 500
 *         type:
 *           type: string
 *           enum: [daily, weekly, monthly, special, achievement]
 *           example: "daily"
 *         goal:
 *           type: string
 *           example: "Complete 5 lessons"
 *           maxLength: 200
 *         conditions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [lesson_completion, streak_maintenance, xp_earned, time_spent]
 *               value:
 *                 type: number
 *               operator:
 *                 type: string
 *                 enum: [equals, greater_than, less_than, greater_equal, less_equal]
 *           example:
 *             - type: "lesson_completion"
 *               value: 5
 *               operator: "greater_equal"
 *         rewards:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [xp, gems, hearts, badge, streak_freeze]
 *               value:
 *                 type: number
 *               description:
 *                 type: string
 *           example:
 *             - type: "xp"
 *               value: 50
 *               description: "Bonus XP for completing quest"
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T00:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           example: "2023-06-16T23:59:59Z"
 *         status:
 *           type: string
 *           enum: [draft, active, paused, completed, archived]
 *           default: "draft"
 *           example: "draft"
 *         targetSegment:
 *           type: string
 *           enum: [all, new_users, active_users, premium_users, inactive_users]
 *           default: "all"
 *           example: "all"
 *         targetCriteria:
 *           type: object
 *           properties:
 *             minLevel:
 *               type: number
 *             maxLevel:
 *               type: number
 *             languages:
 *               type: array
 *               items:
 *                 type: string
 *             userTypes:
 *               type: array
 *               items:
 *                 type: string
 *           example:
 *             minLevel: 1
 *             maxLevel: 10
 *             languages: ["spanish", "french"]
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard, expert]
 *           default: "medium"
 *           example: "medium"
 *         category:
 *           type: string
 *           enum: [learning, social, achievement, daily, weekly, special]
 *           default: "learning"
 *           example: "learning"
 *         priority:
 *           type: number
 *           default: 0
 *           example: 1
 *         maxParticipants:
 *           type: number
 *           nullable: true
 *           example: 1000
 *         isRepeatable:
 *           type: boolean
 *           default: false
 *           example: false
 *         cooldownPeriod:
 *           type: number
 *           nullable: true
 *           example: 24
 *           description: "Cooldown period in hours before quest can be repeated"
 *         isVisible:
 *           type: boolean
 *           default: true
 *           example: true
 *         isFeatured:
 *           type: boolean
 *           default: false
 *           example: false
 *         requiresApproval:
 *           type: boolean
 *           default: false
 *           example: false
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           default: []
 *           example: ["beginner", "daily", "xp"]
 *         notes:
 *           type: string
 *           default: ""
 *           example: "Internal notes for quest management"
 */

/**
 * @swagger
 * /api/quests:
 *   get:
 *     summary: Get quests with filtering and pagination
 *     description: |
 *       Retrieves a paginated list of quests with advanced filtering, search capabilities, and comprehensive statistics.
 *       Includes user engagement metrics, completion rates, and summary statistics for admin dashboard.
 *       Requires admin authentication.
 *     tags:
 *       - Quests
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter quests by title, description, or goal
 *         required: false
 *         example: "lesson"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [all, draft, active, paused, completed, archived]
 *           default: "all"
 *         description: Filter quests by status
 *         required: false
 *         example: "active"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, daily, weekly, monthly, special, achievement]
 *           default: "all"
 *         description: Filter quests by type
 *         required: false
 *         example: "daily"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of quests per page
 *         required: false
 *         example: 20
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         required: false
 *         example: 1
 *     responses:
 *       '200':
 *         description: Successfully retrieved quests with statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestsResponse'
 *             examples:
 *               success_with_quests:
 *                 summary: Successful response with quests and statistics
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                       title: "Complete 5 Lessons"
 *                       description: "Complete 5 lessons to earn XP"
 *                       type: "daily"
 *                       goal: "Complete 5 lessons"
 *                       reward:
 *                         type: "xp"
 *                         value: 50
 *                       status: "active"
 *                       targetSegment: "all"
 *                       completionRate: 75
 *                       usersAssigned: 1000
 *                       usersCompleted: 750
 *                       usersStarted: 850
 *                       difficulty: "medium"
 *                       category: "learning"
 *                       isVisible: true
 *                       isFeatured: false
 *                   pagination:
 *                     page: 1
 *                     limit: 50
 *                     total: 150
 *                     pages: 3
 *                   summary:
 *                     totalActiveQuests: 25
 *                     totalUpcomingQuests: 5
 *                     averageCompletionRate: 68
 *                     totalUsersEngaged: 5000
 *                     totalCompletedQuests: 12500
 *               filtered_response:
 *                 summary: Filtered response (active daily quests)
 *                 value:
 *                   success: true
 *                   data:
 *                     - id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                       title: "Daily Streak"
 *                       type: "daily"
 *                       status: "active"
 *                       completionRate: 85
 *                   pagination:
 *                     page: 1
 *                     limit: 20
 *                     total: 5
 *                     pages: 1
 *       '400':
 *         description: Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Invalid search parameters"
 *               details:
 *                 limit: ["Limit must be between 1 and 100"]
 *                 page: ["Page must be a positive integer"]
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Failed to fetch quests"
 *               details: "Database connection error"
 */

/**
 * @swagger
 * /api/quests:
 *   post:
 *     summary: Create a new quest
 *     description: |
 *       Creates a new quest with comprehensive configuration options.
 *       Supports various quest types, reward systems, target segments, and conditions.
 *       Requires admin authentication and validates all input data.
 *     tags:
 *       - Quests
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestCreateRequest'
 *           examples:
 *             daily_lesson_quest:
 *               summary: Daily lesson completion quest
 *               value:
 *                 title: "Complete 5 Lessons"
 *                 description: "Complete 5 lessons in any language to earn XP and maintain your streak"
 *                 type: "daily"
 *                 goal: "Complete 5 lessons"
 *                 conditions:
 *                   - type: "lesson_completion"
 *                     value: 5
 *                     operator: "greater_equal"
 *                 rewards:
 *                   - type: "xp"
 *                     value: 50
 *                     description: "Bonus XP for completing quest"
 *                 startDate: "2023-06-15T00:00:00Z"
 *                 endDate: "2023-06-16T23:59:59Z"
 *                 status: "active"
 *                 targetSegment: "all"
 *                 difficulty: "easy"
 *                 category: "learning"
 *                 priority: 1
 *                 isVisible: true
 *                 isFeatured: false
 *                 tags: ["daily", "lessons", "xp"]
 *             weekly_streak_quest:
 *               summary: Weekly streak maintenance quest
 *               value:
 *                 title: "7-Day Streak Master"
 *                 description: "Maintain a 7-day learning streak to earn gems and a special badge"
 *                 type: "weekly"
 *                 goal: "Maintain 7-day streak"
 *                 conditions:
 *                   - type: "streak_maintenance"
 *                     value: 7
 *                     operator: "greater_equal"
 *                 rewards:
 *                   - type: "gems"
 *                     value: 100
 *                     description: "Gem reward for streak"
 *                   - type: "badge"
 *                     value: 1
 *                     description: "Streak Master badge"
 *                 startDate: "2023-06-15T00:00:00Z"
 *                 endDate: "2023-06-22T23:59:59Z"
 *                 status: "draft"
 *                 targetSegment: "active_users"
 *                 difficulty: "medium"
 *                 category: "achievement"
 *                 priority: 2
 *                 isVisible: true
 *                 isFeatured: true
 *                 maxParticipants: 1000
 *                 tags: ["weekly", "streak", "gems", "badge"]
 *             premium_user_quest:
 *               summary: Premium user exclusive quest
 *               value:
 *                 title: "Premium Challenge"
 *                 description: "Exclusive quest for premium users with enhanced rewards"
 *                 type: "special"
 *                 goal: "Complete premium challenge"
 *                 conditions:
 *                   - type: "xp_earned"
 *                     value: 1000
 *                     operator: "greater_equal"
 *                 rewards:
 *                   - type: "streak_freeze"
 *                     value: 3
 *                     description: "3 streak freezes"
 *                 startDate: "2023-06-15T00:00:00Z"
 *                 endDate: "2023-06-30T23:59:59Z"
 *                 status: "draft"
 *                 targetSegment: "premium_users"
 *                 targetCriteria:
 *                   minLevel: 5
 *                   languages: ["spanish", "french"]
 *                 difficulty: "hard"
 *                 category: "special"
 *                 priority: 3
 *                 requiresApproval: true
 *                 isVisible: false
 *                 notes: "Premium exclusive quest for advanced users"
 *     responses:
 *       '200':
 *         description: Successfully created quest
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestCreateResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                 title: "Complete 5 Lessons"
 *                 description: "Complete 5 lessons in any language to earn XP"
 *                 type: "daily"
 *                 goal: "Complete 5 lessons"
 *                 reward:
 *                   type: "xp"
 *                   value: 50
 *                 status: "active"
 *                 targetSegment: "all"
 *                 completionRate: 0
 *                 usersAssigned: 0
 *                 usersCompleted: 0
 *                 usersStarted: 0
 *                 difficulty: "easy"
 *                 category: "learning"
 *                 priority: 1
 *                 isVisible: true
 *                 isFeatured: false
 *                 createdAt: "2023-06-15T14:30:00Z"
 *                 updatedAt: "2023-06-15T14:30:00Z"
 *               message: "Quest created successfully"
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation errors
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     "title": ["Title is required"]
 *                     "startDate": ["Start date must be in the future"]
 *                     "endDate": ["End date must be after start date"]
 *                     "rewards": ["At least one reward is required"]
 *               missing_required_fields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     "title": ["Required"]
 *                     "description": ["Required"]
 *                     "type": ["Required"]
 *                     "goal": ["Required"]
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Failed to create quest"
 *               details: "Database connection error"
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const check = await authGuard();
    if (check instanceof NextResponse) return check;

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const searchQuery = {
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "all",
      type: searchParams.get("type") || "all",
      limit: Number.parseInt(searchParams.get("limit") || "50"),
      page: Number.parseInt(searchParams.get("page") || "1"),
    };

    // Validate search parameters
    const validatedSearch = QuestSearchSchema.safeParse(searchQuery);
    if (!validatedSearch.success) {
      return NextResponse.json(
        {
          error: "Invalid search parameters",
          details: validatedSearch.error.format(),
        },
        { status: 400 }
      );
    }

    const { search, status, type, limit = 10, page = 1 } = validatedSearch.data;
    // Build query
    const query: FilterQuery<QuestDocument> = {};

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { goal: { $regex: search, $options: "i" } },
      ];
    }

    // Add status filter
    if (status !== "all") {
      query.status = status;
    }

    // Add type filter
    if (type !== "all") {
      query.type = type;
    }

    // Get quests with pagination

    const skip = (page - 1) * limit;
    const quests = await Quest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Quest.countDocuments(query);

    // Transform quests to match admin page format
    const transformedQuests = await Promise.all(
      quests.map(async (quest) => {
        // Get user quest statistics
        const userQuestStats = await UserQuest.aggregate([
          { $match: { questId: quest._id } },
          {
            $group: {
              _id: null,
              usersAssigned: { $sum: 1 },
              usersCompleted: {
                $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
              },
              usersStarted: {
                $sum: {
                  $cond: [
                    {
                      $in: ["$status", ["started", "in_progress", "completed"]],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ]);

        const stats = userQuestStats[0] || {
          usersAssigned: 0,
          usersCompleted: 0,
          usersStarted: 0,
        };

        // Calculate completion rate
        const completionRate =
          stats.usersAssigned > 0
            ? Math.round((stats.usersCompleted / stats.usersAssigned) * 100)
            : 0;

        // Transform reward format
        const reward = quest.rewards?.[0] || { type: "xp", value: 0 };

        return {
          id: quest._id.toString(),
          title: quest.title,
          description: quest.description,
          type: quest.type,
          goal: quest.goal,
          reward: {
            type: reward.type,
            value: reward.value,
          },
          startDate: quest.startDate,
          endDate: quest.endDate,
          status: quest.status,
          targetSegment: quest.targetSegment,
          completionRate,
          usersAssigned: stats.usersAssigned,
          usersCompleted: stats.usersCompleted,
          usersStarted: stats.usersStarted,
          difficulty: quest.difficulty,
          category: quest.category,
          priority: quest.priority,
          isVisible: quest.isVisible,
          isFeatured: quest.isFeatured,
          createdAt: quest.createdAt,
          updatedAt: quest.updatedAt,
        };
      })
    );

    // Calculate summary statistics
    const totalActiveQuests = await Quest.countDocuments({ status: "active" });
    const totalUpcomingQuests = await Quest.countDocuments({
      status: "draft",
      startDate: { $gt: new Date() },
    });

    const allQuests = await Quest.find({}).lean();
    const averageCompletionRate =
      allQuests.length > 0
        ? Math.round(
            allQuests.reduce(
              (acc, quest) => acc + (quest.completionRate || 0),
              0
            ) / allQuests.length
          )
        : 0;

    const totalUsersEngaged = await UserQuest.distinct("clerkId").then(
      (users) => users.length
    );
    const totalCompletedQuests = await UserQuest.countDocuments({
      status: "completed",
    });

    return NextResponse.json({
      success: true,
      data: transformedQuests,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      summary: {
        totalActiveQuests,
        totalUpcomingQuests,
        averageCompletionRate,
        totalUsersEngaged,
        totalCompletedQuests,
      },
    });
  } catch (error) {
    console.error("Error fetching quests:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch quests",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const check = await authGuard();
    if (check instanceof NextResponse) return check;

    const { userId } = await auth();

    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate request body with Zod
    const validatedData = CreateQuestSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validatedData.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      type,
      goal,
      conditions,
      rewards,
      startDate,
      endDate,
      status = "draft",
      targetSegment,
      targetCriteria,
      difficulty = "medium",
      category = "learning",
      priority = 0,
      maxParticipants,
      isRepeatable = false,
      cooldownPeriod,
      isVisible = true,
      isFeatured = false,
      requiresApproval = false,
      tags = [],
      notes = "",
    } = validatedData.data;

    // Create new quest
    const newQuest = new Quest({
      title,
      description,
      type,
      goal,
      conditions,
      rewards,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      targetSegment,
      targetCriteria,
      difficulty,
      category,
      priority,
      maxParticipants,
      isRepeatable,
      cooldownPeriod,
      usersAssigned: 0,
      usersStarted: 0,
      usersCompleted: 0,
      completionRate: 0,
      createdBy: userId,
      tags,
      notes,
      isVisible,
      isFeatured,
      requiresApproval,
    });

    await newQuest.save();

    // Transform response to match admin page format
    const transformedQuest = {
      id: newQuest._id.toString(),
      title: newQuest.title,
      description: newQuest.description,
      type: newQuest.type,
      goal: newQuest.goal,
      reward: rewards[0],
      startDate: newQuest.startDate,
      endDate: newQuest.endDate,
      status: newQuest.status,
      targetSegment: newQuest.targetSegment,
      completionRate: 0,
      usersAssigned: 0,
      usersCompleted: 0,
      usersStarted: 0,
      difficulty: newQuest.difficulty,
      category: newQuest.category,
      priority: newQuest.priority,
      isVisible: newQuest.isVisible,
      isFeatured: newQuest.isFeatured,
      createdAt: newQuest.createdAt,
      updatedAt: newQuest.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: transformedQuest,
      message: "Quest created successfully",
    });
  } catch (error) {
    console.error("Error creating quest:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create quest",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
