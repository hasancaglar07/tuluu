"use client";

import { FormattedMessage } from "react-intl";
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
  return (
    <div className="flex flex-wrap gap-2">
      <Label className="flex items-center mr-2">
        <FormattedMessage
          id="admin.lessons.selectLanguage"
          defaultMessage="Select Language:"
        />
      </Label>
      {languages.map((language) => (
        <Badge
          key={language._id}
          variant={selectedLanguage === language._id ? "default" : "outline"}
          className="cursor-pointer text-base py-1.5 px-3"
          onClick={() => onLanguageSelect(language._id)}
        >
          <span className="mr-2">{language.flag}</span>
          {language.name}
        </Badge>
      ))}
    </div>
  );
}
