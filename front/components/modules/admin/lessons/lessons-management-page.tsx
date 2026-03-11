"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { FormattedMessage, useIntl } from "react-intl";
import type { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpenCheck,
  ArrowRight,
  Globe,
  Layers,
  ListChecks,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Loading from "@/components/custom/loading";
import { apiClient } from "@/lib/api-client";

// Import our new components
import { LanguageSelector } from "./language-selector";
import { SkillTreeView } from "./skill-tree-view";
import { LanguagesGridView } from "./languages-grid-view";
import { ChaptersGridView } from "./chapters-grid-view";
import { UnitsGridView } from "./units-grid-view";
import { LessonsGridView } from "./lessons-grid-view";
import { LanguageDialog } from "./dialogs/language-dialog";
import { ChapterDialog } from "./dialogs/chapter-dialog";
import { DeleteConfirmationDialog } from "./dialogs/delete-confirmation-dialog";
import { UnitDialog } from "./dialogs/unit-dialog";
import { LessonDialog } from "./dialogs/lesson-dialog";
import { ExerciseDialog } from "./dialogs/exercise-dialog";

// Import types
import type {
  Language,
  Chapter,
  Unit,
  Lesson,
  NewLanguageForm,
  NewExerciseForm,
} from "@/types/lessons";
import type { ThemeMetadata } from "@/types";
import { i18n } from "@/i18n-config";

const createDefaultThemeMetadata = (): ThemeMetadata => ({
  islamicContent: false,
  ageGroup: "kids_7-12",
  moralValues: [] as string[],
  educationalFocus: "",
  difficultyLevel: "beginner",
});

const createInitialLanguage = (locale?: string): NewLanguageForm => ({
  _id: "",
  name: "",
  nativeName: "",
  flag: "",
  baseLanguage: locale ?? i18n.defaultLocale,
  imageUrl: "",
  isActive: true,
  category: "language_learning",
  themeMetadata: createDefaultThemeMetadata(),
  locale: locale ?? i18n.defaultLocale,
});

const createInitialExercise = (language?: Language): NewExerciseForm => ({
  _id: "",
  lessonId: "",
  type: "translate",
  componentType: "multiple_choice",
  moralValue: "kindness",
  valuePoints: 0,
  questionPreview: "",
  instruction: "",
  sourceText: "",
  sourceLanguage: language?.baseLanguage ?? "",
  targetLanguage: language?.locale ?? language?.baseLanguage ?? "",
  correctAnswer: [""],
  options: ["", "", "", "", ""],
  isNewWord: false,
  audioUrl: "",
  neutralAnswerImage: "",
  badAnswerImage: "",
  correctAnswerImage: "",
  educationContent: null,
});

/**
 * Main Lessons Management Page Component
 *
 * This component manages the entire lessons administration interface including:
 * - Language management (create, edit, delete)
 * - Chapter management within languages
 * - Unit management within chapters
 * - Lesson management within units
 * - Exercise management within lessons
 *
 * The component uses a tabbed interface to organize different views:
 * - Skill Tree: Hierarchical view of all content
 * - Languages: Grid view of all languages
 * - Chapters: Grid view of chapters
 * - Units: Grid view of units
 * - Lessons: Grid view of lessons
 */
export default function LessonsManagementPage() {
  const intl = useIntl();
  const { getToken } = useAuth();

  // Main state for loading and active tab
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tree");

  // Data state - contains all languages with nested structure
  const [data, setData] = useState<{ languages: Language[] }>({
    languages: [],
  });
  const [selectedLanguage, setSelectedLanguage] = useState<string>();

  // Dialog visibility states
  const [isLanguageDialogOpen, setIsLanguageDialogOpen] = useState(false);
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isExerciseDialogOpen, setIsExerciseDialogOpen] = useState(false);

  // Edit dialog states
  const [isEditLanguageDialogOpen, setIsEditLanguageDialogOpen] =
    useState(false);
  const [isEditChapterDialogOpen, setIsEditChapterDialogOpen] = useState(false);
  const [isEditUnitDialogOpen, setIsEditUnitDialogOpen] = useState(false);
  const [isEditLessonDialogOpen, setIsEditLessonDialogOpen] = useState(false);

  // Delete dialog states
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteChapterDialogOpen, setIsDeleteChapterDialogOpen] =
    useState(false);
  const [isDeleteUnitDialogOpen, setIsDeleteUnitDialogOpen] = useState(false);

  // Items to be deleted
  const [languageToDelete, setLanguageToDelete] = useState<Language | null>(
    null
  );
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  // Form states for new items
  const [newLanguage, setNewLanguage] = useState<NewLanguageForm>(() =>
    createInitialLanguage()
  );

  const [newChapter, setNewChapter] = useState({
    title: "",
    description: "",
    isPremium: false,
    isExpanded: false,
    imageUrl: "",
    order: 1,
  });

  const [newUnit, setNewUnit] = useState({
    chapterId: "",
    title: "",
    description: "",
    isExpanded: false,
    isPremium: false,
    imageUrl: "",
    isActive: true,
    order: 1,
  });

  const [newLesson, setNewLesson] = useState({
    chapterId: "",
    unitId: "",
    title: "",
    description: "",
    isPremium: false,
    isTest: false,
    isActive: false,
    xpReward: 10,
    valuePointsReward: 0,
    moralValue: "kindness" as const,
    teachingPhase: "teach" as const,
    pedagogyFocus: "",
    moralStory: {
      title: "",
      text: "",
      placement: "post_lesson" as const,
    },
    imageUrl: "",
    order: 1,
  });

  const [newExercise, setNewExercise] = useState<NewExerciseForm>(() =>
    createInitialExercise()
  );

  // Edit form states
  const [editingLanguage, setEditingLanguage] = useState<Language>();
  const [editingChapter, setEditingChapter] = useState<Chapter>();
  const [editingUnit, setEditingUnit] = useState<Unit>();
  const [editingLesson, setEditingLesson] = useState<Lesson>();

  // Get current language data
  const currentLanguage = Array.isArray(data.languages)
    ? data.languages.find((lang) => lang._id === selectedLanguage)
    : undefined;

  /**
   * Fetches all lessons data from the API
   * This includes the complete hierarchy: Languages -> Chapters -> Units -> Lessons
   */
  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await apiClient.get(`/api/admin/lessons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          action: "aggregate",
        },
      });

      if (response.data?.languages) {
        const languagesArray = response.data.languages;
        setData({ languages: languagesArray });
        setSelectedLanguage((previous) => {
          if (previous && languagesArray.some((lang: Language) => lang._id === previous)) {
            return previous;
          }
          return languagesArray[0]?._id || "";
        });
      } else {
        toast.error(
          intl.formatMessage({
            id: "admin.lessons.error.invalidData",
            defaultMessage: "Sunucudan geçersiz veri biçimi alındı",
          })
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(
        intl.formatMessage({
          id: "admin.lessons.error.fetchFailed",
          defaultMessage: "Ders verileri alınamadı",
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [getToken, intl]);

  const overviewStats = useMemo(() => {
    const programs = data.languages.length;

    let chapters = 0;
    let units = 0;
    let lessons = 0;
    let exercises = 0;

    data.languages.forEach((language) => {
      chapters += language.chapters.length;
      language.chapters.forEach((chapter) => {
        units += chapter.units.length;
        chapter.units.forEach((unit) => {
          lessons += unit.lessons.length;
          unit.lessons.forEach((lesson) => {
            exercises += lesson.exercises?.length ?? 0;
          });
        });
      });
    });

    return { programs, chapters, units, lessons, exercises };
  }, [data.languages]);

  const selectedProgramStats = useMemo(() => {
    if (!currentLanguage) {
      return { chapters: 0, units: 0, lessons: 0, tests: 0 };
    }

    const chapters = currentLanguage.chapters.length;
    let units = 0;
    let lessons = 0;
    let tests = 0;

    currentLanguage.chapters.forEach((chapter) => {
      units += chapter.units.length;
      chapter.units.forEach((unit) => {
        lessons += unit.lessons.length;
        tests += unit.lessons.filter((lesson) => lesson.isTest).length;
      });
    });

    return { chapters, units, lessons, tests };
  }, [currentLanguage]);

  /**
   * Handles API errors and displays appropriate toast messages
   * @param err - The error object from the API call
   */
  const handleApiError = (err: unknown) => {
    const error = err as AxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
    }>;

    const apiErrors = error.response?.data?.errors;
    const message = error.response?.data?.message;

    if (apiErrors && typeof apiErrors === "object") {
      Object.entries(apiErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) => toast.error(`${field}: ${msg}`));
        }
      });
    } else {
      if (message) {
        if (message.toLowerCase().includes("already exists")) {
          toast.error(
            intl.formatMessage({
              id: "admin.lessons.error.languageExists",
              defaultMessage:
                "Seçilen site dili için bu program zaten mevcut.",
            })
          );
          return;
        }

        toast.error(message);
        return;
      }

      toast.error(
        intl.formatMessage({
          id: "admin.lessons.error.unknown",
          defaultMessage: "Bilinmeyen bir hata oluştu",
        })
      );
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  return (
    <>
      <Loading isLoading={isLoading} />
      <div className="mx-auto w-full max-w-[1500px] space-y-6">
        {/* Page Header */}
        <div className="rounded-xl border bg-gradient-to-b from-card to-card/95 p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                <FormattedMessage
                  id="admin.lessons.title"
                  defaultMessage="Program Yönetimi"
                />
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
                <FormattedMessage
                  id="admin.lessons.subtitle"
                  defaultMessage="Basit ve yönetilebilir akış: Program → Bölüm → Ünite → Ders"
                />
              </p>
            </div>

            <div className="flex w-full flex-wrap gap-2 lg:w-auto lg:justify-end">
              <Button
                className="w-full sm:w-auto"
                variant="outline"
                onClick={() => setActiveTab("tree")}
              >
                <Layers className="mr-2 h-4 w-4" />
                <FormattedMessage
                  id="admin.lessons.gotoTree"
                  defaultMessage="Yetenek Ağacında Yönet"
                />
              </Button>
              <Button
                className="w-full sm:w-auto"
                onClick={() => setIsLanguageDialogOpen(true)}
              >
                <Globe className="mr-2 h-4 w-4" />
                <FormattedMessage
                  id="admin.lessons.addLanguage"
                  defaultMessage="Program Ekle"
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1 pb-2">
              <CardDescription>
                <FormattedMessage
                  id="admin.lessons.stats.programs"
                  defaultMessage="Programlar"
                />
              </CardDescription>
              <CardTitle className="text-2xl">{overviewStats.programs}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1 pb-2">
              <CardDescription>
                <FormattedMessage
                  id="admin.lessons.stats.chapters"
                  defaultMessage="Bölümler"
                />
              </CardDescription>
              <CardTitle className="text-2xl">{overviewStats.chapters}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1 pb-2">
              <CardDescription>
                <FormattedMessage
                  id="admin.lessons.stats.units"
                  defaultMessage="Üniteler"
                />
              </CardDescription>
              <CardTitle className="text-2xl">{overviewStats.units}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1 pb-2">
              <CardDescription>
                <FormattedMessage
                  id="admin.lessons.stats.lessons"
                  defaultMessage="Dersler"
                />
              </CardDescription>
              <CardTitle className="text-2xl">{overviewStats.lessons}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="col-span-2 overflow-hidden xl:col-span-1">
            <CardHeader className="space-y-1 pb-2">
              <CardDescription>
                <FormattedMessage
                  id="admin.lessons.stats.exercises"
                  defaultMessage="Egzersizler"
                />
              </CardDescription>
              <CardTitle className="text-2xl">{overviewStats.exercises}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                <FormattedMessage
                  id="admin.lessons.selectedProgramSnapshot"
                  defaultMessage="Seçili Program Özeti"
                />
              </CardTitle>
              <CardDescription>
                {currentLanguage ? (
                  <span>{currentLanguage.name}</span>
                ) : (
                  <FormattedMessage
                    id="admin.lessons.selectProgramHint"
                    defaultMessage="Özet görmek için bir program seç."
                  />
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  <FormattedMessage
                    id="admin.lessons.stats.chapters"
                    defaultMessage="Bölümler"
                  />
                </span>
                <span className="font-semibold">{selectedProgramStats.chapters}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  <FormattedMessage
                    id="admin.lessons.stats.units"
                    defaultMessage="Üniteler"
                  />
                </span>
                <span className="font-semibold">{selectedProgramStats.units}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  <FormattedMessage
                    id="admin.lessons.stats.lessons"
                    defaultMessage="Dersler"
                  />
                </span>
                <span className="font-semibold">{selectedProgramStats.lessons}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  <FormattedMessage
                    id="admin.lessons.stats.tests"
                    defaultMessage="Test Dersleri"
                  />
                </span>
                <span className="font-semibold">{selectedProgramStats.tests}</span>
              </div>
              <div className="pt-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => setActiveTab("tree")}
                >
                  <BookOpenCheck className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.lessons.gotoTree"
                    defaultMessage="Yetenek Ağacında Yönet"
                  />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <FormattedMessage
                  id="admin.lessons.quickGuide"
                  defaultMessage="Hızlı Yönetim Akışı"
                />
              </CardTitle>
              <CardDescription>
                <FormattedMessage
                  id="admin.lessons.quickGuide.subtitle"
                  defaultMessage="Yeni bir içerik seti oluştururken bu sırayı takip edin."
                />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">1. Program oluştur</p>
                <p className="text-xs text-muted-foreground">
                  Kategori, hedef yaş ve temel dil seçerek başlangıç yapın.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">2. Bölüm ve Ünite ekle</p>
                <p className="text-xs text-muted-foreground">
                  İçeriği mantıksal gruplara bölüp öğrenme adımlarını netleştirin.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">3. Dersleri ve egzersizleri tamamla</p>
                <p className="text-xs text-muted-foreground">
                  Ders başına hedef XP belirleyin, ardından egzersizleri sıralayın.
                </p>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setActiveTab("lessons")}
              >
                <ListChecks className="mr-2 h-4 w-4" />
                <FormattedMessage
                  id="admin.lessons.gotoLessonsTab"
                  defaultMessage="Ders Sekmesine Geç"
                />
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs Interface */}
        <Tabs
          defaultValue="tree"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="flex h-auto w-full flex-nowrap gap-1 overflow-x-auto rounded-xl border bg-muted/30 p-1">
            <TabsTrigger className="whitespace-nowrap" value="tree">
              <FormattedMessage
                id="admin.lessons.tabs.skillTree"
                defaultMessage="Ağaç Görünümü"
              />
            </TabsTrigger>
            <TabsTrigger className="whitespace-nowrap" value="languages">
              <FormattedMessage
                id="admin.lessons.tabs.languages"
                defaultMessage="Programlar"
              />
            </TabsTrigger>
            <TabsTrigger className="whitespace-nowrap" value="chapters">
              <FormattedMessage
                id="admin.lessons.tabs.chapters"
                defaultMessage="Bölümler"
              />
            </TabsTrigger>
            <TabsTrigger className="whitespace-nowrap" value="units">
              <FormattedMessage
                id="admin.lessons.tabs.units"
                defaultMessage="Üniteler"
              />
            </TabsTrigger>
            <TabsTrigger className="whitespace-nowrap" value="lessons">
              <FormattedMessage
                id="admin.lessons.tabs.lessons"
                defaultMessage="Dersler"
              />
            </TabsTrigger>
          </TabsList>

          {/* Skill Tree Tab - Hierarchical view */}
          <TabsContent
            value="tree"
            className="space-y-4 rounded-xl border bg-card p-3 sm:p-4"
          >
            {data.languages.length === 0 ? (
              <div className="text-center p-12 border rounded-md">
                <div className="inline-flex h-20 w-20 rounded-full bg-slate-100 items-center justify-center mb-4">
                  <Globe className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium">
                  <FormattedMessage
                    id="admin.lessons.noLanguages.title"
                    defaultMessage="Henüz program yok"
                  />
                </h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  <FormattedMessage
                    id="admin.lessons.noLanguages.subtitle"
                    defaultMessage="İlk programı ekleyerek başlayın."
                  />
                </p>
                <Button onClick={() => setIsLanguageDialogOpen(true)}>
                  <Globe className="mr-2 h-4 w-4" />
                  <FormattedMessage
                    id="admin.lessons.addLanguage"
                    defaultMessage="Program Ekle"
                  />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Language Selector */}
                <LanguageSelector
                  languages={data.languages}
                  selectedLanguage={selectedLanguage}
                  onLanguageSelect={setSelectedLanguage}
                />

                {/* Skill Tree View */}
                <SkillTreeView
                  currentLanguage={currentLanguage}
                  data={data}
                  setData={setData}
                  selectedLanguage={selectedLanguage}
                  onEditLanguage={(language) => {
                    setEditingLanguage(language);
                    setIsEditLanguageDialogOpen(true);
                  }}
                  onAddChapter={() => setIsChapterDialogOpen(true)}
                  onEditChapter={(chapter) => {
                    setEditingChapter(chapter);
                    setIsEditChapterDialogOpen(true);
                  }}
                  onDeleteChapter={(chapter) => {
                    setChapterToDelete(chapter);
                    setIsDeleteChapterDialogOpen(true);
                  }}
                  onAddUnit={(chapterId) => {
                    setNewUnit({ ...newUnit, chapterId });
                    setIsUnitDialogOpen(true);
                  }}
                  onEditUnit={(unit, chapterId) => {
                    setEditingUnit({ ...unit, chapterId });
                    setIsEditUnitDialogOpen(true);
                  }}
                  onDeleteUnit={(unit, chapter) => {
                    setUnitToDelete(unit);
                    setChapterToDelete(chapter);
                    setIsDeleteUnitDialogOpen(true);
                  }}
                  onAddLesson={(chapterId, unitId) => {
                    setNewLesson({ ...newLesson, chapterId, unitId });
                    setIsLessonDialogOpen(true);
                  }}
                  onEditLesson={(lesson, chapterId, unitId) => {
                    setEditingLesson({ ...lesson, chapterId, unitId });
                    setIsEditLessonDialogOpen(true);
                  }}
                  onDeleteLesson={(chapterId, unitId, lessonId) => {
                    // Handle lesson deletion
                    setData({
                      ...data,
                      languages: data.languages.map((lang) =>
                        lang._id === selectedLanguage
                          ? {
                              ...lang,
                              chapters: lang.chapters.map((chapter) =>
                                chapter._id === chapterId
                                  ? {
                                      ...chapter,
                                      units: chapter.units.map((unit) =>
                                        unit._id === unitId
                                          ? {
                                              ...unit,
                                              lessons: unit.lessons.filter(
                                                (lesson) =>
                                                  lesson._id !== lessonId
                                              ),
                                            }
                                          : unit
                                      ),
                                    }
                                  : chapter
                              ),
                            }
                          : lang
                      ),
                    });
                  }}
                  onAddExercise={(chapterId, unitId, lessonId) => {
                    setNewExercise({
                      ...createInitialExercise(currentLanguage),
                      lessonId: `${chapterId}-${unitId}-${lessonId}`,
                    });
                    setIsExerciseDialogOpen(true);
                  }}
                />
              </div>
            )}
          </TabsContent>

          {/* Languages Tab - Grid view of all languages */}
          <TabsContent
            value="languages"
            className="space-y-4 rounded-xl border bg-card p-3 sm:p-4"
          >
            <LanguagesGridView
              languages={data.languages}
              onAddLanguage={() => setIsLanguageDialogOpen(true)}
              onEditLanguage={(language) => {
                setEditingLanguage(language);
                setIsEditLanguageDialogOpen(true);
              }}
              onDeleteLanguage={(language) => {
                setLanguageToDelete(language);
                setIsDeleteDialogOpen(true);
              }}
            />
          </TabsContent>

          {/* Chapters Tab - Grid view of chapters */}
          <TabsContent
            value="chapters"
            className="space-y-4 rounded-xl border bg-card p-3 sm:p-4"
          >
            <ChaptersGridView
              currentLanguage={currentLanguage}
              onAddChapter={() => setIsChapterDialogOpen(true)}
              onEditChapter={(chapter) => {
                setEditingChapter(chapter);
                setIsEditChapterDialogOpen(true);
              }}
              onDeleteChapter={(chapter) => {
                setChapterToDelete(chapter);
                setIsDeleteChapterDialogOpen(true);
              }}
            />
          </TabsContent>

          {/* Units Tab - Grid view of units */}
          <TabsContent
            value="units"
            className="space-y-4 rounded-xl border bg-card p-3 sm:p-4"
          >
            <UnitsGridView
              currentLanguage={currentLanguage}
              onAddUnit={() => setIsUnitDialogOpen(true)}
              onEditUnit={(unit, chapterId) => {
                setEditingUnit({ ...unit, chapterId });
                setIsEditUnitDialogOpen(true);
              }}
              onDeleteUnit={(unit, chapter) => {
                setUnitToDelete(unit);
                setChapterToDelete(chapter);
                setIsDeleteUnitDialogOpen(true);
              }}
            />
          </TabsContent>

          {/* Lessons Tab - Grid view of lessons */}
          <TabsContent
            value="lessons"
            className="space-y-4 rounded-xl border bg-card p-3 sm:p-4"
          >
            <LessonsGridView
              currentLanguage={currentLanguage}
              onAddLesson={() => setIsLessonDialogOpen(true)}
              onEditLesson={(lesson, chapterId, unitId) => {
                setEditingLesson({ ...lesson, chapterId, unitId });
                setIsEditLessonDialogOpen(true);
              }}
              onDeleteLesson={(chapterId, unitId, lessonId) => {
                // Handle lesson deletion
                setData({
                  ...data,
                  languages: data.languages.map((lang) =>
                    lang._id === selectedLanguage
                      ? {
                          ...lang,
                          chapters: lang.chapters.map((chapter) =>
                            chapter._id === chapterId
                              ? {
                                  ...chapter,
                                  units: chapter.units.map((unit) =>
                                    unit._id === unitId
                                      ? {
                                          ...unit,
                                          lessons: unit.lessons.filter(
                                            (lesson) => lesson._id !== lessonId
                                          ),
                                        }
                                      : unit
                                  ),
                                }
                              : chapter
                          ),
                        }
                      : lang
                  ),
                });
                toast.success(
                  intl.formatMessage({
                    id: "admin.lessons.success.lessonDeleted",
                    defaultMessage: "Ders başarıyla silindi",
                  })
                );
              }}
            />
          </TabsContent>
        </Tabs>

        {/* All Dialog Components */}
        <LanguageDialog
          isOpen={isLanguageDialogOpen}
          onClose={() => setIsLanguageDialogOpen(false)}
          newLanguage={newLanguage}
          setNewLanguage={setNewLanguage}
          existingLanguages={data.languages}
          onSubmit={async () => {
            setIsLoading(true);
            try {
              const token = await getToken();
              const response = await apiClient.post(
                `/api/admin/languages`,
                {
                  baseLanguage: newLanguage.baseLanguage,
                  flag: newLanguage.flag,
                  isActive: newLanguage.isActive,
                  name: newLanguage.name,
                  nativeName: newLanguage.nativeName,
                  imageUrl: newLanguage.imageUrl,
                  category: newLanguage.category,
                  themeMetadata: newLanguage.themeMetadata,
                  locale: newLanguage.locale,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (response.status === 201) {
                setData({
                  ...data,
                  languages: [
                    ...data.languages,
                    {
                      ...response.data.data,
                      chapters: [],
                    },
                  ],
                });
                toast.success(
                  intl.formatMessage({
                    id: "admin.lessons.success.languageCreated",
                    defaultMessage: "Program başarıyla oluşturuldu",
                  })
                );
              }
            } catch (err) {
              handleApiError(err);
            } finally {
              setNewLanguage(createInitialLanguage(newLanguage.locale));
              setIsLoading(false);
            }
          }}
          isLoading={isLoading}
          isEdit={false}
        />

        {/* Edit Language Dialog */}
        <LanguageDialog
          isOpen={isEditLanguageDialogOpen}
          onClose={() => setIsEditLanguageDialogOpen(false)}
          newLanguage={editingLanguage || newLanguage}
          setNewLanguage={setEditingLanguage}
          existingLanguages={data.languages}
          onSubmit={async () => {
            setIsLoading(true);
            try {
              const token = await getToken();
              const response = await apiClient.put(
                `/api/admin/languages/${editingLanguage?._id}`,
                {
                  baseLanguage: editingLanguage?.baseLanguage,
                  flag: editingLanguage?.flag,
                  isActive: editingLanguage?.isActive,
                  name: editingLanguage?.name,
                  nativeName: editingLanguage?.nativeName,
                  imageUrl: editingLanguage?.imageUrl,
                  category: editingLanguage?.category,
                  themeMetadata:
                    editingLanguage?.themeMetadata ?? createDefaultThemeMetadata(),
                  locale: editingLanguage?.locale ?? i18n.defaultLocale,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.status === 200) {
                setData({
                  ...data,
                  languages: data.languages.map((lang) =>
                    lang._id === editingLanguage?._id
                      ? {
                          ...lang,
                          ...response.data.data,
                        }
                      : lang
                  ),
                });
                toast.success(
                  intl.formatMessage({
                    id: "admin.lessons.success.languageUpdated",
                    defaultMessage: "Program başarıyla güncellendi",
                  })
                );
              }
            } catch (err) {
              handleApiError(err);
            } finally {
              setIsLoading(false);
              setEditingLanguage(undefined);
              setIsEditLanguageDialogOpen(false);
            }
          }}
          isLoading={isLoading}
          isEdit={true}
        />

        {/* Chapter Dialog */}
        <ChapterDialog
          isOpen={isChapterDialogOpen}
          onClose={() => setIsChapterDialogOpen(false)}
          newChapter={newChapter}
          setNewChapter={setNewChapter}
          currentLanguage={currentLanguage}
          onSubmit={async () => {
            setIsLoading(true);
            try {
              const token = await getToken();
              const response = await apiClient.post(
                `/api/admin/chapters`,
                {
                  languageId: selectedLanguage,
                  title: newChapter.title,
                  description: newChapter.description,
                  isPremium: newChapter.isPremium ?? false,
                  isExpanded: newChapter.isExpanded ?? false,
                  imageUrl: newChapter.imageUrl || "",
                  order: newChapter.order ?? 0,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.status === 201) {
                const languageIndex = data.languages.findIndex(
                  (lang) => lang._id === selectedLanguage
                );
                if (languageIndex !== -1) {
                  setData({
                    ...data,
                    languages: data.languages.map((lang, index) =>
                      index === languageIndex
                        ? {
                            ...lang,
                            chapters: [
                              ...lang.chapters,
                              {
                                ...response.data.data,
                                units: [],
                              },
                            ],
                          }
                        : lang
                    ),
                  });
                }
                toast.success(
                  intl.formatMessage({
                    id: "admin.lessons.success.chapterCreated",
                    defaultMessage: "Bölüm başarıyla oluşturuldu",
                  })
                );
              }
            } catch (err) {
              handleApiError(err);
            } finally {
              setNewChapter({
                title: "",
                description: "",
                isPremium: false,
                isExpanded: false,
                imageUrl: "",
                order: 1,
              });
              setIsChapterDialogOpen(false);
              setIsLoading(false);
            }
          }}
          isLoading={isLoading}
          isEdit={false}
        />

        {/* Unit Dialog */}
        <UnitDialog
          isOpen={isUnitDialogOpen}
          onClose={() => setIsUnitDialogOpen(false)}
          newUnit={newUnit}
          setNewUnit={setNewUnit}
          currentLanguage={currentLanguage}
          onSubmit={async () => {
            setIsLoading(true);
            try {
              const token = await getToken();
              const response = await apiClient.post(
                `/api/admin/units`,
                {
                  languageId: selectedLanguage,
                  chapterId: newUnit.chapterId,
                  title: newUnit.title,
                  description: newUnit.description,
                  isPremium: newUnit.isPremium ?? false,
                  isExpanded: newUnit.isExpanded ?? false,
                  imageUrl: newUnit.imageUrl || "",
                  order: newUnit.order ?? 0,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.status === 201) {
                const languageIndex = data.languages.findIndex(
                  (lang) => lang._id === selectedLanguage
                );
                if (languageIndex !== -1) {
                  const chapterIndex = data.languages[
                    languageIndex
                  ].chapters.findIndex(
                    (chapter) => chapter._id === String(newUnit.chapterId)
                  );
                  if (chapterIndex !== -1) {
                    setData({
                      ...data,
                      languages: data.languages.map((lang, lIndex) =>
                        lIndex === languageIndex
                          ? {
                              ...lang,
                              chapters: lang.chapters.map((chapter, cIndex) =>
                                cIndex === chapterIndex
                                  ? {
                                      ...chapter,
                                      units: [
                                        ...chapter.units,
                                        {
                                          ...response.data.data,
                                          lessons: [],
                                        },
                                      ],
                                    }
                                  : chapter
                              ),
                            }
                          : lang
                      ),
                    });
                  }
                }
                toast.success(
                  intl.formatMessage({
                    id: "admin.lessons.success.unitCreated",
                    defaultMessage: "Ünite başarıyla oluşturuldu",
                  })
                );
              }
            } catch (err) {
              handleApiError(err);
            } finally {
              setNewUnit({
                chapterId: "",
                title: "",
                description: "",
                isPremium: false,
                isExpanded: false,
                imageUrl: "",
                isActive: true,
                order: 1,
              });
              setIsUnitDialogOpen(false);
              setIsLoading(false);
            }
          }}
          isLoading={isLoading}
          isEdit={false}
        />

        {/* Lesson Dialog */}
        <LessonDialog
          isOpen={isLessonDialogOpen}
          onClose={() => setIsLessonDialogOpen(false)}
          newLesson={newLesson}
          setNewLesson={setNewLesson}
          currentLanguage={currentLanguage}
          onSubmit={async () => {
            setIsLoading(true);
            try {
              const token = await getToken();
              const response = await apiClient.post(
                `/api/admin/lessons`,
                {
                  languageId: selectedLanguage,
                  chapterId: newLesson.chapterId,
                  unitId: newLesson.unitId,
                  title: newLesson.title,
                  description: newLesson.description,
                  isPremium: newLesson.isPremium ?? false,
                  isActive: newLesson.isActive ?? true,
                  isTest: newLesson.isTest ?? false,
                  xpReward: newLesson.xpReward ?? 0,
                  valuePointsReward: newLesson.valuePointsReward ?? 0,
                  moralValue: newLesson.moralValue,
                  teachingPhase: newLesson.teachingPhase,
                  pedagogyFocus: newLesson.pedagogyFocus ?? "",
                  moralStory: newLesson.moralStory,
                  imageUrl: newLesson.imageUrl || "",
                  order: newLesson.order ?? 0,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.status === 201) {
                const languageIndex = data.languages.findIndex(
                  (lang) => lang._id === selectedLanguage
                );
                if (languageIndex !== -1) {
                  const chapterIndex = data.languages[
                    languageIndex
                  ].chapters.findIndex(
                    (chapter) => chapter._id === newLesson.chapterId
                  );
                  if (chapterIndex !== -1) {
                    const unitIndex = data.languages[languageIndex].chapters[
                      chapterIndex
                    ].units.findIndex((unit) => unit._id === newLesson.unitId);
                    if (unitIndex !== -1) {
                      setData({
                        ...data,
                        languages: data.languages.map((lang, lIndex) =>
                          lIndex === languageIndex
                            ? {
                                ...lang,
                                chapters: lang.chapters.map((chapter, cIndex) =>
                                  cIndex === chapterIndex
                                    ? {
                                        ...chapter,
                                        units: chapter.units.map(
                                          (unit, uIndex) =>
                                            uIndex === unitIndex
                                              ? {
                                                  ...unit,
                                                  lessons: [
                                                    ...unit.lessons,
                                                    {
                                                      ...response.data.data,
                                                    },
                                                  ],
                                                }
                                              : unit
                                        ),
                                      }
                                    : chapter
                                ),
                              }
                            : lang
                        ),
                      });
                    }
                  }
                }
                toast.success(
                  intl.formatMessage({
                    id: "admin.lessons.success.lessonCreated",
                    defaultMessage: "Ders başarıyla oluşturuldu",
                  })
                );
              }
            } catch (err) {
              handleApiError(err);
            } finally {
              setNewLesson({
                chapterId: "",
                unitId: "",
                title: "",
                description: "",
                isPremium: false,
                isTest: false,
                isActive: true,
                xpReward: 10,
                valuePointsReward: 0,
                moralValue: "kindness",
                teachingPhase: "teach",
                pedagogyFocus: "",
                moralStory: {
                  title: "",
                  text: "",
                  placement: "post_lesson",
                },
                imageUrl: "",
                order: 1,
              });
              setIsLessonDialogOpen(false);
              setIsLoading(false);
            }
          }}
          isLoading={isLoading}
          isEdit={false}
        />

        {/* Exercise Dialog */}
        <ExerciseDialog
          isOpen={isExerciseDialogOpen}
          onClose={() => setIsExerciseDialogOpen(false)}
          newExercise={newExercise}
          setNewExercise={setNewExercise}
          currentLanguage={currentLanguage}
          onSubmit={async () => {
            const [chapterId, unitId, lessonId] = newExercise.lessonId.split("-");
            const isEducation = newExercise.type.startsWith("education_");
            setIsLoading(true);
            try {
              const token = await getToken();
              const response = await apiClient.post(
                `/api/admin/exercises`,
                {
                  lessonId: lessonId,
                  unitId: unitId,
                  chapterId: chapterId,
                  languageId: selectedLanguage,
                  type: newExercise.type,
                  componentType: newExercise.componentType,
                  moralValue: newExercise.moralValue,
                  valuePoints: Number(newExercise.valuePoints || 0),
                  questionPreview: (newExercise.questionPreview || "").trim(),
                  instruction: isEducation ? "" : newExercise.instruction.trim(),
                  sourceText: isEducation ? "" : newExercise.sourceText.trim(),
                  sourceLanguage: (newExercise.sourceLanguage || "").toLowerCase(),
                  targetLanguage: (newExercise.targetLanguage || "").toLowerCase(),
                  correctAnswer: isEducation
                    ? []
                    : newExercise.correctAnswer.map((a) => a.trim()),
                  options: isEducation
                    ? []
                    : newExercise.options.map((opt) => opt.trim()).filter(Boolean),
                  isNewWord: isEducation ? false : newExercise.isNewWord,
                  audioUrl: isEducation ? "" : newExercise.audioUrl.trim(),
                  neutralAnswerImage: isEducation
                    ? newExercise.neutralAnswerImage?.trim() || ""
                    : newExercise.neutralAnswerImage.trim(),
                  badAnswerImage: isEducation
                    ? newExercise.badAnswerImage?.trim() || ""
                    : newExercise.badAnswerImage.trim(),
                  correctAnswerImage: isEducation
                    ? newExercise.correctAnswerImage?.trim() || ""
                    : newExercise.correctAnswerImage.trim(),
                  educationContent: isEducation ? newExercise.educationContent : undefined,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              if (response.status === 201) {
                const languageIndex = data.languages.findIndex(
                  (lang) => lang._id === selectedLanguage
                );
                if (languageIndex !== -1) {
                  const chapterIndex = data.languages[
                    languageIndex
                  ].chapters.findIndex((chapter) => chapter._id === chapterId);
                  if (chapterIndex !== -1) {
                    const unitIndex = data.languages[languageIndex].chapters[
                      chapterIndex
                    ].units.findIndex((unit) => unit._id === unitId);
                    if (unitIndex !== -1) {
                      const lessonIndex = data.languages[
                        languageIndex
                      ].chapters[chapterIndex].units[
                        unitIndex
                      ].lessons.findIndex((lesson) => lesson._id === lessonId);
                      if (lessonIndex !== -1) {
                        const created = (response.data && response.data.data) || response.data;
                        setData({
                          ...data,
                          languages: data.languages.map((lang, lIndex) =>
                            lIndex === languageIndex
                              ? {
                                  ...lang,
                                  chapters: lang.chapters.map(
                                    (chapter, cIndex) =>
                                      cIndex === chapterIndex
                                        ? {
                                            ...chapter,
                                            units: chapter.units.map(
                                              (unit, uIndex) =>
                                                uIndex === unitIndex
                                                  ? {
                                                      ...unit,
                                                      lessons: unit.lessons.map(
                                                        (lesson, lsnIndex) =>
                                                          lsnIndex ===
                                                          lessonIndex
                                                            ? {
                                                                ...lesson,
                                                                exercises: [
                                                                  ...(lesson.exercises ||
                                                                    []),
                                                                  created,
                                                                ],
                                                              }
                                                            : lesson
                                                      ),
                                                    }
                                                  : unit
                                            ),
                                          }
                                        : chapter
                                  ),
                                }
                              : lang
                          ),
                        });
                      }
                    }
                  }
                }
                toast.success(
                  intl.formatMessage({
                    id: "admin.lessons.success.exerciseCreated",
                    defaultMessage: "Egzersiz başarıyla oluşturuldu",
                  })
                );
              }
            } catch (err) {
              handleApiError(err);
            } finally {
              setNewExercise(createInitialExercise(currentLanguage));
              setIsExerciseDialogOpen(false);
              setIsLoading(false);
            }
          }}
          isLoading={isLoading}
          isEdit={false}
        />

        {/* Edit Chapter Dialog */}
        <ChapterDialog
          isOpen={isEditChapterDialogOpen}
          onClose={() => setIsEditChapterDialogOpen(false)}
          newChapter={editingChapter || newChapter}
          setNewChapter={setEditingChapter}
          currentLanguage={currentLanguage}
          onSubmit={async () => {
            setIsLoading(true);
            try {
              const token = await getToken();
              const response = await apiClient.put(
                `/api/admin/chapters/${editingChapter?._id}`,
                {
                  languageId: selectedLanguage,
                  title: editingChapter?.title,
                  description: editingChapter?.description,
                  isPremium: editingChapter?.isPremium ?? false,
                  isExpanded: editingChapter?.isExpanded ?? false,
                  imageUrl: editingChapter?.imageUrl || "",
                  order: editingChapter?.order ?? 0,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.status === 200) {
                setData({
                  ...data,
                  languages: data.languages.map((lang) =>
                    lang._id === selectedLanguage
                      ? {
                          ...lang,
                          chapters: lang.chapters.map((chapter) =>
                            chapter._id === editingChapter?._id
                              ? {
                                  ...chapter,
                                  ...response.data.data,
                                }
                              : chapter
                          ),
                        }
                      : lang
                  ),
                });
                toast.success(
                  intl.formatMessage({
                    id: "admin.lessons.success.chapterUpdated",
                    defaultMessage: "Bölüm başarıyla güncellendi",
                  })
                );
              }
            } catch (err) {
              handleApiError(err);
            } finally {
              setIsLoading(false);
              setEditingChapter(undefined);
              setIsEditChapterDialogOpen(false);
            }
          }}
          isLoading={isLoading}
          isEdit={true}
        />

        {/* Edit Unit Dialog */}
        <UnitDialog
          isOpen={isEditUnitDialogOpen}
          onClose={() => setIsEditUnitDialogOpen(false)}
          newUnit={editingUnit || newUnit}
          setNewUnit={setEditingUnit}
          currentLanguage={currentLanguage}
          onSubmit={async () => {
            setIsLoading(true);
            try {
              const token = await getToken();
              const response = await apiClient.put(
                `/api/admin/units/${editingUnit?._id}`,
                {
                  languageId: selectedLanguage,
                  chapterId: editingUnit?.chapterId,
                  title: editingUnit?.title,
                  description: editingUnit?.description,
                  isPremium: editingUnit?.isPremium ?? false,
                  isExpanded: editingUnit?.isExpanded ?? false,
                  imageUrl: editingUnit?.imageUrl || "",
                  order: editingUnit?.order ?? 0,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.status === 200) {
                setData({
                  ...data,
                  languages: data.languages.map((lang) =>
                    lang._id === selectedLanguage
                      ? {
                          ...lang,
                          chapters: lang.chapters.map((chapter) =>
                            chapter._id === editingUnit?.chapterId
                              ? {
                                  ...chapter,
                                  units: chapter.units.map((unit) =>
                                    unit._id === editingUnit?._id
                                      ? {
                                          ...unit,
                                          ...response.data.data,
                                        }
                                      : unit
                                  ),
                                }
                              : chapter
                          ),
                        }
                      : lang
                  ),
                });
                toast.success(
                  intl.formatMessage({
                    id: "admin.lessons.success.unitUpdated",
                    defaultMessage: "Ünite başarıyla güncellendi",
                  })
                );
              }
            } catch (err) {
              handleApiError(err);
            } finally {
              setIsLoading(false);
              setEditingUnit(undefined);
              setIsEditUnitDialogOpen(false);
            }
          }}
          isLoading={isLoading}
          isEdit={true}
        />

        {/* Edit Lesson Dialog */}
        <LessonDialog
          isOpen={isEditLessonDialogOpen}
          onClose={() => setIsEditLessonDialogOpen(false)}
          newLesson={editingLesson || newLesson}
          setNewLesson={setEditingLesson}
          currentLanguage={currentLanguage}
          onSubmit={async () => {
            setIsLoading(true);
            try {
              const token = await getToken();
              const response = await apiClient.put(
                `/api/admin/lessons/${editingLesson?._id}`,
                {
                  languageId: selectedLanguage,
                  chapterId: editingLesson?.chapterId,
                  unitId: editingLesson?.unitId,
                  title: editingLesson?.title,
                  description: editingLesson?.description,
                  isPremium: editingLesson?.isPremium ?? false,
                  isActive: editingLesson?.isActive ?? true,
                  imageUrl: editingLesson?.imageUrl || "",
                  order: editingLesson?.order ?? 0,
                  isTest: editingLesson?.isTest ?? false,
                  xpReward: editingLesson?.xpReward ?? 0,
                  valuePointsReward: editingLesson?.valuePointsReward ?? 0,
                  moralValue: editingLesson?.moralValue ?? "kindness",
                  teachingPhase: editingLesson?.teachingPhase ?? "teach",
                  pedagogyFocus: editingLesson?.pedagogyFocus ?? "",
                  moralStory: editingLesson?.moralStory ?? {
                    title: "",
                    text: "",
                    placement: "post_lesson",
                  },
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.status === 200) {
                setData({
                  ...data,
                  languages: data.languages.map((lang) =>
                    lang._id === selectedLanguage
                      ? {
                          ...lang,
                          chapters: lang.chapters.map((chapter) =>
                            chapter._id === editingLesson?.chapterId
                              ? {
                                  ...chapter,
                                  units: chapter.units.map((unit) =>
                                    unit._id === editingLesson?.unitId
                                      ? {
                                          ...unit,
                                          lessons: unit.lessons.map((lesson) =>
                                            lesson._id === editingLesson?._id
                                              ? {
                                                  ...lesson,
                                                  ...response.data.data,
                                                }
                                              : lesson
                                          ),
                                        }
                                      : unit
                                  ),
                                }
                              : chapter
                          ),
                        }
                      : lang
                  ),
                });
                toast.success(
                  intl.formatMessage({
                    id: "admin.lessons.success.lessonUpdated",
                    defaultMessage: "Ders başarıyla güncellendi",
                  })
                );
              }
            } catch (err) {
              handleApiError(err);
            } finally {
              setIsLoading(false);
              setEditingLesson(undefined);
              setIsEditLessonDialogOpen(false);
            }
          }}
          isLoading={isLoading}
          isEdit={true}
        />

        {/* Delete Language Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setLanguageToDelete(null);
          }}
          title={intl.formatMessage({
            id: "admin.lessons.delete.language.title",
            defaultMessage: "Programı Pasife Al",
          })}
          description={intl.formatMessage(
            {
              id: "admin.lessons.delete.language.description",
              defaultMessage:
                "'{name}' programını pasife almak istediğinize emin misiniz? Öğrenciler listelerde artık göremez.",
            },
            { name: languageToDelete?.name }
          )}
          onConfirm={async () => {
            if (!languageToDelete) {
              return;
            }

            setIsLoading(true);
            try {
              const token = await getToken();
              const response = await apiClient.delete(
                `/api/admin/languages/${languageToDelete._id}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.status === 200) {
                const updatedLanguages = data.languages.filter(
                  (language) => language._id !== languageToDelete._id
                );

                setData({ languages: updatedLanguages });

                if (updatedLanguages.length > 0) {
                  const hasSelected = updatedLanguages.some(
                    (language) => language._id === selectedLanguage
                  );
                  if (!hasSelected) {
                    setSelectedLanguage(updatedLanguages[0]._id);
                  }
                } else {
                  setSelectedLanguage("");
                }

                toast.success(
                  intl.formatMessage({
                    id: "admin.lessons.success.languageDeleted",
                    defaultMessage: "Program başarıyla pasife alındı",
                  })
                );
              }
            } catch (err) {
              handleApiError(err);
            } finally {
              setIsLoading(false);
              setLanguageToDelete(null);
              setIsDeleteDialogOpen(false);
            }
          }}
          isLoading={isLoading}
        />

        {/* Delete Chapter Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteChapterDialogOpen}
          onClose={() => setIsDeleteChapterDialogOpen(false)}
          title={intl.formatMessage({
            id: "admin.lessons.delete.chapter.title",
            defaultMessage: "Bölümü Sil",
          })}
          description={intl.formatMessage(
            {
              id: "admin.lessons.delete.chapter.description",
              defaultMessage:
                "'{name}' bölümünü silmek istediğinize emin misiniz? İçindeki tüm ünite ve dersler de silinecek.",
            },
            { name: chapterToDelete?.title }
          )}
          onConfirm={async () => {
            if (chapterToDelete) {
              setIsLoading(true);
              try {
                const token = await getToken();
                const response = await apiClient.delete(
                  `/api/admin/chapters/${chapterToDelete._id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (response.status === 200) {
                  setData({
                    ...data,
                    languages: data.languages.map((lang) =>
                      lang._id === selectedLanguage
                        ? {
                            ...lang,
                            chapters: lang.chapters.filter(
                              (chapter) => chapter._id !== chapterToDelete._id
                            ),
                          }
                        : lang
                    ),
                  });
                  toast.success(
                    intl.formatMessage({
                      id: "admin.lessons.success.chapterDeleted",
                      defaultMessage: "Bölüm başarıyla silindi",
                    })
                  );
                }
              } catch (err) {
                handleApiError(err);
              } finally {
                setIsLoading(false);
                setChapterToDelete(null);
              }
            }
            setIsDeleteChapterDialogOpen(false);
          }}
          isLoading={isLoading}
        />

        {/* Delete Unit Dialog */}
        <DeleteConfirmationDialog
          isOpen={isDeleteUnitDialogOpen}
          onClose={() => setIsDeleteUnitDialogOpen(false)}
          title={intl.formatMessage({
            id: "admin.lessons.delete.unit.title",
            defaultMessage: "Üniteyi Sil",
          })}
          description={intl.formatMessage(
            {
              id: "admin.lessons.delete.unit.description",
              defaultMessage:
                "'{name}' ünitesini silmek istediğinize emin misiniz? İçindeki tüm dersler de silinecek.",
            },
            { name: unitToDelete?.title }
          )}
          onConfirm={async () => {
            if (unitToDelete && chapterToDelete) {
              setIsLoading(true);
              try {
                const token = await getToken();
                const response = await apiClient.delete(
                  `/api/admin/units/${unitToDelete._id}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                if (response.status === 200) {
                  setData({
                    ...data,
                    languages: data.languages.map((lang) =>
                      lang._id === selectedLanguage
                        ? {
                            ...lang,
                            chapters: lang.chapters.map((chapter) =>
                              chapter._id === chapterToDelete._id
                                ? {
                                    ...chapter,
                                    units: chapter.units.filter(
                                      (unit) => unit._id !== unitToDelete._id
                                    ),
                                  }
                                : chapter
                            ),
                          }
                        : lang
                    ),
                  });
                  toast.success(
                    intl.formatMessage({
                      id: "admin.lessons.success.unitDeleted",
                      defaultMessage: "Ünite başarıyla silindi",
                    })
                  );
                }
              } catch (err) {
                handleApiError(err);
              } finally {
                setIsLoading(false);
                setUnitToDelete(null);
                setChapterToDelete(null);
              }
            }
            setIsDeleteUnitDialogOpen(false);
          }}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}
