"use client";

import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FormattedMessage } from "react-intl";
import { apiClient } from "@/lib/api-client";
import type { RevenueChartData } from "@/types/payments";

/**
 * Revenue chart component that displays monthly revenue data from Stripe
 * Fetches real data from the Stripe API via our backend endpoint
 */
export function RevenueChart() {
  const [data, setData] = useState<RevenueChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch real Stripe revenue data from our API
        const response = await apiClient.get(
          "/api/admin/payments/revenue-chart"
        );

        if (response.data.success) {
          setData(response.data.data);
        } else {
          throw new Error(
            response.data.error || "Failed to fetch revenue data"
          );
        }
      } catch (error) {
        console.error("Error fetching revenue chart data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch revenue data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          <FormattedMessage
            id="admin.payments.revenue.chart.loading"
            defaultMessage="Loading revenue data..."
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center space-y-2">
        <div className="text-destructive text-sm">
          <FormattedMessage
            id="admin.payments.revenue.chart.error"
            defaultMessage="Failed to load revenue data"
          />
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-muted-foreground hover:text-foreground underline"
        >
          <FormattedMessage
            id="admin.payments.revenue.chart.retry"
            defaultMessage="Try again"
          />
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground text-sm">
          <FormattedMessage
            id="admin.payments.revenue.chart.noData"
            defaultMessage="No revenue data available"
          />
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const value = payload[0].value as number;
              return (
                <div className="rounded-lg border bg-background p-3 shadow-sm">
                  <div className="grid gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        {label}
                      </span>
                      <span className="font-bold text-foreground">
                        <FormattedMessage
                          id="admin.payments.revenue.chart.tooltip"
                          defaultMessage="Revenue: ${revenue}"
                          values={{
                            revenue: new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: "USD",
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(value),
                          }}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          strokeWidth={2}
          activeDot={{
            r: 6,
            style: { fill: "hsl(var(--primary))" },
          }}
          style={{
            stroke: "hsl(var(--primary))",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
