"use client";
import { Users, BookOpen, Star, CreditCard } from "lucide-react";
import type {
  LessonStats,
  QuestStats,
  RevenueStats,
  UserStatsResponse,
} from "@/types";
import { StatsCard } from "./stats-card";

interface DashboardStatsProps {
  usersData: UserStatsResponse;
  lessonsData: LessonStats;
  questsData: QuestStats;
  revenueData: RevenueStats;
}

export function DashboardStats({
  usersData,
  lessonsData,
  questsData,
  revenueData,
}: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Users"
        titleId="admin.dashboard.stats.totalUsers"
        icon={Users}
        value={usersData.count}
        trend={usersData.trend}
        percentageChange={usersData.percentageChange}
        subtitleId="admin.dashboard.stats.monthlyChange"
        subtitle="{percentage}% compared to last month"
      />

      <StatsCard
        title="Completed Lessons"
        titleId="admin.dashboard.stats.completedLessons"
        icon={BookOpen}
        value={lessonsData.count}
        trend={lessonsData.trend}
        percentageChange={lessonsData.percentageChange}
        subtitleId="admin.dashboard.stats.monthlyChange"
        subtitle="{percentage}% compared to last month"
      />

      <StatsCard
        title="Active Quests"
        titleId="admin.dashboard.stats.activeQuests"
        icon={Star}
        value={questsData.count}
        subtitleId="admin.dashboard.stats.newQuests"
        subtitle="+{newQuests} new quests this month"
        subtitleValues={{ newQuests: questsData.newThisMonth }}
      />

      <StatsCard
        title="Monthly Revenue"
        titleId="admin.dashboard.stats.monthlyRevenue"
        icon={CreditCard}
        value={revenueData.amount}
        trend={revenueData.trend}
        percentageChange={revenueData.percentageChange}
        subtitleId="admin.dashboard.stats.monthlyChange"
        subtitle="${percentage}% compared to last month"
      />
    </div>
  );
}
