"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  History,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { ShopItem, Category } from "@/types/shop";
import { apiClient } from "@/lib/api-client";
import { FormattedMessage } from "react-intl";
import { ShopItemForm } from "./shop-item-form";
import Image from "next/image";

interface ShopItemDetailsDialogProps {
  item: ShopItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemUpdated: (item: ShopItem) => void;
  onItemDeleted: (itemId: string) => void;
  formatCurrency: (amount: number, currency: string) => string;
  formatNumber: (num: number) => string;
  categories: Category[];
}

interface AnalyticsData {
  overview: {
    totalSales: number;
    completedSales: number;
    refundedSales: number;
    totalRevenue: number;
    totalQuantity: number;
    averageOrderValue: number;
    uniqueCustomers: number;
    currency: string;
  };
  performance: {
    views: number;
    conversionRate: number;
    salesGrowth: number;
    revenueGrowth: number;
    refundRate: number;
  };
  trends: {
    period: string;
    dailySales: Array<{
      date: string;
      sales: number;
      revenue: number;
      quantity: number;
    }>;
  };
  customers: {
    topCustomers: Array<{
      id: string;
      username: string;
      email: string;
      avatar: string;
      totalPurchases: number;
      totalSpent: number;
      totalQuantity: number;
      lastPurchase: string;
    }>;
  };
}

interface HistoryData {
  history: Array<{
    id: string;
    action: string;
    timestamp: string;
    userId: string | null;
    description: string;
    changes: Record<string, unknown>;
    metadata: Record<string, unknown>;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: {
    totalChanges: number;
    uniqueUsers: number;
    actionCounts: Record<string, number>;
  };
}

interface PurchaseData {
  purchases: Array<{
    id: string;
    userId: any;
    purchaseDate: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    transactionId: string;
    refundReason?: string;
    refundDate?: string;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  summary: {
    totalPurchases: number;
    completedPurchases: number;
    refundedPurchases: number;
    totalRevenue: number;
    currency: string;
  };
}

export function ShopItemDetailsDialog({
  item,
  open,
  onOpenChange,
  onItemUpdated,
  onItemDeleted,
  formatCurrency,
  formatNumber,
  categories,
}: ShopItemDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("30d");

  // History state
  const [historyData, setHistoryData] = useState<HistoryData | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);

  // Purchase state
  const [purchaseData, setPurchaseData] = useState<PurchaseData | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchaseStatus, setPurchaseStatus] = useState("");

  const { getToken } = useAuth();

  const getHistoryActionLabel = (action: string) => {
    switch (action) {
      case "created":
        return "Oluşturuldu";
      case "updated":
        return "Güncellendi";
      case "deleted":
        return "Silindi";
      case "status_changed":
        return "Durum Güncellendi";
      case "activated":
        return "Aktifleştirildi";
      case "deactivated":
        return "Pasifleştirildi";
      default:
        return action;
    }
  };

