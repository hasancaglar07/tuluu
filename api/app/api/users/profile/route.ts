import { type NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import connectDB from "@/lib/db/connect";
import UserModel from "@/models/User";

// Define the settings type
export type Settings = {
  notifications: {
    dailyReminder: boolean;
    weeklyProgress: boolean;
    newFeatures: boolean;
    friendActivity: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducem: boolean;
    screenReader: boolean;
  };
  preferences: {
    darkMode: boolean;
    soundEffects: boolean;
    voiceOver: boolean;
  };
};

// Define the profile schema with Zod for validation
const profileSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  avatar: z.string().url("Please enter a valid URL"),
  country: z.string().min(1, "Please select a country"),
  language: z.string().min(1, "Please select a language"),
  timezone: z.string().min(1, "Please select a timezone"),
  userName: z.string(),
  settings: z.object({
    notifications: z.object({
      dailyReminder: z.boolean(),
      weeklyProgress: z.boolean(),
      newFeatures: z.boolean(),
      friendActivity: z.boolean(),
    }),
    accessibility: z.object({
      highContrast: z.boolean(),
      largeText: z.boolean(),
      reducem: z.boolean(),
      screenReader: z.boolean(),
    }),
    preferences: z.object({
      darkMode: z.boolean(),
      soundEffects: z.boolean(),
      voiceOver: z.boolean(),
    }),
  }),
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile information
 *     description: |
 *       Updates the authenticated user's profile information including personal details,
 *       preferences, and settings. The profile data is stored in Clerk's public metadata
 *       and includes bio, avatar, country, language preferences, timezone, and custom settings.
 *       The name field is automatically split into firstName and lastName for Clerk storage.
 *       Requires user authentication and validates all input data.
 *     tags:
 *       - Users
 *       - Profile
 *       - Settings
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdateRequest'
 *           examples:
 *             completeProfile:
 *               summary: Complete profile update
 *               value:
 *                 status: "active"
 *                 bio: "Passionate language learner exploring Spanish and French. Love connecting with fellow learners and sharing tips!"
 *                 name: "John Smith"
 *                 avatar: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yYWJjMTIzZGVmNDU2In0"
 *                 country: "United States"
 *                 language: "en"
 *                 timezone: "America/New_York"
 *                 settings:
 *                   notifications:
 *                     email: true
 *                     push: true
 *                     dailyReminder: true
 *                     weeklyProgress: true
 *                     achievements: true
 *                   privacy:
 *                     profileVisibility: "public"
 *                     showProgress: true
 *                     showCountry: true
 *                     allowMessages: true
 *                   learning:
 *                     dailyGoal: 30
 *                     reminderTime: "19:00"
 *                     difficulty: "intermediate"
 *                     autoAdvance: true
 *                   display:
 *                     theme: "light"
 *                     language: "en"
 *                     dateFormat: "MM/DD/YYYY"
 *                     timeFormat: "12h"
 *             basicProfile:
 *               summary: Basic profile update
 *               value:
 *                 name: "Maria Garcia"
 *                 bio: "Learning English to advance my career"
 *                 country: "Spain"
 *                 language: "es"
 *                 settings:
 *                   learning:
 *                     dailyGoal: 15
 *                     difficulty: "beginner"
 *             minimalUpdate:
 *               summary: Minimal profile update
 *               value:
 *                 name: "Alex Johnson"
 *                 country: "Canada"
 *     responses:
 *       '200':
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileUpdateResponse'
 *             examples:
 *               successResponse:
 *                 value:
 *                   success: true
 *                   message: "Profile updated successfully"
 *       '400':
 *         description: Invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Validation errors
 *                 value:
 *                   error:
 *                     - code: "invalid_type"
 *                       expected: "string"
 *                       received: "number"
 *                       path: ["name"]
 *                       message: "Expected string, received number"
 *                     - code: "too_small"
 *                       minimum: 1
 *                       type: "string"
 *                       inclusive: true
 *                       exact: false
 *                       path: ["bio"]
 *                       message: "Bio must be at least 1 character long"
 *               invalidCountry:
 *                 summary: Invalid country code
 *                 value:
 *                   error:
 *                     - code: "invalid_string"
 *                       validation: "regex"
 *                       path: ["country"]
 *                       message: "Invalid country format"
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
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               serverError:
 *                 value:
 *                   error: "Internal server error"
 *
 *   delete:
 *     summary: Delete user account permanently
 *     description: |
 *       Permanently deletes the authenticated user's account from both Clerk authentication
 *       service and the internal database. This action is irreversible and will remove
 *       all user data, progress, and associated records. The user will be immediately
 *       logged out and unable to access the application. Requires user authentication.
 *     tags:
 *       - Users
 *       - Profile
 *       - Account Management
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '204':
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountDeletionResponse'
 *             examples:
 *               accountDeleted:
 *                 summary: Account successfully deleted
 *                 value:
 *                   success: true
 *                   message: "User account deleted."
 *               noUserFound:
 *                 summary: No user found in database
 *                 value:
 *                   success: true
 *                   message: "No user found with that Clerk ID"
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
 *     NotificationSettings:
 *       type: object
 *       properties:
 *         email:
 *           type: boolean
 *           description: Enable email notifications
 *           example: true
 *         push:
 *           type: boolean
 *           description: Enable push notifications
 *           example: true
 *         dailyReminder:
 *           type: boolean
 *           description: Enable daily learning reminders
 *           example: true
 *         weeklyProgress:
 *           type: boolean
 *           description: Enable weekly progress reports
 *           example: true
 *         achievements:
 *           type: boolean
 *           description: Enable achievement notifications
 *           example: true
 *         streakReminder:
 *           type: boolean
 *           description: Enable streak maintenance reminders
 *           example: true
 *         lessonComplete:
 *           type: boolean
 *           description: Enable lesson completion notifications
 *           example: false
 *
 *     PrivacySettings:
 *       type: object
 *       properties:
 *         profileVisibility:
 *           type: string
 *           enum: [public, friends, private]
 *           description: Profile visibility level
 *           example: "public"
 *         showProgress:
 *           type: boolean
 *           description: Show learning progress to others
 *           example: true
 *         showCountry:
 *           type: boolean
 *           description: Show country in profile
 *           example: true
 *         allowMessages:
 *           type: boolean
 *           description: Allow messages from other users
 *           example: true
 *         showOnLeaderboard:
 *           type: boolean
 *           description: Appear on public leaderboards
 *           example: true
 *         dataSharing:
 *           type: boolean
 *           description: Allow anonymous data sharing for improvements
 *           example: false
 *
 *     LearningSettings:
 *       type: object
 *       properties:
 *         dailyGoal:
 *           type: integer
 *           minimum: 5
 *           maximum: 120
 *           description: Daily learning goal in minutes
 *           example: 30
 *         reminderTime:
 *           type: string
 *           pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: Daily reminder time in HH:MM format
 *           example: "19:00"
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Preferred learning difficulty
 *           example: "intermediate"
 *         autoAdvance:
 *           type: boolean
 *           description: Automatically advance to next lesson
 *           example: true
 *         practiceMode:
 *           type: string
 *           enum: [casual, focused, intensive]
 *           description: Learning practice mode
 *           example: "focused"
 *         enableHints:
 *           type: boolean
 *           description: Show hints during lessons
 *           example: true
 *         skipIntroductions:
 *           type: boolean
 *           description: Skip lesson introductions
 *           example: false
 *
 *     DisplaySettings:
 *       type: object
 *       properties:
 *         theme:
 *           type: string
 *           enum: [light, dark, auto]
 *           description: UI theme preference
 *           example: "light"
 *         language:
 *           type: string
 *           pattern: '^[a-z]{2}$'
 *           description: Interface language (ISO 639-1 code)
 *           example: "en"
 *         dateFormat:
 *           type: string
 *           enum: [MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD]
 *           description: Date display format
 *           example: "MM/DD/YYYY"
 *         timeFormat:
 *           type: string
 *           enum: [12h, 24h]
 *           description: Time display format
 *           example: "12h"
 *         fontSize:
 *           type: string
 *           enum: [small, medium, large]
 *           description: Interface font size
 *           example: "medium"
 *         animations:
 *           type: boolean
 *           description: Enable UI animations
 *           example: true
 *
 *     UserSettings:
 *       type: object
 *       properties:
 *         notifications:
 *           $ref: '#/components/schemas/NotificationSettings'
 *         privacy:
 *           $ref: '#/components/schemas/PrivacySettings'
 *         learning:
 *           $ref: '#/components/schemas/LearningSettings'
 *         display:
 *           $ref: '#/components/schemas/DisplaySettings'
 *
 *     ProfileUpdateRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         status:
 *           type: string
 *           enum: [active, away, busy, invisible]
 *           description: User's current status
 *           example: "active"
 *         bio:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: User's biography or description
 *           example: "Passionate language learner exploring Spanish and French"
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: User's full name
 *           example: "John Smith"
 *         avatar:
 *           type: string
 *           format: uri
 *           description: URL to user's profile picture
 *           example: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yYWJjMTIzZGVmNDU2In0"
 *         country:
 *           type: string
 *           pattern: '^[A-Z]{2}$|^[A-Za-z\s]+$'
 *           description: User's country (ISO code or full name)
 *           example: "United States"
 *         language:
 *           type: string
 *           pattern: '^[a-z]{2}$'
 *           description: User's preferred language (ISO 639-1 code)
 *           example: "en"
 *         timezone:
 *           type: string
 *           description: User's timezone (IANA timezone identifier)
 *           example: "America/New_York"
 *         settings:
 *           $ref: '#/components/schemas/UserSettings'
 *           description: User's application settings and preferences
 *
 *     ProfileUpdateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Profile updated successfully"
 *
 *     AccountDeletionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         message:
 *           type: string
 *           description: Deletion confirmation message
 *           example: "User account deleted."
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Error code
 *                 example: "invalid_type"
 *               expected:
 *                 type: string
 *                 description: Expected data type
 *                 example: "string"
 *               received:
 *                 type: string
 *                 description: Received data type
 *                 example: "number"
 *               path:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Path to the invalid field
 *                 example: ["name"]
 *               message:
 *                 type: string
 *                 description: Human-readable error message
 *                 example: "Expected string, received number"
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
 *     ProfileApiUsageExample:
 *       summary: How to use the Profile API with Axios
 *       description: |
 *         **Step 1: Update User Profile with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const updateUserProfile = async (profileData) => {
 *           try {
 *             const response = await axios.put('/api/users/profile', profileData, {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`,
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.message || 'Failed to update profile');
 *             }
 *           } catch (error) {
 *             console.error('Failed to update profile:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const basicUpdate = await updateUserProfile({
 *           name: "John Smith",
 *           bio: "Learning Spanish and French",
 *           country: "United States"
 *         });
 *
 *         const completeUpdate = await updateUserProfile({
 *           status: "active",
 *           bio: "Passionate language learner",
 *           name: "Maria Garcia",
 *           avatar: "https://example.com/avatar.jpg",
 *           country: "Spain",
 *           language: "es",
 *           timezone: "Europe/Madrid",
 *           settings: {
 *             notifications: {
 *               email: true,
 *               push: true,
 *               dailyReminder: true
 *             },
 *             learning: {
 *               dailyGoal: 30,
 *               difficulty: "intermediate"
 *             }
 *           }
 *         });
 *         ```
 *
 *         **Step 2: Delete User Account**
 *         ```javascript
 *         const deleteUserAccount = async () => {
 *           try {
 *             const confirmed = window.confirm(
 *               'Are you sure you want to delete your account? This action cannot be undone.'
 *             );
 *
 *             if (!confirmed) {
 *               return { cancelled: true };
 *             }
 *
 *             const response = await axios.delete('/api/users/profile', {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               // Clear local storage and redirect
 *               localStorage.clear();
 *               window.location.href = '/';
 *               return response.data;
 *             } else {
 *               throw new Error(response.data.message || 'Failed to delete account');
 *             }
 *           } catch (error) {
 *             console.error('Failed to delete account:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage
 *         const deletionResult = await deleteUserAccount();
 *         ```
 *
 *         **Step 3: Create a Profile Service**
 *         ```javascript
 *         class ProfileService {
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
 *           async updateProfile(profileData) {
 *             try {
 *               const response = await this.client.put('/profile', profileData);
 *
 *               if (response.data.success) {
 *                 // Update local cache if you have one
 *                 this.updateLocalProfile(profileData);
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.message || 'Failed to update profile');
 *               }
 *             } catch (error) {
 *               console.error('Profile service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async updateBasicInfo(name, bio, country) {
 *             return this.updateProfile({
 *               name,
 *               bio,
 *               country
 *             });
 *           }
 *
 *           async updateAvatar(avatarUrl) {
 *             return this.updateProfile({
 *               avatar: avatarUrl
 *             });
 *           }
 *
 *           async updateSettings(settings) {
 *             return this.updateProfile({
 *               settings
 *             });
 *           }
 *
 *           async updateNotificationSettings(notifications) {
 *             return this.updateProfile({
 *               settings: {
 *                 notifications
 *               }
 *             });
 *           }
 *
 *           async updatePrivacySettings(privacy) {
 *             return this.updateProfile({
 *               settings: {
 *                 privacy
 *               }
 *             });
 *           }
 *
 *           async updateLearningSettings(learning) {
 *             return this.updateProfile({
 *               settings: {
 *                 learning
 *               }
 *             });
 *           }
 *
 *           async updateDisplaySettings(display) {
 *             return this.updateProfile({
 *               settings: {
 *                 display
 *               }
 *             });
 *           }
 *
 *           async deleteAccount() {
 *             try {
 *               const response = await this.client.delete('/profile');
 *
 *               if (response.data.success) {
 *                 // Clear all local data
 *                 localStorage.clear();
 *                 sessionStorage.clear();
 *
 *                 // Clear any cached data
 *                 this.clearLocalProfile();
 *
 *                 return response.data;
 *               } else {
 *                 throw new Error(response.data.message || 'Failed to delete account');
 *               }
 *             } catch (error) {
 *               console.error('Account deletion error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           // Helper methods
 *           updateLocalProfile(profileData) {
 *             const existingProfile = this.getLocalProfile();
 *             const updatedProfile = { ...existingProfile, ...profileData };
 *             localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
 *           }
 *
 *           getLocalProfile() {
 *             try {
 *               const profile = localStorage.getItem('userProfile');
 *               return profile ? JSON.parse(profile) : {};
 *             } catch (error) {
 *               console.error('Error parsing local profile:', error);
 *               return {};
 *             }
 *           }
 *
 *           clearLocalProfile() {
 *             localStorage.removeItem('userProfile');
 *           }
 *
 *           validateProfileData(profileData) {
 *             const errors = [];
 *
 *             if (profileData.name && typeof profileData.name !== 'string') {
 *               errors.push('Name must be a string');
 *             }
 *
 *             if (profileData.bio && profileData.bio.length > 500) {
 *               errors.push('Bio must be 500 characters or less');
 *             }
 *
 *             if (profileData.language && !/^[a-z]{2}$/.test(profileData.language)) {
 *               errors.push('Language must be a valid ISO 639-1 code');
 *             }
 *
 *             if (profileData.settings?.learning?.dailyGoal) {
 *               const goal = profileData.settings.learning.dailyGoal;
 *               if (goal < 5 || goal > 120) {
 *                 errors.push('Daily goal must be between 5 and 120 minutes');
 *               }
 *             }
 *
 *             return errors;
 *           }
 *
 *           async validateAndUpdateProfile(profileData) {
 *             const validationErrors = this.validateProfileData(profileData);
 *
 *             if (validationErrors.length > 0) {
 *               throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
 *             }
 *
 *             return this.updateProfile(profileData);
 *           }
 *         }
 *
 *         export const profileService = new ProfileService();
 *         ```
 *
 *     ReactProfileFormExample:
 *       summary: React component for profile management
 *       description: |
 *         ```typescript
 *         import React, { useState, useEffect } from 'react';
 *         import axios from 'axios';
 *
 *         interface ProfileData {
 *           status?: string;
 *           bio?: string;
 *           name: string;
 *           avatar?: string;
 *           country?: string;
 *           language?: string;
 *           timezone?: string;
 *           settings?: {
 *             notifications?: any;
 *             privacy?: any;
 *             learning?: any;
 *             display?: any;
 *           };
 *         }
 *
 *         export function ProfileForm() {
 *           const [profile, setProfile] = useState<ProfileData>({
 *             name: '',
 *             bio: '',
 *             country: '',
 *             language: 'en',
 *             status: 'active'
 *           });
 *           const [loading, setLoading] = useState(false);
 *           const [error, setError] = useState<string | null>(null);
 *           const [success, setSuccess] = useState(false);
 *
 *           const handleInputChange = (field: keyof ProfileData, value: any) => {
 *             setProfile(prev => ({
 *               ...prev,
 *               [field]: value
 *             }));
 *           };
 *
 *           const handleSettingsChange = (category: string, setting: string, value: any) => {
 *             setProfile(prev => ({
 *               ...prev,
 *               settings: {
 *                 ...prev.settings,
 *                 [category]: {
 *                   ...prev.settings?.[category],
 *                   [setting]: value
 *                 }
 *               }
 *             }));
 *           };
 *
 *           const handleSubmit = async (e: React.FormEvent) => {
 *             e.preventDefault();
 *             setLoading(true);
 *             setError(null);
 *             setSuccess(false);
 *
 *             try {
 *               const response = await axios.put('/api/users/profile', profile);
 *
 *               if (response.data.success) {
 *                 setSuccess(true);
 *                 setTimeout(() => setSuccess(false), 3000);
 *               } else {
 *                 setError(response.data.message || 'Failed to update profile');
 *               }
 *             } catch (err) {
 *               if (axios.isAxiosError(err)) {
 *                 if (err.response?.status === 400) {
 *                   const validationErrors = err.response.data.error;
 *                   if (Array.isArray(validationErrors)) {
 *                     setError(validationErrors.map(e => e.message).join(', '));
 *                   } else {
 *                     setError('Validation error occurred');
 *                   }
 *                 } else if (err.response?.status === 401) {
 *                   setError('Please log in to update your profile');
 *                 } else {
 *                   setError(err.response?.data?.error || 'Failed to update profile');
 *                 }
 *               } else {
 *                 setError('An unexpected error occurred');
 *               }
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           const handleDeleteAccount = async () => {
 *             const confirmed = window.confirm(
 *               'Are you sure you want to delete your account? This action cannot be undone.'
 *             );
 *
 *             if (!confirmed) return;
 *
 *             try {
 *               setLoading(true);
 *               const response = await axios.delete('/api/users/profile');
 *
 *               if (response.data.success) {
 *                 alert('Account deleted successfully');
 *                 localStorage.clear();
 *                 window.location.href = '/';
 *               }
 *             } catch (err) {
 *               setError('Failed to delete account');
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           return (
 *             <div className="profile-form">
 *               <h2>Profile Settings</h2>
 *
 *               {error && (
 *                 <div className="error-message">
 *                   {error}
 *                 </div>
 *               )}
 *
 *               {success && (
 *                 <div className="success-message">
 *                   Profile updated successfully!
 *                 </div>
 *               )}
 *
 *               <form onSubmit={handleSubmit}>
 *                 <div className="form-section">
 *                   <h3>Basic Information</h3>
 *
 *                   <div className="form-group">
 *                     <label htmlFor="name">Full Name *</label>
 *                     <input
 *                       type="text"
 *                       id="name"
 *                       value={profile.name}
 *                       onChange={(e) => handleInputChange('name', e.target.value)}
 *                       required
 *                       maxLength={100}
 *                     />
 *                   </div>
 *
 *                   <div className="form-group">
 *                     <label htmlFor="bio">Bio</label>
 *                     <textarea
 *                       id="bio"
 *                       value={profile.bio || ''}
 *                       onChange={(e) => handleInputChange('bio', e.target.value)}
 *                       maxLength={500}
 *                       rows={4}
 *                       placeholder="Tell us about yourself..."
 *                     />
 *                     <small>{(profile.bio || '').length}/500 characters</small>
 *                   </div>
 *
 *                   <div className="form-group">
 *                     <label htmlFor="status">Status</label>
 *                     <select
 *                       id="status"
 *                       value={profile.status || 'active'}
 *                       onChange={(e) => handleInputChange('status', e.target.value)}
 *                     >
 *                       <option value="active">Active</option>
 *                       <option value="away">Away</option>
 *                       <option value="busy">Busy</option>
 *                       <option value="invisible">Invisible</option>
 *                     </select>
 *                   </div>
 *
 *                   <div className="form-group">
 *                     <label htmlFor="country">Country</label>
 *                     <input
 *                       type="text"
 *                       id="country"
 *                       value={profile.country || ''}
 *                       onChange={(e) => handleInputChange('country', e.target.value)}
 *                       placeholder="e.g., United States"
 *                     />
 *                   </div>
 *
 *                   <div className="form-group">
 *                     <label htmlFor="language">Interface Language</label>
 *                     <select
 *                       id="language"
 *                       value={profile.language || 'en'}
 *                       onChange={(e) => handleInputChange('language', e.target.value)}
 *                     >
 *                       <option value="en">English</option>
 *                       <option value="es">Español</option>
 *                       <option value="fr">Français</option>
 *                       <option value="de">Deutsch</option>
 *                       <option value="it">Italiano</option>
 *                       <option value="pt">Português</option>
 *                     </select>
 *                   </div>
 *                 </div>
 *
 *                 <div className="form-section">
 *                   <h3>Learning Preferences</h3>
 *
 *                   <div className="form-group">
 *                     <label htmlFor="dailyGoal">Daily Goal (minutes)</label>
 *                     <input
 *                       type="number"
 *                       id="dailyGoal"
 *                       min={5}
 *                       max={120}
 *                       value={profile.settings?.learning?.dailyGoal || 30}
 *                       onChange={(e) => handleSettingsChange('learning', 'dailyGoal', parseInt(e.target.value))}
 *                     />
 *                   </div>
 *
 *                   <div className="form-group">
 *                     <label htmlFor="difficulty">Difficulty Level</label>
 *                     <select
 *                       id="difficulty"
 *                       value={profile.settings?.learning?.difficulty || 'intermediate'}
 *                       onChange={(e) => handleSettingsChange('learning', 'difficulty', e.target.value)}
 *                     >
 *                       <option value="beginner">Beginner</option>
 *                       <option value="intermediate">Intermediate</option>
 *                       <option value="advanced">Advanced</option>
 *                     </select>
 *                   </div>
 *
 *                   <div className="form-group">
 *                     <label>
 *                       <input
 *                         type="checkbox"
 *                         checked={profile.settings?.learning?.autoAdvance || false}
 *                         onChange={(e) => handleSettingsChange('learning', 'autoAdvance', e.target.checked)}
 *                       />
 *                       Auto-advance to next lesson
 *                     </label>
 *                   </div>
 *                 </div>
 *
 *                 <div className="form-section">
 *                   <h3>Notifications</h3>
 *
 *                   <div className="form-group">
 *                     <label>
 *                       <input
 *                         type="checkbox"
 *                         checked={profile.settings?.notifications?.email || false}
 *                         onChange={(e) => handleSettingsChange('notifications', 'email', e.target.checked)}
 *                       />
 *                       Email notifications
 *                     </label>
 *                   </div>
 *
 *                   <div className="form-group">
 *                     <label>
 *                       <input
 *                         type="checkbox"
 *                         checked={profile.settings?.notifications?.dailyReminder || false}
 *                         onChange={(e) => handleSettingsChange('notifications', 'dailyReminder', e.target.checked)}
 *                       />
 *                       Daily learning reminders
 *                     </label>
 *                   </div>
 *
 *                   <div className="form-group">
 *                     <label>
 *                       <input
 *                         type="checkbox"
 *                         checked={profile.settings?.notifications?.achievements || false}
 *                         onChange={(e) => handleSettingsChange('notifications', 'achievements', e.target.checked)}
 *                       />
 *                       Achievement notifications
 *                     </label>
 *                   </div>
 *                 </div>
 *
 *                 <div className="form-actions">
 *                   <button
 *                     type="submit"
 *                     disabled={loading}
 *                     className="save-button"
 *                   >
 *                     {loading ? 'Saving...' : 'Save Changes'}
 *                   </button>
 *                 </div>
 *               </form>
 *
 *               <div className="danger-zone">
 *                 <h3>Danger Zone</h3>
 *                 <p>Once you delete your account, there is no going back. Please be certain.</p>
 *                 <button
 *                   onClick={handleDeleteAccount}
 *                   disabled={loading}
 *                   className="delete-button"
 *                 >
 *                   Delete Account
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
 *   - name: Profile
 *     description: User profile management and customization
 *   - name: Settings
 *     description: User preferences and application settings
 *   - name: Account Management
 *     description: Account lifecycle operations including deletion
 */
export async function PUT(req: NextRequest) {
  try {
    // Get the current user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const body = await req.json();

    // Validate the request body
    try {
      profileSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({ error: error.errors }, { status: 400 });
      }
      throw error;
    }

    const { status, bio, name, avatar, country, language, timezone, settings } =
      body;

    // Split name into first and last name
    const nameParts = name.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    // Connect to the database
    await connectDB();

    // Get the user from our database
    // const user = await UserModel.findByClerkId(userId);

    // Update the user in Clerk
    (await clerkClient()).users.updateUser(userId, {
      firstName,
      lastName,
      publicMetadata: {
        bio,
        name,
        avatar,
        status,
        country,
        language,
        timezone,
        settings,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Get the current user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    (await clerkClient()).users.deleteUser(userId);

    const deletedUser = await UserModel.findOneAndDelete({ clerkId: userId });
    if (!deletedUser) {
      return NextResponse.json(
        {
          success: true,
          message: "No user found with that Clerk ID",
        },
        { status: 204 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "User account deleted.",
      },
      { status: 204 }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
