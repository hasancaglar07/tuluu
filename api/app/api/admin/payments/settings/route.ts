// @ts-nocheck
/* eslint-disable */
import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";

import {
  PaymentSettingsCreateSchema,
  PaymentSettingsUpdateSchema,
  PaymentSettingsQuerySchema,
  GeneralSettingsSchema,
  CurrencySettingsSchema,
  RegionalSettingSchema,
  PaymentProviderSchema,
} from "@/lib/validations/payment-settings";
import PaymentSettings, { PaymentSettingsType } from "@/models/PaymentSettings";
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
 *     PaymentSettingsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/PaymentSettings'
 *         meta:
 *           type: object
 *           properties:
 *             version:
 *               type: number
 *               example: 1
 *             lastModified:
 *               type: string
 *               format: date-time
 *               example: "2023-06-15T14:30:00Z"
 *             isActive:
 *               type: boolean
 *               example: true
 *             updatedFields:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["general", "providers.stripe"]
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Failed to fetch payment settings"
 *         error:
 *           type: string
 *           example: "Database connection error"
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *           example:
 *             "general.enablePayments": ["Required field is missing"]
 *     PaymentSettings:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64a7b8c9d1e2f3a4b5c6d7e8"
 *         general:
 *           type: object
 *           properties:
 *             enablePayments:
 *               type: boolean
 *               example: true
 *             testMode:
 *               type: boolean
 *               example: true
 *             autoRetryFailedPayments:
 *               type: boolean
 *               example: true
 *             sendPaymentReceipts:
 *               type: boolean
 *               example: true
 *             companyName:
 *               type: string
 *               example: "TULU Clone"
 *             companyAddress:
 *               type: string
 *               example: "456 Business Ave, Suite 100, San Francisco, CA 94107"
 *             billingEmail:
 *               type: string
 *               format: email
 *               example: "billing@duolingoclone.com"
 *             billingPhone:
 *               type: string
 *               example: "+1 (555) 123-4567"
 *         providers:
 *           type: object
 *           properties:
 *             stripe:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   example: true
 *                 environment:
 *                   type: string
 *                   enum: [sandbox, production]
 *                   example: "sandbox"
 *                 publicKey:
 *                   type: string
 *                   example: "pk_***"
 *                   description: "Masked when includeSecrets=false"
 *                 secretKey:
 *                   type: string
 *                   example: "sk_***"
 *                   description: "Masked when includeSecrets=false"
 *                 webhookSecret:
 *                   type: string
 *                   example: "whsec_***"
 *                   description: "Masked when includeSecrets=false"
 *             paypal:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   example: false
 *                 environment:
 *                   type: string
 *                   enum: [sandbox, production]
 *                   example: "sandbox"
 *                 clientId:
 *                   type: string
 *                   example: "***"
 *                   description: "Masked when includeSecrets=false"
 *                 clientSecret:
 *                   type: string
 *                   example: "***"
 *                   description: "Masked when includeSecrets=false"
 *             googlePay:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   example: false
 *                 environment:
 *                   type: string
 *                   enum: [sandbox, production]
 *                   example: "sandbox"
 *                 merchantId:
 *                   type: string
 *                   example: "merchant-id-123"
 *         currencies:
 *           type: object
 *           properties:
 *             defaultCurrency:
 *               type: string
 *               example: "USD"
 *             autoUpdateExchangeRates:
 *               type: boolean
 *               example: true
 *             exchangeRateProvider:
 *               type: string
 *               example: "fixer"
 *             exchangeRateApiKey:
 *               type: string
 *               example: "***"
 *               description: "Masked when includeSecrets=false"
 *             supportedCurrencies:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["USD", "EUR", "GBP"]
 *             gems:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   example: true
 *                 exchangeRate:
 *                   type: number
 *                   example: 100
 *                 dailyBonus:
 *                   type: number
 *                   example: 5
 *             hearts:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                   example: true
 *                 exchangeRate:
 *                   type: number
 *                   example: 1
 *                 gemsCost:
 *                   type: number
 *                   example: 10
 *                 refillTimeHours:
 *                   type: number
 *                   example: 5
 *         regional:
 *           type: object
 *           properties:
 *             regionalPricing:
 *               type: boolean
 *               example: true
 *             taxCalculation:
 *               type: boolean
 *               example: true
 *             autoDetectRegion:
 *               type: boolean
 *               example: true
 *             defaultRegion:
 *               type: string
 *               example: "United States"
 *             regions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "United States"
 *                   currency:
 *                     type: string
 *                     example: "USD"
 *                   priceMultiplier:
 *                     type: number
 *                     example: 1.0
 *                   taxRate:
 *                     type: number
 *                     example: 0
 *                   status:
 *                     type: string
 *                     enum: [active, inactive]
 *                     example: "active"
 *         webhookEndpoints:
 *           type: object
 *           properties:
 *             paymentSuccessful:
 *               type: string
 *               example: "/api/webhooks/payment-successful"
 *             paymentFailed:
 *               type: string
 *               example: "/api/webhooks/payment-failed"
 *         securitySettings:
 *           type: object
 *           properties:
 *             ipWhitelist:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["192.168.1.1"]
 *             fraudDetection:
 *               type: boolean
 *               example: true
 *         notificationSettings:
 *           type: object
 *           properties:
 *             emailNotifications:
 *               type: boolean
 *               example: true
 *             slackWebhook:
 *               type: string
 *               example: "https://hooks.slack.com/services/xxx/yyy/zzz"
 *         isActive:
 *           type: boolean
 *           example: true
 *         version:
 *           type: number
 *           example: 1
 *         lastModifiedBy:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *               example: "admin"
 *             email:
 *               type: string
 *               example: "admin@example.com"
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           example:
 *             lastAudit: "2023-05-01"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T14:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-06-15T14:30:00Z"
 *     PaymentSettingsCreateRequest:
 *       type: object
 *       properties:
 *         tab:
 *           type: string
 *           enum: ["all", "general", "providers", "currencies", "regional", "security", "notifications"]
 *           example: "all"
 *           description: "Tab context for validation schema selection"
 *         data:
 *           $ref: '#/components/schemas/PaymentSettingsData'
 *     PaymentSettingsPatchRequest:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/PaymentSettingsData'
 *     PaymentSettingsData:
 *       type: object
 *       properties:
 *         general:
 *           type: object
 *           properties:
 *             enablePayments:
 *               type: boolean
 *             testMode:
 *               type: boolean
 *             autoRetryFailedPayments:
 *               type: boolean
 *             sendPaymentReceipts:
 *               type: boolean
 *             companyName:
 *               type: string
 *             companyAddress:
 *               type: string
 *             billingEmail:
 *               type: string
 *               format: email
 *             billingPhone:
 *               type: string
 *         providers:
 *           type: object
 *           properties:
 *             stripe:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 environment:
 *                   type: string
 *                   enum: [sandbox, production]
 *                 publicKey:
 *                   type: string
 *                 secretKey:
 *                   type: string
 *                 webhookSecret:
 *                   type: string
 *             paypal:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 environment:
 *                   type: string
 *                   enum: [sandbox, production]
 *                 clientId:
 *                   type: string
 *                 clientSecret:
 *                   type: string
 *             googlePay:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 environment:
 *                   type: string
 *                   enum: [sandbox, production]
 *                 merchantId:
 *                   type: string
 *         currencies:
 *           type: object
 *           properties:
 *             defaultCurrency:
 *               type: string
 *             autoUpdateExchangeRates:
 *               type: boolean
 *             exchangeRateProvider:
 *               type: string
 *             exchangeRateApiKey:
 *               type: string
 *             supportedCurrencies:
 *               type: array
 *               items:
 *                 type: string
 *             gems:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 exchangeRate:
 *                   type: number
 *                 dailyBonus:
 *                   type: number
 *             hearts:
 *               type: object
 *               properties:
 *                 enabled:
 *                   type: boolean
 *                 exchangeRate:
 *                   type: number
 *                 gemsCost:
 *                   type: number
 *                 refillTimeHours:
 *                   type: number
 *         regional:
 *           type: object
 *           properties:
 *             regionalPricing:
 *               type: boolean
 *             taxCalculation:
 *               type: boolean
 *             autoDetectRegion:
 *               type: boolean
 *             defaultRegion:
 *               type: string
 *             regions:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   currency:
 *                     type: string
 *                   priceMultiplier:
 *                     type: number
 *                   taxRate:
 *                     type: number
 *                   status:
 *                     type: string
 *                     enum: [active, inactive]
 *         webhookEndpoints:
 *           type: object
 *           properties:
 *             paymentSuccessful:
 *               type: string
 *             paymentFailed:
 *               type: string
 *         securitySettings:
 *           type: object
 *           properties:
 *             ipWhitelist:
 *               type: array
 *               items:
 *                 type: string
 *             fraudDetection:
 *               type: boolean
 *         notificationSettings:
 *           type: object
 *           properties:
 *             emailNotifications:
 *               type: boolean
 *             slackWebhook:
 *               type: string
 *         isActive:
 *           type: boolean
 *         metadata:
 *           type: object
 *           additionalProperties: true
 */

