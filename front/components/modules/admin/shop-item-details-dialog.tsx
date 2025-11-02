"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  DollarSign,
  Edit,
  Eye,
  EyeOff,
  Package,
  Trash2,
  Users,
  Tag,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ShopItemForm } from "@/components/modules/admin/shop-item-form";
import { toast } from "sonner";
import { Category, ShopItem } from "@/types";
import { useAuth } from "@clerk/nextjs";

// Define TypeScript interfaces for our data structures

interface PurchaseRecord {
  id: string;
  userId: string;
  username: string;
  date: string;
  status: "completed" | "failed" | "refunded";
}

interface UserSegment {
  segment: string;
  percentage: string;
}

interface DeviceBreakdown {
  mobile: string;
  tablet: string;
  desktop: string;
}

interface AnalyticsData {
  dailyPurchases: number[];
  conversionRate: string;
  averagePurchaseTime: string;
  topUserSegments: UserSegment[];
  deviceBreakdown: DeviceBreakdown;
}

interface HistoryRecord {
  action: string;
  user: string;
  date: string;
  details: string;
}

interface ApiResponse<T> {
  data: T;
  error?: string;
}

interface ShopItemDetailsDialogProps {
  item: ShopItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatCurrency: (amount: number, currency: string) => string;
  formatNumber: (num: number) => string;
  onItemUpdated?: (updatedItem: ShopItem) => void;
  onItemDeleted?: (id: string) => void;
  categories?: Category[]; // Add this line
}

