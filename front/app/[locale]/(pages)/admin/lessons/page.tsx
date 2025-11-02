import LessonsManagementPage from "@/components/modules/admin/lessons/lessons-management-page";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = false;

export default function page() {
  return <LessonsManagementPage />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Lessons - TULU`,
    description: `Page - Description here`,
    icons: {
      icon: `path to asset file`,
    },
  };
}
