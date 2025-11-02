"use client";

import React, { useState } from "react";
import Container from "@/components/custom/container";
import { LocaleLink } from "@/components/custom/locale-link";
import Logo from "@/components/custom/logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Book, Menu, Plus, Settings, Shield, ShoppingBag } from "lucide-react";
import { FormattedMessage } from "react-intl";

// Menu items array with colors and active state

const menuItems = [
  {
    label: "sidebar.myCourse",
    icon: <Book className="h-6 w-6 text-indigo-500" />,
    href: "/dashboard",
    isActive: true,
    bgColor: "#ffc800",
    textColor: "#1cb0f6",
  },
  {
    label: "sidebar.leaderboard",
    icon: <Shield className="h-6 w-6 text-blue-500" />,
    href: "/leaderboard",
    bgColor: "#ffc800",
    textColor: "#afafaf",
  },
  {
    label: "sidebar.quests",
    icon: <Plus className="h-6 w-6 text-amber-500" />,
    href: "/quests",
    bgColor: "#ffc800",
    textColor: "#afafaf",
  },
  {
    label: "sidebar.shop",
    icon: <ShoppingBag className="h-6 w-6 text-red-500" />,
    href: "/shop",
    bgColor: "#ff4b4b",
    textColor: "#afafaf",
  },
  {
    label: "sidebar.profile",
    icon: <Settings className="h-6 w-6 text-purple-500" />,
    href: "profile",
    bgColor: "#ce82ff",
    textColor: "#afafaf",
  },
];

export default function MobileHeaderDashboard() {
  // State to control if the mobile side menu (sheet) is open
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <section className="md:hidden" aria-label="Mobile dashboard header">
      <Container>
        {/* Header container with logo and menu button */}
        <div className="flex items-center justify-between border-b p-4 border-gray-200">
          {/* Logo */}
          <Logo aria-label="App logo" />

          {/* Mobile menu sheet */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            {/* Trigger button for opening the sheet */}
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            {/* Side sheet content */}
            <SheetContent
              side="left"
              className="w-[320px] p-0 [&_#closeButton]:hidden"
              aria-label="Navigation menu panel"
            >
              {/* Hidden title for screen readers */}
              <VisuallyHidden>
                <DialogTitle>Navigation Menu</DialogTitle>
              </VisuallyHidden>

              {/* Logo at the top of menu */}
              <div className="p-4 border-b border-gray-200">
                <Logo aria-label="App logo" />
              </div>

              {/* Navigation links */}
              <nav className="flex flex-col gap-1 p-2" role="navigation">
                {menuItems.map(
                  ({ label, icon: Icon, href, textColor, isActive }, idx) => (
                    <LocaleLink
                      key={idx}
                      href={href}
                      className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-colors duration-200 ${
                        isActive
                          ? "bg-primary-500 text-white"
                          : "hover:bg-gray-100"
                      }`}
                      style={{ color: textColor }}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsMobileMenuOpen(false)} // close menu on navigation
                    >
                      <div
                        // style={{ backgroundColor: bgColor }}
                        className="p-3 bg-white rounded-lg self-start"
                      >
                        {Icon}
                      </div>
                      <span className="text-xl text-gray-700">
                        {" "}
                        <FormattedMessage id={label} />
                      </span>
                    </LocaleLink>
                  )
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </section>
  );
}
