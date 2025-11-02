"use client";

import { FormattedMessage } from "react-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuestSummary } from "@/types";

interface QuestsSummaryCardsProps {
  /** Summary statistics for quests */
  summary: QuestSummary;
}

/**
 * Quests Summary Cards Component
 *
 * Displays key metrics and statistics about quests in card format.
 * Shows total active quests, completion rates, and user engagement metrics.
 *
 * @param {QuestsSummaryCardsProps} props - The component props
 * @returns {JSX.Element} Grid of summary cards with quest statistics
 */
export function QuestsSummaryCards({ summary }: QuestsSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Active Quests Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <FormattedMessage
              id="admin.quests.summary.totalActiveQuests"
              defaultMessage="Total Active Quests"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalActiveQuests}</div>
          <p className="text-xs text-muted-foreground">
            <FormattedMessage
              id="admin.quests.summary.upcomingQuests"
              defaultMessage="{count} upcoming"
              values={{ count: summary.totalUpcomingQuests }}
            />
          </p>
        </CardContent>
      </Card>

      {/* Average Completion Rate Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <FormattedMessage
              id="admin.quests.summary.averageCompletionRate"
              defaultMessage="Average Completion Rate"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {summary.averageCompletionRate}%
          </div>
          <p className="text-xs text-muted-foreground">
            <FormattedMessage
              id="admin.quests.summary.acrossAllQuests"
              defaultMessage="Across all quests"
            />
          </p>
        </CardContent>
      </Card>

      {/* Total Users Engaged Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            <FormattedMessage
              id="admin.quests.summary.totalUsersEngaged"
              defaultMessage="Total Users Engaged"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalUsersEngaged}</div>
          <p className="text-xs text-muted-foreground">
            <FormattedMessage
              id="admin.quests.summary.completedQuests"
              defaultMessage="{count} completed quests"
              values={{ count: summary.totalCompletedQuests }}
            />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
