"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IRootState } from "@/store";
import { Check, Crown, Lock, Star } from "lucide-react";
import { CircularProgressbarWithChildren } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useSelector } from "react-redux";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Lesson } from "@/types";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

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
  const isCompleted = !current && !locked;

  const Icon = premium
    ? Lock
    : isLessonCompleted
    ? Check
    : isLast
    ? Crown
    : Star;

  const href = !locked ? `/lesson/${id}` : "#";

  const progress = useSelector((state: IRootState) => state.progress);

  const moveHere =
    progress?.currentUnit?._id === unit && progress?.currentLesson?._id === id;

  const completed = lesson.exercises?.filter((e) => e.completed).length;

  const calculPercentage = (): number => {
    if (!lesson) return 0;

    const total = lesson.exercises?.length;
    const completed = lesson.exercises?.filter((e) => e.completed).length;

    let percentage = 0;
    if (completed && total) {
      percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    }
    return percentage;
  };

  const router = useLocalizedRouter();
  return (
    <div className={cn("cursor-pointer")} key={id}>
      <div
        className="relative flex justify-center"
        style={{
          right: `${rightPosition}px`,
          marginTop: isFirst && !isCompleted ? 60 : 24,
        }}
      >
        {current || (isFirst && !isLessonCompleted) ? (
          <div className="relative h-[100px] w-[100px] ">
            <div className="absolute -top-8 -left-6 z-10 animate-bounce rounded-xl border-2 border-gray-200 bg-white px-3 py-2.5 font-bold uppercase tracking-wide text-muted w-[150px] text-center">
              <span className="text-primary-500">
                {moveHere ? "START" : "AVANCER ICI"}
              </span>
              <div
                className="absolute transitions -bottom-2 left-1/2 h-0 w-0 
              -translate-x-1/2 transform border-x-8 border-t-8 border-x-transparent"
              />
            </div>
            <CircularProgressbarWithChildren
              value={Number.isNaN(calculPercentage()) ? 0 : calculPercentage()}
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
                    variant={current ? "primary" : "primary"}
                    className={cn(
                      "h-[70px] w-[70px] border-b-8 transition transform active:scale-100 hover:scale-95 duration-50 ease-in-out"
                    )}
                  >
                    <Icon
                      style={{
                        width: "40px",
                        height: "40px",
                      }}
                      className={cn(
                        "fill-white stroke-white"
                        // locked &&
                        //   !isFirst &&
                        //   "fill-neutral-400 stroke-neutral-400 text-neutral-400"
                      )}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className={cn(
                    "w-[260px] shadow-lg rounded-xl p-4 bg-primary-500 border-none"
                  )}
                >
                  <div className="flex flex-col space-y-2 text-left">
                    <h3 className="text-lg font-semibold  text-white">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-white">
                      lesson {completed}/ {lesson.exercises?.length}
                    </p>
                    <Button
                      onClick={() =>
                        moveHere
                          ? router.push(href)
                          : router.push(
                              "/unit/" + progress.currentUnit?._id + "/" + unit
                            )
                      }
                      variant="locked"
                      className="text-primary-500 bg-white"
                    >
                      {moveHere
                        ? "START +" + lesson.xpReward + " XP"
                        : "PASS THE TEST"}
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
        ) : (
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
                    // : "fill-primary-foreground text-primary-foreground",
                    isLessonCompleted && "fill-primary-500  stroke-[4]",
                    // !isLessonCompleted && "fill-neutral-400 stroke-0 ",
                    premium &&
                      "fill-neutral-400 text-primary-foreground stroke-[2]"
                  )}
                />
              </Button>
            </PopoverTrigger>
            {!isLessonCompleted ? (
              <PopoverContent className="w-[260px] bg-neutral-100 border-border shadow-lg rounded-xl p-4 z-20">
                <div className="flex flex-col space-y-2 text-left">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Termine tous les niveaux précédents pour débloquer celui-ci
                    !
                  </p>
                  <Button variant="locked" disabled={isLessonCompleted}>
                    Pas encore débloqué
                  </Button>
                  <div
                    className="text-neutral-100 absolute transitions -top-2 left-1/2 h-0 w-0 
              -translate-x-1/2 transform border-x-8 border-b-8 border-b-border border-x-transparent"
                  />
                </div>
              </PopoverContent>
            ) : (
              <PopoverContent className="relative w-[260px] bg-primary-600 shadow-lg rounded-xl p-4 z-30 border-none text-white">
                <div className="flex flex-col space-y-2 text-left">
                  <h3 className="text-lg font-semibold ">{lesson.title}</h3>
                  <p className="text-sm">
                    S&apos;entrainer encore une fois pour gagner des XP
                  </p>
                  <Button
                    variant="outline"
                    disabled={!isLessonCompleted}
                    className="text-black"
                    onClick={() => router.push(href)}
                  >
                    S&apos;entrainer + {lesson.xpReward}
                  </Button>
                  <div
                    className="text-primary-600 absolute transitions -top-2 left-1/2 h-0 w-0 
              -translate-x-1/2 transform border-x-8 border-b-8 border-x-transparent"
                  />
                </div>
              </PopoverContent>
            )}
          </Popover>
        )}
      </div>
    </div>
  );
};
