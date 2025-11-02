import Leaderboard from "@/components/modules/leaderboard";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = 86400;

export default function page() {
  return <Leaderboard />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: "Leaderboard - TULU",
    description: "An enjoyable way to learn a new language",
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
