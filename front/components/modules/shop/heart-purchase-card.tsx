"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { Heart, Plus, Minus, Gem } from "lucide-react";
import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";

/**
 * HeartPurchaseCard Component
 *
 * Allows users to purchase hearts using gems.
 *
 * @param {Object} props - Component props
 * @param {number} props.userGems - Current user's gem balance
 * @param {number} props.heartCostInGems - Cost per heart in gems
 * @param {Function} props.onPurchase - Function to handle heart purchase
 */
export function HeartPurchaseCard({
  userGems,
  heartCostInGems,
  onPurchase,
  isPurchasing,
}: {
  userGems: number;
  heartCostInGems: number;
  onPurchase: (quantity: number, totalCost: number) => void;
  isPurchasing: boolean;
}) {
  const [heartQuantity, setHeartQuantity] = useState(1);

  const totalCost = heartCostInGems * heartQuantity;
  const canAfford = userGems >= totalCost;

  const incrementHearts = () => {
    if (heartQuantity < 5) {
      setHeartQuantity(heartQuantity + 1);
    }
  };

  const decrementHearts = () => {
    if (heartQuantity > 1) {
      setHeartQuantity(heartQuantity - 1);
    }
  };

  const handlePurchase = () => {
    if (canAfford) {
      onPurchase(heartQuantity, totalCost);
      setHeartQuantity(1);
    }
  };

  return (
    <div className="mb-8 p-6 border border-red-100 rounded-xl bg-red-50">
      <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
        <FormattedMessage
          id="shop.hearts.purchase.title"
          defaultMessage="Buy Hearts"
        />
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <p className="text-gray-700 mb-4">
            <FormattedMessage
              id="shop.hearts.description"
              defaultMessage="Hearts allow you to continue learning even after making mistakes. Each heart costs {cost} Gems."
              values={{ cost: heartCostInGems }}
            />
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementHearts}
                disabled={heartQuantity <= 1}
                className="rounded-r-none h-12"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="h-12 w-12 flex items-center justify-center border-y border-input">
                <span className="font-bold">{heartQuantity}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={incrementHearts}
                disabled={heartQuantity >= 5}
                className="rounded-l-none h-12"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
              <span className="font-bold">×{heartQuantity}</span>
            </div>

            <div className="flex items-center gap-1">
              <Gem className="h-5 w-5 text-yellow-500" />
              <span className="font-bold">
                <FormattedMessage
                  id="shop.hearts.cost"
                  defaultMessage="{cost} Gems"
                  values={{ cost: totalCost.toLocaleString() }}
                />
              </span>
            </div>
          </div>

          <Button
            onClick={handlePurchase}
            disabled={!canAfford || isPurchasing}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            {canAfford ? (
              <FormattedMessage id="shop.buy.now" defaultMessage="Buy Now" />
            ) : (
              <FormattedMessage
                id="shop.insufficient.gems"
                defaultMessage="Insufficient Gems"
              />
            )}
          </Button>

          {!canAfford && (
            <p className="text-sm text-red-500 mt-2">
              <FormattedMessage
                id="shop.gems.needed"
                defaultMessage="You need {amount} more Gems for this purchase."
                values={{ amount: (totalCost - userGems).toLocaleString() }}
              />
            </p>
          )}
        </div>

        <div className="flex items-center justify-center">
          <div className="relative">
            <div className="flex">
              {[...Array(heartQuantity)].map((_, i) => (
                <m.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-4xl -ml-2 first:ml-0"
                >
                  ❤️
                </m.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
