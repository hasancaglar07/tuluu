import {
  ActivityDataPoint,
  LessonStats,
  QuestStats,
  RevenueStats,
  UserStatsResponse,
} from "@/types";

import { apiClient } from "@/lib/api-client";

import { auth } from "@clerk/nextjs/server";

// Get total users count and month-over-month change
export async function getTotalUsers(): Promise<UserStatsResponse> {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const data = await apiClient.get<UserStatsResponse>(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/dashboard/users`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    const { getToken } = await auth();
    const token = await getToken();

    const data = await apiClient.get<LessonStats>(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/dashboard/lessons`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    const { getToken } = await auth();
    const token = await getToken();

    const data = await apiClient.get<QuestStats>(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/dashboard/quests`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    const { getToken } = await auth();
    const token = await getToken();

    const data = await apiClient.get<RevenueStats>(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/dashboard/revenue`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    const { getToken } = await auth();
    const token = await getToken();

    const data = await apiClient.get<ActivityDataPoint[]>(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/dashboard/activity`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
