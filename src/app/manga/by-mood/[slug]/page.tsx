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
import { SITE_URL } from "@/lib/site";
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

const MOOD_FAQ: Record<string, { q: string; a: string }[]> = {
  cry: [
    { q: "泣ける漫画を読む良い効果はありますか？", a: "感動して泣くことは「情動的涙」とも呼ばれ、ストレス解消や感情のリセット効果があるとされています。良い作品を読んで思い切り泣くのも一つのリフレッシュ方法です。" },
    { q: "泣ける漫画は何巻くらいのものが多いですか？", a: "泣ける漫画は長編から短編まで様々です。長編では感情移入しながら読み進め、最終巻での感動が大きいです。短編や読み切りでも心に刺さる作品が多くあります。" },
  ],
  healing: [
    { q: "癒やし漫画の特徴は何ですか？", a: "日常系・ほのぼの・スローライフが多く、過度な緊張感や複雑な人間関係が少ないのが特徴です。読後に心が穏やかになれる作品が揃っています。" },
    { q: "疲れているときにおすすめの漫画は？", a: "日常系のほのぼの漫画や、かわいいキャラクターが登場する癒やし系漫画がおすすめです。あまり頭を使わず、ゆっくり楽しめる作品を選ぶと良いでしょう。" },
  ],
  hot: [
    { q: "熱い漫画の定番ジャンルは何ですか？", a: "スポーツ漫画・バトル漫画・友情と成長を描いた少年漫画が定番です。「ハイキュー!!」「鬼滅の刃」「スラムダンク」などが代表例です。" },
    { q: "モチベーションが上がる漫画はありますか？", a: "スポーツ漫画や夢に向かって奮闘する主人公の物語は、読むだけで前向きな気持ちになれます。特に努力・友情・勝利をテーマにした作品が効果的です。" },
  ],
  heartwarming: [
    { q: "恋愛漫画を楽しめる年代は？", a: "恋愛漫画は10代から大人まで幅広く楽しめます。学生時代の恋愛を描いた青春系から、大人向けのリアルな恋愛まで年代に合わせた作品が揃っています。" },
    { q: "少女漫画と恋愛漫画の違いは？", a: "少女漫画はターゲット層（10代女性向け）を指す区分で、その多くが恋愛をテーマにしています。恋愛漫画は雑誌や対象層を問わず恋愛要素が中心の作品全般を指します。" },
  ],
  thinking: [
    { q: "頭を使う漫画はどんな人に向いていますか？", a: "謎解きや心理戦が好きな方、作品の伏線を読み解く考察を楽しみたい方におすすめです。デスゲームやミステリー要素のある作品が特に人気です。" },
    { q: "考察漫画の楽しみ方は？", a: "読み進めながら自分なりの予想や考察をするのが醍醐味です。読後にネットでほかの読者の考察を見たり、友人と語り合うとさらに楽しめます。" },
  ],
  dark: [
    { q: "ダーク漫画はどんな人に向いていますか？", a: "重いテーマや人間の本性を描いた作品が好きな方、ハッピーエンドだけでなく悲劇的な展開も楽しめる方に向いています。注意: 精神的に疲れている時は避けた方が良い場合もあります。" },
    { q: "ダーク漫画で注意すべき点は？", a: "暴力・残酷な描写・重いテーマが含まれる作品も多いです。読む前にジャンルタグや対象年齢を確認し、自分の精神状態に合わせて選ぶことをおすすめします。" },
  ],
  binge: [
    { q: "一気読みしやすい漫画の特徴は何ですか？", a: "テンポの良い展開、先の気になるストーリー、短い話数で区切られた構成が特徴です。続きが読みたくなる伏線や引きが上手い作品が一気読み向きです。" },
    { q: "電子書籍で一気読みするコツは？", a: "Kindle Unlimitedなどのサブスクを利用すると、読み放題で気兼ねなく一気読みできます。スマホなら寝転がりながら読めるので、週末の一気読みに最適です。" },
  ],
  completed: [
    { q: "完結済み漫画のメリットは何ですか？", a: "最後まで安心して読めること、続刊を待つストレスがないこと、全体の評価が固まっていること、まとめ買いで安価に揃えられることなどがメリットです。" },
    { q: "連載中の漫画と完結済みの漫画はどちらがおすすめですか？", a: "初めて漫画を読む方や、待つのが苦手な方には完結済みがおすすめです。最新の展開をリアルタイムで楽しみたい方は連載中も選択肢に入ります。" },
  ],
  easy: [
    { q: "漫画初心者に向いているジャンルは？", a: "日常系・コメディ・少年漫画の人気作がおすすめです。複雑な設定が少なく、キャラクターに感情移入しやすい作品が多いです。" },
    { q: "忙しい人でも読める漫画は？", a: "短い章立て・1話完結のスタイルや、ページ数が少ない作品が隙間時間に最適です。スマホで電子書籍を使えば通勤・通学中でも読めます。" },
  ],
  beginner: [
    { q: "漫画を読んだことがない大人でも楽しめますか？", a: "はい。漫画は絵と文字で直感的に楽しめるため、読書習慣がない方でも気軽に始められます。人気作品から始めると世界観に入り込みやすいです。" },
    { q: "最初に読む漫画として何がおすすめですか？", a: "映像化・アニメ化されて話題になった人気作品から入るのがおすすめです。すでに知っているキャラクターや世界観だと、より楽しみやすいです。" },
  ],
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
    alternates: { canonical: `${SITE_URL}/manga/by-mood/${slug}` },
    openGraph: {
      title: def.title,
      description: def.description,
      url: `${SITE_URL}/manga/by-mood/${slug}`,
      images: [{ url: `/ogp/manga/by-mood/${slug}.png`, width: 1200, height: 630 }],
    },
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

  const pageUrl = `${SITE_URL}/manga/by-mood/${slug}`;
  const moodFAQs = MOOD_FAQ[slug] ?? [];
  const faqJsonLd = moodFAQs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: moodFAQs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  } : null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: def.h1,
    description: def.description,
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: filtered.length,
      itemListElement: filtered.slice(0, 10).map((book, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: book.title,
        url: `${SITE_URL}/works/${book.id}`,
      })),
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "気分で探す", item: `${SITE_URL}/manga/mood` },
      { "@type": "ListItem", position: 3, name: def.h1, item: pageUrl },
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
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
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

        {/* FAQ */}
        {moodFAQs.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 py-8 border-t border-stone-200">
            <h2 className="text-lg font-bold text-stone-800 mb-5">よくある質問</h2>
            <dl className="space-y-4">
              {moodFAQs.map((faq, i) => (
                <div key={i} className="bg-white border border-stone-200 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-stone-800 mb-2">{faq.q}</dt>
                  <dd className="text-sm text-stone-600 leading-relaxed">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

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
