"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { apiClient } from "@/lib/api-client";

const ADMIN_PREFETCH_ROUTES = [
  "/admin/lessons",
  "/admin/users",
  "/admin/quests",
  "/admin/shop",
  "/admin/payments",
];

export default function AdminPrefetcher() {
  const router = useLocalizedRouter();
  const pathname = usePathname();
  const { getToken } = useAuth();
  const hasPrefetchedRoutes = useRef(false);
  const hasWarmedDashboardApis = useRef(false);

  useEffect(() => {
    if (hasPrefetchedRoutes.current) {
      return;
    }
    hasPrefetchedRoutes.current = true;

    for (const route of ADMIN_PREFETCH_ROUTES) {
      router.prefetch(route);
    }
  }, [router]);

  useEffect(() => {
    const onDashboard =
      pathname === "/admin" ||
      pathname.endsWith("/admin") ||
      pathname.includes("/admin?");
    if (!onDashboard || hasWarmedDashboardApis.current) {
      return;
    }

    hasWarmedDashboardApis.current = true;
    let cancelled = false;

    const warmDashboardApis = async () => {
      const token = await getToken();
      if (!token || cancelled) {
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await Promise.allSettled([
        apiClient.get("/api/admin/dashboard/users", { headers }),
        apiClient.get("/api/admin/dashboard/lessons", { headers }),
        apiClient.get("/api/admin/dashboard/quests", { headers }),
        apiClient.get("/api/admin/dashboard/revenue", { headers }),
        apiClient.get("/api/admin/dashboard/activity", { headers }),
      ]);
    };

    void warmDashboardApis();

    return () => {
      cancelled = true;
    };
  }, [getToken, pathname]);

  return null;
}
