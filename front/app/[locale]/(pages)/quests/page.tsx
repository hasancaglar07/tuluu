import Quests from "@/components/modules/quests";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = 86400;

export default function page() {
  return <Quests />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: "TULU - Quests",
    description: "An enjoyable way to learn a new language",
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
