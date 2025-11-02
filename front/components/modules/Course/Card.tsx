"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { IRootState } from "@/store";
import { Check, Crown, Lock, Star } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useSelector } from "react-redux";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Lesson } from "@/types";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { FormattedMessage } from "react-intl";
import { useRouter } from "next/navigation";

/**
 * Props for the Card component
 */
type Props = {
  id: string;
  index: number;
  locked?: boolean;
  premium?: boolean;
  current?: boolean;
  totalCount?: number;
  unit: string;
  lesson: Lesson;
  isLessonCompleted: boolean;
};

/**
 * Card component for displaying lesson items in the game view
 * Handles different states: current, locked, completed, premium
 */
export const Card = ({
  id,
  index,
  current,
  locked,
  totalCount,
  premium,
  lesson,
  unit,
  isLessonCompleted,
}: Props) => {
  const router = useLocalizedRouter();
  const progress = useSelector((state: IRootState) => state.progress);
  const lessons = useSelector((state: IRootState) => state.lessons);

  // Check if this is the current lesson in progress
  let moveHere = null;
  let currentLesson = null;

  if (!progress?.currentLesson) {
    currentLesson = lessons.lessonContents[0];
    moveHere =
      lesson.unitId === currentLesson.unitId &&
      lesson?._id === currentLesson._id;
  } else {
    moveHere =
      progress?.currentUnit?._id === lesson.unitId &&
      progress?.currentLesson?._id === lesson._id;
  }

  // Calculate position in the path (zigzag pattern)
  const { rightPosition, isFirst, isLast } = calculateCardPosition(
    index,
    totalCount
  );

  // Determine card state
  const isCompleted = !current && !locked;

  // Determine which icon to show based on card state
  const Icon = premium
    ? Lock
    : isLessonCompleted
    ? Check
    : isLast
    ? Crown
    : Star;

  const href = !locked ? `/lesson/${id}` : "#";

  // Calculate lesson completion percentage
  const completionPercentage = calculateCompletionPercentage(lesson);

  /**
   * Handle card click based on current state
   */
  const handleCardClick = () => {
    if (moveHere) {
      router.push(href);
    } else {
      router.push("/unit/" + progress.currentUnit?._id + "/" + unit);
    }
  };

  return (
    <div className={cn("cursor-pointer")} key={id}>
      <div
        className="relative flex justify-center"
        style={{
          right: `${rightPosition}px`,
          marginTop: isFirst && !isCompleted ? 60 : 24,
        }}
      >
        {/* Current or first uncompleted lesson */}
        {current || (isFirst && !isLessonCompleted) ? (
          <CurrentLessonCard
            lesson={lesson}
            moveHere={moveHere}
            completionPercentage={completionPercentage}
            handleCardClick={handleCardClick}
            Icon={Icon}
          />
        ) : (
          <CompletedOrLockedCard
            lesson={lesson}
            isLessonCompleted={isLessonCompleted}
            premium={premium}
            Icon={Icon}
            href={href}
            router={router}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Calculate the position of the card in the zigzag path
 */
function calculateCardPosition(index: number, totalCount?: number) {
  const cycleLength = 8;
  const cycleIndex = index % cycleLength;

  let indentationLevel;

  if (cycleIndex <= 2) {
    indentationLevel = cycleIndex;
  } else if (cycleIndex <= 4) {
    indentationLevel = 4 - cycleIndex;
  } else if (cycleIndex <= 6) {
    indentationLevel = 4 - cycleIndex;
  } else {
    indentationLevel = cycleIndex - 8;
  }

  const rightPosition = indentationLevel * 40;
  const isFirst = index === 0;
  const isLast = index === totalCount;

  return { rightPosition, isFirst, isLast };
}

/**
 * Calculate the completion percentage of a lesson
 */
function calculateCompletionPercentage(lesson: Lesson): number {
  if (!lesson) return 0;

  const total = lesson.exercises?.length || 0;
  const completed = lesson.exercises?.filter((e) => e.completed).length || 0;

  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Component for the current lesson card with progress indicator
 */
function CurrentLessonCard({
  lesson,
  moveHere,
  completionPercentage,
  handleCardClick,
  Icon,
}: {
  lesson: Lesson;
  moveHere: boolean;
  completionPercentage: number;
  handleCardClick: () => void;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}) {
  const completed = lesson.exercises?.filter((e) => e.completed).length;

  return (
    <div className="relative h-[100px] w-[100px] ">
      {/* Bouncing indicator */}
      <div className="absolute -top-8 -left-6 z-10 animate-bounce rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 font-bold uppercase tracking-wide text-muted w-[150px] text-center">
        <span className="text-primary-500">
          {moveHere ? (
            <FormattedMessage id="dashboard.lesson.start" />
          ) : (
            <FormattedMessage id="dashboard.lesson.moveHere" />
          )}
        </span>
        <div
          className="absolute transitions -bottom-2 left-1/2 h-0 w-0 
          -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent"
        />
      </div>

      {/* Circular progress indicator */}
      <CircularProgressbarWithChildren
        value={Number.isNaN(completionPercentage) ? 0 : completionPercentage}
        styles={{
          path: {
            stroke: "#fcbb0d",
          },
          trail: {
            stroke: "#e5e7eb",
          },
        }}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="rounded"
              variant="primary"
              className={cn(
                "h-[70px] w-[70px] border-b-8 transition transform active:scale-100 hover:scale-95 duration-50 ease-in-out"
              )}
            >
              <Icon
                style={{
                  width: "40px",
                  height: "40px",
                }}
                className="fill-white stroke-white"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] shadow-lg rounded-xl p-4 bg-primary-500 border-none">
            <div className="flex flex-col space-y-2 text-left">
              <h3 className="text-lg font-semibold text-white">
                {lesson.title}
              </h3>
              <p className="text-sm text-white">
                <FormattedMessage
                  id="dashboard.lesson.progress"
                  values={{
                    completed: completed,
                    total: lesson.exercises?.length,
                  }}
                />
              </p>
              <Button
                onClick={handleCardClick}
                variant="locked"
                className="text-primary-500 bg-white"
              >
                {moveHere ? (
                  <FormattedMessage
                    id="dashboard.lesson.startXp"
                    values={{ xp: lesson.xpReward }}
                  />
                ) : (
                  <FormattedMessage id="dashboard.lesson.passTest" />
                )}
              </Button>
              <div
                className="text-primary-500 absolute transitions -top-2 left-1/2 h-0 w-0 
                -translate-x-1/2 transform border-x-8 border-b-8 border-b-border border-x-transparent"
              />
            </div>
          </PopoverContent>
        </Popover>
      </CircularProgressbarWithChildren>
    </div>
  );
}

/**
 * Component for completed or locked lesson cards
 */
function CompletedOrLockedCard({
  lesson,
  isLessonCompleted,
  premium,
  Icon,
  href,
  router,
}: {
  lesson: Lesson;
  isLessonCompleted: boolean;
  premium?: boolean;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  href: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="rounded"
          variant={isLessonCompleted ? "primary" : "locked"}
          className="h-[70px] w-[70px] border-b-8"
        >
          <Icon
            style={{
              width: "40px",
              height: "40px",
            }}
            className={cn(
              !isLessonCompleted &&
                "fill-neutral-400 stroke-neutral-400 text-neutral-400 stroke-[2]",
              isLessonCompleted && "fill-primary-500 stroke-[4]",
              premium && "fill-neutral-400 text-primary-foreground stroke-[2]"
            )}
          />
        </Button>
      </PopoverTrigger>

      {/* Different popover content based on lesson completion status */}
      {!isLessonCompleted ? (
        <LockedLessonPopover lesson={lesson} />
      ) : (
        <CompletedLessonPopover lesson={lesson} href={href} router={router} />
      )}
    </Popover>
  );
}

/**
 * Popover content for locked lessons
 */
function LockedLessonPopover({ lesson }: { lesson: Lesson }) {
  return (
    <PopoverContent className="w-[260px] bg-neutral-100 border-border shadow-lg rounded-xl p-4 z-20">
      <div className="flex flex-col space-y-2 text-left">
        <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
        <p className="text-sm text-gray-600">
          <FormattedMessage id="dashboard.lesson.locked" />
        </p>
        <Button variant="locked" disabled={true}>
          <FormattedMessage id="dashboard.lesson.notUnlocked" />
        </Button>
        <div
          className="text-neutral-100 absolute transitions -top-2 left-1/2 h-0 w-0 
          -translate-x-1/2 transform border-x-8 border-b-8 border-b-border border-x-transparent"
        />
      </div>
    </PopoverContent>
  );
}

/**
 * Popover content for completed lessons
 */
function CompletedLessonPopover({
  lesson,
  href,
  router,
}: {
  lesson: Lesson;
  href: string;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <PopoverContent className="relative w-[260px] bg-primary-600 shadow-lg rounded-xl p-4 z-30 border-none text-white">
      <div className="flex flex-col space-y-2 text-left">
        <h3 className="text-lg font-semibold">{lesson.title}</h3>
        <p className="text-sm">
          <FormattedMessage id="dashboard.lesson.practice" />
        </p>
        <Button
          variant="outline"
          className="text-black"
          onClick={() => router.push(href)}
        >
          <FormattedMessage
            id="dashboard.lesson.practiceXp"
            values={{ xp: lesson.xpReward }}
          />
        </Button>
        <div
          className="text-primary-600 absolute transitions -top-2 left-1/2 h-0 w-0 
          -translate-x-1/2 transform border-x-8 border-b-8 border-x-transparent"
        />
      </div>
    </PopoverContent>
  );
}
