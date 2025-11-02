import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import {
  getTotalUsers,
  getCompletedLessons,
  getActiveQuests,
  getMonthlyRevenue,
  getUserActivityData,
} from "@/actions/dashboard";
import type { DashboardData } from "@/types";
import { DashboardHeader } from "@/components/modules/admin/dashboard/dashboard-header";
import { DashboardStats } from "@/components/modules/admin/dashboard/dashboard-stats";
import { ActivityChart } from "@/components/modules/admin/dashboard/activity-chart";
import TabsTriggers from "@/components/modules/admin/dashboard/tabs-trigger";

export default async function AdminDashboard() {
  // Fetch data using server actions that call API routes
  const [usersData, lessonsData, questsData, revenueData, activityData] =
    await Promise.all([
      getTotalUsers(),
      getCompletedLessons(),
      getActiveQuests(),
      getMonthlyRevenue(),
      getUserActivityData(),
    ]);

  const dashboardData: DashboardData = {
    usersData,
    lessonsData,
    questsData,
    revenueData,
    activityData,
  };

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTriggers />
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <DashboardStats
            usersData={dashboardData.usersData}
            lessonsData={dashboardData.lessonsData}
            questsData={dashboardData.questsData}
            revenueData={dashboardData.revenueData}
          />
          <div className="grid gap-4 md:grid-cols-auto">
            <ActivityChart data={dashboardData.activityData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
