"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ShopHeader } from "../shop-header";
import {
  AnalyticsCard,
  AnalyticsCardsGrid,
  AnalyticsCardSkeleton,
} from "../analytics-cards";
import { SearchFilters } from "../search-filters";
import type { Promotion, PromotionAnalytics } from "@/types/shop";
import { apiClient } from "@/lib/api-client";
import { FormattedMessage } from "react-intl";
import { PromotionForm } from "./promotion-form";
import { PromotionsGrid } from "./promotion-grid";

/**
 * PromotionsManagementPage - Main component for promotions management
 *
 * This component handles:
 * - Fetching promotions and analytics
 * - Filtering and searching promotions
 * - Creating, updating, and deleting promotions
 *
 * @component
 */
export function PromotionsManagementPage() {
  // State management
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionAnalytics, setPromotionAnalytics] =
    useState<PromotionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null
  );

  // Dialog states
  const [isNewPromotionDialogOpen, setIsNewPromotionDialogOpen] =
    useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Authentication
  const { getToken } = useAuth();

  // Fetch promotions
  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await apiClient.get(
        `/api/admin/shop/promotions?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPromotions(response.data.promotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast.error(
        <FormattedMessage
          id="promotions.error.fetch-promotions"
          defaultMessage="Failed to fetch promotions"
        />
      );
    } finally {
      setLoading(false);
    }
  }, [searchQuery, typeFilter, statusFilter, getToken]);

  // Fetch promotion analytics
  const fetchPromotionAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const token = await getToken();

      const response = await apiClient.get(
        "/api/admin/shop/promotions/analytics",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPromotionAnalytics(response.data.analytics);
    } catch (error) {
      console.error("Error fetching promotion analytics:", error);
      toast.error(
        <FormattedMessage
          id="promotions.error.fetch-analytics"
          defaultMessage="Failed to fetch promotion analytics"
        />
      );
    } finally {
      setAnalyticsLoading(false);
    }
  }, [getToken]);

  // Initial data fetch
  useEffect(() => {
    fetchPromotions();
    fetchPromotionAnalytics();
  }, [fetchPromotions, fetchPromotionAnalytics]);

  // Refetch promotions when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPromotions();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [fetchPromotions, searchQuery, typeFilter, statusFilter]);

  // Handle promotion creation success
  const handlePromotionCreated = (newPromotion: Promotion) => {
    setPromotions((prev) => [newPromotion, ...prev]);
    setIsNewPromotionDialogOpen(false);
    toast.success(
      <FormattedMessage
        id="promotions.success.promotion-created"
        defaultMessage="Promotion created successfully"
      />
    );
    fetchPromotionAnalytics(); // Refresh analytics
  };

  // Handle promotion update success
  const handlePromotionUpdated = (updatedPromotion: Promotion) => {
    setPromotions((prev) =>
      prev.map((promo) =>
        promo.id === updatedPromotion.id ? updatedPromotion : promo
      )
    );
    if (selectedPromotion?.id === updatedPromotion.id) {
      setSelectedPromotion(updatedPromotion);
    }
    toast.success(
      <FormattedMessage
        id="promotions.success.promotion-updated"
        defaultMessage="Promotion updated successfully"
      />
    );
    fetchPromotionAnalytics(); // Refresh analytics
    fetchPromotions();
  };

  // Handle promotion deletion success
  const handlePromotionDeleted = (deletedPromotionId: string) => {
    setPromotions((prev) =>
      prev.filter((promo) => promo.id !== deletedPromotionId)
    );
    if (selectedPromotion?.id === deletedPromotionId) {
      setSelectedPromotion(null);
    }
    toast.success(
      <FormattedMessage
        id="promotions.success.promotion-deleted"
        defaultMessage="Promotion deleted successfully"
      />
    );
    fetchPromotionAnalytics(); // Refresh analytics
  };

  // Filter promotions based on active tab
  const filteredPromotions = promotions.filter((promo) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && promo.status === "active") ||
      (activeTab === "upcoming" && promo.status === "upcoming") ||
      (activeTab === "expired" && promo.status === "expired");

    return matchesTab;
  });

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "—";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <ShopHeader
          title="Promotions & Discounts"
          description="Create and manage special offers and promotions"
        />
        <div className="flex gap-2">
          <Dialog
            open={isNewPromotionDialogOpen}
            onOpenChange={setIsNewPromotionDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                <FormattedMessage
                  id="promotions.button.new-promotion"
                  defaultMessage="New Promotion"
                />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>
                  <FormattedMessage
                    id="promotions.dialog.new-promotion.title"
                    defaultMessage="Create New Promotion"
                  />
                </DialogTitle>
                <DialogDescription>
                  <FormattedMessage
                    id="promotions.dialog.new-promotion.description"
                    defaultMessage="Set up a new promotion or discount for your shop items."
                  />
                </DialogDescription>
              </DialogHeader>
              <PromotionForm
                onClose={() => setIsNewPromotionDialogOpen(false)}
                onPromotionCreated={handlePromotionCreated}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCardsGrid>
        {analyticsLoading ? (
          // Loading skeleton for analytics
          Array.from({ length: 5 }).map((_, i) => (
            <AnalyticsCardSkeleton key={i} />
          ))
        ) : promotionAnalytics ? (
          <>
            <AnalyticsCard
              title="Active Promotions"
              value={promotionAnalytics.activePromotions}
            />
            <AnalyticsCard
              title="Upcoming"
              value={promotionAnalytics.upcomingPromotions}
            />
            <AnalyticsCard
              title="Expired"
              value={promotionAnalytics.expiredPromotions}
            />
            <AnalyticsCard
              title="Total Redemptions"
              value={formatNumber(promotionAnalytics.totalRedemptions)}
            />
            <AnalyticsCard
              title="Conversion Rate"
              value={promotionAnalytics.conversionRate}
            />
          </>
        ) : null}
      </AnalyticsCardsGrid>

      {/* Filters and Search */}
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          {
            id: "type",
            value: typeFilter,
            options: [
              { value: "all", label: "All Types" },
              { value: "discount", label: "Discount" },
              { value: "bundle", label: "Bundle" },
              { value: "seasonal", label: "Seasonal" },
              { value: "boost", label: "Boost" },
            ],
            onChange: setTypeFilter,
          },
          {
            id: "status",
            value: statusFilter,
            options: [
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "upcoming", label: "Upcoming" },
              { value: "expired", label: "Expired" },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Tabs and Promotion Cards */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            <FormattedMessage
              id="promotions.tabs.all"
              defaultMessage="All Promotions"
            />
          </TabsTrigger>
          <TabsTrigger value="active">
            <FormattedMessage
              id="promotions.tabs.active"
              defaultMessage="Active"
            />
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            <FormattedMessage
              id="promotions.tabs.upcoming"
              defaultMessage="Upcoming"
            />
          </TabsTrigger>
          <TabsTrigger value="expired">
            <FormattedMessage
              id="promotions.tabs.expired"
              defaultMessage="Expired"
            />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <PromotionsGrid
            promotions={filteredPromotions}
            loading={loading}
            onSelectPromotion={setSelectedPromotion}
            formatNumber={formatNumber}
            onPromotionUpdated={handlePromotionUpdated}
            onPromotionDeleted={handlePromotionDeleted}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <PromotionsGrid
            promotions={filteredPromotions}
            loading={loading}
            onSelectPromotion={setSelectedPromotion}
            formatNumber={formatNumber}
            onPromotionUpdated={handlePromotionUpdated}
            onPromotionDeleted={handlePromotionDeleted}
          />
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <PromotionsGrid
            promotions={filteredPromotions}
            loading={loading}
            onSelectPromotion={setSelectedPromotion}
            formatNumber={formatNumber}
            onPromotionUpdated={handlePromotionUpdated}
            onPromotionDeleted={handlePromotionDeleted}
          />
        </TabsContent>

        <TabsContent value="expired" className="mt-6">
          <PromotionsGrid
            promotions={filteredPromotions}
            loading={loading}
            onSelectPromotion={setSelectedPromotion}
            formatNumber={formatNumber}
            onPromotionUpdated={handlePromotionUpdated}
            onPromotionDeleted={handlePromotionDeleted}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
