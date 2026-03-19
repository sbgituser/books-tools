/**
 * scene-curated.ts
 *
 * AI選書結果（scene-curated）の型定義。
 *
 * 生成物:
 *   public/data/scene-curated/{slug}.json  ← 本番表示用
 *
 * 候補生成物（AI入力用・内部のみ）:
 *   data/scene-candidates/{slug}.json
 */

// ── 候補データ型（AI入力用・内部生成物） ──────────────────────────

/** AI に渡す候補1件分の情報 */
export interface SceneCandidateItem {
  /** fileId（/works/{workId} のURLに使う） */
  workId: string;
  type: "manga" | "novel" | "other";
  title: string;
  authorDisplay: string;
  status: "completed" | "ongoing" | "unknown";
  volumeCount: number;
  discoveryTags: string[];
  /** paceTag, depthTag, recommendedFor などの補助属性 */
  discoveryAttributes: Record<string, unknown>;
  /** スコアリングスコア（デバッグ用。本番表示には使わない） */
  _score: number;
}

/** シーンごとの候補集合（data/scene-candidates/{slug}.json） */
export interface SceneCandidates {
  slug: string;
  label: string;
  icon: string;
  description: string;
  candidates: SceneCandidateItem[];
  candidateCount: number;
  generatedAt: string;
}

// ── 選書結果型（本番表示用） ──────────────────────────────────────

/** AI が選んだ1作品分のデータ */
export interface CuratedItem {
  /** fileId（/works/{workId} へのリンク） */
  workId: string;
  /** AI が生成した推薦理由（40〜120字程度の自然な日本語） */
  reason: string;
}

/** 選書セクション（2〜3 グループに分類） */
export interface CuratedSection {
  /** セクションタイトル（例: "テンポよく読める作品"） */
  title: string;
  items: CuratedItem[];
}

/**
 * シーンごとのAI選書結果。
 * public/data/scene-curated/{slug}.json として保存し、本番ページで読む。
 */
export interface SceneCurated {
  /** シーンラベル（例: "通勤・通学"） */
  scene: string;
  slug: string;
  /** AI が生成したシーン導入文（100字程度） */
  intro: string;
  sections: CuratedSection[];
  /** 候補全件数（AI に渡した候補の件数） */
  allCandidatesCount: number;
  /** AI が選んだ件数（sections 内の全 items 合計） */
  selectedCount: number;
  generatedAt: string;
}
