"use client";
import { m } from "framer-motion";
import { Lock, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormattedMessage, useIntl } from "react-intl";

/**
 * Props interface for the NextChapter component
 */
interface NextChapterProps {
  /** Chapter number to display */
  chapterNumber: string;
  /** Chapter title */
  title: string;
  /** Chapter description */
  description: string;
  /** Whether the chapter is locked (requires premium or completion) */
  isLocked?: boolean;
  /** Whether this is a premium chapter */
  isPremium?: boolean;
  /** Number of lessons in this chapter */
  lessonCount?: number;
  /** Estimated completion time in minutes */
  estimatedTime?: number;
  /** Difficulty level of the chapter */
  difficulty?: "beginner" | "intermediate" | "advanced";
  /** Callback function when user clicks advance button */
  onAdvance?: () => void;
  /** Loading state for the advance action */
  isLoading?: boolean;
  /** Custom CSS classes */
  className?: string;
}

/**
 * Helper function to get difficulty badge variant
 */
function getDifficultyVariant(difficulty?: string) {
  switch (difficulty) {
    case "beginner":
      return "default";
    case "intermediate":
      return "secondary";
    case "advanced":
      return "destructive";
    default:
      return "outline";
  }
}

/**
 * Helper function to truncate description text
 */
function truncateDescription(description: string, maxLength = 140): string {
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength)}...`;
}

/**
 * NextChapter Component
 *
 * Displays information about the next chapter in the learning path.
 * Shows chapter details, difficulty, estimated time, and provides
 * an action button to advance to the chapter.
 */
export function NextChapter({
  chapterNumber,
  title,
  description,
  isLocked = true,
  isPremium = false,
  lessonCount,
  estimatedTime,
  difficulty,
  onAdvance,
  isLoading = false,
  className = "",
}: NextChapterProps) {
  const intl = useIntl();

  /**
   * Handle advance button click with loading state
   */
  const handleAdvanceClick = () => {
    if (!isLoading && onAdvance) {
      onAdvance();
    }
  };

  /**
   * Get the appropriate button text based on chapter state
   */
  const getButtonText = () => {
    if (isLoading) {
      return intl.formatMessage({
        id: "dashboard.nextChapter.loading",
        defaultMessage: "Loading...",
      });
    }

    if (isLocked) {
      return intl.formatMessage({
        id: "dashboard.nextChapter.unlock",
        defaultMessage: "Unlock Chapter",
      });
    }

    return intl.formatMessage({
      id: "dashboard.nextChapter.advance",
      defaultMessage: "Start Chapter",
    });
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`max-w-3xl ${className}`}
    >
      <Card className="w-full mx-auto overflow-hidden border-gray-300 mt-10 hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Chapter Icon/Number */}
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full ${
                isLocked
                  ? "bg-muted"
                  : isPremium
                  ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                  : "bg-primary"
              }`}
            >
              {isLocked ? (
                <Lock className="w-5 h-5 text-muted-foreground" />
              ) : isPremium ? (
                <Star className="w-5 h-5 text-white" />
              ) : (
                <span className="text-sm font-bold text-white">
                  {chapterNumber}
                </span>
              )}
            </div>

            {/* Chapter Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 justify-center">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  <FormattedMessage
                    id="dashboard.nextChapter.label"
                    defaultMessage="Next Chapter"
                  />
                </p>
                {isPremium && (
                  <Badge variant="secondary" className="text-xs">
                    <FormattedMessage
                      id="dashboard.nextChapter.premium"
                      defaultMessage="Premium"
                    />
                  </Badge>
                )}
              </div>

              <h3 className="text-xl font-semibold text-foreground">{title}</h3>

              <p className="text-base text-muted-foreground leading-relaxed">
                {truncateDescription(description)}
              </p>
            </div>

            {/* Chapter Metadata */}
            {(lessonCount || estimatedTime || difficulty) && (
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
                {lessonCount && (
                  <div className="flex items-center gap-1">
                    <span>📚</span>
                    <FormattedMessage
                      id="dashboard.nextChapter.lessons"
                      defaultMessage="{count} lessons"
                      values={{ count: lessonCount }}
                    />
                  </div>
                )}

                {estimatedTime && (
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <FormattedMessage
                      id="dashboard.nextChapter.time"
                      defaultMessage="{time} min"
                      values={{ time: estimatedTime }}
                    />
                  </div>
                )}

                {difficulty && (
                  <Badge
                    variant={getDifficultyVariant(difficulty)}
                    className="text-xs"
                  >
                    <FormattedMessage
                      id={`dashboard.nextChapter.difficulty.${difficulty}`}
                      defaultMessage={difficulty}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Action Button */}
            <Button
              className="w-full mt-6 h-12 text-base font-medium"
              variant={isLocked ? "outline" : "default"}
              onClick={handleAdvanceClick}
              disabled={isLoading}
            >
              <span className="flex items-center gap-2">
                {getButtonText()}
                {!isLoading && !isLocked && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
            </Button>

            {/* Additional Info for Locked Chapters */}
            {isLocked && (
              <p className="text-xs text-muted-foreground mt-2">
                <FormattedMessage
                  id="dashboard.nextChapter.lockMessage"
                  defaultMessage="Complete the current chapter to unlock"
                />
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
}
