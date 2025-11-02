"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Check, Star, Crown, Zap, Sparkles, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  Subscription,
  SubscriptionMetadata,
  SubscriptionPlan,
} from "@/types";

const getIconForPlan = (planName: string, metadata: SubscriptionMetadata) => {
  if (metadata && metadata.icon) {
    switch (metadata.icon) {
      case "star":
        return Star;
      case "crown":
        return Crown;
      case "zap":
        return Zap;
      case "sparkles":
        return Sparkles;
      default:
        return Star;
    }
  }

  // Default icons based on plan name
  const name = planName.toLowerCase();
  if (name.includes("free") || name.includes("basic")) return Star;
  if (name.includes("pro") || name.includes("premium")) return Crown;
  if (name.includes("enterprise") || name.includes("business")) return Zap;
  return Sparkles;
};

const getPlanColor = (
  planName: string,
  metadata: SubscriptionMetadata,
  isPopular: boolean
) => {
  if (isPopular) return "primary";
  if (metadata && metadata.color) return metadata.color;

  const name = planName.toLowerCase();
  if (name.includes("free") || name.includes("basic")) return "gray";
  if (name.includes("pro") || name.includes("premium")) return "primary";
  if (name.includes("enterprise") || name.includes("business")) return "indigo";
  return "blue";
};

export default function PricingCard({
  plan,
  subscription,
}: {
  plan: SubscriptionPlan;
  subscription: Subscription;
}) {
  const IconComponent = getIconForPlan(plan.name, plan.metadata);
  const planColor = getPlanColor(plan.name, plan.metadata, plan.isPopular);
  const hasPremium = subscription.subscription === "premium";

  const colorClasses = {
    gray: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      icon: "bg-gray-100 text-gray-600",
      button: "bg-gray-400 hover:bg-gray-800",
      accent: "text-gray-600",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "bg-blue-100 text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700",
      accent: "text-blue-600",
    },
    primary: {
      bg: "bg-primary-50",
      border: "border-primary-200",
      icon: "bg-primary-100 text-primary-600",
      button: "bg-primary-600 hover:bg-primary-700",
      accent: "text-primary-600",
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "bg-purple-100 text-purple-600",
      button: "bg-purple-600 hover:bg-purple-700",
      accent: "text-purple-600",
    },
    indigo: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      icon: "bg-indigo-100 text-indigo-600",
      button: "bg-indigo-600 hover:bg-indigo-700",
      accent: "text-indigo-600",
    },
  };

  const colors =
    colorClasses[planColor as keyof typeof colorClasses] ||
    colorClasses.primary;

  const getBillingCycleText = (cycle: string) => {
    switch (cycle) {
      case "monthly":
        return "/month";
      case "quarterly":
        return "/quarter";
      case "yearly":
        return "/year";
      case "lifetime":
        return "one-time";
      default:
        return `/${cycle}`;
    }
  };

  return (
    <Card
      className={cn(
        "flex-1 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full md:w-[400px]",
        plan.isPopular
          ? "ring-2 ring-primary-500 shadow-lg scale-105"
          : "shadow-md hover:shadow-lg",
        colors.bg,
        colors.border
      )}
    >
      {/* Popular Badge */}
      {plan.isPopular && (
        <div className="">
          <Badge className="bg-gradient-to-r from-primary-600 to-purple-600 text-white px-4 py-1">
            <Star className="w-3 h-3 mr-1" />
            {plan.metadata.badge || "Most Popular"}
          </Badge>
        </div>
      )}

      {/* Promotion Badge */}
      {plan.isOnPromotion && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            <Gift className="w-3 h-3 mr-1" />
            Limited Offer
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        {/* Plan Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4",
            colors.icon
          )}
        >
          <IconComponent className="w-6 h-6" />
        </div>

        {/* Plan Name */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>

        {/* Plan Description */}
        {plan.shortDescription && (
          <p className="text-sm text-gray-600 mb-4">{plan.shortDescription}</p>
        )}

        {/* Pricing */}
        <div className="mb-4">
          {plan.isOnPromotion && plan.promotionalPrice ? (
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${plan.promotionalPrice.toFixed(2)}
                </span>
                <span className="text-lg text-gray-500 line-through">
                  ${plan.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {getBillingCycleText(plan.billingCycle)}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-3xl font-bold text-gray-900">
                {plan.price === 0 ? "Free" : `$${plan.price.toFixed(2)}`}
              </div>
              {plan.price > 0 ? (
                <p className="text-sm text-gray-600">
                  {getBillingCycleText(plan.billingCycle)}
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  {getBillingCycleText(plan.billingCycle)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Trial Period */}
        {plan.trialPeriodDays && plan.trialPeriodDays > 0 ? (
          <Badge variant="outline" className="mb-4">
            {plan.trialPeriodDays}-day free trial
          </Badge>
        ) : (
          <></>
        )}
      </CardHeader>
      <CardContent className="px-6">
        {/* Features List */}
        <div className="space-y-3">
          {plan.features.slice(0, 8).map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0",
                  "bg-gray-100"
                )}
              >
                <Check className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  {feature}
                </div>
              </div>
            </div>
          ))}

          {/* Additional Limits */}
          {(plan.maxUsers || plan.maxProjects || plan.maxStorage) && (
            <div className="pt-3 border-t border-gray-200">
              <div className="space-y-2">
                {plan.maxUsers && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Users</span>
                    <span className="font-medium">{plan.maxUsers}</span>
                  </div>
                )}
                {plan.maxProjects && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Projects</span>
                    <span className="font-medium">{plan.maxProjects}</span>
                  </div>
                )}
                {plan.maxStorage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Storage</span>
                    <span className="font-medium">{plan.maxStorage} GB</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6">
        <Button
          disabled={hasPremium}
          className={cn("w-full", colors.button)}
          size="lg"
          onClick={() => {
            if (plan.price === 0) {
              // Handle free plan signup
              window.location.href = "/dashboard";
            } else {
              // Navigate to payment page with plan ID
              window.location.href = `/subscriptions/${plan.id}`;
            }
          }}
        >
          {plan.price === 0 ? "Get Started Free" : "Choose Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
