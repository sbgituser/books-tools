export type BookType = "novel" | "manga" | "business" | "nonfiction" | "lightnovel";
export type ReadingSpeed = "slow" | "average" | "fast";

export interface ReadingSpeedConfig {
  type: BookType;
  label: string;
  icon: string;
  speeds: Record<ReadingSpeed, {
    charsPerMinute: number; // 日本語 文字/分
    pagesPerMinute: number; // ページ/分
    label: string;
  }>;
  avgCharsPerPage: number; // 1ページあたりの平均文字数
  description: string;
}
