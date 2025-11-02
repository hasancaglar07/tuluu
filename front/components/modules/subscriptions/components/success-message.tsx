"use client";

import { m } from "framer-motion";
import { CheckCircle } from "lucide-react";
import type { SubscriptionPlan, PaymentProvider } from "@/types";
import { FormattedMessage } from "react-intl";

// Success message component shown after successful payment
// Displays transaction details and confirmation
interface SuccessMessageProps {
  plan: SubscriptionPlan;
  selectedProvider: string | null;
  providers: PaymentProvider[];
}

export function SuccessMessage({
  plan,
  selectedProvider,
  providers,
}: SuccessMessageProps) {
  // Calculate final price (same logic as other components)
  const finalPrice =
    plan.isOnPromotion && plan.promotionalPrice
      ? plan.promotionalPrice
      : plan.price;

  return (
    <m.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-8 text-center"
    >
      {/* Success icon and message */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          <FormattedMessage
            id="success.title"
            defaultMessage="Paiement réussi !"
          />
        </h2>

        <p className="text-gray-600">
          <FormattedMessage
            id="success.message"
            defaultMessage="Votre abonnement {planName} est maintenant actif."
            values={{ planName: plan.name }}
          />
        </p>
      </div>

      {/* Transaction details */}
      <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 mb-6 text-left">
        <h3 className="font-bold mb-4">
          <FormattedMessage
            id="success.transactionDetails"
            defaultMessage="Détails de la transaction"
          />
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">
              <FormattedMessage
                id="success.transactionId"
                defaultMessage="ID de transaction:"
              />
            </span>
            <span className="font-medium">
              {/* Generate a random transaction ID for demo */}
              {Math.random().toString(36).substring(2, 10).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              <FormattedMessage id="success.date" defaultMessage="Date:" />
            </span>
            <span className="font-medium">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              <FormattedMessage id="success.amount" defaultMessage="Montant:" />
            </span>
            <span className="font-medium">${finalPrice.toFixed(2)} USD</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              <FormattedMessage id="success.method" defaultMessage="Méthode:" />
            </span>
            <span className="font-medium">
              {providers.find((p) => p.id === selectedProvider)?.name}
            </span>
          </div>
        </div>
      </div>
    </m.div>
  );
}
