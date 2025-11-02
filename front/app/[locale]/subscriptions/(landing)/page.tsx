import { getSubscription } from "@/actions/subscription";
import SubscriptionsPage from "@/components/modules/subscriptions";

export default async function Page() {
  const subscription = await getSubscription();

  return <SubscriptionsPage subscription={subscription} />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Subscriptions - TULU`,
    description: `Page - Description here`,
    icons: {
      icon: `path to asset file`,
    },
  };
}
