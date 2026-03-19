/**
 * similar-works.ts
 *
 * 類似作品データの型定義。
 * data/similar-works/{fileId}.json として保存し、
 * 作品詳細ページで「似た作品」セクションに利用する。
 *
 * 既存の Work / Volume データ構造は変更せず、補助生成物として追加。
 */

import type { WorkType, WorkStatus } from "./work";

// ── 類似グループ種別 ──────────────────────────────────────────────

export type SimilarGroupType =
  | "same_author"       // 同じ著者の作品
  | "same_publisher"    // 同じ出版社・レーベルの作品
  | "similar_taste";    // 読み味が近い作品

// ── 類似作品アイテム ──────────────────────────────────────────────

/**
 * 類似作品の1アイテム。
 * 表示に必要な情報をすべて埋め込んでおくことで、
 * ページ側での追加ルックアップを不要にする。
 */
export interface SimilarWorkItem {
  /** 内部識別子（workId）*/
  workId: string;
  /** URL /works/{fileId} に使うハッシュ ID */
  fileId: string;
  title: string;
  authorDisplay: string;
  type: WorkType;
  status: WorkStatus;
  volumeCount: number;
  coverImageUrl?: string;
  /** 類似理由（1行）*/
  reason: string;
}

// ── 類似グループ ──────────────────────────────────────────────────

export interface SimilarGroup {
  /** グループ種別 */
  type: SimilarGroupType;
  /** 表示用タイトル */
  title: string;
  items: SimilarWorkItem[];
}

// ── 類似作品データ（per-work）────────────────────────────────────

export interface SimilarWorks {
  /** 対象作品の workId */
  workId: string;
  /** groups が空配列の場合は表示しない */
  groups: SimilarGroup[];
  generatedAt: string;
}
