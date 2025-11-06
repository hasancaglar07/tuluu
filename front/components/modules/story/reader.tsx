"use client";

import Loading from "@/components/custom/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { apiClient } from "@/lib/api-client";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchLessons } from "@/store/lessonsSlice";
import { fetchSettings } from "@/store/settingsSlice";
import { fetchUserProgress } from "@/store/progressSlice";
import { fetchUserData } from "@/store/userSlice";
import type { LessonContent, StoryPage } from "@/types";
import { useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { m } from "framer-motion";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface StoryReaderProps {
  languageId?: string | null;
  bookId: string;
}

const findLessonByBook = (lessons: LessonContent[], bookId: string) =>
  lessons.find((lesson) => lesson.storyMetadata?.bookId === bookId);

const getHexFromColorToken = (input?: string | null) => {
  if (!input) return "#f97316";
  const match = input.match(/^bg-\[(.+)\]$/);
  if (match?.[1]) {
    return match[1];
  }
  return input;
};

export function StoryReader({ languageId, bookId }: StoryReaderProps) {
  const intl = useIntl();
  const router = useLocalizedRouter();
  const dispatch = useAppDispatch();
  const { userId, getToken } = useAuth();

  const { chapters, lessonContents, loading, language } = useAppSelector(
    (state) => state.lessons
  );
  const [effectiveLanguageId, setEffectiveLanguageId] = useState<string | null>(
    languageId ?? null
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(
    null
  );
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (languageId) {
      setEffectiveLanguageId(languageId);
      return;
    }

    if (typeof window !== "undefined") {
      const storedLanguage = window.localStorage.getItem(
        "tulu.story.languageId"
      );
      if (storedLanguage) {
        setEffectiveLanguageId(storedLanguage);
        return;
      }
    }

    if (
      !languageId &&
      language?._id &&
      language.category === "story_library"
    ) {
      setEffectiveLanguageId(language._id);
    }
  }, [languageId, language]);

  const lesson = useMemo(() => {
    const directMatch = findLessonByBook(lessonContents, bookId);
    if (directMatch) return directMatch;

    const fromChapters = chapters
      .flatMap((chapter) => chapter.units.flatMap((unit) => unit.lessons))
      .find((lsn) => lsn.storyMetadata?.bookId === bookId);

    return fromChapters;
  }, [lessonContents, chapters, bookId]);

  const storyPages = lesson?.storyPages ?? [];
  const currentPage: StoryPage | undefined =
    storyPages.length > 0 ? storyPages[currentPageIndex] : undefined;
  const hasAudio = Boolean(lesson?.storyMetadata?.hasAudio);
  const accentColor = getHexFromColorToken(lesson?.storyMetadata?.themeColor);

  useEffect(() => {
    if (!effectiveLanguageId) return;
    if (lesson) return;

    let isMounted = true;
    void (async () => {
      const token = await getToken();
      if (!token || !isMounted) return;
      await dispatch(fetchLessons({ languageId: effectiveLanguageId, token }));
    })();

    return () => {
      isMounted = false;
    };
  }, [dispatch, effectiveLanguageId, getToken, lesson]);

  useEffect(() => {
    setCurrentPageIndex(0);
  }, [bookId]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    if (!currentPage?.audioUrl) {
      audioElement.pause();
      return;
    }

    if (!isAudioEnabled) {
      audioElement.pause();
      return;
    }

    audioElement.src = currentPage.audioUrl;
    audioElement.play().catch(() => {
      // If autoplay fails, fall back to manual toggle
    });
  }, [currentPageIndex, currentPage, isAudioEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!bookId) return;
    if (storyPages.length === 0) return;

    const pagesRead = Math.min(currentPageIndex + 1, storyPages.length);
    window.localStorage.setItem(
      `tulu.story.progress.${bookId}`,
      pagesRead.toString()
    );
  }, [bookId, currentPageIndex, storyPages.length]);

  const handleNextPage = () => {
    setCurrentPageIndex((prev) =>
      Math.min(prev + 1, Math.max(storyPages.length - 1, 0))
    );
  };

  const handlePrevPage = () => {
    setCurrentPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const toggleAudio = () => {
    if (!hasAudio || !audioRef.current) return;
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    if (!nextState) {
      audioRef.current.pause();
    } else if (currentPage?.audioUrl) {
      audioRef.current.src = currentPage.audioUrl;
      void audioRef.current.play();
    }
  };

  const handleCompleteStory = async () => {
    if (!lesson || !userId) return;
    const targetLanguageId = effectiveLanguageId ?? languageId;
    if (!targetLanguageId) return;
    const token = await getToken();
    if (!token) return;

    setIsCompleting(true);
    setCompletionMessage(null);

    try {
      await apiClient.post(
        "/api/progress/addlesson",
        {
          lessonId: lesson._id,
          xp: lesson.xpReward ?? 10,
          gems: 0,
          gel: 0,
          xpBoost: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await Promise.all([
        dispatch(fetchLessons({ languageId: targetLanguageId, token })),
        dispatch(fetchUserProgress({ languageId: targetLanguageId, token })),
        dispatch(fetchSettings({ token })),
        dispatch(fetchUserData({ userId, token })),
      ]);

      setCompletionMessage(
        intl.formatMessage({
          id: "stories.reader.completed",
          defaultMessage: "Story completed! XP added to your progress.",
        })
      );
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        intl.formatMessage({
          id: "stories.reader.completeError",
          defaultMessage: "We could not update your progress right now.",
        });
      setCompletionMessage(message);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleBackToLibrary = () => {
    const targetLanguageId = effectiveLanguageId ?? languageId;
    if (targetLanguageId) {
      router.push(`/stories?languageId=${targetLanguageId}`);
    } else {
      router.push("/stories");
    }
  };

  if (loading && !lesson) {
    return <Loading isLoading />;
  }

  if (!effectiveLanguageId && !lesson) {
    return (
      <Card className="mx-auto mt-16 max-w-xl">
        <CardContent className="p-10 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">
            {intl.formatMessage({
              id: "stories.reader.selectLibraryTitle",
              defaultMessage: "Choose a story library",
            })}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {intl.formatMessage({
              id: "stories.reader.selectLibraryDescription",
              defaultMessage:
                "Pick a story programme first so we can load the book for you.",
            })}
          </p>
          <Button className="mt-6" onClick={handleBackToLibrary}>
            {intl.formatMessage({
              id: "stories.reader.backToLibrary",
              defaultMessage: "Back to library",
            })}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!lesson) {
    return (
      <Card className="max-w-xl mx-auto mt-16">
        <CardContent className="p-10 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold text-foreground">
            {intl.formatMessage({
              id: "stories.reader.notFound",
              defaultMessage: "Story not found",
            })}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {intl.formatMessage({
              id: "stories.reader.notFoundDescription",
              defaultMessage:
                "Please return to the library and pick another adventure.",
            })}
          </p>
          <Button className="mt-6" onClick={handleBackToLibrary}>
            {intl.formatMessage({
              id: "stories.reader.backToLibrary",
              defaultMessage: "Back to library",
            })}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const metadata = lesson.storyMetadata;
  const displayName = metadata?.displayName || lesson.title;
  const coverImage = metadata?.coverImageUrl || lesson.imageUrl;
  const totalPages = storyPages.length;
  const isCompleted = Boolean(lesson.isCompleted);
  const currentPageNumber = totalPages > 0 ? currentPageIndex + 1 : 0;
  const progressPercentage =
    totalPages > 0 ? (currentPageNumber / totalPages) * 100 : 0;

  return (
    <div className="flex min-h-[70vh] flex-col gap-6">
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="rounded-full border border-muted bg-white/60 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm hover:bg-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {intl.formatMessage({
                id: "stories.reader.backToDashboard",
                defaultMessage: "Back to dashboard",
              })}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToLibrary}
              className="rounded-full px-4 py-2 text-sm font-semibold normal-case"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              {intl.formatMessage({
                id: "stories.reader.backToLibrary",
                defaultMessage: "Back to library",
              })}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <m.div
              className="h-16 w-16"
              animate={{
                scale: isCompleting ? [1, 1.05, 1] : 1,
              }}
              transition={{
                repeat: isCompleting ? Number.POSITIVE_INFINITY : 0,
                duration: 1.2,
              }}
            >
              <CircularProgressbarWithChildren
                value={progressPercentage}
                strokeWidth={12}
                styles={buildStyles({
                  pathColor: accentColor,
                  trailColor: "#e2e8f0",
                  strokeLinecap: "round",
                })}
              >
                <span className="text-xs font-semibold text-foreground">
                  {totalPages > 0 ? currentPageNumber : "-"} / {totalPages || "-"}
                </span>
              </CircularProgressbarWithChildren>
            </m.div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-primary-200 bg-white px-3 py-1 text-xs font-semibold text-primary-600"
              >
                {intl.formatMessage(
                  {
                    id: "stories.reader.xpReward",
                    defaultMessage: "Reward: {xp} XP",
                  },
                  { xp: lesson.xpReward }
                )}
              </Badge>
              {metadata?.ageBadge && (
                <Badge className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  {metadata.ageBadge}
                </Badge>
              )}
              {hasAudio && (
                <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {intl.formatMessage({
                    id: "stories.reader.audioAvailable",
                    defaultMessage: "Page narration available",
                  })}
                </Badge>
              )}
              {metadata?.primaryLocale && (
                <Badge
                  variant="outline"
                  className="rounded-full border-muted-foreground/20 px-3 py-1 text-xs font-semibold uppercase text-muted-foreground"
                >
                  {metadata.primaryLocale}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl font-semibold text-foreground">
              {displayName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {intl.formatMessage(
                {
                  id: "stories.reader.pageIndicator",
                  defaultMessage: "Page {current} of {total}",
                },
                {
                  current: totalPages > 0 ? currentPageNumber : 0,
                  total: totalPages > 0 ? totalPages : 0,
                }
              )}
            </p>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 shadow-sm">
            {currentPage ? (
              <Image
                src={currentPage.imageUrl || coverImage || "/images/book.png"}
                alt={displayName}
                fill
                className="bg-white object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {intl.formatMessage({
                  id: "stories.reader.noPage",
                  defaultMessage: "Page not available",
                })}
              </div>
            )}
          </div>

          <ScrollArea orientation="horizontal" className="w-full">
            <div className="flex gap-2 pb-2">
              {storyPages.map((page, index) => {
                const isActive = index === currentPageIndex;
                return (
                  <m.button
                    key={page.pageNumber}
                    type="button"
                    onClick={() => setCurrentPageIndex(index)}
                    className={`min-w-[48px] rounded-full border px-3 py-2 text-sm font-semibold ${
                      isActive
                        ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                        : "border-gray-200 bg-white text-muted-foreground hover:bg-muted/50"
                    }`}
                    whileHover={{ scale: isActive ? 1.05 : 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {page.pageNumber}
                  </m.button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        <aside className="w-full space-y-6 lg:max-w-sm">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>{lesson.description}</p>
              <ul className="space-y-1">
                <li>
                  {intl.formatMessage(
                    {
                      id: "stories.reader.totalPages",
                      defaultMessage: "{count} illustrated pages",
                    },
                    { count: totalPages }
                  )}
                </li>
                {metadata?.ageBadge && (
                  <li>
                    {intl.formatMessage(
                      {
                        id: "stories.reader.ageRange",
                        defaultMessage: "Recommended ages: {badge}",
                      },
                      { badge: metadata.ageBadge }
                    )}
                  </li>
                )}
              </ul>
              {completionMessage && (
                <p className="text-xs text-primary-600">{completionMessage}</p>
              )}
            </div>
          </div>
        </aside>
      </main>

      <footer className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button
              variant="secondary"
              onClick={handlePrevPage}
              disabled={currentPageIndex === 0}
              className="flex-1"
            >
              {intl.formatMessage({
                id: "stories.reader.previous",
                defaultMessage: "Previous",
              })}
            </Button>
            <Button
              variant="secondary"
              onClick={handleNextPage}
              disabled={currentPageIndex >= totalPages - 1}
              className="flex-1"
            >
              {intl.formatMessage({
                id: "stories.reader.next",
                defaultMessage: "Next",
              })}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasAudio && (
              <Button
                variant="outline"
                onClick={toggleAudio}
                className="flex items-center justify-center gap-2"
              >
                {isAudioEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4" />
                    {intl.formatMessage({
                      id: "stories.reader.audioOn",
                      defaultMessage: "Audio playing",
                    })}
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4" />
                    {intl.formatMessage({
                      id: "stories.reader.audioOff",
                      defaultMessage: "Enable audio",
                    })}
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={handleCompleteStory}
              disabled={isCompleting || isCompleted}
              className="flex items-center justify-center gap-2"
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  {intl.formatMessage({
                    id: "stories.reader.completedButton",
                    defaultMessage: "Story already completed",
                  })}
                </>
              ) : isCompleting ? (
                <>
                  <Pause className="h-4 w-4" />
                  {intl.formatMessage({
                    id: "stories.reader.completing",
                    defaultMessage: "Updating progress…",
                  })}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  {intl.formatMessage({
                    id: "stories.reader.completeStory",
                    defaultMessage: "Finish story",
                  })}
                </>
              )}
            </Button>
          </div>
        </div>
        {!completionMessage && (
          <p className="mt-3 text-xs text-muted-foreground">
            {intl.formatMessage({
              id: "stories.reader.completeHint",
              defaultMessage:
                "Mark as complete once you have finished every page.",
            })}
          </p>
        )}
      </footer>
      <audio ref={audioRef} hidden />
    </div>
  );
}
