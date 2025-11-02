// @ts-nocheck
"use client";

import React from "react";
import { IntlProvider } from "react-intl";
import en from "@/public/locales/messages/en";
import fr from "@/public/locales/messages/fr";
import ar from "@/public/locales/messages/ar";
import hi from "@/public/locales/messages/hi";
import zh from "@/public/locales/messages/zh";
import es from "@/public/locales/messages/es";
import tr from "@/public/locales/messages/tr";

const messages = { en, fr, ar, es, hi, zh, tr };

type IntProviderProps = {
  locale: string;
  children: React.ReactNode;
};

function I18nProvider({ locale, children }: IntProviderProps) {
  return (
    <IntlProvider
      messages={messages[locale]}
      locale={locale}
      defaultLocale="en"
    >
      {children}
    </IntlProvider>
  );
}

export default I18nProvider;
