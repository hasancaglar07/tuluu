"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { Plus, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ShopHeader } from "./shop-header"
import { AnalyticsCard, AnalyticsCardsGrid, AnalyticsCardSkeleton } from "./analytics-cards"
import { SearchFilters } from "./search-filters"
import { ShopItemsGrid } from "./shop-items-grid"
import type { ShopItem, Category, ShopAnalytics } from "@/types/shop"
import { apiClient } from "@/lib/api-client"
import { FormattedMessage } from "react-intl"
import { ShopItemDetailsDialog } from "./shop-item-details-dialog"
import { ShopCategoryManager } from "./shop-category-manager"
import { ShopItemForm } from "./shop-item-form"

/**
 * ShopManagementPage - The main component for the shop management page
 *
 * This component handles:
 * - Fetching shop items, categories, and analytics
 * - Filtering and searching items
 * - Creating, updating, and deleting items
 * - Managing categories
 *
 * @component
 */
export function ShopManagementPage() {
  // State management
  const [shopItems, setShopItems] = useState<ShopItem[]>([])
  const [shopAnalytics, setShopAnalytics] = useState<ShopAnalytics | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)

  // Dialog states
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Authentication
  const { getToken } = useAuth()

  // Fetch shop items with filters
  const fetchShopItems = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getToken()

      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await apiClient.get(`/api/admin/shop/items?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setShopItems(response.data.items)
    } catch (error) {
      console.error("Error fetching shop items:", error)
      toast.error(<FormattedMessage id="shop.error.fetch-items" defaultMessage="Failed to fetch shop items" />)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, categoryFilter, statusFilter, getToken])

  // Fetch shop analytics
  const fetchShopAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true)
      const token = await getToken()

      const response = await apiClient.get("/api/admin/shop/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setShopAnalytics(response.data.analytics)
    } catch (error) {
      console.error("Error fetching shop analytics:", error)
      toast.error(<FormattedMessage id="shop.error.fetch-analytics" defaultMessage="Failed to fetch shop analytics" />)
    } finally {
      setAnalyticsLoading(false)
    }
  }, [getToken])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const token = await getToken()

      const response = await apiClient.get("/api/admin/shop/categories", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setCategories(response.data.categories)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error(<FormattedMessage id="shop.error.fetch-categories" defaultMessage="Failed to fetch categories" />)
    }
  }, [getToken])

  // Initial data fetch
  useEffect(() => {
    fetchShopItems()
    fetchShopAnalytics()
    fetchCategories()
  }, [fetchCategories, fetchShopAnalytics, fetchShopItems])

  // Refetch items when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchShopItems()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [fetchShopItems, searchQuery, categoryFilter, statusFilter])

  // Handle item creation success
  const handleItemCreated = (newItem: ShopItem) => {
    setShopItems((prev) => [newItem, ...prev])
    setIsNewItemDialogOpen(false)
    toast.success(<FormattedMessage id="shop.success.item-created" defaultMessage="Shop item created successfully" />)
    fetchShopAnalytics() // Refresh analytics
  }

  // Handle item update success
  const handleItemUpdated = (updatedItem: ShopItem) => {
    setShopItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    if (selectedItem?.id === updatedItem.id) {
      setSelectedItem(updatedItem)
    }
    toast.success(<FormattedMessage id="shop.success.item-updated" defaultMessage="Shop item updated successfully" />)
    fetchShopAnalytics() // Refresh analytics
    fetchShopItems()
  }

  // Handle item deletion success
  const handleItemDeleted = (deletedItemId: string) => {
    setShopItems((prev) => prev.filter((item) => item.id !== deletedItemId))
    if (selectedItem?.id === deletedItemId) {
      setSelectedItem(null)
    }
    toast.success(<FormattedMessage id="shop.success.item-deleted" defaultMessage="Shop item deleted successfully" />)
    fetchShopAnalytics() // Refresh analytics
  }

  // Handle category updates
  const handleCategoriesUpdated = () => {
    fetchCategories()
    fetchShopItems() // Refresh items in case category names changed
  }

  // Filter items based on active tab
  const filteredItems = shopItems.filter((item) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && item.status === "active") ||
      (activeTab === "inactive" && item.status === "inactive")

    return matchesTab
  })

  // Format currency for display
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "gems") return `${amount} gems`
    if (currency === "USD") return `$${amount.toFixed(2)}`
    return `${amount} ${currency}`
  }

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <ShopHeader title="Shop Management" description="Create, edit, and manage items in your in-app shop" />
        <div className="flex gap-2 flex-1 justify-end">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Tag className="mr-2 h-4 w-4" />
                <FormattedMessage id="shop.button.manage-categories" defaultMessage="Manage Categories" />
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  <FormattedMessage id="shop.dialog.categories.title" defaultMessage="Manage Shop Categories" />
                </DialogTitle>
                <DialogDescription>
                  <FormattedMessage
                    id="shop.dialog.categories.description"
                    defaultMessage="Create, edit, and organize categories for your shop items."
                  />
                </DialogDescription>
              </DialogHeader>
              <ShopCategoryManager categories={categories} onCategoriesUpdated={handleCategoriesUpdated} />
            </DialogContent>
          </Dialog>

          <Dialog open={isNewItemDialogOpen} onOpenChange={setIsNewItemDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                <FormattedMessage id="shop.button.add-item" defaultMessage="Add New Item" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>
                  <FormattedMessage id="shop.dialog.new-item.title" defaultMessage="Create New Shop Item" />
                </DialogTitle>
                <DialogDescription>
                  <FormattedMessage
                    id="shop.dialog.new-item.description"
                    defaultMessage="Fill in the details to create a new item for your shop."
                  />
                </DialogDescription>
              </DialogHeader>
              <ShopItemForm
                categories={categories}
                onClose={() => setIsNewItemDialogOpen(false)}
                onItemCreated={handleItemCreated}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCardsGrid>
        {analyticsLoading ? (
          // Loading skeleton for analytics
          Array.from({ length: 4 }).map((_, i) => <AnalyticsCardSkeleton key={i} />)
        ) : shopAnalytics ? (
          <>
            <AnalyticsCard
              title="Total Revenue"
              value={`${formatNumber(shopAnalytics.totalRevenue)} gems`}
              subtitle={`~$${Math.round(shopAnalytics.totalRevenue / 100).toLocaleString()}`}
            />
            <AnalyticsCard
              title="Total Purchases"
              value={formatNumber(shopAnalytics.totalPurchases)}
              subtitle={`Avg. ${shopAnalytics.averageOrderValue.toFixed(0)} gems per purchase`}
            />
            <AnalyticsCard
              title="Top Selling"
              value={shopAnalytics.topSellingItem}
              subtitle={`Category: ${shopAnalytics.topSellingCategory}`}
            />
            <AnalyticsCard
              title="Conversion Rate"
              value={shopAnalytics.conversionRate}
              subtitle="Of shop visitors make a purchase"
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
            id: "category",
            value: categoryFilter,
            options: [
              { value: "all", label: "All Categories" },
              ...categories.map((category) => ({
                value: category.name,
                label: category.name,
              })),
            ],
            onChange: setCategoryFilter,
          },
          {
            id: "status",
            value: statusFilter,
            options: [
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Tabs and Item List */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            <FormattedMessage id="shop.tabs.all" defaultMessage="All Items" />
          </TabsTrigger>
          <TabsTrigger value="active">
            <FormattedMessage id="shop.tabs.active" defaultMessage="Active" />
          </TabsTrigger>
          <TabsTrigger value="inactive">
            <FormattedMessage id="shop.tabs.inactive" defaultMessage="Inactive" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
          <ShopItemsGrid
            items={filteredItems}
            loading={loading}
            onSelectItem={setSelectedItem}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          <ShopItemsGrid
            items={filteredItems}
            loading={loading}
            onSelectItem={setSelectedItem}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        </TabsContent>
        <TabsContent value="inactive" className="mt-6">
          <ShopItemsGrid
            items={filteredItems}
            loading={loading}
            onSelectItem={setSelectedItem}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
          />
        </TabsContent>
      </Tabs>

      {/* Item Details Dialog */}
      {selectedItem && (
        <ShopItemDetailsDialog
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open: boolean) => !open && setSelectedItem(null)}
          onItemUpdated={handleItemUpdated}
          onItemDeleted={handleItemDeleted}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          categories={categories}
        />
      )}
    </div>
  )
}
