"use client";

import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import type { PaymentTransaction } from "@/types/payments";

/**
 * Payment transactions table component
 * Displays transaction data fetched from Stripe API
 */
export function PaymentTransactionsTable() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await apiClient.get("/api/admin/payments/transaction");
        setTransactions(response.data.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <FormattedMessage
              id="admin.payments.transactions.title"
              defaultMessage="Recent Transactions"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="admin.payments.transactions.title"
            defaultMessage="Recent Transactions"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="text-left p-3 text-sm font-semibold">
                  <FormattedMessage
                    id="admin.payments.transactions.id"
                    defaultMessage="Transaction ID"
                  />
                </th>
                <th className="text-left p-3 text-sm font-semibold">
                  <FormattedMessage
                    id="admin.payments.transactions.customer"
                    defaultMessage="Customer"
                  />
                </th>
                <th className="text-left p-3 text-sm font-semibold">
                  <FormattedMessage
                    id="admin.payments.transactions.amount"
                    defaultMessage="Amount"
                  />
                </th>
                <th className="text-left p-3 text-sm font-semibold">
                  <FormattedMessage
                    id="admin.payments.transactions.status"
                    defaultMessage="Status"
                  />
                </th>
                <th className="text-left p-3 text-sm font-semibold">
                  <FormattedMessage
                    id="admin.payments.transactions.date"
                    defaultMessage="Date"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-muted">
                  <td className="p-3 text-sm font-mono">
                    {transaction.id.slice(-8)}
                  </td>
                  <td className="p-3 text-sm">
                    <div>
                      <div className="font-medium">
                        {transaction.customer.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {transaction.customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm font-medium">
                    {transaction.amount.toLocaleString("en-US", {
                      style: "currency",
                      currency: transaction.currency,
                    })}
                  </td>
                  <td className="p-3 text-sm">
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
