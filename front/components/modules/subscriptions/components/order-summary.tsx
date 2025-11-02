import { Crown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { SubscriptionPlan } from "@/types";
import { FormattedMessage } from "react-intl";

// Order summary component that displays plan details and pricing
// Shows promotional pricing if available and calculates final price
interface OrderSummaryProps {
  plan: SubscriptionPlan;
}

export function OrderSummary({ plan }: OrderSummaryProps) {
  // Calculate the final price (promotional price if available, otherwise regular price)
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
        return "lifetime";
      default:
        return `per ${cycle}`;
    }
  };

  return (
    <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
      <h2 className="font-bold text-xl mb-4">
        <FormattedMessage
          id="orderSummary.title"
          defaultMessage="Order Summary"
        />
      </h2>

      <div className="flex items-center gap-4">
        {/* Plan icon */}
        <div className="p-3 bg-white rounded-lg">
          <Crown className="h-8 w-8 text-yellow-500" />
        </div>

        {/* Plan details */}
        <div className="flex-1">
          <h5>{plan.name}</h5>
          <p className="text-gray-600 text-sm">{plan.description}</p>
          {/* Show trial period if available */}
          {plan.trialPeriodDays && plan.trialPeriodDays > 0 ? (
            <p className="text-green-600 text-sm font-medium">
              <FormattedMessage
                id="orderSummary.freeTrial"
                defaultMessage="{days}-day free trial included"
                values={{ days: plan.trialPeriodDays }}
              />
            </p>
          ) : (
            <p className="text-gray-600 text-sm">
              <FormattedMessage
                id="orderSummary.noFreeTrial"
                defaultMessage="No free trial available"
              />
            </p>
          )}
        </div>

        {/* Pricing section */}
        <div className="text-right">
          {/* Show promotional pricing if available */}
          {plan.isOnPromotion && plan.promotionalPrice ? (
            <div>
              <div className="font-bold text-lg">${finalPrice.toFixed(2)}</div>
              <div className="text-sm text-gray-500 line-through">
                ${plan.price.toFixed(2)}
              </div>
            </div>
          ) : (
            <div className="font-bold text-lg">${finalPrice.toFixed(2)}</div>
          )}
          <div className="text-xs text-gray-500">
            {getBillingCycleText(plan.billingCycle)}
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Total price */}
      <div className="flex justify-between font-bold">
        <span>
          <FormattedMessage id="orderSummary.total" defaultMessage="Total" />
        </span>
        <span>${finalPrice.toFixed(2)} USD</span>
      </div>
    </div>
  );
}
