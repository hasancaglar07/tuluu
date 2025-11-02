import Payment from "@/components/modules/payment";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = false;

export default function page() {
  return <Payment />;
}
// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: "TULU - Payment",
    description: "An enjoyable way to learn a new language",
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
