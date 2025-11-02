"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormattedMessage } from "react-intl";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

/**
 * AnalyticsCard - A single analytics card component
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - The title of the analytics card
 * @param {string|number} props.value - The main value to display
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {string} [props.className] - Optional CSS class for the value
 */
export function AnalyticsCard({
  title,
  value,
  subtitle,
  className = "",
}: AnalyticsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          <FormattedMessage
            id={`shop.analytics.${title.toLowerCase().replace(/\s+/g, "-")}`}
            defaultMessage={title}
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className}`}>{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            <FormattedMessage
              id={`shop.analytics.${title
                .toLowerCase()
                .replace(/\s+/g, "-")}.subtitle`}
              defaultMessage={subtitle}
            />
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * AnalyticsCardSkeleton - A loading skeleton for analytics cards
 *
 * @component
 */
export function AnalyticsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
      </CardContent>
    </Card>
  );
}

/**
 * AnalyticsCardsGrid - A grid layout for multiple analytics cards
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The cards to display in the grid
 */
export function AnalyticsCardsGrid({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
