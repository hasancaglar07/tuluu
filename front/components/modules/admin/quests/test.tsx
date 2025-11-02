"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
  Users,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuestForm } from "@/components/modules/admin/quest-form";
import { QuestDetailsDialog } from "@/components/modules/admin/quest-details-dialog";

// Import types
import type { Quest, QuestSummary } from "@/types";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

export default function Quests() {
  // State for quests data
  const [quests, setQuests] = useState<Quest[]>([]);
  const [summary, setSummary] = useState<QuestSummary>({
    totalActiveQuests: 0,
    totalUpcomingQuests: 0,
    averageCompletionRate: 0,
    totalUsersEngaged: 0,
    totalCompletedQuests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Dialog state
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { getToken } = useAuth();
  // Fetch quests from API
  const fetchQuests = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        type: typeFilter,
        limit: "50",
        page: "1",
      });

      const token = await getToken(); // if on server, or use `await getToken({ template: 'your-template-name' })`

      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + `/api/admin/quests?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch quests");
      }

      // Transform the data to ensure dates are properly parsed
      const transformedQuests = data.data.map((quest: Quest) => ({
        ...quest,
        startDate: new Date(quest.startDate),
        endDate: new Date(quest.endDate),
        createdAt: new Date(quest.createdAt),
        updatedAt: new Date(quest.updatedAt),
      }));

      setQuests(transformedQuests);
      setSummary(data.summary);
    } catch (err) {
      console.error("Error fetching quests:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch quests");
      toast.error("Failed to load quests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch quests on component mount and when filters change
  useEffect(() => {
    fetchQuests();
  }, [searchQuery, statusFilter, typeFilter]);

  // Handle quest creation success
  const handleQuestCreated = (newQuest: Quest) => {
    setQuests((prev) => [newQuest, ...prev]);
    setIsCreateDialogOpen(false);
    toast.success("Quest created successfully");
    // Refresh data to get updated summary
    fetchQuests();
  };

  // Handle quest update success
  const handleQuestUpdated = (updatedQuest: Quest) => {
    setQuests((prev) =>
      prev.map((quest) => (quest.id === updatedQuest.id ? updatedQuest : quest))
    );
    setIsEditDialogOpen(false);
    toast.success("Quest updated successfully");
    // Refresh data to get updated summary
    fetchQuests();
  };

  // Handle quest deletion
  const handleDeleteQuest = async (questId: string) => {
    try {
      const token = await getToken();
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/quests/${questId}`,
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

      setQuests((prev) => prev.filter((quest) => quest.id !== questId));
      toast.success("Quest deleted successfully");
      fetchQuests();
    } catch (err) {
      console.error("Error deleting quest:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete quest"
      );
    }
  };

  const handleStatusChange = async (questId: string, action: string) => {
    try {
      const token = await getToken();
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/quests/${questId}`,
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

      setQuests((prev) =>
        prev.map((quest) =>
          quest.id === questId
            ? {
                ...quest,
                status: data.data.status,
                updatedAt: new Date(data.data.updatedAt),
              }
            : quest
        )
      );
      toast.success(data.message);
    } catch (err) {
      console.error("Error updating quest status:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update quest status"
      );
    }
  };

  const handleEditQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setIsEditDialogOpen(true);
  };

  const handleViewDetails = async (quest: Quest) => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/quests/${quest.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch quest details");
      }

      const detailedQuest = {
        ...data.data,
        startDate: new Date(data.data.startDate),
        endDate: new Date(data.data.endDate),
        createdAt: new Date(data.data.createdAt),
        updatedAt: new Date(data.data.updatedAt),
      };

      setSelectedQuest(detailedQuest);
      setIsDetailsDialogOpen(true);
    } catch (err) {
      console.error("Error fetching quest details:", err);
      toast.error("Failed to load quest details");
    }
  };

  // Filter quests based on active tab
  const getFilteredQuests = () => {
    switch (activeTab) {
      case "active":
        return quests.filter((quest) => quest.status === "active");
      case "upcoming":
        return quests.filter(
          (quest) =>
            quest.status === "draft" && new Date(quest.startDate) > new Date()
        );
      case "expired":
        return quests.filter((quest) => quest.status === "expired");
      default:
        return quests;
    }
  };

  const filteredQuests = getFilteredQuests();

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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quests Management
            </h1>
            <p className="text-muted-foreground">
              Create, manage, and monitor quests for your users.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading quests...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quests Management
            </h1>
            <p className="text-muted-foreground">
              Create, manage, and monitor quests for your users.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <Button onClick={fetchQuests}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quests Management
          </h1>
          <p className="text-muted-foreground">
            Create, manage, and monitor quests for your users.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#58cc02] hover:bg-[#58cc02]/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Quest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Quest</DialogTitle>
              <DialogDescription>
                Create a new quest for your users to complete and earn rewards.
              </DialogDescription>
            </DialogHeader>
            <QuestForm
              onSubmit={() => setIsCreateDialogOpen(false)}
              onSuccess={handleQuestCreated}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Active Quests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalActiveQuests}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalUpcomingQuests} upcoming
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.averageCompletionRate}%
            </div>
            <p className="text-xs text-muted-foreground">Across all quests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users Engaged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalUsersEngaged}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalCompletedQuests} completed quests
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All Quests</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search quests..."
                className="pl-8 w-[200px] sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filter Quests</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Status</p>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <p className="text-sm font-medium mb-2">Type</p>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          <div className="space-y-4">
            {filteredQuests.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg">
                <p className="text-muted-foreground">
                  No quests found matching your filters.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              filteredQuests.map((quest) => (
                <Card key={quest.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {quest.title}
                            </h3>
                            {getStatusBadge(quest.status)}
                            {getTypeBadge(quest.type)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {quest.description}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(quest)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditQuest(quest)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Quest
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const action =
                                  quest.status === "paused"
                                    ? "resume"
                                    : "pause";
                                handleStatusChange(quest.id, action);
                              }}
                            >
                              {quest.status === "paused" ? (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Resume Quest
                                </>
                              ) : (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pause Quest
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteQuest(quest.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Quest
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Goal</p>
                          <p className="text-sm font-medium">{quest.goal}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Reward
                          </p>
                          <p className="text-sm font-medium">
                            {getRewardDisplay(quest.reward)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Target
                          </p>
                          <p className="text-sm font-medium capitalize">
                            {quest.targetSegment}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Duration
                          </p>
                          <p className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(quest.startDate, "MMM d")} -{" "}
                            {format(quest.endDate, "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted p-6 md:w-[200px] flex flex-row md:flex-col justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Completion Rate
                        </p>
                        <p className="text-2xl font-bold">
                          {quest.completionRate}%
                        </p>
                      </div>
                      <div className="mt-0 md:mt-4">
                        <p className="text-xs text-muted-foreground">Users</p>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <p className="text-sm font-medium">
                            {quest.usersCompleted} / {quest.usersAssigned}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-0 md:mt-auto"
                        onClick={() => handleViewDetails(quest)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Other tab contents remain the same but use filteredQuests */}
        <TabsContent value="active" className="m-0">
          <div className="space-y-4">
            {filteredQuests.map((quest) => (
              <Card key={quest.id} className="overflow-hidden">
                {/* Same card content as above */}
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {quest.title}
                          </h3>
                          {getStatusBadge(quest.status)}
                          {getTypeBadge(quest.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {quest.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(quest)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditQuest(quest)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Quest
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(quest.id, "pause")
                            }
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Quest
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteQuest(quest.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Quest
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Goal</p>
                        <p className="text-sm font-medium">{quest.goal}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reward</p>
                        <p className="text-sm font-medium">
                          {getRewardDisplay(quest.reward)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="text-sm font-medium capitalize">
                          {quest.targetSegment}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(quest.startDate, "MMM d")} -{" "}
                          {format(quest.endDate, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-6 md:w-[200px] flex flex-row md:flex-col justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Completion Rate
                      </p>
                      <p className="text-2xl font-bold">
                        {quest.completionRate}%
                      </p>
                    </div>
                    <div className="mt-0 md:mt-4">
                      <p className="text-xs text-muted-foreground">Users</p>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <p className="text-sm font-medium">
                          {quest.usersCompleted} / {quest.usersAssigned}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-0 md:mt-auto"
                      onClick={() => handleViewDetails(quest)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="m-0">
          <div className="space-y-4">
            {filteredQuests.map((quest) => (
              <Card key={quest.id} className="overflow-hidden">
                {/* Card content for upcoming quests */}
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {quest.title}
                          </h3>
                          {getStatusBadge(quest.status)}
                          {getTypeBadge(quest.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {quest.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(quest)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditQuest(quest)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Quest
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteQuest(quest.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Quest
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Goal</p>
                        <p className="text-sm font-medium">{quest.goal}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reward</p>
                        <p className="text-sm font-medium">
                          {getRewardDisplay(quest.reward)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="text-sm font-medium capitalize">
                          {quest.targetSegment}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(quest.startDate, "MMM d")} -{" "}
                          {format(quest.endDate, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-6 md:w-[200px] flex flex-row md:flex-col justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Starts In</p>
                      <p className="text-lg font-bold flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {Math.ceil(
                          (quest.startDate.getTime() - new Date().getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}{" "}
                        days
                      </p>
                    </div>
                    <div className="mt-0 md:mt-4">
                      <p className="text-xs text-muted-foreground">
                        Target Users
                      </p>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <p className="text-sm font-medium">
                          {quest.usersAssigned}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-0 md:mt-auto"
                      onClick={() => handleViewDetails(quest)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expired" className="m-0">
          <div className="space-y-4">
            {filteredQuests.map((quest) => (
              <Card key={quest.id} className="overflow-hidden">
                {/* Card content for expired quests */}
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">
                            {quest.title}
                          </h3>
                          {getStatusBadge(quest.status)}
                          {getTypeBadge(quest.type)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {quest.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(quest)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditQuest(quest)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Quest
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteQuest(quest.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Quest
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Goal</p>
                        <p className="text-sm font-medium">{quest.goal}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reward</p>
                        <p className="text-sm font-medium">
                          {getRewardDisplay(quest.reward)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="text-sm font-medium capitalize">
                          {quest.targetSegment}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(quest.startDate, "MMM d")} -{" "}
                          {format(quest.endDate, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted p-6 md:w-[200px] flex flex-row md:flex-col justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Final Completion
                      </p>
                      <p className="text-2xl font-bold">
                        {quest.completionRate}%
                      </p>
                    </div>
                    <div className="mt-0 md:mt-4">
                      <p className="text-xs text-muted-foreground">Users</p>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <p className="text-sm font-medium">
                          {quest.usersCompleted} / {quest.usersAssigned}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-0 md:mt-auto"
                      onClick={() => handleViewDetails(quest)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Quest Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Quest</DialogTitle>
            <DialogDescription>
              Make changes to the quest details, goals, or rewards.
            </DialogDescription>
          </DialogHeader>
          {selectedQuest && (
            <QuestForm
              quest={selectedQuest}
              onSubmit={() => setIsEditDialogOpen(false)}
              onSuccess={handleQuestUpdated}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quest Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedQuest && (
            <QuestDetailsDialog
              quest={selectedQuest}
              onEdit={() => {
                setIsDetailsDialogOpen(false);
                handleEditQuest(selectedQuest);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