/**
 * @swagger
 * /api/payment-settings:
 *   get:
 *     summary: Get payment settings
 *     description: |
 *       Retrieves the current payment settings configuration.
 *       Supports filtering by active status and optionally including sensitive data.
 *       If no settings exist, default settings will be created automatically.
 *     tags:
 *       - Payment Settings
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeSecrets
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *           default: "false"
 *         description: |
 *           Whether to include sensitive data like API keys and secrets.
 *           When false, sensitive fields are masked with "***" or "pk_***" patterns.
 *         required: false
 *         example: "false"
 *       - in: query
 *         name: version
 *         schema:
 *           type: string
 *         description: Specific version of settings to retrieve
 *         required: false
 *         example: "1"
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *           default: "true"
 *         description: Whether to retrieve only active settings
 *         required: false
 *         example: "true"
 *     responses:
 *       '200':
 *         description: Successfully retrieved payment settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentSettingsResponse'
 *             examples:
 *               with_secrets_masked:
 *                 summary: Response with secrets masked (default)
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "64a7b8c9d1e2f3a4b5c6d7e8"
 *                     general:
 *                       enablePayments: true
 *                       testMode: true
 *                       companyName: "TULU Clone"
 *                     providers:
 *                       stripe:
 *                         enabled: true
 *                         environment: "sandbox"
 *                         publicKey: "pk_***"
 *                         secretKey: "sk_***"
 *                     isActive: true
 *                   meta:
 *                     version: 1
 *                     lastModified: "2023-06-15T14:30:00Z"
 *                     isActive: true
 *       '400':
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Invalid query parameters"
 *               errors:
 *                 includeSecrets: ["Invalid enum value. Expected 'true' | 'false'"]
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
 *               message: "Failed to fetch payment settings"
 *               error: "Database connection error"
 */

