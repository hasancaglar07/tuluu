"use client"

import type { ShopItem } from "@/types/shop"
import { ShopItemCard } from "./shop-item-card"
import { EmptyState } from "./empty-state"
import { Package } from "lucide-react"

interface ShopItemsGridProps {
  items: ShopItem[]
  loading: boolean
  onSelectItem: (item: ShopItem) => void
  formatCurrency: (amount: number, currency: string) => string
  formatNumber: (num: number) => string
}

/**
 * ShopItemsGrid - A grid layout for shop items
 *
 * @component
 * @param {Object} props - Component props
 * @param {ShopItem[]} props.items - The shop items to display
 * @param {boolean} props.loading - Whether the items are loading
 * @param {Function} props.onSelectItem - Callback when an item is selected
 * @param {Function} props.formatCurrency - Function to format currency values
 * @param {Function} props.formatNumber - Function to format numbers with commas
 */
export function ShopItemsGrid({ items, loading, onSelectItem, formatCurrency, formatNumber }: ShopItemsGridProps) {
  if (loading) {
    // Return loading skeleton
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg overflow-hidden">
            <div className="p-4 pb-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="border-t" />
            <div className="p-4 pt-3">
              <div className="h-8 bg-muted rounded animate-pulse w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState icon={Package} title="No items found" description="Try adjusting your search or filter criteria" />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <ShopItemCard
          key={item.id}
          item={item}
          onSelect={() => onSelectItem(item)}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
      ))}
    </div>
  )
}
