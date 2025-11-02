"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormattedMessage } from "react-intl";

/**
 * QuestHeader Component
 *
 * Displays the header of the quests page with navigation.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onBack - Function to handle back navigation
 */
export function QuestHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-primary-500 text-white">
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
          <FormattedMessage id="quests.header.title" defaultMessage="Quests" />
        </h1>
      </div>
    </div>
  );
}