/**
 * @swagger
 * /api/payment-settings:
 *   put:
 *     summary: Create or replace payment settings
 *     description: |
 *       Creates new payment settings or completely replaces existing ones.
 *       If no settings exist, creates new settings with provided data and default values.
 *       If settings exist, completely replaces them with the new data.
 *     tags:
 *       - Payment Settings
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentSettingsData'
 *           examples:
 *             complete_settings:
 *               summary: Complete payment settings update
 *               value:
 *                 general:
 *                   enablePayments: true
 *                   testMode: false
 *                   companyName: "My Company"
 *                   billingEmail: "billing@mycompany.com"
 *                 providers:
 *                   stripe:
 *                     enabled: true
 *                     environment: "production"
 *                     publicKey: "pk_live_..."
 *                     secretKey: "sk_live_..."
 *                 currencies:
 *                   defaultCurrency: "USD"
 *                   supportedCurrencies: ["USD", "EUR"]
 *             minimal_settings:
 *               summary: Minimal settings (defaults will be applied)
 *               value:
 *                 general:
 *                   enablePayments: true
 *                   companyName: "My Company"
 *     responses:
 *       '200':
 *         description: Successfully updated payment settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentSettingsResponse'
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Validation error"
 *               errors:
 *                 "general.billingEmail": ["Invalid email format"]
 *                 "providers.stripe.publicKey": ["Required when stripe is enabled"]
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
 */

