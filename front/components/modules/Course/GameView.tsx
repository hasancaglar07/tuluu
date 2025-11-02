"use client";

import { m } from "framer-motion";
import Image from "next/image";
import type { Chapter, Unit, Lesson, LessonContent } from "@/types";
import { Card } from "./Card";
import { NextChapter } from "./NextChapter";

interface GameViewProps {
  chapters: Chapter[];
  hasPremium: boolean;
  lessonContents: LessonContent[];
  currentLessonId?: string;
  onAdvance: () => void;
}

/**
 * Game-style view component for the dashboard
 */
export const GameView = ({
  chapters,
  hasPremium,
  lessonContents,
  currentLessonId,
  onAdvance,
}: GameViewProps) => {
  return (
    <>
      {chapters.slice(0, 2).map((chapter: Chapter, key: number) => {
        return (
          <m.div
            key={`chapter-${chapter._id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full mb-8 relative"
          >
            {chapter.units.map((unit: Unit, keyUnit: number) => {
              if (key === 1) return null;
              return (
                <div
                  key={unit._id}
                  data-unit-key-card={`${chapter._id}-${unit._id}`}
                  data-unit-color-card={`${unit.color}`}
                  className="flex flex-col relative"
                >
                  {[...unit.lessons]
                    .sort((a: Lesson, b: Lesson) => a.order - b.order)
                    .map((lesson: Lesson, index: number) => {
                      const lessonUpdated = lessonContents.find(
                        (l) => lesson._id === l._id
                      );

                      if (!lessonUpdated || !lesson) return null;

                      const isPremiumLocked =
                        (lessonUpdated.isPremium ||
                          unit.isPremium ||
                          chapter.isPremium) &&
                        !hasPremium;

                      return (
                        <Card
                          unit={unit._id}
                          key={lesson._id}
                          id={lesson._id}
                          index={index}
                          current={lesson._id === currentLessonId}
                          locked={isPremiumLocked}
                          premium={isPremiumLocked}
                          totalCount={unit.lessons.length - 1}
                          lesson={lesson}
                          isLessonCompleted={
                            lesson.isCompleted ? lesson.isCompleted : false
                          }
                        />
                      );
                    })}
                  <div className="absolute top-1/4 right-1">
                    <m.div
                      style={{
                        width: 150,
                        height: 150,
                        display: "inline-block",
                      }}
                      animate={{
                        y: [0, -10, 0], // move up 20px then back down
                      }}
                      transition={{
                        duration: 3, // slow bounce duration
                        ease: "easeInOut",
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                      }}
                    >
                      <Image
                        className="hidden md:block"
                        src={unit.imageUrl || "/placeholder.svg"}
                        width={350}
                        height={350}
                        alt={unit.title}
                        style={{
                          objectFit: "cover",
                          borderRadius: 12,
                          height: "200px",
                        }}
                      />
                    </m.div>
                  </div>
                  {chapter.units[keyUnit + 1] && (
                    <div className="flex items-center justify-center w-full mt-30 my-10">
                      <div className="flex-1 h-px bg-muted" />
                      <span className="text-3xl font-medium">
                        {chapter.units[keyUnit + 1].title}
                      </span>
                      <div className="flex-1 h-px bg-muted" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* next chapter */}
            {key === 1 && (
              <NextChapter
                chapterNumber={chapter._id}
                title={chapter.title}
                description={chapter.description}
                isLocked={true}
                onAdvance={onAdvance}
              />
            )}
          </m.div>
        );
      })}
    </>
  );
};
