import { Loader2 } from "lucide-react";
import { FormattedMessage } from "react-intl";

// Simple loading component that shows a spinner with message
// Used when we're fetching data or processing payments
interface LoadingSpinnerProps {
  message: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-500" />
        <p className="text-gray-600">
          <FormattedMessage id="loading.message" defaultMessage={message} />
        </p>
      </div>
    </div>
  );
}
