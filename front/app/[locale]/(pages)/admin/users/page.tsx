"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  UserPlus,
  Download,
  MoreHorizontal,
  Shield,
  Ban,
  Edit,
  Trash,
  Eye,
  Star,
  Gem,
  Heart,
  Droplets,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useIntl } from "react-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import UserAddDialog from "@/components/modules/admin/user-add-dialog";
import UserEditDialog from "@/components/modules/admin/user-edit-dialog";
import UserCreditDialog from "@/components/modules/admin/user-credit-dialog";
import UserBanDialog from "@/components/modules/admin/user-ban-dialog";
import UserSubscriptionDialog from "@/components/modules/admin/user-subscription-dialog";
import UserProgressResetDialog from "@/components/modules/admin/user-progress-reset-dialog";
import UserRoleDialog from "@/components/modules/admin/user-role-dialog";
import UserReportsDialog from "@/components/modules/admin/user-reports-dialog";
import UserActivityLogsDialog from "@/components/modules/admin/user-activity-logs-dialog";
import { AppUser } from "@/types";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";

export default function UsersPage() {
  const intl = useIntl();
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AppUser[]>([]);
  // Added state for pagination info
  const [pageSize, setPageSize] = useState(10); // Default page size
  const [totalUsers, setTotalUsers] = useState(0); // Total number of users

  // Add these state variables inside the UsersPage component, after the existing state variables
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [progressResetDialogOpen, setProgressResetDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [reportsDialogOpen, setReportsDialogOpen] = useState(false);
  const [activityLogsDialogOpen, setActivityLogsDialogOpen] = useState(false);
  const router = useLocalizedRouter();

  const { getToken } = useAuth();
  // Updated fetchUsers function to use axios with the API_BASE_URL

  // Memoize fetchUsers
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(subscriptionFilter !== "all" && {
          subscription: subscriptionFilter,
        }),
      };

      const token = await getToken(); // Adjust if getToken depends on anything

      const response = await apiClient.get(`/api/admin/users`, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data.users);
      setTotalPages(response.data.pagination.pages);
      setTotalUsers(response.data.pagination.total);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(intl.formatMessage({ id: "admin.users.toast.fetchFailed" }));
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    searchQuery,
    roleFilter,
    statusFilter,
    subscriptionFilter,
    getToken,
    intl,
  ]);

  // Run effect
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  // Add this function to handle adding a new user
  const handleAddUser = () => {
    // Refresh the user list
    fetchUsers();
    toast.success(intl.formatMessage({ id: "admin.users.toast.userAdded" }));
  };

  // Updated to use axios with API_BASE_URL for deletion
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      confirm(
        intl.formatMessage(
          { id: "admin.users.confirm.delete" },
          { name: userName }
        )
      )
    ) {
      try {
        const token = await getToken(); // Replace this with how you actually get the token

        // Use axios for the delete request with the base URL
        await apiClient.delete(`/api/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success(
          intl.formatMessage(
            { id: "admin.users.toast.userDeleted" },
            { name: userName }
          )
        );
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(intl.formatMessage({ id: "admin.users.toast.deleteFailed" }));
      }
    }
  };

  // Handle user edit (integrated with API)
  // const handleEditUser = async (userData: Partial<AppUser>) => {
  //   if (!selectedUser) return;

  //   try {
  //     const token = await getToken(); // Replace this with how you actually get the token

  //     await apiClient.put(`/api/admin/users/${selectedUser.id}`, userData, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     toast.success("User information updated successfully.");
  //     fetchUsers();
  //   } catch (error) {
  //     console.error("Error updating user:", error);
  //     toast.error("Failed to update user. Please try again.");
  //   }
  // };

  // Handle role change (integrated with API)
  // const handleRoleChange = async (
  //   userId: string,
  //   role: string,
  //   reason: string
  // ) => {
  //   try {
  //     await apiClient.post(`/api/admin/users/${userId}/role`, {
  //       role,
  //       reason,
  //     });

  //     toast.success(`User role updated to ${role}.`);
  //     fetchUsers();
  //   } catch (error) {
  //     console.error("Error changing user role:", error);
  //     toast.error("Failed to change user role. Please try again.");
  //   }
  // };

  // Handle ban/suspend user (integrated with API)
  // const handleBanUser = async (
  //   userId: string,
  //   action: string,
  //   reason: string,
  //   duration?: number
  // ) => {
  //   try {
  //     const token = await getToken(); // Replace this with how you actually get the token

  //     await apiClient.post(
  //       `/api/admin/users/${userId}/ban`,
  //       {
  //         action,
  //         reason,
  //         ...(duration && { duration }),
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     toast.success(
  //       `User ${
  //         action === "ban"
  //           ? "banned"
  //           : action === "suspend"
  //           ? "suspended"
  //           : "activated"
  //       } successfully.`
  //     );
  //     fetchUsers();
  //   } catch (error) {
  //     console.error("Error banning/suspending user:", error);
  //     toast.error(`Failed to ${action} user. Please try again.`);
  //   }
  // };

  // Handle subscription change (integrated with API)
  // const handleSubscriptionChange = async (
  //   userId: string,
  //   plan: string,
  //   duration?: number,
  //   autoRenew?: boolean
  // ) => {
  //   try {
  //     const token = await getToken(); // Replace this with how you actually get the token

  //     await apiClient.post(
  //       `/api/admin/users/${userId}/subscription`,
  //       {
  //         plan,
  //         ...(duration && { duration }),
  //         ...(autoRenew !== undefined && { autoRenew }),
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     toast.success(`User subscription updated to ${plan}.`);
  //     fetchUsers();
  //   } catch (error) {
  //     console.error("Error changing user subscription:", error);
  //     toast.error("Failed to change user subscription. Please try again.");
  //   }
  // };

  // Handle credit adjustment (integrated with API)
  // const handleCreditAdjustment = async (
  //   userId: string,
  //   type: string,
  //   amount: number,
  //   reason: string
  // ) => {
  //   try {
  //     const token = await getToken(); // Replace this with how you actually get the token

  //     await apiClient.post(
  //       `/api/admin/users/${userId}/credit`,
  //       {
  //         type,
  //         amount,
  //         reason,
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     toast.success(
  //       `User ${type} adjusted by ${amount > 0 ? "+" : ""}${amount}.`
  //     );
  //     fetchUsers();
  //   } catch (error) {
  //     console.error("Error adjusting user credits:", error);
  //     toast.error("Failed to adjust user credits. Please try again.");
  //   }
  // };

  // Handle progress reset (integrated with API)
  // const handleProgressReset = async (
  //   userId: string,
  //   options: {
  //     resetLessons?: boolean;
  //     resetXP?: boolean;
  //     resetGems?: boolean;
  //     resetAchievements?: boolean;
  //     resetStreak?: boolean;
  //     reason: string;
  //   }
  // ) => {
  //   try {
  //     const token = await getToken(); // Replace this with how you actually get the token

  //     await apiClient.post(
  //       `/api/admin/users/${userId}/reset-progress`,
  //       options,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     toast.success("User progress reset successfully.");
  //     fetchUsers();
  //   } catch (error) {
  //     console.error("Error resetting user progress:", error);
  //     toast.error("Failed to reset user progress. Please try again.");
  //   }
  // };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "paid":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "free":
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      case "banned":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Get subscription badge color
  const getSubscriptionBadgeColor = (subscription: string) => {
    switch (subscription) {
      case "premium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "free":
        return intl.formatMessage({ id: "admin.users.filters.free" });
      case "paid":
        return intl.formatMessage({ id: "admin.users.filters.paid" });
      case "admin":
        return intl.formatMessage({ id: "admin.users.filters.admin" });
      default:
        return role;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return intl.formatMessage({ id: "admin.users.filters.active" });
      case "inactive":
        return intl.formatMessage({ id: "admin.users.filters.inactive" });
      case "banned":
        return intl.formatMessage({ id: "admin.users.filters.banned" });
      case "suspended":
        return intl.formatMessage({ id: "admin.users.filters.suspended" });
      default:
        return status;
    }
  };

  const getSubscriptionLabel = (subscription: string) => {
    switch (subscription) {
      case "free":
        return intl.formatMessage({ id: "admin.users.filters.free" });
      case "premium":
        return intl.formatMessage({ id: "admin.users.filters.premium" });
      default:
        return subscription;
    }
  };

  // Toggle sort order
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Helper function to safely access nested properties
  const getNestedValue = (
    user: AppUser,
    path: string,
    defaultValue: unknown = ""
  ) => {
    const parts = path.split(".");
    let value = user;

    for (const part of parts) {
      if (value === null || value === undefined || typeof value !== "object") {
        return defaultValue;
      }
      value = value[part as keyof typeof value];
    }

    return value !== undefined && value !== null ? value : defaultValue;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {intl.formatMessage({ id: "admin.users.title" })}
        </h1>
        <p className="text-muted-foreground">
          {intl.formatMessage({ id: "admin.users.subtitle" })}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {intl.formatMessage({ id: "admin.users.stats.totalUsers" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "..."
                : users.filter(
                    (u) =>
                      getNestedValue(u, "privateMetadata.status", "") ===
                      "active"
                  ).length}{" "}
             {intl.formatMessage({ id: "admin.users.stats.activeUsers" })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {intl.formatMessage({ id: "admin.users.stats.premiumUsers" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : users.filter(
                    (u) =>
                      getNestedValue(u, "privateMetadata.subscription", "") ===
                      "premium"
                  ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading && users.length > 0
                ? "..."
                : (
                    (users.filter(
                      (u) =>
                        getNestedValue(
                          u,
                          "privateMetadata.subscription",
                          ""
                        ) === "premium"
                    ).length /
                      users.length) *
                    100
                  ).toFixed(1)}
             % {intl.formatMessage({ id: "admin.users.stats.percentOfTotal" }).replace('%{percent}', '')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {intl.formatMessage({ id: "admin.users.stats.newUsers30d" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? "..."
                : users.filter(
                    (u) =>
                      new Date(u.joinDate).getTime() >
                      Date.now() - 30 * 24 * 60 * 60 * 1000
                  ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {intl.formatMessage(
                { id: "admin.users.stats.lastMonthChange" },
                { percent: "12" }
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {intl.formatMessage({ id: "admin.users.stats.avgRetention" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              {intl.formatMessage(
                { id: "admin.users.stats.lastMonthChange" },
                { percent: "5" }
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <Card className="w-full p-4">
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-0">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={intl.formatMessage({ id: "admin.users.searchPlaceholder" })}
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              {intl.formatMessage({ id: "admin.users.filter" })}
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue
                  placeholder={intl.formatMessage({ id: "admin.users.filters.role" })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {intl.formatMessage({ id: "admin.users.filters.allRoles" })}
                </SelectItem>
                <SelectItem value="free">
                  {intl.formatMessage({ id: "admin.users.filters.free" })}
                </SelectItem>
                <SelectItem value="paid">
                  {intl.formatMessage({ id: "admin.users.filters.paid" })}
                </SelectItem>
                <SelectItem value="admin">
                  {intl.formatMessage({ id: "admin.users.filters.admin" })}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue
                  placeholder={intl.formatMessage({ id: "admin.users.filters.status" })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {intl.formatMessage({ id: "admin.users.filters.allStatus" })}
                </SelectItem>
                <SelectItem value="active">
                  {intl.formatMessage({ id: "admin.users.filters.active" })}
                </SelectItem>
                <SelectItem value="inactive">
                  {intl.formatMessage({ id: "admin.users.filters.inactive" })}
                </SelectItem>
                <SelectItem value="banned">
                  {intl.formatMessage({ id: "admin.users.filters.banned" })}
                </SelectItem>
                <SelectItem value="suspended">
                  {intl.formatMessage({ id: "admin.users.filters.suspended" })}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={subscriptionFilter}
              onValueChange={setSubscriptionFilter}
            >
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue
                  placeholder={intl.formatMessage({
                    id: "admin.users.filters.subscription",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {intl.formatMessage({ id: "admin.users.filters.allPlans" })}
                </SelectItem>
                <SelectItem value="free">
                  {intl.formatMessage({ id: "admin.users.filters.free" })}
                </SelectItem>
                <SelectItem value="premium">
                  {intl.formatMessage({ id: "admin.users.filters.premium" })}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={pageSize.toString()}
              onValueChange={(value) => handlePageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-9 w-[130px]">
                <SelectValue
                  placeholder={intl.formatMessage({
                    id: "admin.users.filters.pageSize",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">
                  {intl.formatMessage(
                    { id: "admin.users.filters.perPage" },
                    { count: 5 }
                  )}
                </SelectItem>
                <SelectItem value="10">
                  {intl.formatMessage(
                    { id: "admin.users.filters.perPage" },
                    { count: 10 }
                  )}
                </SelectItem>
                <SelectItem value="25">
                  {intl.formatMessage(
                    { id: "admin.users.filters.perPage" },
                    { count: 25 }
                  )}
                </SelectItem>
                <SelectItem value="50">
                  {intl.formatMessage(
                    { id: "admin.users.filters.perPage" },
                    { count: 50 }
                  )}
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              size="sm"
              className="h-9"
              onClick={() => setAddUserDialogOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {intl.formatMessage({ id: "admin.users.addUser" })}
            </Button>

            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" />
              {intl.formatMessage({ id: "admin.users.export" })}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card className="">
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Kimlik</TableHead>
                <TableHead className="w-[250px]">
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("name")}
                  >
                    {intl.formatMessage({ id: "admin.users.table.nameEmail" })}
                    {sortBy === "name" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("role")}
                  >
                    {intl.formatMessage({ id: "admin.users.table.role" })}
                    {sortBy === "role" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("status")}
                  >
                    {intl.formatMessage({ id: "admin.users.table.status" })}
                    {sortBy === "status" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("subscription")}
                  >
                    {intl.formatMessage({ id: "admin.users.table.plan" })}
                    {sortBy === "subscription" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("xp")}
                  >
                    XP
                    {sortBy === "xp" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("gems")}
                  >
                    {intl.formatMessage({ id: "admin.users.table.gems" })}
                    {sortBy === "gems" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("streak")}
                  >
                    {intl.formatMessage({ id: "admin.users.table.streak" })}
                    {sortBy === "streak" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center"
                    onClick={() => toggleSort("joinDate")}
                  >
                    {intl.formatMessage({ id: "admin.users.table.joined" })}
                    {sortBy === "joinDate" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  {intl.formatMessage({ id: "admin.users.table.actions" })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading state - show skeleton rows
                Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell
                      colSpan={9}
                      className="h-16 animate-pulse bg-gray-100 dark:bg-gray-800"
                    ></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    {intl.formatMessage({ id: "admin.users.table.noUsers" })}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.id.substring(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={
                              getNestedValue(
                                user,
                                "publicMetadata.avatar",
                                ""
                              ) ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={getNestedValue(
                              user,
                              "publicMetadata.name",
                              ""
                            )}
                          />
                          <AvatarFallback>
                            {getNestedValue(user, "publicMetadata.name", "")
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {getNestedValue(user, "publicMetadata.name", "")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getRoleBadgeColor(
                          getNestedValue(user, "privateMetadata.role", "free")
                        )}
                        variant="secondary"
                      >
                        {getRoleLabel(
                          String(getNestedValue(user, "privateMetadata.role", "free"))
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusBadgeColor(
                          getNestedValue(
                            user,
                            "privateMetadata.status",
                            "active"
                          )
                        )}
                        variant="secondary"
                      >
                        {getStatusLabel(
                          String(getNestedValue(user, "privateMetadata.status", "active"))
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getSubscriptionBadgeColor(
                          getNestedValue(
                            user,
                            "privateMetadata.subscription",
                            "free"
                          )
                        )}
                        variant="secondary"
                      >
                        {getSubscriptionLabel(
                          String(
                            getNestedValue(user, "privateMetadata.subscription", "free")
                          )
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {user.xp?.toLocaleString() || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Gem className="h-4 w-4 text-blue-500" />
                        {user.gems?.toLocaleString() || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      {intl.formatMessage(
                        { id: "admin.users.table.days" },
                        { count: user.streak || 0 }
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.joinDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menüyü aç</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>
                            {intl.formatMessage({ id: "admin.users.actions.title" })}
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/users/${user.id}`)
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {intl.formatMessage({ id: "admin.users.actions.viewProfile" })}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {intl.formatMessage({ id: "admin.users.actions.editUser" })}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setRoleDialogOpen(true);
                            }}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {intl.formatMessage({ id: "admin.users.actions.changeRole" })}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setCreditDialogOpen(true);
                            }}
                          >
                            <Star className="mr-2 h-4 w-4" />
                            {intl.formatMessage({ id: "admin.users.actions.adjustXP" })}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setCreditDialogOpen(true);
                            }}
                          >
                            <Gem className="mr-2 h-4 w-4" />
                            {intl.formatMessage({ id: "admin.users.actions.adjustGems" })}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setCreditDialogOpen(true);
                            }}
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            {intl.formatMessage({ id: "admin.users.actions.adjustHearts" })}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setCreditDialogOpen(true);
                            }}
                          >
                            <Droplets className="mr-2 h-4 w-4" />
                            {intl.formatMessage({ id: "admin.users.actions.adjustGel" })}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setSelectedUser(user);
                              setBanDialogOpen(true);
                            }}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {getNestedValue(
                              user,
                              "privateMetadata.status",
                              ""
                            ) === "banned"
                              ? intl.formatMessage({ id: "admin.users.actions.unbanUser" })
                              : intl.formatMessage({ id: "admin.users.actions.banUser" })}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleDeleteUser(
                                user.id,
                                getNestedValue(user, "publicMetadata.name", "")
                              )
                            }
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            {intl.formatMessage({ id: "admin.users.actions.deleteAccount" })}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Enhanced pagination with page info */}
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-sm text-muted-foreground">
          {intl.formatMessage(
            { id: "admin.users.pagination.showing" },
            {
              start: users.length > 0 ? (currentPage - 1) * pageSize + 1 : 0,
              end: Math.min(currentPage * pageSize, totalUsers),
              total: totalUsers
            }
          )}
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                // disabled={currentPage === 1 || isLoading}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNumber =
                currentPage <= 3
                  ? i + 1
                  : currentPage >= totalPages - 2
                  ? totalPages - 4 + i
                  : currentPage - 2 + i;
              if (pageNumber <= 0 || pageNumber > totalPages) return null;

              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={currentPage === pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                // disabled={currentPage === totalPages || isLoading}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Dialogs */}
      <UserAddDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onUserAdded={handleAddUser}
      />

      {selectedUser && (
        <>
          <UserEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            user={selectedUser}
            // onSave={handleEditUser}
          />
          <UserCreditDialog
            open={creditDialogOpen}
            onOpenChange={setCreditDialogOpen}
            user={selectedUser}
            // onAdjust={(type, amount, reason) =>
            //   handleCreditAdjustment(selectedUser.id, type, amount, reason)
            // }
          />
          <UserBanDialog
            open={banDialogOpen}
            onOpenChange={setBanDialogOpen}
            user={selectedUser}
            // onAction={(action, reason, duration) =>
            //   handleBanUser(selectedUser.id, action, reason, duration)
            // }
          />
          <UserSubscriptionDialog
            open={subscriptionDialogOpen}
            onOpenChange={setSubscriptionDialogOpen}
            user={selectedUser}
            // onUpdate={(plan, duration, autoRenew) =>
            //   handleSubscriptionChange(
            //     selectedUser.id,
            //     plan,
            //     duration,
            //     autoRenew
            //   )
            // }
          />
          <UserProgressResetDialog
            open={progressResetDialogOpen}
            onOpenChange={setProgressResetDialogOpen}
            user={selectedUser}
            // onReset={(options) => handleProgressReset(selectedUser.id, options)}
          />
          <UserRoleDialog
            open={roleDialogOpen}
            onOpenChange={setRoleDialogOpen}
            user={selectedUser}
            // onRoleChange={(role, reason) =>
            //   handleRoleChange(selectedUser.id, role, reason)
            // }
          />
          <UserReportsDialog
            open={reportsDialogOpen}
            onOpenChange={setReportsDialogOpen}
            user={selectedUser}
          />
          <UserActivityLogsDialog
            open={activityLogsDialogOpen}
            onOpenChange={setActivityLogsDialogOpen}
            user={selectedUser}
          />
        </>
      )}
    </div>
  );
}
