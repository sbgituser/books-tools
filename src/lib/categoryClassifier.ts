import {
  AUTHOR_PRIORS,
  CATEGORY_TREE,
  L4_TAG_RULES,
  L5_TAG_RULES,
  SERIES_PRIORS,
  type Category,
  type FacetTagRule,
  type L1Category,
} from "./categories";

export interface ClassifiableBook {
  title: string;
  searchableText?: string;
  keywords?: string[];
  categories?: string[];
  subjects?: string[];
  authors?: string[];
  publisher?: string;
}

export interface CategoryEvidence {
  title: string;
  titleNormalized: string;
  categories: string[];
  subjects: string[];
  keywords: string[];
  searchableText: string;
  authors: string[];
  publisher: string;
}

type ScoreReason = { score: number; reason: string };

export interface ClassificationResult {
  l1Id: string;
  l2Id?: string;
  l3Id?: string;
  l4TagIds: string[];
  l5TagIds: string[];
  pathIds: string[];
  confidence: {
    l1: number;
    l2: number;
    l3: number;
  };
  reasons: string[];
}

function normalize(v: string): string {
  return v
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000]+/g, " ")
    .trim();
}

function normalizeKey(v: string): string {
  return normalize(v).replace(/[^\p{L}\p{N}]+/gu, "");
}

function includesAny(text: string, words: string[]): string[] {
  const hits: string[] = [];
  for (const w of words) {
    const n = normalize(w);
    if (!n) continue;
    if (text.includes(n)) hits.push(w);
  }
  return hits;
}

function uniq<T>(v: T[]): T[] {
  return [...new Set(v)];
}

function scoreRule(
  evidence: CategoryEvidence,
  rule: {
    label: string;
    keywords?: string[];
    strongKeywords?: string[];
    aliases?: string[];
    excludeKeywords?: string[];
  },
): ScoreReason {
  const reasons: string[] = [];
  let score = 0;

  const title = evidence.titleNormalized;
  const catSubj = normalize(`${evidence.categories.join(" ")} ${evidence.subjects.join(" ")}`);
  const keys = normalize(evidence.keywords.join(" "));
  const body = evidence.searchableText;
  const authors = normalize(evidence.authors.join(" "));
  const publisher = evidence.publisher;

  const strong = rule.strongKeywords ?? [];
  const words = rule.keywords ?? [];
  const aliases = rule.aliases ?? [];
  const excludes = rule.excludeKeywords ?? [];

  const strongTitle = includesAny(title, strong);
  const strongCat = includesAny(catSubj, strong);
  const strongKeys = includesAny(keys, strong);
  const strongBody = includesAny(body, strong);

  if (strongTitle.length) {
    score += strongTitle.length * 6;
    reasons.push(`title strong: ${strongTitle.slice(0, 2).join(",")}`);
  }
  if (strongCat.length) {
    score += strongCat.length * 5;
    reasons.push(`category/subject strong: ${strongCat.slice(0, 2).join(",")}`);
  }
  if (strongKeys.length) {
    score += strongKeys.length * 4;
    reasons.push(`keyword strong: ${strongKeys.slice(0, 2).join(",")}`);
  }
  if (strongBody.length) score += strongBody.length * 2;

  const kwTitle = includesAny(title, words);
  const kwCat = includesAny(catSubj, words);
  const kwKeys = includesAny(keys, words);
  const kwBody = includesAny(body, words);

  if (kwTitle.length) score += kwTitle.length * 4;
  if (kwCat.length) score += kwCat.length * 3;
  if (kwKeys.length) score += kwKeys.length * 2;
  if (kwBody.length) score += kwBody.length * 1;

  const aliasTitle = includesAny(title, aliases);
  const aliasCat = includesAny(catSubj, aliases);
  if (aliasTitle.length || aliasCat.length) {
    score += (aliasTitle.length + aliasCat.length) * 2;
    reasons.push(`alias matched: ${[...aliasTitle, ...aliasCat].slice(0, 2).join(",")}`);
  }

  const authorHints = includesAny(authors, [...strong, ...words]);
  if (authorHints.length) score += authorHints.length * 0.8;
  const pubHints = includesAny(publisher, [...strong, ...words]);
  if (pubHints.length) score += pubHints.length * 0.4;

  const excluded = includesAny(`${title} ${catSubj} ${keys} ${body}`, excludes);
  if (excluded.length) {
    score -= excluded.length * 5;
    reasons.push(`excluded by keyword: ${excluded.slice(0, 2).join(",")}`);
  }

  return { score, reason: `${rule.label} => ${reasons.slice(0, 2).join(" | ")}` };
}

function toConfidence(top: number, second: number): number {
  const base = top <= 0 ? 0 : top / (top + Math.max(0, second) + 1);
  return Math.max(0, Math.min(1, Number(base.toFixed(3))));
}

