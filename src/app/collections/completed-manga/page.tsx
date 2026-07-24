/**
 * /collections/completed-manga — 完結済み漫画コレクション
 * 「完結 漫画 全何巻」「一気読み 完結」をターゲットKWとした巻数帯別コレクションページ。
 *
 * Phase 1-2 で NDL 書誌データから推定した完結ステータス(status="completed")を
 * 巻数帯別に分類して一覧化する。データが記事を作る自動生成ページの第一弾。
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GenreWorksClient from "@/components/works/GenreWorksClient";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { WorkListItem } from "@/types/work";

const PAGE_URL = `${SITE_URL}/collections/completed-manga`;

export const metadata: Metadata = {
  title: `完結済み漫画おすすめ｜全何巻で読み切れる？巻数帯別ガイド | ${SITE_NAME}`,
  description:
    "完結済みの漫画を全5巻以内・全10巻以内・全20巻以内の巻数帯別に紹介。続きが打ち切られる心配なく、一気読みできる完結作品が見つかります。",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "完結済み漫画おすすめ｜巻数帯別ガイド",
    description: "全5巻以内・全10巻以内など、巻数帯別に完結済み漫画を紹介します。",
    url: PAGE_URL,
    images: [{ url: "/ogp/default-ogp.png", width: 1200, height: 630 }],
  },
};

type Bucket = { id: string; label: string; min: number; max: number };

const BUCKETS: Bucket[] = [
  { id: "le5", label: "全5巻以内", min: 1, max: 5 },
  { id: "le10", label: "全6〜10巻", min: 6, max: 10 },
  { id: "le20", label: "全11〜20巻", min: 11, max: 20 },
  { id: "gt20", label: "全21巻以上の大長編", min: 21, max: Infinity },
];

function getCompletedMangaWorks(): WorkListItem[] {
  try {
    const worksListPath = join(process.cwd(), "public", "data", "works-list.json");
    const allWorks: WorkListItem[] = JSON.parse(readFileSync(worksListPath, "utf-8"));
    return allWorks.filter((w) => w.type === "manga" && w.status === "completed");
  } catch {
    return [];
  }
}

export default function CompletedMangaPage() {
  const works = getCompletedMangaWorks();

  const bucketed = BUCKETS.map((b) => ({
    ...b,
    works: works
      .filter((w) => w.volumeCount >= b.min && w.volumeCount <= b.max)
      .sort((a, b2) => (b2.latestPublishedDate ?? "").localeCompare(a.latestPublishedDate ?? "")),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "完結済み漫画おすすめ｜巻数帯別ガイド",
    description:
      "完結済みの漫画を全5巻以内・全10巻以内・全20巻以内の巻数帯別に紹介するコレクションページ。",
    url: PAGE_URL,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: works.length,
      itemListElement: works.slice(0, 30).map((w, i) => ({
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
      { "@type": "ListItem", position: 2, name: "完結済み漫画おすすめ", item: PAGE_URL },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "完結済みの漫画を選ぶメリットは？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "連載中の作品と違い、続きが途中で終わる心配がなく、最初から最後まで一気に読み切れるのが魅力です。物語の結末まで含めて評価が定まっているため、名作を選びやすいという利点もあります。",
        },
      },
      {
        "@type": "Question",
        name: "全5巻以内で読み切れる完結漫画はありますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。短編〜中編で完結する作品も多くあります。このページの「全5巻以内」セクションから、巻数を抑えつつ読み応えのある完結作品を探せます。",
        },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-stone-900 via-emerald-950 to-stone-900 text-white py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <nav aria-label="パンくず" className="text-xs text-stone-400 mb-6">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li>
                  <Link href="/" className="hover:text-emerald-400">
                    ホーム
                  </Link>
                </li>
                <li>/</li>
                <li className="text-stone-300 font-medium">完結済み漫画おすすめ</li>
              </ol>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-5xl sm:text-6xl" aria-hidden="true">
                ✅
              </span>
              <div>
                <p className="text-emerald-400 text-xs font-bold tracking-wider mb-1">
                  巻数帯別コレクション
                </p>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-2">
                  完結済み漫画を
                  <span className="text-emerald-400">巻数で選ぶ</span>
                </h1>
                <p className="text-stone-300 text-sm sm:text-base">
                  続きが気になって打ち切られる心配なし。全5巻以内のサクッと読める作品から、
                  大長編の完結作まで、巻数帯別に一気読みできる完結漫画を紹介します。
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs text-stone-400">
              <span className="text-emerald-300 font-semibold">{works.length}作品</span> が見つかりました
            </p>
          </div>
        </section>

        {/* 巻数帯ナビ */}
        <section className="max-w-4xl mx-auto px-4 pt-8 pb-2">
          <div className="flex flex-wrap gap-2">
            {bucketed.map((b) => (
              <a
                key={b.id}
                href={`#${b.id}`}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
              >
                {b.label}（{b.works.length}）
              </a>
            ))}
          </div>
        </section>

        {/* 巻数帯別セクション */}
        {bucketed.map((b) =>
          b.works.length > 0 ? (
            <section key={b.id} id={b.id} className="max-w-5xl mx-auto px-4 py-8 scroll-mt-4">
              <h2 className="text-lg font-bold text-stone-800 mb-1">{b.label}の完結漫画</h2>
              <p className="text-xs text-stone-400 mb-6">{b.works.length}作品</p>
              <GenreWorksClient works={b.works} />
            </section>
          ) : null,
        )}

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-4 py-10 border-t border-stone-200">
          <h2 className="text-lg font-bold text-stone-800 mb-5">よくある質問</h2>
          <dl className="space-y-4">
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <dt className="text-sm font-semibold text-stone-800 mb-2">完結済みの漫画を選ぶメリットは？</dt>
              <dd className="text-sm text-stone-600 leading-relaxed">
                連載中の作品と違い、続きが途中で終わる心配がなく、最初から最後まで一気に読み切れるのが魅力です。
                物語の結末まで含めて評価が定まっているため、名作を選びやすいという利点もあります。
              </dd>
            </div>
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <dt className="text-sm font-semibold text-stone-800 mb-2">
                全5巻以内で読み切れる完結漫画はありますか？
              </dt>
              <dd className="text-sm text-stone-600 leading-relaxed">
                はい。短編〜中編で完結する作品も多くあります。このページの「全5巻以内」セクションから、
                巻数を抑えつつ読み応えのある完結作品を探せます。
              </dd>
            </div>
          </dl>
        </section>

        {/* 回遊導線 */}
        <section className="max-w-4xl mx-auto px-4 pb-10">
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/discover/new-releases"
              className="group flex items-center gap-3 bg-sky-50 border border-sky-200 hover:border-sky-400 rounded-xl px-5 py-4 transition-all"
            >
              <span className="text-2xl" aria-hidden="true">
                🆕
              </span>
              <div>
                <p className="text-sm font-bold text-sky-800 group-hover:text-sky-900">新着作品をチェック</p>
                <p className="text-xs text-sky-600">直近追加・更新された作品をまとめて紹介</p>
              </div>
            </Link>
            <Link
              href="/tools/reading-time"
              className="group flex items-center gap-3 bg-violet-50 border border-violet-200 hover:border-violet-400 rounded-xl px-5 py-4 transition-all"
            >
              <span className="text-2xl" aria-hidden="true">
                ⏱️
              </span>
              <div>
                <p className="text-sm font-bold text-violet-800 group-hover:text-violet-900">読書時間を計算する</p>
                <p className="text-xs text-violet-600">気になる作品の読了時間をシミュレーション</p>
              </div>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
