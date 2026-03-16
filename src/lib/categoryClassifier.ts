/**
 * categoryClassifier.ts — 階層型スコアリング分類エンジン
 *
 * 設計方針:
 *  1. L1 → L2 → L3 の階層整合（L2 は採用L1配下のみ、L3 は採用L2配下のみ）
 *  2. スコアソースを分離（title/subtitle/keywords/body/author/series/weak/phrase/exclude）
 *  3. 曖昧語（weakKeywords）は低重みで加算
 *  4. phraseKeywords は高重みの完全一致
 *  5. requiredAny ゲート（未通過でスコア0）
 *  6. カテゴリごとの minScore / minMargin で無理な付与を防ぐ
 *  7. explain モードで分類根拠を追跡可能
 */

import {
  CATEGORY_TREE,
  L4_TAG_RULES,
  L5_TAG_RULES,
  type Category,
  type FacetTagRule,
  type L1Category,
} from "./categories";
import { AUTHOR_PRIORS_MAP, SERIES_PRIORS_MAP } from "./priors";

// ─────────────────────────────────────────────────────────────────────────────
// 型定義
// ─────────────────────────────────────────────────────────────────────────────

export interface ManualClassification {
  l1Id?: string;
  l2Id?: string;
  l3Id?: string;
  l4TagIds?: string[];
  l5TagIds?: string[];
}

export interface ClassifiableBook {
  title: string;
  searchableText?: string;
  keywords?: string[];
  categories?: string[];
  subjects?: string[];
  authors?: string[];
  publisher?: string;
  manualClassification?: ManualClassification;
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

// ─────────────────────────────────────────────────────────────────────────────
// Explain モード型
// ─────────────────────────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  categoryId: string;
  categoryLabel: string;
  totalScore: number;
  titleScore: number;
  catSubjScore: number;
  keywordsScore: number;
  bodyScore: number;
  phraseScore: number;
  weakScore: number;
  authorScore: number;
  publisherScore: number;
  priorBoost: number;
  excludePenalty: number;
  requiredAnyGate: boolean;  // false = ゲート未通過でスコア0
  hitWords: string[];
  excludeHits: string[];
  priorLabel?: string;
}

