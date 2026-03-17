import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readFileSync } from "fs";
import { join } from "path";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookRecommendationCard from "@/components/books/BookRecommendationCard";
import {
  EMOTIONAL_TAGS,
  PRESET_SEARCHES,
  type EmotionalTagId,
} from "@/constants/bookTags";
import type { MoodBookEntry } from "@/types/book";

// ── 静的パラメータ ─────────────────────────────────────────────────

export function generateStaticParams() {
  return PRESET_SEARCHES.map(p => ({ slug: p.slug }));
}

// ── ページ定義 ─────────────────────────────────────────────────────

interface PageDef {
  title: string;
  description: string;
  h1: string;
  emotionalTags?: EmotionalTagId[];
  purposeTagIds?: string[];
  atmosphereTagIds?: string[];
}

const PAGE_DEFS: Record<string, PageDef> = {
  cry: {
    title: "泣ける漫画おすすめ一覧 | Books Tools",
    description: "感動で涙があふれる漫画を厳選。バトル・スポーツ・恋愛・日常系まで、泣けると評判の名作漫画を紹介します。",
    h1: "泣ける漫画 おすすめ一覧",
    emotionalTags: ["cry", "emotional"],
  },
  healing: {
    title: "癒やされる漫画おすすめ一覧 | Books Tools",
    description: "ほっこりした気持ちになれる癒やし漫画を厳選。日常系・コメディ・ほのぼの系などリラックスできる作品集。",
    h1: "癒やされる漫画 おすすめ一覧",
    emotionalTags: ["healing"],
  },
  hot: {
    title: "熱い漫画おすすめ一覧 | Books Tools",
    description: "読んで燃えるバトル・スポーツ・友情の漫画を厳選。モチベーションが上がる名作集。",
    h1: "熱い・燃える漫画 おすすめ一覧",
    emotionalTags: ["hot", "refreshing"],
  },
  heartwarming: {
    title: "キュンとする恋愛漫画おすすめ一覧 | Books Tools",
    description: "胸がキュンとなる恋愛漫画・少女漫画を厳選。切ない・甘酸っぱい作品をまとめました。",
    h1: "キュンとする恋愛漫画 おすすめ一覧",
    emotionalTags: ["heartwarming", "sad"],
  },
  thinking: {
    title: "頭を使う漫画おすすめ一覧 | Books Tools",
    description: "頭脳戦・考察要素が光る漫画を厳選。読後に語りたくなる知的なサスペンス・ミステリー漫画集。",
    h1: "頭を使う漫画 おすすめ一覧",
    purposeTagIds: ["thinking", "analysis"],
  },
  easy: {
    title: "気軽に読める漫画おすすめ一覧 | Books Tools",
    description: "難しいことを考えず気軽に楽しめる漫画を厳選。コメディ・日常系など漫画入門作を紹介。",
    h1: "気軽に読める漫画 おすすめ一覧",
    purposeTagIds: ["easy", "binge"],
  },
  dark: {
    title: "ダークな漫画おすすめ一覧 | Books Tools",
    description: "重く暗い世界観のダーク漫画を厳選。人間の本性・絶望・サスペンスを描く問題作集。",
    h1: "ダークな漫画 おすすめ一覧",
    atmosphereTagIds: ["dark", "uneasy"],
  },
  binge: {
    title: "一気読みしたい漫画おすすめ一覧 | Books Tools",
    description: "止まらなくなる中毒性の高い漫画を厳選。続きが気になって読みやすい一気読み向け作品集。",
    h1: "一気読みしたい漫画 おすすめ一覧",
    purposeTagIds: ["binge", "immersive"],
  },
  completed: {
    title: "完結済み漫画おすすめ一覧 | Books Tools",
    description: "最後まで安心して読める完結済み漫画を厳選。途中で終わる心配のない名作を紹介します。",
    h1: "完結済み漫画 おすすめ一覧",
    emotionalTags: [],
  },
  beginner: {
    title: "初心者向け漫画おすすめ一覧 | Books Tools",
    description: "漫画を読み始めたい方、久しぶりに漫画を読む方向けの入門作を厳選。読みやすく面白い定番作品集。",
    h1: "漫画入門・初心者向け おすすめ一覧",
    purposeTagIds: ["easy"],
  },
};

