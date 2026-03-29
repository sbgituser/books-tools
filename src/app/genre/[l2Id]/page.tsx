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

const L2_SEO: Record<string, { title: string; desc: string; longDesc: string }> = {
  mystery: {
    title: "ミステリー小説おすすめ厳選｜本格推理からサスペンスまで",
    desc: "ミステリー・推理小説おすすめ一覧。本格ミステリーからサスペンスまで、謎解きが好きな方に。Kindle Unlimited対応作品多数。",
    longDesc: "本格ミステリー・推理小説から心理サスペンスまで、読み応え抜群の作品を厳選しました。論理的な謎解きを楽しみたい方、先が読めない展開にドキドキしたい方、どんでん返しを求める方におすすめです。"
  },
  sf: {
    title: "SF小説おすすめ厳選｜宇宙・AI・ディストピアの名作",
    desc: "SF小説おすすめ一覧。宇宙・ディストピア・AI・近未来の名作を厳選紹介。Kindle Unlimited対応作品多数。",
    longDesc: "宇宙探索・ディストピア・AI・近未来技術など、想像力を刺激するSF小説を厳選しました。ハードSFから読みやすい入門作まで、様々なSFの醍醐味が楽しめます。"
  },
  fantasy: {
    title: "ファンタジー小説おすすめ厳選｜異世界・魔法・冒険の名作",
    desc: "ファンタジー小説おすすめ一覧。異世界転生・魔法・冒険ファンタジーの名作を厳選。Kindle Unlimited対応作品多数。",
    longDesc: "異世界転生・魔法・ドラゴン・英雄譚など、現実を超えた世界観のファンタジー小説を厳選しました。王道冒険ファンタジーからダークファンタジー・神話伝承系まで幅広く揃っています。壮大な冒険に胸躍らせたい方に。"
  },
  romance: {
    title: "恋愛小説 おすすめ",
    desc: "恋愛小説のおすすめ。純愛・大人の恋愛・切ない恋愛小説を厳選紹介。",
    longDesc: "甘酸っぱい初恋から大人の複雑な恋愛まで、心に響く恋愛小説を集めました。胸がキュンとする純愛から、切なく泣ける作品まで幅広く紹介します。"
  },
  youth: {
    title: "青春小説 おすすめ",
    desc: "青春小説のおすすめ。学園・友情・成長物語。瑞々しい読書体験を。",
    longDesc: "学園生活・部活・友情・初恋など、青春の輝きを描いた小説を集めました。読むと懐かしく、また新鮮な気持ちになれる瑞々しい作品揃いです。"
  },
  literary: {
    title: "純文学 おすすめ",
    desc: "純文学のおすすめ作品。芥川賞・直木賞受賞作から名作まで。深い読書体験を。",
    longDesc: "芥川賞・直木賞受賞作をはじめ、日本の純文学の傑作を集めました。人間の内面・社会・生と死を深く掘り下げた、読み応えのある作品を紹介します。"
  },
  "historical-novel": {
    title: "歴史小説 おすすめ",
    desc: "歴史小説・時代小説のおすすめ。戦国・幕末・江戸を舞台にした名作を紹介。",
    longDesc: "戦国時代・幕末維新・江戸時代を舞台にした歴史小説・時代小説を集めました。史実に基づいたドラマと、そこに生きた人々の物語が楽しめます。"
  },
  horror: {
    title: "ホラー小説 おすすめ",
    desc: "ホラー小説のおすすめ。怪談・心理ホラー・和風ホラーの名作を集めました。",
    longDesc: "日本の怪談・心理ホラー・オカルト・和風ホラーなど、背筋が凍るような作品を集めました。恐怖体験を求める方、怖いけど読みたい方におすすめです。"
  },
  entertainment: {
    title: "エンタメ小説 おすすめ",
    desc: "エンタメ小説のおすすめ。読みやすいベストセラーから映像化作品まで。",
    longDesc: "映像化作品やベストセラーなど、幅広い層に支持されているエンターテインメント小説を集めました。読みやすさと面白さを兼ね備えた作品が揃っています。"
  },
  shonen: {
    title: "少年漫画 おすすめ",
    desc: "少年漫画のおすすめ作品。バトル・冒険・スポーツの人気作を一覧で紹介。",
    longDesc: "バトル・スポーツ・冒険・友情など、少年漫画の王道を行く名作から話題作まで集めました。熱い展開と成長ストーリーが楽しめる作品を紹介します。"
  },
  shojo: {
    title: "少女漫画 おすすめ",
    desc: "少女漫画のおすすめ。恋愛・友情・ファンタジーの名作を紹介。",
    longDesc: "恋愛・友情・ファンタジー・成長をテーマにした少女漫画の名作を集めました。胸キュンのラブストーリーから、勇気をもらえる成長物語まで幅広く紹介します。"
  },
  seinen: {
    title: "青年漫画 おすすめ",
    desc: "青年漫画のおすすめ。大人向けの深い物語やリアルな人間ドラマを厳選。",
    longDesc: "大人向けのリアルな人間ドラマ・社会問題・深いテーマを描いた青年漫画を集めました。少年漫画では描けない複雑な物語が楽しめます。"
  },
  general: {
    title: "一般漫画 おすすめ",
    desc: "ジャンルを問わない漫画のおすすめ。話題作から隠れた名作まで。",
    longDesc: "ジャンルの枠に収まらない個性的な漫画・話題作・隠れた名作を集めました。幅広い作風の作品を楽しみたい方におすすめです。"
  },
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
    longDesc: `${def.l2Label}のおすすめ漫画・小説を一覧で紹介。`,
  };

  return {
    title: `${seo.title} | ${SITE_NAME}`,
    description: seo.longDesc ?? seo.desc,
    alternates: { canonical: `${SITE_URL}/genre/${l2Id}` },
    openGraph: {
      title: `${seo.title} | ${SITE_NAME}`,
      description: seo.desc,
      url: `${SITE_URL}/genre/${l2Id}`,
      images: [{ url: `/ogp/genre/${l2Id}.png`, width: 1200, height: 630 }],
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
    description: seo?.longDesc ?? seo?.desc ?? `${def.l2Label}の作品一覧`,
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
                  {seo?.longDesc ?? seo?.desc ?? `${def.l2Label}の作品を一覧で紹介します。`}
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
