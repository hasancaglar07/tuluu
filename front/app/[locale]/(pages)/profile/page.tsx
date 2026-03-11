import ProfileEdit from "@/components/modules/profile/edit";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = 84600;

export default function page() {
  return <ProfileEdit />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: "Profil - TULU",
    description: "Profil bilgilerinizi ve uygulama ayarlarınızı yönetin.",
    icons: {
      icon: "/images/logo_icon.png",
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}
