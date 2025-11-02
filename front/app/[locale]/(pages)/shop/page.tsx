import { getSubscription } from "@/actions/subscription";
import Shop from "@/components/modules/shop";
import React from "react";

export const dynamic = "force-dynamic"; // force Netlify not to cache this serverless function.

export default async function page() {
  const subscription = await getSubscription();
  return (
    <Shop subscription={subscription} /> // Assuming you have a Shop component in the same directory
  );
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Shop - TULU`,
    description: `Page - Description here`,
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
