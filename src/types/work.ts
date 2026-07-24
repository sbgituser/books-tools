/**
 * work.ts
 *
 * 小説・漫画に特化した作品(Work)・巻(Volume)の型定義。
 * 発見支援サイトとして、discovery metadata を拡張可能な形で保持する。
 */

// ── 基本型 ────────────────────────────────────────────────────────

export type WorkType = "manga" | "novel" | "other";
export type WorkStatus = "ongoing" | "completed" | "unknown";

/**
 * 発見用タグ。固定カラムではなく string[] にすることで後から追加しやすくする。
 * 例: "泣ける", "ダーク", "爽快", "頭脳戦", "一気読み", "日常系", "成長"
 */
export type DiscoveryTag = string;

/**
 * 発見用属性。key-value で任意の軸を追加できる拡張可能構造。
 * 例: { paceTag: "早い", depthTag: "重い", completionStatus: "完結" }
 */
export type DiscoveryAttributes = Record<string, string | string[] | boolean | number>;

// ── 作品(Work) ────────────────────────────────────────────────────

/**
 * 作品単位のデータ。シリーズ全体を表す。
 * 一覧表示・発見機能の主役エンティティ。
 */
export interface Work {
  workId: string;
  type: WorkType;
  title: string;
  titleNormalized: string;
  titleKana?: string;
  authorDisplay: string;
  authors: string[];
  publisherMain?: string;
  labelMain?: string;
  summaryShort?: string;
  description?: string;
  status: WorkStatus;
  /** status の根拠。"explicit"=元データで明示、"inferred"=巻の発売日から推定、未設定=不明時代からのデータ */
  statusSource?: "explicit" | "inferred";
  volumeCount: number;
  firstPublishedDate?: string;
  latestPublishedDate?: string;
  coverImageUrl?: string;
  /** L2カテゴリID (例: "mystery", "shonen") */
  l2Id?: string;
  /** L3カテゴリID (例: "honkaku-mystery", "battle") */
  l3Id?: string;
  /** 発見タグ。後付けで追加しやすい文字列配列 */
  discoveryTags: DiscoveryTag[];
  /** 発見属性。key-value で任意軸を拡張可能 */
  discoveryAttributes: DiscoveryAttributes;
  /** 関連作品ID。類似作品導線に使う */
  relatedWorkIds: string[];
  /** この作品が持つ巻ID一覧 */
  volumeIds: string[];
}

// ── 巻(Volume) ────────────────────────────────────────────────────

/**
 * 巻単位のデータ。作品詳細ページで表示する。
 */
export interface Volume {
  volumeId: string;
  workId: string;
  /** 巻番号。null は番号なし（単巻・不明）*/
  volumeNo: number | null;
  /** 表示用ラベル。例: "第1巻", "上巻", "完全版" */
  volumeLabel: string;
  title: string;
  publishedDate?: string;
  isbn13?: string;
  pageCount?: number;
  coverImageUrl?: string;
  /** GoogleBooks ID (画像取得用) */
  googleBooksId?: string;
}

// ── 一覧表示用軽量型 ──────────────────────────────────────────────

/**
 * 作品一覧・発見機能用の軽量データ。
 * 詳細ページ遷移前に読み込む最小セット。
 */
export interface WorkListItem {
  workId: string;
  type: WorkType;
  title: string;
  authorDisplay: string;
  status: WorkStatus;
  volumeCount: number;
  coverImageUrl?: string;
  discoveryTags: DiscoveryTag[];
  firstPublishedDate?: string;
  latestPublishedDate?: string;
}

// ── 詳細表示用型 ──────────────────────────────────────────────────

/**
 * 作品詳細ページ用データ。巻一覧を含む。
 */
export interface WorkDetail extends Work {
  volumes: Volume[];
}

// ── 発見インデックス型 ────────────────────────────────────────────

/**
 * タグ → WorkListItem[] のマッピング。
 * discovery-index.json として生成し、発見機能で使う。
 */
export interface DiscoveryIndex {
  /** タグ名 → workId[] */
  tagIndex: Record<DiscoveryTag, string[]>;
  /** workId → WorkListItem (発見機能での作品表示用) */
  works: Record<string, WorkListItem>;
  /** 利用可能なタグ一覧（表示順） */
  availableTags: DiscoveryTag[];
  generatedAt: string;
}

// ── 読書シーン型 ──────────────────────────────────────────────────

/**
 * シーン別作品一覧。/public/data/scenes/{slug}.json として生成。
 */
export interface SceneWorksData {
  slug: string;
  label: string;
  icon: string;
  description: string;
  works: WorkListItem[];
  totalCount: number;
  generatedAt: string;
}

/**
 * 全シーンのメタ情報。/public/data/scenes/index.json として生成。
 * シーン選択UIで作品数バッジを表示するために使う。
 */
export interface SceneIndexMeta {
  scenes: Array<{
    slug: string;
    label: string;
    icon: string;
    description: string;
    count: number;
  }>;
  generatedAt: string;
}

// ── 既存型との互換ブリッジ ────────────────────────────────────────

/**
 * books.index.json の既存エントリ型（正規化スクリプト内で使用）
 */
export interface LegacyBookEntry {
  id: string;
  title: string;
  authors: string[];
  subtitle?: string;
  publisher?: string;
  publishedDate?: string;
  isbn13?: string;
  pageCount?: number;
  estimatedReadingHours?: number;
  thumbnailUrl?: string;
  sourceIds?: { googleBooksId?: string };
  manualClassification?: {
    l1Id: string;
    l2Id?: string;
    l3Id?: string;
    l4TagIds?: string[];
  };
  moodTags?: {
    emotionalTags?: string[];
    purposeTags?: string[];
    atmosphereTags?: string[];
    paceTag?: string;
    depthTag?: string;
    readingEaseTag?: string;
    completionStatus?: string;
    estimatedReadingTimeCategory?: string;
    recommendationCatch?: string;
    recommendedFor?: string[];
  };
}
