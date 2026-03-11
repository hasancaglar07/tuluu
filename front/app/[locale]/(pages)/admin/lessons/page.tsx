import LessonsManagementPage from "@/components/modules/admin/lessons/lessons-management-page";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = false;

export default function Page() {
  return <LessonsManagementPage />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: "Ders Yönetimi - TULU",
    description: "Program, bölüm, ünite ve ders içeriklerini tek panelden yönetin.",
    icons: {
      icon: "/favicon.ico",
    },
  };
}
