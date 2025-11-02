import FooterAuth from "@/components/modules/footer/auth";
import HeaderAuth from "@/components/modules/header/auth";
import { Metadata } from "next";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderAuth />
      {children}
      <FooterAuth />
    </>
  );
}

export const metadata: Metadata = {
  title: "TULU - Connect page",
  description: "An enjoyable way to learn a new language",
  icons: {
    icon: "/images/logo_icon.png",
  },
};
