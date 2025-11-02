import Lesson from "@/components/modules/lesson";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = 86400;

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <Lesson id={id} />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: "Lesson - TULU",
    description: "An enjoyable way to learn a new language",
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
