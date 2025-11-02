"use client";

import { Loader2 } from "lucide-react";
import { FormattedMessage } from "react-intl";

/**
 * Loading State Component
 *
 * Displays a loading spinner and message while quests data is being fetched.
 * Provides consistent loading UI across the quests management interface.
 *
 * @returns {JSX.Element} Loading state with spinner and message
 */
export function LoadingState() {
  return (
    <div className="space-y-6">
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
      </div>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">
          <FormattedMessage
            id="admin.quests.loading"
            defaultMessage="Loading quests..."
          />
        </span>
      </div>
    </div>
  );
}
