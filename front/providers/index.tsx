import React from "react";
import { Analytics } from "@vercel/analytics/react";
import FramerMotionProvider from "./framer-motion-provider";
import ClerkProvider from "./clerk-provider";
import ToasterProvider from "./ToastProvider";
import I18nProvider from "./i18n-provider";
import StateProvider from "./state-provider";
import TooltipProvider from "./tooltip-provider";

export default function Providers({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  return (
    <StateProvider>
      <ClerkProvider>
        <FramerMotionProvider>
          <TooltipProvider>
            {/* <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            > */}
            <I18nProvider locale={locale}>
              {children}
              {process.env.NEXT_PUBLIC_SERVER_URL?.includes("vercel.app") && (
                <Analytics />
              )}
            </I18nProvider>
          </TooltipProvider>
        </FramerMotionProvider>
        <ToasterProvider />
        {/* </ThemeProvider> */}
      </ClerkProvider>
    </StateProvider>
  );
}