export function ShopItemDetailsDialog({
  item,
  open,
  onOpenChange,
  formatCurrency,
  formatNumber,
  onItemUpdated,
  onItemDeleted,
  categories = [], // Add this line with default value
}: ShopItemDetailsDialogProps) {
  // State management for tabs, data loading, and confirmation dialogs
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseRecord[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [historyData, setHistoryData] = useState<HistoryRecord[]>([]);

  // Loading states
  const [loadingPurchases, setLoadingPurchases] = useState<boolean>(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Action states
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // Confirmation dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState<boolean>(false);

  // Add this after the existing state declarations
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);

  const { getToken } = useAuth();
  // Toast notifications
  // Effect to fetch data when the dialog opens and item changes
  useEffect(() => {
    if (open && item?.id) {
      // Reset states when opening with a new item
      setActiveTab("overview");

      // Only fetch data for the active tab to optimize performance
      if (activeTab === "purchases") {
        fetchPurchaseHistory(item.id);
      } else if (activeTab === "analytics") {
        fetchAnalyticsData(item.id);
      } else if (activeTab === "history") {
        fetchHistoryData(item.id);
      }
    }
  }, [open, item?.id]);

  // Effect to fetch data when changing tabs
  useEffect(() => {
    if (open && item?.id) {
      if (activeTab === "purchases" && purchaseHistory.length === 0) {
        fetchPurchaseHistory(item.id);
      } else if (activeTab === "analytics" && !analyticsData) {
        fetchAnalyticsData(item.id);
      } else if (activeTab === "history" && historyData.length === 0) {
        fetchHistoryData(item.id);
      }
    }
  }, [activeTab]);

  /**
   * Fetches purchase history for a specific shop item
   * @param itemId - The ID of the shop item
   */
  const fetchPurchaseHistory = async (itemId: string): Promise<void> => {
    setLoadingPurchases(true);
    try {
      const token = await getToken();
      // Fetch purchase history from API
      const response = await axios.get<
        ApiResponse<{ purchases: PurchaseRecord[] }>
      >(
        process.env.NEXT_PUBLIC_API_URL +
          `/api/admin/shop/items/${itemId}/purchases`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPurchaseHistory(response.data.data.purchases);
    } catch (error) {
      console.error("Error fetching purchase history:", error);
      toast.error("Failed to load purchase history");
      // Set empty array to prevent repeated fetch attempts
      setPurchaseHistory([]);
    } finally {
      setLoadingPurchases(false);
    }
  };

  /**
   * Fetches analytics data for a specific shop item
   * @param itemId - The ID of the shop item
   */
  const fetchAnalyticsData = async (itemId: string): Promise<void> => {
    setLoadingAnalytics(true);
    try {
      const token = await getToken();

      // Fetch analytics data from API
      const response = await axios.get<
        ApiResponse<{ analytics: AnalyticsData }>
      >(
        process.env.NEXT_PUBLIC_API_URL +
          `/api/admin/shop/items/${itemId}/analytics`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAnalyticsData(response.data.data.analytics);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
      // Set default analytics data to prevent UI errors
      setAnalyticsData({
        dailyPurchases: [0, 0, 0, 0, 0, 0, 0],
        conversionRate: "0%",
        averagePurchaseTime: "0 seconds",
        topUserSegments: [],
        deviceBreakdown: { mobile: "0%", tablet: "0%", desktop: "0%" },
      });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  /**
   * Fetches history data for a specific shop item
   * @param itemId - The ID of the shop item
   */
  const fetchHistoryData = async (itemId: string): Promise<void> => {
    setLoadingHistory(true);
    try {
      const token = await getToken();

      // Fetch history data from API
      const response = await axios.get<
        ApiResponse<{ history: HistoryRecord[] }>
      >(
        process.env.NEXT_PUBLIC_API_URL +
          `/api/admin/shop/items/${itemId}/history`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHistoryData(response.data.data.history);
    } catch (error) {
      console.error("Error fetching history data:", error);
      toast.error("Failed to load history data");
      // Set empty array to prevent repeated fetch attempts
      setHistoryData([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  /**
   * Handles toggling the item's active status
   */
  const handleToggleStatus = async (): Promise<void> => {
    if (!item) return;

    setIsUpdatingStatus(true);
    try {
      // Determine the action based on current status
      const action = item.status === "active" ? "deactivate" : "activate";

      // Send PATCH request to update status
      await axios.patch(`/api/admin/shop/items/${item.id}`, { action });

      toast(
        `Item ${
          action === "activate" ? "activated" : "deactivated"
        } successfully`
      );

      // Notify parent component to refresh data
      if (onItemUpdated) {
        onItemUpdated(item);
      }

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating item status:", error);
      toast.error("Failed to update item status");
    } finally {
      setIsUpdatingStatus(false);
      setShowStatusConfirm(false);
    }
  };

  /**
   * Handles deleting the shop item
   */
  const handleDelete = async (): Promise<void> => {
    if (!item) return;

    setIsDeleting(true);

    try {
      const token = await getToken();
      // Send DELETE request
      await axios.delete(
        process.env.NEXT_PUBLIC_API_URL + `/api/admin/shop/items/${item.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast("Item deleted successfully");

      // Notify parent component to refresh data
      if (onItemDeleted && item.id) {
        onItemDeleted(item.id);
      }

      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast("Failed to delete item");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  /**
   * Handles opening the edit dialog for this item
   */
  const handleEdit = (): void => {
    if (!item) return;

    // Open the edit dialog instead of navigating to another page
    setShowEditDialog(true);
  };

  /**
   * Format date for display
   * @param dateString - ISO date string
   * @returns Formatted date string
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // If no item is provided, don't render anything
  if (!item) return null;

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl">{item.name}</DialogTitle>
              <Badge
                variant={item.status === "active" ? "default" : "secondary"}
              >
                {item.status}
              </Badge>
            </div>
            <DialogDescription>Item ID: {item.id}</DialogDescription>
          </DialogHeader>

          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="purchases">Purchases</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="flex gap-4 flex-col md:flex-row">
                <div className="w-full md:w-1/3">
                  <div className="rounded-lg overflow-hidden border bg-card text-card-foreground shadow">
                    <div className="h-40 bg-muted flex items-center justify-center">
                      <img
                        src={
                          item.image || "/placeholder.svg?height=128&width=128"
                        }
                        alt={item.name}
                        className="h-32 w-32 object-contain"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-2/3 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">
                        {formatCurrency(item.price, item.currency)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="font-medium">
                        {item.stockType === "unlimited"
                          ? "Unlimited"
                          : `Limited (${item.stockQuantity || 0})`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Eligibility:
                      </span>
                      <span className="font-medium">{item.eligibility}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">
                        {item.createdAt.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Purchases
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatNumber(item.purchases)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Revenue
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatNumber(item.revenue)} {item.currency}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-end gap-2">
                    {/* Toggle status button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => setShowStatusConfirm(true)}
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : item.status === "active" ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span>Activate</span>
                        </>
                      )}
                    </Button>

                    {/* Edit button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={handleEdit}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>

                    {/* Delete button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        setShowEditDialog(false);
                        setShowDeleteConfirm(true);
                      }}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Purchases Tab */}
            <TabsContent value="purchases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Purchases</CardTitle>
                  <CardDescription>
                    View the most recent purchases of this item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPurchases ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : purchaseHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">No purchases yet</h3>
                      <p className="text-sm text-muted-foreground">
                        This item hasn&apos;t been purchased by any users yet.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-md border">
                      <div className="grid grid-cols-4 p-4 font-medium border-b">
                        <div>User</div>
                        <div>Date</div>
                        <div>Status</div>
                        <div className="text-right">Actions</div>
                      </div>
                      {purchaseHistory.map((purchase) => (
                        <div
                          key={purchase.id}
                          className="grid grid-cols-4 p-4 border-b last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                              {purchase.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">
                                {purchase.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {purchase.userId}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {formatDate(purchase.date)}
                          </div>
                          <div className="flex items-center">
                            <Badge
                              variant={
                                purchase.status === "completed"
                                  ? "default"
                                  : purchase.status === "refunded"
                                  ? "outline"
                                  : "destructive"
                              }
                            >
                              {purchase.status}
                            </Badge>
                          </div>
                          <div className="flex justify-end items-center gap-2">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                            {purchase.status === "completed" && (
                              <Button variant="outline" size="sm">
                                Refund
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-4">
              {loadingAnalytics ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : !analyticsData ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">
                    No analytics available
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Analytics data could not be loaded for this item.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Conversion Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analyticsData.conversionRate}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Of shop visitors purchase this item
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Avg. Purchase Time
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analyticsData.averagePurchaseTime}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Time spent before purchasing
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Daily Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-10 flex items-end gap-1">
                          {analyticsData.dailyPurchases.map((value, index) => (
                            <div
                              key={index}
                              className="bg-primary rounded-sm w-full"
                              style={{
                                height: `${
                                  (value /
                                    Math.max(...analyticsData.dailyPurchases)) *
                                  100
                                }%`,
                                minHeight: "4px",
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Last 7 days purchase volume
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">
                          Top User Segments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {analyticsData.topUserSegments.map(
                            (segment, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>{segment.segment}</span>
                                  <span className="font-medium">
                                    {segment.percentage}
                                  </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: segment.percentage }}
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">
                          Device Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Mobile</span>
                              <span className="font-medium">
                                {analyticsData.deviceBreakdown.mobile}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: analyticsData.deviceBreakdown.mobile,
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Tablet</span>
                              <span className="font-medium">
                                {analyticsData.deviceBreakdown.tablet}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: analyticsData.deviceBreakdown.tablet,
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Desktop</span>
                              <span className="font-medium">
                                {analyticsData.deviceBreakdown.desktop}
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{
                                  width: analyticsData.deviceBreakdown.desktop,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Item History</CardTitle>
                  <CardDescription>
                    Track changes and updates to this shop item
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : historyData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">
                        No history available
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        No history records found for this item.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {historyData.map((event, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="relative">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              {event.action === "Created" && (
                                <Package className="h-4 w-4" />
                              )}
                              {event.action === "Updated" && (
                                <Edit className="h-4 w-4" />
                              )}
                              {event.action === "Activated" && (
                                <Eye className="h-4 w-4" />
                              )}
                              {event.action === "Deactivated" && (
                                <EyeOff className="h-4 w-4" />
                              )}
                            </div>
                            {index < historyData.length - 1 && (
                              <div className="absolute top-8 bottom-0 left-1/2 w-px -ml-px bg-muted" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{event.action}</p>
                                <p className="text-sm text-muted-foreground">
                                  by {event.user} on {formatDate(event.date)}
                                </p>
                              </div>
                              <Badge variant="outline">{event.action}</Badge>
                            </div>
                            <p className="mt-2 text-sm">{event.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="items-center">
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              shop item <strong>{item.name}</strong> and remove it from the
              database.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex justify-between gap-4">
            <Button
              disabled={isDeleting}
              onClick={() => {
                setShowDeleteConfirm(false); // Close this dialog
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90 flex-1"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {item.status === "active" ? "Deactivate" : "Activate"} Item?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {item.status === "active"
                ? "This will hide the item from the shop and prevent users from purchasing it."
                : "This will make the item visible in the shop and available for purchase."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingStatus}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleToggleStatus();
              }}
              disabled={isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : item.status === "active" ? (
                "Deactivate"
              ) : (
                "Activate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Shop Item</DialogTitle>
            <DialogDescription>
              Update the details for {item.name}.
            </DialogDescription>
          </DialogHeader>
          <ShopItemForm
            editItem={item}
            categories={categories} // Use the passed categories
            onClose={() => setShowEditDialog(false)}
            onItemUpdated={() => {
              // Handle the updated item
              if (onItemUpdated) {
                onItemUpdated(item);
              }
              setShowEditDialog(false);
              // Optionally close the details dialog too
              onOpenChange(false);
              toast.success("Item updated successfully");
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
