/**
 * /genre — ジャンル一覧ページ
 * L2カテゴリを一覧表示し、各ジャンルの作品一覧へ誘導する。
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { CATEGORY_TREE } from "@/lib/categories";

export const metadata: Metadata = {
  title: `ジャンルから探す | ${SITE_NAME}`,
  description:
    "ミステリー、少年漫画、純文学、SF、ファンタジーなど、ジャンル別に漫画・小説を探せます。気になるジャンルを選んで、おすすめ作品を発見しましょう。",
  alternates: { canonical: `${SITE_URL}/genre` },
  openGraph: {
    title: `ジャンルから探す | ${SITE_NAME}`,
    description: "ジャンル別に漫画・小説を探す。",
    url: `${SITE_URL}/genre`,
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

interface GenreInfo {
  l1Id: string;
  l1Label: string;
  l1Emoji: string;
  l2Id: string;
  l2Label: string;
  count: number;
}

function getGenreList(): GenreInfo[] {
  // meta.json の pathCounts からL2別の冊数を取得
  const metaPath = join(process.cwd(), "public", "data", "meta.json");
  let pathCounts: Record<string, number> = {};
  try {
    const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
    pathCounts = meta.pathCounts ?? {};
  } catch {
    // fallback
  }

  const genres: GenreInfo[] = [];
  for (const l1 of CATEGORY_TREE) {
    for (const l2 of l1.subcategories ?? []) {
      const key = `${l1.id}:${l2.id}`;
      const count = pathCounts[key] ?? 0;
      genres.push({
        l1Id: l1.id,
        l1Label: l1.label,
        l1Emoji: l1.emoji,
        l2Id: l2.id,
        l2Label: l2.label,
        count,
      });
    }
  }

  // 冊数降順
  genres.sort((a, b) => b.count - a.count);
  return genres;
}

export default function GenreIndexPage() {
  const genres = getGenreList();

  // L1別にグルーピング
  const grouped = new Map<string, { l1Label: string; l1Emoji: string; items: GenreInfo[] }>();
  for (const l1 of CATEGORY_TREE) {
    grouped.set(l1.id, {
      l1Label: l1.label,
      l1Emoji: l1.emoji,
      items: genres.filter((g) => g.l1Id === l1.id),
    });
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ジャンルから探す",
    description: "漫画・小説をジャンル別に探す",
    url: `${SITE_URL}/genre`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "ジャンルから探す", item: `${SITE_URL}/genre` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white py-14 sm:py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-4">
              Genre · Books Discover
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              <span className="text-amber-400">ジャンル</span>から
              <br />
              一冊を見つける。
            </h1>
            <p className="text-stone-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              ミステリー、SF、少年漫画、純文学——
              <br className="hidden sm:block" />
              好きなジャンルから、次の一冊を見つけましょう。
            </p>
          </div>
        </section>

        {/* ジャンルグリッド */}
        <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          {[...grouped.entries()]
            .filter(([, group]) => group.items.some((g) => g.count > 0))
            .map(([l1Id, group]) => (
              <div key={l1Id} className="mb-12 last:mb-0">
                <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800 mb-4">
                  <span aria-hidden="true">{group.l1Emoji}</span>
                  {group.l1Label}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items
                    .filter((g) => g.count > 0)
                    .map((genre) => (
                      <Link
                        key={genre.l2Id}
                        href={`/genre/${genre.l2Id}`}
                        className="group flex items-center justify-between bg-white border border-stone-200 rounded-xl px-5 py-4 hover:border-amber-400 hover:shadow-md transition-all"
                      >
                        <div>
                          <p className="font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                            {genre.l2Label}
                          </p>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {genre.count}作品
                          </p>
                        </div>
                        <span className="text-stone-300 group-hover:text-amber-400 transition-colors shrink-0">
                          →
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            ))}

          <div className="text-center mt-10">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-amber-600 transition-colors"
            >
              ← 気分タグから探す（発見ページへ）
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
