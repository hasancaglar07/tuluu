"use client";

import { useState } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { m } from "framer-motion";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSelector } from "react-redux";
import { IRootState } from "@/store";
import { useAuth } from "@clerk/nextjs";
import { FormattedMessage, useIntl } from "react-intl";

export function SaveProgressAlert() {
  const [dismissed, setDismissed] = useState(false);
  const router = useLocalizedRouter();
  const { userId } = useAuth();
  const intl = useIntl();

  const xp = useSelector((state: IRootState) => state.user.xp);
  const completedLessons = useSelector(
    (state: IRootState) => state.progress.completedLessons
  ).length;

  const shouldHide =
    userId || dismissed || (xp === 0 && completedLessons === 0);
  if (shouldHide) return null;

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border border-yellow-300 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 mb-4 relative"
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        aria-label={intl.formatMessage({
          id: "alert.close",
          defaultMessage: "Close alert",
        })}
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <div className="bg-yellow-500 text-white p-2 rounded-full mt-1">
          <Save size={20} />
        </div>

        <div className="flex-1">
          <h4 className="text-left text-lg font-bold text-yellow-800 mb-1">
            <FormattedMessage
              id="saveProgress.title"
              defaultMessage="Save your progress!"
            />
          </h4>
          <p className="text-sm text-yellow-700 mb-3">
            <FormattedMessage
              id="saveProgress.description"
              defaultMessage="You have {xp} XP and {count, plural, one {# lesson} other {# lessons}} completed. Create an account to avoid losing your progress."
              values={{ xp, count: completedLessons }}
            />
          </p>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-white w-full"
              onClick={() => router.push("/signup")}
            >
              <FormattedMessage
                id="saveProgress.cta"
                defaultMessage="Create an account"
              />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-yellow-500 text-yellow-700 hover:bg-yellow-100 w-full"
              onClick={() => setDismissed(true)}
            >
              <FormattedMessage
                id="saveProgress.later"
                defaultMessage="Later"
              />
            </Button>
          </div>
        </div>
      </div>
    </m.div>
  );
}
