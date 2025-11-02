import { Button } from "@/components/ui/button";
import { FormattedMessage } from "react-intl";

interface ErrorStateProps {
  onRetry: () => void;
}

// ❌ Displays error message with retry button
export default function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-red-500 text-lg font-medium">
          <FormattedMessage
            defaultMessage="Error loading plans"
            id="subscriptions.errorLoading"
          />
        </div>
        <p className="text-gray-600 mt-2">
          <FormattedMessage
            defaultMessage="Failed to fetch subscription plans."
            id="subscriptions.fetchError"
          />
        </p>
        <Button onClick={onRetry} className="mt-4">
          <FormattedMessage
            defaultMessage="Try Again"
            id="subscriptions.tryAgain"
          />
        </Button>
      </div>
    </div>
  );
}