export interface ExplainResult {
  book: { title: string; authors: string[] };
  l1: { id: string; label: string; score: number; confidence: number };
  l2: { id: string; label: string; score: number; confidence: number } | null;
  l3: { id: string; label: string; score: number; confidence: number } | null;
  l4TagIds: string[];
  l5TagIds: string[];
  pathIds: string[];
  l1Candidates: ScoreBreakdown[];
  l2Candidates: ScoreBreakdown[];
  l3Candidates: ScoreBreakdown[];
  thresholds: {
    l2MinScore: number;
    l2MinMargin: number;
    l3MinScore: number;
    l3MinMargin: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// スコア重み定数
// ─────────────────────────────────────────────────────────────────────────────

export const SCORE_WEIGHTS = {
  // phraseKeywords（完全フレーズ一致）
  phraseTitle:   12,
  phraseCatSubj:  9,
  phraseKeys:     7,
  phraseBody:     4,

  // strongKeywords
  strongTitle:    7,
  strongCatSubj:  6,
  strongKeys:     5,
  strongBody:     2.5,

  // keywords（通常）
  kwTitle:        5,
  kwCatSubj:      3.5,
  kwKeys:         2.5,
  kwBody:         1,

  // weakKeywords（曖昧語）
  weakTitle:      1.5,
  weakCatSubj:    1,
  weakKeys:       0.8,
  weakBody:       0.3,

  // aliases
  aliasTitle:     3,
  aliasCatSubj:   2.5,

  // prior・author・publisher
  authorFieldHit: 1.2,
  publisherHit:   0.5,

  // 除外ペナルティ
  excludeHit:    -7,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// デフォルト閾値
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_THRESHOLDS = {
  l2MinScore:  3.0,   // L2採用の最低スコア（旧: 2.0）
  l2MinMargin: 0.8,   // L2 1位と2位の最低差
  l3MinScore:  2.5,   // L3採用の最低スコア（L2確定後なので緩め）
  l3MinMargin: 0.3,   // L3 1位と2位の最低差
  l4Threshold: 2.2,
  l5Threshold: 2.8,   // L5閾値引き上げ（旧: 2.6）
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// テキスト正規化
// ─────────────────────────────────────────────────────────────────────────────

export function normalizeText(v: string): string {
  return v
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s\u3000]+/g, " ")
    .replace(/[‐‑‒–—―]/g, "-") // 各種ダッシュを統一
    .replace(/[・･]/g, "・")   // 中点統一
    .trim();
}

function normalizeKey(v: string): string {
  return normalizeText(v).replace(/[^\p{L}\p{N}]+/gu, "");
}

function includesAny(text: string, words: string[]): string[] {
  const hits: string[] = [];
  for (const w of words) {
    const n = normalizeText(w);
    if (!n) continue;
    if (text.includes(n)) hits.push(w);
  }
  return hits;
}

function uniq<T>(v: T[]): T[] {
  return [...new Set(v)];
}

// ─────────────────────────────────────────────────────────────────────────────
// スコアリング本体
// ─────────────────────────────────────────────────────────────────────────────

type ScoringRule = {
  label: string;
  keywords?: string[];
  strongKeywords?: string[];
  weakKeywords?: string[];
  phraseKeywords?: string[];
  aliases?: string[];
  excludeKeywords?: string[];
  requiredAny?: string[];
};

function scoreCategory(
  evidence: CategoryEvidence,
  rule: ScoringRule,
  explain: false,
): number;
function scoreCategory(
  evidence: CategoryEvidence,
  rule: ScoringRule,
  explain: true,
): ScoreBreakdown;
function scoreCategory(
  evidence: CategoryEvidence,
  rule: ScoringRule,
  explain: boolean,
): number | ScoreBreakdown {
  const title    = evidence.titleNormalized;
  const catSubj  = normalizeText(`${evidence.categories.join(" ")} ${evidence.subjects.join(" ")}`);
  const keys     = normalizeText(evidence.keywords.join(" "));
  const body     = evidence.searchableText;
  const authors  = normalizeText(evidence.authors.join(" "));
  const publisher = evidence.publisher;

  const strong   = rule.strongKeywords   ?? [];
  const words    = rule.keywords         ?? [];
  const weaks    = rule.weakKeywords     ?? [];
  const phrases  = rule.phraseKeywords   ?? [];
  const aliases  = rule.aliases          ?? [];
  const excludes = rule.excludeKeywords  ?? [];
  const reqAny   = rule.requiredAny      ?? [];

  // requiredAny ゲート
  const W = SCORE_WEIGHTS;
  let requiredAnyGate = true;
  if (reqAny.length > 0) {
    const allText = `${title} ${catSubj} ${keys} ${body}`;
    const anyHit = reqAny.some(r => allText.includes(normalizeText(r)));
    if (!anyHit) {
      if (!explain) return 0;
      requiredAnyGate = false;
    }
  }

  let phraseScore   = 0;
  let titleScore    = 0;
  let catSubjScore  = 0;
  let keywordsScore = 0;
  let bodyScore     = 0;
  let weakScore     = 0;
  let authorScore   = 0;
  let publisherScore = 0;
  const hitWords: string[] = [];

  // phraseKeywords
  const phrTitle  = includesAny(title,   phrases);
  const phrCat    = includesAny(catSubj, phrases);
  const phrKeys   = includesAny(keys,    phrases);
  const phrBody   = includesAny(body,    phrases);
  phraseScore += phrTitle.length  * W.phraseTitle;
  phraseScore += phrCat.length    * W.phraseCatSubj;
  phraseScore += phrKeys.length   * W.phraseKeys;
  phraseScore += phrBody.length   * W.phraseBody;
  hitWords.push(...phrTitle, ...phrCat.filter(w => !phrTitle.includes(w)));

  // strongKeywords
  const stTitle  = includesAny(title,   strong);
  const stCat    = includesAny(catSubj, strong);
  const stKeys   = includesAny(keys,    strong);
  const stBody   = includesAny(body,    strong);
  titleScore    += stTitle.length  * W.strongTitle;
  catSubjScore  += stCat.length    * W.strongCatSubj;
  keywordsScore += stKeys.length   * W.strongKeys;
  bodyScore     += stBody.length   * W.strongBody;
  hitWords.push(...stTitle, ...stCat.filter(w => !stTitle.includes(w)));

  // keywords
  const kwTitle  = includesAny(title,   words);
  const kwCat    = includesAny(catSubj, words);
  const kwKeys   = includesAny(keys,    words);
  const kwBody   = includesAny(body,    words);
  titleScore    += kwTitle.length  * W.kwTitle;
  catSubjScore  += kwCat.length    * W.kwCatSubj;
  keywordsScore += kwKeys.length   * W.kwKeys;
  bodyScore     += kwBody.length   * W.kwBody;
  hitWords.push(...kwTitle.filter(w => !hitWords.includes(w)));

  // weakKeywords
  const wkTitle  = includesAny(title,   weaks);
  const wkCat    = includesAny(catSubj, weaks);
  const wkKeys   = includesAny(keys,    weaks);
  const wkBody   = includesAny(body,    weaks);
  weakScore += wkTitle.length  * W.weakTitle;
  weakScore += wkCat.length    * W.weakCatSubj;
  weakScore += wkKeys.length   * W.weakKeys;
  weakScore += wkBody.length   * W.weakBody;

  // aliases
  const alTitle  = includesAny(title,   aliases);
  const alCat    = includesAny(catSubj, aliases);
  titleScore    += alTitle.length * W.aliasTitle;
  catSubjScore  += alCat.length   * W.aliasCatSubj;
  hitWords.push(...alTitle.filter(w => !hitWords.includes(w)));

  // author/publisher フィールドヒント
  const authHints = includesAny(authors, [...strong, ...words]);
  authorScore = authHints.length * W.authorFieldHit;
  const pubHints  = includesAny(publisher, [...strong, ...words]);
  publisherScore = pubHints.length * W.publisherHit;

  // excludeKeywords ペナルティ
  const allText = `${title} ${catSubj} ${keys} ${body}`;
  const excluded = includesAny(allText, excludes);
  const excludePenalty = excluded.length * W.excludeHit;

  const total = requiredAnyGate
    ? phraseScore + titleScore + catSubjScore + keywordsScore + bodyScore
      + weakScore + authorScore + publisherScore + excludePenalty
    : 0;

  if (!explain) return Math.max(total, 0);

  return {
    categoryId: "",
    categoryLabel: rule.label,
    totalScore: Math.max(total, 0),
    titleScore,
    catSubjScore,
    keywordsScore,
    bodyScore,
    phraseScore,
    weakScore,
    authorScore,
    publisherScore,
    priorBoost: 0,
    excludePenalty,
    requiredAnyGate,
    hitWords: uniq(hitWords).slice(0, 6),
    excludeHits: excluded.slice(0, 3),
    priorLabel: undefined,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 信頼度計算
// ─────────────────────────────────────────────────────────────────────────────

function toConfidence(top: number, second: number): number {
  const base = top <= 0 ? 0 : top / (top + Math.max(0, second) + 1);
  return Math.max(0, Math.min(1, Number(base.toFixed(3))));
}

// ─────────────────────────────────────────────────────────────────────────────
// Prior 適用
// ─────────────────────────────────────────────────────────────────────────────

function applyPriors(
  evidence: CategoryEvidence,
  targetL1Id: string,
  targetL2Id?: string,
  targetL3Id?: string,
): { l1Boost: number; l2Boost: number; l3Boost: number; label?: string } {
  let l1Boost = 0;
  let l2Boost = 0;
  let l3Boost = 0;
  let matchedLabel: string | undefined;

  const authorKeys = evidence.authors.map(normalizeKey);

  // 著者 prior
  for (const [authorKey, entry] of AUTHOR_PRIORS_MAP) {
    if (!authorKeys.some(a => a.includes(authorKey))) continue;
    if (entry.l1Id === targetL1Id) {
      l1Boost += entry.boostL1 ?? 2;
      matchedLabel = `author prior: ${[...AUTHOR_PRIORS_MAP.keys()].find(k => k === authorKey)}`;
    }
    if (targetL2Id && entry.l2Id === targetL2Id) l2Boost += entry.boostL2 ?? 2;
    if (targetL3Id && entry.l3Id === targetL3Id) l3Boost += entry.boostL3 ?? 2;
  }

  // シリーズ prior（タイトル・本文）
  const titleAndBody = `${evidence.titleNormalized} ${evidence.searchableText}`;
  for (const [seriesKey, entry] of SERIES_PRIORS_MAP) {
    if (!titleAndBody.includes(seriesKey)) continue;
    if (entry.l1Id === targetL1Id) {
      l1Boost += entry.boostL1 ?? 2;
      matchedLabel = `series prior: ${seriesKey}`;
    }
    if (targetL2Id && entry.l2Id === targetL2Id) l2Boost += entry.boostL2 ?? 2;
    if (targetL3Id && entry.l3Id === targetL3Id) l3Boost += entry.boostL3 ?? 2;
  }

  return { l1Boost, l2Boost, l3Boost, label: matchedLabel };
}

interface ScoredEntry<T> {
  item: T;
  score: number;
  breakdown?: ScoreBreakdown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Evidence 構築
// ─────────────────────────────────────────────────────────────────────────────

export function buildCategoryEvidence(book: ClassifiableBook): CategoryEvidence {
  return {
    title: book.title ?? "",
    titleNormalized: normalizeText(book.title ?? ""),
    categories: (book.categories ?? []).map(normalizeText).filter(Boolean),
    subjects:   (book.subjects   ?? []).map(normalizeText).filter(Boolean),
    keywords:   (book.keywords   ?? []).map(normalizeText).filter(Boolean),
    searchableText: normalizeText(book.searchableText ?? ""),
    authors:    (book.authors    ?? []).map(normalizeText).filter(Boolean),
    publisher:  normalizeText(book.publisher ?? ""),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// L1 判定
// ─────────────────────────────────────────────────────────────────────────────

export function resolveL1Category(
  _book: ClassifiableBook,
  evidence: CategoryEvidence,
): { l1: L1Category; confidence: number; reasons: string[] } {
  const candidates: ScoredEntry<L1Category>[] = [];

  for (const l1 of CATEGORY_TREE) {
    const raw = scoreCategory(evidence, {
      label: l1.label,
      keywords:      l1.keywords,
      strongKeywords: l1.strongKeywords,
      weakKeywords:  l1.weakKeywords,
      phraseKeywords: l1.phraseKeywords,
      aliases:       l1.aliases,
      excludeKeywords: l1.excludeKeywords,
      requiredAny:   l1.requiredAny,
    }, false);
    const prior = applyPriors(evidence, l1.id);
    const total = raw + prior.l1Boost;
    candidates.push({ item: l1, score: total });
  }

  candidates.sort((a, b) => b.score - a.score);
  const [top, second] = candidates;

  if (!top) {
    const fallback = CATEGORY_TREE.find(v => v.id === "business") ?? CATEGORY_TREE[0];
    return { l1: fallback, confidence: 0, reasons: ["fallback l1"] };
  }

  return {
    l1: top.item,
    confidence: toConfidence(top.score, second?.score ?? 0),
    reasons: [`l1=${top.item.id}(score=${top.score.toFixed(1)})`],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// L2 判定
// ─────────────────────────────────────────────────────────────────────────────

export function resolveL2Category(
  _book: ClassifiableBook,
  l1: L1Category,
  evidence: CategoryEvidence,
): { l2: Category | null; confidence: number; reasons: string[] } {
  const minScore  = DEFAULT_THRESHOLDS.l2MinScore;
  const minMargin = DEFAULT_THRESHOLDS.l2MinMargin;

  const candidates: ScoredEntry<Category>[] = [];

  for (const cat of l1.subcategories) {
    const raw = scoreCategory(evidence, {
      label: cat.label,
      keywords:       cat.keywords,
      strongKeywords: cat.strongKeywords,
      weakKeywords:   cat.weakKeywords,
      phraseKeywords: cat.phraseKeywords,
      aliases:        cat.aliases,
      excludeKeywords: cat.excludeKeywords,
      requiredAny:    cat.requiredAny,
    }, false);
    const prior = applyPriors(evidence, l1.id, cat.id);
    const effectiveMin = cat.minScore ?? minScore;
    const total = raw + prior.l2Boost;
    candidates.push({ item: cat, score: total });
    void effectiveMin;
  }

  candidates.sort((a, b) => b.score - a.score);
  const [top, second] = candidates;

  if (!top) return { l2: null, confidence: 0, reasons: ["no l2 candidate"] };

  const effectiveMinScore  = top.item.minScore  ?? minScore;
  const effectiveMinMargin = top.item.minMargin ?? minMargin;

  if (top.score < effectiveMinScore) {
    return { l2: null, confidence: 0, reasons: [`l2 score too low (${top.score.toFixed(1)} < ${effectiveMinScore})`] };
  }
  if (second && (top.score - second.score) < effectiveMinMargin) {
    return {
      l2: null, confidence: 0,
      reasons: [`l2 margin too small (${(top.score - second.score).toFixed(1)} < ${effectiveMinMargin})`],
    };
  }

  return {
    l2: top.item,
    confidence: toConfidence(top.score, second?.score ?? 0),
    reasons: [`l2=${top.item.id}(score=${top.score.toFixed(1)})`],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// L3 判定
// ─────────────────────────────────────────────────────────────────────────────

export function resolveL3Category(
  _book: ClassifiableBook,
  l1: L1Category,
  l2: Category | null,
  evidence: CategoryEvidence,
): { l3: Category | null; confidence: number; reasons: string[] } {
  if (!l2?.subcategories?.length) {
    return { l3: null, confidence: 0, reasons: ["no l3 candidate"] };
  }

  const minScore  = DEFAULT_THRESHOLDS.l3MinScore;
  const minMargin = DEFAULT_THRESHOLDS.l3MinMargin;
  const candidates: ScoredEntry<Category>[] = [];

  for (const cat of l2.subcategories) {
    const raw = scoreCategory(evidence, {
      label: cat.label,
      keywords:       cat.keywords,
      strongKeywords: cat.strongKeywords,
      weakKeywords:   cat.weakKeywords,
      phraseKeywords: cat.phraseKeywords,
      aliases:        cat.aliases,
      excludeKeywords: cat.excludeKeywords,
      requiredAny:    cat.requiredAny,
    }, false);
    const prior = applyPriors(evidence, l1.id, l2.id, cat.id);
    const total = raw + prior.l3Boost;
    candidates.push({ item: cat, score: total });
  }

  candidates.sort((a, b) => b.score - a.score);
  const [top, second] = candidates;

  if (!top) return { l3: null, confidence: 0, reasons: ["no l3 candidate"] };

  const effectiveMinScore  = top.item.minScore  ?? minScore;
  const effectiveMinMargin = top.item.minMargin ?? minMargin;

  if (top.score < effectiveMinScore) {
    return { l3: null, confidence: 0, reasons: [`l3 score too low (${top.score.toFixed(1)})`] };
  }
  if (second && (top.score - second.score) < effectiveMinMargin) {
    return {
      l3: null, confidence: 0,
      reasons: [`l3 margin too small (${(top.score - second.score).toFixed(1)})`],
    };
  }

  return {
    l3: top.item,
    confidence: toConfidence(top.score, second?.score ?? 0),
    reasons: [`l3=${top.item.id}(score=${top.score.toFixed(1)})`],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// L4/L5 ファセットタグ
// ─────────────────────────────────────────────────────────────────────────────

function resolveFacetTags(
  evidence: CategoryEvidence,
  rules: FacetTagRule[],
  l1Id: string,
  l2Id: string | undefined,
  threshold: number,
): { ids: string[]; reasons: string[] } {
  const ids: string[] = [];
  const reasons: string[] = [];

  for (const rule of rules) {
    if (rule.l1Allow?.length && !rule.l1Allow.includes(l1Id)) continue;
    if (rule.l2Allow?.length && (!l2Id || !rule.l2Allow.includes(l2Id))) continue;

    const effectiveThreshold = rule.minScore ?? threshold;

    const score = scoreCategory(evidence, {
      label: rule.label,
      keywords:       rule.keywords,
      strongKeywords: rule.strongKeywords,
      phraseKeywords: rule.phraseKeywords,
      aliases:        rule.aliases,
      excludeKeywords: rule.excludeKeywords,
      requiredAny:    rule.requiredAny,
    }, false);

    if (score >= effectiveThreshold) {
      ids.push(rule.id);
      reasons.push(`tag=${rule.id}(${score.toFixed(1)})`);
    }
  }

  return { ids: uniq(ids), reasons };
}

export function resolveL4Tags(
  _book: ClassifiableBook,
  l1: L1Category,
  l2: Category | null,
  _l3: Category | null,
  evidence: CategoryEvidence,
): { tagIds: string[]; reasons: string[] } {
  const resolved = resolveFacetTags(
    evidence, L4_TAG_RULES, l1.id, l2?.id, DEFAULT_THRESHOLDS.l4Threshold,
  );
  return { tagIds: resolved.ids, reasons: resolved.reasons.slice(0, 6) };
}

export function resolveL5Tags(
  _book: ClassifiableBook,
  l1: L1Category,
  l2: Category | null,
  _l3: Category | null,
  _l4TagIds: string[],
  evidence: CategoryEvidence,
): { tagIds: string[]; reasons: string[] } {
  const resolved = resolveFacetTags(
    evidence, L5_TAG_RULES, l1.id, l2?.id, DEFAULT_THRESHOLDS.l5Threshold,
  );
  return { tagIds: resolved.ids.slice(0, 8), reasons: resolved.reasons.slice(0, 8) };
}

// ─────────────────────────────────────────────────────────────────────────────
// メイン分類関数
// ─────────────────────────────────────────────────────────────────────────────

export function resolveBookClassification(book: ClassifiableBook): ClassificationResult {
  // 手動設定がある場合はそれを優先する
  const manual = book.manualClassification;
  if (manual?.l1Id) {
    const evidence = buildCategoryEvidence(book);
    const l1Auto = resolveL1Category(book, evidence);
    const l2Auto = resolveL2Category(book, l1Auto.l1, evidence);
    const l3Auto = resolveL3Category(book, l1Auto.l1, l2Auto.l2, evidence);
    const l4Auto = resolveL4Tags(book, l1Auto.l1, l2Auto.l2, l3Auto.l3, evidence);
    const l5Auto = resolveL5Tags(book, l1Auto.l1, l2Auto.l2, l3Auto.l3, l4Auto.tagIds, evidence);

    const l2Id = manual.l2Id ?? l2Auto.l2?.id;
    const l3Id = manual.l3Id ?? l3Auto.l3?.id;
    const l4TagIds = manual.l4TagIds ?? l4Auto.tagIds;
    const l5TagIds = manual.l5TagIds ?? l5Auto.tagIds;
    const pathIds = [l2Id, l3Id].filter((v): v is string => Boolean(v));

    return {
      l1Id: manual.l1Id,
      l2Id,
      l3Id,
      l4TagIds,
      l5TagIds,
      pathIds,
      confidence: { l1: 1.0, l2: l2Id ? 1.0 : 0, l3: l3Id ? 1.0 : 0 },
      reasons: ["manual-override"],
    };
  }

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

// ─────────────────────────────────────────────────────────────────────────────
// Explain モード
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 分類根拠を詳細出力するデバッグ用関数。
 * 本番UIには露出しない。scripts/eval-classifier.ts から呼ぶ。
 */
export function classifyBookWithExplain(book: ClassifiableBook): ExplainResult {
  const evidence = buildCategoryEvidence(book);

  // L1 candidates
  const l1Candidates: ScoreBreakdown[] = CATEGORY_TREE.map(l1 => {
    const bd = scoreCategory(evidence, {
      label: l1.label,
      keywords:       l1.keywords,
      strongKeywords: l1.strongKeywords,
      weakKeywords:   l1.weakKeywords,
      phraseKeywords: l1.phraseKeywords,
      aliases:        l1.aliases,
      excludeKeywords: l1.excludeKeywords,
      requiredAny:   l1.requiredAny,
    }, true);
    const prior = applyPriors(evidence, l1.id);
    bd.categoryId    = l1.id;
    bd.priorBoost    = prior.l1Boost;
    bd.totalScore    = Math.max(0, bd.totalScore + prior.l1Boost);
    bd.priorLabel    = prior.label;
    return bd;
  });
  l1Candidates.sort((a, b) => b.totalScore - a.totalScore);

  const topL1Entry = l1Candidates[0];
  const topL1 = CATEGORY_TREE.find(l => l.id === topL1Entry.categoryId)
    ?? CATEGORY_TREE[0];

  // L2 candidates（採用L1配下のみ）
  const l2Candidates: ScoreBreakdown[] = topL1.subcategories.map(cat => {
    const bd = scoreCategory(evidence, {
      label: cat.label,
      keywords:       cat.keywords,
      strongKeywords: cat.strongKeywords,
      weakKeywords:   cat.weakKeywords,
      phraseKeywords: cat.phraseKeywords,
      aliases:        cat.aliases,
      excludeKeywords: cat.excludeKeywords,
      requiredAny:   cat.requiredAny,
    }, true);
    const prior = applyPriors(evidence, topL1.id, cat.id);
    bd.categoryId = cat.id;
    bd.priorBoost = prior.l2Boost;
    bd.totalScore = Math.max(0, bd.totalScore + prior.l2Boost);
    return bd;
  });
  l2Candidates.sort((a, b) => b.totalScore - a.totalScore);

  // L2 採用判定
  const l2Top = l2Candidates[0];
  const l2Second = l2Candidates[1];
  const l2MinScore  = DEFAULT_THRESHOLDS.l2MinScore;
  const l2MinMargin = DEFAULT_THRESHOLDS.l2MinMargin;
  let adoptedL2: Category | null = null;
  if (l2Top && l2Top.totalScore >= l2MinScore) {
    const margin = l2Top.totalScore - (l2Second?.totalScore ?? 0);
    if (margin >= l2MinMargin) {
      adoptedL2 = topL1.subcategories.find(c => c.id === l2Top.categoryId) ?? null;
    }
  }

  // L3 candidates（採用L2配下のみ）
  const l3Candidates: ScoreBreakdown[] = (adoptedL2?.subcategories ?? []).map(cat => {
    const bd = scoreCategory(evidence, {
      label: cat.label,
      keywords:       cat.keywords,
      strongKeywords: cat.strongKeywords,
      weakKeywords:   cat.weakKeywords,
      phraseKeywords: cat.phraseKeywords,
      aliases:        cat.aliases,
      excludeKeywords: cat.excludeKeywords,
      requiredAny:   cat.requiredAny,
    }, true);
    const prior = applyPriors(evidence, topL1.id, adoptedL2!.id, cat.id);
    bd.categoryId = cat.id;
    bd.priorBoost = prior.l3Boost;
    bd.totalScore = Math.max(0, bd.totalScore + prior.l3Boost);
    return bd;
  });
  l3Candidates.sort((a, b) => b.totalScore - a.totalScore);

  // L3 採用判定
  const l3Top = l3Candidates[0];
  const l3Second = l3Candidates[1];
  const l3MinScore  = DEFAULT_THRESHOLDS.l3MinScore;
  const l3MinMargin = DEFAULT_THRESHOLDS.l3MinMargin;
  let adoptedL3: Category | null = null;
  if (l3Top && l3Top.totalScore >= l3MinScore) {
    const margin = l3Top.totalScore - (l3Second?.totalScore ?? 0);
    if (margin >= l3MinMargin) {
      adoptedL3 = adoptedL2?.subcategories?.find(c => c.id === l3Top.categoryId) ?? null;
    }
  }

  // L4/L5
  const l4 = resolveL4Tags(book, topL1, adoptedL2, adoptedL3, evidence);
  const l5 = resolveL5Tags(book, topL1, adoptedL2, adoptedL3, l4.tagIds, evidence);
  const pathIds = [adoptedL2?.id, adoptedL3?.id].filter((v): v is string => Boolean(v));

  return {
    book: { title: book.title, authors: book.authors ?? [] },
    l1: {
      id: topL1.id,
      label: topL1.label,
      score: topL1Entry.totalScore,
      confidence: toConfidence(topL1Entry.totalScore, l1Candidates[1]?.totalScore ?? 0),
    },
    l2: adoptedL2 && l2Top ? {
      id: adoptedL2.id,
      label: adoptedL2.label,
      score: l2Top.totalScore,
      confidence: toConfidence(l2Top.totalScore, l2Second?.totalScore ?? 0),
    } : null,
    l3: adoptedL3 && l3Top ? {
      id: adoptedL3.id,
      label: adoptedL3.label,
      score: l3Top.totalScore,
      confidence: toConfidence(l3Top.totalScore, l3Second?.totalScore ?? 0),
    } : null,
    l4TagIds: l4.tagIds,
    l5TagIds: l5.tagIds,
    pathIds,
    l1Candidates: l1Candidates.slice(0, 5),
    l2Candidates: l2Candidates.slice(0, 5),
    l3Candidates: l3Candidates.slice(0, 5),
    thresholds: {
      l2MinScore, l2MinMargin,
      l3MinScore, l3MinMargin,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 後方互換 API
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated resolveBookClassification を直接使うこと */
export function resolveCategoryPath(_book: ClassifiableBook, _cats: Category[]): string[] {
  return resolveBookClassification(_book).pathIds;
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
