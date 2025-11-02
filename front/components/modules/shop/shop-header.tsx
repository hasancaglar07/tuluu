"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Gem } from "lucide-react";
import { FormattedMessage } from "react-intl";

/**
 * ShopHeader Component
 *
 * Displays the shop page header with navigation and user's gem balance.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onBack - Function to handle back navigation
 * @param {number} props.userGems - Current user's gem balance
 */
export function ShopHeader({
  onBack,
  userGems,
}: {
  onBack: () => void;
  userGems: number;
}) {
  return (
    <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-[#58cc02] text-white">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-white hover:bg-white/20"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">
          <FormattedMessage id="shop.title" defaultMessage="Shop" />
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
          <Gem className="h-4 w-4 text-yellow-400" />
          <span className="font-bold">
            <FormattedMessage
              id="shop.gems.balance"
              defaultMessage="{gems} Gems"
              values={{ gems: userGems.toLocaleString() }}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
