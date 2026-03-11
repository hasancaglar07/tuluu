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
    title: "Görevler - TULU",
    description: "Günlük ve haftalık görevleri tamamlayarak ödül kazan.",
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
