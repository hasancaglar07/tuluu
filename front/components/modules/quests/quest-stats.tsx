"use client";

import { FormattedMessage } from "react-intl";

/**
 * QuestStats Component
 *
 * Displays user statistics related to quests.
 */
export function QuestStats({
  completedCount,
  xp,
  streak,
}: {
  completedCount: number;
  xp: number;
  streak: number;
}) {
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">
            <FormattedMessage
              id="quest.stats.title"
              defaultMessage="Your Stats"
            />
          </h2>
          <p className="text-gray-600">
            <FormattedMessage
              id="quest.stats.completed"
              defaultMessage="Quests completed this month: {count}"
              values={{ count: completedCount }}
            />
          </p>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">{xp} XP</div>
          <div className="text-orange-500 flex items-center justify-end gap-1">
            <span>🔥</span>{" "}
            <FormattedMessage
              id="quest.stats.streak"
              defaultMessage="{days} days"
              values={{ days: streak }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
