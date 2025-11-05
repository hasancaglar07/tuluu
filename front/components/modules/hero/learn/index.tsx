"use client";

import Container from "@/components/custom/container";
import Loading from "@/components/custom/loading";
import { useAppDispatch } from "@/store";
import { fetchLessons } from "@/store/lessonsSlice";
import { fetchUserProgress } from "@/store/progressSlice";
import { fetchSettings } from "@/store/settingsSlice";
import { fetchUserData } from "@/store/userSlice";
import type { Language, LanguageCategory } from "@/types";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { apiClient } from "@/lib/api-client";
import useSWR from "swr";
import CategoryBadge from "@/components/custom/category-badge";
import { i18n } from "@/i18n-config";

// SWR fetcher function
const fetchLanguages = async (
  getToken: () => Promise<string | null>,
  locale: string
): Promise<Language[]> => {
  const token = await getToken();
  const response = await apiClient.get(
    `/api/public/lessons?action=learn&locale=${locale}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.languages || [];
};

const CATEGORY_ORDER: LanguageCategory[] = [
  "faith_morality",
  "quran_arabic",
  "math_logic",
  "science_discovery",
  "language_learning",
  "mental_spiritual",
  "personal_social",
];

const CATEGORY_ICONS: Record<LanguageCategory, string> = {
  faith_morality: "🕋",
  quran_arabic: "📖",
  math_logic: "➕",
  science_discovery: "🔭",
  language_learning: "🗣️",
  mental_spiritual: "🌿",
  personal_social: "👭",
};

type CategoryFilter = LanguageCategory | "all";

const formatLabel = (value?: string | null) => {
  if (!value) return "";
  return value
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function LanguagesToLearn({
  initialCategory = "all",
}: {
  initialCategory?: string | null;
}) {
  const { userId, getToken } = useAuth();
  const params = useParams();
  const localeParam = params?.locale;
  const currentLocale = (
    Array.isArray(localeParam) ? localeParam[0] : (localeParam as string)
  ) || i18n.defaultLocale;
  const [isLoading, setIsLoading] = useState(false);
  const normalizedCategory = (initialCategory ?? "all") as CategoryFilter;
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>(
    normalizedCategory
  );
  const [viewMode, setViewMode] = useState<"categories" | "programs">(
    normalizedCategory !== "all" ? "programs" : "categories"
  );

  const router = useLocalizedRouter();
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const {
    data: languages,
    error,
    isLoading: loadingLanguages,
    mutate,
  } = useSWR(
    currentLocale ? ["/api/public/lessons", currentLocale] : null,
    () => fetchLanguages(getToken, currentLocale)
  );

  useEffect(() => {
    setSelectedCategory(normalizedCategory);
    setViewMode(normalizedCategory !== "all" ? "programs" : "categories");
  }, [normalizedCategory]);

  const availableCategories = useMemo(() => {
    if (!languages || languages.length === 0) {
      return [] as LanguageCategory[];
    }

    const found = new Set<LanguageCategory>();
    languages.forEach((language) => {
      found.add(language.category);
    });

    const ordered = CATEGORY_ORDER.filter((category) => found.has(category));
    const extras = Array.from(found).filter(
      (category) => !CATEGORY_ORDER.includes(category)
    );

    return [...ordered, ...extras];
  }, [languages]);

  useEffect(() => {
    if (selectedCategory === "all" || availableCategories.length === 0) {
      return;
    }

    if (!availableCategories.includes(selectedCategory)) {
      setSelectedCategory("all");
    }
  }, [availableCategories, selectedCategory]);

  const groupedLanguages = useMemo(() => {
    if (!languages) {
      return {} as Record<LanguageCategory, Language[]>;
    }

    const buckets = languages.reduce((acc, language) => {
      const key = language.category;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(language);
      return acc;
    }, {} as Record<LanguageCategory, Language[]>);

    Object.values(buckets).forEach((list) =>
      list.sort((a, b) => a.name.localeCompare(b.name))
    );

    return buckets;
  }, [languages]);

  const categoriesToRender =
    selectedCategory === "all"
      ? availableCategories
      : availableCategories.filter((category) => category === selectedCategory);

  const categorySummaries = useMemo(() => {
    const orderedSummary: LanguageCategory[] = [
      ...CATEGORY_ORDER.filter((category) =>
        Boolean(groupedLanguages[category]?.length)
      ),
      ...Object.keys(groupedLanguages).filter(
        (category) =>
          !CATEGORY_ORDER.includes(category as LanguageCategory) &&
          groupedLanguages[category as LanguageCategory]?.length
      ),
    ] as LanguageCategory[];

    return orderedSummary.map((category) => {
      const programs = groupedLanguages[category] || [];

      const lessonTotal = programs.reduce((lessonAcc, language) => {
        if (!language.chapters || language.chapters.length === 0) {
          return lessonAcc;
        }

        const lessonsInLanguage = language.chapters.reduce(
          (chapterAcc, chapter) => {
            if (!chapter.units || chapter.units.length === 0) {
              return chapterAcc;
            }

            const lessonsInChapter = chapter.units.reduce((unitAcc, unit) => {
              return unitAcc + (unit.lessons?.length ?? 0);
            }, 0);

            return chapterAcc + lessonsInChapter;
          },
          0
        );

        return lessonAcc + lessonsInLanguage;
      }, 0);

      return {
        category,
        programs,
        programCount: programs.length,
        lessonCount: lessonTotal,
      };
    }) as {
      category: LanguageCategory;
      programs: Language[];
      programCount: number;
      lessonCount: number;
    }[];
  }, [groupedLanguages]);

  const getCategoryLabel = (
    category: CategoryFilter | string | null | undefined
  ) => {
    if (!category || category === "undefined") {
      return intl.formatMessage({
        id: "category.undefined",
        defaultMessage: formatLabel("other"),
      });
    }

    if (category === "all") {
      return intl.formatMessage({
        id: "category.all",
        defaultMessage: "All",
      });
    }

    return intl.formatMessage({
      id: `category.${category}`,
      defaultMessage: formatLabel(category),
    });
  };

  const getAgeGroupLabel = (ageGroup: Language["themeMetadata"]["ageGroup"]) =>
    intl.formatMessage({
      id: `ageGroup.${ageGroup}`,
      defaultMessage: formatLabel(ageGroup),
    });

  const getDifficultyLabel = (
    level: Language["themeMetadata"]["difficultyLevel"]
  ) =>
    intl.formatMessage({
      id: `difficulty.${level}`,
      defaultMessage: formatLabel(level),
    });

  const getMoralValueLabel = (value: string) =>
    intl.formatMessage({
      id: `valuePoints.${value}`,
      defaultMessage: formatLabel(value),
    });

  const renderLanguageCard = (language: Language) => {
    const themeMetadata = language.themeMetadata ?? {
      moralValues: [],
      difficultyLevel: "beginner",
      ageGroup: "all",
      islamicContent: false,
      educationalFocus: null,
    };

    const moralValues = themeMetadata.moralValues || [];
    const maxVisibleValues = 3;
    const visibleValues = moralValues.slice(0, maxVisibleValues);
    const hiddenCount = Math.max(moralValues.length - visibleValues.length, 0);

    return (
      <div
        key={language._id}
        role="button"
        onClick={() => handleLearn(language._id)}
        className="flex flex-col gap-4 border border-gray-200 rounded-xl p-6 w-full bg-white transition hover:border-primary-300 hover:shadow-md cursor-pointer"
      >
        <div className="flex items-center justify-between w-full">
          <CategoryBadge label={getCategoryLabel(language.category)} />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {getDifficultyLabel(themeMetadata.difficultyLevel)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Image
            src={
              language.imageUrl ||
              "https://cdn-icons-png.flaticon.com/128/10446/10446694.png"
            }
            width={70}
            height={70}
            className="rounded-full border border-muted"
            alt={`${language.name} flag`}
          />
          <div className="flex flex-col gap-1">
            <h6 className="text-lg font-semibold text-foreground">
              {language.name}
            </h6>
            <span className="text-sm text-muted-foreground">
              {intl.formatMessage(
                { id: "learn.learners" },
                {
                  count:
                    language.userCount + 1124 > 1000
                      ? ((language.userCount + 1124) / 1000).toFixed(1) + "k"
                      : language.userCount + 1124,
                }
              )}
            </span>
            <span className="text-xs font-medium text-primary-600">
              {intl.formatMessage(
                {
                  id: "learn.ageGroup",
                  defaultMessage: "Age Group: {value}",
                },
                { value: getAgeGroupLabel(themeMetadata.ageGroup) }
              )}
            </span>
            {themeMetadata.educationalFocus && (
              <span className="text-xs text-muted-foreground">
                {themeMetadata.educationalFocus}
              </span>
            )}
            {themeMetadata.islamicContent && (
              <span className="text-xs font-semibold text-emerald-600">
                {intl.formatMessage({
                  id: "learn.islamicContent",
                  defaultMessage: "Includes Islamic storytelling",
                })}
              </span>
            )}
          </div>
        </div>

        {visibleValues.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {visibleValues.map((value) => (
              <span
                key={value}
                className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700"
              >
                {getMoralValueLabel(value)}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="text-xs text-muted-foreground">
                +{hiddenCount}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCategorySection = (categoryId: LanguageCategory) => {
    const items = groupedLanguages[categoryId] || [];

    if (items.length === 0) {
      return null;
    }

    return (
      <div key={categoryId} className="flex flex-col gap-6">
        <h4 className="text-lg font-semibold text-foreground">
          {getCategoryLabel(categoryId)}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((language) => renderLanguageCard(language))}
        </div>
      </div>
    );
  };

  const handleCategorySelect = (category: LanguageCategory) => {
    setSelectedCategory(category);
    setViewMode("programs");
    router.replace(`/learn?category=${category}`, { scroll: false });
  };

  const handleBackToCategories = () => {
    setSelectedCategory("all");
    setViewMode("categories");
    router.replace("/learn", { scroll: false });
  };

  const handleLearn = async (languageId: string) => {
    setIsLoading(true);
    const token = await getToken();

    try {
      await apiClient.post(
        `/api/progress/addlanguage`,
        { userId, languageId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (userId && token) {
        await dispatch(fetchUserData({ userId, token }));
        await dispatch(fetchLessons({ languageId, token }));
        await dispatch(fetchUserProgress({ languageId, token }));
        await dispatch(fetchSettings({ token }));
      }

      router.push(`/dashboard`);
    } catch (error) {
      console.error("❌ Error starting progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    mutate(); // re-fetch on retry button click
  };

  const allLabel = getCategoryLabel("all");
  const showFilters = availableCategories.length > 0;
  const hasLanguages = Boolean(languages && languages.length > 0);

  return (
    <section className="py-20 flex-1">
      {(isLoading || loadingLanguages) && <Loading isLoading={true} />}

      <Container>
        <div className="flex flex-col gap-10 items-center">
          <h3 className="text-center">
            {intl.formatMessage({ id: "learn.title" })}
          </h3>
          <p className="text-center text-muted-foreground max-w-2xl">
            {intl.formatMessage({
              id: "learn.subtitle",
              defaultMessage:
                "Choose a programme to nurture gratitude, kindness and resilience through stories, games and mindful practices.",
            })}
          </p>

          {error ? (
            <div className="flex flex-col items-center gap-4">
              <p className="text-red-500">
                {intl.formatMessage({
                  id: "learn.error",
                  defaultMessage: "Error fetching languages. Please try again.",
                })}
              </p>
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg"
              >
                {intl.formatMessage({
                  id: "learn.retry",
                  defaultMessage: "Retry",
                })}
              </button>
            </div>
          ) : hasLanguages ? (
            <div className="flex flex-col gap-10 w-full">
              {viewMode === "categories" ? (
                <>
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categorySummaries.map((summary) => (
                      <button
                        key={summary.category}
                        onClick={() => handleCategorySelect(summary.category)}
                        className="flex flex-col gap-4 rounded-2xl border border-muted bg-white p-6 text-left transition hover:border-primary-300 hover:shadow-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-3xl" aria-hidden="true">
                            {CATEGORY_ICONS[summary.category]}
                          </span>
                          <CategoryBadge
                            label={getCategoryLabel(summary.category)}
                            active={false}
                          />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-xl font-semibold text-foreground">
                            {getCategoryLabel(summary.category)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {intl.formatMessage(
                              {
                                id: "learn.category.programCount",
                                defaultMessage: "{count} programme",
                              },
                              { count: summary.programCount }
                            )}
                          </p>
                          <p className="text-xs font-medium text-primary-600">
                            {intl.formatMessage(
                              {
                                id: "learn.category.lessonCount",
                                defaultMessage: "{count} lessons",
                              },
                              { count: summary.lessonCount }
                            )}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <button
                      onClick={handleBackToCategories}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                    >
                      ←{" "}
                      {intl.formatMessage({
                        id: "learn.backToCategories",
                        defaultMessage: "Back to categories",
                      })}
                    </button>
                    {showFilters && (
                      <div className="flex flex-wrap gap-3 justify-center">
                        <CategoryBadge
                          label={allLabel}
                          active={selectedCategory === "all"}
                          onClick={() => setSelectedCategory("all")}
                        />
                        {availableCategories.map((category) => (
                          <CategoryBadge
                            key={category}
                            label={getCategoryLabel(category)}
                            active={selectedCategory === category}
                            onClick={() => setSelectedCategory(category)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-12">
                    {categoriesToRender.map((category) =>
                      renderCategorySection(category)
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center mt-12 animate-fadeIn text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-14 h-14 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 14v.01M12 10h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                />
              </svg>

              <h4 className="text-lg font-medium text-gray-700 mb-2">
                {intl.formatMessage({
                  id: "learn.empty.title",
                  defaultMessage: "No Languages Available",
                })}
              </h4>

              <p className="text-sm text-gray-500 max-w-md">
                {intl.formatMessage({
                  id: "learn.empty",
                  defaultMessage:
                    "There is no language to learn right now. Please come back later.",
                })}
              </p>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
