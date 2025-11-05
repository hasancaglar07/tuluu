import "@/lib/polyfills/server-storage";
import { Fredoka, Fira_Code } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka-sans",
  subsets: ["latin"],
});

const firacode = Fira_Code({
  variable: "--font-firacode-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fredoka.className} ${firacode.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