/**
 * @swagger
 * /api/payment-settings:
 *   patch:
 *     summary: Partially update payment settings
 *     description: |
 *       Updates specific fields of the existing payment settings.
 *       Only the provided fields will be updated, existing fields remain unchanged.
 *       Requires existing settings to be present.
 *     tags:
 *       - Payment Settings
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentSettingsPatchRequest'
 *           examples:
 *             update_stripe_only:
 *               summary: Update only Stripe settings
 *               value:
 *                 data:
 *                   providers:
 *                     stripe:
 *                       enabled: true
 *                       environment: "production"
 *                       publicKey: "pk_live_new_key"
 *             update_general_settings:
 *               summary: Update general settings
 *               value:
 *                 data:
 *                   general:
 *                     testMode: false
 *                     companyName: "Updated Company Name"
 *             update_multiple_sections:
 *               summary: Update multiple sections
 *               value:
 *                 data:
 *                   general:
 *                     testMode: false
 *                   currencies:
 *                     defaultCurrency: "EUR"
 *                     gems:
 *                       dailyBonus: 10
 *     responses:
 *       '200':
 *         description: Successfully updated payment settings
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaymentSettingsResponse'
 *                 - type: object
 *                   properties:
 *                     meta:
 *                       type: object
 *                       properties:
 *                         updatedFields:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["general", "providers"]
 *                           description: List of top-level fields that were updated
 *       '400':
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: No payment settings found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No payment settings found. Please create settings first."
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payment-settings:
 *   post:
 *     summary: Create new payment settings
 *     description: |
 *       Creates new payment settings if none exist.
 *       Fails if active payment settings already exist - use PUT or PATCH to update existing settings.
 *       Supports tab-based validation for different setting sections.
 *     tags:
 *       - Payment Settings
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentSettingsCreateRequest'
 *           examples:
 *             create_all_settings:
 *               summary: "Create complete settings (tab: all)"
 *               value:
 *                 tab: "all"
 *                 data:
 *                   general:
 *                     enablePayments: true
 *                     testMode: true
 *                     companyName: "New Company"
 *                   providers:
 *                     stripe:
 *                       enabled: true
 *                       environment: "sandbox"
 *                   currencies:
 *                     defaultCurrency: "USD"
 *             create_providers_only:
 *               summary: "Create provider settings only (tab: providers)"
 *               value:
 *                 tab: "providers"
 *                 data:
 *                   stripe:
 *                     enabled: true
 *                     environment: "sandbox"
 *                     publicKey: "pk_test_..."
 *                     secretKey: "sk_test_..."
 *             create_general_only:
 *               summary: "Create general settings only (tab: general)"
 *               value:
 *                 tab: "general"
 *                 data:
 *                   enablePayments: true
 *                   testMode: true
 *                   companyName: "My Company"
 *                   billingEmail: "billing@mycompany.com"
 *     responses:
 *       '201':
 *         description: Successfully created payment settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentSettingsResponse'
 *       '400':
 *         description: Validation error or invalid tab
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_tab:
 *                 summary: Invalid tab parameter
 *                 value:
 *                   success: false
 *                   message: "Invalid tab: invalid_tab_name"
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     "general.billingEmail": ["Invalid email format"]
 *       '401':
 *         description: Unauthorized - Invalid or missing authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '409':
 *         description: Settings already exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Active payment settings already exist. Use PUT or PATCH to update."
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export async function GET(request: NextRequest) {
  const auth = await authGuard();
  if (auth instanceof NextResponse) return auth;

  try {
    // **Connect to database**
    await connectDB();

    // **Parse query parameters**
    const { searchParams } = new URL(request.url);
    const queryValidation = PaymentSettingsQuerySchema.safeParse({
      includeSecrets: searchParams.get("includeSecrets"),
      version: searchParams.get("version"),
      isActive: searchParams.get("isActive"),
    });

    if (!queryValidation.success) {
      return NextResponse.json(
        {
          message: "Invalid query parameters",
          errors: queryValidation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { includeSecrets, isActive } = queryValidation.data;

    // **Fetch settings from database**
    let settings = await PaymentSettings.findOne({
      isActive,
    })
      .populate("lastModifiedBy", "username email")
      .lean();

    // **If no settings exist, create default settings**
    if (!settings) {
      console.log("No payment settings found, creating default settings...");
      settings = await PaymentSettings.createDefaultSettings();
    }

    // **Transform response based on includeSecrets parameter**
    let responseData;
    if (includeSecrets === "true") {
      // **Include sensitive data (for admin use)**
      responseData = settings;
    } else {
      // **Exclude sensitive data (default)**
      responseData = {
        ...settings,
        providers: {
          stripe: {
            enabled: settings.providers?.stripe.enabled,
            environment: settings.providers?.stripe.environment,
            publicKey: settings.providers?.stripe.publicKey
              ? "pk_***"
              : undefined,
            secretKey: settings.providers?.stripe.secretKey
              ? "sk_***"
              : undefined,
            webhookSecret: settings.providers?.stripe.webhookSecret
              ? "whsec_***"
              : undefined,
          },
          paypal: {
            enabled: settings.providers?.paypal.enabled,
            environment: settings.providers?.paypal.environment,
            clientId: settings.providers?.paypal.clientId ? "***" : undefined,
            clientSecret: settings.providers?.paypal.clientSecret
              ? "***"
              : undefined,
          },
          googlePay: {
            enabled: settings.providers?.googlePay.enabled,
            environment: settings.providers?.googlePay.environment,
            merchantId: settings.providers?.googlePay.merchantId,
          },
        },
        currencies: {
          ...settings?.currencies,
          exchangeRateApiKey: settings?.currencies.exchangeRateApiKey
            ? "***"
            : undefined,
        },
      };
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        version: settings?.version,
        lastModified: settings?.updatedAt,
        isActive: settings?.isActive,
      },
    });
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await authGuard();
  if (auth instanceof NextResponse) return auth;

  try {
    // **Connect to database**
    await connectDB();

    // **Parse and validate request body**
    const body = await request.json();
    const validation = PaymentSettingsUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // **Find existing settings or create new ones**
    let settings = await PaymentSettings.findOne({ isActive: true });

    if (!settings) {
      // **Create new settings if none exist**
      const createValidation = PaymentSettingsCreateSchema.safeParse({
        ...data,
        general: data.general || {
          enablePayments: true,
          testMode: true,
          autoRetryFailedPayments: true,
          sendPaymentReceipts: true,
          companyName: "TULU Clone",
          companyAddress:
            "456 Business Ave, Suite 100, San Francisco, CA 94107",
          billingEmail: "billing@duolingoclone.com",
          billingPhone: "+1 (555) 123-4567",
        },
        providers: data.providers || {
          stripe: { enabled: false, environment: "sandbox" },
          paypal: { enabled: false, environment: "sandbox" },
          googlePay: { enabled: false, environment: "sandbox" },
        },
        currencies: data.currencies || {
          defaultCurrency: "USD",
          autoUpdateExchangeRates: true,
          exchangeRateProvider: "fixer",
          supportedCurrencies: ["USD", "EUR", "GBP"],
          gems: { enabled: true, exchangeRate: 100, dailyBonus: 5 },
          hearts: {
            enabled: true,
            exchangeRate: 1,
            gemsCost: 10,
            refillTimeHours: 5,
          },
        },
        regional: data.regional || {
          regionalPricing: true,
          taxCalculation: true,
          autoDetectRegion: true,
          defaultRegion: "United States",
          regions: [
            {
              name: "United States",
              currency: "USD",
              priceMultiplier: 1.0,
              taxRate: 0,
              status: "active",
            },
          ],
        },
      });

      if (!createValidation.success) {
        return NextResponse.json(
          {
            message: "Validation error for new settings",
            errors: createValidation.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      settings = await PaymentSettings.create(createValidation.data);
    } else {
      type SettingsType = PaymentSettingsType; // your interface

      const plainSettings = settings.toObject() as SettingsType;
      const plainData = data as Partial<SettingsType>;
      function typedKeys<T extends object>(obj: T): Array<keyof T> {
        return Object.keys(obj) as Array<keyof T>;
      }
      typedKeys(plainData).forEach((key) => {
        const dataValue = plainData[key];

        if (dataValue !== undefined) {
          if (typeof dataValue === "object" && !Array.isArray(dataValue)) {
            plainSettings[key] = {
              ...(plainSettings[key] as object),
              ...(dataValue as object),
            } as SettingsType[typeof key];
          } else {
            plainSettings[key] = dataValue as SettingsType[typeof key];
          }
        }
      });

      // Assign back and save
      Object.assign(settings, plainSettings);
      await settings.save();
    }

    // **Populate user information**
    await settings.populate("lastModifiedBy", "username email");

    // **Return safe object (without sensitive data)**
    const safeSettings = settings.toObject();

    return NextResponse.json({
      success: true,
      data: safeSettings,
      message: "Payment settings updated successfully",
      meta: {
        version: settings.version,
        lastModified: settings.updatedAt,
        isActive: settings.isActive,
      },
    });
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update payment settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authGuard();
  if (auth instanceof NextResponse) return auth;

  try {
    // **Connect to database**
    await connectDB();

    // **Parse and validate request body**
    const body = await request.json();

    const validation = PaymentSettingsUpdateSchema.safeParse(body.data);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // **Find existing settings**
    const settings = await PaymentSettings.findOne({ isActive: true });

    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          message: "No payment settings found. Please create settings first.",
        },
        { status: 404 }
      );
    }

    console.log(data);

    // **Apply partial updates**
    if (data.general) {
      settings.general = { ...settings.general, ...data.general };
    }

    if (data.providers) {
      Object.keys(data.providers).forEach((provider) => {
        if (data.providers![provider as keyof typeof data.providers]) {
          settings.providers[provider as keyof typeof settings.providers] = {
            ...settings.providers[provider as keyof typeof settings.providers],
            ...data.providers![provider as keyof typeof data.providers],
          };
        }
      });
    }

    if (data.currencies) {
      settings.currencies = { ...settings.currencies, ...data.currencies };
      if (data.currencies.gems) {
        settings.currencies.gems = {
          ...settings.currencies.gems,
          ...data.currencies.gems,
        };
      }
      if (data.currencies.hearts) {
        settings.currencies.hearts = {
          ...settings.currencies.hearts,
          ...data.currencies.hearts,
        };
      }
    }

    if (data.regional) {
      settings.regional = { ...settings.regional, ...data.regional };
      if (data.regional.regions) {
        settings.regional.regions = data.regional.regions;
      }
    }

    if (data.webhookEndpoints) {
      settings.webhookEndpoints = {
        ...settings.webhookEndpoints,
        ...data.webhookEndpoints,
      };
    }

    if (data.securitySettings) {
      settings.securitySettings = {
        ...settings.securitySettings,
        ...data.securitySettings,
      };
    }

    if (data.notificationSettings) {
      settings.notificationSettings = {
        ...settings.notificationSettings,
        ...data.notificationSettings,
      };
    }

    if (data.isActive !== undefined) {
      settings.isActive = data.isActive;
    }

    if (data.metadata) {
      settings.metadata = { ...settings.metadata, ...data.metadata };
    }

    // **Save updated settings**
    await settings.save();

    // **Populate user information**
    await settings.populate("lastModifiedBy", "username email");

    // **Return safe object (without sensitive data)**
    const safeSettings = settings.toObject();

    return NextResponse.json({
      success: true,
      data: safeSettings,
      message: "Payment settings updated successfully",
      meta: {
        version: settings.version,
        lastModified: settings.updatedAt,
        isActive: settings.isActive,
        updatedFields: Object.keys(data),
      },
    });
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update payment settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await authGuard();
  if (auth instanceof NextResponse) return auth;

  try {
    // **Connect to database**
    await connectDB();

    // **Parse and validate request body**
    const body = await request.json();

    const tab = body?.tab || "all";
    const schema = schemaMap[tab];

    if (!schema) {
      return NextResponse.json(
        {
          message: `Invalid tab: ${tab}`,
        },
        { status: 400 }
      );
    }

    const validation = schema.safeParse(body.data);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // **Check if active settings already exist**
    const existingSettings = await PaymentSettings.findOne({ isActive: true });
    if (existingSettings) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Active payment settings already exist. Use PUT or PATCH to update.",
        },
        { status: 409 }
      );
    }

    // **Create new settings**
    const settings = await PaymentSettings.create(data);

    // **Populate user information**
    await settings.populate("lastModifiedBy", "username email");

    // **Return safe object (without sensitive data)**
    const safeSettings = settings.toObject();

    return NextResponse.json(
      {
        success: true,
        data: safeSettings,
        message: "Payment settings created successfully",
        meta: {
          version: settings.version,
          lastModified: settings.updatedAt,
          isActive: settings.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating payment settings:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create payment settings",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

const schemaMap: Record<string, Zod.ZodSchema> = {
  general: GeneralSettingsSchema,
  regional: RegionalSettingSchema,
  currency: CurrencySettingsSchema,
  providers: PaymentProviderSchema,
  all: PaymentSettingsCreateSchema,
};
