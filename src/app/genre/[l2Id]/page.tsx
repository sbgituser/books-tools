/**
 * /genre/[l2Id] — ジャンル別作品一覧ページ
 * L2カテゴリに属する作品をグリッド表示する。
 */

import { readFileSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GenreWorksClient from "@/components/works/GenreWorksClient";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { CATEGORY_TREE } from "@/lib/categories";
import type { WorkListItem } from "@/types/work";

// ── L2定義の取得 ─────────────────────────────────────────────

interface L2Def {
  l1Id: string;
  l1Label: string;
  l1Emoji: string;
  l2Id: string;
  l2Label: string;
}

function getAllL2Defs(): L2Def[] {
  const defs: L2Def[] = [];
  for (const l1 of CATEGORY_TREE) {
    for (const l2 of l1.subcategories ?? []) {
      defs.push({
        l1Id: l1.id,
        l1Label: l1.label,
        l1Emoji: l1.emoji,
        l2Id: l2.id,
        l2Label: l2.label,
      });
    }
  }
  return defs;
}

// ── データ読み込み ────────────────────────────────────────────

function getWorksByL2(l1Id: string, l2Id: string): WorkListItem[] {
  // works-list.json を読み、L2に属する作品を抽出
  // works-list.json にはl2情報がないため、books-{l1Id}.json から取得
  try {
    const booksPath = join(process.cwd(), "public", "data", `books-${l1Id}.json`);
    const books: Array<{ id: string; l2Id?: string; title: string; authors: string[]; thumbnailUrl?: string; keywords: string[] }> = JSON.parse(
      readFileSync(booksPath, "utf-8")
    );

    const matchingIds = new Set(
      books.filter((b) => b.l2Id === l2Id).map((b) => b.id)
    );

    if (matchingIds.size === 0) return [];

    // works-list.json のWorkListItem形式で返す
    const worksListPath = join(process.cwd(), "public", "data", "works-list.json");
    const allWorks: WorkListItem[] = JSON.parse(readFileSync(worksListPath, "utf-8"));

    // WorkListItemのworkIdはfileId（djb2ハッシュ）なので、work-id-mapから逆引き
    // もしくは books-{l1}.json の情報から直接WorkListItem相当を構築
    // → works-list.json 全件から type === l1Id に該当するものを絞り込み
    const typeFilter = l1Id === "manga" ? "manga" : "novel";
    const l1Works = allWorks.filter((w) => w.type === typeFilter);

    // タイトル＋著者で突合（ベストエフォート）
    const bookTitles = new Map<string, boolean>();
    for (const b of books) {
      if (b.l2Id === l2Id) {
        bookTitles.set(b.title.replace(/\s+/g, ""), true);
      }
    }

    return l1Works.filter((w) => {
      const normTitle = w.title.replace(/\s+/g, "");
      return bookTitles.has(normTitle);
    });
  } catch {
    return [];
  }
}

// ── 静的生成 ─────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllL2Defs().map((d) => ({ l2Id: d.l2Id }));
}

// ── メタデータ ────────────────────────────────────────────────

const L2_SEO: Record<string, { title: string; desc: string }> = {
  mystery: { title: "ミステリー小説 おすすめ", desc: "ミステリー・推理小説のおすすめ作品一覧。本格ミステリーからサスペンスまで、謎解きが好きな方に。" },
  sf: { title: "SF小説 おすすめ", desc: "SF・サイエンスフィクション小説のおすすめ。宇宙・ディストピア・近未来の名作を紹介。" },
  fantasy: { title: "ファンタジー小説 おすすめ", desc: "ファンタジー小説のおすすめ作品。異世界・魔法・冒険ファンタジーを集めました。" },
  romance: { title: "恋愛小説 おすすめ", desc: "恋愛小説のおすすめ。純愛・大人の恋愛・切ない恋愛小説を厳選紹介。" },
  youth: { title: "青春小説 おすすめ", desc: "青春小説のおすすめ。学園・友情・成長物語。瑞々しい読書体験を。" },
  literary: { title: "純文学 おすすめ", desc: "純文学のおすすめ作品。芥川賞・直木賞受賞作から名作まで。深い読書体験を。" },
  "historical-novel": { title: "歴史小説 おすすめ", desc: "歴史小説・時代小説のおすすめ。戦国・幕末・江戸を舞台にした名作を紹介。" },
  horror: { title: "ホラー小説 おすすめ", desc: "ホラー小説のおすすめ。怪談・心理ホラー・和風ホラーの名作を集めました。" },
  entertainment: { title: "エンタメ小説 おすすめ", desc: "エンタメ小説のおすすめ。読みやすいベストセラーから映像化作品まで。" },
  shonen: { title: "少年漫画 おすすめ", desc: "少年漫画のおすすめ作品。バトル・冒険・スポーツの人気作を一覧で紹介。" },
  shojo: { title: "少女漫画 おすすめ", desc: "少女漫画のおすすめ。恋愛・友情・ファンタジーの名作を紹介。" },
  seinen: { title: "青年漫画 おすすめ", desc: "青年漫画のおすすめ。大人向けの深い物語やリアルな人間ドラマを厳選。" },
  general: { title: "一般漫画 おすすめ", desc: "ジャンルを問わない漫画のおすすめ。話題作から隠れた名作まで。" },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ l2Id: string }>;
}): Promise<Metadata> {
  const { l2Id } = await params;
  const def = getAllL2Defs().find((d) => d.l2Id === l2Id);
  if (!def) return {};

  const seo = L2_SEO[l2Id] ?? {
    title: `${def.l2Label} おすすめ`,
    desc: `${def.l2Label}のおすすめ漫画・小説を一覧で紹介。`,
  };

  return {
    title: `${seo.title} | ${SITE_NAME}`,
    description: seo.desc,
    alternates: { canonical: `${SITE_URL}/genre/${l2Id}` },
    openGraph: {
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.desc,
      url: `${SITE_URL}/genre/${l2Id}`,
    },
  };
}

