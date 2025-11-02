"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  UserCheck,
  Lock,
  Globe,
  UserIcon,
  MapPin,
  Clock,
  Search,
  Calendar,
  Activity,
} from "lucide-react";
import { format } from "date-fns";

interface LoginRecord {
  id: string;
  date: string;
  ip: string;
  device: string;
  browser: string;
  location?: string;
  success: boolean;
}

interface ActivityRecord {
  id: string;
  type: string;
  description: string;
  date: string;
  xpEarned?: number;
  gemsEarned?: number;
}

interface User {
  id: string;
  name: string;
  loginHistory?: LoginRecord[];
  recentActivity?: ActivityRecord[];
}

interface UserActivityLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export default function UserActivityLogsDialog({
  open,
  onOpenChange,
  user,
}: UserActivityLogsDialogProps) {
  const [activeTab, setActiveTab] = useState("logins");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return dateString;
    }
  };

  // Function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "lesson_completed":
        return <Activity className="h-4 w-4 text-blue-500" />;
      case "quest_completed":
        return <Flag className="h-4 w-4 text-green-500" />;
      case "streak_milestone":
        return <Flame className="h-4 w-4 text-orange-500" />;
      case "level_up":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "purchase":
        return <ShoppingCart className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  // Missing components for the icons
  const Flag = Activity;
  const Flame = Activity;
  const Trophy = Activity;
  const ShoppingCart = Activity;

  // Filter login records
  const filteredLogins =
    user.loginHistory?.filter((login) => {
      // Search filter
      const matchesSearch =
        login.ip.includes(searchQuery) ||
        login.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (login.location &&
          login.location.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "success" && login.success) ||
        (statusFilter === "failed" && !login.success);

      // Date filter (simplified - would need actual date logic in a real app)
      const matchesDate = dateFilter === "all";

      return matchesSearch && matchesStatus && matchesDate;
    }) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            User Activity Logs
          </DialogTitle>
          <DialogDescription>
            View login history and activity for user {user.name}.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="logins">Login History</TabsTrigger>
            <TabsTrigger value="activity">User Activity</TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {activeTab === "logins" && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Successful</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="logins" className="mt-4 space-y-4">
            {filteredLogins.length > 0 ? (
              filteredLogins.map((login) => (
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
                  No login records match your search criteria.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-4 space-y-4">
            {user.recentActivity && user.recentActivity.length > 0 ? (
              user.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 border rounded-lg"
                >
                  <div className="bg-gray-100 p-2 rounded-full">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.description}</p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                    </div>
                    {(activity.xpEarned || activity.gemsEarned) && (
                      <div className="flex items-center space-x-4 mt-2">
                        {activity.xpEarned && (
                          <div className="flex items-center space-x-1">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">
                              +{activity.xpEarned} XP
                            </span>
                          </div>
                        )}
                        {activity.gemsEarned && (
                          <div className="flex items-center space-x-1">
                            <ShoppingCart className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">
                              +{activity.gemsEarned} Gems
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Activity Found</h3>
                <p className="text-sm text-gray-500">
                  No activity records match your search criteria.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
