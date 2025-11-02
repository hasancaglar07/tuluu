"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { FormattedMessage, FormattedNumber } from "react-intl";

interface StatsCardProps {
  title: string;
  titleId: string;
  icon: LucideIcon;
  value: number;
  trend?: "up" | "down" | "neutral";
  percentageChange?: number;
  subtitle?: string;
  subtitleId?: string;
  subtitleValues?: Record<string, unknown>;
}

export function StatsCard({
  title,
  titleId,
  icon: Icon,
  value,
  trend = "neutral",
  percentageChange = 0,
  subtitle,
  subtitleId,
  subtitleValues = {},
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <FormattedMessage id={titleId} defaultMessage={title} />
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          <FormattedNumber value={value} />
        </div>
        {(subtitle || subtitleId) && (
          <p className="text-xs text-muted-foreground flex items-center">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : trend === "down" ? (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            ) : null}
            {subtitleId ? (
              <FormattedMessage
                id={subtitleId}
                defaultMessage={subtitle}
                values={{
                  percentage:
                    percentageChange > 0
                      ? `+${percentageChange}`
                      : percentageChange,
                  ...subtitleValues,
                }}
              />
            ) : (
              subtitle
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
