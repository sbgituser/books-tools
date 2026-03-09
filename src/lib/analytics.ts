/**
 * analytics.ts
 *
 * Google Analytics 4 カスタムイベント
 *
 * 収集イベント:
 *   book_select      … 書籍一覧からクリックして類似本ビューへ遷移
 *   similar_navigate … 類似本リスト内でクリックして別の本の類似本を表示
 */

declare function gtag(...args: unknown[]): void;

function isGtagAvailable(): boolean {
  return typeof window !== "undefined" && typeof gtag === "function";
}

/** 書籍一覧から書籍をクリックして類似本ビューへ遷移したとき */
export function trackBookSelect(params: {
  bookId: string;
  bookTitle: string;
  l1CategoryId: string;
  l1CategoryLabel: string;
  /** クリック元のカテゴリパス（L2以降のラベルを ">" でつないだ文字列） */
  catPath: string;
}) {
  if (!isGtagAvailable()) return;
  gtag("event", "book_select", {
    book_id: params.bookId,
    book_title: params.bookTitle,
    l1_category_id: params.l1CategoryId,
    l1_category_label: params.l1CategoryLabel,
    cat_path: params.catPath,
  });
}

/** 類似本リストからクリックして別の本の類似本ビューへ遷移したとき */
export function trackSimilarNavigate(params: {
  fromBookId: string;
  fromBookTitle: string;
  toBookId: string;
  toBookTitle: string;
  /** 類似本リスト中の表示順（1始まり） */
  rank: number;
}) {
  if (!isGtagAvailable()) return;
  gtag("event", "similar_navigate", {
    from_book_id: params.fromBookId,
    from_book_title: params.fromBookTitle,
    to_book_id: params.toBookId,
    to_book_title: params.toBookTitle,
    rank: params.rank,
  });
}
