"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormattedMessage } from "react-intl";
import { ShopItemCard } from "./shop-item-card";

/**
 * Shop item interface
 */
interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "hearts" | "premium" | "boosts" | "gems";
  currency: "gems" | "coins" | "USD";
  discount?: number;
  popular?: boolean;
  gemsAmount?: number;
  featured?: boolean;
  type?: string;
}

/**
 * ShopTabs Component
 *
 * Displays shop items organized by category tabs.
 *
 * @param {Object} props - Component props
 * @param {ShopItem[]} props.items - Array of shop items
 * @param {number} props.userGems - User's current gem balance
 * @param {Function} props.onBuyGems - Function to handle gem purchases
 * @param {Function} props.onUpgradePremium - Function to handle premium upgrades
 * @param {Function} props.onPurchaseItem - Function to handle general item purchases
 */
export function ShopTabs({
  items,
  userGems,
  onBuyGems,
  onUpgradePremium,
  onPurchaseItem,
  isPurchasing,
}: {
  items: ShopItem[];
  userGems: number;
  onBuyGems: (gemsAmount: number) => void;
  onUpgradePremium: () => void;
  onPurchaseItem?: (item: ShopItem) => void;
  isPurchasing: boolean;
}) {
  const filterItemsByCategory = (category: string) => {
    if (category === "all") return items;
    return items.filter((item) => item.category === category);
  };

  const renderItemGrid = (filteredItems: ShopItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {filteredItems.map((item, index) => (
        <ShopItemCard
          key={item.id}
          item={item}
          index={index}
          userGems={userGems}
          onBuyGems={onBuyGems}
          onUpgradePremium={onUpgradePremium}
          onPurchaseItem={onPurchaseItem}
          isPurchasing={isPurchasing}
        />
      ))}
    </div>
  );

  return (
    <div className="mb-8">
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            <FormattedMessage id="shop.tabs.all" defaultMessage="All" />
          </TabsTrigger>
          <TabsTrigger value="hearts">
            <FormattedMessage id="shop.tabs.hearts" defaultMessage="Hearts" />
          </TabsTrigger>
          <TabsTrigger value="premium">
            <FormattedMessage id="shop.tabs.premium" defaultMessage="Premium" />
          </TabsTrigger>
          <TabsTrigger value="boosts">
            <FormattedMessage id="shop.tabs.boosts" defaultMessage="Boosts" />
          </TabsTrigger>
          <TabsTrigger value="gems">
            <FormattedMessage id="shop.tabs.gems" defaultMessage="Buy Gems" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {renderItemGrid(filterItemsByCategory("all"))}
        </TabsContent>

        <TabsContent value="hearts">
          {renderItemGrid(filterItemsByCategory("hearts"))}
        </TabsContent>

        <TabsContent value="premium">
          {renderItemGrid(filterItemsByCategory("premium"))}
        </TabsContent>

        <TabsContent value="boosts">
          {renderItemGrid(filterItemsByCategory("boosts"))}
        </TabsContent>

        <TabsContent value="gems">
          {renderItemGrid(filterItemsByCategory("gems"))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
