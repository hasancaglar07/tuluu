import { getLesson } from "@/actions/lesson";
import LessonManager from "@/components/modules/admin/lessons/lesson/manager";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = false;

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const lesson = await getLesson(id);

  return <LessonManager lessonData={lesson} />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: "Ders Egzersiz Yönetimi - TULU",
    description: "Ders içindeki egzersizleri düzenleyin, sıralayın ve önizleyin.",
    icons: {
      icon: "/favicon.ico",
    },
  };
}
