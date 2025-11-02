"use client";

import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";
import { Download, Settings } from "lucide-react";

interface PaymentsHeaderProps {
  onNavigateToInvoices: () => void;
  onNavigateToSettings: () => void;
}

/**
 * Header component for the payments page
 * Contains title, description, and navigation buttons
 */
export function PaymentsHeader({
  onNavigateToInvoices,
  onNavigateToSettings,
}: PaymentsHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold tracking-tight">
        <FormattedMessage
          id="admin.payments.title"
          defaultMessage="Payment Management"
        />
      </h1>
      <p className="text-muted-foreground">
        <FormattedMessage
          id="admin.payments.description"
          defaultMessage="Manage subscription plans, transactions, refunds, and promotional offers"
        />
      </p>

      {/* Navigation buttons for invoices and settings */}
      <div className="flex gap-2 mt-2">
        <Button variant="outline" onClick={onNavigateToInvoices}>
          <Download className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.payments.navigation.viewInvoices"
            defaultMessage="View Invoices"
          />
        </Button>
        <Button variant="outline" onClick={onNavigateToSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <FormattedMessage
            id="admin.payments.navigation.paymentSettings"
            defaultMessage="Payment Settings"
          />
        </Button>
      </div>
    </div>
  );
}
