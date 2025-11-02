"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Activity } from "lucide-react";
import { FormattedMessage } from "react-intl";
import type { ActivityDataPoint } from "@/types";

interface ActivityChartProps {
  data: ActivityDataPoint[];
}

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="admin.dashboard.activity.title"
            defaultMessage="User Activity"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="admin.dashboard.activity.description"
            defaultMessage="Number of active users per day over the last month"
          />
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80">
        {data.length > 0 ? (
          <ChartContainer
            config={{
              activeUsers: {
                label: "Active Users",
                color: "hsl(var(--color-primary-500))",
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="hsl(var(--color-primary-500))"
                  fill="url(#colorUv)"
                  name="Active Users"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Activity className="h-16 w-16" />
            <span className="ml-2">
              <FormattedMessage
                id="admin.dashboard.activity.loading"
                defaultMessage="Loading data..."
              />
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
