"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import type {
  ActivityDataPoint,
  LessonStats,
  QuestStats,
  RevenueStats,
  UserStatsResponse,
} from "@/types";
import { DashboardHeader } from "@/components/modules/admin/dashboard/dashboard-header";
import { DashboardStats } from "@/components/modules/admin/dashboard/dashboard-stats";
import { ActivityChart } from "@/components/modules/admin/dashboard/activity-chart";
import TabsTriggers from "@/components/modules/admin/dashboard/tabs-trigger";
import { apiClient } from "@/lib/api-client";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

const EMPTY_USERS: UserStatsResponse = {
  count: 0,
  percentageChange: 0,
  trend: "neutral",
};

const EMPTY_LESSONS: LessonStats = {
  count: 0,
  percentageChange: 0,
  trend: "neutral",
};

const EMPTY_QUESTS: QuestStats = {
  count: 0,
  newThisMonth: 0,
};

const EMPTY_REVENUE: RevenueStats = {
  amount: 0,
  percentageChange: 0,
  trend: "neutral",
};

const EMPTY_ACTIVITY: ActivityDataPoint[] = [];

type DashboardApiState = {
  usersData: UserStatsResponse;
  lessonsData: LessonStats;
  questsData: QuestStats;
  revenueData: RevenueStats;
  activityData: ActivityDataPoint[];
};

const INITIAL_STATE: DashboardApiState = {
  usersData: EMPTY_USERS,
  lessonsData: EMPTY_LESSONS,
  questsData: EMPTY_QUESTS,
  revenueData: EMPTY_REVENUE,
  activityData: EMPTY_ACTIVITY,
};

export default function AdminDashboardClient() {
  const { getToken } = useAuth();
  const router = useLocalizedRouter();
  const [state, setState] = useState<DashboardApiState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const hasPrefetchedRoutes = useRef(false);

  useEffect(() => {
    if (hasPrefetchedRoutes.current) {
      return;
    }

    hasPrefetchedRoutes.current = true;
    router.prefetch("/admin/lessons");
    router.prefetch("/admin/users");
    router.prefetch("/admin/quests");
    router.prefetch("/admin/shop");
    router.prefetch("/admin/payments");
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [usersRes, lessonsRes, questsRes, activityRes] =
          await Promise.allSettled([
            apiClient.get<UserStatsResponse>("/api/admin/dashboard/users", {
              headers,
            }),
            apiClient.get<LessonStats>("/api/admin/dashboard/lessons", {
              headers,
            }),
            apiClient.get<QuestStats>("/api/admin/dashboard/quests", {
              headers,
            }),
            apiClient.get<ActivityDataPoint[]>("/api/admin/dashboard/activity", {
              headers,
            }),
          ]);

        if (cancelled) {
          return;
        }

        setState((prev) => ({
          ...prev,
          usersData:
            usersRes.status === "fulfilled" ? usersRes.value.data : EMPTY_USERS,
          lessonsData:
            lessonsRes.status === "fulfilled"
              ? lessonsRes.value.data
              : EMPTY_LESSONS,
          questsData:
            questsRes.status === "fulfilled"
              ? questsRes.value.data
              : EMPTY_QUESTS,
          activityData:
            activityRes.status === "fulfilled"
              ? activityRes.value.data
              : EMPTY_ACTIVITY,
        }));
        setIsLoading(false);

        // Revenue is the slowest endpoint; load it progressively so first paint is instant.
        const revenueRes = await apiClient.get<RevenueStats>(
          "/api/admin/dashboard/revenue",
          { headers, timeout: 2000 }
        );
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            revenueData: revenueRes.data,
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setIsLoading(false);
        }
        console.error("Admin dashboard fetch error:", error);
      }
    };

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [getToken]);

  const activityData = useMemo(
    () => (state.activityData.length > 0 ? state.activityData : EMPTY_ACTIVITY),
    [state.activityData]
  );

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTriggers />
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <DashboardStats
            usersData={state.usersData}
            lessonsData={state.lessonsData}
            questsData={state.questsData}
            revenueData={state.revenueData}
          />
          <div className="grid gap-4 md:grid-cols-auto">
            <ActivityChart data={activityData} />
          </div>
          {isLoading && (
            <div className="text-sm text-muted-foreground animate-pulse">
              Dashboard verileri yukleniyor...
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
