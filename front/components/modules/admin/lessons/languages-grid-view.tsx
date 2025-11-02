"use client";

import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Edit, Trash2 } from "lucide-react";
import type { Language } from "@/types/lessons";

interface LanguagesGridViewProps {
  languages: Language[];
  onAddLanguage: () => void;
  onEditLanguage: (language: Language) => void;
  onDeleteLanguage: (language: Language) => void;
}

/**
 * Languages Grid View Component
 *
 * Displays all languages in a responsive grid layout.
 * Each language card shows:
 * - Language name and native name
 * - Flag emoji
 * - Base language information
 * - Active/inactive status
 * - Number of chapters
 * - Edit and delete actions
 */
export function LanguagesGridView({
  languages,
  onAddLanguage,
  onEditLanguage,
  onDeleteLanguage,
}: LanguagesGridViewProps) {
  // Helper function to get language details by ID
  const getLanguageById = (id: string) => {
    const availableLanguages = [
      { _id: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
      { _id: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
      { _id: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
      { _id: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
      { _id: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
      { _id: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
      { _id: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
      { _id: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
      { _id: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
      { _id: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
      { _id: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
    ];

    return (
      availableLanguages.find((lang) => lang._id === id) || {
        name: id,
        flag: "🌐",
      }
    );
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          <FormattedMessage
            id="admin.lessons.tabs.languages"
            defaultMessage="Languages"
          />
        </h2>
        <Button onClick={onAddLanguage}>
          <Globe className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.lessons.addLanguage"
            defaultMessage="Add Language"
          />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {languages.map((language) => (
          <Card key={language._id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{language.flag}</span>
                {language.name}
              </CardTitle>
              <CardDescription>{language.nativeName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="admin.lessons.baseLanguage"
                      defaultMessage="Base Language:"
                    />
                  </span>
                  <span className="flex items-center">
                    {getLanguageById(language.baseLanguage).flag}{" "}
                    {getLanguageById(language.baseLanguage).name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="admin.lessons.status.label"
                      defaultMessage="Status:"
                    />
                  </span>
                  <Badge variant={language.isActive ? "default" : "secondary"}>
                    {language.isActive ? (
                      <FormattedMessage
                        id="admin.lessons.status.active"
                        defaultMessage="Active"
                      />
                    ) : (
                      <FormattedMessage
                        id="admin.lessons.status.inactive"
                        defaultMessage="Inactive"
                      />
                    )}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    <FormattedMessage
                      id="admin.lessons.chapters"
                      defaultMessage="Chapters:"
                    />
                  </span>
                  <span>{language.chapters.length}</span>
                </div>
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditLanguage(language)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    <FormattedMessage
                      id="admin.lessons.edit"
                      defaultMessage="Edit"
                    />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteLanguage(language)}
                    disabled={languages.length === 1}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <FormattedMessage
                      id="admin.lessons.delete"
                      defaultMessage="Delete"
                    />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
