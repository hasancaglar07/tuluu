"use client";

import { m } from "framer-motion";
import { Heart } from "lucide-react";
import { FormattedMessage } from "react-intl";

/**
 * CurrentHeartsDisplay Component
 *
 * Displays the user's current heart count with animated hearts.
 *
 * @param {Object} props - Component props
 * @param {number} props.currentHearts - User's current heart count
 * @param {number} props.maxHearts - Maximum hearts allowed (default: 5)
 */
export function CurrentHeartsDisplay({
  currentHearts,
  maxHearts = 5,
}: {
  currentHearts: number;
  maxHearts?: number;
}) {
  return (
    <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-white">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
          <FormattedMessage
            id="shop.hearts.current.title"
            defaultMessage="Your Hearts"
          />
        </h2>

        <div className="flex items-center gap-2 text-xl font-bold">
          <Heart className="h-6 w-6 text-red-500" fill="currentColor" />
          <span>{currentHearts}</span>
          <span className="text-sm text-gray-500 font-normal">
            <FormattedMessage
              id="shop.hearts.max"
              defaultMessage="/ {max}"
              values={{ max: maxHearts }}
            />
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="flex">
          {[...Array(currentHearts)].map((_, i) => (
            <div key={i} className="text-4xl -ml-2 first:ml-0">
              {i < currentHearts ? (
                <m.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatDelay: i * 0.5,
                  }}
                >
                  ❤️
                </m.div>
              ) : (
                <span className="text-gray-300">0❤️</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
