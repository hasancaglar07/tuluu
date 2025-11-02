import { Subscription, SubscriptionPlan } from "@/types";
import PricingCard from "./pricing-card";
import { Skeleton } from "@/components/ui/skeleton";

interface PlanGridProps {
  loading: boolean;
  plans: SubscriptionPlan[];
  subscription: Subscription;
}

// 🧱 Renders grid of subscription plans or loading skeletons
export default function PlanGrid({
  loading,
  plans,

  subscription,
}: PlanGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-8 shadow-lg">
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-6" />
            <Skeleton className="h-12 w-full mb-6" />
            <div className="space-y-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="w-full sm:w-1/2 md:w-1/3 flex justify-center"
        >
          <PricingCard plan={plan} subscription={subscription} />
        </div>
      ))}
    </div>
  );
}
