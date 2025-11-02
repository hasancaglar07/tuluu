"use client";

import { Suspense } from "react";
import { FormattedMessage } from "react-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentsHeader } from "./payments-header";
import { PaymentsStatsCards } from "./payment-stats-card";
import { RevenueOverviewCard } from "./revenue-overview-card";
import { PaymentsActionsToolbar } from "./payments-actions-toolbar";
import { PaymentTransactionsTable } from "../payment-translations-table";
import { SubscriptionPlansTable } from "../subscription-plans-table";
import { RefundsTable } from "./refunds-table";

/**
 * Main payments management page component
 * Handles the complete payment dashboard with tabs for different payment-related data
 */
export function PaymentsManagementPage() {
  const handleNavigateToInvoices = () => {
    window.location.href = "/admin/payments/invoice/latest";
  };

  const handleNavigateToSettings = () => {
    window.location.href = "/admin/payments/settings";
  };

  const handleFilter = () => {
    // TODO: Implement filter functionality
    console.log("Filter clicked");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export clicked");
  };

  const handleNew = () => {
    // TODO: Implement new payment functionality
    console.log("New payment clicked");
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page Header with navigation buttons */}
      <PaymentsHeader
        onNavigateToInvoices={handleNavigateToInvoices}
        onNavigateToSettings={handleNavigateToSettings}
      />

      {/* Statistics Cards */}
      <PaymentsStatsCards />

      {/* Revenue Overview Chart */}
      <RevenueOverviewCard />

      {/* Tabbed Content for different payment data */}
      <Tabs defaultValue="transactions">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="transactions">
              <FormattedMessage
                id="admin.payments.tabs.transactions"
                defaultMessage="Transactions"
              />
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              <FormattedMessage
                id="admin.payments.tabs.subscriptions"
                defaultMessage="Subscription Plans"
              />
            </TabsTrigger>
            <TabsTrigger value="refunds">
              <FormattedMessage
                id="admin.payments.tabs.refunds"
                defaultMessage="Refunds"
              />
            </TabsTrigger>
            {/* <TabsTrigger value="promo-codes">
              <FormattedMessage
                id="admin.payments.tabs.promoCodes"
                defaultMessage="Promo Codes"
              />
            </TabsTrigger> */}
          </TabsList>

          {/* Action buttons */}
          <PaymentsActionsToolbar
            onFilter={handleFilter}
            onExport={handleExport}
            onNew={handleNew}
          />
        </div>

        {/* Tab Content */}
        <TabsContent value="transactions" className="mt-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8">
                <FormattedMessage
                  id="admin.payments.loading.transactions"
                  defaultMessage="Loading transactions..."
                />
              </div>
            }
          >
            <PaymentTransactionsTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8">
                <FormattedMessage
                  id="admin.payments.loading.subscriptions"
                  defaultMessage="Loading subscription plans..."
                />
              </div>
            }
          >
            <SubscriptionPlansTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="refunds" className="mt-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8">
                <FormattedMessage
                  id="admin.payments.loading.refunds"
                  defaultMessage="Loading refunds..."
                />
              </div>
            }
          >
            <RefundsTable />
          </Suspense>
        </TabsContent>

        <TabsContent value="promo-codes" className="mt-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-8">
                <FormattedMessage
                  id="admin.payments.loading.promoCodes"
                  defaultMessage="Loading promo codes..."
                />
              </div>
            }
          >
            {/* <PromoCodesTable /> */}
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
