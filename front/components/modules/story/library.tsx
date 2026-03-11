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
import { useEffect, useMemo, useRef, useState } from "react";
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
  const syncedLanguageIdRef = useRef<string | null>(null);

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
        const response = await apiClient.get(
          `/api/public/lessons?action=learn&locale=${currentLocale}&detail=summary`
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
          } else {
            setActiveLanguageId((previousId) => previousId ?? storyLanguages[0]._id);
          }
        } else {
          setActiveLanguageId(null);
        }
      } catch {
        if (!isMounted) return;
        setLanguageError(
          intl.formatMessage({
            id: "stories.library.loadError",
            defaultMessage: "Hikâyeler yüklenemedi. Lütfen tekrar deneyin.",
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
    intl,
    languageId,
  ]);

  useEffect(() => {
    if (!activeLanguageId) {
      return;
    }

    const shouldFetchLessons =
      language?._id !== activeLanguageId || chapters.length === 0;

    if (!shouldFetchLessons && syncedLanguageIdRef.current === activeLanguageId) {
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

        if (shouldFetchLessons) {
          await dispatch(fetchLessons({ languageId: activeLanguageId, token }));
        }

        syncedLanguageIdRef.current = activeLanguageId;
      } catch {
        if (!isMounted) return;
        setLanguageError(
          intl.formatMessage({
            id: "stories.library.loadError",
            defaultMessage: "Hikâyeler yüklenemedi. Lütfen tekrar deneyin.",
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-4 border-b">
          <h2 className="text-2xl font-extrabold text-[#4b4b4b]">
            {intl.formatMessage({
              id: "stories.library.title",
              defaultMessage: "Hikâye Kütüphanesi",
            })}
          </h2>
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="text-muted-foreground hover:bg-gray-100 uppercase font-extrabold text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {intl.formatMessage({
              id: "stories.library.backToDashboard",
              defaultMessage: "Panele Dön",
            })}
          </Button>
        </div>
        <p className="text-[#777] font-medium text-[15px]">
          {intl.formatMessage({
            id: "stories.library.subtitle",
            defaultMessage:
              "Bir kitap seç, sayfaları çevir ve anlatımı minik kaşifinle birlikte takip et.",
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
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max items-center justify-center gap-3 pb-2 pr-6">
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
              defaultMessage: "Henüz hikâye kitabı bulunmuyor.",
            })}
          </p>
          <p className="text-sm text-primary-600 mt-2">
            {intl.formatMessage({
              id: "stories.library.emptyDescription",
              defaultMessage: "Yeni maceralar çok yakında eklenecek.",
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
              <section key={chapter._id} className="space-y-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between px-2 border-b-[3px] border-[#e5e5e5] pb-3">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-[#4b4b4b]">
                      {chapter.title}
                    </h2>
                    {chapter.description && (
                      <p className="text-[15px] font-medium text-[#777]">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <div className="rounded-xl bg-[#e5e5e5] px-3 py-1.5 text-xs font-bold text-[#afafaf] uppercase tracking-wider">
                      {intl.formatMessage(
                        {
                          id: "stories.library.chapterCount",
                          defaultMessage: "{count} hikâye",
                        },
                        { count: lessons.length }
                      )}
                    </div>
                    {completedCount > 0 && (
                      <div className="rounded-xl bg-[#d7ffb8] px-3 py-1.5 text-xs font-bold text-[#58cc02] uppercase tracking-wider">
                        {intl.formatMessage(
                          {
                          id: "stories.library.chapterCompleted",
                          defaultMessage: "{count} tamamlandı",
                        },
                          { count: completedCount }
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex w-max gap-6 pb-4">
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
                          className="group relative flex min-w-[280px] max-w-[320px] flex-col overflow-hidden rounded-2xl border-2 border-b-4 border-gray-200 bg-white transition-all hover:border-b-2 hover:mt-[2px] active:border-b-0 active:mt-[4px]"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-white via-white to-white/60"
                            style={{
                              background: `linear-gradient(130deg, ${accentColor}26, ${accentColor}0f)`,
                            }}
                          >
                            <img
                              src={coverImage}
                              alt={metadata?.displayName || lesson.title}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                            />
                            {isLocked && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 px-6 text-center backdrop-blur-sm">
                                <Lock className="h-8 w-8 text-primary-500" />
                                <p className="text-sm font-semibold text-primary-700">
                                  {intl.formatMessage({
                                    id: "stories.library.premiumRequired",
                                    defaultMessage: "Premium hikâye",
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
                                    defaultMessage: "Premium'a Yükselt",
                                  })}
                                </Button>
                              </div>
                            )}
                            {isCompleted && !isLocked && (
                              <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                                <Sparkles className="h-3 w-3" />
                                {intl.formatMessage({
                                  id: "stories.library.completedBadge",
                                  defaultMessage: "Tamamlandı",
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
                                      defaultMessage: "{read} / {total} sayfa",
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
                                    defaultMessage: "{count} sayfa",
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
                                    defaultMessage: "Sesli",
                                  })}
                                </Badge>
                              )}
                            </div>

                            <Button
                              onClick={() => handleOpenStory(lesson)}
                              variant={isLocked ? "locked" : "primary"}
                              className="mt-auto w-full rounded-xl border-b-4 active:border-b-0 active:mt-1 py-6 text-sm font-bold normal-case uppercase tracking-wider"
                              disabled={isLocked}
                              aria-disabled={isLocked}
                            >
                              {isLocked
                                ? intl.formatMessage({
                                    id: "stories.library.locked",
                                    defaultMessage: "Premium gerekli",
                                  })
                                : intl.formatMessage({
                                    id: "stories.library.readNow",
                                    defaultMessage: "Şimdi Oku",
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
