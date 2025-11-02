"use client";

import { m } from "framer-motion";
import { CreditCard, DollarSign } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { PaymentProvider } from "@/types";
import { FormattedMessage } from "react-intl";

// Payment method selection component
// Displays available payment providers as radio buttons
interface PaymentMethodSelectionProps {
  providers: PaymentProvider[];
  selectedProvider: string | null;
  onSelectProvider: (providerId: string) => void;
}

export function PaymentMethodSelection({
  providers,
  selectedProvider,
  onSelectProvider,
}: PaymentMethodSelectionProps) {
  // Helper function to render the appropriate icon for each provider
  const renderProviderIcon = (provider: PaymentProvider) => {
    switch (provider.id) {
      case "stripe":
        return <CreditCard className="h-6 w-6 text-white" />;
      case "googlepay":
        return <DollarSign className="h-6 w-6 text-white" />;
      case "paypal":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.5 8.25H4.5C3.67157 8.25 3 8.92157 3 9.75V18.75C3 19.5784 3.67157 20.25 4.5 20.25H19.5C20.3284 20.25 21 19.5784 21 18.75V9.75C21 8.92157 20.3284 8.25 19.5 8.25Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7.5 15.75C7.5 15.75 8.25 15 9.75 15C11.25 15 12.75 16.5 14.25 16.5C15.75 16.5 16.5 15.75 16.5 15.75"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.5 8.25V6C16.5 4.34315 15.1569 3 13.5 3H4.5C3.67157 3 3 3.67157 3 4.5V6.75"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return <CreditCard className="h-6 w-6 text-white" />;
    }
  };

  // Helper function to get background color for provider icon
  const getProviderIconBg = (providerId: string) => {
    switch (providerId) {
      case "paypal":
        return "bg-[#0070ba]";
      case "stripe":
        return "bg-[#635bff]";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h2 className="font-bold text-xl mb-4">
        <FormattedMessage
          id="paymentMethod.title"
          defaultMessage="Choose your payment method"
        />
      </h2>

      <RadioGroup
        value={selectedProvider || ""}
        onValueChange={onSelectProvider}
      >
        <div className="space-y-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`flex items-center p-4 border rounded-lg ${
                selectedProvider === provider.id
                  ? "border-primary-500 bg-primary-500/5"
                  : "border-gray-200"
              }`}
            >
              <RadioGroupItem
                value={provider.id}
                id={provider.id}
                className="mr-4"
              />
              <Label
                htmlFor={provider.id}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                {/* Provider icon with colored background */}
                <div
                  className={`p-2 rounded ${getProviderIconBg(provider.id)}`}
                >
                  {renderProviderIcon(provider)}
                </div>
                {/* Provider name and description */}
                <div>
                  <div className="font-bold">{provider.name}</div>
                  <div className="text-sm text-gray-500">
                    {provider.description}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </m.div>
  );
}
