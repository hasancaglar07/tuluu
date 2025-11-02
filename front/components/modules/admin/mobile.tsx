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

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

// Navigation items
const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <Home className="h-5 w-5" />,
    exact: true,
  },
  {
    title: "Utilisateurs",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
    subItems: [
      { title: "Liste des utilisateurs", href: "/admin/users" },
      { title: "Ajouter un utilisateur", href: "/admin/users/create" },
      { title: "Rôles et permissions", href: "/admin/users/roles" },
    ],
  },
  {
    title: "Leçons",
    href: "/admin/lessons",
    icon: <BookOpen className="h-5 w-5" />,
    subItems: [
      { title: "Liste des leçons", href: "/admin/lessons" },
      { title: "Ajouter une leçon", href: "/admin/lessons/create" },
      { title: "Chapitres", href: "/admin/lessons/chapters" },
      { title: "Unités", href: "/admin/lessons/units" },
    ],
  },
  {
    title: "Quêtes",
    href: "/admin/quests",
    icon: <Star className="h-5 w-5" />,
    subItems: [
      { title: "Liste des quêtes", href: "/admin/quests" },
      { title: "Ajouter une quête", href: "/admin/quests/create" },
    ],
  },
  {
    title: "Paiements",
    href: "/admin/payments",
    icon: <CreditCard className="h-5 w-5" />,
    subItems: [
      { title: "Transactions", href: "/admin/payments" },
      { title: "Abonnements", href: "/admin/payments/subscriptions" },
      { title: "Paramètres", href: "/admin/payments/settings" },
    ],
  },
  {
    title: "Paramètres",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];
export default function Mobile() {
  const pathname = usePathname();
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
                  <span>Paramètres</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
