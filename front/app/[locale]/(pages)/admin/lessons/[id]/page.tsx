import { getLesson } from "@/actions/lesson";
import LessonDetail from "@/components/modules/admin/lessons/lesson";
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

  return <LessonDetail lessonData={lesson} />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Page - Title here`,
    description: `Page - Description here`,
    icons: {
      icon: `path to asset file`,
    },
  };
}
