// import { getData } from "@/actions/data";
import HeaderLanding from "@/components/modules/header/landing";
import LanguagesToLearn from "@/components/modules/hero/learn";
import type { Metadata } from "next";

export const dynamic = "force-dynamic"; // force Netlify not to cache this serverless function.

export default async function page() {
  return (
    <>
      <HeaderLanding />
      <LanguagesToLearn />
    </>
  );
}
export const metadata: Metadata = {
  title: "What to learn ? - TULU",
  description: "An enjoyable way to learn a new language",
  icons: {
    icon: "/images/logo_icon.png",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};
