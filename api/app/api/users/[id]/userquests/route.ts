import { type NextRequest, NextResponse } from "next/server";
import UserQuest from "@/models/UserQuest";
import User from "@/models/User";
import { auth } from "@clerk/nextjs/server";
import { FilterQuery } from "mongoose";
import Quest, { QuestDocument } from "@/models/Quest";
import connectDB from "@/lib/db/connect";

/**
 * @swagger
 * /api/users/{id}/userquests:
 *   post:
 *     summary: Assign a quest to a user
 *     description: |
 *       Assigns an available quest to a user based on specified criteria such as quest type,
 *       condition type, and reward type. The endpoint finds the most recent quest matching
 *       the criteria, checks if the user already has the quest in progress, and assigns it
 *       if available. Automatically updates quest statistics and handles duplicate assignment
 *       prevention. Supports filtering by quest type (daily, weekly, monthly), condition
 *       types (complete_lessons, earn_xp, etc.), and reward types. Requires user authentication.
 *     tags:
 *       - Users
 *       - Quests
 *       - Assignment
 *       - Gamification
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Clerk ID of the user to assign the quest to
 *         example: "user_2abc123def456"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignQuestRequest'
 *           examples:
 *             dailyLessonQuest:
 *               summary: Assign daily lesson completion quest
 *               value:
 *                 type: "daily"
 *                 conditionType: "complete_lessons"
 *                 amount: 5
 *                 rewardType: "xp"
 *             weeklyXpQuest:
 *               summary: Assign weekly XP earning quest
 *               value:
 *                 type: "weekly"
 *                 conditionType: "earn_xp"
 *                 amount: 500
 *                 rewardType: "gems"
 *             streakQuest:
 *               summary: Assign streak maintenance quest
 *               value:
 *                 type: "daily"
 *                 conditionType: "maintain_streak"
 *                 amount: 1
 *                 rewardType: "hearts"
 *             anyDailyQuest:
 *               summary: Assign any available daily quest
 *               value:
 *                 type: "daily"
 *     responses:
 *       '200':
 *         description: Quest assigned successfully or user already has quest
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignQuestResponse'
 *             examples:
 *               questAssigned:
 *                 summary: New quest assigned to user
 *                 value:
 *                   success: true
 *                   message: "Quest assigned successfully"
 *                   data:
 *                     userQuest:
 *                       _id: "60d21b4667d0d8992e610c90"
 *                       userId: "60d21b4667d0d8992e610c85"
 *                       questId:
 *                         _id: "60d21b4667d0d8992e610c85"
 *                         title: "Complete 5 Lessons"
 *                         description: "Finish 5 lessons to earn XP"
 *                         type: "daily"
 *                         category: "learning"
 *                         difficulty: "easy"
 *                         conditions:
 *                           - type: "complete_lessons"
 *                             target: 5
 *                         rewards:
 *                           - type: "xp"
 *                             value: 50
 *                       status: "assigned"
 *                       overallProgress: 0
 *                       conditionsProgress:
 *                         - conditionId: "60d21b4667d0d8992e610c86"
 *                           conditionType: "complete_lessons"
 *                           currentValue: 0
 *                           targetValue: 5
 *                           isCompleted: false
 *                           metadata: {}
 *                       assignedAt: "2024-01-20T14:30:00Z"
 *                       startedAt: null
 *                       completedAt: null
 *                       rewardsClaimed: []
 *                       priority: 1
 *                     quest:
 *                       _id: "60d21b4667d0d8992e610c85"
 *                       title: "Complete 5 Lessons"
 *                       description: "Finish 5 lessons to earn XP"
 *                       type: "daily"
 *                       category: "learning"
 *                       difficulty: "easy"
 *                       status: "active"
 *                       isVisible: true
 *                       isFeatured: false
 *                       priority: 1
 *                       usersAssigned: 1
 *                       usersCompleted: 0
 *                       startDate: "2024-01-20T00:00:00Z"
 *                       endDate: "2024-01-21T00:00:00Z"
 *                       conditions:
 *                         - _id: "60d21b4667d0d8992e610c86"
 *                           type: "complete_lessons"
 *                           target: 5
 *                           description: "Complete lessons"
 *                       rewards:
 *                         - _id: "60d21b4667d0d8992e610c87"
 *                           type: "xp"
 *                           value: 50
 *                           description: "Experience points"
 *                     isNewAssignment: true
 *                     status: "assigned"
 *               existingQuest:
 *                 summary: User already has this quest in progress
 *                 value:
 *                   success: true
 *                   message: "User already has this quest in progress"
 *                   data:
 *                     userQuest:
 *                       _id: "60d21b4667d0d8992e610c90"
 *                       userId: "60d21b4667d0d8992e610c85"
 *                       questId:
 *                         _id: "60d21b4667d0d8992e610c85"
 *                         title: "Complete 5 Lessons"
 *                         description: "Finish 5 lessons to earn XP"
 *                         type: "daily"
 *                         category: "learning"
 *                         difficulty: "easy"
 *                       status: "in_progress"
 *                       overallProgress: 60
 *                       conditionsProgress:
 *                         - conditionId: "60d21b4667d0d8992e610c86"
 *                           conditionType: "complete_lessons"
 *                           currentValue: 3
 *                           targetValue: 5
 *                           isCompleted: false
 *                           metadata: {}
 *                       assignedAt: "2024-01-20T08:00:00Z"
 *                       startedAt: "2024-01-20T08:15:00Z"
 *                       completedAt: null
 *                       rewardsClaimed: []
 *                       priority: 1
 *                     quest:
 *                       _id: "60d21b4667d0d8992e610c85"
 *                       title: "Complete 5 Lessons"
 *                       description: "Finish 5 lessons to earn XP"
 *                       type: "daily"
 *                       category: "learning"
 *                       difficulty: "easy"
 *                       status: "active"
 *                       isVisible: true
 *                       isFeatured: false
 *                       priority: 1
 *                       usersAssigned: 1
 *                       usersCompleted: 0
 *                       startDate: "2024-01-20T00:00:00Z"
 *                       endDate: "2024-01-21T00:00:00Z"
 *                     isNewAssignment: false
 *                     status: "existing"
 *       '401':
 *         description: Unauthorized - User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserQuestErrorResponse'
 *             examples:
 *               unauthorizedExample:
 *                 value:
 *                   success: false
 *                   error: "Unauthorized"
 *       '404':
 *         description: No quests available or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserQuestErrorResponse'
 *             examples:
 *               noQuestsAvailable:
 *                 summary: No quests matching criteria
 *                 value:
 *                   success: false
 *                   error: "No quests available"
 *                   message: "No daily quests are currently available for complete_lessons"
 *               userNotFound:
 *                 summary: User not found
 *                 value:
 *                   success: false
 *                   error: "User not found"
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserQuestServerErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   success: false
 *                   error: "Failed to update quest progress"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AssignQuestRequest:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           type: string
 *           enum: [daily, weekly, monthly, special]
 *           description: Type of quest to assign
 *           example: "daily"
 *         conditionType:
 *           type: string
 *           enum: [complete_lessons, earn_xp, maintain_streak, complete_units, practice_minutes, complete_exercises]
 *           description: Specific condition type to filter quests by
 *           example: "complete_lessons"
 *         amount:
 *           type: number
 *           minimum: 1
 *           description: Target amount for the quest condition
 *           example: 5
 *         rewardType:
 *           type: string
 *           enum: [xp, gems, hearts, badge, coins]
 *           description: Type of reward to filter quests by
 *           example: "xp"
 *
 *     QuestCondition:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Condition ID
 *           example: "60d21b4667d0d8992e610c86"
 *         type:
 *           type: string
 *           enum: [complete_lessons, earn_xp, maintain_streak, complete_units, practice_minutes]
 *           description: Type of condition
 *           example: "complete_lessons"
 *         target:
 *           type: number
 *           description: Target value for the condition
 *           example: 5
 *         description:
 *           type: string
 *           description: Human-readable description of the condition
 *           example: "Complete lessons"
 *
 *     QuestReward:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Reward ID
 *           example: "60d21b4667d0d8992e610c87"
 *         type:
 *           type: string
 *           enum: [xp, gems, hearts, badge, coins]
 *           description: Type of reward
 *           example: "xp"
 *         value:
 *           oneOf:
 *             - type: number
 *             - type: string
 *           description: Value of the reward (number for points, string for badges)
 *           example: 50
 *         description:
 *           type: string
 *           description: Human-readable description of the reward
 *           example: "Experience points"
 *
 *     QuestDetails:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           format: objectId
 *           description: Quest ID
 *           example: "60d21b4667d0d8992e610c85"
 *         title:
 *           type: string
 *           description: Quest title
 *           example: "Complete 5 Lessons"
 *         description:
 *           type: string
 *           description: Quest description
 *           example: "Finish 5 lessons to earn XP"
 *         type:
 *           type: string
 *           enum: [daily, weekly, monthly, special]
 *           description: Quest type
 *           example: "daily"
 *         category:
 *           type: string
 *           enum: [learning, social, achievement, challenge]
 *           description: Quest category
 *           example: "learning"
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard, expert]
 *           description: Quest difficulty
 *           example: "easy"
 *         status:
 *           type: string
 *           enum: [active, inactive, expired]
 *           description: Quest status
 *           example: "active"
 *         isVisible:
 *           type: boolean
 *           description: Whether the quest is visible to users
 *           example: true
 *         isFeatured:
 *           type: boolean
 *           description: Whether the quest is featured
 *           example: false
 *         priority:
 *           type: number
 *           description: Quest priority for ordering
 *           example: 1
 *         usersAssigned:
 *           type: number
 *           description: Number of users assigned to this quest
 *           example: 1
 *         usersCompleted:
 *           type: number
 *           description: Number of users who completed this quest
 *           example: 0
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: When the quest becomes available
 *           example: "2024-01-20T00:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: When the quest expires
 *           example: "2024-01-21T00:00:00Z"
 *         conditions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestCondition'
 *           description: Quest conditions that must be met
 *         rewards:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/QuestReward'
 *           description: Rewards for completing the quest
 *
 *     UserQuestConditionProgress:
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
 *           description: Type of condition
 *           example: "complete_lessons"
 *         currentValue:
 *           type: number
 *           description: Current progress value
 *           example: 0
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
 *     UserQuestData:
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
 *           $ref: '#/components/schemas/QuestDetails'
 *         status:
 *           type: string
 *           enum: [assigned, started, in_progress, completed, expired, failed]
 *           description: Current quest status for the user
 *           example: "assigned"
 *         overallProgress:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *           description: Overall completion percentage
 *           example: 0
 *         conditionsProgress:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserQuestConditionProgress'
 *           description: Progress for each quest condition
 *         assignedAt:
 *           type: string
 *           format: date-time
 *           description: When the quest was assigned to the user
 *           example: "2024-01-20T14:30:00Z"
 *         startedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: When the user started the quest
 *           example: null
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
 *                 oneOf:
 *                   - type: number
 *                   - type: string
 *                 example: 50
 *               claimedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-20T14:30:00Z"
 *           description: Array of claimed rewards
 *         priority:
 *           type: number
 *           description: Quest priority for the user
 *           example: 1
 *
 *     AssignQuestResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Quest assigned successfully"
 *         data:
 *           type: object
 *           properties:
 *             userQuest:
 *               $ref: '#/components/schemas/UserQuestData'
 *             quest:
 *               $ref: '#/components/schemas/QuestDetails'
 *             isNewAssignment:
 *               type: boolean
 *               description: Whether this is a new quest assignment
 *               example: true
 *             status:
 *               type: string
 *               enum: [assigned, existing]
 *               description: Assignment status
 *               example: "assigned"
 *
 *     UserQuestErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "No quests available"
 *         message:
 *           type: string
 *           description: Detailed error message
 *           example: "No daily quests are currently available for complete_lessons"
 *
 *     UserQuestServerErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Failed to update quest progress"
 *
 *   examples:
 *     UserQuestsApiUsageExample:
 *       summary: How to use the User Quests Assignment API with Axios
 *       description: |
 *         **Step 1: Assign a Quest to a User**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const assignQuest = async (userId, questCriteria) => {
 *           try {
 *             const response = await axios.post(`/api/users/${userId}/userquests`, questCriteria, {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`,
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to assign quest');
 *             }
 *           } catch (error) {
 *             console.error('Failed to assign quest:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const dailyLessonQuest = await assignQuest('user_2abc123def456', {
 *           type: 'daily',
 *           conditionType: 'complete_lessons',
 *           amount: 5,
 *           rewardType: 'xp'
 *         });
 *
 *         const weeklyXpQuest = await assignQuest('user_2abc123def456', {
 *           type: 'weekly',
 *           conditionType: 'earn_xp',
 *           amount: 500,
 *           rewardType: 'gems'
 *         });
 *
 *         const anyDailyQuest = await assignQuest('user_2abc123def456', {
 *           type: 'daily'
 *         });
 *         ```
 *
 *         **Step 2: Create a Quest Assignment Service**
 *         ```javascript
 *         class QuestAssignmentService {
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
 *           async assignQuest(userId, questCriteria) {
 *             try {
 *               const response = await this.client.post(`/${userId}/userquests`, questCriteria);
 *
 *               if (response.data.success) {
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to assign quest');
 *               }
 *             } catch (error) {
 *               console.error('Quest assignment service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async assignDailyQuest(userId, conditionType, amount, rewardType) {
 *             return this.assignQuest(userId, {
 *               type: 'daily',
 *               conditionType,
 *               amount,
 *               rewardType
 *             });
 *           }
 *
 *           async assignWeeklyQuest(userId, conditionType, amount, rewardType) {
 *             return this.assignQuest(userId, {
 *               type: 'weekly',
 *               conditionType,
 *               amount,
 *               rewardType
 *             });
 *           }
 *
 *           async assignMonthlyQuest(userId, conditionType, amount, rewardType) {
 *             return this.assignQuest(userId, {
 *               type: 'monthly',
 *               conditionType,
 *               amount,
 *               rewardType
 *             });
 *           }
 *
 *           async assignLessonQuest(userId, lessonCount = 5) {
 *             return this.assignDailyQuest(userId, 'complete_lessons', lessonCount, 'xp');
 *           }
 *
 *           async assignXpQuest(userId, xpAmount = 100) {
 *             return this.assignDailyQuest(userId, 'earn_xp', xpAmount, 'gems');
 *           }
 *
 *           async assignStreakQuest(userId, streakDays = 7) {
 *             return this.assignWeeklyQuest(userId, 'maintain_streak', streakDays, 'hearts');
 *           }
 *
 *           async assignPracticeQuest(userId, minutes = 30) {
 *             return this.assignDailyQuest(userId, 'practice_minutes', minutes, 'xp');
 *           }
 *
 *           async assignRandomQuest(userId, type = 'daily') {
 *             return this.assignQuest(userId, { type });
 *           }
 *
 *           // Helper methods
 *           isNewAssignment(response) {
 *             return response.data.isNewAssignment;
 *           }
 *
 *           getQuestProgress(response) {
 *             return response.data.userQuest.overallProgress;
 *           }
 *
 *           getQuestTitle(response) {
 *             return response.data.quest.title;
 *           }
 *
 *           getQuestRewards(response) {
 *             return response.data.quest.rewards;
 *           }
 *
 *           formatQuestInfo(response) {
 *             const { userQuest, quest, isNewAssignment } = response.data;
 *             return {
 *               id: userQuest._id,
 *               title: quest.title,
 *               description: quest.description,
 *               type: quest.type,
 *               difficulty: quest.difficulty,
 *               progress: userQuest.overallProgress,
 *               status: userQuest.status,
 *               isNew: isNewAssignment,
 *               rewards: quest.rewards,
 *               conditions: quest.conditions,
 *               assignedAt: userQuest.assignedAt,
 *               expiresAt: quest.endDate
 *             };
 *           }
 *         }
 *
 *         export const questAssignmentService = new QuestAssignmentService();
 *         ```
 *
 *         **Step 3: Quest Assignment Component**
 *         ```javascript
 *         import React, { useState } from 'react';
 *         import { questAssignmentService } from '../services/quest-assignment-service';
 *
 *         export function QuestAssignmentPanel({ userId }) {
 *           const [loading, setLoading] = useState(false);
 *           const [result, setResult] = useState(null);
 *           const [error, setError] = useState(null);
 *
 *           const handleAssignQuest = async (questType, conditionType, amount, rewardType) => {
 *             setLoading(true);
 *             setError(null);
 *             setResult(null);
 *
 *             try {
 *               const response = await questAssignmentService.assignQuest(userId, {
 *                 type: questType,
 *                 conditionType,
 *                 amount,
 *                 rewardType
 *               });
 *
 *               setResult(response);
 *             } catch (err) {
 *               setError(err.message || 'Failed to assign quest');
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           const handleQuickAssign = async (questType) => {
 *             setLoading(true);
 *             setError(null);
 *             setResult(null);
 *
 *             try {
 *               let response;
 *               switch (questType) {
 *                 case 'lesson':
 *                   response = await questAssignmentService.assignLessonQuest(userId);
 *                   break;
 *                 case 'xp':
 *                   response = await questAssignmentService.assignXpQuest(userId);
 *                   break;
 *                 case 'streak':
 *                   response = await questAssignmentService.assignStreakQuest(userId);
 *                   break;
 *                 case 'practice':
 *                   response = await questAssignmentService.assignPracticeQuest(userId);
 *                   break;
 *                 default:
 *                   response = await questAssignmentService.assignRandomQuest(userId);
 *               }
 *
 *               setResult(response);
 *             } catch (err) {
 *               setError(err.message || 'Failed to assign quest');
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           return (
 *             <div className="quest-assignment-panel">
 *               <h2>Assign Quest</h2>
 *
 *               {error && (
 *                 <div className="error-message">
 *                   {error}
 *                 </div>
 *               )}
 *
 *               {result && (
 *                 <div className="result-message">
 *                   <h3>{result.data.isNewAssignment ? 'New Quest Assigned!' : 'Quest Already In Progress'}</h3>
 *                   <div className="quest-info">
 *                     <h4>{result.data.quest.title}</h4>
 *                     <p>{result.data.quest.description}</p>
 *                     <p>Type: {result.data.quest.type}</p>
 *                     <p>Difficulty: {result.data.quest.difficulty}</p>
 *                     <p>Progress: {result.data.userQuest.overallProgress}%</p>
 *                     <p>Status: {result.data.userQuest.status}</p>
 *                   </div>
 *                 </div>
 *               )}
 *
 *               <div className="quick-assign-buttons">
 *                 <h3>Quick Assign</h3>
 *                 <button
 *                   onClick={() => handleQuickAssign('lesson')}
 *                   disabled={loading}
 *                   className="assign-button"
 *                 >
 *                   Lesson Quest
 *                 </button>
 *
 *                 <button
 *                   onClick={() => handleQuickAssign('xp')}
 *                   disabled={loading}
 *                   className="assign-button"
 *                 >
 *                   XP Quest
 *                 </button>
 *
 *                 <button
 *                   onClick={() => handleQuickAssign('streak')}
 *                   disabled={loading}
 *                   className="assign-button"
 *                 >
 *                   Streak Quest
 *                 </button>
 *
 *                 <button
 *                   onClick={() => handleQuickAssign('practice')}
 *                   disabled={loading}
 *                   className="assign-button"
 *                 >
 *                   Practice Quest
 *                 </button>
 *
 *                 <button
 *                   onClick={() => handleQuickAssign('random')}
 *                   disabled={loading}
 *                   className="assign-button"
 *                 >
 *                   Random Quest
 *                 </button>
 *               </div>
 *
 *               <div className="custom-assign">
 *                 <h3>Custom Assignment</h3>
 *                 <button
 *                   onClick={() => handleAssignQuest('daily', 'complete_lessons', 3, 'xp')}
 *                   disabled={loading}
 *                   className="assign-button"
 *                 >
 *                   {loading ? 'Assigning...' : 'Assign 3 Lessons Quest'}
 *                 </button>
 *
 *                 <button
 *                   onClick={() => handleAssignQuest('weekly', 'earn_xp', 500, 'gems')}
 *                   disabled={loading}
 *                   className="assign-button"
 *                 >
 *                   {loading ? 'Assigning...' : 'Assign 500 XP Quest'}
 *                 </button>
 *               </div>
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Users
 *     description: Operations for managing and retrieving user information
 *   - name: Quests
 *     description: Quest management and progress tracking
 *   - name: Assignment
 *     description: Quest assignment and user quest management
 *   - name: Gamification
 *     description: Gamification features including quests, rewards, and achievements
 */
