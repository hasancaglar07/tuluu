"use client";

import { QuestCard } from "./quest-card";
import type { Quest } from "@/types";

/**
 * QuestList Component
 *
 * Displays a list of quests with a title.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Title for the quest list section
 * @param {Quest[]} props.quests - Array of quests to display
 * @param {Function} props.onProgressUpdate - Function to handle progress updates
 * @param {boolean} props.isCompleted - Whether these are completed quests
 * @param {boolean} props.isLocked - Whether these are locked quests
 * @param {boolean} props.isUpdating - Whether a progress update is in progress
 */
export function QuestList({
  title,
  quests,
  onProgressUpdate,
  isCompleted = false,
  isLocked = false,
  isUpdating = false,
}: {
  title: string;
  quests: Quest[];
  onProgressUpdate?: (questId: string) => void;
  isCompleted?: boolean;
  isLocked?: boolean;
  isUpdating?: boolean;
}) {
  return (
    <div className="mb-8">
      <h2 className="font-bold text-lg mb-4">{title}</h2>
      <div className="space-y-4">
        {quests.map((quest, index) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            index={index}
            onProgressUpdate={onProgressUpdate}
            isCompleted={isCompleted}
            isLocked={isLocked}
            isUpdating={isUpdating}
          />
        ))}
      </div>
    </div>
  );
}
