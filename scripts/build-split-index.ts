/**
 * build-split-index.ts
 *
 * books.index.json を L1カテゴリ別に分割し、public/data/ に書き出す。
 *
 * 出力ファイル:
 *   public/data/meta.json          … L1/パス別の冊数・サムネ（カテゴリ画面で使用）
 *   public/data/book-l1.json       … bookId → l1Id マップ（類似本クロスL1検索用）
 *   public/data/books-{l1id}.json  … L1別の BookIndex 配列（書籍一覧画面で遅延ロード）
 */

import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
import { CATEGORY_TREE, type Category } from "../src/lib/categories";
import { resolveCategoryPath } from "../src/lib/categoryClassifier";

// ── 型定義 ───────────────────────────────────────────────────────

interface SourceBookIndex {
  id: string;
  title: string;
  authors: string[];
  subtitle?: string;
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  categories: string[];
  subjects?: string[];
  keywords: string[];
  pageCount?: number;
  estimatedReadingHours?: number;
  thumbnailUrl?: string;
  searchableText: string;
  relatedBookIds?: string[];
  sourceIds?: {
    googleBooksId?: string;
  };
}

interface SplitBookIndex {
  id: string;
  title: string;
  authors: string[];
  subtitle?: string;
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  subjects?: string[];
  keywords: string[];
  pageCount?: number;
  estimatedReadingHours?: number;
  thumbnailUrl?: string;
  relatedBookIds?: string[];
  sourceIds?: {
    googleBooksId?: string;
  };
  pathIds: string[];
}

// ── カテゴリマッピング ─────────────────────────────────────────────

/** カテゴリ文字列から L1 の mappedLabel を返す（第1段階） */
function mapCategoryString(cat: string): string | null {
  const c = cat.toLowerCase();
  if (c.includes("ビジネス") || c.includes("経済") || c.includes("経営")) return "ビジネス・経済";
  if (c.includes("コンピュータ") || c.includes("テクノロジー"))            return "テクノロジー・AI";
  if (c.includes("自己啓発"))                                              return "自己啓発";
  if (c.includes("投資") || c.includes("金融") || c.includes("財政"))      return "投資・お金";
  if (c.includes("心理"))                                                  return "心理学";
  if (c.includes("小説") || c.includes("フィクション") || c.includes("文学")) return "小説・文学";
  if (c.includes("哲学"))                                                  return "哲学・思想";
  if (c.includes("歴史") || c.includes("社会科学") || c.includes("社会")) return "歴史・社会";
  if (c.includes("科学") || c.includes("数学") || c.includes("物理"))      return "科学・教養";
  if (c.includes("健康") || c.includes("医学") || c.includes("スポーツ")) return "科学・教養";
  if (c.includes("漫画") || c.includes("コミック"))                        return "漫画";
  if (c.includes("business") || c.includes("economics"))                  return "ビジネス・経済";
  if (c.includes("computer") || c.includes("technology") || c.includes("engineering")) return "テクノロジー・AI";
  if (c.includes("self-help") || c.includes("self help"))                 return "自己啓発";
  if (c.includes("psychology"))                                            return "心理学";
  if (c.includes("fiction") || c.includes("literature"))                  return "小説・文学";
  if (c.includes("philosophy"))                                            return "哲学・思想";
  if (c.includes("history") || c.includes("social science"))              return "歴史・社会";
  if (c.includes("science") || c.includes("mathematics"))                 return "科学・教養";
  if (c.includes("health") || c.includes("medical"))                      return "科学・教養";
  if (c.includes("comic") || c.includes("graphic novel") || c.includes("manga")) return "漫画";
  return null;
}

