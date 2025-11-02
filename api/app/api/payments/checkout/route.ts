import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connect";
import PaymentSettings from "@/models/PaymentSettings";
import SubscriptionPlan from "@/models/SubscriptionPlan";
import { CheckoutSchema } from "@/lib/validations/payment";

/**
 * @swagger
 * /api/checkout:
 *   post:
 *     summary: Create payment checkout session
 *     description: |
 *       Creates a checkout session for a subscription plan with the specified payment provider.
 *       Validates the request, checks plan availability, and generates provider-specific checkout data.
 *       Supports Stripe, PayPal, and Google Pay payment providers.
 *     tags:
 *       - Payments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *           examples:
 *             stripeCheckout:
 *               summary: Stripe checkout request
 *               value:
 *                 planId: "507f1f77bcf86cd799439011"
 *                 provider: "stripe"
 *                 termsAccepted: true
 *             paypalCheckout:
 *               summary: PayPal checkout request
 *               value:
 *                 planId: "507f1f77bcf86cd799439012"
 *                 provider: "paypal"
 *                 termsAccepted: true
 *             googlepayCheckout:
 *               summary: Google Pay checkout request
 *               value:
 *                 planId: "507f1f77bcf86cd799439013"
 *                 provider: "googlepay"
 *                 termsAccepted: true
 *     responses:
 *       '200':
 *         description: Successfully created checkout session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckoutResponse'
 *             examples:
 *               stripeSuccess:
 *                 summary: Successful Stripe checkout session
 *                 value:
 *                   success: true
 *                   data:
 *                     checkout:
 *                       provider: "stripe"
 *                       sessionId: "stripe_1704110400000"
 *                       checkoutUrl: "https://checkout.stripe.com/pay/cs_test_123"
 *                       publicKey: "pk_test_123456789"
 *                     plan:
 *                       id: "507f1f77bcf86cd799439011"
 *                       name: "Premium Monthly"
 *                       price: 9.99
 *                       originalPrice: 14.99
 *                       currency: "USD"
 *                       billingCycle: "monthly"
 *               paypalSuccess:
 *                 summary: Successful PayPal checkout session
 *                 value:
 *                   success: true
 *                   data:
 *                     checkout:
 *                       provider: "paypal"
 *                       orderId: "paypal_1704110400000"
 *                       checkoutUrl: "https://www.paypal.com/checkoutnow?token=EC-123"
 *                       clientId: "AQkquBDf1zctJOWGKWUEtKXm6qVhueUEMvXO_-MCI4DQQ4-LWvkDLIN2fGsd"
 *                     plan:
 *                       id: "507f1f77bcf86cd799439012"
 *                       name: "Premium Yearly"
 *                       price: 99.99
 *                       originalPrice: 99.99
 *                       currency: "USD"
 *                       billingCycle: "yearly"
 *               googlepaySuccess:
 *                 summary: Successful Google Pay checkout session
 *                 value:
 *                   success: true
 *                   data:
 *                     checkout:
 *                       provider: "googlepay"
 *                       paymentRequestId: "googlepay_1704110400000"
 *                       merchantId: "BCR2DN4T2CHVXKYF"
 *                     plan:
 *                       id: "507f1f77bcf86cd799439013"
 *                       name: "Premium Lifetime"
 *                       price: 199.99
 *                       originalPrice: 299.99
 *                       currency: "USD"
 *                       billingCycle: "lifetime"
 *       '400':
 *         description: Bad request - Validation error, terms not accepted, or unsupported provider
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: Request validation failed
 *                 value:
 *                   message: "Validation error"
 *                   errors:
 *                     planId: ["Required"]
 *                     provider: ["Invalid enum value. Expected 'stripe' | 'paypal' | 'googlepay'"]
 *               termsNotAccepted:
 *                 summary: Terms and conditions not accepted
 *                 value:
 *                   success: false
 *                   message: "Term should be accepted"
 *               providerDisabled:
 *                 summary: Payment provider not enabled
 *                 value:
 *                   success: false
 *                   message: "stripe payment provider is not enabled"
 *               unsupportedProvider:
 *                 summary: Unsupported payment provider
 *                 value:
 *                   success: false
 *                   message: "Unsupported payment provider"
 *       '404':
 *         description: Not found - Subscription plan not found or not available
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               planNotFound:
 *                 value:
 *                   success: false
 *                   message: "Subscription plan not found or not available"
 *       '500':
 *         description: Internal server error - Payment settings not configured or checkout creation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DetailedErrorResponse'
 *             examples:
 *               settingsNotConfigured:
 *                 value:
 *                   success: false
 *                   message: "Payment settings not configured"
 *               checkoutCreationFailed:
 *                 value:
 *                   success: false
 *                   message: "Failed to create checkout session"
 *                   error: "Database connection failed"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CheckoutRequest:
 *       type: object
 *       required:
 *         - planId
 *         - provider
 *         - termsAccepted
 *       properties:
 *         planId:
 *           type: string
 *           format: objectId
 *           description: The unique identifier of the subscription plan
 *           example: "507f1f77bcf86cd799439011"
 *         provider:
 *           type: string
 *           enum: [stripe, paypal, googlepay]
 *           description: The payment provider to use for checkout
 *           example: "stripe"
 *         termsAccepted:
 *           type: boolean
 *           description: Whether the user has accepted terms and conditions
 *           example: true
 *
 *     StripeCheckoutData:
 *       type: object
 *       properties:
 *         provider:
 *           type: string
 *           enum: [stripe]
 *           example: "stripe"
 *         sessionId:
 *           type: string
 *           description: Stripe checkout session ID
 *           example: "stripe_1704110400000"
 *         checkoutUrl:
 *           type: string
 *           format: uri
 *           description: URL to redirect user for Stripe checkout
 *           example: "https://checkout.stripe.com/pay/cs_test_123"
 *         publicKey:
 *           type: string
 *           description: Stripe publishable key for client-side integration
 *           example: "pk_test_123456789"
 *
 *     PayPalCheckoutData:
 *       type: object
 *       properties:
 *         provider:
 *           type: string
 *           enum: [paypal]
 *           example: "paypal"
 *         orderId:
 *           type: string
 *           description: PayPal order ID
 *           example: "paypal_1704110400000"
 *         checkoutUrl:
 *           type: string
 *           format: uri
 *           description: URL to redirect user for PayPal checkout
 *           example: "https://www.paypal.com/checkoutnow?token=EC-123"
 *         clientId:
 *           type: string
 *           description: PayPal client ID for client-side integration
 *           example: "AQkquBDf1zctJOWGKWUEtKXm6qVhueUEMvXO_-MCI4DQQ4-LWvkDLIN2fGsd"
 *
 *     GooglePayCheckoutData:
 *       type: object
 *       properties:
 *         provider:
 *           type: string
 *           enum: [googlepay]
 *           example: "googlepay"
 *         paymentRequestId:
 *           type: string
 *           description: Google Pay payment request ID
 *           example: "googlepay_1704110400000"
 *         merchantId:
 *           type: string
 *           description: Google Pay merchant ID
 *           example: "BCR2DN4T2CHVXKYF"
 *
 *     PlanData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Subscription plan ID
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Plan name
 *           example: "Premium Monthly"
 *         price:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Final price (after promotions)
 *           example: 9.99
 *         originalPrice:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Original price before promotions
 *           example: 14.99
 *         currency:
 *           type: string
 *           description: Currency code
 *           example: "USD"
 *         billingCycle:
 *           type: string
 *           enum: [monthly, yearly, lifetime]
 *           description: Billing cycle for the subscription
 *           example: "monthly"
 *
 *     CheckoutResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indicates if the checkout session was created successfully
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             checkout:
 *               oneOf:
 *                 - $ref: '#/components/schemas/StripeCheckoutData'
 *                 - $ref: '#/components/schemas/PayPalCheckoutData'
 *                 - $ref: '#/components/schemas/GooglePayCheckoutData'
 *               description: Provider-specific checkout data
 *             plan:
 *               $ref: '#/components/schemas/PlanData'
 *               description: Subscription plan details
 *
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: General validation error message
 *           example: "Validation error"
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *           description: Field-specific validation errors
 *           example:
 *             planId: ["Required"]
 *             provider: ["Invalid enum value"]
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
 *           example: "Subscription plan not found or not available"
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
 *           example: "Failed to create checkout session"
 *         error:
 *           type: string
 *           description: Detailed error information
 *           example: "Database connection failed"
 *
 *   examples:
 *     CheckoutUsageExample:
 *       summary: How to use the Checkout API
 *       description: |
 *         **Step 1: Create Checkout Session**
 *         ```javascript
 *         const checkoutData = {
 *           planId: '507f1f77bcf86cd799439011',
 *           provider: 'stripe',
 *           termsAccepted: true
 *         };
 *
 *         const response = await fetch('/api/checkout', {
 *           method: 'POST',
 *           headers: {
 *             'Content-Type': 'application/json'
 *           },
 *           body: JSON.stringify(checkoutData)
 *         });
 *
 *         const result = await response.json();
 *
 *         if (result.success) {
 *           // Redirect to checkout URL or handle client-side payment
 *           window.location.href = result.data.checkout.checkoutUrl;
 *         } else {
 *           console.error('Checkout failed:', result.message);
 *         }
 *         ```
 *
 *         **Step 2: Handle Different Payment Providers**
 *         ```javascript
 *         const handleCheckout = async (planId, provider) => {
 *           try {
 *             const response = await fetch('/api/checkout', {
 *               method: 'POST',
 *               headers: { 'Content-Type': 'application/json' },
 *               body: JSON.stringify({
 *                 planId,
 *                 provider,
 *                 termsAccepted: true
 *               })
 *             });
 *
 *             const result = await response.json();
 *
 *             if (!result.success) {
 *               throw new Error(result.message);
 *             }
 *
 *             const { checkout, plan } = result.data;
 *
 *             switch (checkout.provider) {
 *               case 'stripe':
 *                 // Redirect to Stripe Checkout
 *                 window.location.href = checkout.checkoutUrl;
 *                 break;
 *
 *               case 'paypal':
 *                 // Redirect to PayPal
 *                 window.location.href = checkout.checkoutUrl;
 *                 break;
 *
 *               case 'googlepay':
 *                 // Initialize Google Pay
 *                 initializeGooglePay(checkout.merchantId, plan);
 *                 break;
 *             }
 *           } catch (error) {
 *             console.error('Checkout error:', error.message);
 *           }
 *         };
 *         ```
 *
 *     ReactCheckoutExample:
 *       summary: React checkout component
 *       description: |
 *         ```typescript
 *         import { useState } from 'react';
 *
 *         interface CheckoutProps {
 *           planId: string;
 *           planName: string;
 *           price: number;
 *         }
 *
 *         export function CheckoutComponent({ planId, planName, price }: CheckoutProps) {
 *           const [selectedProvider, setSelectedProvider] = useState<'stripe' | 'paypal' | 'googlepay'>('stripe');
 *           const [termsAccepted, setTermsAccepted] = useState(false);
 *           const [loading, setLoading] = useState(false);
 *           const [error, setError] = useState<string | null>(null);
 *
 *           const handleCheckout = async () => {
 *             if (!termsAccepted) {
 *               setError('Please accept the terms and conditions');
 *               return;
 *             }
 *
 *             setLoading(true);
 *             setError(null);
 *
 *             try {
 *               const response = await fetch('/api/checkout', {
 *                 method: 'POST',
 *                 headers: { 'Content-Type': 'application/json' },
 *                 body: JSON.stringify({
 *                   planId,
 *                   provider: selectedProvider,
 *                   termsAccepted
 *                 })
 *               });
 *
 *               const result = await response.json();
 *
 *               if (!result.success) {
 *                 throw new Error(result.message);
 *               }
 *
 *               // Redirect to checkout
 *               if (result.data.checkout.checkoutUrl) {
 *                 window.location.href = result.data.checkout.checkoutUrl;
 *               }
 *             } catch (err) {
 *               setError(err instanceof Error ? err.message : 'Checkout failed');
 *             } finally {
 *               setLoading(false);
 *             }
 *           };
 *
 *           return (
 *             <div className="checkout-form">
 *               <h2>Subscribe to {planName}</h2>
 *               <p className="price">${price}/month</p>
 *
 *               <div className="payment-providers">
 *                 <label>
 *                   <input
 *                     type="radio"
 *                     value="stripe"
 *                     checked={selectedProvider === 'stripe'}
 *                     onChange={(e) => setSelectedProvider(e.target.value as any)}
 *                   />
 *                   Credit Card (Stripe)
 *                 </label>
 *                 <label>
 *                   <input
 *                     type="radio"
 *                     value="paypal"
 *                     checked={selectedProvider === 'paypal'}
 *                     onChange={(e) => setSelectedProvider(e.target.value as any)}
 *                   />
 *                   PayPal
 *                 </label>
 *                 <label>
 *                   <input
 *                     type="radio"
 *                     value="googlepay"
 *                     checked={selectedProvider === 'googlepay'}
 *                     onChange={(e) => setSelectedProvider(e.target.value as any)}
 *                   />
 *                   Google Pay
 *                 </label>
 *               </div>
 *
 *               <label className="terms-checkbox">
 *                 <input
 *                   type="checkbox"
 *                   checked={termsAccepted}
 *                   onChange={(e) => setTermsAccepted(e.target.checked)}
 *                 />
 *                 I accept the terms and conditions
 *               </label>
 *
 *               {error && <div className="error">{error}</div>}
 *
 *               <button
 *                 onClick={handleCheckout}
 *                 disabled={loading || !termsAccepted}
 *                 className="checkout-button"
 *               >
 *                 {loading ? 'Processing...' : `Pay with ${selectedProvider}`}
 *               </button>
 *             </div>
 *           );
 *         }
 *         ```
 *
 * tags:
 *   - name: Payments
 *     description: Operations related to payment processing and subscription checkout
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = CheckoutSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Validation error",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { planId, provider, termsAccepted } = validation.data;

    if (!termsAccepted) {
      return NextResponse.json(
        {
          success: false,
          message: "Term should be accepted",
        },
        { status: 404 }
      );
    }
    await connectDB();

    // Get the subscription plan
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan || !plan.isVisible) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription plan not found or not available",
        },
        { status: 404 }
      );
    }

    // Get payment settings
    const settings = await PaymentSettings.findOne();
    if (!settings) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment settings not configured",
        },
        { status: 500 }
      );
    }

    // Check if provider is enabled
    const providerConfig = settings.providers && settings.providers[provider];
    if (!providerConfig || !providerConfig.enabled) {
      return NextResponse.json(
        {
          success: false,
          message: `${provider} payment provider is not enabled`,
        },
        { status: 400 }
      );
    }

    // Calculate final price (with promotion if applicable)
    const finalPrice =
      plan.isOnPromotion && plan.promotionalPrice
        ? plan.promotionalPrice
        : plan.price;

    // Generate checkout session based on provider
    let checkoutData;

    switch (provider) {
      case "stripe":
        // In a real implementation, you would create a Stripe checkout session here
        checkoutData = {
          provider: "stripe",
          sessionId: `stripe_${Date.now()}`,
          checkoutUrl: `${plan.checkoutLink}`,
          publicKey: providerConfig.publicKey,
        };
        break;

      case "paypal":
        // In a real implementation, you would create a PayPal order here
        checkoutData = {
          provider: "paypal",
          orderId: `paypal_${Date.now()}`,
          checkoutUrl: `${plan.checkoutLink}`,
          clientId: providerConfig.clientId,
        };
        break;

      case "googlepay":
        // In a real implementation, you would set up Google Pay here
        checkoutData = {
          provider: "googlepay",
          paymentRequestId: `googlepay_${Date.now()}`,
          merchantId: providerConfig.merchantId,
        };
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Unsupported payment provider",
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        checkout: checkoutData,
        plan: {
          id: plan._id.toString(),
          name: plan.name,
          price: finalPrice,
          originalPrice: plan.price,
          currency: "USD", // From settings
          billingCycle: plan.billingCycle,
        },
      },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create checkout session",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
