"use client";

import { FormattedMessage } from "react-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevenueChart } from "../revenue-chart";

/**
 * Revenue overview card component
 * Contains the revenue chart with proper internationalization
 */
export function RevenueOverviewCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <FormattedMessage
            id="admin.payments.revenue.title"
            defaultMessage="Revenue Overview"
          />
        </CardTitle>
        <CardDescription>
          <FormattedMessage
            id="admin.payments.revenue.description"
            defaultMessage="Monthly revenue breakdown by subscription type"
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RevenueChart />
      </CardContent>
    </Card>
  );
}
