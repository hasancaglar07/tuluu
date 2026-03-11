"use client";

import { useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { Language } from "@/types/lessons";

interface LanguageSelectorProps {
  languages: Language[];
  selectedLanguage?: string;
  onLanguageSelect: (languageId: string) => void;
}

/**
 * Language Selector Component
 *
 * Displays a horizontal list of language badges that users can click to select.
 * The selected language is highlighted with a different variant.
 *
 * @param languages - Array of available languages
 * @param selectedLanguage - Currently selected language ID
 * @param onLanguageSelect - Callback when a language is selected
 */
export function LanguageSelector({
  languages,
  selectedLanguage,
  onLanguageSelect,
}: LanguageSelectorProps) {
  const intl = useIntl();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const availableCategories = useMemo(() => {
    const categories = Array.from(
      new Set(
        languages
          .map((language) => language.category || "undefined")
          .filter((category): category is string => Boolean(category))
      )
    );

    return ["all", ...categories];
  }, [languages]);

  const groupedLanguages = useMemo(() => {
    const groups = new Map<string, Language[]>();

    for (const language of languages) {
      const category = language.category || "undefined";
      if (selectedCategory !== "all" && category !== selectedCategory) {
        continue;
      }

      const existingGroup = groups.get(category) ?? [];
      existingGroup.push(language);
      groups.set(category, existingGroup);
    }

    return Array.from(groups.entries())
      .sort(([categoryA], [categoryB]) => categoryA.localeCompare(categoryB, "tr"))
      .map(([category, items]) => ({
        category,
        items: [...items].sort((itemA, itemB) =>
          itemA.name.localeCompare(itemB.name, "tr")
        ),
      }));
  }, [languages, selectedCategory]);

  useEffect(() => {
    if (!selectedLanguage) {
      return;
    }

    const selected = languages.find((language) => language._id === selectedLanguage);
    if (selected?.category && selected.category !== selectedCategory) {
      setSelectedCategory(selected.category);
    }
  }, [languages, selectedCategory, selectedLanguage]);

  useEffect(() => {
    if (selectedCategory === "all") {
      return;
    }

    const categoryExists = languages.some(
      (language) => (language.category || "undefined") === selectedCategory
    );
    if (!categoryExists) {
      setSelectedCategory("all");
    }
  }, [languages, selectedCategory]);

  return (
    <div className="space-y-3">
      <Label className="flex items-center text-sm text-muted-foreground">
        <FormattedMessage
          id="admin.lessons.selectLanguage"
          defaultMessage="Program Seç:"
        />
      </Label>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">
          <FormattedMessage
            id="admin.lessons.topCategory"
            defaultMessage="Ana Kategori"
          />
        </Label>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className="cursor-pointer rounded-full px-3 py-1 text-xs"
              onClick={() => setSelectedCategory(category)}
            >
              {category === "all"
                ? intl.formatMessage({
                    id: "category.all",
                    defaultMessage: "Tümü",
                  })
                : intl.formatMessage({
                    id: `category.${category}`,
                    defaultMessage: category,
                  })}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {groupedLanguages.map(({ category, items }) => (
          <div key={category} className="space-y-2 rounded-md border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {intl.formatMessage({
                  id: `category.${category}`,
                  defaultMessage: category,
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {intl.formatMessage(
                  {
                    id: "learn.category.programCount",
                    defaultMessage: "{count} program",
                  },
                  { count: items.length }
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {items.map((language) => (
                <Badge
                  key={language._id}
                  variant={
                    selectedLanguage === language._id ? "default" : "outline"
                  }
                  className="shrink-0 cursor-pointer rounded-md px-3 py-1.5 text-sm"
                  onClick={() => onLanguageSelect(language._id)}
                >
                  <span className="mr-2">{language.flag}</span>
                  {language.name}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
