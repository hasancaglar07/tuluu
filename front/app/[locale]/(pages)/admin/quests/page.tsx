import Quests from "@/components/modules/admin/quests";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = 86400;

export default function page() {
  return <Quests />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Quests - TULU`,
    description: `Page - Description here`,
    icons: {
      icon: `path to asset file`,
    },
  };
}
