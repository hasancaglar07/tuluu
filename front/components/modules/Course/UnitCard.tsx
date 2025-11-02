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
import { LessonItem } from "./LessonItem";

interface UnitCardProps {
  unit: Unit;
  chapter: Chapter;
  isExpanded: boolean;
  isPremium: boolean;
  hasPremium: boolean;
  isCompleted: boolean;
  registerUnitRef: (
    element: HTMLDivElement | null,
    chapterId: string,
    unitId: string
  ) => void;
  toggleUnit: (chapterId: string, unitId: string) => void;
  isLessonAccessible: (chapter: Chapter, unit: Unit, lesson: Lesson) => boolean;
  startLesson: (chapterId: string, unitId: string, lessonId: string) => void;
  handleUpgradeToPremium: () => void;
  completedLessons: Lesson[];
}

/**
 * Component to display a unit card with its lessons
 */
export const UnitCard = ({
  unit,
  chapter,
  isExpanded,
  isPremium,
  hasPremium,
  isCompleted,
  registerUnitRef,
  toggleUnit,
  isLessonAccessible,
  startLesson,
  handleUpgradeToPremium,
  completedLessons,
}: UnitCardProps) => {
  return (
    <TooltipProvider>
      <m.div
        key={`unit-${chapter._id}-${unit._id}`}
        ref={(el) => registerUnitRef(el, chapter._id, unit._id)}
        data-unit-key={`${chapter._id}-${unit._id}`}
        data-unit-color={`${unit.color}`}
        className="mb-6 p-4 md:p-6 border border-gray-200 rounded-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        whileHover={{
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <m.div
          className="flex items-center gap-2 mb-4 cursor-pointer"
          onClick={() => toggleUnit(chapter._id, unit._id)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <h5 className="capitalize">
            <FormattedMessage
              id="dashboard.unit.title"
              defaultMessage="Unit {order}: {title}"
              values={{ order: unit.order, title: unit.title }}
            />
          </h5>
          {isPremium && !hasPremium && (
            <Tooltip>
              <TooltipTrigger>
                <m.div whileHover={{ rotate: [0, -10, 10, -10, 0] }}>
                  <Lock className="h-5 w-5 text-gray-900" />
                </m.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  <FormattedMessage
                    id="dashboard.unit.premiumLocked"
                    defaultMessage="Premium content - Subscribe to unlock"
                  />
                </p>
              </TooltipContent>
            </Tooltip>
          )}
          {isCompleted && (
            <m.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 10,
              }}
            >
              <Badge className="bg-primary-500">
                <FormattedMessage
                  id="dashboard.unit.completed"
                  defaultMessage="COMPLETED"
                />
              </Badge>
            </m.div>
          )}
          <m.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-auto"
          >
            <ChevronDown className="h-5 w-5" />
          </m.div>
        </m.div>
        <p className="text-gray-500 mb-6">{unit.description}</p>

        <AnimatePresence>
          {isExpanded && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {unit.lessons.map((lesson) => {
                const isAccessible = isLessonAccessible(chapter, unit, lesson);
                const isPremiumLocked =
                  (lesson.isPremium || unit.isPremium || chapter.isPremium) &&
                  !hasPremium;
                const isProgressionLocked =
                  lesson.status === "locked" && !isAccessible;

                // Check if lesson is completed
                const isCompleted = completedLessons.some(
                  (completedLesson) => completedLesson._id === lesson._id
                );

                return (
                  <LessonItem
                    key={lesson._id}
                    lesson={lesson}
                    chapter={chapter}
                    unit={unit}
                    isPremiumLocked={isPremiumLocked}
                    isProgressionLocked={isProgressionLocked}
                    isCompleted={isCompleted}
                    startLesson={startLesson}
                    handleUpgradeToPremium={handleUpgradeToPremium}
                  />
                );
              })}
            </m.div>
          )}
        </AnimatePresence>
      </m.div>
    </TooltipProvider>
  );
};
