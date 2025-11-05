"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  BarChart3,
  Calendar,
  Edit,
  Eye,
  EyeOff,
  Pause,
  Play,
  Trash2,
  Users,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import types
import type { Quest } from "@/types";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

interface QuestDetailsDialogProps {
  quest: Quest;
  onEdit: () => void;
}

// Types for API responses
interface UserCompletion {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  avatar: string | null;
  completedAt: string;
  timeSpent: number;
  attempts: number;
  totalRewardsValue: number;
  rewardsClaimed: unknown[];
}

interface QuestAnalytics {
  overview: {
    totalAssigned: number;
    totalStarted: number;
    totalCompleted: number;
    totalAbandoned: number;
    completionRate: number;
    averageTimeToComplete: number;
    averageProgress: number;
    abandonmentRate: number;
  };
  dailyActivity: Array<{
    date: string;
    usersStarted: number;
    usersCompleted: number;
    completionRate: number;
  }>;
  segmentation: {
    byLevel: { beginners: number; intermediate: number; advanced: number };
    byLanguage: { spanish: number; french: number; german: number };
    byPlatform: { mobile: number; desktop: number; tablet: number };
  };
  recentActivities: Array<{
    clerkId: string;
    status: string;
    progress: number;
    lastActivity: string;
  }>;
}

interface QuestHistoryItem {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  details?: {
    previousStatus: string;
    newStatus: string;
  };
}

const EMPTY_ANALYTICS: QuestAnalytics = {
  overview: {
    totalAssigned: 0,
    totalStarted: 0,
    totalCompleted: 0,
    totalAbandoned: 0,
    completionRate: 0,
    averageTimeToComplete: 0,
    averageProgress: 0,
    abandonmentRate: 0,
  },
  dailyActivity: [],
  segmentation: {
    byLevel: { beginners: 0, intermediate: 0, advanced: 0 },
    byLanguage: { spanish: 0, french: 0, german: 0 },
    byPlatform: { mobile: 0, desktop: 0, tablet: 0 },
  },
  recentActivities: [],
};

