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
    title: "Lider Tablosu - TULU",
    description: "Sıralamadaki yerinizi görün ve diğer kullanıcılarla yarışın.",
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
