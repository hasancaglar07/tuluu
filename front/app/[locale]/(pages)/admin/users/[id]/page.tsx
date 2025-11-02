"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ActivityIcon,
  AlertTriangle,
  Ban,
  Calendar,
  ChevronLeft,
  Clock,
  CreditCard,
  Edit,
  Flag,
  Gift,
  Globe,
  Heart,
  History,
  Lock,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  RotateCcw,
  Shield,
  Star,
  Trash,
  Trophy,
  UserIcon,
  UserCheck,
  Gem,
  Droplets,
  User,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import UserEditDialog from "@/components/modules/admin/user-edit-dialog";
import UserCreditDialog from "@/components/modules/admin/user-credit-dialog";
import UserBanDialog from "@/components/modules/admin/user-ban-dialog";
import UserSubscriptionDialog from "@/components/modules/admin/user-subscription-dialog";
import UserProgressResetDialog from "@/components/modules/admin/user-progress-reset-dialog";
import UserRoleDialog from "@/components/modules/admin/user-role-dialog";
import UserReportsDialog from "@/components/modules/admin/user-reports-dialog";
import UserActivityLogsDialog from "@/components/modules/admin/user-activity-logs-dialog";
import { useAuth } from "@clerk/nextjs";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { apiClient } from "@/lib/api-client";
import { AppUser } from "@/types";

// Function to safely get nested values
const getNestedValue = (
  obj: any,
  path: string,
  defaultValue: any = undefined
) => {
  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined && result !== null ? result : defaultValue;
};

// Function to format date
const formatDate = (dateString: string | Date): string => {
  if (!dateString) return "N/A";

  return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
};

// Function to get status badge color
const getStatusColor = (status = "inactive") => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "inactive":
      return "bg-gray-500";
    case "banned":
      return "bg-red-500";
    case "suspended":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

