"use client";

import { apiClient } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

/**
 * Custom hook for updating quest progress
 * Handles XP-related and lesson completion quest updates
 */
export function useQuestProgress() {
  const { getToken } = useAuth();

  /**
   * Update quest progress for a user
   * Handles both XP earning and lesson completion quests
   */
  const updateQuestProgress = async (userId: string, earnedXp: number) => {
    try {
      const token = await getToken();

      // Update XP-related quests
      if (!token) {
        return;
      }
      await updateXpQuests(token, userId, earnedXp);

      // Update lesson completion quests
      await updateLessonCompletionQuests(token, userId);
    } catch (error) {
      console.error("Failed to update quest progress:", error);
    }
  };

  /**
   * Update progress for XP-earning quests
   */
  const updateXpQuests = async (
    token: string,
    userId: string,
    earnedXp: number
  ) => {
    try {
      const response = await apiClient.put(
        `/api/users/${userId}/quests`,
        {
          conditionType: "earn_xp", // Target quests with this condition type
          incrementValue: earnedXp, // Use the XP earned as the increment value
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log("XP quest progress updated:", response.data);

        // Show notification if a quest was completed
        if (response.data.data.wasCompleted) {
          toast.success("Quest completed! 🎉");
        }
      }
    } catch (error) {
      console.error("Failed to update XP quest progress:", error);
    }
  };

  /**
   * Update progress for lesson completion quests
   */
  const updateLessonCompletionQuests = async (
    token: string,
    userId: string
  ) => {
    try {
      const response = await apiClient.put(
        `/api/users/${userId}/quests`,
        {
          conditionType: "complete_lessons", // Target lesson completion quests
          incrementValue: 1, // Increment by 1 since one lesson was completed
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        console.log("Lesson completion quest progress updated:", response.data);

        // Show notification if a quest was completed
        if (response.data.data.wasCompleted) {
          toast.success("Lesson quest completed! 🎉");
        }
      }
    } catch (error) {
      console.error(
        "Failed to update lesson completion quest progress:",
        error
      );
    }
  };

  return {
    updateQuestProgress,
  };
}