// カテゴリが空・不明なときにタイトル+本文のキーワードで分類（第2段階）
const L1_TEXT_RULES: { label: string; words: string[] }[] = [
  { label: "テクノロジー・AI",   words: ["プログラミング", "python", "javascript", "typescript", "java", "c言語", "php", "ruby", "go言語", "swift", "コンピュータ", "エンジニア", "aws", "azure", "gcp", "docker", "linux", "sql", "データベース", "ネットワーク", "セキュリティ", "ai", "機械学習", "ディープラーニング", "chatgpt", "gpt", "llm", "データサイエンス", "itパスポート", "基本情報", "dx", "デジタル", "クラウド", "devops", "iot", "excel vba", "rpa", "自動化", "web開発", "フロントエンド", "バックエンド"] },
  { label: "ビジネス・経済",     words: ["ビジネス", "経営", "マネジメント", "マーケティング", "起業", "経済", "会計", "財務", "簿記", "mba", "戦略", "コンサル", "リーダー", "チーム", "組織", "仕事術", "働き方", "スタートアップ", "ベンチャー", "生産性", "仕事力"] },
  { label: "自己啓発",          words: ["自己啓発", "習慣", "成功", "メンタル", "コミュニケーション", "人間関係", "モチベーション", "マインドセット", "思考法", "問題解決"] },
  { label: "投資・お金",        words: ["投資", "nisa", "お金", "資産", "株式", "fx", "節約", "貯金", "財テク", "インデックス", "積立", "家計"] },
  { label: "心理学",            words: ["心理学", "認知バイアス", "行動経済学", "脳科学", "精神", "カウンセリング"] },
  { label: "小説・文学",        words: ["小説", "物語", "フィクション", "推理", "ミステリ", "sf", "ファンタジー", "恋愛小説", "直木賞", "芥川賞"] },
  { label: "哲学・思想",        words: ["哲学", "思想", "倫理", "宗教", "仏教", "禅", "道教", "儒教", "ニーチェ", "カント"] },
  { label: "歴史・社会",        words: ["歴史", "社会", "政治", "世界史", "日本史", "近現代", "地政学", "民主主義", "格差", "環境"] },
  { label: "科学・教養",        words: ["科学", "物理", "数学", "生物", "宇宙", "統計", "量子", "進化", "遺伝子", "天文"] },
  { label: "漫画",              words: ["漫画", "コミック", "manga", "まんが"] },
];

function classifyByText(text: string): string | null {
  const t = text.toLowerCase();
  for (const rule of L1_TEXT_RULES) {
    if (rule.words.some(w => t.includes(w))) return rule.label;
  }

  // 最終フォールバック: L1語彙の最多一致を採用（必ずどこかに寄せる）
  let best: { label: string; score: number } | null = null;
  for (const rule of L1_TEXT_RULES) {
    const score = rule.words.reduce((acc, w) => acc + (t.includes(w) ? 1 : 0), 0);
    if (!best || score > best.score) best = { label: rule.label, score };
  }
  if (best) return best.label;

  return null;
}

/** 書籍を L1 mappedLabel に分類する（カテゴリ文字列 → テキストフォールバック） */
function resolveL1Label(raw: SourceBookIndex): string | null {
  // まずカテゴリ文字列を全件評価（配列先頭バイアスを避ける）
  const labelScores = new Map<string, number>();
  for (const cat of raw.categories) {
    const result = mapCategoryString(cat);
    if (!result) continue;
    labelScores.set(result, (labelScores.get(result) ?? 0) + 1);
  }

  if (labelScores.size > 0) {
    const ranked = [...labelScores.entries()].sort((a, b) => b[1] - a[1]);
    if (ranked.length === 1) return ranked[0][0];

    // 同率時は本文の語彙一致で最終決定
    const text = `${raw.title} ${(raw.keywords ?? []).join(" ")} ${raw.searchableText ?? ""}`;
    const byText = classifyByText(text);
    if (byText && ranked.some(([label]) => label === byText)) return byText;

    return ranked[0][0];
  }

  // フォールバック: タイトル + keywords + searchableText
  const text = `${raw.title} ${(raw.keywords ?? []).join(" ")} ${raw.searchableText ?? ""}`;
  return classifyByText(text);
}

// ── パス別インデックス構築 ────────────────────────────────────────