// Function to get role badge color
const getRoleColor = (role = "free") => {
  switch (role) {
    case "admin":
      return "bg-purple-500";
    case "paid":
      return "bg-blue-500";
    case "free":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

// Function to get subscription badge color
const getSubscriptionColor = (subscription = "free") => {
  switch (subscription) {
    case "premium":
      return "bg-yellow-500";
    case "free":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

// Function to get activity icon
const getActivityIcon = (type: string) => {
  switch (type) {
    case "lesson_completed":
      return <ActivityIcon className="h-4 w-4 text-blue-500" />;
    case "quest_completed":
      return <Flag className="h-4 w-4 text-green-500" />;
    case "streak_milestone":
      return <ActivityIcon className="h-4 w-4 text-orange-500" />;
    case "level_up":
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case "purchase":
      return <CreditCard className="h-4 w-4 text-purple-500" />;
    case "admin_action":
      return <User className="h-4 w-4 text-purple-500" />;
    default:
      return <ActivityIcon className="h-4 w-4 text-gray-500" />;
  }
};

// Function to get report priority color
const getReportPriorityColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-blue-500";
    case "medium":
      return "bg-yellow-500";
    case "high":
      return "bg-orange-500";
    case "critical":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

// Function to get report status color
const getReportStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-blue-500";
    case "in_progress":
      return "bg-yellow-500";
    case "resolved":
      return "bg-green-500";
    case "closed":
      return "bg-gray-500";
    default:
      return "bg-gray-500";
  }
};

// Components for the icons
const Book = ActivityIcon;
const Flame = ActivityIcon;

export default function UserDetailPage() {
  // Get user ID from URL
  const params = useParams();
  const router = useLocalizedRouter();
  const userId = params.id as string;

  // State for user data
  const [user, setUser] = useState<AppUser>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // State for dialog visibility
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [progressResetDialogOpen, setProgressResetDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false);
  const [activityLogsDialogOpen, setActivityLogsDialogOpen] = useState(false);
  const { getToken } = useAuth();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      const token = await getToken();
      try {
        const response = await apiClient.get(`/api/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to fetch user data");
        toast.error("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, refreshKey]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="text-center">
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-40 mx-auto mt-2" />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Skeleton className="h-10 w-full max-w-3xl mx-auto" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">User Details</h1>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // No user data
  if (!user) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">User Details</h1>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">User Not Found</h2>
            <p className="text-gray-500 mb-4">
              The requested user could not be found or you don&apos;t have
              permission to view it.
            </p>
            <Button onClick={() => router.push("/admin/users")}>
              Return to Users List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user data with fallbacks
  const userName = getNestedValue(user, "publicMetadata.name", "Unknown User");
  const userEmail = user.email || "No email";
  const userRole = getNestedValue(user, "privateMetadata.role", "free");
  const userStatus = getNestedValue(user, "privateMetadata.status", "inactive");
  const userSubscription = getNestedValue(
    user,
    "privateMetadata.subscription",
    "free"
  );
  const userAvatar = getNestedValue(
    user,
    "publicMetadata.avatar",
    "/placeholder.svg?height=128&width=128"
  );
  const userBio = getNestedValue(user, "publicMetadata.bio", "");
  const userLanguage = getNestedValue(
    user,
    "publicMetadata.language",
    "English"
  );
  const userCountry = getNestedValue(user, "publicMetadata.country", "Unknown");
  const userTimezone = getNestedValue(user, "publicMetadata.timezone", "UTC");
  const userJoinDate = user.createdAt || new Date().toISOString();
  const userLastActive = user.lastSignInAt || user.updatedAt || userJoinDate;
  const userEmailVerified = user.emailVerified || false;

  // Game-related data
  const userXp = user.xp || 0;
  const userGems = user.gems || 0;
  const userGel = user.gel || 0;
  const userHearts = user.hearts || 0;
  const userStreak = user.streak || 0;
  const userCompletedLessons = user.userCompletedLessons || 0;
  const userTotalLessons = user.userTotalLessons || 100;

  // Collections
  const userAchievements = user.userAchievements || [];
  const userRecentActivity = user.userRecentActivity || [];
  const userReports = user.userReports || [];
  const userLoginHistory = user.userLoginHistory || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back button and page title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">User Details</h1>
        </div>

        {/* Quick actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreditDialogOpen(true)}
          >
            <Gift className="h-4 w-4 mr-2" />
            Credit
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setBanDialogOpen(true)}>
                <Ban className="h-4 w-4 mr-2" />
                Ban/Suspend
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSubscriptionDialogOpen(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setProgressResetDialogOpen(true)}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleDialogOpen(true)}>
                <Shield className="h-4 w-4 mr-2" />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReportsDialogOpen(true)}>
                <Flag className="h-4 w-4 mr-2" />
                View Reports
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActivityLogsDialogOpen(true)}>
                <History className="h-4 w-4 mr-2" />
                Login History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* User profile card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* User avatar and basic info */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={userAvatar || "/placeholder.svg"}
                  alt={userName}
                />
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-bold">{userName}</h2>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge className={getRoleColor(userRole)}>{userRole}</Badge>
                <Badge className={getStatusColor(userStatus)}>
                  {userStatus}
                </Badge>
                <Badge className={getSubscriptionColor(userSubscription)}>
                  {userSubscription}
                </Badge>
              </div>
            </div>

            {/* User stats */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* XP */}
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">XP</p>
                  <p className="font-bold">{userXp.toLocaleString()}</p>
                </div>
              </div>

              {/* Gems */}
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Gem className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gems</p>
                  <p className="font-bold">{userGems.toLocaleString()}</p>
                </div>
              </div>

              {/* Gel */}
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-cyan-100 p-2 rounded-full">
                  <Droplets className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gel</p>
                  <p className="font-bold">{userGel.toLocaleString()}</p>
                </div>
              </div>

              {/* Hearts */}
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-red-100 p-2 rounded-full">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hearts</p>
                  <p className="font-bold">{userHearts} / 5</p>
                </div>
              </div>

              {/* Streak */}
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-orange-100 p-2 rounded-full">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Streak</p>
                  <p className="font-bold">{userStreak} days</p>
                </div>
              </div>

              {/* Lessons */}
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="bg-green-100 p-2 rounded-full">
                  <Book className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lessons</p>
                  <p className="font-bold">
                    {userCompletedLessons} / {userTotalLessons}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Basic information about the user
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p>{userName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p>{userEmail}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Join Date</p>
                <p>{formatDate(userJoinDate)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Last Active</p>
                <p>{formatDate(userLastActive)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Language</p>
                <p>{userLanguage}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Country</p>
                <p>{userCountry}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Timezone</p>
                <p>{userTimezone}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">
                  Email Verified
                </p>
                <p>{userEmailVerified ? "Yes" : "No"}</p>
              </div>
              {userBio && (
                <div className="space-y-1 md:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Bio</p>
                  <p className="whitespace-pre-wrap">{userBio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>User&apos;s learning progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Lessons Completed</p>
                  <p className="text-sm text-gray-500">
                    {userCompletedLessons} / {userTotalLessons}
                  </p>
                </div>
                <Progress
                  value={
                    userTotalLessons > 0
                      ? (userCompletedLessons / userTotalLessons) * 100
                      : 0
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userRecentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {userRecentActivity.slice(0, 3).map((activity, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <div className="bg-gray-100 p-1 rounded-full">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div>
                              <p className="text-sm">{activity.description}</p>
                              <p className="text-xs text-gray-500">
                                {formatDate(activity.date)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                          No recent activity
                        </p>
                      </div>
                    )}
                  </CardContent>
                  {userRecentActivity.length > 0 && (
                    <CardFooter>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          document
                            .querySelector('[data-value="activity"]')
                            ?.dispatchEvent(
                              new MouseEvent("click", { bubbles: true })
                            )
                        }
                      >
                        View All Activity
                      </Button>
                    </CardFooter>
                  )}
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {userAchievements.length > 0 ? (
                      <div className="space-y-4">
                        {userAchievements.slice(0, 3).map((achievement) => (
                          <div
                            key={achievement.id}
                            className="flex items-start space-x-3"
                          >
                            <div className="bg-yellow-100 p-1 rounded-full">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {achievement.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">
                          No achievements yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                  {userAchievements.length > 0 && (
                    <CardFooter>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          document
                            .querySelector('[data-value="achievements"]')
                            ?.dispatchEvent(
                              new MouseEvent("click", { bubbles: true })
                            )
                        }
                      >
                        View All Achievements
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Recent user activity</CardDescription>
            </CardHeader>
            <CardContent>
              {userRecentActivity.length > 0 ? (
                <div className="space-y-6">
                  {userRecentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4"
                    >
                      <div className="bg-gray-100 p-2 rounded-full mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{activity.description}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(activity.date)}
                          </p>
                        </div>
                        {(activity.xpEarned || activity.gemsEarned) && (
                          <div className="flex items-center space-x-4 mt-2">
                            {activity.xpEarned && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">
                                  +{activity.xpEarned} XP
                                </span>
                              </div>
                            )}
                            {activity.gemsEarned && (
                              <div className="flex items-center space-x-1">
                                <Gem className="h-4 w-4 text-blue-500" />
                                <span className="text-sm">
                                  +{activity.gemsEarned} Gems
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <Separator className="mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ActivityIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Activity</h3>
                  <p className="text-sm text-gray-500">
                    This user has no recorded activity.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>User&apos;s earned achievements</CardDescription>
            </CardHeader>
            <CardContent>
              {userAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userAchievements.map((achievement) => (
                    <Card key={achievement.id} className="overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 flex justify-center">
                        <Trophy className="h-12 w-12 text-white" />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold">{achievement.name}</h3>
                        <p className="text-sm text-gray-500">
                          {achievement.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            Earned on {formatDate(achievement.earnedDate)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Achievements</h3>
                  <p className="text-sm text-gray-500">
                    This user hasn&apos;t earned any achievements yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
              <CardDescription>
                Reports submitted by or about this user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userReports.length > 0 ? (
                  userReports.map((report) => (
                    <Card key={report.id} className="overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={getReportPriorityColor(report.priority)}
                          >
                            {report.priority}
                          </Badge>
                          <Badge
                            className={getReportStatusColor(report.status)}
                          >
                            {report.status.replace("_", " ")}
                          </Badge>
                          <span className="text-sm font-medium">
                            {report.type.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDate(report.date)}
                        </p>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold">{report.title}</h3>
                        <p className="text-sm text-gray-500 mt-2">
                          {report.description}
                        </p>
                      </CardContent>
                      <CardFooter className="bg-gray-50 p-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Pencil className="h-4 w-4 mr-2" />
                          Update Status
                        </Button>
                        <Button variant="outline" size="sm">
                          <UserCheck className="h-4 w-4 mr-2" />
                          Assign
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Reports</h3>
                    <p className="text-sm text-gray-500">
                      This user has no reports.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Login History</CardTitle>
              <CardDescription>Recent login attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userLoginHistory.length > 0 ? (
                  userLoginHistory.map((login) => (
                    <div
                      key={login.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg"
                    >
                      <div
                        className={`p-2 rounded-full ${
                          login.success ? "bg-green-100" : "bg-red-100"
                        }`}
                      >
                        {login.success ? (
                          <UserCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">
                              {login.success
                                ? "Successful Login"
                                : "Failed Login Attempt"}
                            </p>
                            {login.success ? (
                              <Badge className="bg-green-500">Success</Badge>
                            ) : (
                              <Badge className="bg-red-500">Failed</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDate(login.date)}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <p className="text-sm">{login.ip}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            <p className="text-sm">{login.device}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <p className="text-sm">
                              {login.location || "Unknown location"}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <p className="text-sm">{formatDate(login.date)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Login History</h3>
                    <p className="text-sm text-gray-500">
                      No login history is available for this user.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            {userLoginHistory.length > 0 && (
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActivityLogsDialogOpen(true)}
                >
                  View All Login Activity
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Security settings and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Verification</p>
                  <p className="text-sm text-gray-500">
                    User&apos;s email verification status
                  </p>
                </div>
                <Badge
                  className={userEmailVerified ? "bg-green-500" : "bg-red-500"}
                >
                  {userEmailVerified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Account Status</p>
                  <p className="text-sm text-gray-500">
                    Current account status
                  </p>
                </div>
                <Badge className={getStatusColor(userStatus)}>
                  {userStatus}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password Reset</p>
                  <p className="text-sm text-gray-500">
                    Send password reset email
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reset Link
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Account Actions</p>
                  <p className="text-sm text-gray-500">Manage user account</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBanDialogOpen(true)}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    {userStatus === "active" ? "Suspend" : "Activate"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (
                        confirm(
                          "Are you sure you want to delete this user? This action cannot be undone."
                        )
                      ) {
                        try {
                          await apiClient.delete(`/api/admin/users/${userId}`);
                          toast.success("User deleted successfully");
                          router.push("/admin/users");
                        } catch (err) {
                          console.error("Error deleting user:", err);
                          toast.error("Failed to delete user");
                        }
                      }
                    }}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <UserEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={user}
      />
      <UserCreditDialog
        open={creditDialogOpen}
        onOpenChange={setCreditDialogOpen}
        user={user}
      />
      <UserBanDialog
        open={banDialogOpen}
        onOpenChange={setBanDialogOpen}
        user={user}
      />
      <UserSubscriptionDialog
        open={subscriptionDialogOpen}
        onOpenChange={setSubscriptionDialogOpen}
        user={user}
      />
      <UserProgressResetDialog
        open={progressResetDialogOpen}
        onOpenChange={setProgressResetDialogOpen}
        user={user}
      />
      <UserRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        user={user}
      />
      <UserReportsDialog
        open={reportsDialogOpen}
        onOpenChange={setReportsDialogOpen}
        user={user}
      />
      <UserActivityLogsDialog
        open={activityLogsDialogOpen}
        onOpenChange={setActivityLogsDialogOpen}
        user={user}
      />
    </div>
  );
}
