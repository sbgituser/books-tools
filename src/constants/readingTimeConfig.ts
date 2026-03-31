import type { BookType, ReadingSpeedConfig } from "@/types/reading-time";

export const READING_SPEEDS: ReadingSpeedConfig[] = [
  {
    type: "novel",
    label: "小説",
    icon: "📖",
    speeds: {
      slow:    { charsPerMinute: 400, pagesPerMinute: 0.7, label: "ゆっくり" },
      average: { charsPerMinute: 600, pagesPerMinute: 1.0, label: "ふつう" },
      fast:    { charsPerMinute: 800, pagesPerMinute: 1.5, label: "はやい" },
    },
    avgCharsPerPage: 600,
    description: "一般的な文庫本・単行本の小説",
  },
  {
    type: "manga",
    label: "漫画",
    icon: "📕",
    speeds: {
      slow:    { charsPerMinute: 1200, pagesPerMinute: 3.0, label: "じっくり" },
      average: { charsPerMinute: 2000, pagesPerMinute: 5.0, label: "ふつう" },
      fast:    { charsPerMinute: 3000, pagesPerMinute: 8.0, label: "さくさく" },
    },
    avgCharsPerPage: 200,
    description: "一般的なコミック（1巻あたり約200ページ）",
  },
  {
    type: "business",
    label: "ビジネス書",
    icon: "💼",
    speeds: {
      slow:    { charsPerMinute: 300, pagesPerMinute: 0.5, label: "じっくり" },
      average: { charsPerMinute: 500, pagesPerMinute: 0.8, label: "ふつう" },
      fast:    { charsPerMinute: 700, pagesPerMinute: 1.2, label: "はやい" },
    },
    avgCharsPerPage: 700,
    description: "図表を含むビジネス書・実用書",
  },
  {
    type: "nonfiction",
    label: "ノンフィクション",
    icon: "📰",
    speeds: {
      slow:    { charsPerMinute: 350, pagesPerMinute: 0.6, label: "じっくり" },
      average: { charsPerMinute: 550, pagesPerMinute: 0.9, label: "ふつう" },
      fast:    { charsPerMinute: 750, pagesPerMinute: 1.3, label: "はやい" },
    },
    avgCharsPerPage: 650,
    description: "ルポルタージュ、科学読み物等",
  },
  {
    type: "lightnovel",
    label: "ライトノベル",
    icon: "✨",
    speeds: {
      slow:    { charsPerMinute: 500, pagesPerMinute: 1.0, label: "ゆっくり" },
      average: { charsPerMinute: 700, pagesPerMinute: 1.5, label: "ふつう" },
      fast:    { charsPerMinute: 1000, pagesPerMinute: 2.0, label: "はやい" },
    },
    avgCharsPerPage: 500,
    description: "イラスト付きのライトノベル",
  },
];

// 人気書籍のプリセット（クイック計算用）
export const POPULAR_BOOKS_PRESETS = [
  { title: "ハリー・ポッターと賢者の石", pages: 472, type: "novel" as BookType },
  { title: "鬼滅の刃 1巻", pages: 192, type: "manga" as BookType },
  { title: "嫌われる勇気", pages: 296, type: "business" as BookType },
  { title: "コンビニ人間", pages: 163, type: "novel" as BookType },
  { title: "ワンピース 1巻", pages: 208, type: "manga" as BookType },
  { title: "サピエンス全史（上）", pages: 300, type: "nonfiction" as BookType },
  { title: "転生したらスライムだった件 1巻", pages: 302, type: "lightnovel" as BookType },
  { title: "火花", pages: 153, type: "novel" as BookType },
];