// ── ページ ────────────────────────────────────────────────────

export default async function GenreDetailPage({
  params,
}: {
  params: Promise<{ l2Id: string }>;
}) {
  const { l2Id } = await params;
  const allDefs = getAllL2Defs();
  const def = allDefs.find((d) => d.l2Id === l2Id);
  if (!def) notFound();

  const works = getWorksByL2(def.l1Id, l2Id);
  const otherGenres = allDefs
    .filter((d) => d.l1Id === def.l1Id && d.l2Id !== l2Id);

  const seo = L2_SEO[l2Id];

  const genreUrl = `${SITE_URL}/genre/${l2Id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${def.l2Label} おすすめ作品`,
    description: seo?.desc ?? `${def.l2Label}の作品一覧`,
    url: genreUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: works.length,
      itemListElement: works.slice(0, 10).map((w, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: w.title,
        url: `${SITE_URL}/works/${w.workId}`,
      })),
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "ジャンル", item: `${SITE_URL}/genre` },
      { "@type": "ListItem", position: 3, name: def.l2Label, item: genreUrl },
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
        <section className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            {/* パンくず */}
            <nav aria-label="パンくず" className="text-xs text-stone-400 mb-6">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li><Link href="/" className="hover:text-amber-400">ホーム</Link></li>
                <li>/</li>
                <li><Link href="/genre" className="hover:text-amber-400">ジャンル</Link></li>
                <li>/</li>
                <li className="text-stone-300 font-medium">{def.l2Label}</li>
              </ol>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-5xl sm:text-6xl" aria-hidden="true">
                {def.l1Emoji}
              </span>
              <div>
                <p className="text-amber-400 text-xs font-bold tracking-wider mb-1">
                  {def.l1Label}
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-2">
                  {def.l2Label}
                  <span className="text-amber-400"> おすすめ</span>
                </h1>
                <p className="text-stone-300 text-sm sm:text-base">
                  {seo?.desc ?? `${def.l2Label}の作品を一覧で紹介します。`}
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-stone-400">
              <span className="text-amber-300 font-semibold">{works.length}作品</span>
              {" "}が見つかりました
            </p>
          </div>
        </section>

        {/* メインコンテンツ */}
        <section className="max-w-5xl mx-auto px-4 py-10 sm:py-14">
          {works.length > 0 ? (
            <GenreWorksClient works={works} />
          ) : (
            <p className="text-center text-stone-500 py-12">
              このジャンルの作品はまだ登録されていません。
            </p>
          )}
        </section>

        {/* 同じL1の他ジャンル */}
        {otherGenres.length > 0 && (
          <section className="border-t border-stone-200 bg-white py-10 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5 text-center">
                {def.l1Label}の他のジャンル
              </h2>
              <div className="flex flex-wrap justify-center gap-2">
                {otherGenres.map((g) => (
                  <Link
                    key={g.l2Id}
                    href={`/genre/${g.l2Id}`}
                    className="px-3 py-2 bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-700 rounded-full text-sm font-semibold transition-colors"
                  >
                    {g.l2Label}
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6">
                <Link
                  href="/genre"
                  className="text-sm text-stone-500 hover:text-amber-600 transition-colors"
                >
                  ← ジャンル一覧に戻る
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
