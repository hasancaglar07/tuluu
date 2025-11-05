"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { IRootState } from "@/store";
import { Hourglass, Gift, Heart, ShieldCheck, Share2, Feather, Scale, Sun } from "lucide-react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";

const ICON_MAP: Record<string, typeof Hourglass> = {
  patience: Hourglass,
  gratitude: Gift,
  kindness: Heart,
  honesty: ShieldCheck,
  sharing: Share2,
  mercy: Feather,
  justice: Scale,
  respect: Sun,
};

const toTitleCase = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function ValuePointsPanel() {
  const valuePoints = useSelector(
    (state: IRootState) => state.progress.valuePoints
  );

  const entries = useMemo(
    () => Object.entries(valuePoints ?? {}),
    [valuePoints]
  );

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          <FormattedMessage
            id="valuePoints.title"
            defaultMessage="Character Values"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {entries.map(([key, points]) => {
            const Icon = ICON_MAP[key] ?? SparkleIcon;

            return (
              <div
                key={key}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-3 py-3"
              >
                <Icon className="h-5 w-5 text-primary-500" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <FormattedMessage
                      id={`valuePoints.${key}`}
                      defaultMessage={toTitleCase(key)}
                    />
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {points}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SparkleIcon(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5 text-primary-500", props.className)}
    >
      <path d="M11 3v4m0 10v4m8-8h-4m-10 0H3m15.5-6.5-2.5 2.5m-7 7-2.5 2.5m0-12 2.5 2.5m7 7 2.5 2.5" />
    </svg>
  );
}
