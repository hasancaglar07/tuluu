"use client";

import { LocaleLink } from "@/components/custom/locale-link";
import Logo from "@/components/custom/logo";
import { m } from "framer-motion";
import { Book, Plus, Settings, Shield, ShoppingBag } from "lucide-react";
import React from "react";
import { FormattedMessage } from "react-intl";

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

export default function LeftSidebarDashboard() {
  return (
    <div
      className="hidden md:flex w-[300px] border-r  border-gray-200
     flex-col"
    >
      <div className="pt-4 pb-2 flex justify-center items-center pl-6">
        <Logo hideIcon={false} className="scale-[0.8] -my-8" />
      </div>
      <nav className="flex flex-col gap-1 p-8">
        {menuItems.map(
          ({ label, icon: Icon, href, textColor, isActive }, idx) => (
            <m.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <LocaleLink
                key={idx}
                href={href}
                className={`flex items-center gap-3 p-3 rounded-xl font-bold hover:bg-gray-200 ${
                  isActive
                    ? "bg-primary-200 border border-primary-500 !text-primary-500"
                    : ""
                }`}
                style={{ color: textColor }}
              >
                <div
                  // style={{ backgroundColor: bgColor }}
                  className="p-3 bg-white rounded-lg self-start"
                >
                  {Icon}
                </div>
                <span className="text-base text-gray-500 tracking-wider">
                  <FormattedMessage id={label} />
                </span>
              </LocaleLink>
            </m.div>
          )
        )}
      </nav>

    </div>
  );
}
