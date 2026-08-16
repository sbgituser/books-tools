/**
 * /works/[workId]/page.tsx
 *
 * workId は djb2 ハッシュベースの fileId。
 * public/data/works/{fileId}.json から WorkDetail を読み込んで表示する。
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SimilarWorksSection from "@/components/works/SimilarWorksSection";
import {
  SITE_NAME,
  SITE_URL,
  amazonProductUrl,
  amazonSearchUrl,
  kindleSearchUrl,
  audibleSearchUrl,
  KINDLE_UNLIMITED_URL,
  AUDIBLE_FREE_TRIAL_URL,
} from "@/lib/site";
import { getBlogPostsForWork, formatDateLabel } from "@/lib/blog";
import { isWorkThinContent } from "@/lib/seoPolicy";
import { READING_SPEEDS } from "@/constants/readingTimeConfig";
import type { WorkDetail, Volume } from "@/types/work";
import type { SimilarWorks } from "@/types/similar-works";

// ── データアクセス ────────────────────────────────────────────────

function getWorksDir(): string {
  return join(process.cwd(), "public", "data", "works");
}

function getWork(fileId: string): WorkDetail | null {
  try {
    const path = join(getWorksDir(), `${fileId}.json`);
    return JSON.parse(readFileSync(path, "utf-8")) as WorkDetail;
  } catch {
    return null;
  }
}

function getSimilarWorks(fileId: string): SimilarWorks | null {
  try {
    const path = join(process.cwd(), "data", "similar-works", `${fileId}.json`);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf-8")) as SimilarWorks;
  } catch {
    return null;
  }
}

// ── 静的生成 ─────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const dir = getWorksDir();
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    return files.map((f) => ({ workId: f.replace(/\.json$/, "") }));
  } catch {
    return [];
  }
}

// ── メタデータ ────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ workId: string }>;
}): Promise<Metadata> {
  const { workId: fileId } = await params;
  const work = getWork(fileId);
  if (!work) return {};

  const title = `${work.title}｜${work.authorDisplay} | ${SITE_NAME}`;
  const typeLabel = work.type === "manga" ? "漫画" : "小説";
  const autoSummary = work.summaryShort?.trim() ? null : generateAutoSummary(work);
  const desc = [
    work.summaryShort || autoSummary,
    `${work.authorDisplay}のおすすめ${typeLabel}「${work.title}」。`,
    work.discoveryTags.length > 0 ? work.discoveryTags.slice(0, 4).join("・") + "など。" : "",
    work.volumeCount > 1 ? `全${work.volumeCount}巻。` : "",
    "あらすじ・Kindle試し読み・おすすめ度をチェック。",
  ]
    .filter(Boolean)
    .join(" ");

  // summaryShort・discoveryTags がなくても、巻数・ISBN・刊行状況が
  // 確定したデータシートには独自の情報価値があるため noindex にしない
  const isThinContent = isWorkThinContent({
    summaryShort: work.summaryShort,
    discoveryTags: work.discoveryTags ?? [],
    volumeCount: work.volumeCount,
    statusSource: work.statusSource,
    volumesWithIsbnCount: work.volumes.filter((v) => v.isbn13).length,
  });

  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/works/${fileId}` },
    ...(isThinContent ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: `${work.title}｜${work.authorDisplay}`,
      description: desc,
      type: "book",
      images: work.coverImageUrl
        ? [work.coverImageUrl]
        : [{ url: `/ogp/works/${fileId}.png`, width: 1200, height: 630 }],
      url: `${SITE_URL}/works/${fileId}`,
    },
  };
}

// ── サブコンポーネント ─────────────────────────────────────────────

function VolumeCard({ vol }: { vol: Volume }) {
  const amazonUrl = amazonProductUrl(vol.isbn13, vol.title);

  const imgSrc =
    vol.coverImageUrl ??
    (vol.googleBooksId
      ? `https://books.google.com/books/content?id=${vol.googleBooksId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
      : null);
  // Google Books の画像を表示する場合、該当書籍のGoogle Booksページへの
  // リンクが必須(Googleのガイドラインによる)
  const googleBooksUrl = vol.googleBooksId
    ? `https://books.google.com/books?id=${vol.googleBooksId}`
    : null;

  return (
    <div className="flex gap-3 p-3 bg-white border border-stone-200 rounded-xl hover:border-rose-300 hover:shadow-sm transition-all">
      {/* サムネイル */}
      <div className="relative w-12 flex-shrink-0 rounded overflow-hidden bg-stone-100" style={{ height: 72 }}>
        {imgSrc ? (
          googleBooksUrl ? (
            <a
              href={googleBooksUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${vol.volumeLabel}をGoogle Booksで見る`}
              className="absolute inset-0"
            >
              <Image
                src={imgSrc}
                alt={vol.volumeLabel}
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
                loading="lazy"
              />
            </a>
          ) : (
            <Image
              src={imgSrc}
              alt={vol.volumeLabel}
              fill
              sizes="48px"
              className="object-cover"
              unoptimized
              loading="lazy"
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-xs text-center p-1">
            📖
          </div>
        )}
      </div>

      {/* 情報 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-stone-800 line-clamp-1">{vol.volumeLabel}</p>
        <p className="text-xs text-stone-400 line-clamp-1 mb-1">{vol.title}</p>
        <div className="flex items-center gap-2">
          {vol.publishedDate && (
            <span className="text-xs text-stone-400">{vol.publishedDate.slice(0, 7)}</span>
          )}
          {vol.pageCount && (
            <span className="text-xs text-stone-400">{vol.pageCount}p</span>
          )}
        </div>
      </div>

      {/* Amazon */}
      <a
        href={amazonUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="self-center flex-shrink-0 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold px-2 py-1 rounded-lg transition-colors"
      >
        Amazon →
      </a>
    </div>
  );
}

// ── ページ ────────────────────────────────────────────────────────

const TAG_DESCRIPTIONS: Record<string, string> = {
  "考えさせられる": "読後に深く考えさせられる、テーマ性の高い作品です。",
  "一気読み": "続きが気になって止まらない、一気読み必至の展開が魅力です。",
  "感動": "心を揺さぶる感動的なストーリーが楽しめます。",
  "深い": "人間や社会の深い部分を描いた、読み応えのある作品です。",
  "読みやすい": "読みやすい文章とテンポの良さが特徴の作品です。",
  "世界観重視": "独特の世界観に没入できる、作り込まれた世界が魅力です。",
  "ファンタジー": "異世界・魔法・冒険など、ファンタジー要素が楽しめます。",
  "怖い": "恐怖・緊張感・不安感を楽しみたい方におすすめです。",
  "熱い": "燃えるような熱い展開・友情・成長が描かれた作品です。",
  "泣ける": "思わず涙がこぼれる、感涙必至の名作です。",
  "完結": "全巻揃った完結済み作品で、最後まで安心して読めます。",
  "心温まる": "優しい気持ちになれる、心温まるストーリーです。",
  "明るい": "明るく前向きな気持ちになれる作品です。",
  "バトル": "スリリングな戦闘シーンが楽しめるアクション作品です。",
  "笑える": "笑えるシーンが多い、コメディ要素の強い作品です。",
  "ダーク": "暗い世界観・重いテーマを描いた、深みのある作品です。",
  "日常系": "日常の何気ない場面を丁寧に描いた、ほのぼの系作品です。",
  "切ない": "切なく胸が締め付けられる、感情的な作品です。",
  "学べる": "知識・知恵・人生の教訓が得られる作品です。",
  "爽快": "読後に爽快感・達成感が味わえる作品です。",
  "やる気が出る": "読むと前向きになれる、モチベーションが上がる作品です。",
  "癒やし": "疲れた心を癒してくれる、ほっこりできる作品です。",
  "短編": "短編集で、隙間時間にサクッと読める作品です。",
  "絶望": "絶望・悲劇を描いた、重厚なドラマが楽しめます。",
  "優しい": "優しい雰囲気に包まれた、ほのぼのとした作品です。",
  "前向き": "前向きな気持ちになれる、希望を感じる作品です。",
  "穏やか": "穏やかな雰囲気の、ゆったりと楽しめる作品です。",
};

const TAG_TO_RECOMMEND: Record<string, string> = {
  "泣ける":       "感動的な物語で涙を流したい方",
  "感動":         "心を揺さぶる体験を求める方",
  "一気読み":     "続きが気になって止まらない作品を探している方",
  "考えさせられる": "読後に深く考察したい知的好奇心旺盛な方",
  "深い":         "読み応えのある重厚な物語を好む方",
  "熱い":         "熱い展開・友情・成長物語が好きな方",
  "ファンタジー": "異世界や魔法など夢のある世界観を楽しみたい方",
  "怖い":         "背筋が凍るような恐怖体験を求める方",
  "世界観重視":   "作り込まれた独特の世界観に没入したい方",
  "読みやすい":   "サクサク読める手軽な作品を探している方",
  "癒やし":       "日々の疲れを癒してくれる温かい作品を求める方",
  "心温まる":     "優しい気持ちになれるほっこりストーリーが好きな方",
  "完結":         "途中で終わる心配なく最後まで読み切りたい方",
  "ダーク":       "暗く重厚なストーリーに惹かれる方",
  "笑える":       "笑えるコメディ要素を楽しみたい方",
  "爽快":         "読後に清々しい達成感を味わいたい方",
  "明るい":       "前向きで明るい気持ちになれる作品が好きな方",
  "バトル":       "スリルのある戦闘アクションを楽しみたい方",
  "切ない":       "胸が締め付けられる切ない感情に浸りたい方",
  "日常系":       "日常の何気ない場面を大切に描いた作品が好きな方",
  "学べる":       "読書から知識や教訓を得たい方",
  "やる気が出る": "読んで前向きな気持ちになりたい方",
};

const TAG_TO_MOOD_SLUG: Record<string, { slug: string; label: string }> = {
  "泣ける":     { slug: "cry",          label: "泣ける漫画" },
  "感動":       { slug: "cry",          label: "泣ける漫画" },
  "癒やし":     { slug: "healing",      label: "癒やし漫画" },
  "心温まる":   { slug: "healing",      label: "癒やし漫画" },
  "熱い":       { slug: "hot",          label: "熱い漫画" },
  "爽快":       { slug: "hot",          label: "熱い漫画" },
  "切ない":     { slug: "heartwarming", label: "恋愛・切ない漫画" },
  "ダーク":     { slug: "dark",         label: "ダーク漫画" },
  "一気読み":   { slug: "binge",        label: "一気読み漫画" },
  "完結":       { slug: "completed",    label: "完結済み漫画" },
  "読みやすい": { slug: "easy",         label: "気軽に読める漫画" },
};

/**
 * summaryShort がない作品に対して、メタデータから自動的に紹介文を生成する。
 * SEO description とページ上の表示の両方で利用。
 */
function generateAutoSummary(work: WorkDetail): string {
  const typeLabel = work.type === "manga" ? "漫画" : "小説";
  const l2Label = L2_LABEL[work.l2Id ?? ""];
  const tags = work.discoveryTags.slice(0, 3);

  const parts: string[] = [];

  // ジャンル + タイプ
  if (l2Label) {
    parts.push(`${l2Label}ジャンルの${typeLabel}`);
  } else {
    parts.push(`おすすめの${typeLabel}`);
  }

  // タグベースの特徴
  if (tags.length > 0) {
    parts.push(`「${tags.join("」「")}」が特徴`);
  }

  // 巻数・完結
  if (work.volumeCount > 1) {
    const statusText = work.status === "completed" ? "完結済み・" : work.status === "ongoing" ? "連載中・" : "";
    parts.push(`${statusText}全${work.volumeCount}巻`);
  }

  return `${work.authorDisplay}による${parts.join("の")}。あらすじ・おすすめ度・Kindle情報をまとめて紹介。`;
}

const L2_LABEL: Record<string, string> = {
  mystery: "ミステリー",
  sf: "SF・サイエンスフィクション",
  fantasy: "ファンタジー",
  romance: "恋愛",
  youth: "青春",
  literary: "純文学",
  "historical-novel": "歴史・時代小説",
  horror: "ホラー",
  entertainment: "エンタメ",
  shonen: "少年漫画",
  shojo: "少女漫画",
  seinen: "青年漫画",
  general: "一般漫画",
};

const TYPE_LABEL = { manga: "漫画", novel: "小説", other: "書籍" } as const;
const TYPE_COLOR = {
  manga: "bg-rose-100 text-rose-700 border-rose-200",
  novel: "bg-sky-100 text-sky-700 border-sky-200",
  other: "bg-stone-100 text-stone-600 border-stone-200",
} as const;
const STATUS_LABEL = { completed: "完結", ongoing: "連載中", unknown: "" } as const;

// l2Id別カバーフォールバックのグラデーション設定
const L2_COVER_GRADIENT: Record<string, string> = {
  mystery:          "from-slate-700 to-blue-900",
  romance:          "from-pink-400 to-rose-600",
  sf:               "from-violet-600 to-indigo-800",
  literary:         "from-emerald-600 to-teal-800",
  horror:           "from-red-700 to-red-900",
  entertainment:    "from-amber-500 to-orange-600",
  fantasy:          "from-indigo-500 to-purple-700",
  shonen:           "from-orange-500 to-red-500",
  shojo:            "from-pink-300 to-rose-500",
  seinen:           "from-slate-500 to-gray-700",
  "historical-novel": "from-amber-700 to-stone-700",
  youth:            "from-cyan-500 to-teal-600",
  general:          "from-stone-400 to-stone-600",
};

function getCoverGradient(l2Id?: string): string {
  return L2_COVER_GRADIENT[l2Id ?? ""] ?? "from-stone-400 to-stone-600";
}

/**
 * 巻のpageCount合計から読了時間の目安を算出する。
 * pageCountが判明している巻が1件もない場合はnullを返す。
 */
function estimateReadingMinutes(work: WorkDetail): number | null {
  const totalPages = work.volumes.reduce((sum, v) => sum + (v.pageCount ?? 0), 0);
  if (totalPages === 0) return null;
  const speedConfig = READING_SPEEDS.find((s) => s.type === work.type);
  if (!speedConfig) return null;
  return Math.round(totalPages / speedConfig.speeds.average.pagesPerMinute);
}

function formatReadingMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `約${mins}分`;
  if (mins === 0) return `約${hours}時間`;
  return `約${hours}時間${mins}分`;
}

function generateWorkFAQs(work: WorkDetail): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  const typeLabel = work.type === "manga" ? "漫画" : "小説";

  if (work.volumeCount > 1) {
    const statusText =
      work.status === "completed" ? "（完結済み）" :
      work.status === "ongoing"   ? "（現在も連載中）" : "";
    faqs.push({
      q: `『${work.title}』は何巻まで出ていますか？`,
      a: `${work.volumeCount}巻まで発売されています${statusText}。`,
    });
  }

  if (work.l2Id && L2_LABEL[work.l2Id]) {
    const tagText = work.discoveryTags.length > 0
      ? `「${work.discoveryTags.slice(0, 3).join("」「")}」などの特徴があります。`
      : "";
    faqs.push({
      q: `『${work.title}』はどんな${typeLabel}ですか？`,
      a: `${L2_LABEL[work.l2Id]}ジャンルの${typeLabel}です。${tagText}`,
    });
  }

  faqs.push({
    q: `『${work.title}』はどこで読めますか？`,
    a: `Amazon・Kindleで${typeLabel}版が購入できます。Kindle Unlimitedの対象作品であれば読み放題でお楽しみいただけます${work.type === "novel" ? "。また、Audibleでオーディオブックとして聴くこともできます" : ""}。`,
  });

  const readingMinutes = estimateReadingMinutes(work);
  if (readingMinutes !== null) {
    faqs.push({
      q: `『${work.title}』を読むのにどれくらい時間がかかりますか？`,
      a: `全${work.volumeCount > 1 ? `${work.volumeCount}巻` : "巻"}で読了時間は${formatReadingMinutes(readingMinutes)}が目安です（平均的な読書速度で計算）。`,
    });
  }

  return faqs.slice(0, 4);
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId: fileId } = await params;
  const work = getWork(fileId);
  if (!work) notFound();

  const similar = getSimilarWorks(fileId);
  const relatedBlogPosts = getBlogPostsForWork(
    work.authors,
    work.type,
    work.discoveryTags,
    3,
  );

  const typeLabel = TYPE_LABEL[work.type] ?? "書籍";
  const typeColor = TYPE_COLOR[work.type] ?? TYPE_COLOR.other;
  const statusLabel = STATUS_LABEL[work.status];
  const workAmazonUrl = amazonSearchUrl(work.title);
  // Google Books APIの表紙画像を使う場合、Googleのガイドラインにより
  // 該当書籍のGoogle Booksページへのリンクを明示する必要がある
  const representativeGoogleBooksId = work.volumes.find((v) => v.googleBooksId)?.googleBooksId;
  const googleBooksUrl = representativeGoogleBooksId
    ? `https://books.google.com/books?id=${representativeGoogleBooksId}`
    : null;

  const workUrl = `${SITE_URL}/works/${fileId}`;

  const readingMinutes = estimateReadingMinutes(work);
  const workFAQs = generateWorkFAQs(work);
  const recommendsForUser = work.discoveryTags
    .map(tag => TAG_TO_RECOMMEND[tag])
    .filter(Boolean)
    .slice(0, 4) as string[];
  const moodLinks = work.type === "manga"
    ? [...new Map(
        work.discoveryTags
          .filter(tag => TAG_TO_MOOD_SLUG[tag])
          .map(tag => [TAG_TO_MOOD_SLUG[tag].slug, TAG_TO_MOOD_SLUG[tag]])
      ).values()].slice(0, 4)
    : [];
  const faqJsonLd = workFAQs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: workFAQs.map(faq => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  } : null;

  // JSON-LD 用の関連作品リンク
  const relatedLinks = similar?.groups
    .flatMap((g) => g.items)
    .slice(0, 5)
    .map((item) => ({
      "@type": "Book",
      name: item.title,
      author: { "@type": "Person", name: item.authorDisplay },
      url: `${SITE_URL}/works/${item.fileId}`,
    })) ?? [];

  // 複数巻シリーズは BookSeries、単巻は Book として構造化する。
  // 単巻の場合はISBNが判明していれば付与する(従来は巻データがJSON-LDに一切反映されていなかった)
  const singleVolumeIsbn = work.volumeCount === 1 ? work.volumes[0]?.isbn13 : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": work.volumeCount > 1 ? "BookSeries" : "Book",
    name: work.title,
    author: work.authors.map((a) => ({ "@type": "Person", name: a })),
    ...(work.publisherMain
      ? { publisher: { "@type": "Organization", name: work.publisherMain } }
      : {}),
    ...(work.summaryShort ? { description: work.summaryShort } : {}),
    ...(work.coverImageUrl ? { image: work.coverImageUrl } : {}),
    ...(work.volumeCount > 1
      ? { numberOfItems: work.volumeCount }
      : { bookFormat: "https://schema.org/EBook", ...(singleVolumeIsbn ? { isbn: singleVolumeIsbn } : {}) }),
    ...(work.l2Id ? { genre: L2_LABEL[work.l2Id] ?? work.l2Id } : {}),
    url: workUrl,
    ...(relatedLinks.length > 0 ? { isRelatedTo: relatedLinks } : {}),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: work.l2Id && L2_LABEL[work.l2Id]
      ? [
          { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "ジャンル", item: `${SITE_URL}/genre` },
          { "@type": "ListItem", position: 3, name: L2_LABEL[work.l2Id], item: `${SITE_URL}/genre/${work.l2Id}` },
          { "@type": "ListItem", position: 4, name: work.title, item: workUrl },
        ]
      : [
          { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "発見する", item: `${SITE_URL}/discover` },
          { "@type": "ListItem", position: 3, name: work.title, item: workUrl },
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
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* パンくず */}
          <nav aria-label="パンくず" className="text-xs text-stone-400 mb-6">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li><Link href="/" className="hover:text-rose-600">ホーム</Link></li>
              <li>/</li>
              {work.l2Id && L2_LABEL[work.l2Id] ? (
                <>
                  <li><Link href="/genre" className="hover:text-rose-600">ジャンル</Link></li>
                  <li>/</li>
                  <li><Link href={`/genre/${work.l2Id}`} className="hover:text-rose-600">{L2_LABEL[work.l2Id]}</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/discover" className="hover:text-rose-600">発見する</Link></li>
                </>
              )}
              <li>/</li>
              <li className="text-stone-600 font-medium truncate max-w-[200px]">{work.title}</li>
            </ol>
          </nav>

          {/* 作品メインカード */}
          <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-8 mb-8 shadow-sm">
            <div className="flex gap-5 sm:gap-8">

              {/* 書影 */}
              <div className="relative w-28 sm:w-40 flex-shrink-0">
                <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 shadow-md">
                  {work.coverImageUrl ? (
                    googleBooksUrl ? (
                      <a
                        href={googleBooksUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${work.title}をGoogle Booksで見る`}
                        className="absolute inset-0"
                      >
                        <Image
                          src={work.coverImageUrl}
                          alt={`${work.title} の表紙`}
                          fill
                          sizes="160px"
                          className="object-cover"
                          unoptimized
                          priority
                        />
                      </a>
                    ) : (
                      <Image
                        src={work.coverImageUrl}
                        alt={`${work.title} の表紙`}
                        fill
                        sizes="160px"
                        className="object-cover"
                        unoptimized
                        priority
                      />
                    )
                  ) : (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${getCoverGradient(work.l2Id)} p-2`}>
                      <span className="text-white text-2xl font-bold leading-tight text-center drop-shadow" style={{ fontFamily: "serif" }}>
                        {work.title.slice(0, 3)}
                      </span>
                      <span className="text-white/60 text-xs mt-1 text-center leading-tight line-clamp-2">
                        {work.authorDisplay}
                      </span>
                    </div>
                  )}
                </div>
                {googleBooksUrl && (
                  <a
                    href={googleBooksUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 block text-center text-[11px] text-stone-400 hover:text-rose-600 transition-colors"
                  >
                    Google Booksで見る →
                  </a>
                )}
              </div>

              {/* 情報 */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${typeColor}`}>
                    {typeLabel}
                  </span>
                  {statusLabel && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      work.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {statusLabel}
                    </span>
                  )}
                  {work.volumeCount > 1 && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                      全{work.volumeCount}巻
                    </span>
                  )}
                  {readingMinutes !== null && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">
                      📖 読了目安 {formatReadingMinutes(readingMinutes)}
                    </span>
                  )}
                </div>

                <h1 className="text-xl sm:text-3xl font-bold text-stone-900 leading-tight mb-2">
                  {work.title}
                </h1>
                <p className="text-stone-600 font-medium text-sm sm:text-base mb-1">
                  {work.authorDisplay}
                </p>
                {work.publisherMain && (
                  <p className="text-stone-400 text-xs mb-4">{work.publisherMain}</p>
                )}

                {(work.summaryShort || (!work.summaryShort && work.discoveryTags.length > 0)) && (
                  <p className="text-stone-600 text-sm leading-relaxed bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-4">
                    {work.summaryShort || generateAutoSummary(work)}
                  </p>
                )}

                {work.discoveryTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {work.discoveryTags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/discover?tag=${encodeURIComponent(tag)}`}
                        className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <a
                    href={workAmazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Amazonで探す →
                  </a>
                  <a
                    href={kindleSearchUrl(work.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"
                  >
                    📱 Kindle版
                  </a>
                  {work.type === "novel" && (
                    <a
                      href={audibleSearchUrl(work.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"
                    >
                      🎧 Audible版
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 作品の特徴（summaryShortがない場合に補足テキストを表示） */}
          {!work.summaryShort && work.discoveryTags.length > 0 && (
            <section className="mb-8 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-bold text-stone-700 mb-3">この作品の特徴</h2>
              <ul className="space-y-2">
                {work.discoveryTags.map((tag) =>
                  TAG_DESCRIPTIONS[tag] ? (
                    <li key={tag} className="flex gap-2 text-sm text-stone-600">
                      <span className="text-rose-500 font-bold shrink-0">#{tag}</span>
                      <span>{TAG_DESCRIPTIONS[tag]}</span>
                    </li>
                  ) : null
                )}
              </ul>
              {work.l2Id && L2_LABEL[work.l2Id] && (
                <p className="mt-3 text-sm text-stone-500">
                  ジャンル: <Link href={`/genre/${work.l2Id}`} className="text-rose-600 hover:underline font-medium">{L2_LABEL[work.l2Id]}</Link>のおすすめ{work.type === "manga" ? "漫画" : "小説"}です。
                </p>
              )}
            </section>
          )}

          {/* こんな人におすすめ */}
          {recommendsForUser.length > 0 && (
            <section className="mb-8 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-bold text-stone-700 mb-3">こんな人におすすめ</h2>
              <ul className="space-y-2">
                {recommendsForUser.map((text, i) => (
                  <li key={i} className="flex gap-2 text-sm text-stone-600 items-start">
                    <span className="text-rose-500 font-bold shrink-0">✓</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 気分別ページへのリンク（漫画のみ）*/}
          {moodLinks.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-bold text-stone-500 mb-3">同じ気分の漫画を探す</h2>
              <div className="flex flex-wrap gap-2">
                {moodLinks.map(({ slug, label }) => (
                  <Link
                    key={slug}
                    href={`/manga/by-mood/${slug}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors font-medium"
                  >
                    {label} を見る →
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 巻一覧 */}
          {work.volumes.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-bold text-stone-800 mb-4">
                巻一覧
                <span className="ml-2 text-sm font-normal text-stone-400">({work.volumes.length}件)</span>
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {work.volumes.map((vol) => (
                  <VolumeCard key={vol.volumeId} vol={vol} />
                ))}
              </div>
            </section>
          )}

          {/* 読み放題・聴き放題 CTA */}
          <section className="mb-8 grid gap-3 sm:grid-cols-2">
            <a
              href={KINDLE_UNLIMITED_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-sky-50 to-sky-100 border border-sky-200 rounded-xl hover:shadow-md transition-shadow group"
            >
              <span className="text-3xl">📱</span>
              <div>
                <p className="text-sm font-bold text-sky-800 group-hover:text-sky-900">
                  Kindle Unlimited で読み放題
                </p>
                <p className="text-xs text-sky-600">
                  200万冊以上が読み放題。30日間無料体験あり
                </p>
              </div>
            </a>
            {work.type === "novel" && (
              <a
                href={AUDIBLE_FREE_TRIAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:shadow-md transition-shadow group"
              >
                <span className="text-3xl">🎧</span>
                <div>
                  <p className="text-sm font-bold text-orange-800 group-hover:text-orange-900">
                    Audible で聴く読書
                  </p>
                  <p className="text-xs text-orange-600">
                    プロの朗読で楽しむ。30日間無料体験あり
                  </p>
                </div>
              </a>
            )}
          </section>

          {/* FAQ */}
          {workFAQs.length > 0 && (
            <section className="mb-8 bg-white border border-stone-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-base font-bold text-stone-700 mb-4">よくある質問</h2>
              <dl className="space-y-4">
                {workFAQs.map((faq, i) => (
                  <div key={i} className={i < workFAQs.length - 1 ? "border-b border-stone-100 pb-4" : ""}>
                    <dt className="text-sm font-semibold text-stone-800 mb-1">{faq.q}</dt>
                    <dd className="text-sm text-stone-600 leading-relaxed">{faq.a}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* 関連ブログ記事 */}
          {relatedBlogPosts.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-bold text-stone-800 mb-4">
                関連するブログ記事
              </h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {relatedBlogPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-1 bg-white border border-stone-200 hover:border-rose-300 rounded-xl p-4 transition-all hover:shadow-sm"
                  >
                    <p className="text-xs text-stone-400">
                      {formatDateLabel(post.date)} · {post.readingText}
                    </p>
                    <p className="text-sm font-semibold text-stone-800 group-hover:text-rose-700 transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 似た作品セクション */}
          {similar && similar.groups.length > 0 && (
            <SimilarWorksSection similar={similar} />
          )}

          {/* 回遊導線 */}
          <section className="mb-8 grid sm:grid-cols-2 gap-3">
            <Link
              href="/tools/similar-books"
              className="group flex items-center gap-3 bg-violet-50 border border-violet-200 hover:border-violet-400 rounded-xl px-5 py-4 transition-all"
            >
              <span className="text-2xl" aria-hidden="true">📚</span>
              <div>
                <p className="text-sm font-bold text-violet-800 group-hover:text-violet-900">この作品が好きなら</p>
                <p className="text-xs text-violet-600">似ている本を探すツールで類似作品を発見</p>
              </div>
            </Link>
            <Link
              href="/tools/book-quiz"
              className="group flex items-center gap-3 bg-rose-50 border border-rose-200 hover:border-rose-400 rounded-xl px-5 py-4 transition-all"
            >
              <span className="text-2xl" aria-hidden="true">🔮</span>
              <div>
                <p className="text-sm font-bold text-rose-800 group-hover:text-rose-900">おすすめ本診断</p>
                <p className="text-xs text-rose-600">あなたにぴったりの本を5問で提案</p>
              </div>
            </Link>
          </section>

          {/* ナビゲーション */}
          <div className="flex justify-center gap-4">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-rose-600 transition-colors"
            >
              ← 発見ページに戻る
            </Link>
            {work.l2Id && (
              <Link
                href={`/genre/${work.l2Id}`}
                className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-amber-600 transition-colors"
              >
                同ジャンルの作品を見る →
              </Link>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
