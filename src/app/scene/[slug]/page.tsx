/**
 * /scene/[slug] — 読書シーン別作品一覧ページ
 * 指定シーンに適した作品をWorkCardグリッドで表示する（完全静的）。
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorkCard from "@/components/works/WorkCard";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { READING_SCENES } from "@/constants/readingScenes";
import type { SceneWorksData } from "@/types/work";

// ── データアクセス ────────────────────────────────────────────────

function getScenesDir(): string {
  return join(process.cwd(), "public", "data", "scenes");
}

function getSceneData(slug: string): SceneWorksData | null {
  try {
    const path = join(getScenesDir(), `${slug}.json`);
    return JSON.parse(readFileSync(path, "utf-8")) as SceneWorksData;
  } catch {
    return null;
  }
}

// ── 静的生成 ─────────────────────────────────────────────────────

export async function generateStaticParams() {
  return READING_SCENES.map((s) => ({ slug: s.slug }));
}

// ── メタデータ ────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sceneDef = READING_SCENES.find((s) => s.slug === slug);
  if (!sceneDef) return {};

  return {
    title: `${sceneDef.seoTitle} | ${SITE_NAME}`,
    description: sceneDef.seoDescription,
    alternates: { canonical: `${SITE_URL}/scene/${slug}` },
    openGraph: {
      title: `${sceneDef.seoTitle} | ${SITE_NAME}`,
      description: sceneDef.seoDescription,
      url: `${SITE_URL}/scene/${slug}`,
    },
  };
}

// ── ページ ────────────────────────────────────────────────────────

export default async function ScenePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = getSceneData(slug);
  if (!data) notFound();

  const otherScenes = READING_SCENES.filter((s) => s.slug !== slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${data.label}に読む本`,
    description: data.description,
    url: `${SITE_URL}/scene/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-stone-50">

        {/* Hero */}
        <section className="bg-gradient-to-br from-stone-900 via-violet-950 to-stone-900 text-white py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            {/* パンくず */}
            <nav aria-label="パンくず" className="text-xs text-stone-400 mb-6">
              <ol className="flex items-center gap-1.5 flex-wrap">
                <li><Link href="/" className="hover:text-violet-400">ホーム</Link></li>
                <li>/</li>
                <li><Link href="/scene" className="hover:text-violet-400">シーンから探す</Link></li>
                <li>/</li>
                <li className="text-stone-300 font-medium">{data.label}</li>
              </ol>
            </nav>

            <div className="flex items-center gap-4">
              <span className="text-5xl sm:text-6xl" aria-hidden="true">{data.icon}</span>
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-2">
                  {data.label}
                  <span className="text-violet-400">に読む</span>
                </h1>
                <p className="text-stone-300 text-sm sm:text-base">{data.description}</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-stone-400">
              <span className="text-violet-300 font-semibold">{data.totalCount}件</span> の作品が見つかりました
            </p>
          </div>
        </section>

        {/* 作品グリッド */}
        <section className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
          {data.works.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-sm mb-4">このシーンに合う作品は現在準備中です</p>
              <Link
                href="/discover"
                className="text-sm text-violet-600 hover:underline"
              >
                気分タグから探してみる →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data.works.map((work) => (
                <WorkCard key={work.workId} work={work} />
              ))}
            </div>
          )}
        </section>

        {/* 他のシーン */}
        <section className="border-t border-stone-200 bg-white py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5 text-center">
              他の読書シーンで探す
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {otherScenes.map((s) => (
                <Link
                  key={s.slug}
                  href={`/scene/${s.slug}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-violet-100 text-stone-700 hover:text-violet-700 rounded-full text-sm font-semibold transition-colors"
                >
                  <span aria-hidden="true">{s.icon}</span>
                  <span>{s.label}</span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/scene"
                className="text-sm text-stone-500 hover:text-violet-600 transition-colors"
              >
                ← シーン一覧に戻る
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
