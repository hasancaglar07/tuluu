"use client";

import { useEffect, useRef, useState } from "react";
import type { Chapter, Lesson, Subscription, Unit } from "@/types";
import { useDispatch, useSelector } from "react-redux";
import type { IRootState } from "@/store";
import { setCurrentPosition } from "@/store/progressSlice";
import {
  setCurrentData,
  toggleChapter,
  toggleUnit,
} from "@/store/lessonsSlice";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useIntl } from "react-intl";

// Import components
import { DashboardHeader } from "./DashboardHeader";
import { UserStats } from "./UserStats";
import { ViewToggle } from "./ViewToggle";
import { ChapterList } from "./ChapterList";
import { GameView } from "./GameView";
import ValuePointsPanel from "./ValuePointsPanel";

/**
 * Main dashboard component for users to navigate through chapters, units, and lessons
 */
export default function Course({
  subscription,
}: {
  subscription: Subscription;
}) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const router = useLocalizedRouter();
  const [activeView, setView] = useState("game");

  // Get state from Redux store
  const user = useSelector((state: IRootState) => state.user);
  const progress = useSelector((state: IRootState) => state.progress);
  const lessons = useSelector((state: IRootState) => state.lessons);
  const chapters = useSelector((state: IRootState) => state.lessons.chapters);

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

  /**
   * Handle advancing to the next chapter
   */
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

  // Use Intersection Observer to detect which unit is most visible in Pro view
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

  // Use Intersection Observer to detect which unit is most visible in Game view
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

  /**
   * Function to register unit elements for intersection observer
   */
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

  /**
   * Function to check if a lesson is accessible
   */
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

  /**
   * Function to start a lesson
   */
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

  /**
   * Handle premium upgrade
   */
  const handleUpgradeToPremium = () => {
    router.push("/payment?type=premium");
  };

  /**
   * Handle toggling unit expansion
   */
  const handleToggleUnit = (chapterId: string, unitId: string) => {
    dispatch(toggleUnit({ chapterId, unitId }));
  };

  return (
    <div className="flex-1 flex flex-col items-center py-4 md:py-8 px-4">
      {/* Header */}
      <DashboardHeader
        unitColor={progress.unitColor.replace(/^bg-\[(.+)\]$/, "$1")}
        chapterOrder={progress.currentChapter?.order}
        unitOrder={progress.currentUnit?.order}
        unitTitle={
          allUnits.find(
            (u) =>
              u.chapterId === progress.currentChapter?._id &&
              u.unitId === progress.currentUnit?._id
          )?.title
        }
      />

      {/* User Stats */}
      <UserStats
        xp={user.xp}
        hearts={user.hearts}
        subscription={subscription}
        handleUpgradeToPremium={handleUpgradeToPremium}
      />

      <div className="w-full flex justify-center mt-4">
        <ValuePointsPanel />
      </div>

      {/* View Toggle */}
      <div className="hidden md:flex w-full max-w-3xl mt-4 mb-2">
        <div className="flex justify-between items-center w-full">
          <ViewToggle activeView={activeView} setView={setView} />
        </div>
      </div>

      {/* Game View */}
      <div
        ref={scrollContainerRefTwo}
        className={cn(
          "hidden w-full max-w-3xl flex-col items-center mt-4 relative overflow-y-auto no-scrollbar h-[calc(100vh-250px)] md:h-[calc(100vh-220px)] py-5",
          activeView === "game" && "flex"
        )}
      >
        <GameView
          chapters={chapters}
          hasPremium={hasPremium}
          lessonContents={lessons.lessonContents}
          currentLessonId={progress.currentLesson?._id}
          onAdvance={onAdvance}
        />
      </div>

      {/* Pro View */}
      <div
        ref={scrollContainerRef}
        className={cn(
          "hidden w-full max-w-3xl flex-col items-center mt-4 relative overflow-y-auto no-scrollbar h-[calc(100vh-250px)] md:h-[calc(100vh-220px)]",
          activeView === "pro" && "flex"
        )}
      >
        <ChapterList
          chapters={chapters}
          hasPremium={hasPremium}
          toggleChapter={(chapterId) => dispatch(toggleChapter(chapterId))}
          toggleUnit={handleToggleUnit}
          registerUnitRef={registerUnitRef}
          isLessonAccessible={isLessonAccessible}
          startLesson={startLesson}
          handleUpgradeToPremium={handleUpgradeToPremium}
          completedLessons={progress.completedLessons}
        />
      </div>
    </div>
  );
}
