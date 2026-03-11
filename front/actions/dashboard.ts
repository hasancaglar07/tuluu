import {
  ActivityDataPoint,
  LessonStats,
  QuestStats,
  RevenueStats,
  UserStatsResponse,
} from "@/types";

import { apiClient } from "@/lib/api-client";

import { auth } from "@clerk/nextjs/server";
import { cache } from "react";

const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.length > 0) {
    return envUrl;
  }
  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }
  return window.location.origin.replace(":3000", ":3001");
};

const getServerAuthToken = cache(async () => {
  const { getToken } = await auth();
  return getToken();
});

const getAuthHeaders = async () => {
  const token = await getServerAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Get total users count and month-over-month change
export async function getTotalUsers(): Promise<UserStatsResponse> {
  try {
    const headers = await getAuthHeaders();

    const data = await apiClient.get<UserStatsResponse>(
      `${getApiBaseUrl()}/api/admin/dashboard/users`,
      {
        headers,
      }
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching total users:", error);
    return { count: 0, percentageChange: 0, trend: "neutral" };
  }
}

// Get completed lessons count and month-over-month change
export async function getCompletedLessons(): Promise<LessonStats> {
  try {
    const headers = await getAuthHeaders();

    const data = await apiClient.get<LessonStats>(
      `${getApiBaseUrl()}/api/admin/dashboard/lessons`,
      {
        headers,
      }
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching completed lessons:", error);
    return { count: 0, percentageChange: 0, trend: "neutral" };
  }
}

// Get active quests count and month-over-month change
export async function getActiveQuests(): Promise<QuestStats> {
  try {
    const headers = await getAuthHeaders();

    const data = await apiClient.get<QuestStats>(
      `${getApiBaseUrl()}/api/admin/dashboard/quests`,
      {
        headers,
      }
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching active quests:", error);
    return { count: 0, newThisMonth: 0 };
  }
}

// Get monthly revenue from Stripe
export async function getMonthlyRevenue(): Promise<RevenueStats> {
  try {
    const headers = await getAuthHeaders();

    const data = await apiClient.get<RevenueStats>(
      `${getApiBaseUrl()}/api/admin/dashboard/revenue`,
      {
        headers,
      }
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    return { amount: 0, percentageChange: 0, trend: "neutral" };
  }
}

// Get user activity data for the chart
export async function getUserActivityData(): Promise<ActivityDataPoint[]> {
  try {
    const headers = await getAuthHeaders();

    const data = await apiClient.get<ActivityDataPoint[]>(
      `${getApiBaseUrl()}/api/admin/dashboard/activity`,
      {
        headers,
      }
    );

    return data.data;
  } catch (error) {
    console.error("Error fetching user activity data:", error);

    // Return placeholder data if there's an error
    const data: ActivityDataPoint[] = [];
    const today = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      data.push({
        date: date.toISOString().split("T")[0],
        activeUsers: Math.floor(Math.random() * 100) + 50,
      });
    }

    return data;
  }
}
