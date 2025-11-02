"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { m, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Lock,
  ChevronDown,
  File,
  AlignHorizontalSpaceAround,
  AlignJustify,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useEffect, useRef, useState } from "react";
import { Chapter, Lesson, Subscription, Unit } from "@/types";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "@/store";
import { setCurrentPosition } from "@/store/progressSlice";

import {
  setCurrentData,
  toggleChapter,
  toggleUnit,
} from "@/store/lessonsSlice";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { Card } from "./Card";
import { NextChapter } from "./NextChapter";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { toast } from "sonner";
import { useIntl } from "react-intl";

export default function MainContentDashboard({
  subscription,
}: {
  subscription: Subscription;
}) {
  // Redux state
  const dispatch = useDispatch();
  const router = useLocalizedRouter();
  const [activeView, setView] = useState("game");
  // Get state from Redux store
  const user = useSelector((state: IRootState) => state.user);
  const progress = useSelector((state: IRootState) => state.progress);
  const lessons = useSelector((state: IRootState) => state.lessons);
  const chapters = useSelector((state: IRootState) => state.lessons.chapters);
  const intl = useIntl();

  // Local state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRefTwo = useRef<HTMLDivElement>(null);
  const unitElementsRefTwo = useRef<Map<string, HTMLDivElement>>(new Map());
  const unitElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const hasPremium = subscription.subscription === "premium";

  // Create a flat array of all units with their chapter info for easier reference
  const allUnits = chapters.flatMap((chapter) =>
    chapter.units.map((unit) => ({
      _id: unit._id,
      chapterId: chapter._id,
      unitId: unit._id,
      title: unit.title,
      description: unit.description,
      isPremium: unit.isPremium,
      color: unit.color,
      imageUrl: unit.imageUrl,
      order: unit.order,
      lessons: unit.lessons,
      isCompleted: unit.isCompleted,
    }))
  );

  const allChapters = chapters.map((chapter: Chapter) => ({
    _id: chapter._id,
    title: chapter.title,
    units: chapter.units,
    isPremium: chapter.isPremium,
    isCompleted: chapter.isCompleted,
    isExpanded: chapter.isExpanded ?? false,
    order: chapter.order,
    description: chapter.description,
  }));

  const onAdvance = () => {
    toast.info(
      intl.formatMessage({
        id: "dashboard.toast.support",
        defaultMessage:
          "If you'd like to know the status or share feedback, click the Support link in the bottom-left corner.",
      })
    );
    toast.info(
      intl.formatMessage({
        id: "dashboard.toast.comingSoon",
        defaultMessage: "This chapter is locked and is still in progress.",
      })
    );
  };

  // Use Intersection Observer to detect which unit is most visible
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    // Options for the observer
    const options = {
      root: scrollContainerRef.current,
      rootMargin: "0px",
      threshold: 0.6, // Element is considered visible when 60% is in view
    };

    // Callback for the observer
    const callback: IntersectionObserverCallback = (entries) => {
      // Find the most visible entry
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      if (visibleEntries.length > 0) {
        // Sort by intersection ratio in descending order
        const mostVisible = visibleEntries.sort(
          (a, b) => b.intersectionRatio - a.intersectionRatio
        )[0];

        // Get the unit key from the target element
        const unitKey = mostVisible.target.getAttribute("data-unit-key");
        const unitColor = mostVisible.target.getAttribute("data-unit-color");

        if (unitKey && unitColor) {
          const [chapterIdStr, unitIdStr] = unitKey.split("-");
          const chapterId = String(chapterIdStr);
          const unitId = String(unitIdStr);

          // Find the unit info
          const unitInfo = allUnits.find(
            (u) => u.chapterId === chapterId && u.unitId === unitId
          );

          const chapterInfo = allChapters.find((u) => u._id === chapterId);

          if (unitInfo && chapterInfo && progress.currentLesson) {
            // Update current position in Redux
            dispatch(
              setCurrentPosition({
                chapter: chapterInfo,
                unit: unitInfo,
                unitColor: unitColor,
                lesson: progress.currentLesson,
              })
            );
          }
        }
      }
    };

    // Create the observer
    const observer = new IntersectionObserver(callback, options);

    // Observe all unit elements
    unitElementsRef.current.forEach((element) => {
      observer.observe(element);
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [dispatch, allUnits, progress.currentLesson, allChapters]);

  useEffect(() => {
    if (!scrollContainerRefTwo.current) return;

    // Options for the observer
    const options = {
      root: scrollContainerRefTwo.current,
      rootMargin: "0px",
      threshold: 0.6, // Element is considered visible when 60% is in view
    };

    // Callback for the observer
    const callback: IntersectionObserverCallback = (entries) => {
      // Find the most visible entry
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      if (visibleEntries.length > 0) {
        // Sort by intersection ratio in descending order
        const mostVisible = visibleEntries.sort(
          (a, b) => b.intersectionRatio - a.intersectionRatio
        )[0];

        // Get the unit key from the target element
        const unitKey = mostVisible.target.getAttribute("data-unit-key-card");
        const unitColor = mostVisible.target.getAttribute(
          "data-unit-color-card"
        );

        if (unitKey && unitColor) {
          const [chapterIdStr, unitIdStr] = unitKey.split("-");
          const chapterId = String(chapterIdStr);
          const unitId = String(unitIdStr);

          // Find the unit info
          const unitInfo = allUnits.find(
            (u) => u.chapterId === chapterId && u.unitId === unitId
          );

          const chapterInfo = allChapters.find((u) => u._id === chapterId);

          if (unitInfo && chapterInfo && progress.currentLesson) {
            // Update current position in Redux
            dispatch(
              setCurrentPosition({
                chapter: chapterInfo,
                unit: unitInfo,
                unitColor: "bg-[#000000]",
                lesson: progress.currentLesson,
              })
            );
          }
        }
      }
    };

    // Create the observer
    const observer = new IntersectionObserver(callback, options);

    // Observe all unit elements
    unitElementsRefTwo.current.forEach((element) => {
      observer.observe(element);
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, [dispatch, allUnits, progress.currentLesson, allChapters]);

  // Function to register unit elements
  const registerUnitRef = (
    element: HTMLDivElement | null,
    chapterId: string,
    unitId: string
  ) => {
    if (element) {
      const key = `${chapterId}-${unitId}`;
      unitElementsRef.current.set(key, element);
    }
  };

  // Function to check if a lesson is accessible
  const isLessonAccessible = (chapter: Chapter, unit: Unit, lesson: Lesson) => {
    // If user has premium subscription, all lessons are accessible
    if (hasPremium) {
      // Check if previous lesson is completed or if it's the first lesson
      const lessonIndex = unit.lessons.findIndex((l) => l._id === lesson._id);
      if (lessonIndex === 0) {
        // First lesson in unit - check if previous unit's last lesson is completed or if it's the first unit
        const unitIndex = chapter.units.findIndex((u) => u._id === unit._id);
        if (unitIndex === 0) {
          // First unit in chapter - check if previous chapter's last unit's last lesson is completed or if it's the first chapter
          const chapterIndex = chapters.findIndex((c) => c._id === chapter._id);
          if (chapterIndex === 0) {
            // First chapter, first unit, first lesson - always accessible
            return true;
          } else {
            // Check if previous chapter is completed
            const prevChapter = chapters[chapterIndex - 1];
            return prevChapter.isCompleted;
          }
        } else {
          // Check if previous unit is completed
          const prevUnit = chapter.units[unitIndex - 1];
          return prevUnit.isCompleted;
        }
      } else {
        // Check if previous lesson is completed
        const prevLesson = unit.lessons[lessonIndex - 1];
        return prevLesson.status === "completed";
      }
    } else {
      // Free subscription - check if lesson is premium
      if (lesson.isPremium || unit.isPremium || chapter.isPremium) {
        return false;
      }

      // Check progression (same logic as above)
      const lessonIndex = unit.lessons.findIndex((l) => l._id === lesson._id);
      if (lessonIndex === 0) {
        const unitIndex = chapter.units.findIndex((u) => u._id === unit._id);
        if (unitIndex === 0) {
          const chapterIndex = chapters.findIndex((c) => c._id === chapter._id);
          if (chapterIndex === 0) {
            return true;
          } else {
            const prevChapter = chapters[chapterIndex - 1];
            return prevChapter.isCompleted;
          }
        } else {
          const prevUnit = chapter.units[unitIndex - 1];
          return prevUnit.isCompleted;
        }
      } else {
        const prevLesson = unit.lessons[lessonIndex - 1];
        return prevLesson.status === "completed";
      }
    }
  };

  // Function to start a lesson
  const startLesson = (chapterId: string, unitId: string, lessonId: string) => {
    dispatch(
      setCurrentData({
        chapter: chapterId,
        unit: unitId,
        lesson: lessonId,
      })
    );
    // Navigate to the lesson page
    router.push(`/lesson/${lessonId}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center py-4 md:py-8 px-4">
      {/* Header */}
      <m.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl text-white p-4 rounded-xl sticky top-0 z-10"
        style={{
          backgroundColor: progress.unitColor.replace(/^bg-\[(.+)\]$/, "$1"),
        }}
      >
        <div className="flex items-center gap-2">
          <ArrowLeft className="h-6 w-6" />
          <div>
            <div className="text-sm font-medium">
              CHAPTER {progress.currentChapter?.order}, UNIT{" "}
              {progress.currentUnit?.order}
            </div>
            <div className="text-xl font-bold">
              {allUnits.find(
                (u: { chapterId: string; unitId: string }) =>
                  u.chapterId === progress.currentChapter?._id &&
                  u.unitId === progress.currentUnit?._id
              )?.title || "Commande au café"}
            </div>
          </div>
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30"
            >
              <div className="flex items-center gap-2">
                <File />
                <span className="hidden sm:inline">GUIDE</span>
              </div>
            </Button>
          </div>
        </div>
      </m.div>

      {/* Mobile User Stats */}
      <div className="md:hidden w-full max-w-3xl flex justify-between items-center mt-4 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-primary-100 font-bold">
            🏅
            <span className="text-yellow-500">{user.xp}</span>
          </div>
          <div className="flex items-center gap-1 text-red-500 font-bold">
            <Heart className="text-red-500 fill-red-500" size={20} />
            <span>{user.hearts}</span>
          </div>
        </div>
        <Badge
          variant={hasPremium ? "default" : "outline"}
          className={hasPremium ? "bg-secondary-500 text-black" : ""}
        >
          {hasPremium ? "PREMIUM" : "FREE"}
        </Badge>
      </div>

      {/* Subscription Status - Desktop */}
      <div className="hidden md:flex w-full max-w-3xl mt-4 mb-2">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <div className="flex gap-4">
              Change view:
              <button
                className="cursor-pointer"
                onClick={() => setView("game")}
              >
                <AlignHorizontalSpaceAround />
              </button>
              <button className="cursor-pointer" onClick={() => setView("pro")}>
                <AlignJustify />
              </button>
              {/*<Badge className="destructive">Beta</Badge>*/}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Lesson Path */}

      <div
        ref={scrollContainerRefTwo}
        className={cn(
          "hidden w-full max-w-3xl  flex-col items-center mt-4 relative overflow-y-auto no-scrollbar h-[calc(100vh-250px)] md:h-[calc(100vh-220px)]",
          activeView === "game" && "flex"
        )}
      >
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
                        const lessonUpdated = lessons.lessonContents.find(
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
                            current={lesson._id == progress.currentLesson?._id}
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
                          y: [0, -20, 0], // move up 20px then back down
                        }}
                        transition={{
                          duration: 3, // slow bounce duration
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                      >
                        <Image
                          src={unit.imageUrl}
                          width={150}
                          height={150}
                          alt="image_url"
                          style={{ objectFit: "cover", borderRadius: 12 }}
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
      </div>

      <div
        ref={scrollContainerRef}
        className={cn(
          "hidden w-full max-w-3xl  flex-col items-center mt-4 relative overflow-y-auto no-scrollbar h-[calc(100vh-250px)] md:h-[calc(100vh-220px)]",
          activeView === "pro" && "flex"
        )}
      >
        {/* <Badge>Beta feature</Badge> */}
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
              onClick={() => dispatch(toggleChapter(chapter._id))}
            >
              <h4>
                Chapter {chapter.order}: {chapter.title}
              </h4>
              {chapter.isPremium && !hasPremium && (
                <Tooltip>
                  <TooltipTrigger>
                    <m.div whileHover={{ rotate: [0, -10, 10, -10, 0] }}>
                      <Lock className="h-5 w-5 text-gray-900" />
                    </m.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Contenu premium - Abonnez-vous pour débloquer</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {chapter.isCompleted && (
                <m.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 10 }}
                >
                  <Badge className="bg-primary-500">COMPLÉTÉ</Badge>
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
                        onClick={() =>
                          dispatch(
                            toggleUnit({
                              chapterId: chapter._id,
                              unitId: unit._id,
                            })
                          )
                        }
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <h5 className="capitalize">
                          Unit {unit.order}: {unit.title}
                        </h5>
                        {unit.isPremium && !hasPremium && (
                          <Tooltip>
                            <TooltipTrigger>
                              <m.div
                                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                              >
                                <Lock className="h-5 w-5 text-gray-900" />
                              </m.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Contenu premium - Abonnez-vous pour débloquer
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {unit.isCompleted && (
                          <m.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 10,
                            }}
                          >
                            <Badge className="bg-primary-500">COMPLÉTÉ</Badge>
                          </m.div>
                        )}
                        <m.div
                          animate={{ rotate: unit.isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="ml-auto"
                        >
                          <ChevronDown className="h-5 w-5" />
                        </m.div>
                      </m.div>
                      <p className="text-gray-500 mb-6">{unit.description}</p>

                      <AnimatePresence>
                        {unit.isExpanded && (
                          <m.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            {unit.lessons.map((lesson) => {
                              const isAccessible = isLessonAccessible(
                                chapter,
                                unit,
                                lesson
                              );
                              const isPremiumLocked =
                                (lesson.isPremium ||
                                  unit.isPremium ||
                                  chapter.isPremium) &&
                                !hasPremium;
                              const isProgressionLocked =
                                lesson.status === "locked" && !isAccessible;

                              // Check if lesson is completed using Redux state
                              // const isCompleted =
                              //   progress.completedLessons.some(
                              //     (completedLesson) =>
                              //       completedLesson._id === lesson._id
                              //   );

                              return (
                                <m.div
                                  key={`lesson-${chapter._id}-${unit._id}-${lesson._id}`}
                                  className={`p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between ${
                                    lesson.status === "completed"
                                      ? "bg-primary-100 border-primary-500"
                                      : lesson.status === "available" &&
                                        !isPremiumLocked
                                      ? "bg-white border-primary-100"
                                      : "bg-gray-100 border-gray-300"
                                  }`}
                                  whileHover={{
                                    scale:
                                      lesson.status === "completed" ||
                                      (lesson.status === "available" &&
                                        !isPremiumLocked)
                                        ? 1.02
                                        : 1,
                                    boxShadow:
                                      lesson.status === "completed" ||
                                      (lesson.status === "available" &&
                                        !isPremiumLocked)
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
                                        Lesson {lesson.order}: {lesson.title}
                                      </h6>
                                      {isPremiumLocked && (
                                        <Tooltip>
                                          <TooltipTrigger>
                                            <m.div
                                              whileHover={{
                                                rotate: [0, -10, 10, -10, 0],
                                              }}
                                            >
                                              <Lock className="h-4 w-4 text-gray-900" />
                                            </m.div>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>
                                              Contenu premium - Abonnez-vous
                                              pour débloquer
                                            </p>
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                      {isProgressionLocked &&
                                        !isPremiumLocked && (
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <m.div
                                                whileHover={{
                                                  rotate: [0, -10, 10, -10, 0],
                                                }}
                                              >
                                                <Lock className="h-4 w-4 text-gray-500" />
                                              </m.div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>
                                                Terminez les leçons précédentes
                                                pour débloquer
                                              </p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                      {lesson.description}
                                    </p>
                                  </div>
                                  <m.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="mt-2 sm:mt-0"
                                  >
                                    <Button
                                      onClick={() => {
                                        startLesson(
                                          chapter._id,
                                          unit._id,
                                          lesson._id
                                        );
                                      }}
                                      className={`${
                                        lesson.isCompleted
                                          ? "bg-primary-500 hover:bg-primary-800"
                                          : !lesson.isCompleted &&
                                            !isPremiumLocked
                                          ? "bg-primary-100 hover:bg-primary-500 hover:text-white text-primary-500"
                                          : isPremiumLocked
                                          ? "bg-secondary-500 hover:bg-secondary-600 text-black"
                                          : "bg-gray-400 hover:bg-gray-900 hover:text-white cursor-not-allowed"
                                      }`}
                                      disabled={
                                        isProgressionLocked && !isPremiumLocked
                                      }
                                    >
                                      {lesson.isCompleted
                                        ? "RESTART"
                                        : !lesson.isCompleted &&
                                          !isPremiumLocked
                                        ? "START"
                                        : isPremiumLocked
                                        ? "UNLOCK"
                                        : "LOCKED"}
                                    </Button>
                                  </m.div>
                                </m.div>
                              );
                            })}
                          </m.div>
                        )}
                      </AnimatePresence>
                    </m.div>
                  ))}
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        ))}
      </div>
      
    </div>
  );
}
