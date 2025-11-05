export const i18n = {
  locales: [
    {
      lang: "en",
      image: "https://cdn-icons-png.flaticon.com/128/9906/9906532.png",
    },
    {
      lang: "fr",
      image: "https://cdn-icons-png.flaticon.com/128/197/197560.png",
    },
    {
      lang: "ar",
      image: "https://cdn-icons-png.flaticon.com/128/197/197569.png",
    },
    {
      lang: "hi",
      image: "https://cdn-icons-png.flaticon.com/128/10597/10597864.png",
    },
    {
      lang: "zh",
      image: "https://cdn-icons-png.flaticon.com/128/5372/5372696.png",
    },
    {
      lang: "es",
      image: "https://cdn-icons-png.flaticon.com/128/10601/10601048.png",
    },
    {
      lang: "tr",
      image: "https://cdn-icons-png.flaticon.com/128/197/197518.png",
    },
  ],
  defaultLocale: "tr",
};

export type I18nConfig = typeof i18n;
export type Locale = I18nConfig["locales"][number];
