import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { SubscriptionPlanDoc, TransformedPlan } from "@/types";
import { auth } from "@clerk/nextjs/server";

/**
 * @swagger
 * /api/subscriptions/plans/{id}:
 *   get:
 *     summary: Get subscription plan by ID
 *     description: |
 *       Retrieves a specific subscription plan by its unique identifier.
 *       Returns detailed plan information including pricing, features, limits,
 *       promotional pricing, and Stripe integration details. Only visible
 *       and active plans are returned. Requires user authentication.
 *     tags:
 *       - Subscriptions
 *       - Plans
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Unique identifier of the subscription plan
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       '200':
 *         description: Successfully retrieved subscription plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionPlanResponse'
 *             examples:
 *               basicPlan:
 *                 summary: Basic subscription plan
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "507f1f77bcf86cd799439011"
 *                     name: "Basic Plan"
 *                     slug: "basic-monthly"
 *                     description: "Perfect for individual learners starting their language journey. Includes essential features to get you started with unlimited lessons and basic progress tracking."
 *                     shortDescription: "Essential features for language learning"
 *                     price: 999
 *                     currency: "USD"
 *                     billingCycle: "monthly"
 *                     trialPeriodDays: 7
 *                     features:
 *                       - "Unlimited lessons"
 *                       - "Basic progress tracking"
 *                       - "Mobile app access"
 *                       - "Community support"
 *                       - "Offline lesson downloads"
 *                     maxUsers: 1
 *                     maxProjects: 5
 *                     maxStorage: 1073741824
 *                     maxApiCalls: 1000
 *                     status: "active"
 *                     isPopular: false
 *                     isVisible: true
 *                     sortOrder: 1
 *                     promotionalPrice: null
 *                     promotionalPeriod: null
 *                     stripeProductId: "prod_basic_monthly"
 *                     stripePriceId: "price_basic_monthly"
 *                     metadata:
 *                       category: "individual"
 *                       level: "basic"
 *                       targetAudience: "beginners"
 *                       recommendedFor: ["students", "casual-learners"]
 *                     createdAt: "2024-01-15T10:00:00Z"
 *                     updatedAt: "2024-01-15T10:00:00Z"
 *                     formattedPrice: "9.99"
 *                     currentPrice: 999
 *                     isOnPromotion: false
 *               premiumPlanWithPromotion:
 *                 summary: Premium plan with active promotion
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "507f1f77bcf86cd799439012"
 *                     name: "Premium Plan"
 *                     slug: "premium-monthly"
 *                     description: "Advanced features for serious language learners who want to accelerate their progress with personalized learning paths and detailed analytics."
 *                     shortDescription: "All features plus advanced analytics"
 *                     price: 1999
 *                     currency: "USD"
 *                     billingCycle: "monthly"
 *                     trialPeriodDays: 14
 *                     features:
 *                       - "Everything in Basic"
 *                       - "Advanced progress analytics"
 *                       - "Personalized learning paths"
 *                       - "Priority support"
 *                       - "Offline mode"
 *                       - "Custom study schedules"
 *                       - "Speech recognition"
 *                       - "Unlimited hearts"
 *                       - "No ads"
 *                     maxUsers: 1
 *                     maxProjects: 20
 *                     maxStorage: 5368709120
 *                     maxApiCalls: 5000
 *                     status: "active"
 *                     isPopular: true
 *                     isVisible: true
 *                     sortOrder: 2
 *                     promotionalPrice: 1499
 *                     promotionalPeriod:
 *                       startDate: "2024-01-01T00:00:00Z"
 *                       endDate: "2024-02-29T23:59:59Z"
 *                     stripeProductId: "prod_premium_monthly"
 *                     stripePriceId: "price_premium_monthly"
 *                     metadata:
 *                       category: "individual"
 *                       level: "premium"
 *                       badge: "Most Popular"
 *                       targetAudience: "serious-learners"
 *                       recommendedFor: ["professionals", "students", "travelers"]
 *                       features_highlight: ["analytics", "personalization", "priority-support"]
 *                     createdAt: "2024-01-15T10:00:00Z"
 *                     updatedAt: "2024-01-20T15:30:00Z"
 *                     formattedPrice: "19.99"
 *                     currentPrice: 1499
 *                     isOnPromotion: true
 *               proPlan:
 *                 summary: Professional plan for teams
 *                 value:
 *                   success: true
 *                   data:
 *                     id: "507f1f77bcf86cd799439013"
 *                     name: "Pro Plan"
 *                     slug: "pro-monthly"
 *                     description: "Professional features designed for educators, teams, and organizations who need advanced management tools and collaboration features."
 *                     shortDescription: "Team collaboration and advanced tools"
 *                     price: 4999
 *                     currency: "USD"
 *                     billingCycle: "monthly"
 *                     trialPeriodDays: 30
 *                     features:
 *                       - "Everything in Premium"
 *                       - "Team management dashboard"
 *                       - "Advanced reporting & analytics"
 *                       - "API access"
 *                       - "White-label options"
 *                       - "Dedicated account manager"
 *                       - "Custom integrations"
 *                       - "Bulk user management"
 *                       - "Advanced security features"
 *                       - "Priority phone support"
 *                     maxUsers: 10
 *                     maxProjects: 100
 *                     maxStorage: 21474836480
 *                     maxApiCalls: 25000
 *                     status: "active"
 *                     isPopular: false
 *                     isVisible: true
 *                     sortOrder: 3
 *                     promotionalPrice: null
 *                     promotionalPeriod: null
 *                     stripeProductId: "prod_pro_monthly"
 *                     stripePriceId: "price_pro_monthly"
 *                     metadata:
 *                       category: "team"
 *                       level: "professional"
 *                       targetAudience: "organizations"
 *                       recommendedFor: ["schools", "companies", "training-centers"]
 *                       features_highlight: ["team-management", "api-access", "white-label"]
 *                     createdAt: "2024-01-15T10:00:00Z"
 *                     updatedAt: "2024-01-15T10:00:00Z"
 *                     formattedPrice: "49.99"
 *                     currentPrice: 4999
 *                     isOnPromotion: false
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
 *         description: Plan not found or not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 *             examples:
 *               planNotFound:
 *                 summary: Plan does not exist
 *                 value:
 *                   success: false
 *                   message: "Subscription plan not found"
 *               planNotVisible:
 *                 summary: Plan exists but is not visible
 *                 value:
 *                   success: false
 *                   message: "Subscription plan not available"
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
 *                   message: "Failed to fetch subscription plan"
 *                   error: "Database connection failed"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PromotionalPeriod:
 *       type: object
 *       properties:
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Start date of the promotional period
 *           example: "2024-01-01T00:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: End date of the promotional period
 *           example: "2024-02-29T23:59:59Z"
 *
 *     DetailedSubscriptionPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: objectId
 *           description: Unique identifier for the subscription plan
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Display name of the subscription plan
 *           example: "Premium Plan"
 *         slug:
 *           type: string
 *           description: URL-friendly identifier for the plan
 *           example: "premium-monthly"
 *         description:
 *           type: string
 *           description: Detailed description of the plan and its benefits
 *           example: "Advanced features for serious language learners who want to accelerate their progress"
 *         shortDescription:
 *           type: string
 *           description: Brief description for display in cards
 *           example: "All features plus advanced analytics"
 *         price:
 *           type: integer
 *           description: Price in cents (e.g., 1999 = $19.99)
 *           example: 1999
 *         currency:
 *           type: string
 *           description: Currency code for the price
 *           example: "USD"
 *         billingCycle:
 *           type: string
 *           enum: [monthly, yearly, quarterly]
 *           description: Billing frequency for the plan
 *           example: "monthly"
 *         trialPeriodDays:
 *           type: integer
 *           minimum: 0
 *           description: Number of free trial days
 *           example: 14
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           description: Comprehensive list of features included in the plan
 *           example: ["Unlimited lessons", "Advanced analytics", "Priority support", "Offline mode"]
 *         maxUsers:
 *           type: integer
 *           minimum: 1
 *           description: Maximum number of users allowed
 *           example: 1
 *         maxProjects:
 *           type: integer
 *           minimum: 0
 *           description: Maximum number of projects allowed
 *           example: 20
 *         maxStorage:
 *           type: integer
 *           minimum: 0
 *           description: Maximum storage in bytes
 *           example: 5368709120
 *         maxApiCalls:
 *           type: integer
 *           minimum: 0
 *           description: Maximum API calls per month
 *           example: 5000
 *         status:
 *           type: string
 *           enum: [active, inactive, deprecated]
 *           description: Current status of the plan
 *           example: "active"
 *         isPopular:
 *           type: boolean
 *           description: Whether this plan is marked as popular/recommended
 *           example: true
 *         isVisible:
 *           type: boolean
 *           description: Whether this plan is visible to users
 *           example: true
 *         sortOrder:
 *           type: integer
 *           description: Order for displaying plans
 *           example: 2
 *         promotionalPrice:
 *           type: integer
 *           nullable: true
 *           description: Promotional price in cents (if applicable)
 *           example: 1499
 *         promotionalPeriod:
 *           $ref: '#/components/schemas/PromotionalPeriod'
 *           nullable: true
 *           description: Period when promotional pricing is active
 *         stripeProductId:
 *           type: string
 *           description: Stripe product identifier for payment processing
 *           example: "prod_premium_monthly"
 *         stripePriceId:
 *           type: string
 *           description: Stripe price identifier for payment processing
 *           example: "price_premium_monthly"
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Additional metadata and configuration for the plan
 *           example:
 *             category: "individual"
 *             level: "premium"
 *             badge: "Most Popular"
 *             targetAudience: "serious-learners"
 *             recommendedFor: ["professionals", "students", "travelers"]
 *             features_highlight: ["analytics", "personalization", "priority-support"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the plan was created
 *           example: "2024-01-15T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the plan was last updated
 *           example: "2024-01-20T15:30:00Z"
 *         formattedPrice:
 *           type: string
 *           description: Human-readable price format
 *           example: "19.99"
 *         currentPrice:
 *           type: integer
 *           description: Current effective price (promotional or regular)
 *           example: 1499
 *         isOnPromotion:
 *           type: boolean
 *           description: Whether the plan is currently on promotion
 *           example: true
 *
 *     SubscriptionPlanResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/DetailedSubscriptionPlan'
 *           description: Detailed subscription plan information
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Unauthorized"
 *
 *     NotFoundResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for not found)
 *           example: false
 *         message:
 *           type: string
 *           description: Not found message
 *           example: "Subscription plan not found"
 *
 *     ServerErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status (always false for errors)
 *           example: false
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Failed to fetch subscription plan"
 *         error:
 *           type: string
 *           description: Detailed error message
 *           example: "Database connection failed"
 *
 *   examples:
 *     SubscriptionPlanByIdApiUsageExample:
 *       summary: How to use the Subscription Plan by ID API with Axios
 *       description: |
 *         **Step 1: Fetch Specific Plan with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const fetchSubscriptionPlan = async (planId) => {
 *           try {
 *             const response = await axios.get(`/api/subscriptions/plans/${planId}`, {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data.data;
 *             } else {
 *               throw new Error(response.data.message || 'Failed to fetch plan');
 *             }
 *           } catch (error) {
 *             console.error('Failed to fetch subscription plan:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const premiumPlan = await fetchSubscriptionPlan('507f1f77bcf86cd799439012');
 *         const basicPlan = await fetchSubscriptionPlan('507f1f77bcf86cd799439011');
 *         ```
 *
 *         **Step 2: Handle Plan Details and Display**
 *         ```javascript
 *         const displayPlanDetails = async (planId) => {
 *           try {
 *             const plan = await fetchSubscriptionPlan(planId);
 *
 *             console.log(`PLAN DETAILS: ${plan.name}`);
 *             console.log('='.repeat(50));
 *             console.log(`Description: ${plan.description}`);
 *             console.log(`Slug: ${plan.slug}`);
 *             console.log('');
 *
 *             // Pricing information
 *             console.log('PRICING:');
 *             if (plan.isOnPromotion) {
 *               const originalPrice = (plan.price / 100).toFixed(2);
 *               const currentPrice = (plan.currentPrice / 100).toFixed(2);
 *               const savings = ((plan.price - plan.currentPrice) / plan.price * 100).toFixed(0);
 *               console.log(`  🎉 PROMOTIONAL PRICE: $${currentPrice}/${plan.billingCycle}`);
 *               console.log(`  Regular Price: $${originalPrice}/${plan.billingCycle}`);
 *               console.log(`  You Save: ${savings}% ($${(plan.price - plan.currentPrice) / 100})`);
 *
 *               if (plan.promotionalPeriod) {
 *                 const endDate = new Date(plan.promotionalPeriod.endDate);
 *                 console.log(`  Promotion ends: ${endDate.toLocaleDateString()}`);
 *               }
 *             } else {
 *               console.log(`  Price: $${plan.formattedPrice}/${plan.billingCycle}`);
 *             }
 *
 *             if (plan.trialPeriodDays > 0) {
 *               console.log(`  Free Trial: ${plan.trialPeriodDays} days`);
 *             }
 *             console.log('');
 *
 *             // Features
 *             console.log('FEATURES INCLUDED:');
 *             plan.features.forEach((feature, index) => {
 *               console.log(`  ${index + 1}. ${feature}`);
 *             });
 *             console.log('');
 *
 *             // Limits and quotas
 *             console.log('LIMITS & QUOTAS:');
 *             console.log(`  Users: ${plan.maxUsers}`);
 *             console.log(`  Projects: ${plan.maxProjects}`);
 *             console.log(`  Storage: ${formatBytes(plan.maxStorage)}`);
 *             console.log(`  API Calls: ${plan.maxApiCalls.toLocaleString()}/month`);
 *             console.log('');
 *
 *             // Plan metadata
 *             if (plan.metadata) {
 *               console.log('ADDITIONAL INFO:');
 *               if (plan.metadata.category) console.log(`  Category: ${plan.metadata.category}`);
 *               if (plan.metadata.level) console.log(`  Level: ${plan.metadata.level}`);
 *               if (plan.metadata.targetAudience) console.log(`  Target: ${plan.metadata.targetAudience}`);
 *               if (plan.metadata.recommendedFor) {
 *                 console.log(`  Recommended for: ${plan.metadata.recommendedFor.join(', ')}`);
 *               }
 *               if (plan.isPopular) console.log(`  ⭐ ${plan.metadata.badge || 'Popular Choice'}`);
 *             }
 *
 *             // Stripe integration
 *             console.log('');
 *             console.log('PAYMENT INTEGRATION:');
 *             console.log(`  Stripe Product ID: ${plan.stripeProductId}`);
 *             console.log(`  Stripe Price ID: ${plan.stripePriceId}`);
 *
 *             return plan;
 *           } catch (error) {
 *             if (error.response?.status === 404) {
 *               console.error('Plan not found or not available');
 *             } else {
 *               console.error('Error fetching plan details:', error);
 *             }
 *           }
 *         };
 *
 *         const formatBytes = (bytes) => {
 *           if (bytes === 0) return '0 Bytes';
 *           const k = 1024;
 *           const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
 *           const i = Math.floor(Math.log(bytes) / Math.log(k));
 *           return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
 *         };
 *         ```
 *
 *         **Step 3: Create a Plan Details Service**
 *         ```javascript
 *         class PlanDetailsService {
 *           constructor() {
 *             this.client = axios.create({
 *               baseURL: '/api/subscriptions/plans',
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             this.setupInterceptors();
 *             this.cache = new Map();
 *             this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
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
 *           async getPlanById(planId, useCache = true) {
 *             // Check cache
 *             if (useCache && this.cache.has(planId)) {
 *               const cached = this.cache.get(planId);
 *               if (Date.now() - cached.timestamp < this.cacheTimeout) {
 *                 return cached.data;
 *               }
 *             }
 *
 *             try {
 *               const response = await this.client.get(`/${planId}`);
 *
 *               if (response.data.success) {
 *                 // Cache the result
 *                 this.cache.set(planId, {
 *                   data: response.data.data,
 *                   timestamp: Date.now()
 *                 });
 *
 *                 return response.data.data;
 *               } else {
 *                 throw new Error(response.data.message || 'Failed to fetch plan');
 *               }
 *             } catch (error) {
 *               console.error('Plan details service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async validatePlanExists(planId) {
 *             try {
 *               await this.getPlanById(planId);
 *               return true;
 *             } catch (error) {
 *               if (error.response?.status === 404) {
 *                 return false;
 *               }
 *               throw error;
 *             }
 *           }
 *
 *           async getPlanPricingInfo(planId) {
 *             const plan = await this.getPlanById(planId);
 *
 *             return {
 *               planId: plan.id,
 *               name: plan.name,
 *               regularPrice: plan.price,
 *               currentPrice: plan.currentPrice,
 *               formattedRegularPrice: (plan.price / 100).toFixed(2),
 *               formattedCurrentPrice: (plan.currentPrice / 100).toFixed(2),
 *               currency: plan.currency,
 *               billingCycle: plan.billingCycle,
 *               isOnPromotion: plan.isOnPromotion,
 *               savings: plan.isOnPromotion ?
 *                 {
 *                   amount: plan.price - plan.currentPrice,
 *                   percentage: Math.round((plan.price - plan.currentPrice) / plan.price * 100),
 *                   formattedAmount: ((plan.price - plan.currentPrice) / 100).toFixed(2)
 *                 } : null,
 *               trialPeriodDays: plan.trialPeriodDays,
 *               promotionalPeriod: plan.promotionalPeriod,
 *               stripeProductId: plan.stripeProductId,
 *               stripePriceId: plan.stripePriceId
 *             };
 *           }
 *
 *           async getPlanFeatures(planId) {
 *             const plan = await this.getPlanById(planId);
 *
 *             return {
 *               planId: plan.id,
 *               name: plan.name,
 *               features: plan.features,
 *               limits: {
 *                 users: plan.maxUsers,
 *                 projects: plan.maxProjects,
 *                 storage: plan.maxStorage,
 *                 apiCalls: plan.maxApiCalls
 *               },
 *               formattedLimits: {
 *                 users: plan.maxUsers.toLocaleString(),
 *                 projects: plan.maxProjects.toLocaleString(),
 *                 storage: this.formatBytes(plan.maxStorage),
 *                 apiCalls: plan.maxApiCalls.toLocaleString()
 *               }
 *             };
 *           }
 *
 *           async getPlanMetadata(planId) {
 *             const plan = await this.getPlanById(planId);
 *
 *             return {
 *               planId: plan.id,
 *               name: plan.name,
 *               slug: plan.slug,
 *               description: plan.description,
 *               shortDescription: plan.shortDescription,
 *               isPopular: plan.isPopular,
 *               sortOrder: plan.sortOrder,
 *               status: plan.status,
 *               metadata: plan.metadata,
 *               createdAt: plan.createdAt,
 *               updatedAt: plan.updatedAt
 *             };
 *           }
 *
 *           async comparePlanWithOthers(planId, otherPlanIds) {
 *             const [targetPlan, ...otherPlans] = await Promise.all([
 *               this.getPlanById(planId),
 *               ...otherPlanIds.map(id => this.getPlanById(id))
 *             ]);
 *
 *             return {
 *               target: targetPlan,
 *               comparisons: otherPlans.map(plan => ({
 *                 plan,
 *                 priceDifference: plan.currentPrice - targetPlan.currentPrice,
 *                 featuresDifference: plan.features.length - targetPlan.features.length,
 *                 usersDifference: plan.maxUsers - targetPlan.maxUsers,
 *                 projectsDifference: plan.maxProjects - targetPlan.maxProjects,
 *                 storageDifference: plan.maxStorage - targetPlan.maxStorage,
 *                 apiCallsDifference: plan.maxApiCalls - targetPlan.maxApiCalls
 *               }))
 *             };
 *           }
 *
 *           // Helper methods
 *           formatBytes(bytes) {
 *             if (bytes === 0) return '0 Bytes';
 *             const k = 1024;
 *             const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
 *             const i = Math.floor(Math.log(bytes) / Math.log(k));
 *             return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
 *           }
 *
 *           formatPrice(price, currency = 'USD') {
 *             return new Intl.NumberFormat('en-US', {
 *               style: 'currency',
 *               currency: currency
 *             }).format(price / 100);
 *           }
 *
 *           clearCache() {
 *             this.cache.clear();
 *           }
 *         }
 *
 *         export const planDetailsService = new PlanDetailsService();
 *         ```
 *
 *     ReactPlanDetailsComponentExample:
 *       summary: React component for plan details
 *       description: |
 *         ```typescript
 *         import React, { useState, useEffect } from 'react';
 *         import { useParams } from 'react-router-dom';
 *         import axios from 'axios';
 *
 *         interface SubscriptionPlan {
 *           id: string;
 *           name: string;
 *           slug: string;
 *           description: string;
 *           shortDescription: string;
 *           price: number;
 *           currency: string;
 *           billingCycle: string;
 *           trialPeriodDays: number;
 *           features: string[];
 *           maxUsers: number;
 *           maxProjects: number;
 *           maxStorage: number;
 *           maxApiCalls: number;
 *           isPopular: boolean;
 *           promotionalPrice?: number;
 *           promotionalPeriod?: {
 *             startDate: string;
 *             endDate: string;
 *           };
 *           formattedPrice: string;
 *           currentPrice: number;
 *           isOnPromotion: boolean;
 *           stripeProductId: string;
 *           stripePriceId: string;
 *           metadata?: Record<string, any>;
 *         }
 *
 *         export function PlanDetailsPage() {
 *           const { planId } = useParams<{ planId: string }>();
 *           const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState<string | null>(null);
 *
 *           useEffect(() => {
 *             if (planId) {
 *               fetchPlanDetails();
 *             }
 *           }, [planId]);
 *
 *           const fetchPlanDetails = async () => {
 *             try {
 *               setLoading(true);
 *               setError(null);
 *
 *               const response = await axios.get(`/api/subscriptions/plans/${planId}`);
 *
 *               if (response.data.success) {
 *                 setPlan(response.data.data);
 *               } else {
 *                 setError(response.data.message || 'Failed to fetch plan details');
 *               }
 *             } catch (err) {
 *               if (axios.isAxiosError(err)) {
 *                 if (err.response?.status === 404) {
 *                   setError('Subscription plan not found or not available');
 *                 } else if (err.response?.status === 401) {
 *                   setError('Please log in to view plan details');
 *                 } else {
 *                   setError(err.response?.data?.message || 'Failed to fetch plan details');
 *                 }
 *               } else {
 *                 setError('An unexpected error occurred');
 *               }
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           const formatStorage = (bytes: number) => {
 *             if (bytes === 0) return '0 Bytes';
 *             const k = 1024;
 *             const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
 *             const i = Math.floor(Math.log(bytes) / Math.log(k));
 *             return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
 *           };
 *
 *           const calculateSavings = () => {
 *             if (!plan || !plan.isOnPromotion) return null;
 *             const savings = plan.price - plan.currentPrice;
 *             const percentage = Math.round((savings / plan.price) * 100);
 *             return {
 *               amount: savings,
 *               percentage,
 *               formattedAmount: (savings / 100).toFixed(2)
 *             };
 *           };
 *
 *           const handleSubscribe = async () => {
 *             if (!plan) return;
 *
 *             try {
 *               // Implement subscription logic here
 *               console.log('Subscribing to plan:', plan.name);
 *               // Redirect to Stripe checkout or handle subscription
 *             } catch (error) {
 *               console.error('Subscription error:', error);
 *             }
 *           };
 *
 *           if (loading) {
 *             return <div className="plan-details-loading">Loading plan details...</div>;
 *           }
 *
 *           if (error) {
 *             return (
 *               <div className="plan-details-error">
 *                 <h2>Error</h2>
 *                 <p>{error}</p>
 *                 <button onClick={fetchPlanDetails} className="retry-button">
 *                   Try Again
 *                 </button>
 *               </div>
 *             );
 *           }
 *
 *           if (!plan) {
 *             return <div className="plan-not-found">Plan not found</div>;
 *           }
 *
 *           const savings = calculateSavings();
 *
 *           return (
 *             <div className="plan-details">
 *               <div className="plan-header">
 *                 <div className="plan-badges">
 *                   {plan.isPopular && (
 *                     <span className="popular-badge">
 *                       {plan.metadata?.badge || 'Most Popular'}
 *                     </span>
 *                   )}
 *                   {plan.isOnPromotion && (
 *                     <span className="promotion-badge">
 *                       Limited Time Offer
 *                     </span>
 *                   )}
 *                 </div>
 *
 *                 <h1 className="plan-name">{plan.name}</h1>
 *                 <p className="plan-short-description">{plan.shortDescription}</p>
 *               </div>
 *
 *               <div className="plan-content">
 *                 <div className="plan-pricing-section">
 *                   <div className="pricing-card">
 *                     <div className="price-display">
 *                       {plan.isOnPromotion && savings && (
 *                         <div className="original-price">
 *                           <span className="strikethrough">
 *                             ${(plan.price / 100).toFixed(2)}
 *                           </span>
 *                           <span className="savings-badge">
 *                             Save {savings.percentage}%
 *                           </span>
 *                         </div>
 *                       )}
 *                       <div className="current-price">
 *                         <span className="price-amount">
 *                           ${(plan.currentPrice / 100).toFixed(2)}
 *                         </span>
 *                         <span className="billing-cycle">/{plan.billingCycle}</span>
 *                       </div>
 *                     </div>
 *
 *                     {plan.trialPeriodDays > 0 && (
 *                       <div className="trial-info">
 *                         <span className="trial-badge">
 *                           {plan.trialPeriodDays} days free trial
 *                         </span>
 *                       </div>
 *                     )}
 *
 *                     {plan.isOnPromotion && plan.promotionalPeriod && (
 *                       <div className="promotion-expires">
 *                         Offer expires: {new Date(plan.promotionalPeriod.endDate).toLocaleDateString()}
 *                       </div>
 *                     )}
 *
 *                     <button
 *                       className={`subscribe-button ${plan.isPopular ? 'popular' : ''}`}
 *                       onClick={handleSubscribe}
 *                     >
 *                       {plan.trialPeriodDays > 0 ? 'Start Free Trial' : 'Subscribe Now'}
 *                     </button>
 *                   </div>
 *                 </div>
 *
 *                 <div className="plan-details-section">
 *                   <div className="plan-description">
 *                     <h2>About This Plan</h2>
 *                     <p>{plan.description}</p>
 *                   </div>
 *
 *                   <div className="plan-features">
 *                     <h2>Features Included</h2>
 *                     <ul className="features-list">
 *                       {plan.features.map((feature, index) => (
 *                         <li key={index} className="feature-item">
 *                           <span className="feature-check">✓</span>
 *                           <span className="feature-text">{feature}</span>
 *                         </li>
 *                       ))}
 *                     </ul>
 *                   </div>
 *
 *                   <div className="plan-limits">
 *                     <h2>Usage Limits</h2>
 *                     <div className="limits-grid">
 *                       <div className="limit-item">
 *                         <div className="limit-icon">👥</div>
 *                         <div className="limit-content">
 *                           <div className="limit-value">{plan.maxUsers}</div>
 *                           <div className="limit-label">Users</div>
 *                         </div>
 *                       </div>
 *                       <div className="limit-item">
 *                         <div className="limit-icon">📁</div>
 *                         <div className="limit-content">
 *                           <div className="limit-value">{plan.maxProjects}</div>
 *                           <div className="limit-label">Projects</div>
 *                         </div>
 *                       </div>
 *                       <div className="limit-item">
 *                         <div className="limit-icon">💾</div>
 *                         <div className="limit-content">
 *                           <div className="limit-value">{formatStorage(plan.maxStorage)}</div>
 *                           <div className="limit-label">Storage</div>
 *                         </div>
 *                       </div>
 *                       <div className="limit-item">
 *                         <div className="limit-icon">🔌</div>
 *                         <div className="limit-content">
 *                           <div className="limit-value">{plan.maxApiCalls.toLocaleString()}</div>
 *                           <div className="limit-label">API Calls/month</div>
 *                         </div>
 *                       </div>
 *                     </div>
 *                   </div>
 *
 *                   {plan.metadata && (
 *                     <div className="plan-metadata">
 *                       <h2>Additional Information</h2>
 *                       <div className="metadata-grid">
 *                         {plan.metadata.category && (
 *                           <div className="metadata-item">
 *                             <span className="metadata-label">Category:</span>
 *                             <span className="metadata-value">{plan.metadata.category}</span>
 *                           </div>
 *                         )}
 *                         {plan.metadata.targetAudience && (
 *                           <div className="metadata-item">
 *                             <span className="metadata-label">Target Audience:</span>
 *                             <span className="metadata-value">{plan.metadata.targetAudience}</span>
 *                           </div>
 *                         )}
 *                         {plan.metadata.recommendedFor && (
 *                           <div className="metadata-item">
 *                             <span className="metadata-label">Recommended For:</span>
 *                             <span className="metadata-value">
 *                               {plan.metadata.recommendedFor.join(', ')}
 *                             </span>
 *                           </div>
 *                         )}
 *                       </div>
 *                     </div>
 *                   )}
 *                 </div>
 *               </div>
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Subscriptions
 *     description: Operations for managing subscription plans and billing
 *   - name: Plans
 *     description: Subscription plan management and retrieval
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;

    await connectDB();

    const plan = (await SubscriptionPlan.findById(
      id
    ).lean()) as SubscriptionPlanDoc;

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription plan not found",
        },
        { status: 404 }
      );
    }

    // Only return visible plans
    if (!plan.isVisible) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription plan not available",
        },
        { status: 404 }
      );
    }

    // Transform the plan data for frontend
    const transformedPlan: TransformedPlan = {
      id: plan._id.toString(),
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      shortDescription: plan.shortDescription,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      trialPeriodDays: plan.trialPeriodDays,
      features: plan.features,
      maxUsers: plan.maxUsers,
      maxProjects: plan.maxProjects,
      maxStorage: plan.maxStorage,
      maxApiCalls: plan.maxApiCalls,
      status: plan.status,
      isPopular: plan.isPopular,
      isVisible: plan.isVisible,
      sortOrder: plan.sortOrder,
      promotionalPrice: plan.promotionalPrice,
      promotionalPeriod: plan.promotionalPeriod,
      stripeProductId: plan.stripeProductId,
      stripePriceId: plan.stripePriceId,
      metadata: plan.metadata,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      formattedPrice: (plan.price / 100).toFixed(2),
      currentPrice:
        plan.promotionalPrice &&
        plan.promotionalPeriod &&
        new Date() >= new Date(plan.promotionalPeriod.startDate ?? 0) &&
        new Date() <= new Date(plan.promotionalPeriod.endDate ?? 0)
          ? plan.promotionalPrice
          : plan.price,
      isOnPromotion: !!(
        plan.promotionalPrice &&
        plan.promotionalPeriod &&
        new Date() >= new Date(plan.promotionalPeriod.startDate ?? 0) &&
        new Date() <= new Date(plan.promotionalPeriod.endDate ?? 0)
      ),
    };

    return NextResponse.json({
      success: true,
      data: transformedPlan,
    });
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch subscription plan",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
