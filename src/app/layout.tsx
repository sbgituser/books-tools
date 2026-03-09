import type { Metadata } from "next";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const SITE_NAME = "Books Tools | kuras-plus";
const SITE_URL = "https://books.kuras-plus.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | Books Tools`,
  },
  description:
    "Kindle本を感覚的に探索できるツール集。類似本検索・比較など、Amazonでは体験できない本の探し方を提供します。",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ja_JP",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
