"use client";

import { Plus } from "lucide-react";
import { FormattedMessage } from "react-intl";

import { Button } from "@/components/ui/button";

interface QuestsHeaderProps {
  /** Callback function called when the create quest button is clicked */
  onCreateQuest: () => void;
}

/**
 * Quests Header Component
 *
 * Displays the page title, description, and create quest button.
 * This component provides the main header section for the quests management page.
 *
 * @param {QuestsHeaderProps} props - The component props
 * @returns {JSX.Element} The header section with title and create button
 */
export function QuestsHeader({ onCreateQuest }: QuestsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <FormattedMessage
            id="admin.quests.title"
            defaultMessage="Quests Management"
          />
        </h1>
        <p className="text-muted-foreground">
          <FormattedMessage
            id="admin.quests.description"
            defaultMessage="Create, manage, and monitor quests for your users."
          />
        </p>
      </div>
      <Button
        className="bg-[#58cc02] hover:bg-[#58cc02]/90"
        onClick={onCreateQuest}
      >
        <Plus className="mr-2 h-4 w-4" />
        <FormattedMessage
          id="admin.quests.actions.createQuest"
          defaultMessage="Create Quest"
        />
      </Button>
    </div>
  );
}