export async function POST(
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
    // Parse request body
    const { type, conditionType, amount, rewardType } = await request.json();

    const now = new Date();
    const questFilter: FilterQuery<QuestDocument> = {
      isVisible: true,
      type: type,
      status: "active",
      startDate: { $lte: now },
      endDate: { $gte: now },
    };
    const user = await User.findByClerkId(id);
    if (!user) throw new Error("User not found");
    // Add condition type filter if specified
    if (conditionType) {
      questFilter["conditions.type"] = conditionType;
    }

    if (rewardType) {
      questFilter["rewards.type"] = rewardType;
    }

    // 7. Find the most recent quest matching criteria
    const availableQuest = await Quest.findOne(questFilter)
      .sort({ createdAt: -1 }) // Most recent first
      .lean();

    if (!availableQuest) {
      console.warn("❌ UserQuest API: No available quests found", {
        filter: questFilter,
      });
      return NextResponse.json(
        {
          success: false,
          error: "No quests available",
          message: `No ${type} quests are currently available${
            conditionType ? ` for ${conditionType}` : ""
          }`,
        },
        { status: 404 }
      );
    }

    console.log("✅ UserQuest API: Found available quest", {
      questId: availableQuest._id,
      title: availableQuest.title,
      type: availableQuest.type,
    });

    // 8. Check if user already has this quest in progress
    const existingUserQuest = await UserQuest.findOne({
      userId: user._id,
      questId: availableQuest._id,
      status: { $in: ["assigned", "started", "in_progress"] },
    }).populate("questId");

    if (existingUserQuest) {
      console.log("ℹ️ UserQuest API: User already has this quest in progress", {
        userQuestId: existingUserQuest._id,
        status: existingUserQuest.status,
        progress: existingUserQuest.overallProgress,
      });

      return NextResponse.json({
        success: true,
        message: "User already has this quest in progress",
        data: {
          userQuest: existingUserQuest,
          quest: availableQuest,
          isNewAssignment: false,
          status: "existing",
        },
      });
    }

    const newUserQuest = await UserQuest.assignQuestToUser(
      user._id.toString(),
      availableQuest._id.toString(),
      amount,
      availableQuest.endDate,
      "auto_assigned"
    );

    // 10. Populate the quest details
    await newUserQuest.populate("questId");

    // 11. Update quest statistics
    await Quest.findByIdAndUpdate(availableQuest._id, {
      $inc: { usersAssigned: 1 },
    });

    console.log("✅ UserQuest API: Quest assigned successfully", {
      userQuestId: newUserQuest._id,
      questId: availableQuest._id,
      userId,
      questTitle: availableQuest.title,
    });
  } catch (error) {
    console.error("Update Quest Progress API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update quest progress",
      },
      { status: 500 }
    );
  }
}
