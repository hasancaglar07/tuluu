import Welcome from "@/components/modules/hero/welcome";
import { Metadata } from "next";
import React from "react";

// Next.js ISR caching strategy
export const revalidate = 86400; // 60 * 60 * 24 = 1 day in seconds

export default function page() {
  return <Welcome />;
}

// Nextjs dynamic metadata
export const metadata: Metadata = {
  title: "TULU - Hoş Geldin",
  description: "TULU ile dil öğrenmeyi eğlenceli ve etkili hale getirin.",
  icons: {
    icon: "/images/logo_icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
