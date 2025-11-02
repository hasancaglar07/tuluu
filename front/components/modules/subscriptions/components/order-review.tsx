"use client";

import { m } from "framer-motion";
import { CreditCard } from "lucide-react";
import type { SubscriptionPlan, CardDetails } from "@/types";
import { FormattedMessage } from "react-intl";

// Order review component that shows final order details before payment
// Includes order summary, payment method, and terms acceptance
interface OrderReviewProps {
  plan: SubscriptionPlan;
  selectedProvider: string | null;
  cardDetails: CardDetails;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
}

export function OrderReview({
  plan,
  selectedProvider,
  cardDetails,
  termsAccepted,
  onTermsChange,
}: OrderReviewProps) {
  // Calculate final price (same logic as order summary)
  const finalPrice =
    plan.isOnPromotion && plan.promotionalPrice
      ? plan.promotionalPrice
      : plan.price;

  // Helper function to convert billing cycle to English text
  const getBillingCycleText = (cycle: string) => {
    switch (cycle) {
      case "monthly":
        return "per month";
      case "quarterly":
        return "per quarter";
      case "yearly":
        return "per year";
      case "lifetime":
        return "lifetime access";
      default:
        return `per ${cycle}`;
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h2 className="font-bold text-xl mb-4">
        <FormattedMessage
          id="orderReview.title"
          defaultMessage="Review your order"
        />
      </h2>

      <div className="space-y-4">
        {/* Order details section */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <h6 className="font-bold mb-2">
            <FormattedMessage
              id="orderReview.orderDetails"
              defaultMessage="Order details"
            />
          </h6>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">
              <FormattedMessage
                id="orderReview.product"
                defaultMessage="Product:"
              />
            </span>
            <span className="font-medium">{plan.name}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">
              <FormattedMessage
                id="orderReview.price"
                defaultMessage="Price:"
              />
            </span>
            <span className="font-medium">${finalPrice.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">
              <FormattedMessage
                id="orderReview.period"
                defaultMessage="Billing period:"
              />
            </span>
            <span className="font-medium">
              {getBillingCycleText(plan.billingCycle)}
            </span>
          </div>
          {/* Show trial period if available */}
          {plan.trialPeriodDays && plan?.trialPeriodDays > 0 ? (
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">
                <FormattedMessage
                  id="orderReview.freeTrial"
                  defaultMessage="Free trial:"
                />
              </span>
              <span className="font-medium">{plan.trialPeriodDays} days</span>
            </div>
          ) : (
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">
                <FormattedMessage
                  id="orderReview.freeTrial"
                  defaultMessage="Free trial:"
                />
              </span>
              <span className="font-medium">{plan.trialPeriodDays} days</span>
            </div>
          )}

          {/* Payment method section */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h6 className="font-bold mb-2">
              <FormattedMessage
                id="orderReview.paymentMethod"
                defaultMessage="Payment method"
              />
            </h6>
            <div className="flex items-center gap-3">
              {/* Show different display based on payment provider */}
              {selectedProvider === "paypal" ? (
                <>
                  <div className="bg-[#0070ba] p-1 rounded">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.5 8.25H4.5C3.67157 8.25 3 8.92157 3 9.75V18.75C3 19.5784 3.67157 20.25 4.5 20.25H19.5C20.3284 20.25 21 19.5784 21 18.75V9.75C21 8.92157 20.3284 8.25 19.5 8.25Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M7.5 15.75C7.5 15.75 8.25 15 9.75 15C11.25 15 12.75 16.5 14.25 16.5C15.75 16.5 16.5 15.75 16.5 15.75"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16.5 8.25V6C16.5 4.34315 15.1569 3 13.5 3H4.5C3.67157 3 3 3.67157 3 4.5V6.75"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span>PayPal</span>
                </>
              ) : (
                // Show credit card info for Stripe
                <>
                  <div className="bg-[#635bff] p-1 rounded">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <span>
                    <FormattedMessage
                      id="orderReview.cardEnding"
                      defaultMessage="Credit card ending with {lastFour}"
                      values={{ lastFour: cardDetails.cardNumber.slice(-4) }}
                    />
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Terms and conditions acceptance */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms-checkbox"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label
            htmlFor="terms-checkbox"
            className="text-sm text-yellow-800 cursor-pointer"
          >
            <FormattedMessage
              id="orderReview.termsAcceptance"
              defaultMessage="By clicking Confirm and Pay, you agree to our {termsLink} and privacy policy."
              values={{
                termsLink: (
                  <a
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-900 font-medium"
                  >
                    <FormattedMessage
                      id="orderReview.termsLink"
                      defaultMessage="terms and conditions"
                    />
                  </a>
                ),
              }}
            />
          </label>
        </div>
      </div>
    </m.div>
  );
}
