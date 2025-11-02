"use client";

import { Button } from "@/components/ui/button";
import { FormattedMessage } from "react-intl";

// Error component that shows when something goes wrong
// Displays error message and provides a way to go back
interface ErrorDisplayProps {
  error: string;
  onGoBack: () => void;
}

export function ErrorDisplay({ error, onGoBack }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-500 mb-4">
          <svg
            className="h-12 w-12 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">
          <FormattedMessage id="error.title" defaultMessage="Erreur" />
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={onGoBack} variant="outline">
          <FormattedMessage
            id="error.backToSubscriptions"
            defaultMessage="Retour aux abonnements"
          />
        </Button>
      </div>
    </div>
  );
}
