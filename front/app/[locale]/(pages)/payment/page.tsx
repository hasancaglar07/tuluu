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
    title: "Ödeme - TULU",
    description: "Ödeme işlemlerinizi güvenli şekilde tamamlayın.",
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
