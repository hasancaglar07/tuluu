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

  const getTargetSegmentLabel = (segment: string) => {
    switch (segment) {
      case "all":
        return "Tüm kullanıcılar";
      case "free":
        return "Ücretsiz";
      case "premium":
        return "Premium";
      default:
        return segment;
    }
  };

  const getActivityStatusLabel = (status: string) => {
    switch (status) {
      case "started":
        return "başladı";
      case "completed":
        return "tamamladı";
      case "in_progress":
        return "devam ediyor";
      case "abandoned":
        return "bıraktı";
      case "paused":
        return "duraklatıldı";
      default:
        return status;
    }
  };

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
      console.error("Kullanıcı tamamlamaları alınırken hata:", error);
      toast.error("Kullanıcı tamamlamaları alınamadı");
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
      console.error("Analiz verileri alınırken hata:", error);
      toast.error("Analiz verileri alınamadı");
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
      console.error("Görev geçmişi alınırken hata:", error);
      toast.error("Görev geçmişi alınamadı");
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
        throw new Error(data.error || "Görev durumu güncellenemedi");
      }

      toast.success(data.message);

      // Update local quest status
      quest.status = data.data.status;
      quest.updatedAt = new Date(data.data.updatedAt);

      // Refresh analytics and history after status change
      fetchAnalytics();
      fetchQuestHistory();
    } catch (err) {
      console.error("Görev durumu güncelleme hatası:", err);
      toast.error(
        err instanceof Error ? err.message : "Görev durumu güncellenemedi"
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
        throw new Error(data.error || "Görev görünürlüğü güncellenemedi");
      }

      toast.success(
        quest.isVisible
          ? "Görev başarıyla gizlendi"
          : "Görev başarıyla gösterildi"
      );

      // Update local quest visibility
      quest.isVisible = !quest.isVisible;
      quest.updatedAt = new Date(data.data.updatedAt);

      // Refresh history after visibility change
      fetchQuestHistory();
    } catch (err) {
      console.error("Görev görünürlüğü güncelleme hatası:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Görev görünürlüğü güncellenemedi"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle quest deletion
  const handleDelete = async () => {
    if (
      !confirm(
        "Bu görevi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
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
        throw new Error(data.error || "Görev silinemedi");
      }
      toast.success("Görev başarıyla silindi");

      // Close dialog and refresh parent component
      window.location.reload(); // Simple refresh for now
    } catch (err) {
      console.error("Görev silme hatası:", err);
      toast.error(
        err instanceof Error ? err.message : "Görev silinemedi"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Aktif</Badge>;
      case "draft":
        return <Badge className="bg-blue-500">Taslak</Badge>;
      case "expired":
        return <Badge className="bg-gray-500">Süresi Doldu</Badge>;
      case "paused":
        return <Badge className="bg-yellow-500">Duraklatıldı</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "daily":
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            Günlük
          </Badge>
        );
      case "weekly":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            Haftalık
          </Badge>
        );
      case "event":
        return (
          <Badge
            variant="outline"
            className="border-purple-500 text-purple-700"
          >
            Etkinlik
          </Badge>
        );
      case "custom":
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-700"
          >
            Özel
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
          <span className="flex items-center gap-1">{reward.value} Elmas</span>
        );
      case "badge":
        return (
          <span className="flex items-center gap-1">Rozet: {reward.value}</span>
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
              Düzenle
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const action =
                  quest.status === "paused" || quest.status === "draft"
                    ? "resume"
                    : "pause";
                handleStatusChange(action);
              }}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : quest.status === "paused" || quest.status === "draft" ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Devam Ettir
                </>
              ) : (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Duraklat
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
                  Gizle
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Göster
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
                  Sil
                </>
              )}
            </Button>
          </div>
        </div>
        <DialogDescription>{quest.description}</DialogDescription>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="completions">Tamamlayanlar</TabsTrigger>
          <TabsTrigger value="analytics">Analiz</TabsTrigger>
          <TabsTrigger value="history">Geçmiş</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Görev Detayları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Durum</dt>
                    <dd className="font-medium">
                      {getStatusBadge(quest.status)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Tür</dt>
                    <dd className="font-medium">{getTypeBadge(quest.type)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Hedef</dt>
                    <dd className="font-medium">{quest.goal}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Ödül</dt>
                    <dd className="font-medium">
                      {getRewardDisplay(quest.reward)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Hedef Kullanıcılar</dt>
                    <dd className="font-medium">
                      {getTargetSegmentLabel(quest.targetSegment)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Görünürlük</dt>
                    <dd className="font-medium">
                      {quest.isVisible ? "Görünür" : "Gizli"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Süre</dt>
                    <dd className="font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(quest.startDate, "dd.MM.yyyy")} -{" "}
                      {format(quest.endDate, "dd.MM.yyyy")}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tamamlama İstatistikleri
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
                          Genel Tamamlanma
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
                            Atanan Kullanıcı
                          </dt>
                          <dd className="font-medium">
                            {analytics.overview.totalAssigned}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Tamamlayan Kullanıcı
                          </dt>
                          <dd className="font-medium">
                            {analytics.overview.totalCompleted}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Başlayan Kullanıcı
                          </dt>
                          <dd className="font-medium">
                            {analytics.overview.totalStarted}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Ortalama İlerleme
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
                          Genel Tamamlanma
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
                            Atanan Kullanıcı
                          </dt>
                          <dd className="font-medium">{quest.usersAssigned}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Tamamlayan Kullanıcı
                          </dt>
                          <dd className="font-medium">
                            {quest.usersCompleted}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Başlayan Kullanıcı
                          </dt>
                          <dd className="font-medium">{quest.usersStarted}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">
                            Ortalama İlerleme
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
                Son Etkinlik
              </CardTitle>
              <CardDescription>
                Bu görevle ilgili son kullanıcı etkileşimleri
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
                              Kullanıcı {(activity.clerkId ?? "bilinmiyor").slice(0, 8)}
                              ... -{" "}
                              {getActivityStatusLabel(activity.status)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(
                                new Date(activity.lastActivity),
                                "dd.MM.yyyy"
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          %{activity.progress} tamamlandı
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Son etkinlik verisi yok
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completions" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Kullanıcı Tamamlamaları
              </CardTitle>
              <CardDescription>
                Bu görevi tamamlayan kullanıcılar
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
                            {user.attempts} deneme •
                            {user.totalRewardsValue > 0 &&
                              ` ${user.totalRewardsValue} ödül`}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm">
                        Tamamlama tarihi:{" "}
                        {format(new Date(user.completedAt), "dd.MM.yyyy")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Henüz tamamlayan yok
                </div>
              )}

              {userCompletions.length > 0 && (
                <div className="mt-4 pt-4 border-t flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUserCompletions}
                  >
                    Tamamlamaları Yenile
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
                Tamamlama Analizi
              </CardTitle>
              <CardDescription>
                Görev performansına ilişkin detaylı istatistikler
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
                        Günlük aktivite grafiği burada gösterilecek
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {analytics.dailyActivity.length} günlük veri mevcut
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 mt-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">
                          Kullanıcı Seviyesine Göre Tamamlama
                        </div>
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Başlangıç</span>
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
                              <span className="text-xs">Orta</span>
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
                              <span className="text-xs">İleri</span>
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
                          Dile Göre Tamamlama
                        </div>
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">İspanyolca</span>
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
                              <span className="text-xs">Fransızca</span>
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
                              <span className="text-xs">Almanca</span>
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
                          Platforma Göre Tamamlama
                        </div>
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs">Mobil</span>
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
                              <span className="text-xs">Masaüstü</span>
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
                      Analiz verisi yüklenemedi
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
                Görev Geçmişi
              </CardTitle>
              <CardDescription>
                Bu görevde yapılan değişikliklerin kayıtları
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
                          İşlemi yapan: {log.user}
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
                          "dd.MM.yyyy HH:mm"
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Geçmiş verisi bulunamadı
                </div>
              )}

              {questHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQuestHistory}
                  >
                    Geçmişi Yenile
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
