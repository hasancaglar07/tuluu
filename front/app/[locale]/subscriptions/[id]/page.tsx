import { getSubscription } from "@/actions/subscription";
import SubscriptionDetail from "@/components/modules/subscriptions/SubscriptionDetail";
import { redirect } from "next/navigation";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = false;

export default async function page() {
  const subscription = await getSubscription();
  if (subscription.subscription == "premium") {
    redirect("/dashboard");
  }
  return <SubscriptionDetail />;
}
// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: "Abonelik Detayı - TULU",
    description: "TULU Premium abonelik detaylarını görüntüleyin.",
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
