"use client";

import { useEffect, useState } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

import type { IRootState } from "@/store";
import { addXp, updateHearts } from "@/store/userSlice";

// Import sub-components
import { QuestHeader } from "./quest-header";
import { QuestStats } from "./quest-stats";
import { QuestFilters } from "./quest-filters";
import { QuestList } from "./quest-list";
import { QuestRewardDialog } from "./quest-reward-dialog";
import Loading from "@/components/custom/loading";
import { Quest, QuestDuration, QuestReward } from "@/types";
import { FormattedMessage, useIntl } from "react-intl";
import { apiClient } from "@/lib/api-client";

/**
 * Quests Component
 *
 * Main component for the quests page that:
 * - Fetches user quests from the API
 * - Manages quest filtering by type
 * - Handles quest progress updates
 * - Displays quest completion rewards
 *
 * The component is structured to separate concerns:
 * - Data fetching and state management in the main component
 * - UI elements broken down into smaller, focused components
 */
export default function Quests() {
  const router = useLocalizedRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: IRootState) => state.user);
  const { getToken, userId } = useAuth();
  const { formatMessage } = useIntl();
  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [stats, setStats] = useState({
    completedThisMonth: 0,
    xp: 0,
    streak: 0,
  });
  const [activeFilter, setActiveFilter] = useState<QuestDuration | "all">(
    "all"
  );
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Fetch user quests from the API
   */
  useEffect(() => {
    const fetchUserQuests = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();

        const response = await apiClient.get(`/api/users/${userId}/quests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (process.env.NODE_ENV === "development") {
          console.log(response.data.data);
        }
        if (response.data.success) {
          setQuests(response.data.data.quests);
          setStats(response.data.data.stats);
        } else {
          toast.error("Failed to load quests");
        }
      } catch (error) {
        console.error("Error fetching quests:", error);
        toast.error("Error loading quests. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserQuests();
    }
  }, [userId, getToken]);

  /**
   * Filter quests based on active filter
   */
  const filteredQuests = quests.filter(
    (quest) => activeFilter === "all" || quest.duration === activeFilter
  );

  /**
   * Group quests by status
   */
  const activeQuests = filteredQuests.filter(
    (quest) => quest.status === "active"
  );
  const completedQuests = filteredQuests.filter(
    (quest) => quest.status === "completed"
  );
  const lockedQuests = filteredQuests.filter(
    (quest) => quest.status === "locked"
  );

  /**
   * Handle quest progress update
   * Makes API call to update quest progress and handles rewards
   */
  const updateQuestProgress = async (questId: string) => {
    if (isUpdating) return; // Prevent multiple simultaneous updates

    setIsUpdating(true);

    try {
      const token = await getToken();
      const response = await axios.put(
        process.env.NEXT_PUBLIC_API_URL + `/api/users/${userId}/quests`,
        {
          questId,
          conditionType: "complete_lessons",
          incrementValue: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Find the quest that was updated
        const updatedQuest = quests.find((q) => q.id === questId);

        if (updatedQuest && response.data.data.wasCompleted) {
          // Update local state to reflect completion
          const completedQuest = {
            ...updatedQuest,
            status: "completed" as const,
            progress: updatedQuest.total,
          };

          // Show reward dialog
          setSelectedQuest(completedQuest);
          setShowRewardDialog(true);

          // Update Redux store with rewards
          if (response.data.data.claimedRewards) {
            const { rewards } = response.data.data.claimedRewards;

            // Find XP reward
            const xpReward = rewards.find(
              (r: QuestReward) => r.rewardType === "xp"
            );
            if (xpReward && typeof xpReward.rewardValue === "number") {
              dispatch(addXp(xpReward.rewardValue));
            }

            // Find hearts reward
            const heartsReward = rewards.find(
              (r: QuestReward) => r.rewardType === "hearts"
            );
            if (heartsReward && typeof heartsReward.rewardValue === "number") {
              dispatch(updateHearts(heartsReward.rewardValue));
            }
          }

          // Update quests state
          setQuests((prevQuests) =>
            prevQuests.map((quest) =>
              quest.id === questId ? completedQuest : quest
            )
          );
        } else {
          // Just update progress
          setQuests((prevQuests) =>
            prevQuests.map((quest) =>
              quest.id === questId
                ? {
                    ...quest,
                    progress: Math.min(quest.progress + 1, quest.total),
                  }
                : quest
            )
          );
        }

        toast.success("Quest progress updated!");
      } else {
        toast.error("Failed to update quest progress");
      }
    } catch (error) {
      console.error("Error updating quest progress:", error);
      toast.error("Error updating quest. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <QuestHeader onBack={() => router.push("/dashboard")} />

      {/* Main content */}
      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {/* User stats */}
        <QuestStats
          completedCount={stats.completedThisMonth}
          xp={stats.xp || user.xp}
          streak={stats.streak || user.streak}
        />

        {/* Filters */}
        <QuestFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Active quests */}
        {activeQuests.length > 0 && (
          <QuestList
            title={formatMessage({ id: "quests.active.title" })}
            quests={activeQuests}
            onProgressUpdate={updateQuestProgress}
            isUpdating={isUpdating}
          />
        )}

        {/* Completed quests */}
        {completedQuests.length > 0 && (
          <QuestList
            title={formatMessage({ id: "quests.completed.title" })}
            quests={completedQuests}
            isCompleted
          />
        )}

        {/* Locked quests */}
        {lockedQuests.length > 0 && (
          <QuestList
            title={formatMessage({ id: "quests.locked.title" })}
            quests={lockedQuests}
            isLocked
          />
        )}

        {/* Empty state */}
        {filteredQuests.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <div className="h-12 w-12 text-gray-300 mx-auto">🏆</div>
            </div>
            <h5 className="font-bold text-lg mb-2">
              <FormattedMessage id="quests.empty.title" />
            </h5>
            <p className="text-gray-500">
              <FormattedMessage id="quests.empty.description" />
            </p>
          </div>
        )}
      </div>

      {/* Quest completed dialog */}
      <QuestRewardDialog
        isOpen={showRewardDialog}
        onClose={() => setShowRewardDialog(false)}
        quest={selectedQuest}
      />
    </div>
  );
}