function applyPriors(
  evidence: CategoryEvidence,
  l1Id: string,
  l2Id?: string,
  l3Id?: string,
): { l1Boost: number; l2Boost: number; l3Boost: number; reasons: string[] } {
  const reasons: string[] = [];
  let l1Boost = 0;
  let l2Boost = 0;
  let l3Boost = 0;

  const authorKeys = evidence.authors.map(normalizeKey);
  for (const [author, prior] of Object.entries(AUTHOR_PRIORS)) {
    if (!authorKeys.some((a) => a.includes(normalizeKey(author)))) continue;
    if (prior.l1Id === l1Id) {
      l1Boost += prior.boostL1 ?? 2;
      reasons.push(`author prior matched: ${author}`);
    }
    if (l2Id && prior.l2Id === l2Id) l2Boost += prior.boostL2 ?? 2;
    if (l3Id && prior.l3Id === l3Id) l3Boost += prior.boostL3 ?? 2;
  }

  const title = evidence.titleNormalized;
  const body = evidence.searchableText;
  for (const [series, prior] of Object.entries(SERIES_PRIORS)) {
    const key = normalize(series);
    if (!title.includes(key) && !body.includes(key)) continue;
    if (prior.l1Id === l1Id) {
      l1Boost += prior.boostL1 ?? 2;
      reasons.push(`series prior matched: ${series}`);
    }
    if (l2Id && prior.l2Id === l2Id) l2Boost += prior.boostL2 ?? 2;
    if (l3Id && prior.l3Id === l3Id) l3Boost += prior.boostL3 ?? 2;
  }

  return { l1Boost, l2Boost, l3Boost, reasons };
}

export function buildCategoryEvidence(book: ClassifiableBook): CategoryEvidence {
  return {
    title: book.title ?? "",
    titleNormalized: normalize(book.title ?? ""),
    categories: (book.categories ?? []).map(normalize).filter(Boolean),
    subjects: (book.subjects ?? []).map(normalize).filter(Boolean),
    keywords: (book.keywords ?? []).map(normalize).filter(Boolean),
    searchableText: normalize(book.searchableText ?? ""),
    authors: (book.authors ?? []).map(normalize).filter(Boolean),
    publisher: normalize(book.publisher ?? ""),
  };
}

export function resolveL1Category(book: ClassifiableBook, evidence: CategoryEvidence): {
  l1: L1Category;
  confidence: number;
  reasons: string[];
} {
  let top: { l1: L1Category; score: number; reason: string } | null = null;
  let secondScore = 0;

  for (const l1 of CATEGORY_TREE) {
    const scored = scoreRule(evidence, {
      label: l1.label,
      keywords: l1.keywords,
      strongKeywords: l1.strongKeywords,
      aliases: l1.aliases,
      excludeKeywords: l1.excludeKeywords,
    });
    const prior = applyPriors(evidence, l1.id);
    const total = scored.score + prior.l1Boost;
    const reason = [scored.reason, ...prior.reasons].filter(Boolean).join(" | ");

    if (!top || total > top.score) {
      secondScore = top?.score ?? 0;
      top = { l1, score: total, reason };
    } else if (total > secondScore) {
      secondScore = total;
    }
  }

  if (!top) {
    const fallback = CATEGORY_TREE.find((v) => v.id === "business") ?? CATEGORY_TREE[0];
    return { l1: fallback, confidence: 0, reasons: ["fallback l1"] };
  }

  return {
    l1: top.l1,
    confidence: toConfidence(top.score, secondScore),
    reasons: [`l1 matched: ${top.l1.label}`, top.reason],
  };
}

export function resolveL2Category(
  book: ClassifiableBook,
  l1: L1Category,
  evidence: CategoryEvidence,
): { l2: Category | null; confidence: number; reasons: string[] } {
  let top: { cat: Category; score: number; reason: string } | null = null;
  let secondScore = 0;

  for (const cat of l1.subcategories) {
    const scored = scoreRule(evidence, {
      label: cat.label,
      keywords: cat.keywords,
      strongKeywords: cat.strongKeywords,
      aliases: cat.aliases,
      excludeKeywords: cat.excludeKeywords,
    });
    const prior = applyPriors(evidence, l1.id, cat.id);
    const total = scored.score + prior.l2Boost;
    const reason = [scored.reason, ...prior.reasons].filter(Boolean).join(" | ");

    if (!top || total > top.score) {
      secondScore = top?.score ?? 0;
      top = { cat, score: total, reason };
    } else if (total > secondScore) {
      secondScore = total;
    }
  }

  if (!top || top.score < 2) {
    return { l2: null, confidence: 0, reasons: ["l2 confidence too low"] };
  }

  return {
    l2: top.cat,
    confidence: toConfidence(top.score, secondScore),
    reasons: [`l2 matched: ${top.cat.label}`, top.reason],
  };
}

