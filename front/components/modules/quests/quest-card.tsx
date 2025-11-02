"use client";

import { m } from "framer-motion";
import { Clock, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Quest } from "@/types";
import { useIntl } from "react-intl";

/**
 * QuestCard Component
 *
 * Displays an individual quest with its details and progress.
 *
 * @param {Object} props - Component props
 * @param {Quest} props.quest - Quest data to display
 * @param {number} props.index - Index for animation delay
 * @param {Function} props.onProgressUpdate - Function to handle progress updates
 * @param {boolean} props.isCompleted - Whether the quest is completed
 * @param {boolean} props.isLocked - Whether the quest is locked
 * @param {boolean} props.isUpdating - Whether a progress update is in progress
 */
export function QuestCard({
  quest,
  index,
  onProgressUpdate,
  isCompleted = false,
  isLocked = false,
  isUpdating = false,
}: {
  quest: Quest;
  index: number;
  onProgressUpdate?: (questId: string) => void;
  isCompleted?: boolean;
  isLocked?: boolean;
  isUpdating?: boolean;
}) {
  const intl = useIntl();

  const getDifficultyColor = (difficulty: Quest["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyLabel = (difficulty: Quest["difficulty"]) => {
    return intl.formatMessage({
      id: `quest.difficulty.${difficulty}`,
      defaultMessage: difficulty,
    });
  };

  const getQuestIcon = () => {
    switch (quest.duration) {
      case "daily":
        return <div className="text-yellow-500">⚡</div>;
      case "weekly":
        return <div className="text-red-500">🎯</div>;
      case "monthly":
        return <div className="text-blue-500">🎁</div>;
      case "special":
        return <div className="text-green-500">✅</div>;
      default:
        return <div className="text-purple-500">🌟</div>;
    }
  };

  const cardStyle = isCompleted
    ? "bg-gray-50"
    : isLocked
    ? "bg-gray-50 opacity-70"
    : "bg-white";

  const progressValue = (quest.progress / quest.total) * 100;
  const progressColor = isCompleted ? "bg-green-200" : "";

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`p-4 border border-gray-200 rounded-xl ${cardStyle}`}
      whileHover={
        !isLocked
          ? {
              scale: 1.01,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }
          : {}
      }
    >
      <div className="flex gap-4">
        <div
          className={`p-3 ${
            isLocked ? "bg-gray-200" : "bg-gray-100"
          } rounded-lg self-start`}
        >
          {getQuestIcon()}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h5 className="font-bold">{quest.title}</h5>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isLocked
                  ? "bg-gray-200 text-gray-700"
                  : isCompleted
                  ? "bg-green-100 text-green-800"
                  : getDifficultyColor(quest.difficulty)
              }`}
            >
              {isLocked
                ? intl.formatMessage({
                    id: "quest.locked",
                    defaultMessage: "Locked",
                  })
                : isCompleted
                ? intl.formatMessage({
                    id: "quest.completed",
                    defaultMessage: "Completed",
                  })
                : getDifficultyLabel(quest.difficulty)}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-3">{quest.description}</p>

          <div className="mb-3">
            {!isLocked && (
              <>
                <div className="flex justify-between text-xs mb-1">
                  <span>
                    {intl.formatMessage({
                      id: "quest.progress.label",
                      defaultMessage: "Progress",
                    })}
                  </span>
                  <span>
                    {quest.progress}/{quest.total}
                  </span>
                </div>
                <Progress
                  value={progressValue}
                  className={`h-2 ${progressColor}`}
                />
              </>
            )}
            {isLocked && <Progress value={0} className="h-2" />}
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {quest.xpReward > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Star
                    className={`h-4 w-4 ${
                      isLocked ? "text-gray-400" : "text-yellow-500"
                    }`}
                  />
                  <span className="font-bold">{quest.xpReward} XP</span>
                </div>
              )}

              {quest.heartsReward && (
                <div className="flex items-center gap-1 text-sm">
                  <Heart
                    className={`h-4 w-4 ${
                      isLocked ? "text-gray-400" : "text-red-500"
                    }`}
                    fill={isLocked ? "none" : "currentColor"}
                  />
                  <span className="font-bold">×{quest.heartsReward}</span>
                </div>
              )}

              {quest.badgeReward && (
                <div className="flex items-center gap-1 text-sm">
                  <span
                    className={`font-bold ${
                      isLocked ? "text-gray-400" : "text-yellow-600"
                    }`}
                  >
                    🏅 {quest.badgeReward}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {quest.expiresIn && !isCompleted && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    {intl.formatMessage(
                      {
                        id: "quest.expiresIn",
                        defaultMessage: "Expires in {time}",
                      },
                      { time: quest.expiresIn }
                    )}
                  </span>
                </div>
              )}

              {!isLocked && !isCompleted && onProgressUpdate && (
                <Button
                  size="sm"
                  onClick={() => onProgressUpdate(quest.id)}
                  disabled={isUpdating}
                  className="ml-2 hidden"
                >
                  {isUpdating
                    ? intl.formatMessage({
                        id: "quest.loading",
                        defaultMessage: "...",
                      })
                    : intl.formatMessage({
                        id: "quest.progressButton",
                        defaultMessage: "Progress",
                      })}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
}
