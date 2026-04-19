import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `本を検索する | ${SITE_NAME}`,
  description:
    "書名・著者・キーワード・ISBNから漫画・小説を検索。カテゴリ・出版年・読書時間でフィルタリングして、あなたにぴったりの一冊を見つけましょう。",
  alternates: { canonical: `${SITE_URL}/search` },
  openGraph: {
    title: `本を検索する | ${SITE_NAME}`,
    description:
      "書名・著者・キーワード・ISBNから漫画・小説を検索。",
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ホーム", item: `${SITE_URL}/` },
    { "@type": "ListItem", position: 2, name: "本を検索する", item: `${SITE_URL}/search` },
  ],
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {children}
    </>
  );
}
