"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { Subscription, SubscriptionPlan } from "@/types";
import { apiClient } from "@/lib/api-client";
import BillingCycleTabs from "./BillingCycleTabs";
import PlanGrid from "./PlanGrid";
import ErrorState from "./ErrorState";

// 🧩 Main subscriptions page
export default function SubscriptionsPage({
  subscription,
}: {
  subscription: Subscription;
}) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState("monthly");
  const { getToken } = useAuth();

  // 🔁 Fetch plans from backend API
  const fetchPlans = useCallback(
    async (cycle: string) => {
      try {
        setLoading(true);
        const token = await getToken();

        const response = await apiClient.get(`/api/subscriptions/plans`, {
          params: { billingCycle: cycle },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        if (data.success) {
          setPlans(data.data);
          setError(null);
        } else {
          setError(data.message || "Failed to fetch plans");
        }
      } catch (err) {
        setError("Failed to fetch subscription plans");
        console.error("Error fetching plans:", err);
      } finally {
        setLoading(false);
      }
    },
    [getToken]
  );

  // Fetch plans when billing cycle changes
  useEffect(() => {
    fetchPlans(billingCycle);
  }, [billingCycle, fetchPlans]);

  if (error) return <ErrorState onRetry={() => fetchPlans(billingCycle)} />;

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <BillingCycleTabs value={billingCycle} onChange={setBillingCycle} />
        <PlanGrid loading={loading} plans={plans} subscription={subscription} />
      </div>
    </div>
  );
}
