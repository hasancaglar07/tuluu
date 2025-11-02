"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  BookOpen,
  Star,
  CreditCard,
  Home,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Aside() {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: <Home className="h-5 w-5" />,
      exact: true,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
      subItems: [
        { title: "User List", href: "/admin/users" },
        { title: "Add User", href: "/admin/users/create" },
        { title: "Roles & Permissions", href: "/admin/users/roles" },
      ],
    },
    {
      title: "Lessons",
      href: "/admin/lessons",
      icon: <BookOpen className="h-5 w-5" />,
      subItems: [
        { title: "Lesson List", href: "/admin/lessons" },
        { title: "Add Lesson", href: "/admin/lessons/create" },
        { title: "Chapters", href: "/admin/lessons/chapters" },
        { title: "Units", href: "/admin/lessons/units" },
      ],
    },
    {
      title: "Quests",
      href: "/admin/quests",
      icon: <Star className="h-5 w-5" />,
      subItems: [
        { title: "Quest List", href: "/admin/quests" },
        { title: "Add Quest", href: "/admin/quests/create" },
      ],
    },
    {
      title: "Payments",
      href: "/admin/payments",
      icon: <CreditCard className="h-5 w-5" />,
      subItems: [
        { title: "Transactions", href: "/admin/payments" },
        { title: "Subscriptions", href: "/admin/payments/subscriptions" },
        { title: "Settings", href: "/admin/payments/settings" },
      ],
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  useEffect(() => {
    const newExpanded: Record<string, boolean> = {};

    navItems.forEach((item) => {
      if (item.subItems?.some((sub) => pathname.startsWith(sub.href))) {
        newExpanded[item.title] = true;
      }
    });

    setExpandedItems(newExpanded);
  }, [pathname, navItems]);

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="bg-primary-500 text-white p-1 rounded">
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
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.title} className="space-y-1">
            {item.subItems ? (
              <>
                <button
                  onClick={() => toggleExpand(item.title)}
                  className={cn(
                    "flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-md",
                    isActive(item.href)
                      ? "bg-primary-500/10 text-primary-500"
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
                        className={cn(
                          "block px-4 py-2 text-sm rounded-md",
                          isActive(subItem.href, true)
                            ? "bg-primary-500/10 text-primary-500"
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
                className={cn(
                  "flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md",
                  isActive(item.href, item.exact)
                    ? "bg-primary-500/10 text-primary-500"
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
        <div className="flex items-center justify-between">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
