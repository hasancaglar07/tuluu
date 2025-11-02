"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { m } from "framer-motion";
import { Lock } from "lucide-react";
import { FormattedMessage, useIntl } from "react-intl";
import type { Chapter, Lesson, Unit } from "@/types";

interface LessonItemProps {
  lesson: Lesson;
  chapter: Chapter;
  unit: Unit;
  isPremiumLocked: boolean;
  isProgressionLocked: boolean;
  isCompleted: boolean;
  startLesson: (chapterId: string, unitId: string, lessonId: string) => void;
  handleUpgradeToPremium: () => void;
}

/**
 * Component to display an individual lesson with its status and actions
 */
export const LessonItem = ({
  lesson,
  chapter,
  unit,
  isPremiumLocked,
  isProgressionLocked,
  isCompleted,
  startLesson,
  handleUpgradeToPremium,
}: LessonItemProps) => {
  const intl = useIntl();

  return (
    <TooltipProvider>
      <m.div
        key={`lesson-${chapter._id}-${unit._id}-${lesson._id}`}
        className={`p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between ${
          lesson.status === "completed"
            ? "bg-primary-100 border-primary-500"
            : lesson.status === "available" && !isPremiumLocked
            ? "bg-white border-primary-100"
            : "bg-gray-100 border-gray-300"
        }`}
        whileHover={{
          scale:
            lesson.status === "completed" ||
            (lesson.status === "available" && !isPremiumLocked)
              ? 1.02
              : 1,
          boxShadow:
            lesson.status === "completed" ||
            (lesson.status === "available" && !isPremiumLocked)
              ? "0 4px 12px rgba(0,0,0,0.05)"
              : "none",
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="mb-3 sm:mb-0">
          <div className="flex items-center gap-2">
            <h6>
              <FormattedMessage
                id="dashboard.lesson.title"
                defaultMessage="Lesson {order}: {title}"
                values={{ order: lesson.order, title: lesson.title }}
              />
            </h6>
            {isPremiumLocked && (
              <Tooltip>
                <TooltipTrigger>
                  <m.div whileHover={{ rotate: [0, -10, 10, -10, 0] }}>
                    <Lock className="h-4 w-4 text-gray-900" />
                  </m.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    <FormattedMessage
                      id="dashboard.lesson.premiumLocked"
                      defaultMessage="Premium content - Subscribe to unlock"
                    />
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            {isProgressionLocked && !isPremiumLocked && (
              <Tooltip>
                <TooltipTrigger>
                  <m.div whileHover={{ rotate: [0, -10, 10, -10, 0] }}>
                    <Lock className="h-4 w-4 text-gray-500" />
                  </m.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    <FormattedMessage
                      id="dashboard.lesson.progressionLocked"
                      defaultMessage="Complete previous lessons to unlock"
                    />
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <p className="text-sm text-gray-500">{lesson.description}</p>
        </div>
        <m.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-2 sm:mt-0"
        >
          <Button
            onClick={() => {
              if (!isPremiumLocked) {
                startLesson(chapter._id, unit._id, lesson._id);
              } else if (isPremiumLocked) {
                handleUpgradeToPremium();
              }
            }}
            className={`${
              lesson.isCompleted
                ? "bg-primary-500 hover:bg-primary-800"
                : !lesson.isCompleted && !isPremiumLocked
                ? "bg-primary-100 hover:bg-primary-500 hover:text-white text-primary-500"
                : isPremiumLocked
                ? "bg-secondary-500 hover:bg-secondary-600 text-black"
                : "bg-gray-400 hover:bg-gray-900 hover:text-white cursor-not-allowed"
            }`}
            disabled={isProgressionLocked && !isPremiumLocked}
          >
            {lesson.isCompleted
              ? intl.formatMessage({
                  id: "dashboard.lesson.restart",
                  defaultMessage: "RESTART",
                })
              : !lesson.isCompleted && !isPremiumLocked
              ? intl.formatMessage({
                  id: "dashboard.lesson.start",
                  defaultMessage: "START",
                })
              : isPremiumLocked
              ? intl.formatMessage({
                  id: "dashboard.lesson.unlock",
                  defaultMessage: "UNLOCK",
                })
              : intl.formatMessage({
                  id: "dashboard.lesson.locked",
                  defaultMessage: "LOCKED",
                })}
          </Button>
        </m.div>
      </m.div>
    </TooltipProvider>
  );
};
