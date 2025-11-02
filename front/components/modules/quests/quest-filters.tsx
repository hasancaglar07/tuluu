"use client";

import { Button } from "@/components/ui/button";
import { FormattedMessage } from "react-intl";
import type { QuestDuration } from "@/types";

/**
 * QuestFilters Component
 *
 * Renders a set of filter buttons to allow users to filter quests
 * based on their duration type.
 *
 * @param {Object} props - Component props
 * @param {QuestDuration | "all"} props.activeFilter - The currently selected filter
 * @param {(filter: QuestDuration | "all") => void} props.onFilterChange - Callback when filter is changed
 */
export function QuestFilters({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: QuestDuration | "all";
  onFilterChange: (filter: QuestDuration | "all") => void;
}) {
  /**
   * List of available filter options with localization keys
   */
  const filters = [
    { value: "all", messageId: "quests.filter.all" },
    { value: "daily", messageId: "quests.filter.daily" },
    { value: "weekly", messageId: "quests.filter.weekly" },
    { value: "monthly", messageId: "quests.filter.monthly" },
    { value: "special", messageId: "quests.filter.special" },
  ] as const;

  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? "default" : "outline"}
          onClick={() => onFilterChange(filter.value)}
          className="whitespace-nowrap"
        >
          <FormattedMessage
            id={filter.messageId}
            defaultMessage={filter.value}
          />
        </Button>
      ))}
    </div>
  );
}