function buildPathIndexes(
  books: SplitBookIndex[],
  cats: Category[],
  pathPrefix: string,
  pathCounts: Record<string, number>,
  pathThumbs: Record<string, string[]>,
): void {
  const thumbSets: Record<string, Set<string>> = {};

  for (const b of books) {
    const ids = b.pathIds;
    if (ids.length === 0) continue;

    for (let i = 0; i < ids.length; i++) {
      const p = `${pathPrefix}:${ids.slice(0, i + 1).join(":")}`;
      pathCounts[p] = (pathCounts[p] ?? 0) + 1;
      if (!thumbSets[p]) thumbSets[p] = new Set<string>();
      if (b.thumbnailUrl && thumbSets[p].size < 3) thumbSets[p].add(b.thumbnailUrl);
    }
  }

  for (const p of Object.keys(thumbSets)) {
    pathThumbs[p] = Array.from(thumbSets[p]);
  }
}

// ── メイン処理 ────────────────────────────────────────────────────

const rawData = JSON.parse(
  readFileSync(join(process.cwd(), "src/data/books.index.json"), "utf-8"),
) as SourceBookIndex[];

const outDir = join(process.cwd(), "public", "data");
mkdirSync(outDir, { recursive: true });

// L1別に書籍を振り分け
const l1Groups = new Map<string, SplitBookIndex[]>(); // l1Id → books
const bookL1: Record<string, string> = {};

let skipped = 0;
for (const raw of rawData) {
  if (!raw.title) continue;

  const mappedLabel = resolveL1Label(raw);
  if (!mappedLabel) { skipped++; continue; }
  const l1 = CATEGORY_TREE.find(c => c.mappedLabels.includes(mappedLabel));
  if (!l1) { skipped++; continue; }

  const pathIds = resolveCategoryPath(raw, l1.subcategories);
  const splitBook: SplitBookIndex = {
    id: raw.id,
    title: raw.title,
    authors: raw.authors,
    keywords: raw.keywords,
    pathIds,
  };

  if (raw.subtitle) splitBook.subtitle = raw.subtitle;
  if (raw.publisher) splitBook.publisher = raw.publisher;
  if (raw.publishedDate) splitBook.publishedDate = raw.publishedDate;
  if (raw.isbn13) splitBook.isbn13 = raw.isbn13;
  if (raw.subjects?.length) splitBook.subjects = raw.subjects;
  if (raw.pageCount) splitBook.pageCount = raw.pageCount;
  if (raw.estimatedReadingHours) splitBook.estimatedReadingHours = raw.estimatedReadingHours;
  if (raw.thumbnailUrl) splitBook.thumbnailUrl = raw.thumbnailUrl;
  if (raw.relatedBookIds?.length) splitBook.relatedBookIds = raw.relatedBookIds;
  if (raw.sourceIds?.googleBooksId) {
    splitBook.sourceIds = { googleBooksId: raw.sourceIds.googleBooksId };
  }

  if (!l1Groups.has(l1.id)) l1Groups.set(l1.id, []);
  l1Groups.get(l1.id)!.push(splitBook);
  bookL1[raw.id] = l1.id;
}

// パス別冊数・サムネ（meta.json 用）
const l1Counts: Record<string, number> = {};
const pathCounts: Record<string, number> = {};
const pathThumbs: Record<string, string[]> = {};

for (const l1 of CATEGORY_TREE) {
  const books = l1Groups.get(l1.id) ?? [];
  if (books.length === 0) continue;

  l1Counts[l1.id] = books.length;

  buildPathIndexes(books, l1.subcategories, l1.id, pathCounts, pathThumbs);

  // L1別 JSON
  writeFileSync(
    join(outDir, `books-${l1.id}.json`),
    JSON.stringify(books),
  );
  console.log(`✓ books-${l1.id}.json  (${books.length}冊)`);
}

// meta.json
writeFileSync(
  join(outDir, "meta.json"),
  JSON.stringify({ l1Counts, pathCounts, pathThumbs }),
);
console.log("✓ meta.json");

// book-l1.json
writeFileSync(
  join(outDir, "book-l1.json"),
  JSON.stringify(bookL1),
);
console.log(`✓ book-l1.json  (${Object.keys(bookL1).length}冊)`);
if (skipped > 0) console.log(`  ※ ${skipped}冊は分類不能のためスキップ`);

console.log("\nDone. Output → public/data/");
