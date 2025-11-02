import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db/connect";
import PaymentSettings from "@/models/PaymentSettings";

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get payment and shop settings
 *     description: |
 *       Retrieves the current payment and shop settings for the authenticated user.
 *       If no settings exist, creates and returns default settings automatically.
 *       This endpoint provides configuration data needed for payment processing
 *       and shop functionality. Requires user authentication.
 *     tags:
 *       - Settings
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SettingsResponse'
 *             examples:
 *               existingSettings:
 *                 summary: Existing payment settings
 *                 value:
 *                   success: true
 *                   data:
 *                     paymentMethods:
 *                       stripe:
 *                         enabled: true
 *                         publicKey: "pk_test_..."
 *                         currency: "USD"
 *                       paypal:
 *                         enabled: false
 *                         clientId: ""
 *                         currency: "USD"
 *                     shopSettings:
 *                       taxRate: 0.08
 *                       shippingEnabled: true
 *                       freeShippingThreshold: 50.00
 *                       defaultCurrency: "USD"
 *                       supportedCurrencies: ["USD", "EUR", "GBP"]
 *                     features:
 *                       subscriptions: true
 *                       oneTimePayments: true
 *                       refunds: true
 *                       webhooks: true
 *                     notifications:
 *                       emailEnabled: true
 *                       smsEnabled: false
 *                       pushEnabled: true
 *                     security:
 *                       twoFactorRequired: false
 *                       sessionTimeout: 3600
 *                       maxLoginAttempts: 5
 *               defaultSettings:
 *                 summary: Default settings created
 *                 value:
 *                   success: true
 *                   data:
 *                     paymentMethods:
 *                       stripe:
 *                         enabled: false
 *                         publicKey: ""
 *                         currency: "USD"
 *                       paypal:
 *                         enabled: false
 *                         clientId: ""
 *                         currency: "USD"
 *                     shopSettings:
 *                       taxRate: 0.00
 *                       shippingEnabled: false
 *                       freeShippingThreshold: 0.00
 *                       defaultCurrency: "USD"
 *                       supportedCurrencies: ["USD"]
 *                     features:
 *                       subscriptions: false
 *                       oneTimePayments: true
 *                       refunds: false
 *                       webhooks: false
 *                     notifications:
 *                       emailEnabled: true
 *                       smsEnabled: false
 *                       pushEnabled: false
 *                     security:
 *                       twoFactorRequired: false
 *                       sessionTimeout: 1800
 *                       maxLoginAttempts: 3
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
 *                   success: false
 *                   error: "Failed to fetch shop settings"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentMethodSettings:
 *       type: object
 *       properties:
 *         stripe:
 *           type: object
 *           properties:
 *             enabled:
 *               type: boolean
 *               description: Whether Stripe payment method is enabled
 *               example: true
 *             publicKey:
 *               type: string
 *               description: Stripe public key for client-side integration
 *               example: "pk_test_..."
 *             currency:
 *               type: string
 *               description: Default currency for Stripe payments
 *               example: "USD"
 *         paypal:
 *           type: object
 *           properties:
 *             enabled:
 *               type: boolean
 *               description: Whether PayPal payment method is enabled
 *               example: false
 *             clientId:
 *               type: string
 *               description: PayPal client ID for integration
 *               example: ""
 *             currency:
 *               type: string
 *               description: Default currency for PayPal payments
 *               example: "USD"
 *
 *     ShopSettings:
 *       type: object
 *       properties:
 *         taxRate:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Tax rate applied to purchases (as decimal)
 *           example: 0.08
 *         shippingEnabled:
 *           type: boolean
 *           description: Whether shipping is enabled for physical products
 *           example: true
 *         freeShippingThreshold:
 *           type: number
 *           minimum: 0
 *           description: Minimum order amount for free shipping
 *           example: 50.00
 *         defaultCurrency:
 *           type: string
 *           description: Default currency for the shop
 *           example: "USD"
 *         supportedCurrencies:
 *           type: array
 *           items:
 *             type: string
 *           description: List of supported currencies
 *           example: ["USD", "EUR", "GBP"]
 *
 *     FeatureSettings:
 *       type: object
 *       properties:
 *         subscriptions:
 *           type: boolean
 *           description: Whether subscription payments are enabled
 *           example: true
 *         oneTimePayments:
 *           type: boolean
 *           description: Whether one-time payments are enabled
 *           example: true
 *         refunds:
 *           type: boolean
 *           description: Whether refund processing is enabled
 *           example: true
 *         webhooks:
 *           type: boolean
 *           description: Whether webhook notifications are enabled
 *           example: true
 *
 *     NotificationSettings:
 *       type: object
 *       properties:
 *         emailEnabled:
 *           type: boolean
 *           description: Whether email notifications are enabled
 *           example: true
 *         smsEnabled:
 *           type: boolean
 *           description: Whether SMS notifications are enabled
 *           example: false
 *         pushEnabled:
 *           type: boolean
 *           description: Whether push notifications are enabled
 *           example: true
 *
 *     SecuritySettings:
 *       type: object
 *       properties:
 *         twoFactorRequired:
 *           type: boolean
 *           description: Whether two-factor authentication is required
 *           example: false
 *         sessionTimeout:
 *           type: integer
 *           minimum: 300
 *           description: Session timeout in seconds
 *           example: 3600
 *         maxLoginAttempts:
 *           type: integer
 *           minimum: 1
 *           description: Maximum login attempts before lockout
 *           example: 5
 *
 *     SettingsData:
 *       type: object
 *       properties:
 *         paymentMethods:
 *           $ref: '#/components/schemas/PaymentMethodSettings'
 *           description: Payment method configurations
 *         shopSettings:
 *           $ref: '#/components/schemas/ShopSettings'
 *           description: General shop configuration
 *         features:
 *           $ref: '#/components/schemas/FeatureSettings'
 *           description: Feature toggles and capabilities
 *         notifications:
 *           $ref: '#/components/schemas/NotificationSettings'
 *           description: Notification preferences
 *         security:
 *           $ref: '#/components/schemas/SecuritySettings'
 *           description: Security and authentication settings
 *
 *     SettingsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Success status of the operation
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/SettingsData'
 *           description: Settings configuration data
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
 *     SettingsApiUsageExample:
 *       summary: How to use the Settings API with Axios
 *       description: |
 *         **Step 1: Fetch Settings with Axios**
 *         ```javascript
 *         import axios from 'axios';
 *
 *         const fetchSettings = async () => {
 *           try {
 *             const response = await axios.get('/api/settings', {
 *               headers: {
 *                 'Authorization': `Bearer ${getAuthToken()}`
 *               }
 *             });
 *
 *             if (response.data.success) {
 *               return response.data.data;
 *             } else {
 *               throw new Error(response.data.error || 'Failed to fetch settings');
 *             }
 *           } catch (error) {
 *             console.error('Failed to fetch settings:', error);
 *             throw error;
 *           }
 *         };
 *
 *         // Usage
 *         const settings = await fetchSettings();
 *         console.log('Current settings:', settings);
 *         ```
 *
 *         **Step 2: Use Settings for Payment Integration**
 *         ```javascript
 *         const initializePaymentMethods = async () => {
 *           try {
 *             const settings = await fetchSettings();
 *             const { paymentMethods } = settings;
 *
 *             // Initialize Stripe if enabled
 *             if (paymentMethods.stripe.enabled && paymentMethods.stripe.publicKey) {
 *               const stripe = Stripe(paymentMethods.stripe.publicKey);
 *               console.log('Stripe initialized with currency:', paymentMethods.stripe.currency);
 *
 *               // Store for later use
 *               window.stripeInstance = stripe;
 *             }
 *
 *             // Initialize PayPal if enabled
 *             if (paymentMethods.paypal.enabled && paymentMethods.paypal.clientId) {
 *               // Load PayPal SDK
 *               await loadPayPalSDK(paymentMethods.paypal.clientId, paymentMethods.paypal.currency);
 *               console.log('PayPal initialized');
 *             }
 *
 *             return {
 *               stripeEnabled: paymentMethods.stripe.enabled,
 *               paypalEnabled: paymentMethods.paypal.enabled,
 *               defaultCurrency: settings.shopSettings.defaultCurrency
 *             };
 *           } catch (error) {
 *             console.error('Failed to initialize payment methods:', error);
 *             return {
 *               stripeEnabled: false,
 *               paypalEnabled: false,
 *               defaultCurrency: 'USD'
 *             };
 *           }
 *         };
 *
 *         const loadPayPalSDK = (clientId, currency) => {
 *           return new Promise((resolve, reject) => {
 *             if (window.paypal) {
 *               resolve(window.paypal);
 *               return;
 *             }
 *
 *             const script = document.createElement('script');
 *             script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
 *             script.onload = () => resolve(window.paypal);
 *             script.onerror = reject;
 *             document.head.appendChild(script);
 *           });
 *         };
 *         ```
 *
 *         **Step 3: Create a Settings Service**
 *         ```javascript
 *         class SettingsService {
 *           constructor() {
 *             this.client = axios.create({
 *               baseURL: '/api',
 *               headers: {
 *                 'Content-Type': 'application/json'
 *               }
 *             });
 *
 *             this.setupInterceptors();
 *             this.settings = null;
 *             this.lastFetch = null;
 *             this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
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
 *           async getSettings(forceRefresh = false) {
 *             // Return cached settings if available and not expired
 *             if (!forceRefresh && this.settings && this.lastFetch) {
 *               const timeSinceLastFetch = Date.now() - this.lastFetch;
 *               if (timeSinceLastFetch < this.cacheTimeout) {
 *                 return this.settings;
 *               }
 *             }
 *
 *             try {
 *               const response = await this.client.get('/settings');
 *
 *               if (response.data.success) {
 *                 this.settings = response.data.data;
 *                 this.lastFetch = Date.now();
 *                 return this.settings;
 *               } else {
 *                 throw new Error(response.data.error || 'Failed to fetch settings');
 *               }
 *             } catch (error) {
 *               console.error('Settings fetch error:', error);
 *               throw error;
 *             }
 *           }
 *
 *           async getPaymentMethods() {
 *             const settings = await this.getSettings();
 *             return settings.paymentMethods;
 *           }
 *
 *           async getShopSettings() {
 *             const settings = await this.getSettings();
 *             return settings.shopSettings;
 *           }
 *
 *           async getFeatureSettings() {
 *             const settings = await this.getSettings();
 *             return settings.features;
 *           }
 *
 *           async isFeatureEnabled(featureName) {
 *             const features = await this.getFeatureSettings();
 *             return features[featureName] || false;
 *           }
 *
 *           async getNotificationSettings() {
 *             const settings = await this.getSettings();
 *             return settings.notifications;
 *           }
 *
 *           async getSecuritySettings() {
 *             const settings = await this.getSettings();
 *             return settings.security;
 *           }
 *
 *           // Helper methods
 *           async calculateTax(amount) {
 *             const shopSettings = await this.getShopSettings();
 *             return amount * shopSettings.taxRate;
 *           }
 *
 *           async calculateShipping(amount) {
 *             const shopSettings = await this.getShopSettings();
 *
 *             if (!shopSettings.shippingEnabled) {
 *               return 0;
 *             }
 *
 *             if (amount >= shopSettings.freeShippingThreshold) {
 *               return 0;
 *             }
 *
 *             // Return default shipping cost (this would typically come from settings)
 *             return 5.99;
 *           }
 *
 *           async getSupportedCurrencies() {
 *             const shopSettings = await this.getShopSettings();
 *             return shopSettings.supportedCurrencies;
 *           }
 *
 *           async getDefaultCurrency() {
 *             const shopSettings = await this.getShopSettings();
 *             return shopSettings.defaultCurrency;
 *           }
 *
 *           clearCache() {
 *             this.settings = null;
 *             this.lastFetch = null;
 *           }
 *         }
 *
 *         export const settingsService = new SettingsService();
 *         ```
 *
 *     ReactSettingsProviderExample:
 *       summary: React context provider for settings
 *       description: |
 *         ```typescript
 *         import React, { createContext, useContext, useEffect, useState } from 'react';
 *         import axios from 'axios';
 *
 *         interface Settings {
 *           paymentMethods: {
 *             stripe: {
 *               enabled: boolean;
 *               publicKey: string;
 *               currency: string;
 *             };
 *             paypal: {
 *               enabled: boolean;
 *               clientId: string;
 *               currency: string;
 *             };
 *           };
 *           shopSettings: {
 *             taxRate: number;
 *             shippingEnabled: boolean;
 *             freeShippingThreshold: number;
 *             defaultCurrency: string;
 *             supportedCurrencies: string[];
 *           };
 *           features: {
 *             subscriptions: boolean;
 *             oneTimePayments: boolean;
 *             refunds: boolean;
 *             webhooks: boolean;
 *           };
 *           notifications: {
 *             emailEnabled: boolean;
 *             smsEnabled: boolean;
 *             pushEnabled: boolean;
 *           };
 *           security: {
 *             twoFactorRequired: boolean;
 *             sessionTimeout: number;
 *             maxLoginAttempts: number;
 *           };
 *         }
 *
 *         interface SettingsContextType {
 *           settings: Settings | null;
 *           loading: boolean;
 *           error: string | null;
 *           refreshSettings: () => Promise<void>;
 *           isFeatureEnabled: (feature: keyof Settings['features']) => boolean;
 *         }
 *
 *         const SettingsContext = createContext<SettingsContextType | undefined>(undefined);
 *
 *         export function SettingsProvider({ children }: { children: React.ReactNode }) {
 *           const [settings, setSettings] = useState<Settings | null>(null);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState<string | null>(null);
 *
 *           const fetchSettings = async () => {
 *             try {
 *               setLoading(true);
 *               setError(null);
 *
 *               const response = await axios.get('/api/settings');
 *
 *               if (response.data.success) {
 *                 setSettings(response.data.data);
 *               } else {
 *                 setError(response.data.error || 'Failed to fetch settings');
 *               }
 *             } catch (err) {
 *               if (axios.isAxiosError(err)) {
 *                 if (err.response?.status === 401) {
 *                   setError('Authentication required');
 *                 } else {
 *                   setError(err.response?.data?.error || 'Failed to fetch settings');
 *                 }
 *               } else {
 *                 setError('An unexpected error occurred');
 *               }
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           const refreshSettings = async () => {
 *             await fetchSettings();
 *           };
 *
 *           const isFeatureEnabled = (feature: keyof Settings['features']) => {
 *             return settings?.features[feature] || false;
 *           };
 *
 *           useEffect(() => {
 *             fetchSettings();
 *           }, []);
 *
 *           const value: SettingsContextType = {
 *             settings,
 *             loading,
 *             error,
 *             refreshSettings,
 *             isFeatureEnabled
 *           };
 *
 *           return (
 *             <SettingsContext.Provider value={value}>
 *               {children}
 *             </SettingsContext.Provider>
 *           );
 *         }
 *
 *         export function useSettings() {
 *           const context = useContext(SettingsContext);
 *           if (context === undefined) {
 *             throw new Error('useSettings must be used within a SettingsProvider');
 *           }
 *           return context;
 *         }
 *
 *         // Usage in components
 *         export function PaymentMethodSelector() {
 *           const { settings, loading, error } = useSettings();
 *
 *           if (loading) return <div>Loading payment methods...</div>;
 *           if (error) return <div>Error: {error}</div>;
 *           if (!settings) return <div>No settings available</div>;
 *
 *           const { paymentMethods } = settings;
 *
 *           return (
 *             <div className="payment-methods">
 *               <h3>Available Payment Methods</h3>
 *
 *               {paymentMethods.stripe.enabled && (
 *                 <div className="payment-method">
 *                   <label>
 *                     <input type="radio" name="payment" value="stripe" />
 *                     Credit Card (Stripe)
 *                   </label>
 *                   <span className="currency">{paymentMethods.stripe.currency}</span>
 *                 </div>
 *               )}
 *
 *               {paymentMethods.paypal.enabled && (
 *                 <div className="payment-method">
 *                   <label>
 *                     <input type="radio" name="payment" value="paypal" />
 *                     PayPal
 *                   </label>
 *                   <span className="currency">{paymentMethods.paypal.currency}</span>
 *                 </div>
 *               )}
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Settings
 *     description: Operations for managing application settings and configuration
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const paymentSettings = await PaymentSettings.getActiveSettings();

    if (!paymentSettings) {
      // Create default settings if none exist
      const defaultSettings = await PaymentSettings.createDefaultSettings();

      return NextResponse.json({
        success: true,
        data: extractShopSettings(defaultSettings),
      });
    }

    return NextResponse.json({
      success: true,
      data: extractShopSettings(paymentSettings),
    });
  } catch (error) {
    console.error("Shop Settings API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch shop settings",
      },
      { status: 500 }
    );
  }
}

/**
 * Extract shop-relevant settings from PaymentSettings
 */
type Nullable<T> = T | null;

type PaymentSettings = {
  currencies?: {
    hearts?: {
      gemsCost?: Nullable<number>;
      refillTimeHours?: Nullable<number>;
      maxAmount?: Nullable<number>;
      minPurchase?: Nullable<number>;
      enabled?: Nullable<boolean>;
      dailyBonus?: Nullable<number>;
    };
    gems?: {
      exchangeRate?: Nullable<number>;
      enabled?: Nullable<boolean>;
      dailyBonus?: Nullable<number>;
      minPurchase?: Nullable<number>;
    };
    defaultCurrency?: Nullable<string>;
    supportedCurrencies?: string[];
  };
  general?: {
    enablePayments?: Nullable<boolean>;
    testMode?: Nullable<boolean>;
    autoRetryFailedPayments?: Nullable<boolean>;
    sendPaymentReceipts?: Nullable<boolean>;
    companyName?: Nullable<string>;
    companyAddress?: Nullable<string>;
    billingEmail?: Nullable<string>;
    supportEmail?: Nullable<string>;
    companyWebsite?: Nullable<string>;
  };
  regional?: {
    regionalPricing?: Nullable<boolean>;
    taxCalculation?: Nullable<boolean>;
    defaultRegion?: Nullable<string>;
  };
  activeRegions?: string[];
  enabledProviders?: string[];
  securitySettings?: Nullable<{
    requireTwoFactorForChanges?: Nullable<boolean>;
    sessionTimeout?: Nullable<number>;
    allowedIpAddresses?: string[];
    encryptSensitiveData?: Nullable<boolean>;
  }>;
  notificationSettings?: Nullable<{
    emailOnFailedPayments?: Nullable<boolean>;
    emailOnRefunds?: Nullable<boolean>;
  }>;
  version?: Nullable<number>;
  updatedAt?: string | Date;
};

type ShopSettings = {
  heartCostInGems: number;
  heartRefillTimeHours: number;
  maxHearts: number;
  maxHeartsPerPurchase: number;
  heartsEnabled: boolean;
  heartsDailyBonus: number;

  gemExchangeRate: number;
  gemsEnabled: boolean;
  gemsDailyBonus: number;
  gemsMinPurchase: number;

  defaultCurrency: string;
  supportedCurrencies: string[];

  paymentsEnabled: boolean;
  testMode: boolean;
  autoRetryFailedPayments: boolean;
  sendPaymentReceipts: boolean;

  regionalPricing: boolean;
  taxCalculation: boolean;
  defaultRegion: string;
  activeRegions: string[];

  enabledProviders: string[];

  companyName: string;
  companyAddress: string;
  billingEmail: string;
  supportEmail: string;
  companyWebsite: string;

  requireTwoFactorForChanges: boolean;
  sessionTimeout: number;

  emailOnFailedPayments: boolean;
  emailOnRefunds: boolean;

  version: number;
  lastUpdated?: string | Date;
};

function extractShopSettings(paymentSettings: PaymentSettings): ShopSettings {
  return {
    heartCostInGems: paymentSettings?.currencies?.hearts?.gemsCost || 500,
    heartRefillTimeHours:
      paymentSettings?.currencies?.hearts?.refillTimeHours || 5,
    maxHearts: paymentSettings?.currencies?.hearts?.maxAmount || 5,
    maxHeartsPerPurchase: paymentSettings?.currencies?.hearts?.minPurchase || 5,
    heartsEnabled: paymentSettings?.currencies?.hearts?.enabled ?? true,
    heartsDailyBonus: paymentSettings?.currencies?.hearts?.dailyBonus || 0,

    gemExchangeRate: paymentSettings?.currencies?.gems?.exchangeRate || 100,
    gemsEnabled: paymentSettings?.currencies?.gems?.enabled ?? true,
    gemsDailyBonus: paymentSettings?.currencies?.gems?.dailyBonus || 5,
    gemsMinPurchase: paymentSettings?.currencies?.gems?.minPurchase || 1,

    defaultCurrency: paymentSettings?.currencies?.defaultCurrency || "USD",
    supportedCurrencies: paymentSettings?.currencies?.supportedCurrencies || [
      "USD",
    ],

    paymentsEnabled: paymentSettings?.general?.enablePayments ?? true,
    testMode: paymentSettings?.general?.testMode ?? true,
    autoRetryFailedPayments:
      paymentSettings?.general?.autoRetryFailedPayments ?? true,
    sendPaymentReceipts: paymentSettings?.general?.sendPaymentReceipts ?? true,

    regionalPricing: paymentSettings?.regional?.regionalPricing ?? false,
    taxCalculation: paymentSettings?.regional?.taxCalculation ?? false,
    defaultRegion: paymentSettings?.regional?.defaultRegion || "United States",
    activeRegions: paymentSettings?.activeRegions || [],

    enabledProviders: paymentSettings?.enabledProviders || [],

    companyName: paymentSettings?.general?.companyName || "TULU",
    companyAddress: paymentSettings?.general?.companyAddress || "",
    billingEmail: paymentSettings?.general?.billingEmail || "",
    supportEmail: paymentSettings?.general?.supportEmail || "",
    companyWebsite: paymentSettings?.general?.companyWebsite || "",

    requireTwoFactorForChanges:
      paymentSettings?.securitySettings?.requireTwoFactorForChanges ?? false,
    sessionTimeout: paymentSettings?.securitySettings?.sessionTimeout || 3600,

    emailOnFailedPayments:
      paymentSettings?.notificationSettings?.emailOnFailedPayments ?? true,
    emailOnRefunds:
      paymentSettings?.notificationSettings?.emailOnRefunds ?? true,

    version: paymentSettings?.version || 1,
    lastUpdated: paymentSettings?.updatedAt,
  };
}
