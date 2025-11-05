"use client";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { m, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock } from "lucide-react";
import { FormattedMessage } from "react-intl";
import type { Chapter, Lesson, Unit } from "@/types";
import { UnitCard } from "./UnitCard";

interface ChapterListProps {
  chapters: Chapter[];
  hasPremium: boolean;
  toggleChapter: (chapterId: string) => void;
  toggleUnit: (chapterId: string, unitId: string) => void;
  registerUnitRef: (
    element: HTMLDivElement | null,
    chapterId: string,
    unitId: string
  ) => void;
  isLessonAccessible: (chapter: Chapter, unit: Unit, lesson: Lesson) => boolean;
  startLesson: (chapterId: string, unitId: string, lessonId: string) => void;
  handleUpgradeToPremium: () => void;
  completedLessons: Lesson[];
}

/**
 * Component to display a list of chapters with their units
 */
export const ChapterList = ({
  chapters,
  hasPremium,
  toggleChapter,
  toggleUnit,
  registerUnitRef,
  isLessonAccessible,
  startLesson,
  handleUpgradeToPremium,
  completedLessons,
}: ChapterListProps) => {
  return (
    <TooltipProvider>
      <>
        {chapters.map((chapter) => (
          <m.div
            key={`chapter-${chapter._id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full mb-8"
          >
            <m.div
              className="flex items-center gap-4 mb-4 cursor-pointer"
              onClick={() => toggleChapter(chapter._id)}
            >
              <h4>
                <FormattedMessage
                  id="dashboard.chapter.title"
                  defaultMessage="Chapter {order}: {title}"
                  values={{ order: chapter.order, title: chapter.title }}
                />
              </h4>
              {chapter.isPremium && !hasPremium && (
                <Tooltip>
                  <TooltipTrigger>
                    <m.div whileHover={{ rotate: [0, -10, 10, -10, 0] }}>
                      <Lock className="h-5 w-5 text-gray-900" />
                    </m.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      <FormattedMessage
                        id="dashboard.chapter.premiumLocked"
                        defaultMessage="Premium content - Subscribe to unlock"
                      />
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
              {chapter.isCompleted && (
                <m.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 10 }}
                >
                  <Badge className="bg-primary-500">
                    <FormattedMessage
                      id="dashboard.chapter.completed"
                      defaultMessage="COMPLETED"
                    />
                  </Badge>
                </m.div>
              )}
              <m.div
                animate={{ rotate: chapter.isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="ml-auto"
              >
                <ChevronDown className="h-5 w-5" />
              </m.div>
            </m.div>

            <AnimatePresence>
              {chapter.isExpanded && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {chapter.units.map((unit) => (
                    <UnitCard
                      key={unit._id}
                      unit={unit}
                      chapter={chapter}
                      isExpanded={unit.isExpanded ?? false}
                      isPremium={unit.isPremium}
                      hasPremium={hasPremium}
                      isCompleted={unit.isCompleted}
                      registerUnitRef={registerUnitRef}
                      toggleUnit={toggleUnit}
                      isLessonAccessible={isLessonAccessible}
                      startLesson={startLesson}
                      handleUpgradeToPremium={handleUpgradeToPremium}
                      completedLessons={completedLessons}
                    />
                  ))}
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        ))}
      </>
    </TooltipProvider>
  );
};
