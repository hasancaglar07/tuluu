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
          defaultMessage: "Hikâye tamamlandı! XP ilerlemene eklendi.",
        })
      );
    } catch (error) {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ||
        intl.formatMessage({
          id: "stories.reader.completeError",
          defaultMessage: "İlerlemen şu anda güncellenemedi.",
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
              defaultMessage: "Bir hikâye kütüphanesi seç",
            })}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {intl.formatMessage({
              id: "stories.reader.selectLibraryDescription",
              defaultMessage:
                "Kitabı yükleyebilmemiz için önce bir hikâye programı seç.",
            })}
          </p>
          <Button className="mt-6" onClick={handleBackToLibrary}>
            {intl.formatMessage({
              id: "stories.reader.backToLibrary",
              defaultMessage: "Kütüphaneye Dön",
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
              defaultMessage: "Hikâye bulunamadı",
            })}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {intl.formatMessage({
              id: "stories.reader.notFoundDescription",
              defaultMessage:
                "Lütfen kütüphaneye dönüp başka bir macera seç.",
            })}
          </p>
          <Button className="mt-6" onClick={handleBackToLibrary}>
            {intl.formatMessage({
              id: "stories.reader.backToLibrary",
              defaultMessage: "Kütüphaneye Dön",
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
    <div className="flex h-full w-full flex-col bg-gray-50 overflow-hidden relative">
      {/* HEADER */}
      <header className="shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10 w-full transition-all md:px-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToLibrary}
            className="rounded-full text-muted-foreground hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="hidden sm:flex flex-col ml-2 max-w-[150px] md:max-w-xs">
             <span className="text-sm font-semibold text-foreground truncate">
                {displayName}
             </span>
             <span className="text-xs text-muted-foreground truncate">
                {intl.formatMessage({ id: "stories.reader.pageIndicator", defaultMessage: "{total} sayfanın {current}. sayfası" }, { current: totalPages > 0 ? currentPageNumber : 0, total: totalPages > 0 ? totalPages : 0 })}
             </span>
          </div>
        </div>

        <div className="flex-1 max-w-sm lg:max-w-md mx-4 md:mx-6">
          <Progress value={progressPercentage} className="h-3 bg-gray-200" />
        </div>

        <div className="flex items-center gap-2">
          {metadata?.ageBadge && (
            <Badge className="hidden md:inline-flex rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-semibold text-primary-700">
              {metadata.ageBadge}
            </Badge>
          )}
          {hasAudio && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAudio}
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
               {isAudioEnabled ? <Volume2 className="h-6 w-6 text-primary-500" /> : <VolumeX className="h-6 w-6 text-gray-400 opacity-70" />}
            </Button>
          )}
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative w-full flex flex-col bg-gray-50/50">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center p-4 sm:p-6 md:p-8 min-h-full">
          
          <div className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:h-[65vh] overflow-hidden rounded-2xl md:rounded-3xl border border-gray-200 bg-white shadow-sm flex items-center justify-center">
            {currentPage ? (
              <img
                src={currentPage.imageUrl || coverImage || "/images/book.png"}
                alt={displayName}
                className="w-full h-full object-contain p-2 md:p-6 drop-shadow-sm"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                {intl.formatMessage({
                  id: "stories.reader.noPage",
                  defaultMessage: "Sayfa mevcut değil",
                })}
              </div>
            )}
          </div>

          {/* PAGE DOTS / THUMBNAILS */}
          <div className="w-full mt-6 flex justify-center pb-8">
             <ScrollArea className="w-full whitespace-nowrap max-w-2xl mx-auto">
                <div className="flex w-max items-center justify-center mx-auto gap-2 pb-2 px-1">
                  {storyPages.map((page, index) => {
                    const isActive = index === currentPageIndex;
                    return (
                      <m.button
                        key={page.pageNumber}
                        type="button"
                        onClick={() => setCurrentPageIndex(index)}
                        className={`min-w-[44px] rounded-xl border-2 px-3 py-1.5 text-sm font-semibold transition-all ${
                          isActive
                            ? "border-primary-500 bg-primary-50 text-primary-600 scale-105 shadow-sm"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {page.pageNumber}
                      </m.button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
             </ScrollArea>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="shrink-0 bg-white border-t border-gray-200 p-4 z-10 w-full md:px-8">
        <div className="mx-auto flex flex-col sm:flex-row max-w-4xl items-center justify-between gap-4">
          
          <div className="flex w-full sm:w-auto items-center justify-between sm:justify-start gap-4 order-2 sm:order-1">
             <Button
                variant="secondary"
                size="lg"
                onClick={handlePrevPage}
                disabled={currentPageIndex === 0}
                className="w-[48%] sm:w-[140px] uppercase font-bold text-gray-600 border-b-4 border-gray-300 active:border-b-0 active:mt-1 transition-all !mt-0 h-12"
             >
                {intl.formatMessage({
                  id: "stories.reader.previous",
                  defaultMessage: "Önceki",
                })}
             </Button>

             {currentPageIndex >= totalPages - 1 ? (
                <Button
                   size="lg"
                   onClick={handleCompleteStory}
                   disabled={isCompleting || isCompleted}
                   className="w-[48%] sm:w-[200px] lg:w-[250px] uppercase font-bold bg-[#58cc02] hover:bg-[#46a302] text-white border-b-4 border-[#46a302] active:border-b-0 active:translate-y-1 transition-all h-12"
                >
                   {isCompleted ? (
                      intl.formatMessage({ id: "stories.reader.completedButton", defaultMessage: "Tamamlandı" })
                   ) : isCompleting ? (
                      "..."
                   ) : (
                      intl.formatMessage({ id: "stories.reader.finish", defaultMessage: "Hikâyeyi Bitir" })
                   )}
                </Button>
             ) : (
                <Button
                   size="lg"
                   onClick={handleNextPage}
                   className="w-[48%] sm:w-[200px] lg:w-[250px] uppercase font-bold text-white bg-primary-500 hover:bg-primary-600 border-b-4 border-primary-600 border-x-0 border-t-0 active:border-b-0 active:translate-y-1 transition-all h-12"
                >
                   {intl.formatMessage({
                     id: "stories.reader.next",
                     defaultMessage: "Sonraki",
                   })}
                </Button>
             )}
          </div>

          <div className="hidden sm:flex order-1 sm:order-2 items-center flex-col items-end">
             {completionMessage ? (
                <span className="text-sm font-semibold text-[#58cc02]">{completionMessage}</span>
             ) : (
                <span className="text-sm font-bold text-gray-400">
                   {intl.formatMessage({ id: "stories.reader.xpReward", defaultMessage: "+{xp} XP" }, { xp: lesson.xpReward })}
                </span>
             )}
          </div>

        </div>
      </footer>
      <audio ref={audioRef} hidden />
    </div>
  );
}