export function resolveL3Category(
  book: ClassifiableBook,
  l1: L1Category,
  l2: Category | null,
  evidence: CategoryEvidence,
): { l3: Category | null; confidence: number; reasons: string[] } {
  if (!l2?.subcategories?.length) {
    return { l3: null, confidence: 0, reasons: ["l3 candidate none"] };
  }

  let top: { cat: Category; score: number; reason: string } | null = null;
  let secondScore = 0;

  for (const cat of l2.subcategories) {
    const scored = scoreRule(evidence, {
      label: cat.label,
      keywords: cat.keywords,
      strongKeywords: cat.strongKeywords,
      aliases: cat.aliases,
      excludeKeywords: cat.excludeKeywords,
    });
    const prior = applyPriors(evidence, l1.id, l2.id, cat.id);
    const total = scored.score + prior.l3Boost;
    const reason = [scored.reason, ...prior.reasons].filter(Boolean).join(" | ");

    if (!top || total > top.score) {
      secondScore = top?.score ?? 0;
      top = { cat, score: total, reason };
    } else if (total > secondScore) {
      secondScore = total;
    }
  }

  if (!top || top.score < 2.5) {
    return { l3: null, confidence: 0, reasons: ["l3 confidence too low"] };
  }

  return {
    l3: top.cat,
    confidence: toConfidence(top.score, secondScore),
    reasons: [`l3 matched: ${top.cat.label}`, top.reason],
  };
}

function resolveFacetTags(
  evidence: CategoryEvidence,
  rules: FacetTagRule[],
  l1Id: string,
  l2Id?: string,
  threshold = 2,
): { ids: string[]; reasons: string[] } {
  const ids: string[] = [];
  const reasons: string[] = [];

  for (const rule of rules) {
    if (rule.l1Allow?.length && !rule.l1Allow.includes(l1Id)) continue;
    if (rule.l2Allow?.length && (!l2Id || !rule.l2Allow.includes(l2Id))) continue;

    const scored = scoreRule(evidence, {
      label: rule.label,
      keywords: rule.keywords,
      strongKeywords: rule.strongKeywords,
      aliases: rule.aliases,
      excludeKeywords: rule.excludeKeywords,
    });
    if (scored.score >= threshold) {
      ids.push(rule.id);
      reasons.push(`tag matched: ${rule.label}`);
    }
  }

  return { ids: uniq(ids), reasons };
}

export function resolveL4Tags(
  book: ClassifiableBook,
  l1: L1Category,
  l2: Category | null,
  l3: Category | null,
  evidence: CategoryEvidence,
): { tagIds: string[]; reasons: string[] } {
  const resolved = resolveFacetTags(evidence, L4_TAG_RULES, l1.id, l2?.id, 2.2);
  return { tagIds: resolved.ids, reasons: resolved.reasons.slice(0, 6) };
}

export function resolveL5Tags(
  book: ClassifiableBook,
  l1: L1Category,
  l2: Category | null,
  l3: Category | null,
  l4TagIds: string[],
  evidence: CategoryEvidence,
): { tagIds: string[]; reasons: string[] } {
  const resolved = resolveFacetTags(evidence, L5_TAG_RULES, l1.id, l2?.id, 2.6);
  return { tagIds: resolved.ids.slice(0, 8), reasons: resolved.reasons.slice(0, 8) };
}

export function resolveBookClassification(book: ClassifiableBook): ClassificationResult {
  const evidence = buildCategoryEvidence(book);
  const l1 = resolveL1Category(book, evidence);
  const l2 = resolveL2Category(book, l1.l1, evidence);
  const l3 = resolveL3Category(book, l1.l1, l2.l2, evidence);
  const l4 = resolveL4Tags(book, l1.l1, l2.l2, l3.l3, evidence);
  const l5 = resolveL5Tags(book, l1.l1, l2.l2, l3.l3, l4.tagIds, evidence);

  const pathIds = [l2.l2?.id, l3.l3?.id].filter((v): v is string => Boolean(v));

  return {
    l1Id: l1.l1.id,
    l2Id: l2.l2?.id,
    l3Id: l3.l3?.id,
    l4TagIds: l4.tagIds,
    l5TagIds: l5.tagIds,
    pathIds,
    confidence: {
      l1: l1.confidence,
      l2: l2.confidence,
      l3: l3.confidence,
    },
    reasons: [...l1.reasons, ...l2.reasons, ...l3.reasons, ...l4.reasons, ...l5.reasons].slice(0, 24),
  };
}

/**
 * 互換API: 既存コード向け（L2/L3の pathIds を返す）
 */
export function resolveCategoryPath(book: ClassifiableBook, cats: Category[]): string[] {
  const resolved = resolveBookClassification(book);
  return resolved.pathIds;
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
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

