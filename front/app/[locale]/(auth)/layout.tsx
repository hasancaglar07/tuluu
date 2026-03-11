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
  title: "TULU - Giriş ve Kayıt",
  description: "TULU ile dil öğrenmeyi eğlenceli ve etkili hale getirin.",
  icons: {
    icon: "/images/logo_icon.png",
  },
};
