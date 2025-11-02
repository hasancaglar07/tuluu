"use client";
import { FormattedMessage } from "react-intl";

export function DashboardHeader() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        <FormattedMessage
          id="admin.dashboard.title"
          defaultMessage="Dashboard"
        />
      </h1>
      <p className="text-muted-foreground">
        <FormattedMessage
          id="admin.dashboard.subtitle"
          defaultMessage="Welcome to the TULU admin panel."
        />
      </p>
    </div>
  );
}
