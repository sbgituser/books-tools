/**
 * /works/[workId]/page.tsx
 *
 * workId は djb2 ハッシュベースの fileId。
 * public/data/works/{fileId}.json から WorkDetail を読み込んで表示する。
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { WorkDetail, Volume } from "@/types/work";

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
  const desc = [
    work.summaryShort,
    `${work.title}（${work.authorDisplay}）の${typeLabel}。`,
    work.discoveryTags.length > 0 ? work.discoveryTags.slice(0, 4).join("・") + "など。" : "",
    work.volumeCount > 1 ? `全${work.volumeCount}巻。` : "",
    "気分・雰囲気から本を探すなら Books Discover。",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/works/${fileId}` },
    openGraph: {
      title: `${work.title}｜${work.authorDisplay}`,
      description: desc,
      type: "book",
      images: work.coverImageUrl ? [work.coverImageUrl] : [],
      url: `${SITE_URL}/works/${fileId}`,
    },
  };
}

// ── サブコンポーネント ─────────────────────────────────────────────

function VolumeCard({ vol }: { vol: Volume }) {
  const amazonUrl = vol.isbn13
    ? `https://www.amazon.co.jp/s?k=${vol.isbn13}`
    : `https://www.amazon.co.jp/s?k=${encodeURIComponent(vol.title)}`;

  const imgSrc =
    vol.coverImageUrl ??
    (vol.googleBooksId
      ? `https://books.google.com/books/content?id=${vol.googleBooksId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
      : null);

  return (
    <div className="flex gap-3 p-3 bg-white border border-stone-200 rounded-xl hover:border-rose-300 hover:shadow-sm transition-all">
      {/* サムネイル */}
      <div className="relative w-12 flex-shrink-0 rounded overflow-hidden bg-stone-100" style={{ height: 72 }}>
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={vol.volumeLabel}
            fill
            sizes="48px"
            className="object-cover"
            unoptimized
          />
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

const TYPE_LABEL = { manga: "漫画", novel: "小説", other: "書籍" } as const;
const TYPE_COLOR = {
  manga: "bg-rose-100 text-rose-700 border-rose-200",
  novel: "bg-sky-100 text-sky-700 border-sky-200",
  other: "bg-stone-100 text-stone-600 border-stone-200",
} as const;
const STATUS_LABEL = { completed: "完結", ongoing: "連載中", unknown: "" } as const;

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId: fileId } = await params;
  const work = getWork(fileId);
  if (!work) notFound();

  const typeLabel = TYPE_LABEL[work.type] ?? "書籍";
  const typeColor = TYPE_COLOR[work.type] ?? TYPE_COLOR.other;
  const statusLabel = STATUS_LABEL[work.status];
  const amazonSearchUrl = `https://www.amazon.co.jp/s?k=${encodeURIComponent(work.title)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: work.title,
    author: work.authors.map((a) => ({ "@type": "Person", name: a })),
    ...(work.publisherMain
      ? { publisher: { "@type": "Organization", name: work.publisherMain } }
      : {}),
    url: `${SITE_URL}/works/${fileId}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* パンくず */}
          <nav aria-label="パンくず" className="text-xs text-stone-400 mb-6">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li><Link href="/" className="hover:text-rose-600">ホーム</Link></li>
              <li>/</li>
              <li><Link href="/discover" className="hover:text-rose-600">発見する</Link></li>
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
                    <Image
                      src={work.coverImageUrl}
                      alt={`${work.title} の表紙`}
                      fill
                      sizes="160px"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">{work.type === "manga" ? "📖" : "📕"}</span>
                    </div>
                  )}
                </div>
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

                {work.summaryShort && (
                  <p className="text-stone-600 text-sm leading-relaxed bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-4">
                    {work.summaryShort}
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
                    href={amazonSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Amazonで探す →
                  </a>
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-1.5 border border-stone-300 hover:border-rose-400 text-stone-600 hover:text-rose-700 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"
                  >
                    似た作品を探す
                  </Link>
                </div>
              </div>
            </div>
          </section>

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

          {/* ナビゲーション */}
          <div className="text-center">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-rose-600 transition-colors"
            >
              ← 発見ページに戻る
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
