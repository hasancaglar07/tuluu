"use client";

import type { Promotion } from "@/types/shop";
import { PromotionCard } from "./promotion-card";
import { EmptyState } from "../empty-state";
import { Tag } from "lucide-react";

interface PromotionsGridProps {
  promotions: Promotion[];
  loading: boolean;
  onSelectPromotion: (promotion: Promotion) => void;
  formatNumber: (num: number) => string;
  onPromotionUpdated: (promotion: Promotion) => void;
  onPromotionDeleted: (promotionId: string) => void;
}

/**
 * PromotionsGrid - A grid layout for promotions
 *
 * @component
 * @param {Object} props - Component props
 * @param {Promotion[]} props.promotions - The promotions to display
 * @param {boolean} props.loading - Whether the promotions are loading
 * @param {Function} props.onSelectPromotion - Callback when a promotion is selected
 * @param {Function} props.formatNumber - Function to format numbers
 * @param {Function} props.onPromotionUpdated - Callback when promotion is updated
 * @param {Function} props.onPromotionDeleted - Callback when promotion is deleted
 */
export function PromotionsGrid({
  promotions,
  loading,
  onSelectPromotion,
  formatNumber,
  onPromotionUpdated,
  onPromotionDeleted,
}: PromotionsGridProps) {
  if (loading) {
    // Return loading skeleton
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg overflow-hidden">
            <div className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-muted rounded-md animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-32" />
                    <div className="h-3 bg-muted rounded animate-pulse w-24" />
                  </div>
                </div>
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="p-4 pb-2">
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              </div>
            </div>
            <div className="border-t" />
            <div className="p-4 pt-4">
              <div className="flex justify-between">
                <div className="h-8 bg-muted rounded animate-pulse w-20" />
                <div className="h-8 bg-muted rounded animate-pulse w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <EmptyState
        icon={Tag}
        title="No promotions found"
        description="Try adjusting your search or filter criteria"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {promotions.map((promotion) => (
        <PromotionCard
          key={promotion.id}
          promotion={promotion}
          onSelect={() => onSelectPromotion(promotion)}
          formatNumber={formatNumber}
          onPromotionUpdated={onPromotionUpdated}
          onPromotionDeleted={onPromotionDeleted}
        />
      ))}
    </div>
  );
}
