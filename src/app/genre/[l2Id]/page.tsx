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
import { getAllBlogMeta } from "@/lib/blog";
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

const L2_SEO: Record<string, { title: string; desc: string; longDesc: string; h1?: string }> = {
  mystery: {
    title: "ミステリー小説おすすめ厳選｜本格推理からサスペンスまで",
    desc: "ミステリー・推理小説おすすめ一覧。本格ミステリーからサスペンスまで、謎解きが好きな方に。Kindle Unlimited対応作品多数。",
    longDesc: "本格ミステリー・推理小説から心理サスペンスまで、読み応え抜群の作品を厳選しました。論理的な謎解きを楽しみたい方、先が読めない展開にドキドキしたい方、どんでん返しを求める方におすすめです。"
  },
  sf: {
    title: "科学小説おすすめ｜サイエンスフィクション・SF名作ガイド",
    desc: "科学小説・SF小説のおすすめを厳選紹介。サイエンスフィクションの名作から科学ミステリー、ハードSFまで知的好奇心を刺激する作品を解説付きでご紹介。",
    longDesc: "科学をテーマにした小説・サイエンスフィクション（SF）の名作を厳選しました。宇宙探索・AI・ディストピア・近未来技術など、科学的想像力を刺激するハードSFから読みやすい科学小説の入門作まで幅広くご紹介します。",
    h1: "科学小説おすすめ — サイエンスの世界を楽しむ読書ガイド",
  },
  fantasy: {
    title: "ファンタジー漫画・小説おすすめ厳選【2026年最新】異世界・魔法・冒険の人気作品",
    desc: "ファンタジー漫画・ファンタジー小説のおすすめを厳選紹介。2026年春アニメ化作品（転スラ4期・リゼロ4th・黄泉のツガイ）、異世界転生、魔法バトル、冒険ファンタジーの人気作から名作まで。初心者向け入門ガイド・サブジャンル別の選び方付き。",
    longDesc: "ファンタジー漫画・ファンタジー小説の中から厳選したおすすめ作品を紹介。異世界転生・魔法・冒険・ダークファンタジーなど壮大な世界観の人気作から名作まで幅広く揃えています。2026年春アニメ化されるファンタジー原作（転スラ4期・リゼロ4th・黄泉のツガイ等）もカバー。「どの作品から読む？」初心者でも選びやすいジャンル別ガイド付きです。",
    h1: "ファンタジー漫画・小説おすすめ【2026年最新】異世界・魔法・冒険の人気作品",
  },
  romance: {
    title: "恋愛小説おすすめ厳選｜純愛・ラブコメ・切ない恋愛の名作",
    desc: "恋愛小説おすすめ一覧。純愛・大人の恋愛・切ない悲恋・ラブコメまで厳選紹介。胸キュン・泣ける恋愛小説をジャンル別にチェック。",
    longDesc: "甘酸っぱい初恋から大人の複雑な恋愛まで、心に響く恋愛小説を厳選しました。胸がキュンとする純愛から切なく泣ける悲恋、笑えるラブコメまで幅広く紹介します。"
  },
  youth: {
    title: "青春小説おすすめ厳選｜学園・友情・成長の感動作品",
    desc: "青春小説おすすめ一覧。学園・部活・友情・初恋・成長物語を厳選。読むと瑞々しい気持ちになれる青春小説をジャンル別に紹介。",
    longDesc: "学園生活・部活・友情・初恋など、青春の輝きを描いた小説を厳選しました。読むと懐かしく、また新鮮な気持ちになれる瑞々しい作品が揃っています。"
  },
  literary: {
    title: "純文学おすすめ厳選｜芥川賞・直木賞・名作の読み応えある一冊",
    desc: "純文学おすすめ一覧。芥川賞・直木賞受賞作から文豪の名作まで厳選。人間の内面を深く描く読み応えある作品をジャンル別に紹介。",
    longDesc: "芥川賞・直木賞受賞作をはじめ、日本の純文学の傑作を厳選しました。人間の内面・社会・生と死を深く掘り下げた、読み応えのある作品を紹介します。"
  },
  "historical-novel": {
    title: "歴史小説おすすめ厳選｜戦国・幕末・江戸の名作時代小説",
    desc: "歴史小説・時代小説のおすすめ一覧。戦国・幕末・江戸を舞台にした名作を厳選。史実に基づいたドラマと人間ドラマが楽しめる作品集。",
    longDesc: "戦国時代・幕末維新・江戸時代を舞台にした歴史小説・時代小説を厳選しました。史実に基づいたドラマと、そこに生きた人々の物語が楽しめます。"
  },
  horror: {
    title: "ホラー小説おすすめ厳選｜怪談・心理ホラー・和風ホラーの名作",
    desc: "ホラー小説おすすめ一覧。怪談・心理ホラー・和風ホラー・スプラッタの名作を厳選。背筋が凍る恐怖体験を求める方はこちら。",
    longDesc: "日本の怪談・心理ホラー・オカルト・和風ホラーなど、背筋が凍るような作品を厳選しました。恐怖体験を求める方、怖いけど読みたい方におすすめです。"
  },
  entertainment: {
    title: "エンタメ小説おすすめ厳選｜ベストセラーから映像化作品まで",
    desc: "エンタメ小説おすすめ一覧。映像化作品・ベストセラー・どんでん返し・一気読み作品を厳選。読みやすくて面白い作品を一覧でチェック。",
    longDesc: "映像化作品やベストセラーなど、幅広い層に支持されているエンターテインメント小説を厳選しました。読みやすさと面白さを兼ね備えた作品が揃っています。"
  },
  shonen: {
    title: "少年漫画おすすめ厳選｜バトル・冒険・ファンタジーの人気作品【2026年版】",
    desc: "少年漫画のおすすめ作品を厳選紹介。バトル・冒険・ファンタジー・スポーツの人気作を一覧で紹介。2026年春アニメ化作品もカバー。",
    longDesc: "バトル・スポーツ・冒険・ファンタジー・友情など、少年漫画の王道を行く名作から話題作まで集めました。ファンタジー漫画・冒険漫画を探している方にもおすすめ。熱い展開と成長ストーリーが楽しめる作品を紹介します。"
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

const GENRE_FAQ: Record<string, { q: string; a: string }[]> = {
  mystery: [
    { q: "ミステリー小説の初心者におすすめの作品は？", a: "読みやすい本格ミステリーとして、東野圭吾や宮部みゆき作品が入門に最適です。謎解きの面白さを体験しながら、ジャンルの幅広さを知ることができます。" },
    { q: "ミステリーとサスペンスの違いは何ですか？", a: "ミステリーは「謎を解く」過程を楽しむジャンル、サスペンスは「緊張感・不安感」を楽しむジャンルです。多くの作品はその両方の要素を持っています。" },
  ],
  sf: [
    { q: "科学小説とSF小説の違いは何ですか？", a: "科学小説はサイエンスフィクション（SF）の日本語訳で、基本的に同じジャンルを指します。科学的な知見や理論をベースに物語を展開する小説全般を含み、ハードSF・宇宙SF・近未来SFなど幅広い作品があります。" },
    { q: "科学小説・SF小説を読んだことがない初心者でも楽しめますか？", a: "はい。まず読みやすいアニメ化作品や、伊坂幸太郎のSF寄り作品から入るのがおすすめです。難解なハードSFから読む必要はありません。科学の知識がなくても楽しめる作品が多数あります。" },
    { q: "ハードSFと一般向け科学小説の違いは何ですか？", a: "ハードSFは物理学・工学など科学的考証を厳密に重視した作品です。一般向け科学小説はエンタメ要素を重視し、科学的設定を物語の舞台装置として楽しめます。初心者には後者がおすすめです。" },
  ],
  fantasy: [
    { q: "ファンタジー小説で最初に読むべき作品は？", a: "王道の異世界ファンタジーとして「十二国記」「守り人シリーズ」が読みやすく人気です。海外ファンタジーなら「ハリー・ポッター」「ナルニア国物語」が定番。好みに合わせてダークファンタジーや学園ファンタジーも選べます。" },
    { q: "ライトノベルと一般ファンタジー小説の違いは？", a: "ライトノベルはカジュアルで読みやすい文体・表現が多く、10代〜20代向け。一般小説は文学的な描写が多い傾向があります。どちらも魅力的な作品が揃っています。" },
    { q: "ファンタジー漫画と小説、どちらから入るのがおすすめ？", a: "ビジュアルで世界観を掴みやすい漫画から入るのがおすすめです。『鋼の錬金術師』『葬送のフリーレン』など完成度の高い作品が多数あります。小説はより深い世界設定や心理描写を楽しみたい方に向いています。" },
    { q: "2026年春にアニメ化されるファンタジー作品は？", a: "2026年春は「転生したらスライムだった件 第4期」「Re:ゼロから始める異世界生活 4th season」「黄泉のツガイ」「あかね噺」など注目作が多数放送開始します。原作を先に読んでからアニメを楽しむのもおすすめです。" },
    { q: "異世界転生ファンタジーの選び方は？", a: "チート系で爽快に楽しむなら『転スラ』、伏線回収を楽しむなら『リゼロ』、コメディ系なら『このすば』がおすすめ。内政・スローライフ系も近年人気が高まっています。" },
  ],
  romance: [
    { q: "恋愛小説の選び方は？", a: "まず「純愛」「ラブコメ」「切ない悲恋」など好みのテイストを決めましょう。片思いや三角関係など設定から選ぶのもおすすめです。" },
    { q: "恋愛小説と少女漫画ではどちらがおすすめですか？", a: "どちらも楽しめます。小説は心理描写が豊富で没入感があり、漫画は視覚的に感情が伝わりやすいです。時間があれば両方試してみてください。" },
  ],
  shonen: [
    { q: "少年漫画の定番ジャンルは何ですか？", a: "バトル・スポーツ・冒険・友情が定番ジャンルです。「鬼滅の刃」「ハイキュー!!」「呪術廻戦」など話題作から入るのがおすすめです。" },
    { q: "ファンタジー系の少年漫画でおすすめは？", a: "ファンタジー漫画の王道なら「鋼の錬金術師」「葬送のフリーレン」「ダンジョン飯」がおすすめ。異世界転生系なら「転スラ」、ダークファンタジーなら「進撃の巨人」「メイドインアビス」が人気です。2026年春は「黄泉のツガイ」「転スラ4期」がアニメ化で注目されています。" },
    { q: "大人が少年漫画を楽しめますか？", a: "もちろんです。少年漫画は世代を超えて楽しめる作品が多く、大人になってから読むと違う視点で楽しめることもあります。" },
  ],
  seinen: [
    { q: "青年漫画はどんな人に向いていますか？", a: "リアルな人間ドラマや社会問題に興味のある方、少年漫画より深みのある物語を求める方に向いています。" },
    { q: "少年漫画と青年漫画の違いは？", a: "少年漫画は主に10代向けで友情・成長がテーマ。青年漫画は大人向けで、社会・人間関係・哲学など複雑なテーマを扱う傾向があります。" },
  ],
  shojo: [
    { q: "少女漫画はどんな作品が多いですか？", a: "恋愛・友情・ファンタジーが主なテーマです。胸キュンの恋愛ものから、強い主人公の成長物語まで幅広い作品があります。" },
    { q: "少女漫画は女性しか楽しめませんか？", a: "いいえ。感情描写の豊かさや繊細な心理表現は性別問わず楽しめます。男性ファンも多い人気作品がたくさんあります。" },
  ],
  literary: [
    { q: "純文学と一般小説の違いは何ですか？", a: "純文学は芸術性・文学的表現を重視し、人間の内面や社会を深く描きます。一般小説はエンタメ性を重視した読みやすい作品が多いです。" },
    { q: "純文学初心者に向いている作品は？", a: "川端康成「雪国」、夏目漱石「こころ」など文豪の名作が読みやすいです。現代作家なら村上春樹「ノルウェイの森」も入門に適しています。" },
  ],
  horror: [
    { q: "ホラー小説はどのくらい怖いですか？", a: "作品によって恐怖の種類や強度は大きく異なります。心理ホラーは「不安感・不気味さ」、ゴアホラーは「直接的な恐怖」が特徴です。苦手な方は心理ホラーから試してみてください。" },
    { q: "日本のホラーと海外ホラーの違いは？", a: "日本のホラーは「日常に潜む恐怖・怪談・霊的なもの」、海外ホラーは「モンスター・心理的恐怖・SF要素」が多い傾向があります。" },
  ],
  entertainment: [
    { q: "エンタメ小説のおすすめの選び方は？", a: "映像化作品から入るのが最も間違いなくおすすめです。ドラマや映画で気に入った作品の原作を読むと、さらに世界観を深く楽しめます。" },
    { q: "一気読みできるエンタメ小説の特徴は？", a: "テンポの良いストーリー展開、先が読めない展開、キャラクターへの感情移入がしやすい作品が一気読みしやすいです。" },
  ],
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
  const genreFAQs = GENRE_FAQ[l2Id] ?? [];
  const allBlogPosts = getAllBlogMeta();
  const genreLabel = def.l2Label;
  const relatedBlogPosts = allBlogPosts
    .filter(post =>
      post.tags?.some(tag =>
        tag.includes(genreLabel) ||
        genreLabel.includes(tag) ||
        tag === def.l1Label
      ) ||
      post.title?.includes(genreLabel)
    )
    .slice(0, 3);

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
  const faqJsonLd = genreFAQs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: genreFAQs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  } : null;

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
                  {seo?.h1 ? seo.h1 : <>{def.l2Label}<span className="text-amber-400"> おすすめ</span></>}
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

        {/* ── ファンタジー特集セクション ─────────────────────── */}
        {l2Id === "fantasy" && (
          <>
            {/* リッチリード文 */}
            <section className="max-w-4xl mx-auto px-4 pt-10 sm:pt-14 pb-6">
              <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-stone-800 mb-3">ファンタジー漫画・小説の魅力と選び方</h2>
                <div className="text-sm text-stone-600 leading-relaxed space-y-3">
                  <p>
                    ファンタジーは、魔法・異世界・冒険・神話など非日常の世界観を舞台にした物語ジャンルです。
                    漫画ではダイナミックなバトルとビジュアル表現、小説では壮大な世界設定と深い心理描写が楽しめます。
                    近年は異世界転生ものの大ヒットでジャンル全体の裾野が広がり、初心者にも入りやすい作品が増えています。
                  </p>
                  <p>
                    選び方のポイントは「サブジャンル」を意識すること。王道バトル・異世界転生・ダークファンタジー・ハイファンタジー（冒険探索系）では、
                    読み心地がまったく異なります。まずは下のサブジャンル紹介から自分の好みに合うタイプを見つけてみてください。
                  </p>
                  <p>
                    ファンタジー漫画のおすすめを探している方は、鋼の錬金術師・葬送のフリーレン・ダンジョン飯など完成度の高い作品から。
                    冒険漫画が好きなら ONE PIECE や NARUTO、魔法小説を読みたいならハリー・ポッターや十二国記が入口として最適です。
                  </p>
                </div>
              </div>
            </section>

            {/* 2026年春アニメ化ファンタジー作品 */}
            <section className="max-w-4xl mx-auto px-4 py-6">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl" aria-hidden="true">📺</span>
                  <h2 className="text-lg font-bold text-stone-800">2026年春アニメ化ファンタジー作品</h2>
                </div>
                <p className="text-sm text-stone-600 mb-5">
                  2026年4月放送開始のアニメの中から、ファンタジー原作の注目タイトルをピックアップ。
                  アニメをきっかけに原作を読み始めるのにぴったりのタイミングです。
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { title: "転生したらスライムだった件 第4期", type: "ラノベ原作", desc: "チート級の能力で国家建設。爽快な異世界ファンタジーの最高峰", link: "/blog/isekai-sequels-2026-reading-guide" },
                    { title: "Re:ゼロから始める異世界生活 4th season", type: "ラノベ原作", desc: "死に戻りの絶望と希望。伏線回収が圧巻の第六章へ", link: "/blog/isekai-sequels-2026-reading-guide" },
                    { title: "黄泉のツガイ", type: "漫画原作", desc: "荒川弘最新作。双子の少年が怪異と対峙するダークファンタジー", link: "/genre/fantasy" },
                    { title: "あかね噺", type: "漫画原作", desc: "落語×成長物語。伝統芸能の世界を描く話題の少年漫画", link: "/genre/shonen" },
                  ].map((anime) => (
                    <Link
                      key={anime.title}
                      href={anime.link}
                      className="group bg-white border border-amber-100 hover:border-amber-300 rounded-xl p-4 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug">{anime.title}</p>
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">{anime.type}</span>
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed">{anime.desc}</p>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
                  <Link href="/blog/spring-anime-2026-original-manga" className="text-sm text-amber-700 hover:text-amber-800 font-semibold hover:underline">
                    2026年春アニメ原作ガイド全60作品 →
                  </Link>
                  <Link href="/blog/isekai-sequels-2026-reading-guide" className="text-sm text-amber-700 hover:text-amber-800 font-semibold hover:underline">
                    転スラ・リゼロの原作ガイドを読む →
                  </Link>
                </div>
              </div>
            </section>

            {/* サブジャンル別おすすめ */}
            <section className="max-w-4xl mx-auto px-4 py-6">
              <h2 className="text-lg font-bold text-stone-800 mb-4">サブジャンル別おすすめ</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { emoji: "🌍", label: "異世界・転生", desc: "転スラ、リゼロ、このすば、無職転生など。現代人が異世界で活躍する人気ジャンル。", blogLink: "/blog/isekai-manga-recommendations", blogLabel: "異世界漫画おすすめ10選" },
                  { emoji: "⚔️", label: "王道バトル・冒険", desc: "鋼の錬金術師、FAIRY TAIL、マギなど。仲間との絆と成長を描く王道ファンタジー。", blogLink: "/blog/fantasy-manga-recommendations", blogLabel: "ファンタジー漫画30選" },
                  { emoji: "🌑", label: "ダークファンタジー", desc: "ベルセルク、進撃の巨人、メイドインアビスなど。重厚な世界観と衝撃の展開。", blogLink: "/blog/dark-fantasy-manga", blogLabel: "ダークファンタジー漫画10選" },
                ].map((sub) => (
                  <div key={sub.label} className="bg-white border border-stone-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl" aria-hidden="true">{sub.emoji}</span>
                      <h3 className="font-bold text-stone-800 text-sm">{sub.label}</h3>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed mb-3">{sub.desc}</p>
                    <Link href={sub.blogLink} className="text-xs text-amber-700 hover:text-amber-800 font-semibold hover:underline">
                      {sub.blogLabel} →
                    </Link>
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                {[
                  { emoji: "🏰", label: "ハイファンタジー（探索・冒険）", desc: "ダンジョン飯、とんがり帽子のアトリエ、十二国記など。緻密な世界設定と探索の楽しさが魅力。", blogLink: "/blog/adventure-manga-recommendations", blogLabel: "冒険漫画おすすめ15選" },
                  { emoji: "✨", label: "現代ファンタジー・魔法系", desc: "ハリー・ポッター、魔法使いの嫁、かがみの孤城など。現代を舞台に魔法や不思議な力が交差する物語。", blogLink: "/blog/magic-fantasy-novel-recommendations", blogLabel: "魔法小説おすすめ12選" },
                ].map((sub) => (
                  <div key={sub.label} className="bg-white border border-stone-200 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl" aria-hidden="true">{sub.emoji}</span>
                      <h3 className="font-bold text-stone-800 text-sm">{sub.label}</h3>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed mb-3">{sub.desc}</p>
                    <Link href={sub.blogLink} className="text-xs text-amber-700 hover:text-amber-800 font-semibold hover:underline">
                      {sub.blogLabel} →
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* 初心者向けファンタジー入門 */}
            <section className="max-w-4xl mx-auto px-4 py-6 pb-10">
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl" aria-hidden="true">📖</span>
                  <h2 className="text-lg font-bold text-stone-800">初心者向けファンタジー入門ガイド</h2>
                </div>
                <div className="text-sm text-stone-600 leading-relaxed space-y-3 mb-5">
                  <p>
                    ファンタジーを初めて読む方には、<strong>完結済みの短めの作品</strong>から入るのがおすすめです。
                    小説なら「守り人シリーズ」「ハリー・ポッター」、漫画なら「鋼の錬金術師」（全27巻）が世界観の入口として最適です。
                  </p>
                  <p>
                    異世界転生ものに興味がある方は、アニメ化作品の原作から入ると世界観を把握しやすくなります。
                    「転スラ」はテンポよく読めて初心者向け、「リゼロ」は伏線が多く読み応え重視の方におすすめです。
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href="/blog/fantasy-for-beginners" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 hover:bg-amber-100 transition-colors">
                    ファンタジー小説入門10選 →
                  </Link>
                  <Link href="/blog/fantasy-manga-recommendations" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 hover:bg-amber-100 transition-colors">
                    ファンタジー漫画おすすめ30選 →
                  </Link>
                  <Link href="/blog/adventure-manga-recommendations" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 hover:bg-amber-100 transition-colors">
                    冒険漫画おすすめ15選 →
                  </Link>
                  <Link href="/blog/magic-fantasy-novel-recommendations" className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 hover:bg-amber-100 transition-colors">
                    魔法小説おすすめ12選 →
                  </Link>
                  <Link href="/tools/media-originals" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5 hover:bg-indigo-100 transition-colors">
                    アニメから原作を探す →
                  </Link>
                  <Link href="/discover" className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-3 py-1.5 hover:bg-rose-100 transition-colors">
                    気分から作品を探す →
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}

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

        {/* FAQ */}
        {genreFAQs.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 py-10 border-t border-stone-200">
            <h2 className="text-lg font-bold text-stone-800 mb-5">よくある質問</h2>
            <dl className="space-y-4">
              {genreFAQs.map((faq, i) => (
                <div key={i} className="bg-white border border-stone-200 rounded-xl p-4">
                  <dt className="text-sm font-semibold text-stone-800 mb-2">{faq.q}</dt>
                  <dd className="text-sm text-stone-600 leading-relaxed">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* 関連ブログ記事 */}
        {relatedBlogPosts.length > 0 && (
          <section className="border-t border-stone-200 bg-stone-50 py-10 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-5 text-center">
                関連ブログ記事
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {relatedBlogPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-1 bg-white border border-stone-200 hover:border-amber-300 rounded-xl p-4 transition-all hover:shadow-sm"
                  >
                    <p className="text-xs text-stone-400">{post.date}</p>
                    <p className="text-sm font-semibold text-stone-800 group-hover:text-amber-700 transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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
