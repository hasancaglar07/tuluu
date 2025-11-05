import { type NextRequest, NextResponse } from "next/server";
import UserQuest from "@/models/UserQuest";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { FilterQuery, Types } from "mongoose";
import Quest, { QuestDocument } from "@/models/Quest";
import connectDB from "@/lib/db/connect";

type QuestConditionProgress = {
  conditionId: Types.ObjectId;
  conditionType:
    | "complete_lessons"
    | "earn_xp"
    | "maintain_streak"
    | "perfect_lessons"
    | "practice_minutes"
    | "complete_units"
    | "learn_words"
    | "use_hearts"
    | "custom";
  currentValue: number;
  targetValue: number;
  isCompleted: boolean;
  metadata: Record<string, unknown>;
};

/**
 * @swagger
 * /api/users/{id}/quests:
 *   get:
 *     summary: Get user's quest data and progress
 *     description: |
 *       Retrieves comprehensive quest information for a specific user, including
 *       available quests, user progress, completion status, rewards, and statistics.
 *       Supports filtering by quest type, category, and difficulty. Automatically
 *       merges quest definitions with user progress data and transforms the response
 *       for frontend consumption. Includes quest expiration times, progress tracking,
 *       and user statistics like completed quests and XP.
 *     tags:
 *       - Users
 *       - Quests
 *       - Progress
 *       - Gamification
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk ID of the user whose quests to retrieve
 *         example: "user_2abc123def456"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, special]
 *         description: Filter quests by type/duration
 *         example: "daily"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [learning, social, achievement, challenge]
 *         description: Filter quests by category
 *         example: "learning"
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard, expert]
 *         description: Filter quests by difficulty level
 *         example: "medium"
 *     responses:
 *       '200':
 *         description: Successfully retrieved user quest data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserQuestsResponse'
 *             examples:
 *               userQuests:
 *                 summary: User quest data with progress
 *                 value:
 *                   success: true
 *                   data:
 *                     quests:
 *                       - id: "60d21b4667d0d8992e610c85"
 *                         questId: "60d21b4667d0d8992e610c85"
 *                         title: "Complete 5 Lessons"
 *                         description: "Finish 5 lessons to earn XP and hearts"
 *                         status: "active"
 *                         difficulty: "easy"
 *                         duration: "daily"
 *                         progress: 3
 *                         total: 5
 *                         xpReward: 50
 *                         heartsReward: 1
 *                         badgeReward: null
 *                         expiresIn: "18h 30m"
 *                         category: "learning"
 *                         overallProgress: 60
 *                         conditionsProgress:
 *                           - conditionId: "60d21b4667d0d8992e610c86"
 *                             conditionType: "complete_lessons"
 *                             currentValue: 3
 *                             targetValue: 5
 *                             isCompleted: false
 *                             metadata: {}
 *                         assignedAt: "2024-01-20T08:00:00Z"
 *                         startedAt: "2024-01-20T08:15:00Z"
 *                         completedAt: null
 *                         rewardsClaimed: false
 *                         priority: 1
 *                         isFeatured: true
 *                         questType: "daily"
 *                         questCategory: "learning"
 *                         questDifficulty: "easy"
 *                         userQuestId: "60d21b4667d0d8992e610c90"
 *                         hasUserProgress: true
 *                       - id: "60d21b4667d0d8992e610c87"
 *                         questId: "60d21b4667d0d8992e610c87"
 *                         title: "Maintain 7-Day Streak"
 *                         description: "Keep your learning streak alive for 7 days"
 *                         status: "completed"
 *                         difficulty: "medium"
 *                         duration: "weekly"
 *                         progress: 7
 *                         total: 7
 *                         xpReward: 100
 *                         heartsReward: 2
 *                         badgeReward: "streak_master"
 *                         expiresIn: "3j 12h"
 *                         category: "achievement"
 *                         overallProgress: 100
 *                         conditionsProgress:
 *                           - conditionId: "60d21b4667d0d8992e610c88"
 *                             conditionType: "maintain_streak"
 *                             currentValue: 7
 *                             targetValue: 7
 *                             isCompleted: true
 *                             metadata: {}
 *                         assignedAt: "2024-01-13T08:00:00Z"
 *                         startedAt: "2024-01-13T08:00:00Z"
 *                         completedAt: "2024-01-20T08:00:00Z"
 *                         rewardsClaimed: true
 *                         priority: 2
 *                         isFeatured: false
 *                         questType: "weekly"
 *                         questCategory: "achievement"
 *                         questDifficulty: "medium"
 *                         userQuestId: "60d21b4667d0d8992e610c91"
 *                         hasUserProgress: true
 *                     stats:
 *                       completedThisMonth: 12
 *                       totalAssigned: 25
 *                       totalAvailable: 50
 *                       xp: 1250
 *                       streak: 15
 *               emptyQuests:
 *                 summary: No quests available
 *                 value:
 *                   success: true
 *                   data:
 *                     quests: []
 *                     stats:
 *                       completedThisMonth: 0
 *                       totalAssigned: 0
 *                       totalAvailable: 0
 *                       xp: 0
 *                       streak: 0
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
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestErrorResponse'
 *             examples:
 *               userNotFound:
 *                 value:
 *                   success: false
 *                   error: "User not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   error: "Failed to fetch user quests"
 *                   message: "Database connection failed"
 *
 *   put:
 *     summary: Update user quest progress
 *     description: |
 *       Updates progress for user quests based on completed actions. Automatically
 *       assigns available quests to users if they don't have active quests for the
 *       specified condition type. Increments progress values, handles quest completion,
 *       automatically claims rewards when quests are completed, and updates user XP
 *       and hearts. Uses intelligent quest assignment to find the most appropriate
 *       quest for the user's current progress.
 *     tags:
 *       - Users
 *       - Quests
 *       - Progress
 *       - Rewards
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk ID of the user whose quest progress to update
 *         example: "user_2abc123def456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestProgressUpdateRequest'
 *           examples:
 *             lessonComplete:
 *               summary: Update progress for completing a lesson
 *               value:
 *                 conditionType: "complete_lessons"
 *                 incrementValue: 1
 *             multipleProgress:
 *               summary: Update progress with multiple increments
 *               value:
 *                 conditionType: "earn_xp"
 *                 incrementValue: 50
 *             streakMaintain:
 *               summary: Update streak maintenance progress
 *               value:
 *                 conditionType: "maintain_streak"
 *                 incrementValue: 1
 *     responses:
 *       '200':
 *         description: Quest progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestProgressUpdateResponse'
 *             examples:
 *               progressUpdated:
 *                 summary: Progress updated, quest still in progress
 *                 value:
 *                   success: true
 *                   data:
 *                     userQuest:
 *                       _id: "60d21b4667d0d8992e610c90"
 *                       userId: "60d21b4667d0d8992e610c85"
 *                       questId: "60d21b4667d0d8992e610c85"
 *                       status: "in_progress"
 *                       overallProgress: 80
 *                       conditionsProgress:
 *                         - conditionId: "60d21b4667d0d8992e610c86"
 *                           conditionType: "complete_lessons"
 *                           currentValue: 4
 *                           targetValue: 5
 *                           isCompleted: false
 *                           metadata: {}
 *                       assignedAt: "2024-01-20T08:00:00Z"
 *                       startedAt: "2024-01-20T08:15:00Z"
 *                       completedAt: null
 *                       rewardsClaimed: []
 *                     claimedRewards: null
 *                     wasCompleted: false
 *                     wasNewlyAssigned: false
 *                   message: "Quest progress updated successfully"
 *               questCompleted:
 *                 summary: Quest completed with rewards claimed
 *                 value:
 *                   success: true
 *                   data:
 *                     userQuest:
 *                       _id: "60d21b4667d0d8992e610c90"
 *                       userId: "60d21b4667d0d8992e610c85"
 *                       questId: "60d21b4667d0d8992e610c85"
 *                       status: "completed"
 *                       overallProgress: 100
 *                       conditionsProgress:
 *                         - conditionId: "60d21b4667d0d8992e610c86"
 *                           conditionType: "complete_lessons"
 *                           currentValue: 5
 *                           targetValue: 5
 *                           isCompleted: true
 *                           metadata: {}
 *                       assignedAt: "2024-01-20T08:00:00Z"
 *                       startedAt: "2024-01-20T08:15:00Z"
 *                       completedAt: "2024-01-20T14:30:00Z"
 *                       rewardsClaimed:
 *                         - rewardType: "xp"
 *                           rewardValue: 50
 *                           claimedAt: "2024-01-20T14:30:00Z"
 *                         - rewardType: "hearts"
 *                           rewardValue: 1
 *                           claimedAt: "2024-01-20T14:30:00Z"
 *                     claimedRewards:
 *                       questId: "60d21b4667d0d8992e610c85"
 *                       userId: "60d21b4667d0d8992e610c85"
 *                       rewards:
 *                         - rewardType: "xp"
 *                           rewardValue: 50
 *                           claimedAt: "2024-01-20T14:30:00Z"
 *                         - rewardType: "hearts"
 *                           rewardValue: 1
 *                           claimedAt: "2024-01-20T14:30:00Z"
 *                       totalXpAwarded: 50
 *                       totalHeartsAwarded: 1
 *                     wasCompleted: true
 *                     wasNewlyAssigned: false
 *                   message: "Quest completed! Rewards claimed."
 *               newQuestAssigned:
 *                 summary: New quest automatically assigned
 *                 value:
 *                   success: true
 *                   data:
 *                     userQuest:
 *                       _id: "60d21b4667d0d8992e610c92"
 *                       userId: "60d21b4667d0d8992e610c85"
 *                       questId: "60d21b4667d0d8992e610c87"
 *                       status: "in_progress"
 *                       overallProgress: 20
 *                       conditionsProgress:
 *                         - conditionId: "60d21b4667d0d8992e610c88"
 *                           conditionType: "complete_lessons"
 *                           currentValue: 1
 *                           targetValue: 5
 *                           isCompleted: false
 *                           metadata: {}
 *                       assignedAt: "2024-01-20T14:30:00Z"
 *                       startedAt: "2024-01-20T14:30:00Z"
 *                       completedAt: null
 *                       rewardsClaimed: []
 *                     claimedRewards: null
 *                     wasCompleted: false
 *                     wasNewlyAssigned: true
 *                   message: "Quest progress updated successfully"
 *       '400':
 *         description: Bad request - Failed to update progress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestErrorResponse'
 *             examples:
 *               updateFailed:
 *                 value:
 *                   success: false
 *                   error: "Failed to update quest progress"
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   success: false
 *                   error: "Unauthorized"
 *       '404':
 *         description: User not found or no eligible quests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestErrorResponse'
 *             examples:
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   success: false
 *                   error: "User not found"
 *               noQuests:
 *                 summary: No eligible quests available
 *                 value:
 *                   success: false
 *                   error: "No eligible quests found for this user"
 *               noActiveQuests:
 *                 summary: No active quests for condition type
 *                 value:
 *                   success: false
 *                   error: "No active quests available for this condition"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuestServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   error: "Failed to update quest progress"
 *                   message: "Database transaction failed"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     QuestConditionProgress:
 *       type: object
 *       properties:
 *         conditionId:
 *           type: string
 *           format: objectId
 *           description: ID of the quest condition
 *           example: "60d21b4667d0d8992e610c86"
 *         conditionType:
 *           type: string
 *           enum: [complete_lessons, earn_xp, maintain_streak, complete_units, practice_minutes]
 *           description: Type of condition to track
 *           example: "complete_lessons"
 *         currentValue:
 *           type: number
 *           description: Current progress value
 *           example: 3
 *         targetValue:
 *           type: number
 *           description: Target value to complete the condition
 *           example: 5
 *         isCompleted:
 *           type: boolean
 *           description: Whether this condition is completed
 *           example: false
 *         metadata:
 *           type: object
 *           description: Additional metadata for the condition
 *           example: {}
 *
 *     QuestData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: objectId
 *           description: Quest ID
 *           example: "60d21b4667d0d8992e610c85"
 *         questId:
 *           type: string
 *           format: objectId
 *           description: Original quest ID (same as id)
 *           example: "60d21b4667d0d8992e610c85"
 *         title:
 *           type: string
 *           description: Quest title
 *           example: "Complete 5 Lessons"
 *         description:
 *           type: string
 *           description: Quest description
 *           example: "Finish 5 lessons to earn XP and hearts"
 *         status:
 *           type: string
 *           enum: [active, completed, locked]
 *           description: Quest status for the user
 *           example: "active"
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard]
 *           description: Quest difficulty level
 *           example: "easy"
 *         duration:
 *           type: string
 *           enum: [daily, weekly, monthly, special]
 *           description: Quest duration/type
 *           example: "daily"
 *         progress:
 *           type: number
 *           description: Current progress value
 *           example: 3
 *         total:
 *           type: number
 *           description: Total required for completion
 *           example: 5
 *         xpReward:
 *           type: number
 *           description: XP reward for completion
 *           example: 50
 *         heartsReward:
 *           type: number
 *           nullable: true
 *           description: Hearts reward for completion
 *           example: 1
 *         badgeReward:
 *           type: string
 *           nullable: true
 *           description: Badge reward for completion
 *           example: null
 *         expiresIn:
 *           type: string
 *           description: Time remaining until quest expires
 *           example: "18h 30m"
 *         category:
 *           type: string
 *           enum: [learning, social, achievement, challenge]
 *           description: Quest category
 *           example: "learning"
 *         overallProgress:
 *           type: number
 *           description: Overall completion percentage
 *           example: 60
 *         conditionsProgress:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestConditionProgress'
 *           description: Progress for each quest condition
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the quest was assigned to the user
 *           example: "2024-01-20T08:00:00Z"
 *         startedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the user started the quest
 *           example: "2024-01-20T08:15:00Z"
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the quest was completed
 *           example: null
 *         rewardsClaimed:
 *           type: boolean
 *           description: Whether rewards have been claimed
 *           example: false
 *         priority:
 *           type: number
 *           description: Quest priority for display ordering
 *           example: 1
 *         isFeatured:
 *           type: boolean
 *           description: Whether the quest is featured
 *           example: true
 *         questType:
 *           type: string
 *           description: Original quest type
 *           example: "daily"
 *         questCategory:
 *           type: string
 *           description: Original quest category
 *           example: "learning"
 *         questDifficulty:
 *           type: string
 *           description: Original quest difficulty
 *           example: "easy"
 *         userQuestId:
 *           type: string
 *           format: objectId
 *           nullable: true
 *           description: User quest record ID
 *           example: "60d21b4667d0d8992e610c90"
 *         hasUserProgress:
 *           type: boolean
 *           description: Whether user has progress on this quest
 *           example: true
 *
 *     UserQuestStats:
 *       type: object
 *       properties:
 *         completedThisMonth:
 *           type: integer
 *           description: Number of quests completed in the last 30 days
 *           example: 12
 *         totalAssigned:
 *           type: integer
 *           description: Total number of quests assigned to the user
 *           example: 25
 *         totalAvailable:
 *           type: integer
 *           description: Total number of available quests
 *           example: 50
 *         xp:
 *           type: integer
 *           description: User's current XP
 *           example: 1250
 *         streak:
 *           type: integer
 *           description: User's current streak
 *           example: 15
 *
 *     UserQuestsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             quests:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuestData'
 *               description: Array of quest data with user progress
 *             stats:
 *               $ref: '#/components/schemas/UserQuestStats'
 *
 *     QuestProgressUpdateRequest:
 *       type: object
 *       properties:
 *         conditionType:
 *           type: string
 *           enum: [complete_lessons, earn_xp, maintain_streak, complete_units, practice_minutes]
 *           default: "complete_lessons"
 *           description: Type of condition to update progress for
 *           example: "complete_lessons"
 *         incrementValue:
 *           type: number
 *           minimum: 1
 *           default: 1
 *           description: Amount to increment the progress by
 *           example: 1
 *
 *     UserQuestProgress:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: User quest record ID
 *           example: "60d21b4667d0d8992e610c90"
 *         userId:
 *           type: string
 *           format: objectId
 *           description: User's database ID
 *           example: "60d21b4667d0d8992e610c85"
 *         questId:
 *           type: string
 *           format: objectId
 *           description: Quest ID
 *           example: "60d21b4667d0d8992e610c85"
 *         status:
 *           type: string
 *           enum: [assigned, in_progress, completed]
 *           description: Current quest status
 *           example: "in_progress"
 *         overallProgress:
 *           type: number
 *           description: Overall completion percentage
 *           example: 80
 *         conditionsProgress:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestConditionProgress'
 *           description: Progress for each quest condition
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           description: When the quest was assigned
 *           example: "2024-01-20T08:00:00Z"
 *         startedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the quest was started
 *           example: "2024-01-20T08:15:00Z"
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the quest was completed
 *           example: null
 *         rewardsClaimed:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               rewardType:
 *                 type: string
 *                 example: "xp"
 *               rewardValue:
 *                 type: number
 *                 example: 50
 *               claimedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-20T14:30:00Z"
 *           description: Array of claimed rewards
 *
 *     ClaimedRewards:
 *       type: object
 *       properties:
 *         questId:
 *           type: string
 *           format: objectId
 *           description: Quest ID
 *           example: "60d21b4667d0d8992e610c85"
 *         userId:
 *           type: string
 *           format: objectId
 *           description: User ID
 *           example: "60d21b4667d0d8992e610c85"
 *         rewards:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               rewardType:
 *                 type: string
 *                 example: "xp"
 *               rewardValue:
 *                 type: number
 *                 example: 50
 *               claimedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-20T14:30:00Z"
 *           description: Array of claimed rewards
 *         totalXpAwarded:
 *           type: number
 *           description: Total XP awarded
 *           example: 50
 *         totalHeartsAwarded:
 *           type: number
 *           description: Total hearts awarded
 *           example: 1
 *
 *     QuestProgressUpdateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             userQuest:
 *               $ref: '#/components/schemas/UserQuestProgress'
 *             claimedRewards:
 *               allOf:
 *                 - $ref: '#/components/schemas/ClaimedRewards'
 *               nullable: true
 *               description: Rewards claimed if quest was completed
 *             wasCompleted:
 *               type: boolean
 *               description: Whether the quest was completed with this update
 *               example: false
 *             wasNewlyAssigned:
 *               type: boolean
 *               description: Whether a new quest was assigned
 *               example: false
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Quest progress updated successfully"
 *
 *     QuestErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "User not found"
 *
 *     QuestServerErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error type
 *           example: "Failed to fetch user quests"
 *         message:
 *           type: string
 *           description: Detailed error message
 *           example: "Database connection failed"
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
 *         **Step 1: Get User Quests with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const getUserQuests = async (userId, filters = {}) => {
 *           try {
 *             const params = new URLSearchParams();
 *             if (filters.type) params.append('type', filters.type);
 *             if (filters.category) params.append('category', filters.category);
 *             if (filters.difficulty) params.append('difficulty', filters.difficulty);
 *
 *             const response = await axios.get(`/api/users/${userId}/quests?${params}`, {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to get user quests');
 *             }
 *           } catch (error) {
 *             console.error('Failed to get user quests:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const allQuests = await getUserQuests('user_2abc123def456');
 *         const dailyQuests = await getUserQuests('user_2abc123def456', { type: 'daily' });
 *         const learningQuests = await getUserQuests('user_2abc123def456', {
 *           category: 'learning',
 *           difficulty: 'easy'
 *         });
 *         ```
 *
 *         **Step 2: Update Quest Progress**
 *         ```javascript
 *         const updateQuestProgress = async (userId, conditionType, incrementValue = 1) => {
 *           try {
 *             const response = await axios.put(`/api/users/${userId}/quests`, {
 *               conditionType,
 *               incrementValue
 *             }, {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`,
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to update quest progress');
 *             }
 *           } catch (error) {
 *             console.error('Failed to update quest progress:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const lessonComplete = await updateQuestProgress('user_2abc123def456', 'complete_lessons', 1);
 *         const xpEarned = await updateQuestProgress('user_2abc123def456', 'earn_xp', 50);
 *         const streakMaintained = await updateQuestProgress('user_2abc123def456', 'maintain_streak', 1);
 *         ```
 *
 *         **Step 3: Create a Quests Service**
 *         ```javascript
 *         class QuestsService {
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
 *           async getUserQuests(userId, filters = {}) {
 *             try {
 *               const params = new URLSearchParams();
 *               if (filters.type) params.append('type', filters.type);
 *               if (filters.category) params.append('category', filters.category);
 *               if (filters.difficulty) params.append('difficulty', filters.difficulty);
 *
 *               const response = await this.client.get(`/${userId}/quests?${params}`);
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to get user quests');
 *               }
 *             } catch (error) {
 *               console.error('Quests service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async updateProgress(userId, conditionType, incrementValue = 1) {
 *             try {
 *               const response = await this.client.put(`/${userId}/quests`, {
 *                 conditionType,
 *                 incrementValue
 *               });
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to update quest progress');
 *               }
 *             } catch (error) {
 *               console.error('Quest progress update error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async getActiveQuests(userId) {
 *             const result = await this.getUserQuests(userId);
 *             return {
 *               ...result,
 *               data: {
 *                 ...result.data,
 *                 quests: result.data.quests.filter(quest => quest.status === 'active')
 *               }
 *             };
 *           }
 *
 *           async getCompletedQuests(userId) {
 *             const result = await this.getUserQuests(userId);
 *             return {
 *               ...result,
 *               data: {
 *                 ...result.data,
 *                 quests: result.data.quests.filter(quest => quest.status === 'completed')
 *               }
 *             };
 *           }
 *
 *           async getDailyQuests(userId) {
 *             return this.getUserQuests(userId, { type: 'daily' });
 *           }
 *
 *           async getWeeklyQuests(userId) {
 *             return this.getUserQuests(userId, { type: 'weekly' });
 *           }
 *
 *           async getFeaturedQuests(userId) {
 *             const result = await this.getUserQuests(userId);
 *             return {
 *               ...result,
 *               data: {
 *                 ...result.data,
 *                 quests: result.data.quests.filter(quest => quest.isFeatured)
 *               }
 *             };
 *           }
 *
 *           async onLessonComplete(userId) {
 *             return this.updateProgress(userId, 'complete_lessons', 1);
 *           }
 *
 *           async onXpEarned(userId, xpAmount) {
 *             return this.updateProgress(userId, 'earn_xp', xpAmount);
 *           }
 *
 *           async onStreakMaintained(userId) {
 *             return this.updateProgress(userId, 'maintain_streak', 1);
 *           }
 *
 *           async onUnitCompleted(userId) {
 *             return this.updateProgress(userId, 'complete_units', 1);
 *           }
 *
 *           async onPracticeTime(userId, minutes) {
 *             return this.updateProgress(userId, 'practice_minutes', minutes);
 *           }
 *
 *           // Helper methods
 *           formatTimeRemaining(expiresIn) {
 *             return expiresIn;
 *           }
 *
 *           getQuestProgressPercentage(quest) {
 *             return Math.round((quest.progress / quest.total) * 100);
 *           }
 *
 *           getQuestDifficultyColor(difficulty) {
 *             switch (difficulty) {
 *               case 'easy': return '#22c55e';
 *               case 'medium': return '#f59e0b';
 *               case 'hard': return '#ef4444';
 *               default: return '#6b7280';
 *             }
 *           }
 *
 *           getQuestTypeIcon(duration) {
 *             switch (duration) {
 *               case 'daily': return '📅';
 *               case 'weekly': return '📆';
 *               case 'monthly': return '🗓️';
 *               case 'special': return '⭐';
 *               default: return '📋';
 *             }
 *           }
 *         }
 *
 *         export const questsService = new QuestsService();
 *         ```
 *
 * tags:
 *   - name: Users
 *     description: Operations for managing and retrieving user information
 *   - name: Quests
 *     description: Quest management and progress tracking
 *   - name: Progress
 *     description: Progress tracking and analytics
 *   - name: Gamification
 *     description: Gamification features including quests, rewards, and achievements
 *   - name: Rewards
 *     description: Reward system and claiming mechanisms
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;

    // Find user by clerkId. If the requesting user is fetching their own data,
    // automatically create a profile record to avoid 404s on first login.
    let user = await User.findByClerkId(id);
    if (!user) {
      if (id !== userId) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      user = await User.create({ clerkId: id });
    }

    const userDocumentId = user.id;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");

    // Build filter for quests
    const questFilter: FilterQuery<QuestDocument> = {
      status: "active",
      isVisible: true,
    };

    // Only show quests that are currently active (within date range)
    const now = new Date();
    // questFilter.startDate = { $lte: now };
    // questFilter.endDate = { $gte: now };

    if (type) questFilter.type = type;
    if (category) questFilter.category = category;
    if (difficulty) questFilter.difficulty = difficulty;

    // Fetch all available quests
    const allQuests = await Quest.find(questFilter)
      .sort({ priority: -1, startDate: 1 })
      .lean();

    // Fetch user quest progress for all quests
    const userQuests = await UserQuest.find({
      userId: userDocumentId,
    }).lean();

    // Create a map of user quest progress by questId for quick lookup
    const userQuestMap = new Map();
    userQuests.forEach((userQuest) => {
      userQuestMap.set(userQuest.questId.toString(), userQuest);
    });

    // return NextResponse.json(
    //   { success: false, data: allQuests },
    //   { status: 200 }
    // );
    // Transform all quests and merge with user progress
    const transformedQuests = allQuests.map((quest) => {
      // Get user progress for this quest (if exists)
      const userQuest = userQuestMap.get(quest._id.toString());

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
      else expiresIn = "Soon";

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

      // Determine quest status based on user progress
      let frontendStatus: "active" | "completed" | "locked";
      let progress = 0;
      let overallProgress = 0;
      let conditionsProgress: QuestConditionProgress[] = [];
      let assignedAt = null;
      let startedAt = null;
      let completedAt = null;
      let rewardsClaimed = false;

      if (userQuest) {
        // User has this quest assigned
        switch (userQuest.status) {
          case "completed":
            frontendStatus = "completed";
            break;
          case "assigned":
          case "started":
          case "in_progress":
            frontendStatus = "active";
            break;
          default:
            frontendStatus = "locked";
        }

        // Get progress from user quest
        overallProgress = userQuest.overallProgress || 0;
        conditionsProgress = userQuest.conditionsProgress || [];

        // Get progress from first condition (for display purposes)
        if (conditionsProgress.length > 0) {
          progress = conditionsProgress[0].currentValue || 0;
        }

        assignedAt = userQuest.assignedAt;
        startedAt = userQuest.startedAt;
        completedAt = userQuest.completedAt;
        rewardsClaimed = userQuest.rewardsClaimed.length > 0;
      } else {
        // User doesn't have this quest yet - it's available to be assigned
        frontendStatus = "active";
        progress = 0;
        overallProgress = 0;

        // Initialize conditions progress based on quest conditions
        conditionsProgress = quest.conditions.map((condition) => ({
          conditionId: condition._id,
          conditionType: condition.type,
          currentValue: 0,
          targetValue: condition.target,
          isCompleted: false,
          metadata: {},
        }));
      }

      // Extract rewards
      const xpReward =
        (quest.rewards.find((r) => r.type === "xp")?.value as number) || 0;
      const heartsReward =
        (quest.rewards.find((r) => r.type === "hearts")?.value as number) || 0;
      const badgeReward =
        (quest.rewards.find((r) => r.type === "badge")?.value as string) ||
        null;
      // Get total from first condition or default to 1
      const total =
        quest.conditions.length > 0 ? quest.conditions[0].target : 1;

      return {
        id: quest._id.toString(),
        questId: quest._id.toString(),
        title: quest.title,
        description: quest.description,
        status: frontendStatus,
        difficulty: frontendDifficulty,
        duration: frontendDuration,
        progress,
        total,
        xpReward,
        badgeReward,
        heartsReward: heartsReward > 0 ? heartsReward : undefined,
        expiresIn,
        category: quest.category,
        overallProgress,
        conditionsProgress,
        assignedAt,
        startedAt,
        completedAt,
        rewardsClaimed,
        priority: userQuest?.priority || quest.priority || 0,
        isFeatured: quest.isFeatured || false,
        // Additional quest metadata
        questType: quest.type,
        questCategory: quest.category,
        questDifficulty: quest.difficulty,
        userQuestId: userQuest?._id?.toString() || null,
        hasUserProgress: !!userQuest,
      };
    });

    // Get user stats
    const completedCount = await UserQuest.countDocuments({
      userId: userDocumentId,
      status: "completed",
      completedAt: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      }, // Last 30 days
    });

    // Get total quests assigned to user
    const totalAssignedQuests = await UserQuest.countDocuments({
      userId: userDocumentId,
    });

    return NextResponse.json({
      success: true,
      data: {
        quests: transformedQuests,
        stats: {
          completedThisMonth: completedCount,
          totalAssigned: totalAssignedQuests,
          totalAvailable: allQuests.length,
          xp: user.xp || 0,
          streak: user.streak || 0,
        },
      },
    });
  } catch (error) {
    console.error("User Quests API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user quests",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();
    // Find user by clerkId
    const user = await User.findByClerkId(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    const userDocumentId = user.id;
    const { conditionType = "complete_lessons", incrementValue = 1 } =
      await request.json();

    // Step 1: Get all active quests matching conditionType
    const activeQuests = await Quest.find({
      status: "active",
      "conditions.type": conditionType,
    }).sort({ createdAt: -1 }); // Most recent first

    if (!activeQuests.length) {
      return NextResponse.json(
        {
          success: false,
          error: "No active quests available for this condition",
        },
        { status: 404 }
      );
    }

    // Step 2: Get user's current quests (in progress or completed)
    const existingUserQuests = await UserQuest.find({
      userId: userDocumentId,
      status: { $in: ["in_progress", "completed"] },
    }).select("questId");

    const excludedQuestIds = existingUserQuests.map((uq) =>
      uq.questId.toString()
    );

    // Step 3: Find first available quest not already in progress or completed
    const availableQuest = activeQuests.find(
      (quest) => !excludedQuestIds.includes(quest._id.toString())
    );

    if (!availableQuest) {
      return NextResponse.json(
        { success: false, error: "No eligible quests found for this user" },
        { status: 404 }
      );
    }

    // Step 4: Check if user already has the quest (shouldn't happen, but safe check)
    let userQuest = await UserQuest.findOne({
      userId: userDocumentId,
      questId: availableQuest._id,
    }).populate("questId");

    if (!userQuest) {
      userQuest = await UserQuest.assignQuestToUser(
        userDocumentId,
        availableQuest._id.toString(),
        availableQuest.endDate,
        "auto_assigned"
      );

      userQuest = await UserQuest.findById(userQuest._id).populate("questId");
    }

    // Step 5: Update quest progress
    const updatedUserQuest = await UserQuest.updateQuestProgress(
      userDocumentId,
      availableQuest._id.toString(),
      conditionType,
      incrementValue
    );

    if (!updatedUserQuest || !userQuest) {
      return NextResponse.json(
        { success: false, error: "Failed to update quest progress" },
        { status: 400 }
      );
    }

    // Check if quest was completed and rewards need to be claimed
    let claimedRewards = null;
    if (
      updatedUserQuest.status === "completed" &&
      updatedUserQuest.rewardsClaimed.length === 0
    ) {
      claimedRewards = await UserQuest.claimQuestRewards(
        userDocumentId,
        userQuest._id.toString()
      );

      // Update user XP and hearts if rewards were claimed
      if (claimedRewards) {
        let xpToAdd = 0;
        let heartsToAdd = 0;

        for (const reward of claimedRewards.rewards) {
          if (
            reward.rewardType === "xp" &&
            typeof reward.rewardValue === "number"
          ) {
            xpToAdd += reward.rewardValue;
          } else if (
            reward.rewardType === "hearts" &&
            typeof reward.rewardValue === "number"
          ) {
            heartsToAdd += reward.rewardValue;
          }
        }

        // Update user stats in database
        const updateData: { xp: number; hearts: number } = { xp: 0, hearts: 0 };
        if (xpToAdd > 0) updateData.xp = (user.xp || 0) + xpToAdd;
        if (heartsToAdd > 0)
          updateData.hearts = Math.min((user.hearts || 0) + heartsToAdd, 5); // Cap at 5 hearts

        if (Object.keys(updateData).length > 0) {
          await User.findByIdAndUpdate(user._id, updateData);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        userQuest: updatedUserQuest,
        claimedRewards,
        wasCompleted: updatedUserQuest.status === "completed",
        wasNewlyAssigned: !userQuest || userQuest.status === "assigned",
      },
      message:
        updatedUserQuest.status === "completed"
          ? "Quest completed! Rewards claimed."
          : "Quest progress updated successfully",
    });
  } catch (error) {
    console.error("Update Quest Progress API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update quest progress",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
