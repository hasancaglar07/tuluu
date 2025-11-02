"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { Filter, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShopHeader } from "../shop-header"
import { AnalyticsCard, AnalyticsCardsGrid, AnalyticsCardSkeleton } from "../analytics-cards"
import { SearchFilters } from "../search-filters"
import { InventoryTable } from "./inventory-table"
import type { InventoryItem, InventoryAnalytics } from "@/types/shop"
import { apiClient } from "@/lib/api-client"
import { FormattedMessage } from "react-intl"

/**
 * InventoryManagementPage - Main component for inventory management
 *
 * This component handles:
 * - Fetching inventory items and analytics
 * - Filtering and searching inventory
 * - Managing stock levels
 *
 * @component
 */
export function InventoryManagementPage() {
  // State management
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [inventoryAnalytics, setInventoryAnalytics] = useState<InventoryAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")

  // Authentication
  const { getToken } = useAuth()

  // Fetch inventory items
  const fetchInventoryItems = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getToken()

      const params = new URLSearchParams()
      if (searchQuery) params.append("search", searchQuery)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (statusFilter !== "all") params.append("status", statusFilter)

      const response = await apiClient.get(`/api/admin/shop/inventory?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setInventoryItems(response.data.items)
    } catch (error) {
      console.error("Error fetching inventory items:", error)
      toast.error(
        <FormattedMessage id="inventory.error.fetch-items" defaultMessage="Failed to fetch inventory items" />,
      )
    } finally {
      setLoading(false)
    }
  }, [searchQuery, categoryFilter, statusFilter, getToken])

  // Fetch inventory analytics
  const fetchInventoryAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true)
      const token = await getToken()

      const response = await apiClient.get("/api/admin/shop/inventory/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setInventoryAnalytics(response.data.analytics)
    } catch (error) {
      console.error("Error fetching inventory analytics:", error)
      toast.error(
        <FormattedMessage id="inventory.error.fetch-analytics" defaultMessage="Failed to fetch inventory analytics" />,
      )
    } finally {
      setAnalyticsLoading(false)
    }
  }, [getToken])

  // Initial data fetch
  useEffect(() => {
    fetchInventoryItems()
    fetchInventoryAnalytics()
  }, [fetchInventoryItems, fetchInventoryAnalytics])

  // Refetch items when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchInventoryItems()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [fetchInventoryItems, searchQuery, categoryFilter, statusFilter])

  // Filter items based on active tab
  const filteredItems = inventoryItems.filter((item) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "in-stock" && item.status === "In Stock") ||
      (activeTab === "low-stock" && item.status === "Low Stock") ||
      (activeTab === "out-of-stock" && item.status === "Out of Stock") ||
      (activeTab === "expiring" && item.status === "Expiring Soon")

    return matchesTab
  })

  // Format large numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <ShopHeader title="Inventory Management" description="Monitor and manage your shop inventory" />
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            <FormattedMessage id="inventory.button.advanced-filters" defaultMessage="Advanced Filters" />
          </Button>
          <Button>
            <Package className="mr-2 h-4 w-4" />
            <FormattedMessage id="inventory.button.update-stock" defaultMessage="Update Stock" />
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <AnalyticsCardsGrid>
        {analyticsLoading ? (
          // Loading skeleton for analytics
          Array.from({ length: 5 }).map((_, i) => <AnalyticsCardSkeleton key={i} />)
        ) : inventoryAnalytics ? (
          <>
            <AnalyticsCard title="Total Items" value={inventoryAnalytics.totalItems} />
            <AnalyticsCard title="In Stock" value={inventoryAnalytics.inStock} className="text-green-600" />
            <AnalyticsCard title="Low Stock" value={inventoryAnalytics.lowStock} className="text-amber-600" />
            <AnalyticsCard title="Out of Stock" value={inventoryAnalytics.outOfStock} className="text-red-600" />
            <AnalyticsCard title="Expiring Soon" value={inventoryAnalytics.expiringItems} className="text-blue-600" />
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
              { value: "Power-ups", label: "Power-ups" },
              { value: "Outfits", label: "Outfits" },
              { value: "Currency", label: "Currency" },
              { value: "Special Offers", label: "Special Offers" },
              { value: "Lessons", label: "Lessons" },
            ],
            onChange: setCategoryFilter,
          },
          {
            id: "status",
            value: statusFilter,
            options: [
              { value: "all", label: "All Statuses" },
              { value: "in stock", label: "In Stock" },
              { value: "low stock", label: "Low Stock" },
              { value: "out of stock", label: "Out of Stock" },
              { value: "expiring", label: "Expiring Soon" },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Tabs and Inventory Table */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            <FormattedMessage id="inventory.tabs.all" defaultMessage="All Items" />
          </TabsTrigger>
          <TabsTrigger value="in-stock">
            <FormattedMessage id="inventory.tabs.in-stock" defaultMessage="In Stock" />
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            <FormattedMessage id="inventory.tabs.low-stock" defaultMessage="Low Stock" />
          </TabsTrigger>
          <TabsTrigger value="out-of-stock">
            <FormattedMessage id="inventory.tabs.out-of-stock" defaultMessage="Out of Stock" />
          </TabsTrigger>
          <TabsTrigger value="expiring">
            <FormattedMessage id="inventory.tabs.expiring" defaultMessage="Expiring Soon" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <InventoryTable
            items={filteredItems}
            loading={loading}
            formatNumber={formatNumber}
            onUpdateStock={(itemId, newStock) => {
              // Handle stock update
              console.log("Update stock for item:", itemId, "to:", newStock)
            }}
          />
        </TabsContent>

        <TabsContent value="in-stock" className="mt-6">
          <InventoryTable
            items={filteredItems}
            loading={loading}
            formatNumber={formatNumber}
            onUpdateStock={(itemId, newStock) => {
              console.log("Update stock for item:", itemId, "to:", newStock)
            }}
          />
        </TabsContent>

        <TabsContent value="low-stock" className="mt-6">
          <InventoryTable
            items={filteredItems}
            loading={loading}
            formatNumber={formatNumber}
            onUpdateStock={(itemId, newStock) => {
              console.log("Update stock for item:", itemId, "to:", newStock)
            }}
          />
        </TabsContent>

        <TabsContent value="out-of-stock" className="mt-6">
          <InventoryTable
            items={filteredItems}
            loading={loading}
            formatNumber={formatNumber}
            onUpdateStock={(itemId, newStock) => {
              console.log("Update stock for item:", itemId, "to:", newStock)
            }}
          />
        </TabsContent>

        <TabsContent value="expiring" className="mt-6">
          <InventoryTable
            items={filteredItems}
            loading={loading}
            formatNumber={formatNumber}
            onUpdateStock={(itemId, newStock) => {
              console.log("Update stock for item:", itemId, "to:", newStock)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
