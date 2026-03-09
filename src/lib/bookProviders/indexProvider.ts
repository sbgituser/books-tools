import type { Book, SimilarityResult } from "./types";
import { CATEGORY_TREE, type L1Category, type Category } from "../categories";

// ── 型定義 ───────────────────────────────────────────────────────

interface BookIndex {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  language?: string;
  categories: string[];
  subjects?: string[];
  keywords: string[];
  pageCount?: number;
  estimatedReadingHours?: number;
  thumbnailUrl?: string;
  searchableText: string;
  relatedBookIds?: string[];
  updatedAt: string;
}

interface MetaData {
  l1Counts: Record<string, number>;
  pathCounts: Record<string, number>;
  pathThumbs: Record<string, string[]>;
}

export type SubcatResult = {
  cat: Category;
  count: number;
  hasDeeper: boolean;
  sampleThumbnails: string[];
};

// ── ユーティリティ ────────────────────────────────────────────────

function matchesKeywords(raw: BookIndex, keywords: string[]): boolean {
  if (keywords.length === 0) return false;
  const text = `${raw.title} ${raw.searchableText ?? ""}`.toLowerCase();
  return keywords.some(kw => text.includes(kw.toLowerCase()));
}

function toBook(b: BookIndex): Book {
  const description = [...(b.subjects ?? []), ...b.keywords.slice(0, 3)].slice(0, 5).join("、");
  const amazonUrl = b.isbn13
    ? `https://www.amazon.co.jp/s?k=${b.isbn13}`
    : `https://www.amazon.co.jp/s?k=${encodeURIComponent(b.title)}`;
  return {
    id: b.id,
    title: b.title,
    author: b.authors.join(" / "),
    category: b.categories[0] ?? "",
    tags: b.keywords.slice(0, 8),
    isKindle: false,
    kindlePrice: null,
    paperbackPrice: null,
    amazonUrl,
    description,
    publishedYear: b.publishedDate ? parseInt(b.publishedDate.slice(0, 4)) : 0,
    thumbnailUrl: b.thumbnailUrl,
    pageCount: b.pageCount,
    estimatedReadingHours: b.estimatedReadingHours,
  };
}

function resolveSubcategories(l1: L1Category, catIds: string[]): Category[] {
  let cats: Category[] = l1.subcategories;
  for (const catId of catIds) {
    if (catId === "other") return [];
    const found = cats.find(c => c.id === catId);
    if (!found) return [];
    cats = found.subcategories ?? [];
  }
  return cats;
}

// ── L1別インデックス構築（ローカル pathMap）────────────────────────

interface L1Index {
  books: Book[];
  bookById: Map<string, Book>;
  rawById: Map<string, BookIndex>;
  relatedMap: Map<string, string[]>;
  pathMap: Map<string, Book[]>; // "l2" | "l2:l3" | ... (L1プレフィックスなし)
}

function buildPathMap(
  books: Book[],
  rawById: Map<string, BookIndex>,
  cats: Category[],
  pathPrefix: string,
  pathMap: Map<string, Book[]>,
): void {
  const matchedIds = new Set<string>();

  for (const cat of cats) {
    if (cat.keywords.length === 0) continue;
    const matched = books.filter(b => {
      const raw = rawById.get(b.id);
      return raw && matchesKeywords(raw, cat.keywords);
    });
    if (matched.length === 0) continue;

    const catPath = pathPrefix ? `${pathPrefix}:${cat.id}` : cat.id;
    pathMap.set(catPath, matched);
    matched.forEach(b => matchedIds.add(b.id));

    if (cat.subcategories?.length) {
      buildPathMap(matched, rawById, cat.subcategories, catPath, pathMap);
    }
  }
}

function buildL1Index(l1Id: string, rawBooks: BookIndex[]): L1Index {
  const l1 = CATEGORY_TREE.find(c => c.id === l1Id)!;
  const books: Book[] = [];
  const bookById = new Map<string, Book>();
  const rawById = new Map<string, BookIndex>();
  const relatedMap = new Map<string, string[]>();

  for (const raw of rawBooks) {
    if (!raw.title || !raw.authors.length) continue;
    const book = toBook(raw);
    books.push(book);
    bookById.set(book.id, book);
    rawById.set(book.id, raw);
    if (raw.relatedBookIds?.length) relatedMap.set(book.id, raw.relatedBookIds);
  }

  const pathMap = new Map<string, Book[]>();
  buildPathMap(books, rawById, l1.subcategories, "", pathMap);

  return { books, bookById, rawById, relatedMap, pathMap };
}

// ── IndexProvider ─────────────────────────────────────────────────

class IndexProvider {
  private meta: MetaData | null = null;
  private bookL1: Record<string, string> | null = null;
  private l1Cache = new Map<string, L1Index>();

