"use client";

import { FormattedMessage } from "react-intl";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { QuestCard } from "./quest-card";
import { EmptyState } from "./empty-state";

import type { Quest } from "@/types";

interface QuestsTabsViewProps {
  /** Array of quests to display */
  quests: Quest[];
  /** Currently active tab */
  activeTab: string;
  /** Callback for editing a quest */
  onEditQuest: (quest: Quest) => void;
  /** Callback for viewing quest details */
  onViewDetails: (quest: Quest) => void;
  /** Callback for deleting a quest */
  onDeleteQuest: (questId: string) => void;
  /** Callback for changing quest status */
  onStatusChange: (questId: string, action: string) => void;
  /** Callback for clearing all filters */
  onClearFilters: () => void;
}

/**
 * Quests Tabs View Component
 *
 * Displays quests in different tab views (all, active, upcoming, expired).
 * Each tab shows filtered quests based on their status and provides
 * appropriate actions for each quest state.
 *
 * @param {QuestsTabsViewProps} props - The component props
 * @returns {JSX.Element} Tabbed view of quests with filtering
 */
export function QuestsTabsView({
  quests,
  activeTab,
  onEditQuest,
  onViewDetails,
  onDeleteQuest,
  onStatusChange,
  onClearFilters,
}: QuestsTabsViewProps) {
  /**
   * Filters quests based on the active tab
   * @returns {Quest[]} Filtered array of quests
   */
  const getFilteredQuests = (): Quest[] => {
    switch (activeTab) {
      case "active":
        return quests.filter((quest) => quest.status === "active");
      case "upcoming":
        return quests.filter(
          (quest) =>
            quest.status === "draft" && new Date(quest.startDate) > new Date()
        );
      case "expired":
        return quests.filter((quest) => quest.status === "expired");
      default:
        return quests;
    }
  };

  const filteredQuests = getFilteredQuests();

  /**
   * Renders the quest list or empty state
   * @param {Quest[]} questsToRender - Array of quests to display
   * @returns {JSX.Element} Quest cards or empty state
   */
  const renderQuestList = (questsToRender: Quest[]) => {
    if (questsToRender.length === 0) {
      return (
        <EmptyState
          title={
            <FormattedMessage
              id="admin.quests.empty.title"
              defaultMessage="No quests found matching your filters."
            />
          }
          action={
            <Button variant="link" onClick={onClearFilters}>
              <FormattedMessage
                id="admin.quests.empty.clearFilters"
                defaultMessage="Clear filters"
              />
            </Button>
          }
        />
      );
    }

    return (
      <div className="space-y-4">
        {questsToRender.map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onEdit={() => onEditQuest(quest)}
            onViewDetails={() => onViewDetails(quest)}
            onDelete={() => onDeleteQuest(quest.id)}
            onStatusChange={(action) => onStatusChange(quest.id, action)}
            variant={
              activeTab === "upcoming"
                ? "upcoming"
                : activeTab === "expired"
                ? "expired"
                : "default"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <Tabs value={activeTab}>
      {/* All Quests Tab */}
      <TabsContent value="all" className="m-0">
        {renderQuestList(filteredQuests)}
      </TabsContent>

      {/* Active Quests Tab */}
      <TabsContent value="active" className="m-0">
        {renderQuestList(filteredQuests)}
      </TabsContent>

      {/* Upcoming Quests Tab */}
      <TabsContent value="upcoming" className="m-0">
        {renderQuestList(filteredQuests)}
      </TabsContent>

      {/* Expired Quests Tab */}
      <TabsContent value="expired" className="m-0">
        {renderQuestList(filteredQuests)}
      </TabsContent>
    </Tabs>
  );
}
