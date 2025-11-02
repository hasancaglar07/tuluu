import { getSubscription } from "@/actions/subscription";
import UserDashboard from "@/components/modules/user/dashboard";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = false;

export default async function page() {
  const subscription = await getSubscription();
  return <UserDashboard subscription={subscription} />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: "Dashboard - TULU",
    description: "An enjoyable way to learn a new language",
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
