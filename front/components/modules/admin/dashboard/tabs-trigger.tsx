"use client";

import { TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { FormattedMessage } from "react-intl";

export default function TabsTriggers() {
  return (
    <TabsTrigger value="overview">
      <FormattedMessage
        id="admin.dashboard.tabs.overview"
        defaultMessage="Overview"
      />
    </TabsTrigger>
  );
}
