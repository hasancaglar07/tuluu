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
import { Plus } from "lucide-react";
import type { Language } from "@/types/lessons";

interface ChaptersGridViewProps {
  currentLanguage?: Language;
  onAddChapter: () => void;
}

/**
 * Chapters Grid View Component
 *
 * Displays all chapters for the selected language in a grid layout.
 * Shows chapter metadata including unit count and premium status.
 */
export function ChaptersGridView({
  currentLanguage,
  onAddChapter,
}: ChaptersGridViewProps) {
  const intl = useIntl();
  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          <FormattedMessage
            id="admin.lessons.tabs.chapters"
            defaultMessage="Chapters"
          />
        </h2>
        <Button onClick={onAddChapter}>
          <Plus className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.lessons.addChapter"
            defaultMessage="Add Chapter"
          />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentLanguage &&
          currentLanguage.chapters.map((chapter) => (
            <Card key={chapter._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">
                    {intl.formatMessage({
                      id: `contentType.${chapter.contentType ?? "lesson"}`,
                      defaultMessage: chapter.contentType ?? "Lesson",
                    })}
                  </Badge>
                  {chapter.title}
                </CardTitle>
                <CardDescription>{chapter.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      <FormattedMessage
                        id="admin.lessons.units"
                        defaultMessage="Units:"
                      />
                    </span>
                    <span>{chapter.units.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      <FormattedMessage
                        id="admin.lessons.premium"
                        defaultMessage="Premium:"
                      />
                    </span>
                    <span>
                      {chapter.isPremium ? (
                        <FormattedMessage
                          id="admin.lessons.yes"
                          defaultMessage="Yes"
                        />
                      ) : (
                        <FormattedMessage
                          id="admin.lessons.no"
                          defaultMessage="No"
                        />
                      )}
                    </span>
                  </div>
                  {chapter.moralLesson?.value && (
                    <div>
                      <span className="text-muted-foreground block">
                        <FormattedMessage
                          id="admin.lessons.chapter.moralValue"
                          defaultMessage="Moral Focus"
                        />
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {intl.formatMessage({
                            id: `valuePoints.${chapter.moralLesson.value}`,
                            defaultMessage: chapter.moralLesson.value,
                          })}
                        </Badge>
                        {chapter.moralLesson.title && (
                          <Badge variant="outline" className="text-xs">
                            {chapter.moralLesson.title}
                          </Badge>
                        )}
                      </div>
                      {chapter.moralLesson.displayTiming && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          <FormattedMessage
                            id="admin.lessons.chapter.displayTiming"
                            defaultMessage="Shared"
                          />
                          : {intl.formatMessage({
                            id: `displayTiming.${chapter.moralLesson.displayTiming}`,
                            defaultMessage: chapter.moralLesson.displayTiming,
                          })}
                        </p>
                      )}
                    </div>
                  )}
                  {chapter.miniGame?.type && (
                    <div>
                      <span className="text-muted-foreground block">
                        <FormattedMessage
                          id="admin.lessons.chapter.miniGame"
                          defaultMessage="Mini Game"
                        />
                      </span>
                      <Badge variant="outline" className="text-xs mt-1">
                        {intl.formatMessage({
                          id: `miniGame.${chapter.miniGame.type}`,
                          defaultMessage: chapter.miniGame.type,
                        })}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </>
  );
}
