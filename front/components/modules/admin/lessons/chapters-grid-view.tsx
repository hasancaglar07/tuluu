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
                <CardTitle>{chapter.title}</CardTitle>
                <CardDescription>{chapter.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      <FormattedMessage
                        id="admin.lessons.units"
                        defaultMessage="Units:"
                      />
                    </span>
                    <span>{chapter.units.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
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
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </>
  );
}
