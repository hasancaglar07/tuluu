import "./globals.css";
import { fredoka } from "./fonts";
import Providers from "@/providers";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${fredoka.variable} min-h-screen antialiased flex flex-col`}
      >
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
