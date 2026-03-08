import type { Book, SimilarityResult } from "./bookProviders/types";

/**
 * Simple tokenizer for Japanese + ASCII text.
 * Splits on delimiters and generates 2-gram character chunks for partial matching.
 */
function tokenize(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[・、。！？「」『』【】（）\-——\s]+/g, " ")
    .trim();

  const words = normalized.split(" ").filter((w) => w.length > 1);

  // Generate 2-character bigrams for substring matching
  const bigrams: string[] = [];
  for (let i = 0; i < normalized.length - 1; i++) {
    if (normalized[i] !== " " && normalized[i + 1] !== " ") {
      bigrams.push(normalized.slice(i, i + 2));
    }
  }

  return [...new Set([...words, ...bigrams])];
}

function containsQuery(text: string, queryLower: string): boolean {
  return text.toLowerCase().includes(queryLower);
}

function sharesBigrams(a: string, b: string, minShared = 2): boolean {
  const tokensA = new Set(tokenize(a));
  const tokensB = tokenize(b);
  let shared = 0;
  for (const t of tokensB) {
    if (tokensA.has(t)) shared++;
    if (shared >= minShared) return true;
  }
  return false;
}

export function findSimilarBooks(
  query: string,
  books: Book[]
): SimilarityResult[] {
  if (!query.trim()) return [];

  const queryLower = query.toLowerCase().trim();
  const queryTokens = tokenize(query);

  const results: SimilarityResult[] = [];

  for (const book of books) {
    let score = 0;
    const reasons: string[] = [];

    // --- Title match ---
    if (containsQuery(book.title, queryLower)) {
      score += 10;
      reasons.push("タイトルに一致");
    } else if (sharesBigrams(book.title, query, 2)) {
      score += 4;
      reasons.push("タイトルが類似");
    }

    // --- Author match ---
    if (containsQuery(book.author, queryLower)) {
      score += 6;
      reasons.push(`著者: ${book.author}`);
    }

    // --- Category match ---
    if (
      containsQuery(book.category, queryLower) ||
      containsQuery(queryLower, book.category.toLowerCase())
    ) {
      score += 5;
      reasons.push(`カテゴリ: ${book.category}`);
    }

    // --- Tag match ---
    const matchedTags = book.tags.filter((tag) => {
      const tagLower = tag.toLowerCase();
      return (
        containsQuery(tagLower, queryLower) ||
        containsQuery(queryLower, tagLower) ||
        queryTokens.some((t) => t.length >= 2 && tagLower.includes(t))
      );
    });
    if (matchedTags.length > 0) {
      score += matchedTags.length * 3;
      reasons.push(`キーワード: ${matchedTags.slice(0, 3).join("、")}`);
    }

    // --- Description match ---
    if (containsQuery(book.description, queryLower)) {
      score += 2;
      if (reasons.length === 0) reasons.push("説明文に一致");
    } else {
      const descMatches = queryTokens.filter(
        (t) => t.length >= 2 && book.description.toLowerCase().includes(t)
      );
      if (descMatches.length >= 2) {
        score += descMatches.length * 0.5;
        if (reasons.length === 0) reasons.push("内容が関連");
      }
    }

    if (score > 0) {
      results.push({ book, score, reasons });
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 12);
}
