/**
 * /scene — 読書シーン一覧ページ
 * 全シーンをカードで表示し、各シーンの作品一覧へ誘導する。
 */

import { readFileSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { SceneIndexMeta } from "@/types/work";

export const metadata: Metadata = {
  title: `読書シーンから探す | ${SITE_NAME}`,
  description:
    "通勤・通学、寝る前、休日の一気読みなど、今の状況・気分に合う漫画・小説を発見。シーンを選ぶだけで最適な作品が見つかります。",
  alternates: { canonical: `${SITE_URL}/scene` },
  openGraph: {
    title: `読書シーンから探す | ${SITE_NAME}`,
    description: "今の読書シーンに合う漫画・小説を発見する。",
    url: `${SITE_URL}/scene`,
  },
};

function getSceneIndex(): SceneIndexMeta {
  const path = join(process.cwd(), "public", "data", "scenes", "index.json");
  return JSON.parse(readFileSync(path, "utf-8")) as SceneIndexMeta;
}

export default function SceneIndexPage() {
  const { scenes } = getSceneIndex();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-stone-900 via-violet-950 to-stone-900 text-white py-14 sm:py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-violet-400 text-xs font-bold tracking-widest uppercase mb-4">
              Reading Scene · Books Discover
            </p>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              今の<span className="text-violet-400">読書シーン</span>で<br />
              一冊を見つける。
            </h1>
            <p className="text-stone-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              「通勤中に読みたい」「寝る前にほっこりしたい」——<br className="hidden sm:block" />
              今の状況を選ぶだけで、ぴったりの漫画・小説が見つかります。
            </p>
          </div>
        </section>

        {/* シーングリッド */}
        <section className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-xl font-bold text-stone-800 mb-2 text-center">
            どんな状況で読みますか？
          </h2>
          <p className="text-stone-500 text-sm text-center mb-10">
            シーンを選ぶと、その状況にぴったりの作品一覧が表示されます
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenes.map((scene) => (
              <Link
                key={scene.slug}
                href={`/scene/${scene.slug}`}
                className="group flex items-start gap-4 bg-white border border-stone-200 rounded-2xl p-5 hover:border-violet-400 hover:shadow-md transition-all"
              >
                <span className="text-3xl shrink-0 mt-0.5" aria-hidden="true">
                  {scene.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-stone-900 group-hover:text-violet-700 transition-colors">
                      {scene.label}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold shrink-0">
                      {scene.count}件
                    </span>
                  </div>
                  <p className="text-sm text-stone-500 leading-snug">
                    {scene.description}
                  </p>
                </div>
                <span className="text-stone-300 group-hover:text-violet-400 transition-colors shrink-0 mt-1">
                  →
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-violet-600 transition-colors"
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
