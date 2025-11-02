import { NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import PaymentSettings from "@/models/PaymentSettings";
import { auth } from "@clerk/nextjs/server";

/**
 * @swagger
 * /api/payment-providers:
 *   get:
 *     summary: Get available payment providers
 *     description: |
 *       Retrieves a list of enabled payment providers with their configuration details.
 *       Only returns providers that are currently enabled in the payment settings.
 *       Excludes sensitive information like secret keys and only returns public configuration.
 *       Requires user authentication.
 *     tags:
 *       - Payment Providers
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved payment providers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentProvidersResponse'
 *             examples:
 *               allProvidersEnabled:
 *                 summary: All payment providers enabled
 *                 value:
 *                   success: true
 *                   data:
 *                     providers:
 *                       - id: "stripe"
 *                         name: "Credit Card"
 *                         description: "Secure payment via Stripe"
 *                         icon: "credit-card"
 *                         type: "redirect"
 *                         config:
 *                           publicKey: "pk_test_123456789abcdef"
 *                       - id: "paypal"
 *                         name: "PayPal"
 *                         description: "Secure payment with your PayPal account"
 *                         icon: "paypal"
 *                         type: "redirect"
 *                         config:
 *                           clientId: "AQkquBDf1zctJOWGKWUEtKXm6qVhueUEMvXO_-MCI4DQQ4-LWvkDLIN2fGsd"
 *                       - id: "googlepay"
 *                         name: "Google Pay"
 *                         description: "Quick payment with Google Pay"
 *                         icon: "google-pay"
 *                         type: "wallet"
 *                         config:
 *                           merchantId: "BCR2DN4T2CHVXKYF"
 *                     defaultCurrency: "USD"
 *               limitedProviders:
 *                 summary: Only some providers enabled
 *                 value:
 *                   success: true
 *                   data:
 *                     providers:
 *                       - id: "stripe"
 *                         name: "Credit Card"
 *                         description: "Secure payment via Stripe"
 *                         icon: "credit-card"
 *                         type: "redirect"
 *                         config:
 *                           publicKey: "pk_test_123456789abcdef"
 *                     defaultCurrency: "EUR"
 *               noProviders:
 *                 summary: No providers enabled
 *                 value:
 *                   success: true
 *                   data:
 *                     providers: []
 *                     defaultCurrency: "USD"
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
 *         description: Not found - Payment settings not configured
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               settingsNotFound:
 *                 value:
 *                   success: false
 *                   message: "Payment settings and providers not found"
 *       '500':
 *         description: Internal server error - Failed to fetch payment providers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailedErrorResponse'
 *             examples:
 *               serverErrorExample:
 *                 value:
 *                   success: false
 *                   message: "Failed to fetch payment providers"
 *                   error: "Database connection failed"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentProvider:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           enum: [stripe, paypal, googlepay]
 *           description: Unique identifier for the payment provider
 *           example: "stripe"
 *         name:
 *           type: string
 *           description: Display name of the payment provider
 *           example: "Credit Card"
 *         description:
 *           type: string
 *           description: Description of the payment method
 *           example: "Secure payment via Stripe"
 *         icon:
 *           type: string
 *           description: Icon identifier for UI display
 *           example: "credit-card"
 *         type:
 *           type: string
 *           enum: [redirect, wallet, embedded]
 *           description: Payment flow type
 *           example: "redirect"
 *         config:
 *           type: object
 *           description: Provider-specific public configuration
 *           oneOf:
 *             - $ref: '#/components/schemas/StripeConfig'
 *             - $ref: '#/components/schemas/PayPalConfig'
 *             - $ref: '#/components/schemas/GooglePayConfig'
 *
 *     StripeConfig:
 *       type: object
 *       properties:
 *         publicKey:
 *           type: string
 *           description: Stripe publishable key for client-side integration
 *           example: "pk_test_123456789abcdef"
 *           pattern: "^pk_(test_|live_)[a-zA-Z0-9]{24,}$"
 *
 *     PayPalConfig:
 *       type: object
 *       properties:
 *         clientId:
 *           type: string
 *           description: PayPal client ID for client-side integration
 *           example: "AQkquBDf1zctJOWGKWUEtKXm6qVhueUEMvXO_-MCI4DQQ4-LWvkDLIN2fGsd"
 *
 *     GooglePayConfig:
 *       type: object
 *       properties:
 *         merchantId:
 *           type: string
 *           description: Google Pay merchant ID
 *           example: "BCR2DN4T2CHVXKYF"
 *           pattern: "^[A-Z0-9]{16}$"
 *
 *     PaymentProvidersData:
 *       type: object
 *       properties:
 *         providers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PaymentProvider'
 *           description: List of enabled payment providers
 *         defaultCurrency:
 *           type: string
 *           description: Default currency code for payments
 *           example: "USD"
 *           pattern: "^[A-Z]{3}$"
 *
 *     PaymentProvidersResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the request was successful
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/PaymentProvidersData'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates the request failed
 *           example: false
 *         message:
 *           type: string
 *           description: Error message describing what went wrong
 *           example: "Payment settings and providers not found"
 *         error:
 *           type: string
 *           description: Error message for unauthorized requests
 *           example: "Unauthorized"
 *
 *     DetailedErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates the request failed
 *           example: false
 *         message:
 *           type: string
 *           description: General error message
 *           example: "Failed to fetch payment providers"
 *         error:
 *           type: string
 *           description: Detailed error information
 *           example: "Database connection failed"
 *
 *   examples:
 *     PaymentProvidersUsageExample:
 *       summary: How to use the Payment Providers API
 *       description: |
 *         **Step 1: Fetch Available Payment Providers**
 *         ```javascript
 *         const response = await fetch('/api/payment-providers', {
 *           method: 'GET',
 *           headers: {
 *             'Authorization': 'Bearer YOUR_TOKEN_HERE'
 *           }
 *         });
 *
 *         const result = await response.json();
 *
 *         if (result.success) {
 *           console.log('Available providers:', result.data.providers);
 *           console.log('Default currency:', result.data.defaultCurrency);
 *         } else {
 *           console.error('Failed to fetch providers:', result.message);
 *         }
 *         ```
 *
 *         **Step 2: Initialize Payment Providers**
 *         ```javascript
 *         const initializePaymentProviders = (providers) => {
 *           providers.forEach(provider => {
 *             switch (provider.id) {
 *               case 'stripe':
 *                 // Initialize Stripe with public key
 *                 const stripe = Stripe(provider.config.publicKey);
 *                 break;
 *
 *               case 'paypal':
 *                 // Initialize PayPal with client ID
 *                 paypal.Buttons({
 *                   createOrder: (data, actions) => {
 *                     // PayPal order creation logic
 *                   }
 *                 }).render('#paypal-button-container');
 *                 break;
 *
 *               case 'googlepay':
 *                 // Initialize Google Pay
 *                 const paymentsClient = new google.payments.api.PaymentsClient({
 *                   environment: 'TEST', // or 'PRODUCTION'
 *                   merchantInfo: {
 *                     merchantId: provider.config.merchantId
 *                   }
 *                 });
 *                 break;
 *             }
 *           });
 *         };
 *         ```
 *
 *         **Step 3: Handle Provider Selection**
 *         ```javascript
 *         const handleProviderSelection = (selectedProviderId, providers) => {
 *           const provider = providers.find(p => p.id === selectedProviderId);
 *
 *           if (!provider) {
 *             console.error('Provider not found');
 *             return;
 *           }
 *
 *           // Update UI based on provider type
 *           if (provider.type === 'redirect') {
 *             // Show redirect-based payment form
 *             showRedirectPaymentForm(provider);
 *           } else if (provider.type === 'wallet') {
 *             // Show wallet payment button
 *             showWalletPaymentButton(provider);
 *           }
 *         };
 *         ```
 *
 *     ReactPaymentProvidersExample:
 *       summary: React component for payment provider selection
 *       description: |
 *         ```typescript
 *         import { useState, useEffect } from 'react';
 *
 *         interface PaymentProvider {
 *           id: string;
 *           name: string;
 *           description: string;
 *           icon: string;
 *           type: string;
 *           config: Record<string, any>;
 *         }
 *
 *         interface PaymentProvidersData {
 *           providers: PaymentProvider[];
 *           defaultCurrency: string;
 *         }
 *
 *         export function PaymentProviderSelector() {
 *           const [providersData, setProvidersData] = useState<PaymentProvidersData | null>(null);
 *           const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState<string | null>(null);
 *
 *           useEffect(() => {
 *             const fetchProviders = async () => {
 *               try {
 *                 setLoading(true);
 *                 const response = await fetch('/api/payment-providers');
 *                 const result = await response.json();
 *
 *                 if (!result.success) {
 *                   throw new Error(result.message);
 *                 }
 *
 *                 setProvidersData(result.data);
 *
 *                 // Auto-select first provider if available
 *                 if (result.data.providers.length > 0) {
 *                   setSelectedProvider(result.data.providers[0].id);
 *                 }
 *               } catch (err) {
 *                 setError(err instanceof Error ? err.message : 'Failed to fetch providers');
 *               } finally {
 *                 setLoading(false);
 *               }
 *             };
 *
 *             fetchProviders();
 *           }, []);
 *
 *           const getProviderIcon = (iconName: string) => {
 *             const icons = {
 *               'credit-card': '💳',
 *               'paypal': '🅿️',
 *               'google-pay': '🔵'
 *             };
 *             return icons[iconName] || '💳';
 *           };
 *
 *           if (loading) return <div>Loading payment providers...</div>;
 *           if (error) return <div>Error: {error}</div>;
 *           if (!providersData || providersData.providers.length === 0) {
 *             return <div>No payment providers available</div>;
 *           }
 *
 *           return (
 *             <div className="payment-providers">
 *               <h3>Choose Payment Method</h3>
 *               <p>Currency: {providersData.defaultCurrency}</p>
 *
 *               <div className="provider-list">
 *                 {providersData.providers.map(provider => (
 *                   <div
 *                     key={provider.id}
 *                     className={`provider-option ${selectedProvider === provider.id ? 'selected' : ''}`}
 *                     onClick={() => setSelectedProvider(provider.id)}
 *                   >
 *                     <div className="provider-icon">
 *                       {getProviderIcon(provider.icon)}
 *                     </div>
 *                     <div className="provider-info">
 *                       <h4>{provider.name}</h4>
 *                       <p>{provider.description}</p>
 *                       <span className="provider-type">{provider.type}</span>
 *                     </div>
 *                     <input
 *                       type="radio"
 *                       name="payment-provider"
 *                       value={provider.id}
 *                       checked={selectedProvider === provider.id}
 *                       onChange={() => setSelectedProvider(provider.id)}
 *                     />
 *                   </div>
 *                 ))}
 *               </div>
 *
 *               {selectedProvider && (
 *                 <div className="selected-provider-config">
 *                   <h4>Selected: {providersData.providers.find(p => p.id === selectedProvider)?.name}</h4>
 *                   <pre>
 *                     {JSON.stringify(
 *                       providersData.providers.find(p => p.id === selectedProvider)?.config,
 *                       null,
 *                       2
 *                     )}
 *                   </pre>
 *                 </div>
 *               )}
 *             </div>
 *           );
 *         }
 *         ```
 *
 *     PaymentProviderHookExample:
 *       summary: Custom React hook for payment providers
 *       description: |
 *         ```typescript
 *         import { useState, useEffect, useCallback } from 'react';
 *
 *         interface UsePaymentProvidersReturn {
 *           providers: PaymentProvider[];
 *           defaultCurrency: string;
 *           loading: boolean;
 *           error: string | null;
 *           refetch: () => Promise<void>;
 *           getProviderById: (id: string) => PaymentProvider | undefined;
 *           getEnabledProviders: () => PaymentProvider[];
 *         }
 *
 *         export function usePaymentProviders(): UsePaymentProvidersReturn {
 *           const [providersData, setProvidersData] = useState<PaymentProvidersData | null>(null);
 *           const [loading, setLoading] = useState(true);
 *           const [error, setError] = useState<string | null>(null);
 *
 *           const fetchProviders = useCallback(async () => {
 *             try {
 *               setLoading(true);
 *               setError(null);
 *
 *               const response = await fetch('/api/payment-providers');
 *               const result = await response.json();
 *
 *               if (!response.ok) {
 *                 throw new Error(result.message || 'Failed to fetch payment providers');
 *               }
 *
 *               if (!result.success) {
 *                 throw new Error(result.message);
 *               }
 *
 *               setProvidersData(result.data);
 *             } catch (err) {
 *               setError(err instanceof Error ? err.message : 'Unknown error');
 *             } finally {
 *               setLoading(false);
 *             }
 *           }, []);
 *
 *           useEffect(() => {
 *             fetchProviders();
 *           }, [fetchProviders]);
 *
 *           const getProviderById = useCallback((id: string) => {
 *             return providersData?.providers.find(provider => provider.id === id);
 *           }, [providersData]);
 *
 *           const getEnabledProviders = useCallback(() => {
 *             return providersData?.providers || [];
 *           }, [providersData]);
 *
 *           return {
 *             providers: providersData?.providers || [],
 *             defaultCurrency: providersData?.defaultCurrency || 'USD',
 *             loading,
 *             error,
 *             refetch: fetchProviders,
 *             getProviderById,
 *             getEnabledProviders
 *           };
 *         }
 *         ```
 *
 * tags:
 *   - name: Payment Providers
 *     description: Operations related to payment provider configuration and availability
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();

    // Get payment settings
    const settings = await PaymentSettings.findOne().select("providers");

    if (!settings || !settings.providers) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment settings and providers not found",
        },
        { status: 404 }
      );
    }

    // Filter only enabled providers
    const enabledProviders = [];

    if (settings?.providers?.stripe.enabled) {
      enabledProviders.push({
        id: "stripe",
        name: "Credit Card",
        description: "Secure payment via Stripe",
        icon: "credit-card",
        type: "redirect",
        config: {
          publicKey: settings.providers.stripe.publicKey,
          // Don't expose secret keys
        },
      });
    }

    if (settings.providers?.paypal.enabled) {
      enabledProviders.push({
        id: "paypal",
        name: "PayPal",
        description: "Secure payment with your PayPal account",
        icon: "paypal",
        type: "redirect",
        config: {
          clientId: settings.providers.paypal.clientId,
          // Don't expose secret keys
        },
      });
    }

    if (settings.providers?.googlePay.enabled) {
      enabledProviders.push({
        id: "googlepay",
        name: "Google Pay",
        description: "Quick payment with Google Pay",
        icon: "google-pay",
        type: "wallet",
        config: {
          merchantId: settings.providers.googlePay.merchantId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        providers: enabledProviders,
        defaultCurrency: settings.currencies?.defaultCurrency || "USD",
      },
    });
  } catch (error) {
    console.error("Error fetching payment providers:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment providers",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
