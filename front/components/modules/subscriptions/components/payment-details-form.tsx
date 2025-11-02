"use client";

import { m } from "framer-motion";
import { AlertCircleIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { CardDetails, PaymentProvider } from "@/types";
import { FormattedMessage } from "react-intl";

// Payment details form component
// Shows different forms based on selected payment provider
interface PaymentDetailsFormProps {
  selectedProvider: string | null;
  providers: PaymentProvider[];
  cardDetails: CardDetails;
  onCardDetailsChange: (details: CardDetails) => void;
}

export function PaymentDetailsForm({
  selectedProvider,
  providers,
  cardDetails,
  onCardDetailsChange,
}: PaymentDetailsFormProps) {
  // Helper function to format card number with spaces (4 digits groups)
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Helper function to format expiry date as MM/YY
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }

    return v;
  };

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <h5 className="mb-4">
        <FormattedMessage
          id="paymentDetails.demoCard"
          defaultMessage="Demo Credit Card"
        />
      </h5>

      {/* Show credit card form for Stripe */}
      {selectedProvider === "stripe" ? (
        <div className="space-y-4">
          {/* Email field */}
          <div>
            <Label htmlFor="cardEmail">
              <FormattedMessage
                id="paymentDetails.email"
                defaultMessage="Email"
              />
            </Label>
            <Input
              id="cardEmail"
              placeholder="youremail@gmail.com"
              value={cardDetails.cardEmail}
              onChange={(e) =>
                onCardDetailsChange({
                  ...cardDetails,
                  cardEmail: e.target.value,
                })
              }
            />
          </div>

          {/* Cardholder name field */}
          <div>
            <Label htmlFor="cardName">
              <FormattedMessage
                id="paymentDetails.cardName"
                defaultMessage="Nom sur la carte"
              />
            </Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={cardDetails.cardName}
              onChange={(e) =>
                onCardDetailsChange({
                  ...cardDetails,
                  cardName: e.target.value,
                })
              }
            />
          </div>

          {/* Card number field with formatting */}
          <div>
            <Label htmlFor="cardNumber">
              <FormattedMessage
                id="paymentDetails.cardNumber"
                defaultMessage="Numéro de carte"
              />
            </Label>
            <Input
              id="cardNumber"
              placeholder="4242 4242 4242 4242"
              value={cardDetails.cardNumber}
              onChange={(e) =>
                onCardDetailsChange({
                  ...cardDetails,
                  cardNumber: formatCardNumber(e.target.value),
                })
              }
              maxLength={19} // 16 digits + 3 spaces
            />
          </div>

          {/* Expiry and CVC fields in a grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">
                <FormattedMessage
                  id="paymentDetails.expiry"
                  defaultMessage="Date d'expiration"
                />
              </Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) =>
                  onCardDetailsChange({
                    ...cardDetails,
                    expiry: formatExpiry(e.target.value),
                  })
                }
                maxLength={5} // MM/YY format
              />
            </div>

            <div>
              <Label htmlFor="cvc">
                <FormattedMessage
                  id="paymentDetails.cvc"
                  defaultMessage="CVC"
                />
              </Label>
              <Input
                id="cvc"
                placeholder="123"
                value={cardDetails.cvc}
                onChange={(e) => {
                  // Only allow numbers for CVC
                  const value = e.target.value.replace(/\D/g, "");
                  onCardDetailsChange({ ...cardDetails, cvc: value });
                }}
                maxLength={3}
              />
            </div>
          </div>

          {/* Demo card notice */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
            <AlertCircleIcon className="text-primary-500" />
            <span>
              <FormattedMessage
                id="paymentDetails.demoNotice"
                defaultMessage="Keep these data in mind, you are going to use it in Stripe Sandbox mode"
              />
            </span>
          </div>
        </div>
      ) : (
        // Show redirect message for other payment providers (PayPal, etc.)
        <div className="text-center p-8">
          <div className="mb-4">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <path
                d="M19.5 8.25H4.5C3.67157 8.25 3 8.92157 3 9.75V18.75C3 19.5784 3.67157 20.25 4.5 20.25H19.5C20.3284 20.25 21 19.5784 21 18.75V9.75C21 8.92157 20.3284 8.25 19.5 8.25Z"
                stroke="#0070ba"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.5 15.75C7.5 15.75 8.25 15 9.75 15C11.25 15 12.75 16.5 14.25 16.5C15.75 16.5 16.5 15.75 16.5 15.75"
                stroke="#0070ba"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.5 8.25V6C16.5 4.34315 15.1569 3 13.5 3H4.5C3.67157 3 3 3.67157 3 4.5V6.75"
                stroke="#0070ba"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">
            <FormattedMessage
              id="paymentDetails.redirectMessage"
              defaultMessage="Vous allez être redirigé vers {provider}"
              values={{
                provider: providers.find((p) => p.id === selectedProvider)
                  ?.name,
              }}
            />
          </p>

          <p className="text-gray-500 mb-4">
            <FormattedMessage
              id="paymentDetails.continueMessage"
              defaultMessage="Cliquez sur 'Continuer' pour finaliser votre paiement"
            />
          </p>
        </div>
      )}
    </m.div>
  );
}
