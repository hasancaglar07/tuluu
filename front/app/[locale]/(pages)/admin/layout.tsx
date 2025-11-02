"use client";

import type React from "react";

import { useState } from "react";
import { Inter } from "next/font/google";
import  Sidebar  from "@/components/modules/admin/sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={`${inter.className} h-screen flex`}>
      <div
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 h-full`}
      >
        <Sidebar
          collapsed={!isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>
      <div className="flex-1 overflow-auto bg-gray-100">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
