"use client";

import { FormattedMessage } from "react-intl";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  /** Error message to display */
  error: string;
  /** Callback function to retry the failed operation */
  onRetry: () => void;
}

/**
 * Error State Component
 *
 * Displays an error message and retry button when quest data fails to load.
 * Provides user-friendly error handling with retry functionality.
 *
 * @param {ErrorStateProps} props - The component props
 * @returns {JSX.Element} Error state with message and retry button
 */
export function ErrorState({ error, onRetry }: ErrorStateProps) {
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
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">
          <FormattedMessage
            id="admin.quests.error.message"
            defaultMessage="Error: {error}"
            values={{ error }}
          />
        </p>
        <Button onClick={onRetry}>
          <FormattedMessage
            id="admin.quests.error.retry"
            defaultMessage="Retry"
          />
        </Button>
      </div>
    </div>
  );
}
