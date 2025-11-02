"use client";

import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, DollarSign, RefreshCw, Users } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import type { PaymentStats } from "@/types/payments";

/**
 * Statistics cards component for payments dashboard
 * Displays key payment metrics fetched from Stripe API
 */
export function PaymentsStatsCards() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get("/api/admin/payments/stats");
        setStats(response.data.data);
      } catch (error) {
        console.error("Error fetching payment stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <FormattedMessage
              id="admin.payments.stats.error"
              defaultMessage="Error loading statistics"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const formatChange = (change: number) => {
    const sign = change > 0 ? "+" : "";
    return `${sign}${change}%`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            <FormattedMessage
              id="admin.payments.stats.totalRevenue"
              defaultMessage="Total Revenue"
            />
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalRevenue.toLocaleString()}
          </div>
          <p className={`text-xs ${getChangeColor(stats.revenueChange)}`}>
            <FormattedMessage
              id="admin.payments.stats.revenueChange"
              defaultMessage="{change} from last month"
              values={{ change: formatChange(stats.revenueChange) }}
            />
          </p>
        </CardContent>
      </Card>

      {/* Active Subscriptions Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            <FormattedMessage
              id="admin.payments.stats.activeSubscriptions"
              defaultMessage="Active Subscriptions"
            />
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activeSubscriptions.toLocaleString()}
          </div>
          <p className={`text-xs ${getChangeColor(stats.subscriptionsChange)}`}>
            <FormattedMessage
              id="admin.payments.stats.subscriptionsChange"
              defaultMessage="{change} from last month"
              values={{ change: formatChange(stats.subscriptionsChange) }}
            />
          </p>
        </CardContent>
      </Card>

      {/* Failed Payments Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            <FormattedMessage
              id="admin.payments.stats.failedPayments"
              defaultMessage="Failed Payments"
            />
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.failedPayments}</div>
          <p
            className={`text-xs ${getChangeColor(stats.failedPaymentsChange)}`}
          >
            <FormattedMessage
              id="admin.payments.stats.failedPaymentsChange"
              defaultMessage="{change} from last month"
              values={{ change: formatChange(stats.failedPaymentsChange) }}
            />
          </p>
        </CardContent>
      </Card>

      {/* Refund Rate Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            <FormattedMessage
              id="admin.payments.stats.refundRate"
              defaultMessage="Refund Rate"
            />
          </CardTitle>
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.refundRate}%</div>
          <p className={`text-xs ${getChangeColor(stats.refundRateChange)}`}>
            <FormattedMessage
              id="admin.payments.stats.refundRateChange"
              defaultMessage="{change} from last month"
              values={{ change: formatChange(stats.refundRateChange) }}
            />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
