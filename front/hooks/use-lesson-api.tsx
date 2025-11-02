"use client";

import { apiClient } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { type AxiosError } from "axios";
import { toast } from "sonner";

/**
 * Custom hook for lesson-related API calls
 * Handles lesson completion, rewards, exercises, and hearts management
 */
export function useLessonAPI() {
  const { getToken, userId } = useAuth();

  /**
   * Complete a lesson via API
   */
  const completeLessonApi = async ({
    lessonId,
    gems = 0,
    gel = 0,
    xpBoost = null,
  }: {
    lessonId: string;
    gems?: number;
    gel?: number;
    xpBoost?: { durationMinutes: number; multiplier: number } | null;
  }) => {
    const token = await getToken();
    try {
      const response = await apiClient.post(
        "/api/progress/addlesson",
        {
          lessonId,
          xp: 0, // XP will be handled separately
          gems,
          gel,
          xpBoost,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("lesson completed :", response.data);

      return response.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  /**
   * Add reward to user account
   */
  const addRewardApi = async ({
    type,
    amount,
    reason,
    lessonId,
  }: {
    type: "xp" | "gems" | "gel" | "hearts";
    amount: number;
    reason: string;
    lessonId: string;
  }) => {
    const token = await getToken();
    try {
      const response = await apiClient.post(
        `/api/progress/addreward`,
        {
          type,
          amount,
          reason,
          userId,
          lessonId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  /**
   * Add userquest
   */
  const addUserQuest = async ({
    type,
    conditionType,
    rewardType,
    amount,
  }: {
    type: string;
    conditionType: string;
    rewardType: string;
    amount: number;
  }) => {
    const token = await getToken();
    try {
      const response = await apiClient.post(
        `/api/users/${userId}/userquests`,
        {
          type,
          conditionType,
          rewardType,
          amount,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      handleApiError(err);
      throw err;
    }
  };

  /**
   * Add completed exercises to user progress
   */
  const addExercisesApi = async ({
    lessonId,
    exerciseIds,
  }: {
    lessonId?: string;
    exerciseIds: string[];
  }) => {
    const token = await getToken();
    try {
      const response = await apiClient.post(
        "/api/progress/addexercise",
        {
          lessonId,
          exerciseIds,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Failed to add exercises:", error);
      throw error;
    }
  };

  /**
   * Update user hearts (increment or decrement)
   */
  const updateUserHearts = async (amount: number, action: "inc" | "dec") => {
    try {
      const token = await getToken();
      const response = await apiClient.put(
        `/api/users/${userId}/hearts?action=${action}`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || "Failed to update hearts");
      }
    } catch (error) {
      console.error("Error updating hearts:", error);
      throw error;
    }
  };

  /**
   * Handle API errors with user-friendly messages
   */
  const handleApiError = (err: unknown) => {
    const error = err as AxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
    }>;

    const apiErrors = error.response?.data?.errors;
    const message = error.response?.data?.message;

    if (apiErrors && typeof apiErrors === "object") {
      Object.entries(apiErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) => toast.error(`${field}: ${msg}`));
        }
      });
    } else {
      toast.error(message || "An unknown error occurred.");
    }
  };

  return {
    completeLessonApi,
    addRewardApi,
    addExercisesApi,
    updateUserHearts,
    addUserQuest,
  };
}
