import type { Category } from "./categories";

export interface ClassifiableBook {
  title: string;
  searchableText?: string;
  keywords?: string[];
  categories?: string[];
  subjects?: string[];
  authors?: string[];
  publisher?: string;
}

export function buildSearchText(book: ClassifiableBook): string {
  return [
    book.title,
    book.searchableText ?? "",
    ...(book.keywords ?? []),
    ...(book.categories ?? []),
    ...(book.subjects ?? []),
    ...(book.authors ?? []),
    book.publisher ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function keywordScore(text: string, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    const token = kw.trim().toLowerCase();
    if (!token) continue;
    if (text.includes(token)) score += 1;
  }
  return score;
}

function categoryScore(text: string, cat: Category): number {
  let score = keywordScore(text, cat.keywords) * 2;

  // ラベル語彙も弱く効かせる（完全一致できない本の救済）
  const labelHints = cat.label
    .split(/[・\s/]/)
    .map((v) => v.trim())
    .filter(Boolean);
  score += keywordScore(text, labelHints) * 0.5;

  // 子カテゴリに強い一致がある場合は親にも加点
  if (cat.subcategories?.length) {
    const childMax = Math.max(
      ...cat.subcategories.map((sub) => keywordScore(text, sub.keywords)),
      0,
    );
    score += childMax * 0.35;
  }

  return score;
}

export function resolveCategoryPath(book: ClassifiableBook, cats: Category[]): string[] {
  const text = buildSearchText(book);
  const path: string[] = [];

  let current = cats;
  while (current.length > 0) {
    let best = current[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const cat of current) {
      const s = categoryScore(text, cat);
      if (s > bestScore) {
        bestScore = s;
        best = cat;
      }
    }

    // 完全に一致語がない場合は「other」優先、なければ先頭カテゴリへ
    if (bestScore <= 0) {
      const other = current.find((c) => c.id === "other" || c.id.endsWith("-other"));
      if (other) best = other;
    }

    path.push(best.id);
    current = best.subcategories ?? [];
  }

  return path;
}

