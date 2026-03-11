import { getSubscription } from "@/actions/subscription";
import SubscriptionsPage from "@/components/modules/subscriptions";

export default async function Page() {
  const subscription = await getSubscription();

  return <SubscriptionsPage subscription={subscription} />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Abonelikler - TULU`,
    description: `TULU Premium planlarını inceleyin ve size uygun paketi seçin.`,
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
