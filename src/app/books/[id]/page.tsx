import { readFileSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCoverImage from "@/components/BookCoverImage";
import BookDetailSections from "@/components/BookDetailSections";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { CATEGORY_TREE } from "@/lib/categories";

// ── 型 ───────────────────────────────────────────────────────────

interface BookIndex {
  id: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  pageCount?: number;
  estimatedReadingHours?: number;
  thumbnailUrl?: string;
  keywords: string[];
  subjects?: string[];
  pathIds: string[];
  sourceIds?: { googleBooksId?: string };
}

type Params = { id: string };

// ── データアクセス ────────────────────────────────────────────────

function getAllBooks(): BookIndex[] {
  const path = join(process.cwd(), "src/data/books.index.json");
  return JSON.parse(readFileSync(path, "utf-8")) as BookIndex[];
}

function getBookById(id: string): BookIndex | undefined {
  return getAllBooks().find((b) => b.id === id);
}

function l1Label(l1Id: string): string {
  return CATEGORY_TREE.find((c) => c.id === l1Id)?.label ?? "";
}

// ── 静的生成 ─────────────────────────────────────────────────────

export async function generateStaticParams() {
  return getAllBooks().map((b) => ({ id: b.id }));
}

// ── メタデータ ────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = getBookById(id);
  if (!book) return {};

  const author = book.authors.join("、");
  const title = `${book.title}｜${author} | ${SITE_NAME}`;
  const desc = [
    book.subtitle,
    `${book.title}（${author}）の詳細情報。`,
    book.subjects?.slice(0, 3).join("、"),
    "類似本・同著者作品・ジャンル関連本を探せます。",
  ]
    .filter(Boolean)
    .join(" ");

  const googleBooksId = book.sourceIds?.googleBooksId;
  const image =
    book.thumbnailUrl ??
    (googleBooksId
      ? `https://books.google.com/books/content?id=${googleBooksId}&printsec=frontcover&img=1&zoom=2&source=gbs_api`
      : undefined);

  return {
    title,
    description: desc,
    alternates: {
      canonical: `${SITE_URL}/books/${encodeURIComponent(id)}`,
    },
    openGraph: {
      title: `${book.title}｜${author}`,
      description: desc,
      type: "book",
      images: image ? [image] : [],
      url: `${SITE_URL}/books/${encodeURIComponent(id)}`,
    },
    twitter: {
      card: "summary",
      title: `${book.title}｜${author}`,
      description: desc,
    },
  };
}

// ── ページ ────────────────────────────────────────────────────────

export default async function BookDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const book = getBookById(id);
  if (!book) notFound();

  const googleBooksId = book.sourceIds?.googleBooksId;
  const author = book.authors.join(" / ");
  const publishedYear = book.publishedDate
    ? parseInt(book.publishedDate.slice(0, 4))
    : null;
  const l1Id = book.pathIds?.[0] ?? "";
  const categoryLabel = l1Id ? l1Label(l1Id) : null;

  const amazonUrl = book.isbn13
    ? `https://www.amazon.co.jp/s?k=${book.isbn13}`
    : `https://www.amazon.co.jp/s?k=${encodeURIComponent(book.title)}`;

  // schema.org/Book 構造化データ
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: book.authors.map((a) => ({ "@type": "Person", name: a })),
    ...(book.publisher
      ? { publisher: { "@type": "Organization", name: book.publisher } }
      : {}),
    ...(book.isbn13 ? { isbn: book.isbn13 } : {}),
    ...(book.publishedDate ? { datePublished: book.publishedDate } : {}),
    ...(book.pageCount ? { numberOfPages: book.pageCount } : {}),
    url: `${SITE_URL}/books/${encodeURIComponent(id)}`,
  };

  // クライアントコンポーネントへ渡すデータ
  const bookData = {
    id: book.id,
    title: book.title,
    authors: book.authors,
    keywords: book.keywords,
    pathIds: book.pathIds ?? [],
    l1Id,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* パンくずリスト */}
          <nav aria-label="パンくず" className="text-xs text-stone-500 mb-6">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li>
                <Link href="/" className="hover:text-amber-700">ホーム</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/similar-books" className="hover:text-amber-700">書籍ブラウザ</Link>
              </li>
              {categoryLabel && (
                <>
                  <li>/</li>
                  <li className="text-stone-600">{categoryLabel}</li>
                </>
              )}
              <li>/</li>
              <li className="text-stone-700 font-medium truncate max-w-[180px] sm:max-w-xs">
                {book.title}
              </li>
            </ol>
          </nav>

          {/* 書籍基本情報 */}
          <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-8 mb-8 shadow-sm">
            <div className="flex gap-5 sm:gap-8">

              {/* 書影 */}
              <BookCoverImage
                title={book.title}
                category={categoryLabel ?? ""}
                thumbnailUrl={book.thumbnailUrl}
                googleBooksId={googleBooksId}
                isbn13={book.isbn13}
                size="lg"
              />

              {/* 情報 */}
              <div className="flex-1 min-w-0">
                {categoryLabel && (
                  <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 mb-2">
                    {categoryLabel}
                  </span>
                )}

                <h1 className="text-xl sm:text-3xl font-bold text-stone-900 leading-tight mb-1">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-stone-500 text-sm mb-2">{book.subtitle}</p>
                )}
                <p className="text-stone-700 font-medium text-sm sm:text-base mb-4">
                  {author}
                </p>

                {/* 書誌情報 */}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-5">
                  {book.publisher && (
                    <>
                      <dt className="text-stone-400 text-xs">出版社</dt>
                      <dd className="text-stone-700 text-xs">{book.publisher}</dd>
                    </>
                  )}
                  {publishedYear && (
                    <>
                      <dt className="text-stone-400 text-xs">出版年</dt>
                      <dd className="text-stone-700 text-xs">{publishedYear}年</dd>
                    </>
                  )}
                  {book.pageCount && (
                    <>
                      <dt className="text-stone-400 text-xs">ページ数</dt>
                      <dd className="text-stone-700 text-xs">{book.pageCount}ページ</dd>
                    </>
                  )}
                  {book.estimatedReadingHours && (
                    <>
                      <dt className="text-stone-400 text-xs">読書時間</dt>
                      <dd className="text-stone-700 text-xs">
                        約{book.estimatedReadingHours}時間
                      </dd>
                    </>
                  )}
                </dl>

                {/* キーワードタグ */}
                {book.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {book.keywords
                      .filter((k) => k !== "ブログ掲載書籍")
                      .slice(0, 8)
                      .map((kw) => (
                        <span
                          key={kw}
                          className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600"
                        >
                          {kw}
                        </span>
                      ))}
                  </div>
                )}

                {/* CTAボタン */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <a
                    href={amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-colors"
                  >
                    Amazonで見る →
                  </a>
                  <Link
                    href={`/tools/book-compare?baseId=${encodeURIComponent(book.id)}`}
                    className="inline-flex items-center gap-1.5 border border-stone-300 hover:border-amber-400 text-stone-700 hover:text-amber-700 font-semibold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-colors"
                  >
                    この本を比較する ⚖️
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* 動的セクション (類似本・著者・ジャンル・比較・映像化・キーワード) */}
          <BookDetailSections book={bookData} />

        </div>
      </main>
      <Footer />
    </>
  );
}
