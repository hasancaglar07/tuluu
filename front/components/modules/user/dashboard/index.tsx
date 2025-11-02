"use client";

import MobileHeaderDashboard from "@/components/modules/header/user/mobile";
import LeftSidebarDashboard from "@/components/modules/sidebar/user/dashboard/left";
import RightSidebarDashboard from "@/components/modules/sidebar/user/dashboard/right";
import { Subscription } from "@/types";
import React from "react";
import Course from "../../Course";

export default function UserDashboard({
  subscription,
}: {
  subscription: Subscription;
}) {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <MobileHeaderDashboard />
      <LeftSidebarDashboard />
      <Course subscription={subscription} />
      <RightSidebarDashboard subscription={subscription} />
    </div>
  );
}
