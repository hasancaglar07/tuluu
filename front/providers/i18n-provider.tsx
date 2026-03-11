// @ts-nocheck
"use client";

import React from "react";
import { IntlProvider } from "react-intl";
import tr from "@/public/locales/messages/tr";
import { i18n } from "@/i18n-config";

const messages = { tr };

type IntProviderProps = {
  locale: string;
  children: React.ReactNode;
};

function I18nProvider({ locale, children }: IntProviderProps) {
  const normalizedLocale =
    typeof locale === "string" ? locale.split("-")[0] : i18n.defaultLocale;
  const availableLocales = Object.keys(messages) as Array<keyof typeof messages>;
  const resolvedLocale = availableLocales.includes(
    normalizedLocale as keyof typeof messages
  )
    ? (normalizedLocale as keyof typeof messages)
    : (i18n.defaultLocale as keyof typeof messages);

  return (
    <IntlProvider
      messages={messages[resolvedLocale] ?? messages[i18n.defaultLocale]}
      locale={resolvedLocale}
      defaultLocale="tr"
      onError={(err) => {
        if (err.code === "MISSING_TRANSLATION") {
          console.warn("Missing translation", err.message);
          return;
        }
        throw err;
      }}
    >
      {children}
    </IntlProvider>
  );
}

export default I18nProvider;
