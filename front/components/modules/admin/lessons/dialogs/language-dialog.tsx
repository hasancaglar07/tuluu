"use client";

import { useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { Language, NewLanguageForm } from "@/types/lessons";
import type {
  LanguageCategory,
  ThemeMetadata,
  ThemeAgeGroup,
  MoralValue,
} from "@/types";
import { i18n } from "@/i18n-config";

const CATEGORY_OPTIONS: LanguageCategory[] = [
  "faith_morality",
  "quran_arabic",
  "math_logic",
  "science_discovery",
  "language_learning",
  "mental_spiritual",
  "personal_social",
];

const AGE_GROUP_OPTIONS: ThemeAgeGroup[] = [
  "kids_4-7",
  "kids_8-12",
  "teens_13-17",
  "all",
];

const DIFFICULTY_OPTIONS: ThemeMetadata["difficultyLevel"][] = [
  "beginner",
  "intermediate",
  "advanced",
];

const MORAL_VALUE_OPTIONS: MoralValue[] = [
  "patience",
  "gratitude",
  "kindness",
  "honesty",
  "sharing",
  "mercy",
  "justice",
  "respect",
];

const defaultThemeMetadata = (): ThemeMetadata => ({
  islamicContent: false,
  ageGroup: "all",
  moralValues: [] as string[],
  educationalFocus: "",
  difficultyLevel: "beginner",
});

type ProgramTemplate = {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  imageUrl: string;
  category: LanguageCategory;
  themeMetadata: ThemeMetadata;
  baseLanguage: string;
  description: string;
};

const FALLBACK_TEMPLATES: ProgramTemplate[] = [
  {
    id: "fr-language",
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197560.png",
    category: "language_learning",
    themeMetadata: { ...defaultThemeMetadata(), difficultyLevel: "beginner" },
    baseLanguage: "fr",
    description: "Core language-learning track for French speakers.",
  },
  {
    id: "en-language",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/9906/9906532.png",
    category: "language_learning",
    themeMetadata: { ...defaultThemeMetadata(), difficultyLevel: "beginner" },
    baseLanguage: "en",
    description: "Core language-learning track for English speakers.",
  },
  {
    id: "es-language",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/10601/10601048.png",
    category: "language_learning",
    themeMetadata: { ...defaultThemeMetadata(), difficultyLevel: "beginner" },
    baseLanguage: "es",
    description: "Spanish language journey with gradual vocabulary focus.",
  },
  {
    id: "de-language",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197571.png",
    category: "language_learning",
    themeMetadata: { ...defaultThemeMetadata(), difficultyLevel: "intermediate" },
    baseLanguage: "de",
    description: "German practice path with grammar and conversation drills.",
  },
  {
    id: "it-language",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197626.png",
    category: "language_learning",
    themeMetadata: { ...defaultThemeMetadata(), difficultyLevel: "beginner" },
    baseLanguage: "it",
    description: "Italian vocabulary and culture lessons for beginners.",
  },
  {
    id: "pt-language",
    name: "Portuguese",
    nativeName: "Português",
    flag: "🇵🇹",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197463.png",
    category: "language_learning",
    themeMetadata: { ...defaultThemeMetadata(), difficultyLevel: "beginner" },
    baseLanguage: "pt",
    description: "Portuguese fundamentals with pronunciation focus.",
  },
  {
    id: "ja-language",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197604.png",
    category: "language_learning",
    themeMetadata: { ...defaultThemeMetadata(), difficultyLevel: "intermediate" },
    baseLanguage: "ja",
    description: "Japanese programme covering kana, kanji, and culture.",
  },
  {
    id: "zh-language",
    name: "Chinese",
    nativeName: "中文",
    flag: "🇨🇳",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/5372/5372696.png",
    category: "language_learning",
    themeMetadata: { ...defaultThemeMetadata(), difficultyLevel: "intermediate" },
    baseLanguage: "zh",
    description: "Mandarin lessons with tones, characters, and stories.",
  },
  {
    id: "ko-language",
    name: "Korean",
    nativeName: "한국어",
    flag: "🇰🇷",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197582.png",
    category: "language_learning",
    themeMetadata: { ...defaultThemeMetadata(), difficultyLevel: "intermediate" },
    baseLanguage: "ko",
    description: "Hangul mastery and cultural insights for Korean learners.",
  },
  {
    id: "ru-language",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197408.png",
    category: "language_learning",
    themeMetadata: { ...defaultThemeMetadata(), difficultyLevel: "intermediate" },
    baseLanguage: "ru",
    description: "Russian cases, vocabulary and pronunciation training.",
  },
  {
    id: "ar-language",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197569.png",
    category: "quran_arabic",
    themeMetadata: {
      ...defaultThemeMetadata(),
      islamicContent: true,
      difficultyLevel: "intermediate",
      moralValues: ["respect", "patience"] as MoralValue[],
    },
    baseLanguage: "ar",
    description: "Arabic literacy with Qur'an recitation and tajweed focus.",
  },
  {
    id: "tr-language",
    name: "Turkish",
    nativeName: "Türkçe",
    flag: "🇹🇷",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/197/197518.png",
    category: "language_learning",
    themeMetadata: { ...defaultThemeMetadata(), difficultyLevel: "beginner" },
    baseLanguage: "tr",
    description: "Turkish fundamentals for early-stage learners.",
  },
];

const PROGRAM_TEMPLATES: Record<string, ProgramTemplate[]> = {
  tr: [
    {
      id: "tr-faith-morality",
      name: "İman & Ahlak",
      nativeName: "İman & Ahlak",
      flag: "🕋",
      imageUrl: "",
      category: "faith_morality",
      themeMetadata: {
        islamicContent: true,
        ageGroup: "kids_8-12",
        moralValues: ["patience", "honesty", "mercy"],
        educationalFocus: "Dualar, peygamber hikayeleri ve güzel davranış oyunları",
        difficultyLevel: "beginner",
      },
      baseLanguage: "tr",
      description: "Dualar, peygamberler ve değer oyunlarıyla iman temelli yolculuk.",
    },
    {
      id: "tr-quran-arabic",
      name: "Kur'an & Arapça",
      nativeName: "Kur'an & Arapça",
      flag: "📖",
      imageUrl: "",
      category: "quran_arabic",
      themeMetadata: {
        islamicContent: true,
        ageGroup: "kids_8-12",
        moralValues: ["respect", "gratitude", "patience"],
        educationalFocus: "Tecvid çalışmaları, sûre ezberi ve Arapça kelime oyunları",
        difficultyLevel: "intermediate",
      },
      baseLanguage: "tr",
      description: "Tecvid, sûreler ve Arapça kelimelerle Kur'an odaklı öğrenme.",
    },
    {
      id: "tr-math-logic",
      name: "Matematik & Mantık",
      nativeName: "Matematik & Mantık",
      flag: "➕",
      imageUrl: "",
      category: "math_logic",
      themeMetadata: {
        islamicContent: false,
        ageGroup: "kids_8-12",
        moralValues: ["patience", "respect"],
        educationalFocus: "Problem çözme, sayı oyunları ve akıl yürütme görevleri",
        difficultyLevel: "beginner",
      },
      baseLanguage: "tr",
      description: "Sayı oyunları, bulmacalar ve mantık egzersizleriyle güçlen.",
    },
    {
      id: "tr-science-discovery",
      name: "Bilim & Keşif",
      nativeName: "Bilim & Keşif",
      flag: "🔭",
      imageUrl: "",
      category: "science_discovery",
      themeMetadata: {
        islamicContent: false,
        ageGroup: "kids_8-12",
        moralValues: ["gratitude", "respect"],
        educationalFocus: "Gezegenler, doğa, mucitler ve deneysel keşif etkinlikleri",
        difficultyLevel: "beginner",
      },
      baseLanguage: "tr",
      description: "Doğa, uzay ve bilim insanlarıyla keşfetmeye çık.",
    },
    {
      id: "tr-language-learning",
      name: "Dil Öğrenimi",
      nativeName: "Dil Öğrenimi",
      flag: "🗣️",
      imageUrl: "",
      category: "language_learning",
      themeMetadata: {
        islamicContent: false,
        ageGroup: "kids_8-12",
        moralValues: ["kindness", "sharing"],
        educationalFocus: "Kelime hazinesi, telaffuz ve empati odaklı diyaloglar",
        difficultyLevel: "beginner",
      },
      baseLanguage: "tr",
      description: "Yeni kelimeler, ifadeler ve paylaşım odaklı dil oyunları.",
    },
    {
      id: "tr-mental-spiritual",
      name: "Zihinsel & Ruhsal Gelişim",
      nativeName: "Zihinsel & Ruhsal Gelişim",
      flag: "🌿",
      imageUrl: "",
      category: "mental_spiritual",
      themeMetadata: {
        islamicContent: true,
        ageGroup: "kids_8-12",
        moralValues: ["patience", "mercy"],
        educationalFocus: "Nefes egzersizleri, zikir temelli rahatlama ve farkındalık",
        difficultyLevel: "beginner",
      },
      baseLanguage: "tr",
      description: "Nefes, zikir ve farkındalıkla zihinsel duruş güçlendirme.",
    },
    {
      id: "tr-personal-social",
      name: "Kişisel & Sosyal",
      nativeName: "Kişisel & Sosyal",
      flag: "👭",
      imageUrl: "",
      category: "personal_social",
      themeMetadata: {
        islamicContent: false,
        ageGroup: "kids_8-12",
        moralValues: ["kindness", "sharing", "justice"],
        educationalFocus: "Empati, yardımlaşma ve topluluk oyunları",
        difficultyLevel: "beginner",
      },
      baseLanguage: "tr",
      description: "Empati, yardımlaşma ve adaletle sosyal becerileri geliştir.",
    },
  ],
  en: [
    {
      id: "en-faith-morality",
      name: "Faith & Character",
      nativeName: "Faith & Character",
      flag: "🕋",
      imageUrl: "",
      category: "faith_morality",
      themeMetadata: {
        islamicContent: true,
        ageGroup: "kids_8-12",
        moralValues: ["patience", "honesty", "mercy"],
        educationalFocus: "Prophet stories, virtues and value-based mini games",
        difficultyLevel: "beginner",
      },
      baseLanguage: "en",
      description: "Prophetic stories and value games to nurture character.",
    },
    {
      id: "en-quran-arabic",
      name: "Qur'an & Arabic",
      nativeName: "Qur'an & Arabic",
      flag: "📖",
      imageUrl: "",
      category: "quran_arabic",
      themeMetadata: {
        islamicContent: true,
        ageGroup: "kids_8-12",
        moralValues: ["respect", "gratitude", "patience"],
        educationalFocus: "Tajwid drills, surah memorisation and Arabic word quests",
        difficultyLevel: "intermediate",
      },
      baseLanguage: "en",
      description: "Tajwid, surah memorisation and Arabic word adventures.",
    },
    {
      id: "en-math-logic",
      name: "Math & Logic",
      nativeName: "Math & Logic",
      flag: "➕",
      imageUrl: "",
      category: "math_logic",
      themeMetadata: {
        islamicContent: false,
        ageGroup: "kids_8-12",
        moralValues: ["patience", "respect"],
        educationalFocus: "Problem solving quests, number games and puzzles",
        difficultyLevel: "beginner",
      },
      baseLanguage: "en",
      description: "Number games, logic puzzles and strategy challenges.",
    },
    {
      id: "en-science-discovery",
      name: "Science & Discovery",
      nativeName: "Science & Discovery",
      flag: "🔭",
      imageUrl: "",
      category: "science_discovery",
      themeMetadata: {
        islamicContent: false,
        ageGroup: "kids_8-12",
        moralValues: ["gratitude", "respect"],
        educationalFocus: "Nature walks, space journeys and Muslim inventors",
        difficultyLevel: "beginner",
      },
      baseLanguage: "en",
      description: "Explore nature, space and remarkable Muslim scientists.",
    },
    {
      id: "en-language-learning",
      name: "Language Adventures",
      nativeName: "Language Adventures",
      flag: "🗣️",
      imageUrl: "",
      category: "language_learning",
      themeMetadata: {
        islamicContent: false,
        ageGroup: "kids_8-12",
        moralValues: ["kindness", "sharing"],
        educationalFocus: "Vocabulary stories, dialogues and empathy-driven play",
        difficultyLevel: "beginner",
      },
      baseLanguage: "en",
      description: "Fun storytelling and dialogue games to grow vocabulary.",
    },
    {
      id: "en-mental-spiritual",
      name: "Mind & Heart Wellness",
      nativeName: "Mind & Heart Wellness",
      flag: "🌿",
      imageUrl: "",
      category: "mental_spiritual",
      themeMetadata: {
        islamicContent: true,
        ageGroup: "kids_8-12",
        moralValues: ["patience", "mercy"],
        educationalFocus: "Breathing exercises, dhikr-based calm and mindfulness",
        difficultyLevel: "beginner",
      },
      baseLanguage: "en",
      description: "Mindfulness, dhikr and breathing routines for balance.",
    },
    {
      id: "en-personal-social",
      name: "Personal & Social Skills",
      nativeName: "Personal & Social Skills",
      flag: "👭",
      imageUrl: "",
      category: "personal_social",
      themeMetadata: {
        islamicContent: false,
        ageGroup: "kids_8-12",
        moralValues: ["kindness", "sharing", "justice"],
        educationalFocus: "Empathy quests, teamwork challenges and service projects",
        difficultyLevel: "beginner",
      },
      baseLanguage: "en",
      description: "Empathy, teamwork and community kindness missions.",
    },
  ],
};

interface LanguageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  newLanguage: Language | NewLanguageForm;
  setNewLanguage:
    | ((language: Language) => void)
    | ((language: NewLanguageForm) => void);
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  isEdit: boolean;
  existingLanguages?: Language[];
}

