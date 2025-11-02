"use client";

import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { FormattedMessage } from "react-intl";
import { m } from "framer-motion";
import type { Subscription } from "@/types";

interface UserStatsProps {
  xp: number;
  hearts: number;
  subscription: Subscription;
  handleUpgradeToPremium?: () => void;
}

/**
 * Component to display user stats (XP, hearts, subscription status)
 */
export const UserStats = ({
  xp,
  hearts,
  subscription,
  handleUpgradeToPremium,
}: UserStatsProps) => {
  const hasPremium = subscription.subscription === "premium";

  return (
    <>
      {/* Mobile User Stats */}
      <div className="md:hidden w-full max-w-3xl flex justify-between items-center mt-4 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-primary-100 font-bold">
            🏅<span className="text-yellow-500">{xp}</span>
          </div>
          <div className="flex items-center gap-1 text-red-500 font-bold">
            <Heart className="text-red-500 fill-red-500" size={20} />
            <span>{hearts}</span>
          </div>
        </div>
        <Badge
          variant={hasPremium ? "default" : "outline"}
          className={hasPremium ? "bg-secondary-500 text-black" : ""}
        >
          {hasPremium ? (
            <FormattedMessage
              id="dashboard.stats.premium"
              defaultMessage="PREMIUM"
            />
          ) : (
            <FormattedMessage id="dashboard.stats.free" defaultMessage="FREE" />
          )}
        </Badge>
      </div>

      {/* Desktop Subscription Status */}
      <div className="hidden md:flex w-full max-w-3xl mt-4 mb-2">
        <div className="flex justify-between items-center w-full">
          {!hasPremium && handleUpgradeToPremium && (
            <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge
                variant={hasPremium ? "default" : "outline"}
                className={hasPremium ? "bg-secondary-500 text-black" : ""}
              >
                {hasPremium ? (
                  <FormattedMessage
                    id="dashboard.stats.premium"
                    defaultMessage="PREMIUM"
                  />
                ) : (
                  <FormattedMessage
                    id="dashboard.stats.free"
                    defaultMessage="FREE"
                  />
                )}
              </Badge>
            </m.div>
          )}
        </div>
      </div>
    </>
  );
};
