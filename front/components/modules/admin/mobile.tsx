"use client";

import Link from "next/link";
import {
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Home,
  Users,
  BookOpen,
  Star,
  CreditCard,
} from "lucide-react";
import { useIntl, FormattedMessage } from "react-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

export default function Mobile() {
  const pathname = usePathname();
  const intl = useIntl();
  
  // Navigation items with i18n
  const navItems = [
    {
      titleKey: "admin.nav.dashboard",
      title: intl.formatMessage({ id: "admin.nav.dashboard", defaultMessage: "Dashboard" }),
      href: "/admin",
      icon: <Home className="h-5 w-5" />,
      exact: true,
    },
    {
      titleKey: "admin.nav.users",
      title: intl.formatMessage({ id: "admin.nav.users", defaultMessage: "Users" }),
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      subItems: [
        { titleKey: "admin.nav.users.list", title: intl.formatMessage({ id: "admin.nav.users.list", defaultMessage: "User List" }), href: "/admin/users" },
        { titleKey: "admin.nav.users.add", title: intl.formatMessage({ id: "admin.nav.users.add", defaultMessage: "Add User" }), href: "/admin/users/create" },
        { titleKey: "admin.nav.users.roles", title: intl.formatMessage({ id: "admin.nav.users.roles", defaultMessage: "Roles & Permissions" }), href: "/admin/users/roles" },
      ],
    },
    {
      titleKey: "admin.nav.lessons",
      title: intl.formatMessage({ id: "admin.nav.lessons", defaultMessage: "Lessons" }),
      href: "/admin/lessons",
      icon: <BookOpen className="h-5 w-5" />,
      subItems: [
        { titleKey: "admin.nav.lessons.list", title: intl.formatMessage({ id: "admin.nav.lessons.list", defaultMessage: "Lesson List" }), href: "/admin/lessons" },
        { titleKey: "admin.nav.lessons.add", title: intl.formatMessage({ id: "admin.nav.lessons.add", defaultMessage: "Add Lesson" }), href: "/admin/lessons/create" },
        { titleKey: "admin.nav.lessons.chapters", title: intl.formatMessage({ id: "admin.nav.lessons.chapters", defaultMessage: "Chapters" }), href: "/admin/lessons/chapters" },
        { titleKey: "admin.nav.lessons.units", title: intl.formatMessage({ id: "admin.nav.lessons.units", defaultMessage: "Units" }), href: "/admin/lessons/units" },
      ],
    },
    {
      titleKey: "admin.nav.quests",
      title: intl.formatMessage({ id: "admin.nav.quests", defaultMessage: "Quests" }),
      href: "/admin/quests",
      icon: <Star className="h-5 w-5" />,
      subItems: [
        { titleKey: "admin.nav.quests.list", title: intl.formatMessage({ id: "admin.nav.quests.list", defaultMessage: "Quest List" }), href: "/admin/quests" },
        { titleKey: "admin.nav.quests.add", title: intl.formatMessage({ id: "admin.nav.quests.add", defaultMessage: "Add Quest" }), href: "/admin/quests/create" },
      ],
    },
    {
      titleKey: "admin.nav.payments",
      title: intl.formatMessage({ id: "admin.nav.payments", defaultMessage: "Payments" }),
      href: "/admin/payments",
      icon: <CreditCard className="h-5 w-5" />,
      subItems: [
        { titleKey: "admin.nav.payments.transactions", title: intl.formatMessage({ id: "admin.nav.payments.transactions", defaultMessage: "Transactions" }), href: "/admin/payments" },
        { titleKey: "admin.nav.payments.subscriptions", title: intl.formatMessage({ id: "admin.nav.payments.subscriptions", defaultMessage: "Subscriptions" }), href: "/admin/payments/subscriptions" },
        { titleKey: "admin.nav.payments.settings", title: intl.formatMessage({ id: "admin.nav.payments.settings", defaultMessage: "Settings" }), href: "/admin/payments/settings" },
      ],
    },
    {
      titleKey: "admin.nav.settings",
      title: intl.formatMessage({ id: "admin.nav.settings", defaultMessage: "Settings" }),
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  
  // Expandable nav items state
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Toggle expanded state for nav items
  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Check if a nav item is active
  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-[#58cc02] text-white p-1 rounded">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L3 9V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V9L12 2Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xl font-bold">Admin</span>
        </Link>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="bg-[#58cc02] text-white p-1 rounded">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2L3 9V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V9L12 2Z"
                      fill="currentColor"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold">Admin</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <div key={item.title} className="space-y-1">
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.title)}
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-md",
                          isActive(item.href)
                            ? "bg-[#58cc02]/10 text-[#58cc02]"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedItems[item.title] ? "rotate-180" : ""
                          )}
                        />
                      </button>

                      {expandedItems[item.title] && (
                        <div className="pl-10 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                "block px-4 py-2 text-sm rounded-md",
                                isActive(subItem.href, true)
                                  ? "bg-[#58cc02]/10 text-[#58cc02]"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              )}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md",
                        isActive(item.href, item.exact)
                          ? "bg-[#58cc02]/10 text-[#58cc02]"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      )}
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src="/placeholder.svg?height=32&width=32"
                    alt="Admin"
                  />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-gray-500">admin@example.com</p>
                </div>
              </div>
              <div className="mt-4 space-y-1">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>
                    <FormattedMessage id="admin.nav.settings" defaultMessage="Settings" />
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>
                    <FormattedMessage id="admin.nav.logout" defaultMessage="Logout" />
                  </span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
