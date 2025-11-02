"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  // Languages,
  // SearchCheck,
  LayoutDashboard,
  ShoppingBag,
  Star,
  Users,
  Dog,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      active: pathname === "/admin",
    },
    {
      label: "Lessons",
      icon: BookOpen,
      href: "/admin/lessons",
      active: pathname.includes("/admin/lessons"),
    },
    {
      label: "Users",
      icon: Users,
      href: "/admin/users",
      active: pathname.includes("/admin/users"),
    },
    {
      label: "Quests",
      icon: Star,
      href: "/admin/quests",
      active: pathname.includes("/admin/quests"),
    },
    {
      label: "Shop",
      icon: ShoppingBag,
      href: "/admin/shop",
      active: pathname.includes("/admin/shop"),
    },
    // {
    //   label: "Translations",
    //   icon: Languages,
    //   href: "/admin/translations",
    //   active: pathname.includes("/admin/translations"),
    // },
    // {
    //   label: "seo",
    //   icon: SearchCheck,
    //   href: "/admin/seo",
    //   active: pathname.includes("/admin/seo"),
    // },
    {
      label: "Payments",
      icon: CreditCard,
      href: "/admin/payments",
      active: pathname.includes("/admin/payments"),
    },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      <div className="p-4 flex items-center justify-between border-b border-slate-700">
        <div
          className={cn("flex items-center", collapsed ? "justify-center" : "")}
        >
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-transparent text-white p-1 rounded ">
                <Dog className="h-10 w-10 text-primary-500" />
              </div>
              <span className="font-bold text-lg">Admin</span>
            </Link>
          )}
          {collapsed && (
            <div className="bg-primary-500 text-white p-1 rounded">
              <Dog className="h-10 w-10" />
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 py-4 overflow-auto">
        <nav className="px-2 space-y-1">
          <TooltipProvider delayDuration={0}>
            {routes.map((route) => (
              <Tooltip key={route.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center py-3 px-3 rounded-md transition-colors",
                      route.active
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    )}
                  >
                    <route.icon
                      className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")}
                    />
                    {!collapsed && <span>{route.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{route.label}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-700">
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-sm font-medium">
              <UserButton />
            </span>
          </div>
          {!collapsed && user?.fullName}
        </div>
      </div>
    </div>
  );
}
