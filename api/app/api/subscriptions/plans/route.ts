import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { SubscriptionPlanDoc, TransformedPlan } from "@/types";
import { auth } from "@clerk/nextjs/server";

/**
 * @swagger
 * /api/subscriptions/plans:
 *   get:
 *     summary: Get subscription plans
 *     description: |
 *       Retrieves all active and visible subscription plans with optional filtering
 *       by billing cycle. Plans are returned with pricing information, features,
 *       promotional pricing, and metadata. Supports monthly and yearly billing cycles.
 *       Plans are sorted by sort order and price. Requires user authentication.
 *     tags:
 *       - Subscriptions
 *       - Plans
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: billingCycle
 *         schema:
 *           type: string
 *           enum: [monthly, yearly, quarterly]
 *           default: monthly
 *         description: Filter plans by billing cycle
 *         example: "monthly"
 *     responses:
 *       '200':
 *         description: Successfully retrieved subscription plans
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubscriptionPlansResponse'
 *             examples:
 *               monthlyPlans:
 *                 summary: Monthly subscription plans
 *                 value:
 *                   success: true
 *                   billingCycle: "monthly"
 *                   data:
 *                     - id: "507f1f77bcf86cd799439011"
 *                       name: "Basic Plan"
 *                       slug: "basic-monthly"
 *                       description: "Perfect for individual learners starting their language journey"
 *                       shortDescription: "Essential features for language learning"
 *                       price: 999
 *                       currency: "USD"
 *                       billingCycle: "monthly"
 *                       trialPeriodDays: 7
 *                       features:
 *                         - "Unlimited lessons"
 *                         - "Basic progress tracking"
 *                         - "Mobile app access"
 *                         - "Community support"
 *                       maxUsers: 1
 *                       maxProjects: 5
 *                       maxStorage: 1073741824
 *                       maxApiCalls: 1000
 *                       status: "active"
 *                       isPopular: false
 *                       isVisible: true
 *                       sortOrder: 1
 *                       promotionalPrice: null
 *                       promotionalPeriod: null
 *                       stripeProductId: "prod_basic_monthly"
 *                       stripePriceId: "price_basic_monthly"
 *                       metadata:
 *                         category: "individual"
 *                         level: "basic"
 *                       createdAt: "2024-01-15T10:00:00Z"
 *                       updatedAt: "2024-01-15T10:00:00Z"
 *                       formattedPrice: "9.99"
 *                       currentPrice: 999
 *                       isOnPromotion: false
 *                     - id: "507f1f77bcf86cd799439012"
 *                       name: "Premium Plan"
 *                       slug: "premium-monthly"
 *                       description: "Advanced features for serious language learners"
 *                       shortDescription: "All features plus advanced analytics"
 *                       price: 1999
 *                       currency: "USD"
 *                       billingCycle: "monthly"
 *                       trialPeriodDays: 14
 *                       features:
 *                         - "Everything in Basic"
 *                         - "Advanced progress analytics"
 *                         - "Personalized learning paths"
 *                         - "Priority support"
 *                         - "Offline mode"
 *                         - "Custom study schedules"
 *                       maxUsers: 1
 *                       maxProjects: 20
 *                       maxStorage: 5368709120
 *                       maxApiCalls: 5000
 *                       status: "active"
 *                       isPopular: true
 *                       isVisible: true
 *                       sortOrder: 2
 *                       promotionalPrice: 1499
 *                       promotionalPeriod:
 *                         startDate: "2024-01-01T00:00:00Z"
 *                         endDate: "2024-02-29T23:59:59Z"
 *                       stripeProductId: "prod_premium_monthly"
 *                       stripePriceId: "price_premium_monthly"
 *                       metadata:
 *                         category: "individual"
 *                         level: "premium"
 *                         badge: "Most Popular"
 *                       createdAt: "2024-01-15T10:00:00Z"
 *                       updatedAt: "2024-01-20T15:30:00Z"
 *                       formattedPrice: "19.99"
 *                       currentPrice: 1499
 *                       isOnPromotion: true
 *                     - id: "507f1f77bcf86cd799439013"
 *                       name: "Pro Plan"
 *                       slug: "pro-monthly"
 *                       description: "Professional features for educators and teams"
 *                       shortDescription: "Team collaboration and advanced tools"
 *                       price: 4999
 *                       currency: "USD"
 *                       billingCycle: "monthly"
 *                       trialPeriodDays: 30
 *                       features:
 *                         - "Everything in Premium"
 *                         - "Team management"
 *                         - "Advanced reporting"
 *                         - "API access"
 *                         - "White-label options"
 *                         - "Dedicated support"
 *                       maxUsers: 10
 *                       maxProjects: 100
 *                       maxStorage: 21474836480
 *                       maxApiCalls: 25000
 *                       status: "active"
 *                       isPopular: false
 *                       isVisible: true
 *                       sortOrder: 3
 *                       promotionalPrice: null
 *                       promotionalPeriod: null
 *                       stripeProductId: "prod_pro_monthly"
 *                       stripePriceId: "price_pro_monthly"
 *                       metadata:
 *                         category: "team"
 *                         level: "professional"
 *                       createdAt: "2024-01-15T10:00:00Z"
 *                       updatedAt: "2024-01-15T10:00:00Z"
 *                       formattedPrice: "49.99"
 *                       currentPrice: 4999
 *                       isOnPromotion: false
 *               yearlyPlans:
 *                 summary: Yearly subscription plans with discounts
 *                 value:
 *                   success: true
 *                   billingCycle: "yearly"
 *                   data:
 *                     - id: "507f1f77bcf86cd799439021"
 *                       name: "Basic Plan"
 *                       slug: "basic-yearly"
 *                       description: "Perfect for individual learners - save 20% with yearly billing"
 *                       price: 9599
 *                       currency: "USD"
 *                       billingCycle: "yearly"
 *                       trialPeriodDays: 14
 *                       formattedPrice: "95.99"
 *                       currentPrice: 9599
 *                       isOnPromotion: false
 *               emptyPlans:
 *                 summary: No plans available
 *                 value:
 *                   success: true
 *                   billingCycle: "monthly"
 *                   data: []
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
 *                   message: "Failed to fetch subscription plans"
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
 *     SubscriptionPlan:
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
 *           description: Detailed description of the plan
 *           example: "Advanced features for serious language learners"
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
 *           description: List of features included in the plan
 *           example: ["Unlimited lessons", "Advanced analytics", "Priority support"]
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
 *           description: Whether this plan is marked as popular
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
 *           description: Stripe product identifier
 *           example: "prod_premium_monthly"
 *         stripePriceId:
 *           type: string
 *           description: Stripe price identifier
 *           example: "price_premium_monthly"
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Additional metadata for the plan
 *           example:
 *             category: "individual"
 *             level: "premium"
 *             badge: "Most Popular"
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
 *     SubscriptionPlansResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         billingCycle:
 *           type: string
 *           description: The billing cycle filter applied
 *           example: "monthly"
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubscriptionPlan'
 *           description: Array of subscription plans
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
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Failed to fetch subscription plans"
 *         error:
 *           type: string
 *           description: Detailed error message
 *           example: "Database connection failed"
 *
 *   examples:
 *     SubscriptionPlansApiUsageExample:
 *       summary: How to use the Subscription Plans API with Axios
 *       description: |
 *         **Step 1: Fetch Subscription Plans with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const fetchSubscriptionPlans = async (billingCycle = 'monthly') => {
 *           try {
 *             const response = await axios.get('/api/subscriptions/plans', {
 *               params: { billingCycle },
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data.data;
 *             } else {
 *               throw new Error(response.data.message || 'Failed to fetch plans');
 *             }
 *           } catch (error) {
 *             console.error('Failed to fetch subscription plans:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage examples
 *         const monthlyPlans = await fetchSubscriptionPlans('monthly');
 *         const yearlyPlans = await fetchSubscriptionPlans('yearly');
 *         const quarterlyPlans = await fetchSubscriptionPlans('quarterly');
 *         ```
 *
 *         **Step 2: Process and Display Plans**
 *         ```javascript
 *         const displaySubscriptionPlans = async (billingCycle = 'monthly') => {
 *           try {
 *             const plans = await fetchSubscriptionPlans(billingCycle);
 *
 *             console.log(`${billingCycle.toUpperCase()} SUBSCRIPTION PLANS:`);
 *             console.log('='.repeat(50));
 *
 *             plans.forEach((plan, index) => {
 *               console.log(`${index + 1}. ${plan.name} ${plan.isPopular ? '⭐ POPULAR' : ''}`);
 *               console.log(`   Price: $${plan.formattedPrice}/${plan.billingCycle}`);
 *
 *               if (plan.isOnPromotion) {
 *                 const originalPrice = (plan.price / 100).toFixed(2);
 *                 const currentPrice = (plan.currentPrice / 100).toFixed(2);
 *                 const savings = ((plan.price - plan.currentPrice) / plan.price * 100).toFixed(0);
 *                 console.log(`   🎉 ON SALE: $${currentPrice} (was $${originalPrice}) - Save ${savings}%`);
 *               }
 *
 *               console.log(`   Trial: ${plan.trialPeriodDays} days`);
 *               console.log(`   Features: ${plan.features.length} included`);
 *               console.log(`   Limits: ${plan.maxUsers} users, ${plan.maxProjects} projects`);
 *               console.log(`   Storage: ${formatBytes(plan.maxStorage)}`);
 *               console.log(`   API Calls: ${plan.maxApiCalls.toLocaleString()}/month`);
 *               console.log('');
 *             });
 *
 *             // Find the most popular plan
 *             const popularPlan = plans.find(plan => plan.isPopular);
 *             if (popularPlan) {
 *               console.log(`Most Popular: ${popularPlan.name} - ${popularPlan.shortDescription}`);
 *             }
 *
 *             // Find plans on promotion
 *             const promotionalPlans = plans.filter(plan => plan.isOnPromotion);
 *             if (promotionalPlans.length > 0) {
 *               console.log(`Plans on promotion: ${promotionalPlans.map(p => p.name).join(', ')}`);
 *             }
 *
 *             return plans;
 *           } catch (error) {
 *             console.error('Error displaying plans:', error);
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
 *         **Step 3: Create a Subscription Plans Service**
 *         ```javascript
 *         class SubscriptionPlansService {
 *           constructor() {
 *             this.client = axios.create({
 *               baseURL: '/api/subscriptions',
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             this.setupInterceptors();
 *             this.cache = new Map();
 *             this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
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
 *           getCacheKey(billingCycle) {
 *             return `plans_${billingCycle}`;
 *           }
 *
 *           async getPlans(billingCycle = 'monthly', useCache = true) {
 *             const cacheKey = this.getCacheKey(billingCycle);
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
 *               const response = await this.client.get('/plans', {
 *                 params: { billingCycle }
 *               });
 *
 *               if (response.data.success) {
 *                 // Cache the result
 *                 this.cache.set(cacheKey, {
 *                   data: response.data.data,
 *                   timestamp: Date.now()
 *                 });
 *
 *                 return response.data.data;
 *               } else {
 *                 throw new Error(response.data.message || 'Failed to fetch plans');
 *               }
 *             } catch (error) {
 *               console.error('Plans service error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async getAllBillingCycles() {
 *             const [monthly, yearly, quarterly] = await Promise.all([
 *               this.getPlans('monthly'),
 *               this.getPlans('yearly'),
 *               this.getPlans('quarterly')
 *             ]);
 *
 *             return {
 *               monthly,
 *               yearly,
 *               quarterly
 *             };
 *           }
 *
 *           async getPopularPlans(billingCycle = 'monthly') {
 *             const plans = await this.getPlans(billingCycle);
 *             return plans.filter(plan => plan.isPopular);
 *           }
 *
 *           async getPromotionalPlans(billingCycle = 'monthly') {
 *             const plans = await this.getPlans(billingCycle);
 *             return plans.filter(plan => plan.isOnPromotion);
 *           }
 *
 *           async getPlanById(planId, billingCycle = 'monthly') {
 *             const plans = await this.getPlans(billingCycle);
 *             return plans.find(plan => plan.id === planId);
 *           }
 *
 *           async getPlanBySlug(slug, billingCycle = 'monthly') {
 *             const plans = await this.getPlans(billingCycle);
 *             return plans.find(plan => plan.slug === slug);
 *           }
 *
 *           async comparePlans(billingCycle = 'monthly') {
 *             const plans = await this.getPlans(billingCycle);
 *
 *             return plans.map(plan => ({
 *               id: plan.id,
 *               name: plan.name,
 *               price: plan.currentPrice,
 *               formattedPrice: (plan.currentPrice / 100).toFixed(2),
 *               features: plan.features,
 *               limits: {
 *                 users: plan.maxUsers,
 *                 projects: plan.maxProjects,
 *                 storage: plan.maxStorage,
 *                 apiCalls: plan.maxApiCalls
 *               },
 *               trial: plan.trialPeriodDays,
 *               isPopular: plan.isPopular,
 *               isOnPromotion: plan.isOnPromotion,
 *               savings: plan.isOnPromotion ?
 *                 Math.round((plan.price - plan.currentPrice) / plan.price * 100) : 0
 *             }));
 *           }
 *
 *           // Helper methods
 *           calculateYearlySavings(monthlyPrice, yearlyPrice) {
 *             const monthlyTotal = monthlyPrice * 12;
 *             const savings = monthlyTotal - yearlyPrice;
 *             const percentage = Math.round((savings / monthlyTotal) * 100);
 *             return {
 *               amount: savings,
 *               percentage,
 *               formattedAmount: (savings / 100).toFixed(2)
 *             };
 *           }
 *
 *           formatPrice(price, currency = 'USD') {
 *             return new Intl.NumberFormat('en-US', {
 *               style: 'currency',
 *               currency: currency
 *             }).format(price / 100);
 *           }
 *
 *           formatStorage(bytes) {
 *             if (bytes === 0) return '0 Bytes';
 *             const k = 1024;
 *             const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
 *             const i = Math.floor(Math.log(bytes) / Math.log(k));
 *             return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
 *           }
 *
 *           clearCache() {
 *             this.cache.clear();
 *           }
 *         }
 *
 *         export const subscriptionPlansService = new SubscriptionPlansService();
 *         ```
 *
 *     ReactSubscriptionPlansExample:
 *       summary: React component for subscription plans
 *       description: |
 *         ```typescript
 *         import React, { useState, useEffect } from 'react';
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
 *           formattedPrice: string;
 *           currentPrice: number;
 *           isOnPromotion: boolean;
 *           stripeProductId: string;
 *           stripePriceId: string;
 *         }
 *
 *         export function SubscriptionPlans() {
 *           const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState<string | null>(null);
 *           const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
 *
 *           useEffect(() => {
 *             fetchPlans();
 *           }, [billingCycle]);
 *
 *           const fetchPlans = async () => {
 *             try {
 *               setLoading(true);
 *               setError(null);
 *
 *               const response = await axios.get('/api/subscriptions/plans', {
 *                 params: { billingCycle }
 *               });
 *
 *               if (response.data.success) {
 *                 setPlans(response.data.data);
 *               } else {
 *                 setError(response.data.message || 'Failed to fetch plans');
 *               }
 *             } catch (err) {
 *               if (axios.isAxiosError(err)) {
 *                 if (err.response?.status === 401) {
 *                   setError('Please log in to view subscription plans');
 *                 } else {
 *                   setError(err.response?.data?.message || 'Failed to fetch plans');
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
 *           const calculateSavings = (plan: SubscriptionPlan) => {
 *             if (!plan.isOnPromotion) return 0;
 *             return Math.round((plan.price - plan.currentPrice) / plan.price * 100);
 *           };
 *
 *           const handleSubscribe = async (plan: SubscriptionPlan) => {
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
 *             return <div className="plans-loading">Loading subscription plans...</div>;
 *           }
 *
 *           if (error) {
 *             return (
 *               <div className="plans-error">
 *                 <p>Error: {error}</p>
 *                 <button onClick={fetchPlans} className="retry-button">
 *                   Retry
 *                 </button>
 *               </div>
 *             );
 *           }
 *
 *           return (
 *             <div className="subscription-plans">
 *               <div className="plans-header">
 *                 <h2>Choose Your Plan</h2>
 *                 <div className="billing-toggle">
 *                   <button
 *                     className={`toggle-button ${billingCycle === 'monthly' ? 'active' : ''}`}
 *                     onClick={() => setBillingCycle('monthly')}
 *                   >
 *                     Monthly
 *                   </button>
 *                   <button
 *                     className={`toggle-button ${billingCycle === 'yearly' ? 'active' : ''}`}
 *                     onClick={() => setBillingCycle('yearly')}
 *                   >
 *                     Yearly
 *                     <span className="savings-badge">Save 20%</span>
 *                   </button>
 *                 </div>
 *               </div>
 *
 *               <div className="plans-grid">
 *                 {plans.map((plan) => (
 *                   <div
 *                     key={plan.id}
 *                     className={`plan-card ${plan.isPopular ? 'popular' : ''}`}
 *                   >
 *                     {plan.isPopular && (
 *                       <div className="popular-badge">Most Popular</div>
 *                     )}
 *
 *                     {plan.isOnPromotion && (
 *                       <div className="promotion-badge">
 *                         Save {calculateSavings(plan)}%
 *                       </div>
 *                     )}
 *
 *                     <div className="plan-header">
 *                       <h3 className="plan-name">{plan.name}</h3>
 *                       <p className="plan-description">{plan.shortDescription}</p>
 *                     </div>
 *
 *                     <div className="plan-pricing">
 *                       <div className="price-display">
 *                         {plan.isOnPromotion && (
 *                           <span className="original-price">
 *                             ${(plan.price / 100).toFixed(2)}
 *                           </span>
 *                         )}
 *                         <span className="current-price">
 *                           ${(plan.currentPrice / 100).toFixed(2)}
 *                         </span>
 *                         <span className="billing-period">/{plan.billingCycle}</span>
 *                       </div>
 *
 *                       {plan.trialPeriodDays > 0 && (
 *                         <div className="trial-info">
 *                           {plan.trialPeriodDays} days free trial
 *                         </div>
 *                       )}
 *                     </div>
 *
 *                     <div className="plan-features">
 *                       <h4>Features included:</h4>
 *                       <ul>
 *                         {plan.features.map((feature, index) => (
 *                           <li key={index}>
 *                             <span className="feature-check">✓</span>
 *                             {feature}
 *                           </li>
 *                         ))}
 *                       </ul>
 *                     </div>
 *
 *                     <div className="plan-limits">
 *                       <div className="limit-item">
 *                         <span className="limit-label">Users:</span>
 *                         <span className="limit-value">{plan.maxUsers}</span>
 *                       </div>
 *                       <div className="limit-item">
 *                         <span className="limit-label">Projects:</span>
 *                         <span className="limit-value">{plan.maxProjects}</span>
 *                       </div>
 *                       <div className="limit-item">
 *                         <span className="limit-label">Storage:</span>
 *                         <span className="limit-value">{formatStorage(plan.maxStorage)}</span>
 *                       </div>
 *                       <div className="limit-item">
 *                         <span className="limit-label">API Calls:</span>
 *                         <span className="limit-value">{plan.maxApiCalls.toLocaleString()}/month</span>
 *                       </div>
 *                     </div>
 *
 *                     <button
 *                       className={`subscribe-button ${plan.isPopular ? 'popular' : ''}`}
 *                       onClick={() => handleSubscribe(plan)}
 *                     >
 *                       {plan.trialPeriodDays > 0 ? 'Start Free Trial' : 'Subscribe Now'}
 *                     </button>
 *                   </div>
 *                 ))}
 *               </div>
 *
 *               {plans.length === 0 && (
 *                 <div className="no-plans">
 *                   <p>No subscription plans available for {billingCycle} billing.</p>
 *                 </div>
 *               )}
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
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const billingCycle = searchParams.get("billingCycle") || "monthly";

    const plans = (await SubscriptionPlan.find({
      status: "active",
      isVisible: true,
      billingCycle: billingCycle,
    })
      .sort({ sortOrder: 1, price: 1 })
      .lean()) as SubscriptionPlanDoc[];
    // Transform plans for frontend
    const transformedPlans: TransformedPlan[] = plans.map((plan) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: transformedPlans,
      billingCycle,
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch subscription plans",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
