import { getLessonUnitTest } from "@/actions/unit";
import LessonRefactored from "@/components/modules/lesson-refactored";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = false;

export default async function page({
  params,
}: {
  params: Promise<{ id: string; lastUnit: string }>;
}) {
  const { id, lastUnit } = await params; // Unwrapping the promise
  //server action check if last unit is completed
  const lesson = await getLessonUnitTest(lastUnit, id);
  console.log("lesson", lesson);

  return (
    <LessonRefactored
      id={lesson.lessonTest._id}
      unit={lesson.unit}
      lastUnit={lesson.lastUnit}
      nextLesson={lesson.nextLesson}
    />
  );
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
