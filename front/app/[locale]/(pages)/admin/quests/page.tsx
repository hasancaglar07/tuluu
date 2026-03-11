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
    title: `Görev Yönetimi - TULU`,
    description: `Görevleri oluşturun, düzenleyin ve takip edin.`,
    icons: {
      icon: "/favicon.ico",
    },
  };
}
