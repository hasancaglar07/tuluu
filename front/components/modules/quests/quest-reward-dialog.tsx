"use client";

import { Heart, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormattedMessage } from "react-intl";
import type { Quest } from "@/types";

/**
 * QuestRewardDialog Component
 *
 * Displays a dialog showing rewards for completing a quest.
 */
export function QuestRewardDialog({
  isOpen,
  onClose,
  quest,
}: {
  isOpen: boolean;
  onClose: () => void;
  quest: Quest | null;
}) {
  if (!quest) return null;

  const getQuestIcon = () => {
    switch (quest.duration) {
      case "daily":
        return <div className="text-4xl">⚡</div>;
      case "weekly":
        return <div className="text-4xl">🎯</div>;
      case "monthly":
        return <div className="text-4xl">🎁</div>;
      case "special":
        return <div className="text-4xl">✅</div>;
      default:
        return <div className="text-4xl">🌟</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            <FormattedMessage
              id="quest.dialog.title"
              defaultMessage="Quest completed!"
            />
          </DialogTitle>
          <DialogDescription className="text-center">
            <FormattedMessage
              id="quest.dialog.description"
              defaultMessage="Congratulations! You have completed a quest and earned rewards."
            />
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              {getQuestIcon()}
            </div>
          </div>

          <h5 className="text-center font-bold text-lg mb-4">{quest.title}</h5>

          <div className="flex justify-center gap-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-yellow-500 font-bold text-xl mb-1">
                <Star className="h-5 w-5" />
                <span>+{quest.xpReward}</span>
              </div>
              <span className="text-sm text-gray-500">
                <FormattedMessage id="quest.reward.xp" defaultMessage="XP" />
              </span>
            </div>

            {quest.heartsReward && (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1 text-red-500 font-bold text-xl mb-1">
                  <Heart className="h-5 w-5" fill="currentColor" />
                  <span>+{quest.heartsReward}</span>
                </div>
                <span className="text-sm text-gray-500">
                  <FormattedMessage
                    id="quest.reward.hearts"
                    defaultMessage="Hearts"
                  />
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            <FormattedMessage
              id="quest.dialog.continue"
              defaultMessage="Continue"
            />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
