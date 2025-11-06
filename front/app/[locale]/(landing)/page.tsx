import Hero from "@/components/custom/hero";
import FooterLanding from "@/components/modules/footer/landing";
import HeaderLanding from "@/components/modules/header/landing";
import type { Metadata } from "next";

// Next.js ISR caching strategy
export const revalidate = 86400; // 60 * 60 * 24 = 1 day in seconds
export default function page() {
  return (
    <>
      <HeaderLanding className="hidden md:flex" />
      <Hero className="pt-20 md:pt-0" />
      <FooterLanding />
    </>
  );
}
export const metadata: Metadata = {
  title: "TULU - Zihinleri Bilgiyle, Kalpleri Değerlerle İnşa Eder",
  description: "TULU: Sabır, şükür ve sevgiyle büyüten yeni nesil öğrenme evreni. Çocuklarınız için eğlenceli ve değer odaklı eğitim platformu.",
  icons: {
    icon: "/images/logo_icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
