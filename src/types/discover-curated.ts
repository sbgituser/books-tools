/**
 * discover-curated.ts
 *
 * 「発見する」ページのAI選書結果（discover-curated）の型定義。
 *
 * 生成物:
 *   data/discover-curated/{slug}.json          ← git管理（AIバッチ出力）
 *   public/data/discover-curated/{slug}.json   ← ビルド時にコピー、本番表示用
 *
 * 候補生成物（AI入力用・内部のみ）:
 *   data/discover-candidates/{slug}.json
 */

// ── 候補データ型（AI入力用・内部生成物） ──────────────────────────

/** AI に渡す候補1件分の情報 */
export interface DiscoverCandidateItem {
  workId: string;
  type: "manga" | "novel" | "other";
  title: string;
  authorDisplay: string;
  status: "completed" | "ongoing" | "unknown";
  volumeCount: number;
  discoveryTags: string[];
  discoveryAttributes: Record<string, unknown>;
  /** スコアリングスコア（デバッグ用。本番表示には使わない） */
  _score: number;
}

/** ムードごとの候補集合（data/discover-candidates/{slug}.json） */
export interface DiscoverCandidates {
  axis: "mood";
  slug: string;
  label: string;
  icon: string;
  description: string;
  matchingTags: string[];
  candidates: DiscoverCandidateItem[];
  candidateCount: number;
  generatedAt: string;
}

// ── 選書結果型（本番表示用） ──────────────────────────────────────

/** AI が選んだ1作品分のデータ */
export interface DiscoverCuratedItem {
  workId: string;
  reason: string;
}

/** 選書セクション */
export interface DiscoverCuratedSection {
  title: string;
  items: DiscoverCuratedItem[];
}

/**
 * ムードごとのAI選書結果。
 * public/data/discover-curated/{slug}.json として保存し、本番ページで読む。
 */
export interface DiscoverCurated {
  axis: "mood";
  slug: string;
  label: string;
  icon: string;
  /** AI が生成したムード導入文（80〜120字程度） */
  intro: string;
  sections: DiscoverCuratedSection[];
  /** 候補全件数（AI に渡した候補の件数） */
  allCount: number;
  /** AI が選んだ件数（sections 内の全 items 合計） */
  selectedCount: number;
  generatedAt: string;
}
