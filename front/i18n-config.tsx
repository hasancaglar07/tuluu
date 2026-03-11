export const i18n = {
  locales: [
    {
      lang: "tr",
      image: "https://cdn-icons-png.flaticon.com/128/197/197518.png",
    },
  ],
  defaultLocale: "tr",
};

export type I18nConfig = typeof i18n;
export type Locale = I18nConfig["locales"][number];