export function QuestDetailsDialog({ quest, onEdit }: QuestDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isUpdating, setIsUpdating] = useState(false);
  const { getToken } = useAuth();

  // State for fetched data
  const [userCompletions, setUserCompletions] = useState<UserCompletion[]>([]);
  const [analytics, setAnalytics] = useState<QuestAnalytics | null>(null);
  const [questHistory, setQuestHistory] = useState<QuestHistoryItem[]>([]);
  const [loadingCompletions, setLoadingCompletions] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch user completions
  const fetchUserCompletions = async () => {
    try {
      setLoadingCompletions(true);
      const token = await getToken();

      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL +
          `/api/admin/quests/${quest.id}/completions?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUserCompletions(response.data.data.completions);
      }
    } catch (error) {
      console.error("Error fetching user completions:", error);
      toast.error("Failed to fetch user completions");
    } finally {
      setLoadingCompletions(false);
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const token = await getToken();

      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL +
          `/api/admin/quests/${quest.id}/analytics?days=30`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const analyticsData = response.data.data ?? {};
        const overview = {
          ...EMPTY_ANALYTICS.overview,
          ...(analyticsData.overview ?? {}),
        };
        const segmentation = {
          byLevel: {
            ...EMPTY_ANALYTICS.segmentation.byLevel,
            ...(analyticsData.segmentation?.byLevel ?? {}),
          },
          byLanguage: {
            ...EMPTY_ANALYTICS.segmentation.byLanguage,
            ...(analyticsData.segmentation?.byLanguage ?? {}),
          },
          byPlatform: {
            ...EMPTY_ANALYTICS.segmentation.byPlatform,
            ...(analyticsData.segmentation?.byPlatform ?? {}),
          },
        };

        setAnalytics({
          overview,
          dailyActivity: Array.isArray(analyticsData.dailyActivity)
            ? analyticsData.dailyActivity
            : [],
          segmentation,
          recentActivities: Array.isArray(analyticsData.recentActivities)
            ? analyticsData.recentActivities
            : [],
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Fetch quest history
  const fetchQuestHistory = async () => {
    try {
      setLoadingHistory(true);
      const token = await getToken();

      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL +
          `/api/admin/quests/${quest.id}/history?limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setQuestHistory(response.data.data.history);
      }
    } catch (error) {
      console.error("Error fetching quest history:", error);
      toast.error("Failed to fetch quest history");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch data when component mounts or quest changes
  useEffect(() => {
    if (quest.id) {
      fetchUserCompletions();
      fetchAnalytics();
      fetchQuestHistory();
    }
  }, [quest.id]);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === "completions" && userCompletions.length === 0) {
      fetchUserCompletions();
    } else if (activeTab === "analytics" && !analytics) {
      fetchAnalytics();
    } else if (activeTab === "history" && questHistory.length === 0) {
      fetchQuestHistory();
    }
  }, [activeTab]);

  // Handle quest status change
  const handleStatusChange = async (action: string) => {
    try {
      setIsUpdating(true);

      const token = await getToken();

      const response = await axios.patch(
        process.env.NEXT_PUBLIC_API_URL + `/api/admin/quests/${quest.id}`,
        { action },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.error || "Failed to update quest status");
      }

      toast.success(data.message);

      // Update local quest status
      quest.status = data.data.status;
      quest.updatedAt = new Date(data.data.updatedAt);

      // Refresh analytics and history after status change
      fetchAnalytics();
      fetchQuestHistory();
    } catch (err) {
      console.error("Error updating quest status:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update quest status"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle quest visibility toggle
  const handleVisibilityToggle = async () => {
    try {
      setIsUpdating(true);

      const token = await getToken();

      const response = await axios.put(
        process.env.NEXT_PUBLIC_API_URL + `/api/admin/quests/${quest.id}`,
        {
          isVisible: !quest.isVisible,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.error || "Failed to update quest visibility");
      }

      toast.success(
        `Quest ${quest.isVisible ? "hidden" : "shown"} successfully`
      );

      // Update local quest visibility
      quest.isVisible = !quest.isVisible;
      quest.updatedAt = new Date(data.data.updatedAt);

      // Refresh history after visibility change
      fetchQuestHistory();
    } catch (err) {
      console.error("Error updating quest visibility:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update quest visibility"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle quest deletion
  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this quest? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setIsUpdating(true);

      const token = await getToken();

      const response = await axios.delete(
        process.env.NEXT_PUBLIC_API_URL + `/api/admin/quests/${quest.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.error || "Failed to delete quest");
      }
      toast.success("Quest deleted successfully");

      // Close dialog and refresh parent component
      window.location.reload(); // Simple refresh for now
    } catch (err) {
      console.error("Error deleting quest:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete quest"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "draft":
        return <Badge className="bg-blue-500">Draft</Badge>;
      case "expired":
        return <Badge className="bg-gray-500">Expired</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500">Paused</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "daily":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            Daily
          </Badge>
        );
      case "weekly":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            Weekly
          </Badge>
        );
      case "event":
        return (
          <Badge
            variant="outline"
            className="border-purple-500 text-purple-700"
          >
            Event
          </Badge>
        );
      case "custom":
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-700"
          >
            Custom
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getRewardDisplay = (reward: {
    type: string;
    value: string | number;
  }) => {
    switch (reward.type) {
      case "xp":
        return (
          <span className="flex items-center gap-1">{reward.value} XP</span>
        );
      case "gems":
        return (
          <span className="flex items-center gap-1">{reward.value} Gems</span>
        );
      case "badge":
        return (
          <span className="flex items-center gap-1">Badge: {reward.value}</span>
        );
      default:
        return <span>{reward.value}</span>;
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DialogTitle>{quest.title}</DialogTitle>
            {getStatusBadge(quest.status)}
            {getTypeBadge(quest.type)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={isUpdating}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const action =
                  quest.status === "paused" || "draft" ? "resume" : "pause";
                handleStatusChange(action);
              }}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : quest.status === "paused" || quest.status === "draft" ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleVisibilityToggle}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : quest.isVisible ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Show
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600"
              onClick={handleDelete}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </div>
        <DialogDescription>{quest.description}</DialogDescription>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="completions">Completions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Quest Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Status</dt>
                    <dd className="font-medium">
                      {getStatusBadge(quest.status)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Type</dt>
                    <dd className="font-medium">{getTypeBadge(quest.type)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Goal</dt>
                    <dd className="font-medium">{quest.goal}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Reward</dt>
                    <dd className="font-medium">
                      {getRewardDisplay(quest.reward)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Target Users</dt>
                    <dd className="font-medium capitalize">
                      {quest.targetSegment}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Visibility</dt>
                    <dd className="font-medium">
                      {quest.isVisible ? "Visible" : "Hidden"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(quest.startDate, "MMMM d, yyyy")} -{" "}
                      {format(quest.endDate, "MMMM d, yyyy")}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Completion Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnalytics ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : analytics ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          Overall Completion
                        </span>
                        <span className="text-sm font-medium">
                          {analytics.overview.completionRate}%
                        </span>
                      </div>
                      <Progress
                        value={analytics.overview.completionRate}
                        className="h-2"
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-muted-foreground">
                            Users Assigned
                          </dt>
                          <dd className="font-medium">
                            {analytics.overview.totalAssigned}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Users Completed
                          </dt>
                          <dd className="font-medium">
                            {analytics.overview.totalCompleted}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Users Started
                          </dt>
                          <dd className="font-medium">
                            {analytics.overview.totalStarted}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Average Progress
                          </dt>
                          <dd className="font-medium">
                            {analytics.overview.averageProgress}%
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          Overall Completion
                        </span>
                        <span className="text-sm font-medium">
                          {quest.completionRate}%
                        </span>
                      </div>
                      <Progress value={quest.completionRate} className="h-2" />
                    </div>

                    <div className="pt-4 border-t">
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-muted-foreground">
                            Users Assigned
                          </dt>
                          <dd className="font-medium">{quest.usersAssigned}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Users Completed
                          </dt>
                          <dd className="font-medium">
                            {quest.usersCompleted}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Users Started
                          </dt>
                          <dd className="font-medium">{quest.usersStarted}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Average Progress
                          </dt>
                          <dd className="font-medium">
                            {quest.averageProgress || 0}%
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Recent Activity
              </CardTitle>
              <CardDescription>
                Latest user interactions with this quest
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAnalytics ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : analytics?.recentActivities.length ? (
                <div className="space-y-4">
                  {analytics.recentActivities
                    .slice(0, 3)
                    .map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              User {(activity.clerkId ?? "unknown").slice(0, 8)}
                              ... -{" "}
                              {activity.status}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(activity.lastActivity),
                                "MMMM d, yyyy"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {activity.progress}% complete
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No recent activity data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completions" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                User Completions
              </CardTitle>
              <CardDescription>
                Users who have completed this quest
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCompletions ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : userCompletions.length > 0 ? (
                <div className="space-y-4">
                  {userCompletions.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.attempts} attempt
                            {user.attempts !== 1 ? "s" : ""} •
                            {user.totalRewardsValue > 0 &&
                              ` ${user.totalRewardsValue} rewards`}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        Completed on{" "}
                        {format(new Date(user.completedAt), "MMM d, yyyy")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No completions yet
                </div>
              )}

              {userCompletions.length > 0 && (
                <div className="mt-4 pt-4 border-t flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUserCompletions}
                  >
                    Refresh Completions
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Completion Analytics
              </CardTitle>
              <CardDescription>
                Detailed statistics about quest performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAnalytics ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : analytics ? (
                <>
                  <div className="h-[300px] flex items-center justify-center border rounded-md">
                    <div className="flex flex-col items-center text-center">
                      <BarChart3 className="h-16 w-16 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Daily activity chart would be displayed here
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {analytics.dailyActivity.length} days of data available
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">
                          Completion by User Level
                        </div>
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Beginners</span>
                              <span className="text-xs">
                                {analytics.segmentation.byLevel.beginners}%
                              </span>
                            </div>
                            <Progress
                              value={analytics.segmentation.byLevel.beginners}
                              className="h-1"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Intermediate</span>
                              <span className="text-xs">
                                {analytics.segmentation.byLevel.intermediate}%
                              </span>
                            </div>
                            <Progress
                              value={
                                analytics.segmentation.byLevel.intermediate
                              }
                              className="h-1"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Advanced</span>
                              <span className="text-xs">
                                {analytics.segmentation.byLevel.advanced}%
                              </span>
                            </div>
                            <Progress
                              value={analytics.segmentation.byLevel.advanced}
                              className="h-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">
                          Completion by Language
                        </div>
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Spanish</span>
                              <span className="text-xs">
                                {analytics.segmentation.byLanguage.spanish}%
                              </span>
                            </div>
                            <Progress
                              value={analytics.segmentation.byLanguage.spanish}
                              className="h-1"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">French</span>
                              <span className="text-xs">
                                {analytics.segmentation.byLanguage.french}%
                              </span>
                            </div>
                            <Progress
                              value={analytics.segmentation.byLanguage.french}
                              className="h-1"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">German</span>
                              <span className="text-xs">
                                {analytics.segmentation.byLanguage.german}%
                              </span>
                            </div>
                            <Progress
                              value={analytics.segmentation.byLanguage.german}
                              className="h-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">
                          Completion by Platform
                        </div>
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Mobile</span>
                              <span className="text-xs">
                                {analytics.segmentation.byPlatform.mobile}%
                              </span>
                            </div>
                            <Progress
                              value={analytics.segmentation.byPlatform.mobile}
                              className="h-1"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Desktop</span>
                              <span className="text-xs">
                                {analytics.segmentation.byPlatform.desktop}%
                              </span>
                            </div>
                            <Progress
                              value={analytics.segmentation.byPlatform.desktop}
                              className="h-1"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Tablet</span>
                              <span className="text-xs">
                                {analytics.segmentation.byPlatform.tablet}%
                              </span>
                            </div>
                            <Progress
                              value={analytics.segmentation.byPlatform.tablet}
                              className="h-1"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center border rounded-md">
                  <div className="flex flex-col items-center text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Failed to load analytics data
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Quest History
              </CardTitle>
              <CardDescription>
                Audit log of changes to this quest
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : questHistory.length > 0 ? (
                <div className="space-y-4">
                  {questHistory.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          By {log.user}
                        </p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {JSON.stringify(log.details, null, 2).slice(0, 100)}
                            ...
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(
                          new Date(log.timestamp),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No history data available
                </div>
              )}

              {questHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQuestHistory}
                  >
                    Refresh History
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
