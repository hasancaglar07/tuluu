"use client";

import { m } from "framer-motion";
import Image from "next/image";
import { Heart, Crown, Shield, Gem } from "lucide-react";
import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";

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
 * ShopItemCard Component
 *
 * Displays a single shop item with purchase functionality.
 *
 * @param {Object} props - Component props
 * @param {ShopItem} props.item - Shop item data
 * @param {number} props.index - Item index for animation delay
 * @param {number} props.userGems - User's current gem balance
 * @param {Function} props.onBuyGems - Function to handle gem purchases
 * @param {Function} props.onUpgradePremium - Function to handle premium upgrades
 * @param {Function} props.onPurchaseItem - Function to handle general item purchases
 */
export function ShopItemCard({
  item,
  index,
  userGems,
  onBuyGems,
  onUpgradePremium,
  onPurchaseItem,
  isPurchasing,
}: {
  item: ShopItem;
  index: number;
  userGems: number;
  onBuyGems: (gemsAmount: number) => void;
  onUpgradePremium: () => void;
  onPurchaseItem?: (item: ShopItem) => void;
  isPurchasing: boolean;
}) {
  const canAfford =
    item.category === "gems" ||
    item.currency === "USD" ||
    userGems >= item.price;

  // Get category icon
  const getCategoryIcon = () => {
    switch (item.category) {
      case "hearts":
        return <Heart className="h-4 w-4 text-red-500" fill="currentColor" />;
      case "premium":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "boosts":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "gems":
        return <Gem className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Get category label
  const getCategoryLabel = () => {
    switch (item.category) {
      case "hearts":
        return (
          <FormattedMessage id="shop.category.hearts" defaultMessage="Hearts" />
        );
      case "premium":
        return (
          <FormattedMessage
            id="shop.category.premium"
            defaultMessage="Premium"
          />
        );
      case "boosts":
        return (
          <FormattedMessage id="shop.category.boosts" defaultMessage="Boosts" />
        );
      case "gems":
        return (
          <FormattedMessage id="shop.category.gems" defaultMessage="Buy Gems" />
        );
    }
  };

  // Handle buy button click
  const handleBuy = () => {
    if (item.category === "gems" && item.gemsAmount) {
      onBuyGems(item.gemsAmount);
    } else if (item.category === "premium") {
      onUpgradePremium();
    } else if (onPurchaseItem) {
      onPurchaseItem(item);
    }
  };

  // Get button text
  const getButtonText = () => {
    if (item.category === "gems") {
      return <FormattedMessage id="shop.button.buy" defaultMessage="Buy" />;
    } else if (item.category === "premium") {
      return (
        <FormattedMessage id="shop.button.upgrade" defaultMessage="Upgrade" />
      );
    } else {
      return <FormattedMessage id="shop.button.buy" defaultMessage="Buy" />;
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`border rounded-xl p-4 ${
        canAfford ? "bg-white" : "bg-gray-50"
      }`}
      whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
    >
      <div className="flex gap-4">
        <div className="relative">
          <Image
            src={item.image || "/placeholder.svg"}
            width={80}
            height={80}
            alt={item.name}
            className="rounded-lg"
          />

          {(item.popular || item.featured) && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              <FormattedMessage
                id="shop.badge.popular"
                defaultMessage="Popular"
              />
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold">{item.name}</h3>
            <div className="flex items-center gap-1">
              {getCategoryIcon()}
              <span className="text-xs text-gray-500">
                {getCategoryLabel()}
              </span>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3">{item.description}</p>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              {item.currency === "USD" ? (
                <span className="font-bold">
                  <FormattedMessage
                    id="shop.price.usd"
                    defaultMessage="${price} USD"
                    values={{ price: item.price.toFixed(2) }}
                  />
                </span>
              ) : item.currency === "gems" ? (
                <>
                  <Gem className="h-4 w-4 text-yellow-500" />
                  <span className="font-bold">
                    <FormattedMessage
                      id="shop.price.gems"
                      defaultMessage="{price} Gems"
                      values={{ price: item.price.toLocaleString() }}
                    />
                  </span>
                </>
              ) : (
                <span className="font-bold">
                  {item.price.toLocaleString()} {item.currency}
                </span>
              )}

              {item.discount && (
                <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full ml-1">
                  <FormattedMessage
                    id="shop.discount"
                    defaultMessage="-{discount}%"
                    values={{ discount: item.discount }}
                  />
                </span>
              )}
            </div>

            <Button
              size="sm"
              disabled={
                (!canAfford &&
                  item.category !== "gems" &&
                  item.category !== "premium") ||
                isPurchasing
              }
              className={
                canAfford ||
                item.category === "gems" ||
                item.category === "premium"
                  ? ""
                  : "opacity-50"
              }
              onClick={handleBuy}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
      </div>
    </m.div>
  );
}