// ── メタデータ ─────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const def = PAGE_DEFS[slug];
  if (!def) return { title: "漫画一覧 | Books Tools" };
  return {
    title: def.title,
    description: def.description,
    openGraph: { title: def.title, description: def.description },
  };
}

// ── データ取得ヘルパー ────────────────────────────────────────────

function loadBooks(): MoodBookEntry[] {
  try {
    const filePath = join(process.cwd(), "public", "data", "books-manga.json");
    return JSON.parse(readFileSync(filePath, "utf-8")) as MoodBookEntry[];
  } catch {
    return [];
  }
}

function filterBooks(books: MoodBookEntry[], def: PageDef): MoodBookEntry[] {
  return books.filter(b => {
    const mt = b.moodTags;
    if (!mt) return false;

    // slug=completedは completionStatus で絞り込む
    if (def.h1.includes("完結")) {
      return mt.completionStatus === "完結";
    }

    const eTags = def.emotionalTags ?? [];
    const pTags = def.purposeTagIds ?? [];
    const aTags = def.atmosphereTagIds ?? [];

    if (eTags.length > 0 && !eTags.some(t => mt.emotionalTags?.includes(t as EmotionalTagId))) return false;
    if (pTags.length > 0 && !pTags.some(t => mt.purposeTags?.includes(t as never))) return false;
    if (aTags.length > 0 && !aTags.some(t => mt.atmosphereTags?.includes(t as never))) return false;

    return true;
  });
}

// ── ページコンポーネント ──────────────────────────────────────────

export default async function MoodSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = PAGE_DEFS[slug];
  if (!def) notFound();

  const allBooks = loadBooks();
  const filtered = filterBooks(allBooks, def);
  const preset = PRESET_SEARCHES.find(p => p.slug === slug);

  // 関連するプリセット（自分以外）
  const relatedPresets = PRESET_SEARCHES.filter(p => p.slug !== slug).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: def.h1,
    description: def.description,
    url: `https://books.kuras-plus.com/manga/by-mood/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        {/* ヒーロー */}
        <section className="bg-gradient-to-br from-rose-900 via-stone-900 to-stone-900 text-white py-12 sm:py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <nav className="flex items-center gap-1 text-xs text-stone-400 mb-5" aria-label="パンくず">
              <Link href="/" className="hover:text-white transition-colors">Books Tools</Link>
              <span>›</span>
              <Link href="/manga/mood" className="hover:text-white transition-colors">気分で探す</Link>
              <span>›</span>
              <span className="text-stone-300">{preset?.label ?? slug}</span>
            </nav>

            <p className="text-rose-400 text-xs font-bold tracking-widest uppercase mb-3">
              {preset?.icon && <span className="mr-1">{preset.icon}</span>}
              Mood Search
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{def.h1}</h1>
            <p className="text-stone-300 text-sm sm:text-base max-w-xl leading-relaxed">
              {def.description}
            </p>

            {/* インタラクティブ検索へのCTA */}
            <div className="mt-6">
              <Link
                href="/manga/mood"
                className="inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                <span>🔍</span>
                自分でタグを選んで探す
              </Link>
            </div>
          </div>
        </section>

        {/* 結果数 */}
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-2">
          <p className="text-sm text-stone-600">
            <span className="font-bold text-stone-900">{filtered.length}件</span> の作品が見つかりました
          </p>
        </div>

        {/* 書籍一覧 */}
        <section className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-stone-500 text-base mb-2">該当する漫画がまだ登録されていません</p>
              <Link href="/manga/mood" className="text-sm text-rose-500 font-semibold hover:underline">
                インタラクティブ検索を使う →
              </Link>
            </div>
          ) : (
            filtered.map(book => (
              <BookRecommendationCard key={book.id} book={book} />
            ))
          )}
        </section>

        {/* 関連タグ導線 */}
        <section className="max-w-3xl mx-auto px-4 py-10">
          <h2 className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-4">
            他の気分・目的でも探す
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedPresets.map(p => (
              <Link
                key={p.slug}
                href={`/manga/by-mood/${p.slug}`}
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 hover:bg-rose-100 hover:text-rose-700 transition-colors font-medium border border-stone-200"
              >
                <span aria-hidden="true">{p.icon}</span>
                {p.label}
              </Link>
            ))}
          </div>

          <div className="mt-6">
            <Link
              href="/manga/mood"
              className="text-sm text-rose-500 font-semibold hover:underline"
            >
              → タグを組み合わせて詳しく探す（インタラクティブ検索）
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