/**
 * Language Dialog Component
 *
 * A reusable dialog for both creating new languages and editing existing ones.
 * Features:
 * - Language selection from predefined list
 * - Base language selection
 * - Active/inactive toggle
 * - Form validation
 * - Loading states
 *
 * @param isEdit - Determines if this is an edit or create operation
 */
export function LanguageDialog({
  isOpen,
  onClose,
  newLanguage,
  setNewLanguage,
  onSubmit,
  isLoading,
  isEdit,
  existingLanguages,
}: LanguageDialogProps) {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState<"basic" | "theme">("basic");
  const { locales: localeOptions, defaultLocale } = i18n;
  const selectedLocale =
    (newLanguage as Language | NewLanguageForm).locale ?? defaultLocale;
  const templatesForLocale = useMemo(() => {
    const localeTemplates = PROGRAM_TEMPLATES[selectedLocale] ?? [];
    return localeTemplates.length > 0 ? localeTemplates : FALLBACK_TEMPLATES;
  }, [selectedLocale]);

  const templateUsageByCategory = useMemo(() => {
    if (!existingLanguages || existingLanguages.length === 0) {
      return new Map<LanguageCategory, number>();
    }

    return existingLanguages
      .filter((language) => language.locale === selectedLocale)
      .reduce((acc, language) => {
        const currentCount = acc.get(language.category) ?? 0;
        acc.set(language.category, currentCount + 1);
        return acc;
      }, new Map<LanguageCategory, number>());
  }, [existingLanguages, selectedLocale]);

  const selectedTemplate = useMemo(
    () =>
      templatesForLocale.find(
        (template) => template.id === (newLanguage as { _id?: string })._id
      ),
    [templatesForLocale, newLanguage]
  );

  const baseLanguageOptions = useMemo(() => {
    const optionsMap = new Map<
      string,
      { value: string; label: string; flag?: string; image?: string }
    >();

    FALLBACK_TEMPLATES.forEach((template) => {
      if (!optionsMap.has(template.baseLanguage)) {
        optionsMap.set(template.baseLanguage, {
          value: template.baseLanguage,
          label: template.baseLanguage,
          flag: template.flag,
        });
      }
    });

    localeOptions.forEach(({ lang, image }) => {
      optionsMap.set(lang, {
        value: lang,
        label: lang,
        image,
      });
    });

    return Array.from(optionsMap.values()).sort((a, b) =>
      a.value.localeCompare(b.value)
    );
  }, [localeOptions]);

  useEffect(() => {
    if (!(newLanguage as Language | NewLanguageForm).locale && setNewLanguage) {
      if (isEdit) {
        (setNewLanguage as (language: Language) => void)({
          ...(newLanguage as Language),
          locale: defaultLocale,
        });
      } else {
        (setNewLanguage as (language: NewLanguageForm) => void)({
          ...(newLanguage as NewLanguageForm),
          locale: defaultLocale,
        });
      }
    }
  }, [newLanguage, defaultLocale, isEdit, setNewLanguage]);

  useEffect(() => {
    if (isEdit) {
      return;
    }

    const currentTemplateId = (newLanguage as { _id?: string })._id;
    if (!currentTemplateId) {
      return;
    }

    const found = templatesForLocale.some(
      (template) => template.id === currentTemplateId
    );

    if (!found) {
      updateLanguage((state) => {
        if ("chapters" in state) {
          return state;
        }

        return {
          ...(state as NewLanguageForm),
          _id: "",
          baseLanguage: selectedLocale,
          category: "language_learning",
          themeMetadata: defaultThemeMetadata(),
        };
      });
    }
  }, [templatesForLocale, newLanguage, isEdit, selectedLocale]);

  const updateLanguage = (
    updater: (state: Language | NewLanguageForm) => Language | NewLanguageForm
  ) => {
    if (!setNewLanguage) {
      return;
    }
    const updatedState = updater(newLanguage);
    if (isEdit) {
      (setNewLanguage as (language: Language) => void)(updatedState as Language);
    } else {
      (setNewLanguage as (language: NewLanguageForm) => void)(
        updatedState as NewLanguageForm
      );
    }
  };

  const rawThemeMetadata =
    (newLanguage as Language | NewLanguageForm).themeMetadata ??
    defaultThemeMetadata();

  const currentThemeMetadata: ThemeMetadata = {
    ...defaultThemeMetadata(),
    ...rawThemeMetadata,
    moralValues: [...(rawThemeMetadata.moralValues ?? [])],
  };

  const updateThemeMetadata = (updates: Partial<ThemeMetadata>) => {
    const merged: ThemeMetadata = {
      ...currentThemeMetadata,
      ...updates,
    };
    if (updates.moralValues === undefined) {
      merged.moralValues = currentThemeMetadata.moralValues;
    }
    updateLanguage((state) => {
      if ("chapters" in state) {
        return { ...state, themeMetadata: merged };
      }
      return { ...(state as NewLanguageForm), themeMetadata: merged };
    });
  };

  const handleMoralValueToggle = (value: MoralValue, checked: boolean) => {
    const nextValues = checked
      ? Array.from(new Set([...(currentThemeMetadata.moralValues ?? []), value]))
      : (currentThemeMetadata.moralValues ?? []).filter(
          (item) => item !== value
        );
    updateThemeMetadata({ moralValues: nextValues });
  };

  const handleTemplateSelection = (templateId: string) => {
    const foundTemplate = templatesForLocale.find(
      (template) => template.id === templateId
    );
    if (!foundTemplate) {
      return;
    }

    const mergedThemeMetadata: ThemeMetadata = {
      ...defaultThemeMetadata(),
      ...foundTemplate.themeMetadata,
      moralValues: [...(foundTemplate.themeMetadata.moralValues ?? [])],
    };

    updateLanguage((state) => {
      if ("chapters" in state) {
        // Selection is only available in create mode, but keep defensive return
        return state;
      }

      return {
        ...(state as NewLanguageForm),
        _id: foundTemplate.id,
        name: foundTemplate.name,
        nativeName: foundTemplate.nativeName,
        flag: foundTemplate.flag,
        imageUrl: foundTemplate.imageUrl,
        category: foundTemplate.category,
        themeMetadata: mergedThemeMetadata,
        baseLanguage: foundTemplate.baseLanguage ?? selectedLocale,
        locale: selectedLocale,
      };
    });
  };

  const selectedCategory =
    (newLanguage as Language | NewLanguageForm).category ?? "language_learning";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.editLanguage"
                defaultMessage="Edit Language"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addNewLanguage"
                defaultMessage="Add New Language"
              />
            )}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.editLanguageDescription"
                defaultMessage="Update language details."
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addLanguageDescription"
                defaultMessage="Add a new language to your course offerings."
              />
            )}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "basic" | "theme")}
            className="mt-2"
          >
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="basic">
                <FormattedMessage
                  id="admin.lessons.dialog.tabs.basic"
                  defaultMessage="Basic Info"
                />
              </TabsTrigger>
              <TabsTrigger value="theme">
                <FormattedMessage
                  id="admin.lessons.dialog.tabs.theme"
                  defaultMessage="Learning Theme"
                />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="language-locale">
                    <FormattedMessage
                      id="admin.lessons.siteLocale"
                      defaultMessage="Site Locale"
                    />
                  </Label>
                  <Select
                    value={selectedLocale}
                    onValueChange={(value) =>
                      updateLanguage((state) =>
                        "chapters" in state
                          ? { ...state, locale: value }
                          : {
                              ...(state as NewLanguageForm),
                              locale: value,
                            }
                      )
                    }
                  >
                    <SelectTrigger id="language-locale">
                      <SelectValue placeholder={selectedLocale.toUpperCase()} />
                    </SelectTrigger>
                    <SelectContent>
                      {localeOptions.map(({ lang, image }) => (
                        <SelectItem key={lang} value={lang}>
                          <span className="inline-flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image}
                              alt=""
                              className="h-4 w-4 rounded-full"
                            />
                            <span className="uppercase font-semibold">
                              {lang}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    <FormattedMessage
                      id="admin.lessons.siteLocale.helper"
                      defaultMessage="Learners browsing in this site language will see this programme."
                    />
                  </p>
                </div>

                {!isEdit && (
                  <div className="grid gap-2">
                    <Label htmlFor="program-template">
                      <FormattedMessage
                        id="admin.lessons.template.label"
                        defaultMessage="Program Template"
                      />
                    </Label>
                    <Select
                      value={(newLanguage as { _id?: string })._id ?? ""}
                      onValueChange={handleTemplateSelection}
                    >
                      <SelectTrigger id="program-template">
                        <SelectValue
                          placeholder={intl.formatMessage({
                            id: "admin.lessons.template.placeholder",
                            defaultMessage: "Choose a template to prefill programme details",
                          })}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {templatesForLocale.map((template) => {
                          const usageCount =
                            templateUsageByCategory.get(template.category) ?? 0;

                          return (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-2 font-medium">
                                  <span>{template.flag}</span>
                                  {template.name}
                                </span>
                                {usageCount > 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    <FormattedMessage
                                      id="admin.lessons.template.inUse"
                                      defaultMessage="{count, plural, one {# programme already created} other {# programmes already created}}"
                                      values={{ count: usageCount }}
                                    />
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {template.description}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      <FormattedMessage
                        id="admin.lessons.template.description"
                        defaultMessage="Start from a curated template inspired by fikir.txt. You can adjust every field afterwards."
                      />
                    </p>
                    {selectedTemplate && (
                      <p className="text-xs text-primary-600">
                        {selectedTemplate.description}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="language-name">
                      <FormattedMessage
                        id="admin.lessons.name"
                        defaultMessage="Name"
                      />
                    </Label>
                    <Input
                      id="language-name"
                      value={newLanguage.name ?? ""}
                      onChange={(e) =>
                        updateLanguage((state) =>
                          "chapters" in state
                            ? { ...state, name: e.target.value }
                            : { ...(state as NewLanguageForm), name: e.target.value }
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="language-native-name">
                      <FormattedMessage
                        id="admin.lessons.nativeName"
                        defaultMessage="Native Name"
                      />
                    </Label>
                    <Input
                      id="language-native-name"
                      value={newLanguage.nativeName ?? ""}
                      onChange={(e) =>
                        updateLanguage((state) =>
                          "chapters" in state
                            ? { ...state, nativeName: e.target.value }
                            : {
                                ...(state as NewLanguageForm),
                                nativeName: e.target.value,
                              }
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="language-flag">
                      <FormattedMessage
                        id="admin.lessons.flag"
                        defaultMessage="Flag"
                      />
                    </Label>
                    <Input
                      id="language-flag"
                      value={newLanguage.flag ?? ""}
                      onChange={(e) =>
                        updateLanguage((state) =>
                          "chapters" in state
                            ? { ...state, flag: e.target.value }
                            : { ...(state as NewLanguageForm), flag: e.target.value }
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="language-image-url">
                      <FormattedMessage
                        id="admin.lessons.imageUrl"
                        defaultMessage="image Url"
                      />
                    </Label>
                    <Input
                      id="language-image-url"
                      value={newLanguage.imageUrl ?? ""}
                      onChange={(e) =>
                        updateLanguage((state) =>
                          "chapters" in state
                            ? { ...state, imageUrl: e.target.value }
                            : {
                                ...(state as NewLanguageForm),
                                imageUrl: e.target.value,
                              }
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="language-base">
                      <FormattedMessage
                        id="admin.lessons.baseLanguage"
                        defaultMessage="Base Language"
                      />
                    </Label>
                    <Select
                      value={newLanguage.baseLanguage}
                      onValueChange={(value) =>
                        updateLanguage((state) =>
                          "chapters" in state
                            ? { ...state, baseLanguage: value }
                            : {
                                ...(state as NewLanguageForm),
                                baseLanguage: value,
                              }
                        )
                      }
                    >
                      <SelectTrigger id="language-base">
                        <SelectValue
                          placeholder={intl.formatMessage({
                            id: "admin.lessons.selectBaseLanguage",
                            defaultMessage: "Select base language",
                          })}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {baseLanguageOptions.map(({ value, flag, image }) => (
                          <SelectItem key={value} value={value}>
                            <span className="flex items-center gap-2">
                              {image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={image}
                                  alt=""
                                  className="h-4 w-4 rounded-full"
                                />
                              ) : (
                                <span>{flag ?? "🌐"}</span>
                              )}
                              <span className="uppercase font-medium">
                                {value}
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      <FormattedMessage
                        id="admin.lessons.baseLanguageDescription"
                        defaultMessage="The base language is the language that users already know and are learning from."
                      />
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="language-active"
                      checked={newLanguage.isActive}
                      onCheckedChange={(checked) =>
                        updateLanguage((state) =>
                          "chapters" in state
                            ? { ...state, isActive: Boolean(checked) }
                            : {
                                ...(state as NewLanguageForm),
                                isActive: Boolean(checked),
                              }
                        )
                      }
                    />
                    <Label htmlFor="language-active">
                      <FormattedMessage
                        id="admin.lessons.status.active"
                        defaultMessage="Active"
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground ml-2">
                      <FormattedMessage
                        id="admin.lessons.inactiveLanguageNote"
                        defaultMessage="Inactive languages won't be visible to users."
                      />
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="theme">
              <div className="grid gap-4 py-4">
                <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="language-category">
                      <FormattedMessage
                        id="admin.lessons.programCard.category"
                        defaultMessage="Primary Focus"
                      />
                    </Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={(value) =>
                        updateLanguage((state) =>
                          "chapters" in state
                            ? { ...state, category: value as LanguageCategory }
                            : {
                                ...(state as NewLanguageForm),
                                category: value as LanguageCategory,
                              }
                        )
                      }
                    >
                      <SelectTrigger id="language-category">
                        <SelectValue
                          placeholder={intl.formatMessage({
                            id: "admin.lessons.programCard.category",
                            defaultMessage: "Primary Focus",
                          })}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((category) => (
                          <SelectItem key={category} value={category}>
                            {intl.formatMessage({
                              id: `category.${category}`,
                              defaultMessage: category,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="language-age-group">
                      <FormattedMessage
                        id="admin.lessons.programCard.age"
                        defaultMessage="Age Group"
                      />
                    </Label>
                    <Select
                      value={currentThemeMetadata.ageGroup}
                      onValueChange={(value) =>
                        updateThemeMetadata({ ageGroup: value as ThemeAgeGroup })
                      }
                    >
                      <SelectTrigger id="language-age-group">
                        <SelectValue
                          placeholder={intl.formatMessage({
                            id: "admin.lessons.programCard.age",
                            defaultMessage: "Age Group",
                          })}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {AGE_GROUP_OPTIONS.map((ageGroup) => (
                          <SelectItem key={ageGroup} value={ageGroup}>
                            {intl.formatMessage({
                              id: `ageGroup.${ageGroup}`,
                              defaultMessage: ageGroup,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="language-difficulty">
                      <FormattedMessage
                        id="admin.lessons.programCard.difficulty"
                        defaultMessage="Difficulty"
                      />
                    </Label>
                    <Select
                      value={currentThemeMetadata.difficultyLevel}
                      onValueChange={(value) =>
                        updateThemeMetadata({
                          difficultyLevel:
                            value as ThemeMetadata["difficultyLevel"],
                        })
                      }
                    >
                      <SelectTrigger id="language-difficulty">
                        <SelectValue
                          placeholder={intl.formatMessage({
                            id: "admin.lessons.programCard.difficulty",
                            defaultMessage: "Difficulty",
                          })}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {DIFFICULTY_OPTIONS.map((difficulty) => (
                          <SelectItem key={difficulty} value={difficulty}>
                            {intl.formatMessage({
                              id: `difficulty.${difficulty}`,
                              defaultMessage: difficulty,
                            })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="language-spiritual"
                      checked={currentThemeMetadata.islamicContent}
                      onCheckedChange={(checked) =>
                        updateThemeMetadata({ islamicContent: Boolean(checked) })
                      }
                    />
                    <Label htmlFor="language-spiritual">
                      <FormattedMessage
                        id="admin.lessons.programCard.spiritual"
                        defaultMessage="Includes spiritual storytelling"
                      />
                    </Label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>
                    <FormattedMessage
                      id="admin.lessons.programCard.values"
                      defaultMessage="Character Values"
                    />
                  </Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {MORAL_VALUE_OPTIONS.map((value) => {
                      const checked = (currentThemeMetadata.moralValues ?? []).includes(
                        value
                      );
                      return (
                        <label key={value} className="flex items-center gap-2">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(checkedState) =>
                              handleMoralValueToggle(value, Boolean(checkedState))
                            }
                          />
                          <span>
                            <FormattedMessage
                              id={`valuePoints.${value}`}
                              defaultMessage={value}
                            />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="language-educational-focus">
                    <FormattedMessage
                      id="admin.lessons.programCard.focus"
                      defaultMessage="Learning Focus"
                    />
                  </Label>
                  <Textarea
                    id="language-educational-focus"
                    rows={3}
                    value={currentThemeMetadata.educationalFocus ?? ""}
                    onChange={(e) =>
                      updateThemeMetadata({ educationalFocus: e.target.value })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            <FormattedMessage
              id="admin.lessons.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button
            onClick={onSubmit}
            disabled={(!isEdit && !newLanguage._id) || isLoading}
          >
            {isLoading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
            {isEdit ? (
              <FormattedMessage
                id="admin.lessons.saveChanges"
                defaultMessage="Save Changes"
              />
            ) : (
              <FormattedMessage
                id="admin.lessons.addLanguage"
                defaultMessage="Add Language"
              />
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