  const getPurchaseStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Tamamlandı";
      case "pending":
        return "Beklemede";
      case "refunded":
        return "İade Edildi";
      case "failed":
        return "Başarısız";
      default:
        return status;
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async (period: string = analyticsPeriod) => {
    try {
      setAnalyticsLoading(true);
      const token = await getToken();

      const response = await apiClient.get(
        `/api/admin/shop/items/${item.id}/analytics?period=${period}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAnalyticsData(response.data.data);
    } catch (error) {
      console.error("Analiz verisi alınırken hata:", error);
      toast.error("Analiz verileri yüklenemedi");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch history data
  const fetchHistory = async (page: number = historyPage) => {
    try {
      setHistoryLoading(true);
      const token = await getToken();

      const response = await apiClient.get(
        `/api/admin/shop/items/${item.id}/history?page=${page}&limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHistoryData(response.data.data);
    } catch (error) {
      console.error("Geçmiş verisi alınırken hata:", error);
      toast.error("Geçmiş verileri yüklenemedi");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Fetch purchase data
  const fetchPurchases = async (
    page: number = purchasePage,
    status: string = purchaseStatus
  ) => {
    try {
      setPurchaseLoading(true);
      const token = await getToken();

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(status && { status }),
      });

      const response = await apiClient.get(
        `/api/admin/shop/items/${item.id}/purchases?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPurchaseData(response.data.data);
    } catch (error) {
      console.error("Satın alma verisi alınırken hata:", error);
      toast.error("Satın alma verileri yüklenemedi");
    } finally {
      setPurchaseLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (!open) return;

    switch (activeTab) {
      case "analytics":
        if (!analyticsData) fetchAnalytics();
        break;
      case "history":
        if (!historyData) fetchHistory();
        break;
      case "purchases":
        if (!purchaseData) fetchPurchases();
        break;
    }
  }, [activeTab, open]);

  // Handle item deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = await getToken();

      await apiClient.delete(`/api/admin/shop/items/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onItemDeleted(item.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Mağaza ürünü silinirken hata:", error);
      toast.error(
        <FormattedMessage
          id="shop.error.delete-item"
          defaultMessage="Failed to delete shop item"
        />
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle status toggle
  const handleToggleStatus = async () => {
    try {
      setIsToggling(true);
      const token = await getToken();
      const newStatus = item.status === "active" ? "inactive" : "active";

      const response = await apiClient.patch(
        `/api/admin/shop/items/${item.id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onItemUpdated(response.data.item);
      toast.success(
        <FormattedMessage
          id="shop.success.status-updated"
          defaultMessage="Item status updated successfully"
        />
      );
    } catch (error) {
      console.error("Ürün durumu güncellenirken hata:", error);
      toast.error(
        <FormattedMessage
          id="shop.error.update-status"
          defaultMessage="Failed to update item status"
        />
      );
    } finally {
      setIsToggling(false);
    }
  };

  if (isEditing) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              <FormattedMessage
                id="shop.dialog.edit-item.title"
                defaultMessage="Edit Shop Item"
              />
            </DialogTitle>
            <DialogDescription>
              <FormattedMessage
                id="shop.dialog.edit-item.description"
                defaultMessage="Update the details of this shop item."
              />
            </DialogDescription>
          </DialogHeader>
          <ShopItemForm
            item={item}
            categories={categories}
            onClose={() => setIsEditing(false)}
            onItemUpdated={(updatedItem) => {
              onItemUpdated(updatedItem);
              setIsEditing(false);
            }}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-lg overflow-hidden">
                <Image
                  src={item.image ?? "/placeholder.svg"}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  width={64}
                  height={64}
                />
              </div>
              <div>
                <DialogTitle className="text-xl">{item.name}</DialogTitle>
                <DialogDescription className="mt-1">
                  {item.description}
                </DialogDescription>
              </div>
            </div>
            <Badge variant={item.status === "active" ? "default" : "secondary"}>
              <FormattedMessage
                id={`shop.item.status.${item.status}`}
                defaultMessage={item.status}
              />
            </Badge>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="mr-2 h-4 w-4" />
              Analiz
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              Geçmiş
            </TabsTrigger>
            <TabsTrigger value="purchases">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Satın Almalar
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto max-h-[60vh]">
            <TabsContent value="overview" className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    <FormattedMessage
                      id="shop.details.type"
                      defaultMessage="Type"
                    />
                  </h4>
                  <p className="capitalize">
                    <FormattedMessage
                      id={`shop.item.type.${item.type}`}
                      defaultMessage={item.type}
                    />
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    <FormattedMessage
                      id="shop.details.category"
                      defaultMessage="Category"
                    />
                  </h4>
                  <p>{item.category}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    <FormattedMessage
                      id="shop.details.price"
                      defaultMessage="Price"
                    />
                  </h4>
                  <p className="font-semibold">
                    {formatCurrency(item.price, item.currency)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    <FormattedMessage
                      id="shop.details.stock"
                      defaultMessage="Stock"
                    />
                  </h4>
                  <p>
                    {item.stockType === "unlimited"
                      ? "Sınırsız"
                      : formatNumber(item.stockQuantity || 0)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    <FormattedMessage
                      id="shop.details.purchases"
                      defaultMessage="Purchases"
                    />
                  </h4>
                  <p className="text-lg font-semibold">
                    {formatNumber(item.purchases)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    <FormattedMessage
                      id="shop.details.revenue"
                      defaultMessage="Revenue"
                    />
                  </h4>
                  <p className="text-lg font-semibold">
                    {formatCurrency(item.revenue, item.currency)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    <FormattedMessage
                      id="shop.details.views"
                      defaultMessage="Views"
                    />
                  </h4>
                  <p className="text-lg font-semibold">
                    {formatNumber(item.views)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Additional Details */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    <FormattedMessage
                      id="shop.details.eligibility"
                      defaultMessage="Eligibility"
                    />
                  </h4>
                  <p>{item.eligibility}</p>
                </div>

                {item.isLimitedTime && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      <FormattedMessage
                        id="shop.details.availability"
                        defaultMessage="Availability Period"
                      />
                    </h4>
                    <p>
                      {item.startDate &&
                        new Date(item.startDate).toLocaleDateString()}{" "}
                      -{" "}
                      {item.endDate &&
                        new Date(item.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {item.tags && item.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">
                      <FormattedMessage
                        id="shop.details.tags"
                        defaultMessage="Tags"
                      />
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    <FormattedMessage
                      id="shop.details.created"
                      defaultMessage="Created"
                    />
                  </h4>
                  <p>{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <FormattedMessage
                      id="shop.button.edit"
                      defaultMessage="Edit"
                    />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleToggleStatus}
                    disabled={isToggling}
                  >
                    {item.status === "active" ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        <FormattedMessage
                          id="shop.button.deactivate"
                          defaultMessage="Deactivate"
                        />
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        <FormattedMessage
                          id="shop.button.activate"
                          defaultMessage="Activate"
                        />
                      </>
                    )}
                  </Button>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <FormattedMessage
                        id="shop.button.delete"
                        defaultMessage="Delete"
                      />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        <FormattedMessage
                          id="shop.dialog.delete.title"
                          defaultMessage="Delete Shop Item"
                        />
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        <FormattedMessage
                          id="shop.dialog.delete.description"
                          defaultMessage="Are you sure you want to delete this item? This action cannot be undone."
                        />
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        <FormattedMessage
                          id="shop.button.cancel"
                          defaultMessage="Cancel"
                        />
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <FormattedMessage
                            id="shop.button.deleting"
                            defaultMessage="Deleting..."
                          />
                        ) : (
                          <FormattedMessage
                            id="shop.button.delete"
                            defaultMessage="Delete"
                          />
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Analiz Paneli</h3>
                <div className="flex items-center gap-2">
                  <Select
                    value={analyticsPeriod}
                    onValueChange={(value) => {
                      setAnalyticsPeriod(value);
                      fetchAnalytics(value);
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Son 7 Gün</SelectItem>
                      <SelectItem value="30d">Son 30 Gün</SelectItem>
                      <SelectItem value="90d">Son 90 Gün</SelectItem>
                      <SelectItem value="1y">Son 1 Yıl</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchAnalytics()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {analyticsLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : analyticsData ? (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Toplam Satış
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatNumber(analyticsData.overview.completedSales)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {analyticsData.performance.salesGrowth > 0 ? "+" : ""}
                          {analyticsData.performance.salesGrowth.toFixed(1)}%
                          önceki döneme göre
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Gelir</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(
                            analyticsData.overview.totalRevenue,
                            analyticsData.overview.currency
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {analyticsData.performance.revenueGrowth > 0
                            ? "+"
                            : ""}
                          {analyticsData.performance.revenueGrowth.toFixed(1)}%
                          önceki döneme göre
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Dönüşüm Oranı
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {analyticsData.performance.conversionRate.toFixed(2)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(analyticsData.performance.views)} toplam
                          görüntülenme
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Ortalama Sipariş Tutarı
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(
                            analyticsData.overview.averageOrderValue,
                            analyticsData.overview.currency
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(analyticsData.overview.uniqueCustomers)}{" "}
                          benzersiz müşteri
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Sales Trend Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Satış Trendi</CardTitle>
                      <CardDescription>
                        Seçilen dönem için günlük satış ve gelir
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analyticsData.trends.dailySales}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="sales"
                            stroke="#8884d8"
                            name="Satış"
                          />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#82ca9d"
                            name="Gelir"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top Customers */}
                  <Card>
                    <CardHeader>
                      <CardTitle>En İyi Müşteriler</CardTitle>
                      <CardDescription>
                        Bu üründe en fazla harcama yapan müşteriler
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Müşteri</TableHead>
                            <TableHead>Satın Alma</TableHead>
                            <TableHead>Toplam Harcama</TableHead>
                            <TableHead>Son Satın Alma</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analyticsData.customers.topCustomers.map(
                            (customer) => (
                              <TableRow key={customer.id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src={
                                        customer.avatar || "/placeholder.svg"
                                      }
                                      alt={customer.username}
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                    />
                                    <div>
                                      <div className="font-medium">
                                        {customer.username}
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        {customer.email}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>{customer.totalPurchases}</TableCell>
                                <TableCell>
                                  {formatCurrency(
                                    customer.totalSpent,
                                    analyticsData.overview.currency
                                  )}
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    customer.lastPurchase
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            )
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Analiz verisi bulunamadı
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Değişiklik Geçmişi</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchHistory()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {historyLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : historyData ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>İşlem</TableHead>
                        <TableHead>Açıklama</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Kullanıcı</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyData.history.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {getHistoryActionLabel(record.action)}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.description}</TableCell>
                          <TableCell>
                            {new Date(record.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>{record.userId || "Sistem"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {historyData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        disabled={!historyData.pagination.hasPreviousPage}
                        onClick={() => {
                          const newPage = historyPage - 1;
                          setHistoryPage(newPage);
                          fetchHistory(newPage);
                        }}
                      >
                        Önceki
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Sayfa {historyData.pagination.currentPage} /{" "}
                        {historyData.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={!historyData.pagination.hasNextPage}
                        onClick={() => {
                          const newPage = historyPage + 1;
                          setHistoryPage(newPage);
                          fetchHistory(newPage);
                        }}
                      >
                        Sonraki
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Geçmiş verisi bulunamadı
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="purchases" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Satın Alma Geçmişi</h3>
                <div className="flex items-center gap-2">
                  <Select
                    value={purchaseStatus}
                    onValueChange={(value) => {
                      setPurchaseStatus(value);
                      fetchPurchases(1, value);
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Tüm durumlar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm durumlar</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                      <SelectItem value="pending">Beklemede</SelectItem>
                      <SelectItem value="refunded">İade Edildi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchPurchases()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {purchaseLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : purchaseData ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">
                          Toplam Satın Alma
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatNumber(purchaseData.summary.totalPurchases)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Tamamlanan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatNumber(
                            purchaseData.summary.completedPurchases
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">İade Edilen</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatNumber(purchaseData.summary.refundedPurchases)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Toplam Gelir</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(
                            purchaseData.summary.totalRevenue,
                            purchaseData.summary.currency
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Purchases Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Müşteri</TableHead>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Adet</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Ödeme Yöntemi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseData.purchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Image
                                src={
                                  purchase.userId?.avatar ||
                                  "/placeholder.svg?height=24&width=24"
                                }
                                alt={purchase.userId?.username || "Kullanıcı"}
                                width={24}
                                height={24}
                                className="rounded-full"
                              />
                              <div>
                                <div className="font-medium">
                                  {purchase.userId?.username || "Bilinmiyor"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {purchase.userId?.email || ""}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              purchase.purchaseDate
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{purchase.quantity}</TableCell>
                          <TableCell>
                            {formatCurrency(
                              purchase.totalAmount,
                              purchase.currency
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                purchase.status === "completed"
                                  ? "default"
                                  : purchase.status === "refunded"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {getPurchaseStatusLabel(purchase.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">
                            {purchase.paymentMethod}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {purchaseData.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        disabled={!purchaseData.pagination.hasPreviousPage}
                        onClick={() => {
                          const newPage = purchasePage - 1;
                          setPurchasePage(newPage);
                          fetchPurchases(newPage, purchaseStatus);
                        }}
                      >
                        Önceki
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Sayfa {purchaseData.pagination.currentPage} /{" "}
                        {purchaseData.pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={!purchaseData.pagination.hasNextPage}
                        onClick={() => {
                          const newPage = purchasePage + 1;
                          setPurchasePage(newPage);
                          fetchPurchases(newPage, purchaseStatus);
                        }}
                      >
                        Sonraki
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Satın alma verisi bulunamadı
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