  private async loadMeta(): Promise<MetaData> {
    if (this.meta) return this.meta;
    const res = await fetch("/data/meta.json");
    this.meta = (await res.json()) as MetaData;
    return this.meta;
  }

  private async loadBookL1(): Promise<Record<string, string>> {
    if (this.bookL1) return this.bookL1;
    const res = await fetch("/data/book-l1.json");
    this.bookL1 = (await res.json()) as Record<string, string>;
    return this.bookL1;
  }

  private async loadL1(l1Id: string): Promise<L1Index> {
    if (this.l1Cache.has(l1Id)) return this.l1Cache.get(l1Id)!;
    const res = await fetch(`/data/books-${l1Id}.json`);
    const rawBooks = (await res.json()) as BookIndex[];
    const index = buildL1Index(l1Id, rawBooks);
    this.l1Cache.set(l1Id, index);
    return index;
  }

  // ── L1カテゴリ一覧 ──────────────────────────────────────────────

  async getL1Categories(): Promise<{ l1: L1Category; count: number }[]> {
    const meta = await this.loadMeta();
    return CATEGORY_TREE
      .map(l1 => ({ l1, count: meta.l1Counts[l1.id] ?? 0 }))
      .filter(x => x.count > 0)
      .sort((a, b) => b.count - a.count);
  }

  // ── サブカテゴリ一覧（meta.json のみ使用・高速）─────────────────

  async getSubcategories(l1Id: string, catIds: string[]): Promise<SubcatResult[]> {
    const meta = await this.loadMeta();
    const l1 = CATEGORY_TREE.find(c => c.id === l1Id);
    if (!l1) return [];

    const subcats = resolveSubcategories(l1, catIds);
    const parentKey = [l1Id, ...catIds].join(":");
    const results: SubcatResult[] = [];

    for (const cat of subcats) {
      const catKey = `${parentKey}:${cat.id}`;
      const count = meta.pathCounts[catKey] ?? 0;
      if (count === 0) continue;

      const sampleThumbnails = meta.pathThumbs[catKey] ?? [];
      const hasDeeper = cat.subcategories?.some(sub =>
        (meta.pathCounts[`${catKey}:${sub.id}`] ?? 0) > 0
      ) ?? false;

      results.push({ cat, count, hasDeeper, sampleThumbnails });
    }

    return results;
  }

  // ── 冊数（meta.json のみ・高速）────────────────────────────────

  async getBookCountByPath(l1Id: string, catIds: string[]): Promise<number> {
    const meta = await this.loadMeta();
    if (catIds.length === 0) return meta.l1Counts[l1Id] ?? 0;
    return meta.pathCounts[[l1Id, ...catIds].join(":")] ?? 0;
  }

  // ── 書籍一覧（L1チャンク遅延ロード）──────────────────────────────

  async getBooksByPath(l1Id: string, catIds: string[]): Promise<Book[]> {
    const index = await this.loadL1(l1Id);
    const books: Book[] =
      catIds.length === 0
        ? index.books
        : (index.pathMap.get(catIds.join(":")) ?? []);
    return [...books].sort((a, b) => a.title.localeCompare(b.title, "ja"));
  }

  // ── 類似本（クロスL1対応）────────────────────────────────────────

  async getSimilarBooks(bookId: string): Promise<SimilarityResult[]> {
    const [bookL1] = await Promise.all([this.loadBookL1()]);
    const sourceL1Id = bookL1[bookId];
    if (!sourceL1Id) return [];

    const sourceIndex = await this.loadL1(sourceL1Id);
    const source = sourceIndex.bookById.get(bookId);
    if (!source) return [];

    const sourceTags = new Set(source.tags);
    const sourceAuthors = new Set(source.author.split(" / ").map(a => a.trim()));
    const relatedIds = sourceIndex.relatedMap.get(bookId) ?? [];

    // 必要な L1 チャンクをまとめてロード
    const neededL1s = new Set(relatedIds.map(id => bookL1[id]).filter(Boolean));
    await Promise.all([...neededL1s].map(id => this.loadL1(id)));

    return relatedIds
      .map(id => {
        const l1Id = bookL1[id];
        const book = l1Id ? this.l1Cache.get(l1Id)?.bookById.get(id) : undefined;
        if (!book) return null;

        const reasons: string[] = [];
        const bookAuthors = book.author.split(" / ").map(a => a.trim());
        const sharedAuthors = bookAuthors.filter(a => sourceAuthors.has(a));
        if (sharedAuthors.length > 0) reasons.push("同著者");
        if (book.category === source.category) reasons.push(book.category);
        const shared = book.tags.filter(t => sourceTags.has(t));
        if (shared.length > 0) reasons.push(shared.slice(0, 2).join("・"));

        return { book, score: 1, reasons: reasons.slice(0, 3) };
      })
      .filter((r): r is SimilarityResult => r !== null);
  }
}

export const indexProvider = new IndexProvider();
