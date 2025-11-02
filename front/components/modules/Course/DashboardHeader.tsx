"use client";

import { m } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { FormattedMessage } from "react-intl";

interface DashboardHeaderProps {
  unitColor: string;
  chapterOrder?: number;
  unitOrder?: number;
  unitTitle?: string;
}

/**
 * Header component for the dashboard showing current unit/chapter info
 */
export const DashboardHeader = ({
  unitColor,
  chapterOrder,
  unitOrder,
  unitTitle,
}: DashboardHeaderProps) => {
  const router = useLocalizedRouter();
  return (
    <m.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl text-white p-4 rounded-xl sticky top-0 z-10"
      style={{
        backgroundColor: unitColor.replace(/^bg-\[(.+)\]$/, "$1"),
      }}
    >
      <div className="flex items-center gap-2">
        <ArrowLeft
          className="h-6 w-6 hover:cursor-pointer"
          onClick={() => router.push("/learn")}
        />
        <div>
          <div className="text-sm font-medium">
            <FormattedMessage
              id="dashboard.header.chapterUnit"
              defaultMessage="CHAPTER {chapterOrder}, UNIT {unitOrder}"
              values={{ chapterOrder, unitOrder }}
            />
          </div>
          <div className="text-xl font-bold">{unitTitle || ""}</div>
        </div>
        {/* <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <div className="flex items-center gap-2" >
              <File />
              <span className="hidden sm:inline">
                <FormattedMessage id="dashboard.header.guide" />
              </span>
            </div>
          </Button>
        </div> */}
      </div>
    </m.div>
  );
};
