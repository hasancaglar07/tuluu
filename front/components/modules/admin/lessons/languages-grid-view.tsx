"use client";

import { FormattedMessage, useIntl } from "react-intl";
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
  const intl = useIntl();

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          <FormattedMessage
            id="admin.lessons.tabs.languages"
            defaultMessage="Programs"
          />
        </h2>
        <Button onClick={onAddLanguage}>
          <Globe className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.lessons.addLanguage"
            defaultMessage="Add Program"
          />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {languages.map((language) => {
          const themeMetadata = language.themeMetadata ?? {
            islamicContent: false,
            ageGroup: "all",
            moralValues: [],
            educationalFocus: "",
            difficultyLevel: "beginner",
          };

          const moralValues = themeMetadata.moralValues ?? [];

          return (
            <Card key={language._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{language.flag}</span>
                  {language.name}
                </CardTitle>
                <CardDescription>{language.nativeName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">
                      {intl.formatMessage({
                        id: `category.${language.category || "undefined"}`,
                        defaultMessage:
                          language.category ||
                          intl.formatMessage({
                            id: "category.undefined",
                            defaultMessage: "Other",
                          }),
                      })}
                    </Badge>
                    {themeMetadata.islamicContent && (
                      <Badge variant="secondary">
                        <FormattedMessage
                          id="admin.lessons.programCard.spiritual"
                          defaultMessage="Includes spiritual storytelling"
                        />
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {intl.formatMessage({
                        id: `difficulty.${themeMetadata.difficultyLevel}`,
                        defaultMessage: themeMetadata.difficultyLevel,
                      })}
                    </Badge>
                  </div>

                  <div className="grid gap-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>
                        <FormattedMessage
                          id="admin.lessons.programCard.age"
                          defaultMessage="Age Group"
                        />
                      </span>
                      <span className="font-medium text-foreground">
                        {intl.formatMessage({
                          id: `ageGroup.${themeMetadata.ageGroup}`,
                          defaultMessage: themeMetadata.ageGroup,
                        })}
                      </span>
                    </div>
                    {themeMetadata.educationalFocus && (
                      <div className="flex justify-between">
                        <span>
                          <FormattedMessage
                            id="admin.lessons.programCard.focus"
                            defaultMessage="Learning Focus"
                          />
                        </span>
                        <span className="font-medium text-foreground text-right">
                          {themeMetadata.educationalFocus}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>
                        <FormattedMessage
                          id="admin.lessons.status.label"
                          defaultMessage="Status:"
                        />
                      </span>
                      <Badge
                        variant={language.isActive ? "default" : "secondary"}
                      >
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
                    <div>
                      <span className="text-muted-foreground">
                        <FormattedMessage
                          id="admin.lessons.programCard.values"
                          defaultMessage="Values"
                        />
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {moralValues.length === 0 ? (
                          <Badge variant="outline" className="text-xs">
                            <FormattedMessage
                              id="admin.lessons.no"
                              defaultMessage="No"
                            />
                          </Badge>
                        ) : (
                          moralValues.map((value) => (
                            <Badge key={value} variant="secondary" className="text-xs">
                              {intl.formatMessage({
                                id: `valuePoints.${value}`,
                                defaultMessage: value,
                              })}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        <FormattedMessage
                          id="admin.lessons.chapters"
                          defaultMessage="Chapters:"
                        />
                      </span>
                      <span className="font-medium text-foreground">
                        {language.chapters.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
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
          );
        })}
      </div>
    </>
  );
}
