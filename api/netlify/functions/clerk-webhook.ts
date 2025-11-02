import { type WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import {
  syncUserWithClerk,
  recordLoginAttempt,
  recordLogoutAttempt,
} from "@/lib/clerk";
import { ClerkUser } from "@/types";
import Bowser from "bowser";

/**
 * @swagger
 * /api/webhooks/clerk:
 *   post:
 *     summary: Handle Clerk authentication webhooks
 *     description: |
 *       Processes webhook events from Clerk authentication service to synchronize user data
 *       and track authentication activities. Handles user creation, session management,
 *       and login/logout tracking with geolocation and device information. Verifies webhook
 *       signatures using Svix for security. Automatically syncs new users to the database
 *       and records detailed session information including IP address, browser, device type,
 *       and geographic location.
 *     tags:
 *       - Webhooks
 *       - Authentication
 *       - User Management
 *       - Security
 *     security:
 *       - WebhookSignature: []
 *     parameters:
 *       - in: header
 *         name: svix-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Svix webhook ID for verification
 *         example: "msg_2abc123def456"
 *       - in: header
 *         name: svix-timestamp
 *         required: true
 *         schema:
 *           type: string
 *         description: Svix webhook timestamp for verification
 *         example: "1704067200"
 *       - in: header
 *         name: svix-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Svix webhook signature for verification
 *         example: "v1,g0hM9SsE+OTPJTGt/tmIKtSyZlE3uFJELVlNIOLJ1OE="
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/UserCreatedWebhook'
 *               - $ref: '#/components/schemas/SessionCreatedWebhook'
 *               - $ref: '#/components/schemas/SessionRemovedWebhook'
 *           examples:
 *             userCreated:
 *               summary: User creation webhook
 *               value:
 *                 type: "user.created"
 *                 data:
 *                   id: "user_2abc123def456"
 *                   email_addresses:
 *                     - email_address: "user@example.com"
 *                       verification:
 *                         status: "verified"
 *                   first_name: "John"
 *                   last_name: "Doe"
 *                   username: "johndoe"
 *                   image_url: "https://img.clerk.com/user_2abc123def456"
 *                   created_at: 1704067200000
 *                   updated_at: 1704067200000
 *             sessionCreated:
 *               summary: Session creation webhook
 *               value:
 *                 type: "session.created"
 *                 data:
 *                   id: "sess_2abc123def456"
 *                   user_id: "user_2abc123def456"
 *                   status: "active"
 *                   created_at: 1704067200000
 *                   updated_at: 1704067200000
 *             sessionRemoved:
 *               summary: Session removal webhook
 *               value:
 *                 type: "session.removed"
 *                 data:
 *                   id: "sess_2abc123def456"
 *                   user_id: "user_2abc123def456"
 *                   status: "ended"
 *                   created_at: 1704067200000
 *                   updated_at: 1704067200000
 *                   ended_at: 1704070800000
 *     responses:
 *       '200':
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WebhookSuccessResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *       '400':
 *         description: Bad request - Missing headers or invalid signature
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             examples:
 *               missingHeaders:
 *                 summary: Missing Svix headers
 *                 value: "Error: Missing svix headers"
 *               invalidSignature:
 *                 summary: Invalid webhook signature
 *                 value: "Error: Invalid webhook signature"
 *       '500':
 *         description: Internal server error during webhook processing
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             examples:
 *               processingError:
 *                 value: "Error processing webhook"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ClerkUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Clerk user ID
 *           example: "user_2abc123def456"
 *         email_addresses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               email_address:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               verification:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [verified, unverified]
 *                     example: "verified"
 *         first_name:
 *           type: string
 *           nullable: true
 *           description: User's first name
 *           example: "John"
 *         last_name:
 *           type: string
 *           nullable: true
 *           description: User's last name
 *           example: "Doe"
 *         username:
 *           type: string
 *           nullable: true
 *           description: User's username
 *           example: "johndoe"
 *         image_url:
 *           type: string
 *           nullable: true
 *           description: User's profile image URL
 *           example: "https://img.clerk.com/user_2abc123def456"
 *         created_at:
 *           type: integer
 *           description: Unix timestamp of user creation
 *           example: 1704067200000
 *         updated_at:
 *           type: integer
 *           description: Unix timestamp of last update
 *           example: 1704067200000
 *
 *     ClerkSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Session ID
 *           example: "sess_2abc123def456"
 *         user_id:
 *           type: string
 *           description: Associated user ID
 *           example: "user_2abc123def456"
 *         status:
 *           type: string
 *           enum: [active, ended, expired, removed]
 *           description: Session status
 *           example: "active"
 *         created_at:
 *           type: integer
 *           description: Unix timestamp of session creation
 *           example: 1704067200000
 *         updated_at:
 *           type: integer
 *           description: Unix timestamp of last update
 *           example: 1704067200000
 *         ended_at:
 *           type: integer
 *           nullable: true
 *           description: Unix timestamp of session end
 *           example: 1704070800000
 *
 *     UserCreatedWebhook:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [user.created]
 *           description: Webhook event type
 *           example: "user.created"
 *         data:
 *           $ref: '#/components/schemas/ClerkUser'
 *
 *     SessionCreatedWebhook:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [session.created]
 *           description: Webhook event type
 *           example: "session.created"
 *         data:
 *           $ref: '#/components/schemas/ClerkSession'
 *
 *     SessionRemovedWebhook:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [session.removed]
 *           description: Webhook event type
 *           example: "session.removed"
 *         data:
 *           $ref: '#/components/schemas/ClerkSession'
 *
 *     WebhookSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of webhook processing
 *           example: true
 *
 *   securitySchemes:
 *     WebhookSignature:
 *       type: apiKey
 *       in: header
 *       name: svix-signature
 *       description: Svix webhook signature for verification
 *
 *   examples:
 *     ClerkWebhookUsageExample:
 *       summary: How to handle Clerk webhooks in your application
 *       description: |
 *         **Step 1: Configure Clerk Webhook Endpoint**
 *         ```javascript
 *         // In your Clerk Dashboard:
 *         // 1. Go to Webhooks section
 *         // 2. Add endpoint: https://yourdomain.com/api/webhooks/clerk
 *         // 3. Select events: user.created, session.created, session.removed
 *         // 4. Copy the webhook secret to your environment variables
 *
 *         // Environment variables needed:
 *         // CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
 *         ```
 *
 *         **Step 2: Test Webhook Locally with ngrok**
 *         ```bash
 *         # Install ngrok
 *         npm install -g ngrok
 *
 *         # Start your Next.js app
 *         npm run dev
 *
 *         # In another terminal, expose your local server
 *         ngrok http 3000
 *
 *         # Use the ngrok URL in Clerk webhook settings
 *         # Example: https://abc123.ngrok.io/api/webhooks/clerk
 *         ```
 *
 *         **Step 3: Webhook Processing Service**
 *         ```javascript
 *         class ClerkWebhookService {
 *           constructor() {
 *             this.webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
 *           }
 *
 *           async processUserCreated(userData) {
 *             try {
 *               // Sync user with your database
 *               const user = await this.syncUserWithDatabase(userData);
 *
 *               // Send welcome email
 *               await this.sendWelcomeEmail(user);
 *
 *               // Initialize user progress
 *               await this.initializeUserProgress(user.id);
 *
 *               console.log(`User created: ${user.email}`);
 *               return user;
 *             } catch (error) {
 *               console.error('Error processing user creation:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async processSessionCreated(sessionData, request) {
 *             try {
 *               const { user_id: clerkId } = sessionData;
 *
 *               // Extract request information
 *               const ip = request.headers.get("x-forwarded-for") || "unknown";
 *               const userAgent = request.headers.get("user-agent") || "unknown";
 *
 *               // Parse browser and device info
 *               const parser = Bowser.getParser(userAgent);
 *               const browser = parser.getBrowserName() || "unknown";
 *               const device = parser.getPlatformType() || "desktop";
 *
 *               // Get geolocation
 *               const location = await this.getLocationFromIP(ip);
 *
 *               // Record login attempt
 *               await this.recordLoginAttempt({
 *                 clerkId,
 *                 ip,
 *                 device,
 *                 browser,
 *                 location,
 *                 success: true,
 *                 sessionId: sessionData.id
 *               });
 *
 *               console.log(`Session created for user: ${clerkId}`);
 *             } catch (error) {
 *               console.error('Error processing session creation:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async processSessionRemoved(sessionData) {
 *             try {
 *               const { user_id: clerkId, id: sessionId } = sessionData;
 *
 *               // Record logout
 *               await this.recordLogoutAttempt(clerkId, sessionId);
 *
 *               console.log(`Session removed for user: ${clerkId}`);
 *             } catch (error) {
 *               console.error('Error processing session removal:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async syncUserWithDatabase(clerkUser) {
 *             // Implementation to sync user data with your database
 *             const userData = {
 *               clerkId: clerkUser.id,
 *               email: clerkUser.email_addresses[0]?.email_address,
 *               firstName: clerkUser.first_name,
 *               lastName: clerkUser.last_name,
 *               username: clerkUser.username,
 *               imageUrl: clerkUser.image_url,
 *               createdAt: new Date(clerkUser.created_at),
 *               updatedAt: new Date(clerkUser.updated_at)
 *             };
 *
 *             // Save to your database
 *             return await User.create(userData);
 *           }
 *
 *           async getLocationFromIP(ip) {
 *             try {
 *               if (ip === 'unknown' || ip.includes('127.0.0.1') || ip.includes('localhost')) {
 *                 return 'Local Development';
 *               }
 *
 *               const response = await fetch(`https://ipapi.co/${ip}/json/`);
 *               const data = await response.json();
 *
 *               return `${data.city || 'Unknown'}, ${data.region || 'Unknown'}, ${data.country_name || 'Unknown'}`;
 *             } catch (error) {
 *               console.error('Error getting location:', error);
 *               return 'Unknown Location';
 *             }
 *           }
 *
 *           async recordLoginAttempt(loginData) {
 *             // Implementation to record login attempt in your database
 *             return await LoginAttempt.create({
 *               userId: loginData.clerkId,
 *               ip: loginData.ip,
 *               device: loginData.device,
 *               browser: loginData.browser,
 *               location: loginData.location,
 *               success: loginData.success,
 *               sessionId: loginData.sessionId,
 *               timestamp: new Date()
 *             });
 *           }
 *
 *           async recordLogoutAttempt(clerkId, sessionId) {
 *             // Implementation to record logout
 *             return await LoginAttempt.updateOne(
 *               { userId: clerkId, sessionId },
 *               {
 *                 loggedOutAt: new Date(),
 *                 sessionEnded: true
 *               }
 *             );
 *           }
 *
 *           async sendWelcomeEmail(user) {
 *             // Implementation to send welcome email
 *             console.log(`Sending welcome email to ${user.email}`);
 *           }
 *
 *           async initializeUserProgress(userId) {
 *             // Implementation to initialize user progress
 *             return await UserProgress.create({
 *               userId,
 *               xp: 0,
 *               gems: 0,
 *               hearts: 5,
 *               streak: 0
 *             });
 *           }
 *         }
 *
 *         export const clerkWebhookService = new ClerkWebhookService();
 *         ```
 *
 *         **Step 4: Webhook Security Middleware**
 *         ```javascript
 *         import { Webhook } from 'svix';
 *
 *         export class WebhookSecurityService {
 *           constructor(webhookSecret) {
 *             this.webhook = new Webhook(webhookSecret);
 *           }
 *
 *           verifyWebhook(body, headers) {
 *             const svixId = headers.get("svix-id");
 *             const svixTimestamp = headers.get("svix-timestamp");
 *             const svixSignature = headers.get("svix-signature");
 *
 *             if (!svixId || !svixTimestamp || !svixSignature) {
 *               throw new Error("Missing required svix headers");
 *             }
 *
 *             try {
 *               return this.webhook.verify(body, {
 *                 "svix-id": svixId,
 *                 "svix-timestamp": svixTimestamp,
 *                 "svix-signature": svixSignature,
 *               });
 *             } catch (error) {
 *               throw new Error("Invalid webhook signature");
 *             }
 *           }
 *
 *           isValidTimestamp(timestamp, toleranceInSeconds = 300) {
 *             const now = Math.floor(Date.now() / 1000);
 *             const webhookTimestamp = parseInt(timestamp);
 *             return Math.abs(now - webhookTimestamp) <= toleranceInSeconds;
 *           }
 *         }
 *         ```
 *
 *         **Step 5: Webhook Analytics and Monitoring**
 *         ```javascript
 *         class WebhookAnalyticsService {
 *           async trackWebhookEvent(eventType, success, processingTime, error = null) {
 *             const analytics = {
 *               eventType,
 *               success,
 *               processingTime,
 *               error: error?.message,
 *               timestamp: new Date()
 *             };
 *
 *             // Save to analytics database
 *             await WebhookAnalytics.create(analytics);
 *
 *             // Send to monitoring service (e.g., DataDog, New Relic)
 *             if (!success) {
 *               console.error(`Webhook processing failed: ${eventType}`, error);
 *             }
 *           }
 *
 *           async getWebhookStats(timeRange = '24h') {
 *             const startTime = new Date();
 *             startTime.setHours(startTime.getHours() - (timeRange === '24h' ? 24 : 168));
 *
 *             return await WebhookAnalytics.aggregate([
 *               { $match: { timestamp: { $gte: startTime } } },
 *               {
 *                 $group: {
 *                   _id: '$eventType',
 *                   total: { $sum: 1 },
 *                   successful: { $sum: { $cond: ['$success', 1, 0] } },
 *                   failed: { $sum: { $cond: ['$success', 0, 1] } },
 *                   avgProcessingTime: { $avg: '$processingTime' }
 *                 }
 *               }
 *             ]);
 *           }
 *         }
 *         ```
 *
 * tags:
 *   - name: Webhooks
 *     description: Webhook endpoints for external service integrations
 *   - name: Authentication
 *     description: User authentication and session management
 *   - name: User Management
 *     description: User account creation, updates, and synchronization
 *   - name: Security
 *     description: Security features including webhook verification and session tracking
 */

export async function handler(event: any) {
  const headers = event.headers;
  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return {
      statusCode: 400,
      body: "Error: Missing svix headers",
    };
  }

  const body = event.body; // string
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: any;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return {
      statusCode: 400,
      body: "Error: Invalid webhook signature",
    };
  }

  const eventType = evt.type;

  try {
    if (eventType === "user.created") {
      await syncUserWithClerk(evt.data);
    } else if (eventType === "session.created") {
      const { user_id: clerkId } = evt.data;

      const ip = headers["x-forwarded-for"] || "unknown";
      const userAgent = headers["user-agent"] || "unknown";

      const parser = Bowser.getParser(userAgent);
      const browser = parser.getBrowserName() || "unknown";
      const device = parser.getPlatformType() || "desktop";

      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
      const geoData = await geoRes.json();
      const location = `${geoData.city}, ${geoData.region}, ${geoData.country_name}`;

      await recordLoginAttempt(clerkId, ip, device, browser, location, true);
    } else if (eventType === "session.removed") {
      const { user_id: clerkId, id: sessionId } = evt.data;
      await recordLogoutAttempt(clerkId, sessionId);
    } else if (eventType === "role.created") {
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("Error processing webhook:", error);
    return {
      statusCode: 500,
      body: "Error processing webhook",
    };
  }
}
