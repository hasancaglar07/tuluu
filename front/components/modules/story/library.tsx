"use client";

import Loading from "@/components/custom/loading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { apiClient } from "@/lib/api-client";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchLessons } from "@/store/lessonsSlice";
import type { Language } from "@/types";
import type { Chapter, Lesson as StoreLesson } from "@/types/lessons";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useParams } from "next/navigation";
import { i18n } from "@/i18n-config";
import { ArrowLeft, BookOpen, Crown, Lock, Play, Sparkles } from "lucide-react";
import { m } from "framer-motion";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const extractHexColor = (input?: string | null) => {
  if (!input) return "#f97316";
  const match = input.match(/^bg-\[(.+)\]$/);
  if (match?.[1]) {
    return match[1];
  }
  return input;
};

interface StoryLibraryProps {
  languageId?: string | null;
}

export function StoryLibrary({ languageId }: StoryLibraryProps) {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const router = useLocalizedRouter();
  const { getToken } = useAuth();
  const { userId } = useAuth();
  const params = useParams();
  const localeParam = params?.locale;
  const currentLocale = (
    Array.isArray(localeParam) ? localeParam[0] : (localeParam as string)
  ) || i18n.defaultLocale;

  const { chapters, loading, language, lessonContents } = useAppSelector(
    (state) => state.lessons
  );
  const userState = useAppSelector(
    (state) => state.user as Record<string, unknown>
  );
  const subscriptionTier =
    (userState?.subscription as string | undefined) ?? "free";
  const isPremiumUser = subscriptionTier === "premium";
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [languageOptionsLoading, setLanguageOptionsLoading] = useState(false);
  const [languageError, setLanguageError] = useState<string | null>(null);
  const [activeLanguageId, setActiveLanguageId] = useState<string | null>(
    languageId ?? null
  );
  const [syncingLanguage, setSyncingLanguage] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  const isSameLanguage = activeLanguageId
    ? language?._id === activeLanguageId
    : false;

  const handleUpgradeToPremium = () => {
    router.push("/subscriptions");
  };

  useEffect(() => {
    if (languageId || activeLanguageId) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const storedLanguageId = window.localStorage.getItem(
      "tulu.story.languageId"
    );
    if (storedLanguageId) {
      setActiveLanguageId(storedLanguageId);
    }
  }, [languageId, activeLanguageId]);

  useEffect(() => {
    if (activeLanguageId || !language?._id) {
      return;
    }
    const hasStoryContent =
      chapters.some((chapter) =>
        chapter.units.some((unit) =>
          unit.lessons.some((lesson) => Boolean(lesson.storyMetadata?.bookId))
        )
      ) ||
      lessonContents.some((lesson) => Boolean(lesson.storyMetadata?.bookId));

    if (hasStoryContent) {
      setActiveLanguageId(language._id);
    }
  }, [activeLanguageId, chapters, language?._id, lessonContents]);

  useEffect(() => {
    let isMounted = true;
    const loadLanguages = async () => {
      try {
        setLanguageOptionsLoading(true);
        const token = await getToken();
        const response = await apiClient.get(
          `/api/public/lessons?action=learn&locale=${currentLocale}`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {
                  "Content-Type": "application/json",
                },
          }
        );
        if (!isMounted) return;
        const fetchedLanguages: Language[] = response.data.languages ?? [];
        const storyLanguages = fetchedLanguages.filter(
          (item) => item.category === "story_library"
        );
        setAvailableLanguages(storyLanguages);
        if (storyLanguages.length > 0) {
          if (
            languageId &&
            storyLanguages.some((lang) => lang._id === languageId)
          ) {
            setActiveLanguageId(languageId);
          } else if (!activeLanguageId) {
            setActiveLanguageId(storyLanguages[0]._id);
          }
        } else {
          setActiveLanguageId(null);
        }
      } catch {
        if (!isMounted) return;
        setLanguageError(
          intl.formatMessage({
            id: "stories.library.loadError",
            defaultMessage: "Stories could not be loaded. Please try again.",
          })
        );
      } finally {
        if (isMounted) {
          setLanguageOptionsLoading(false);
        }
      }
    };

    void loadLanguages();

    return () => {
      isMounted = false;
    };
  }, [
    currentLocale,
    getToken,
    intl,
    languageId,
    activeLanguageId,
    chapters.length,
  ]);

  useEffect(() => {
    if (!activeLanguageId) {
      return;
    }

    let isMounted = true;
    const synchroniseLanguage = async () => {
      try {
        setSyncingLanguage(true);
        const token = await getToken();
        if (!token || !userId) {
          return;
        }

        // Ensure progress entry exists for this language so lessons endpoint can respond
        await apiClient.post(
          `/api/progress/addlanguage`,
          {
            userId,
            languageId: activeLanguageId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!isMounted) return;

        const shouldFetchLessons =
          language?._id !== activeLanguageId || chapters.length === 0;

        if (shouldFetchLessons) {
          await dispatch(fetchLessons({ languageId: activeLanguageId, token }));
        }
      } catch {
        if (!isMounted) return;
        setLanguageError(
          intl.formatMessage({
            id: "stories.library.loadError",
            defaultMessage: "Stories could not be loaded. Please try again.",
          })
        );
      } finally {
        if (isMounted) {
          setSyncingLanguage(false);
        }
      }
    };

    void synchroniseLanguage();

    return () => {
      isMounted = false;
    };
  }, [
    activeLanguageId,
    chapters.length,
    dispatch,
    getToken,
    intl,
    language?._id,
    userId,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (activeLanguageId) {
      window.localStorage.setItem(
        "tulu.story.languageId",
        activeLanguageId
      );
    }
  }, [activeLanguageId]);

  const storyLessons = useMemo(() => {
    if (!chapters) return [];
    return chapters.flatMap((chapter) =>
      chapter.units.flatMap((unit) =>
        unit.lessons
          .filter((lesson): lesson is StoreLesson => Boolean(lesson))
          .filter((lesson) => Boolean(lesson.storyMetadata?.bookId))
          .map((lesson) => ({
            chapter,
            lesson,
            unit,
          }))
      )
    );
  }, [chapters]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedProgress: Record<string, number> = {};

    storyLessons.forEach(({ lesson }) => {
      const bookId = lesson.storyMetadata?.bookId;
      if (!bookId) return;

      const rawValue = window.localStorage.getItem(
        `tulu.story.progress.${bookId}`
      );
      if (rawValue) {
        const numericValue = Number(rawValue);
        if (!Number.isNaN(numericValue)) {
          storedProgress[bookId] = numericValue;
        }
      }
    });

    setProgressMap(storedProgress);
  }, [storyLessons]);

  const groupedStories = useMemo(
    () =>
      storyLessons.reduce<
        Array<{ chapter: Chapter; lessons: StoreLesson[] }>
      >((accumulator, current) => {
        const existingGroup = accumulator.find(
          (group) => group.chapter._id === current.chapter._id
        );
        if (existingGroup) {
          existingGroup.lessons.push(current.lesson);
          existingGroup.lessons.sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );
          return accumulator;
        }

        accumulator.push({
          chapter: current.chapter,
          lessons: [current.lesson],
        });
        return accumulator;
      }, []),
    [storyLessons]
  );

  const handleOpenStory = (lesson: StoreLesson) => {
    const bookId = lesson.storyMetadata?.bookId;
    if (!bookId) return;
    const targetLanguageId = activeLanguageId ?? language?._id ?? null;
    if (targetLanguageId) {
      if (!activeLanguageId) {
        setActiveLanguageId(targetLanguageId);
      }
      router.push(`/stories/${bookId}?languageId=${targetLanguageId}`);
      return;
    }
    router.push(`/stories/${bookId}`);
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const activeLanguage = activeLanguageId
    ? availableLanguages.find((lang) => lang._id === activeLanguageId) ??
      (language?._id === activeLanguageId ? (language as Language) : null)
    : null;

  const featuredStory = useMemo(() => {
    if (storyLessons.length === 0) return null;
    const nextStory = storyLessons.find(({ lesson }) => !lesson.isCompleted);
    return nextStory ?? storyLessons[0];
  }, [storyLessons]);

  const featuredLesson = featuredStory?.lesson;
  const featuredChapter = featuredStory?.chapter;
  const featuredAccent = extractHexColor(
    featuredLesson?.storyMetadata?.themeColor
  );

  if (
    languageOptionsLoading ||
    syncingLanguage ||
    (loading && (!isSameLanguage || chapters.length === 0))
  ) {
    return <Loading isLoading />;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="rounded-full border border-muted bg-white/60 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm hover:bg-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {intl.formatMessage({
              id: "stories.library.backToDashboard",
              defaultMessage: "Back to dashboard",
            })}
          </Button>
          {activeLanguage && (
            <Badge className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
              {intl.formatMessage(
                {
                  id: "stories.library.currentLanguage",
                  defaultMessage: "Selected: {language}",
                },
                { language: activeLanguage.name }
              )}
            </Badge>
          )}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {intl.formatMessage({
            id: "stories.library.dashboardHint",
            defaultMessage:
              "Jump back to your dashboard anytime without losing your place.",
          })}
        </p>
      </div>

      {featuredLesson && (
        <div
          className="grid gap-6 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]"
          style={{
            background: `linear-gradient(135deg, ${featuredAccent}12, #ffffff)`,
            borderColor: `${featuredAccent}33`,
          }}
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-sm font-semibold text-primary-600 uppercase">
              <BookOpen className="h-5 w-5" />
              {featuredChapter?.title}
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {featuredLesson.storyMetadata?.displayName || featuredLesson.title}
            </h1>
            <p className="text-muted-foreground">
              {intl.formatMessage({
                id: "stories.library.heroDescription",
                defaultMessage:
                  "Continue the next story adventure just like you would in your course dashboard. Flip pages, listen together, and earn XP.",
              })}
            </p>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>
                {intl.formatMessage(
                  {
                    id: "stories.library.heroPages",
                    defaultMessage: "{count} pages",
                  },
                  {
                    count:
                      featuredLesson.storyPages?.length ??
                      featuredLesson.order ??
                      0,
                  }
                )}
              </span>
              <span aria-hidden="true">•</span>
              <span>
                {intl.formatMessage(
                  {
                    id: "stories.library.xpReward",
                    defaultMessage: "+{xp} XP",
                  },
                  { xp: featuredLesson.xpReward }
                )}
              </span>
              {featuredLesson.storyMetadata?.hasAudio && (
                <>
                  <span aria-hidden="true">•</span>
                  <span>
                    {intl.formatMessage({
                      id: "stories.reader.audioAvailable",
                      defaultMessage: "Page narration available",
                    })}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg font-semibold"
                style={{ backgroundColor: featuredAccent, borderColor: "transparent" }}
                onClick={() => handleOpenStory(featuredLesson)}
              >
                <Play className="mr-2 h-5 w-5" />
                {intl.formatMessage({
                  id: "stories.library.startStory",
                  defaultMessage: "Start reading",
                })}
              </Button>
              {featuredLesson.storyMetadata?.ageBadge && (
                <Badge className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                  {featuredLesson.storyMetadata.ageBadge}
                </Badge>
              )}
              {featuredLesson.isPremium && (
                <Badge className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                  <Crown className="h-3 w-3" />
                  {intl.formatMessage({
                    id: "stories.library.premiumBadge",
                    defaultMessage: "Premium",
                  })}
                </Badge>
              )}
            </div>
          </div>

          <div className="relative h-56 w-full overflow-hidden rounded-3xl border border-white/30 bg-white/60 shadow-inner">
            <Image
              src={
                featuredLesson.storyMetadata?.coverImageUrl ||
                featuredLesson.imageUrl ||
                "/images/book.png"
              }
              alt={featuredLesson.storyMetadata?.displayName || featuredLesson.title}
              fill
              className="object-contain p-8"
              priority
            />
          </div>
        </div>
      )}

      <div className="text-center flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-foreground">
          {intl.formatMessage({
            id: "stories.library.title",
            defaultMessage: "Story Library",
          })}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {intl.formatMessage({
            id: "stories.library.subtitle",
            defaultMessage:
              "Choose a book, turn the pages, and follow the narration together with your little explorer.",
          })}
        </p>
      </div>

      {languageError ? (
        <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-10 text-center">
          <p className="text-lg font-semibold text-destructive">
            {languageError}
          </p>
        </div>
      ) : availableLanguages.length > 1 ? (
        <ScrollArea orientation="horizontal" className="w-full">
          <div className="flex items-center justify-center gap-3 pb-2 pr-6">
            {availableLanguages.map((storyLanguage) => {
              const isActive = storyLanguage._id === activeLanguageId;
              return (
                <Button
                  key={storyLanguage._id}
                  variant={isActive ? "primary" : "outline"}
                  size="sm"
                  className={`normal-case rounded-full px-5 ${
                    isActive
                      ? "shadow-sm"
                      : "border border-muted text-muted-foreground hover:border-primary-200 hover:text-primary-600"
                  }`}
                  onClick={() => setActiveLanguageId(storyLanguage._id)}
                >
                  {storyLanguage.name}
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="mx-auto h-1 w-[60%]" />
        </ScrollArea>
      ) : null}

      {groupedStories.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50 p-10 text-center">
          <p className="text-lg font-semibold text-primary-700">
            {intl.formatMessage({
              id: "stories.library.empty",
              defaultMessage: "No story books are available yet.",
            })}
          </p>
          <p className="text-sm text-primary-600 mt-2">
            {intl.formatMessage({
              id: "stories.library.emptyDescription",
              defaultMessage: "New adventures will be added very soon.",
            })}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {groupedStories.map(({ chapter, lessons }) => {
            const completedCount = lessons.filter(
              (item) => item.isCompleted
            ).length;

            return (
              <section key={chapter._id} className="space-y-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold text-foreground">
                      {chapter.title}
                    </h2>
                    {chapter.description && (
                      <p className="text-sm text-muted-foreground max-w-2xl">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold">
                      {intl.formatMessage(
                        {
                          id: "stories.library.chapterCount",
                          defaultMessage: "{count} stories",
                        },
                        { count: lessons.length }
                      )}
                    </Badge>
                    {completedCount > 0 && (
                      <Badge
                        variant="outline"
                        className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                      >
                        {intl.formatMessage(
                          {
                            id: "stories.library.chapterCompleted",
                            defaultMessage: "{count} completed",
                          },
                          { count: completedCount }
                        )}
                      </Badge>
                    )}
                  </div>
                </div>

                <ScrollArea orientation="horizontal" className="w-full">
                  <div className="flex gap-6 pb-4">
                    {lessons.map((lesson) => {
                      const metadata = lesson.storyMetadata;
                      const coverImage =
                        metadata?.coverImageUrl ||
                        lesson.imageUrl ||
                        "/images/book.png";
                      const accentColor = extractHexColor(
                        metadata?.themeColor
                      );
                      const pagesCount =
                        lesson.storyPages?.length ?? lesson.order ?? 0;
                      const bookId = metadata?.bookId || lesson._id;
                      const storedPages = progressMap[bookId] ?? (lesson.isCompleted ? pagesCount : 0);
                      const normalizedPages =
                        pagesCount > 0
                          ? Math.min(storedPages, pagesCount)
                          : 0;
                      const progressValue =
                        pagesCount > 0
                          ? (normalizedPages / pagesCount) * 100
                          : 0;
                      const rotation =
                        progressValue > 0 ? progressValue * 3.6 : 0;
                      const isLocked =
                        lesson.isPremium && !isPremiumUser;
                      const isCompleted =
                        lesson.isCompleted || progressValue >= 99;

                      return (
                        <m.div
                          key={bookId}
                          className="group relative flex min-w-[280px] max-w-[320px] flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                          whileHover={{ y: -6 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-white via-white to-white/60"
                            style={{
                              background: `linear-gradient(130deg, ${accentColor}26, ${accentColor}0f)`,
                            }}
                          >
                            <Image
                              src={coverImage}
                              alt={metadata?.displayName || lesson.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 320px"
                              className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                              priority={false}
                            />
                            {isLocked && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 px-6 text-center backdrop-blur-sm">
                                <Lock className="h-8 w-8 text-primary-500" />
                                <p className="text-sm font-semibold text-primary-700">
                                  {intl.formatMessage({
                                    id: "stories.library.premiumRequired",
                                    defaultMessage: "Premium story",
                                  })}
                                </p>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={handleUpgradeToPremium}
                                  className="rounded-full px-5"
                                >
                                  <Crown className="h-4 w-4" />
                                  {intl.formatMessage({
                                    id: "stories.library.upgrade",
                                    defaultMessage: "Upgrade to Premium",
                                  })}
                                </Button>
                              </div>
                            )}
                            {isCompleted && !isLocked && (
                              <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                                <Sparkles className="h-3 w-3" />
                                {intl.formatMessage({
                                  id: "stories.library.completedBadge",
                                  defaultMessage: "Completed",
                                })}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-4">
                            <div className="flex items-start gap-4">
                              <m.div
                                className="relative h-16 w-16"
                                animate={{ rotate: rotation }}
                                transition={{
                                  type: "spring",
                                  stiffness: 120,
                                  damping: 18,
                                }}
                              >
                                <CircularProgressbarWithChildren
                                  value={progressValue}
                                  strokeWidth={12}
                                  styles={buildStyles({
                                    pathColor: accentColor,
                                    trailColor: "#e2e8f0",
                                    strokeLinecap: "round",
                                  })}
                                >
                                  <span className="text-xs font-semibold text-foreground">
                                    {normalizedPages}/{pagesCount}
                                  </span>
                                </CircularProgressbarWithChildren>
                              </m.div>

                              <div className="flex-1 space-y-1">
                                <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                                  {chapter.title}
                                </span>
                                <h3 className="text-lg font-semibold text-foreground">
                                  {metadata?.displayName || lesson.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  {intl.formatMessage(
                                    {
                                      id: "stories.library.progressLabel",
                                      defaultMessage: "{read} / {total} pages",
                                    },
                                    {
                                      read: normalizedPages,
                                      total: pagesCount,
                                    }
                                  )}
                                </p>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {lesson.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                              <span>
                                {intl.formatMessage(
                                  {
                                    id: "stories.library.xpReward",
                                    defaultMessage: "+{xp} XP",
                                  },
                                  { xp: lesson.xpReward }
                                )}
                              </span>
                              <span aria-hidden="true">•</span>
                              <span>
                                {intl.formatMessage(
                                  {
                                    id: "stories.library.pages",
                                    defaultMessage: "{count} pages",
                                  },
                                  { count: pagesCount }
                                )}
                              </span>
                              {metadata?.primaryLocale && (
                                <>
                                  <span aria-hidden="true">•</span>
                                  <span className="uppercase">
                                    {metadata.primaryLocale}
                                  </span>
                                </>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {metadata?.ageBadge && (
                                <Badge className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                                  {metadata.ageBadge}
                                </Badge>
                              )}
                              {lesson.isPremium && (
                                <Badge className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                                  <Crown className="h-3 w-3" />
                                  {intl.formatMessage({
                                    id: "stories.library.premiumBadge",
                                    defaultMessage: "Premium",
                                  })}
                                </Badge>
                              )}
                              {metadata?.hasAudio && (
                                <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  {intl.formatMessage({
                                    id: "stories.library.audioBadge",
                                    defaultMessage: "Audio",
                                  })}
                                </Badge>
                              )}
                            </div>

                            <Button
                              onClick={() => handleOpenStory(lesson)}
                              variant={isLocked ? "locked" : "primary"}
                              className="mt-auto rounded-full px-5 py-2 text-sm font-semibold normal-case"
                              disabled={isLocked}
                              aria-disabled={isLocked}
                            >
                              {isLocked
                                ? intl.formatMessage({
                                    id: "stories.library.locked",
                                    defaultMessage: "Premium required",
                                  })
                                : intl.formatMessage({
                                    id: "stories.library.readNow",
                                    defaultMessage: "Read now",
                                  })}
                            </Button>
                          </div>
                        </m.div>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
