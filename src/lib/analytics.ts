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

/** 書籍比較ツールを開いたとき */
export function trackBookCompareOpen(params: {
  baseBookId: string;
  baseBookTitle: string;
  /** browser = 書籍ブラウザから遷移, direct = 直接アクセス */
  source: "browser" | "direct";
}) {
  if (!isGtagAvailable()) return;
  gtag("event", "book_compare_open", {
    base_book_id: params.baseBookId,
    base_book_title: params.baseBookTitle,
    source: params.source,
  });
}

// ── 検索イベント ──────────────────────────────────────────────────

/** 検索を実行したとき */
export function trackSearchExecuted(params: {
  query: string;
  resultCount: number;
  mode: "simple" | "advanced";
}) {
  if (!isGtagAvailable()) return;
  gtag("event", "search_executed", {
    query: params.query,
    result_count: params.resultCount,
    mode: params.mode,
  });
}

/** 検索結果が0件だったとき */
export function trackSearchZeroResult(params: {
  query: string;
  mode: "simple" | "advanced";
}) {
  if (!isGtagAvailable()) return;
  gtag("event", "search_zero_result", {
    query: params.query,
    mode: params.mode,
  });
}

/** 検索サジェストをクリックしたとき */
export function trackSearchSuggestionClicked(params: {
  query: string;
  suggestionType: "title" | "author" | "isbn" | "category";
  suggestionValue: string;
}) {
  if (!isGtagAvailable()) return;
  gtag("event", "search_suggestion_clicked", {
    query: params.query,
    suggestion_type: params.suggestionType,
    suggestion_value: params.suggestionValue,
  });
}

/** 検索結果の本をクリックしたとき */
export function trackSearchResultClicked(params: {
  query: string;
  bookId: string;
  bookTitle: string;
  rank: number;
}) {
  if (!isGtagAvailable()) return;
  gtag("event", "search_result_clicked", {
    query: params.query,
    book_id: params.bookId,
    book_title: params.bookTitle,
    rank: params.rank,
  });
}

/** 検索結果から既存ツールへ遷移したとき */
export function trackRelatedToolClicked(params: {
  tool: "book_compare" | "similar_books" | "adaptation_originals" | "original_reverse";
  bookId: string;
  bookTitle: string;
  source: "search_result";
}) {
  if (!isGtagAvailable()) return;
  gtag("event", "related_tool_clicked", {
    tool: params.tool,
    book_id: params.bookId,
    book_title: params.bookTitle,
    source: params.source,
  });
}

/** 検索のフィルタ・ソートを変更したとき */
export function trackSearchFilterChanged(params: {
  filterType: string;
  filterValue: string;
}) {
  if (!isGtagAvailable()) return;
  gtag("event", "search_filter_changed", {
    filter_type: params.filterType,
    filter_value: params.filterValue,
  });
}

// ── 既存イベント ──────────────────────────────────────────────────

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
