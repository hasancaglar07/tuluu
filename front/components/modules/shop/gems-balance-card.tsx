"use client";

import type React from "react";

import { useState } from "react";
import { m } from "framer-motion";
import { Gem } from "lucide-react";
import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * GemsBalanceCard Component
 *
 * Displays user's current gem balance with option to add gems for demo purposes.
 *
 * @param {Object} props - Component props
 * @param {number} props.userGems - Current user's gem balance
 * @param {Function} props.onAddGems - Function to add gems (for demo)
 */
export function GemsBalanceCard({
  userGems,
  onAddGems,
  hasPremium,
}: {
  userGems: number;
  onAddGems: (amount: number) => void;
  hasPremium: boolean;
}) {
  const [customGems, setCustomGems] = useState<number | "">("");

  const handleCustomGemsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setCustomGems("");
    } else {
      const numValue = Number.parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setCustomGems(numValue);
      }
    }
  };

  const addCustomGems = () => {
    if (typeof customGems === "number" && customGems > 0) {
      onAddGems(customGems);
      setCustomGems("");
    }
  };

  return (
    <>
      {!hasPremium && (
        <m.div
          initial={{ y: 20, opacity: 1 }}
          animate={{ y: [0, -10, 0], opacity: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          className="mt-6 flex flex-col items-center bg-yellow-100 border border-yellow-300 p-4 rounded-lg shadow-md"
        >
          <p className="text-yellow-800 text-sm font-medium mb-2 text-center">
            <FormattedMessage
              id="shop.gems.premiumMessage"
              defaultMessage="✨ Want unlimited gems? Get Premium now!"
            />
          </p>
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => (window.location.href = "/subscriptions")}
          >
            <FormattedMessage
              id="shop.gems.getPremium"
              defaultMessage="Get Premium"
            />
          </Button>
        </m.div>
      )}

      <div className="mb-8 p-6 border border-yellow-100 rounded-xl bg-yellow-50">
        <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
          <Gem className="h-5 w-5 text-yellow-500" />
          <FormattedMessage
            id="shop.gems.balance.title"
            defaultMessage="Your Gems Balance"
          />
        </h2>

        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1">
            <div className="text-3xl font-bold text-yellow-700 mb-2">
              <FormattedMessage
                id="shop.gems.amount"
                defaultMessage="{gems} Gems"
                values={{ gems: userGems.toLocaleString() }}
              />
            </div>
            <p className="text-yellow-700 mb-4">
              <FormattedMessage
                id="shop.gems.description"
                defaultMessage="Use your Gems to buy hearts and other items in the shop."
              />
            </p>

            {/* Demo: Add custom gems */}
            <div className="flex flex-col md:flex-wrap gap-2 mt-4 h-full">
              <Input
                type="text"
                value={customGems}
                onChange={handleCustomGemsChange}
                placeholder="1000"
                className="w-full md:w-40 h-auto"
                max={1000}
                min={1}
                autoFocus
              />
              <Button
                onClick={addCustomGems}
                disabled={customGems === "" || customGems === 0}
              >
                <FormattedMessage
                  id="shop.gems.add"
                  defaultMessage="Add Gems"
                />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="relative">
              <m.div
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5 }}
                className="text-6xl"
              >
                💎
              </m.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
