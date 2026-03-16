/**
 * 著者・シリーズ事前知識定義
 *
 * AUTHOR_PRIORS / SERIES_PRIORS の外部化ファイル。
 * - variants: 表記ゆれを含む全表記（正規化後にMapキーとして登録）
 * - confidence: 0–1。prior の確かさ（将来的な重み調整用）
 * - boostL1/L2/L3: スコア加算量
 *
 * 追加方法: 配列末尾に PriorEntry を追記するだけ。
 */

export interface PriorEntry {
  /** 表記ゆれを含む全表記（大文字小文字・記号不問で書いてよい） */
  variants: string[];
  l1Id: string;
  l2Id?: string;
  l3Id?: string;
  boostL1?: number;
  boostL2?: number;
  boostL3?: number;
  /** 0–1。高いほど prior が強い補助シグナルになる（現状は参考値） */
  confidence?: number;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 著者 Prior
// ─────────────────────────────────────────────────────────────────────────────

export const AUTHOR_PRIORS_DATA: readonly PriorEntry[] = [
  // ── ミステリー ────────────────────────────────────────────────────────────
  {
    variants: ["アガサ・クリスティ", "アガサクリスティ", "agatha christie"],
    l1Id: "novel", l2Id: "mystery", l3Id: "classic-mystery",
    boostL1: 5, boostL2: 6, boostL3: 6, confidence: 0.97,
  },
  {
    variants: ["コナン・ドイル", "コナンドイル", "arthur conan doyle", "arthurconandoyle"],
    l1Id: "novel", l2Id: "mystery", l3Id: "classic-mystery",
    boostL1: 5, boostL2: 6, boostL3: 6, confidence: 0.97,
  },
  {
    variants: ["東野圭吾"],
    l1Id: "novel", l2Id: "mystery", l3Id: "suspense",
    boostL1: 5, boostL2: 10, boostL3: 4, confidence: 0.92,
    notes: "boostL2=10: 「小説・文学」タグが literary を7.0に押し上げるため",
  },
  {
    variants: ["宮部みゆき"],
    l1Id: "novel", l2Id: "mystery", l3Id: "suspense",
    boostL1: 4, boostL2: 9, boostL3: 3, confidence: 0.85,
  },
  {
    variants: ["伊坂幸太郎"],
    l1Id: "novel", l2Id: "mystery", l3Id: "suspense",
    boostL1: 4, boostL2: 10, boostL3: 3, confidence: 0.85,
  },
  {
    variants: ["横溝正史"],
    l1Id: "novel", l2Id: "mystery", l3Id: "classic-mystery",
    boostL1: 4, boostL2: 9, boostL3: 5, confidence: 0.92,
  },
  {
    variants: ["松本清張"],
    l1Id: "novel", l2Id: "mystery", l3Id: "court-social",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.88,
  },
  {
    variants: ["島田荘司"],
    l1Id: "novel", l2Id: "mystery", l3Id: "honkaku-mystery",
    boostL1: 4, boostL2: 9, boostL3: 5, confidence: 0.90,
  },
  {
    variants: ["綾辻行人"],
    l1Id: "novel", l2Id: "mystery", l3Id: "honkaku-mystery",
    boostL1: 4, boostL2: 10, boostL3: 6, confidence: 0.92,
  },
  {
    variants: ["有栖川有栖"],
    l1Id: "novel", l2Id: "mystery", l3Id: "honkaku-mystery",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.88,
  },
  {
    variants: ["湊かなえ"],
    l1Id: "novel", l2Id: "mystery", l3Id: "suspense",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.82,
  },
  {
    variants: ["道尾秀介"],
    l1Id: "novel", l2Id: "mystery", l3Id: "suspense",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.85,
  },
  {
    variants: ["今野敏"],
    l1Id: "novel", l2Id: "mystery", l3Id: "police",
    boostL1: 4, boostL2: 9, boostL3: 5, confidence: 0.82,
  },
  {
    variants: ["横山秀夫"],
    l1Id: "novel", l2Id: "mystery", l3Id: "police",
    boostL1: 4, boostL2: 9, boostL3: 5, confidence: 0.85,
  },
  {
    variants: ["中山七里"],
    l1Id: "novel", l2Id: "mystery", l3Id: "suspense",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.82,
  },
  {
    variants: ["折原一"],
    l1Id: "novel", l2Id: "mystery", l3Id: "suspense",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.85,
  },
  {
    variants: ["米澤穂信"],
    l1Id: "novel", l2Id: "mystery", l3Id: "honkaku-mystery",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.85,
  },
  {
    variants: ["辻真先"],
    l1Id: "novel", l2Id: "mystery", l3Id: "honkaku-mystery",
    boostL1: 4, boostL2: 8, boostL3: 3, confidence: 0.78,
  },
  {
    variants: ["京極夏彦"],
    l1Id: "novel", l2Id: "mystery", l3Id: "honkaku-mystery",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.82,
  },
  {
    variants: ["乃南アサ"],
    l1Id: "novel", l2Id: "mystery", l3Id: "police",
    boostL1: 4, boostL2: 9, boostL3: 5, confidence: 0.85,
  },
  {
    variants: ["堂場瞬一"],
    l1Id: "novel", l2Id: "mystery", l3Id: "police",
    boostL1: 4, boostL2: 9, boostL3: 5, confidence: 0.85,
  },
  {
    variants: ["誉田哲也"],
    l1Id: "novel", l2Id: "mystery", l3Id: "police",
    boostL1: 4, boostL2: 9, boostL3: 5, confidence: 0.85,
  },
  {
    variants: ["大沢在昌"],
    l1Id: "novel", l2Id: "mystery", l3Id: "suspense",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.85,
  },

  // ── SF ──────────────────────────────────────────────────────────────────
  {
    variants: ["アイザック・アシモフ", "アシモフ", "isaac asimov", "isaacasimov"],
    l1Id: "novel", l2Id: "sf", l3Id: "space-sf",
    boostL1: 5, boostL2: 9, boostL3: 5, confidence: 0.97,
  },
  {
    variants: ["フィリップ・k・ディック", "フィリップkディック", "philip k. dick", "philipkdick", "philip dick"],
    l1Id: "novel", l2Id: "sf", l3Id: "near-future",
    boostL1: 5, boostL2: 9, boostL3: 4, confidence: 0.97,
  },
  {
    variants: ["アーサー・c・クラーク", "アーサークラーク", "arthur c. clarke", "arthurcclarke", "arthur clarke"],
    l1Id: "novel", l2Id: "sf", l3Id: "hard-sf",
    boostL1: 5, boostL2: 9, boostL3: 4, confidence: 0.95,
  },
  {
    variants: ["ロバート・A・ハインライン", "ロバートハインライン", "robert a. heinlein", "heinlein"],
    l1Id: "novel", l2Id: "sf", l3Id: "space-sf",
    boostL1: 5, boostL2: 8, boostL3: 4, confidence: 0.93,
  },
  {
    variants: ["小松左京"],
    l1Id: "novel", l2Id: "sf", l3Id: "near-future",
    boostL1: 4, boostL2: 8, boostL3: 4, confidence: 0.90,
  },
  {
    variants: ["星新一"],
    l1Id: "novel", l2Id: "sf", l3Id: "near-future",
    boostL1: 4, boostL2: 8, boostL3: 3, confidence: 0.88,
  },
  {
    variants: ["筒井康隆"],
    l1Id: "novel", l2Id: "sf", l3Id: "near-future",
    boostL1: 4, boostL2: 8, boostL3: 3, confidence: 0.80,
  },
  {
    variants: ["劉慈欣", "りゅうじきん", "liu cixin"],
    l1Id: "novel", l2Id: "sf", l3Id: "hard-sf",
    boostL1: 5, boostL2: 8, boostL3: 5, confidence: 0.90,
  },
  {
    variants: ["テッド・チャン", "テッドチャン", "ted chiang"],
    l1Id: "novel", l2Id: "sf", l3Id: "ai-tech-sf",
    boostL1: 5, boostL2: 8, boostL3: 4, confidence: 0.90,
  },
  {
    variants: ["グレッグ・イーガン", "グレッグイーガン", "greg egan"],
    l1Id: "novel", l2Id: "sf", l3Id: "hard-sf",
    boostL1: 5, boostL2: 8, boostL3: 5, confidence: 0.93,
  },
  {
    variants: ["眉村卓"],
    l1Id: "novel", l2Id: "sf", l3Id: "near-future",
    boostL1: 4, boostL2: 7, boostL3: 3, confidence: 0.82,
  },
  {
    variants: ["瀬名秀明"],
    l1Id: "novel", l2Id: "sf", l3Id: "ai-tech-sf",
    boostL1: 4, boostL2: 7, boostL3: 3, confidence: 0.80,
  },
  {
    variants: ["森博嗣"],
    l1Id: "novel", l2Id: "mystery", l3Id: "honkaku-mystery",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.85,
  },

  // ── ファンタジー ─────────────────────────────────────────────────────────
  {
    variants: ["j.r.r.トールキン", "jrrトールキン", "トールキン", "j.r.r. tolkien", "tolkien"],
    l1Id: "novel", l2Id: "fantasy",
    boostL1: 5, boostL2: 6, confidence: 0.97,
  },
  {
    variants: ["ル・グウィン", "ル=グウィン", "ursula k. le guin", "ursula le guin", "ルグウィン"],
    l1Id: "novel", l2Id: "fantasy",
    boostL1: 5, boostL2: 5, confidence: 0.92,
  },
  {
    variants: ["j.k.ローリング", "jkローリング", "j.k. rowling", "rowling"],
    l1Id: "novel", l2Id: "fantasy",
    boostL1: 5, boostL2: 5, confidence: 0.92,
  },
  {
    variants: ["ジョージ・R・R・マーティン", "ジョージマーティン", "george r. r. martin", "george rr martin"],
    l1Id: "novel", l2Id: "fantasy",
    boostL1: 5, boostL2: 5, confidence: 0.90,
  },
  {
    variants: ["パトリック・ロスファス", "patrick rothfuss"],
    l1Id: "novel", l2Id: "fantasy",
    boostL1: 5, boostL2: 5, confidence: 0.88,
  },
  {
    variants: ["田中芳樹"],
    l1Id: "novel", l2Id: "fantasy",
    boostL1: 4, boostL2: 3, confidence: 0.75,
    notes: "銀河英雄伝説はSFでもある",
  },

  // ── 純文学 ───────────────────────────────────────────────────────────────
  {
    variants: ["村上春樹"],
    l1Id: "novel", l2Id: "literary",
    boostL1: 5, boostL2: 5, confidence: 0.90,
  },
  {
    variants: ["夏目漱石"],
    l1Id: "novel", l2Id: "literary", l3Id: "jp-literature",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.97,
  },
  {
    variants: ["芥川龍之介"],
    l1Id: "novel", l2Id: "literary", l3Id: "jp-literature",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.97,
  },
  {
    variants: ["太宰治"],
    l1Id: "novel", l2Id: "literary", l3Id: "jp-literature",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.97,
  },
  {
    variants: ["川端康成"],
    l1Id: "novel", l2Id: "literary", l3Id: "jp-literature",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.97,
  },
  {
    variants: ["三島由紀夫"],
    l1Id: "novel", l2Id: "literary", l3Id: "jp-literature",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.97,
  },
  {
    variants: ["大江健三郎"],
    l1Id: "novel", l2Id: "literary", l3Id: "jp-literature",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.93,
  },
  {
    variants: ["谷崎潤一郎"],
    l1Id: "novel", l2Id: "literary", l3Id: "jp-literature",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.97,
  },
  {
    variants: ["志賀直哉"],
    l1Id: "novel", l2Id: "literary", l3Id: "jp-literature",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.97,
  },
  {
    variants: ["フランツ・カフカ", "カフカ", "franz kafka"],
    l1Id: "novel", l2Id: "literary", l3Id: "foreign-literature",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.90,
  },
  {
    variants: ["ドストエフスキー", "fyodor dostoevsky", "dostoevsky"],
    l1Id: "novel", l2Id: "literary", l3Id: "foreign-literature",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.97,
  },
  {
    variants: ["レフ・トルストイ", "トルストイ", "leo tolstoy", "tolstoy"],
    l1Id: "novel", l2Id: "literary", l3Id: "foreign-literature",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.92,
  },
  {
    variants: ["アルベール・カミュ", "カミュ", "albert camus", "camus"],
    l1Id: "novel", l2Id: "literary", l3Id: "foreign-literature",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.90,
  },
  {
    variants: ["ガブリエル・ガルシア・マルケス", "ガルシアマルケス", "garcia marquez", "gabriel garcia marquez"],
    l1Id: "novel", l2Id: "literary", l3Id: "foreign-literature",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.90,
  },
  {
    variants: ["マルセル・プルースト", "プルースト", "marcel proust"],
    l1Id: "novel", l2Id: "literary", l3Id: "foreign-literature",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.92,
  },
  {
    variants: ["ジェームズ・ジョイス", "ジョイス", "james joyce"],
    l1Id: "novel", l2Id: "literary", l3Id: "foreign-literature",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.90,
  },
  {
    variants: ["オルハン・パムク", "パムク", "orhan pamuk"],
    l1Id: "novel", l2Id: "literary", l3Id: "foreign-literature",
    boostL1: 5, boostL2: 4, boostL3: 4, confidence: 0.87,
  },

  // ── 純文学 ─────────────────────────────────────────────────────────────
  {
    variants: ["村上春樹"],
    l1Id: "novel", l2Id: "literary", l3Id: "modern-literature",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.90,
  },
  {
    variants: ["辻村深月"],
    l1Id: "novel", l2Id: "literary", l3Id: "modern-literature",
    boostL1: 4, boostL2: 9, boostL3: 5, confidence: 0.82,
  },
  {
    variants: ["浅田次郎"],
    l1Id: "novel", l2Id: "literary", l3Id: "modern-literature",
    boostL1: 4, boostL2: 8, boostL3: 4, confidence: 0.78,
  },
  {
    variants: ["角田光代"],
    l1Id: "novel", l2Id: "literary", l3Id: "modern-literature",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.80,
  },
  {
    variants: ["桐野夏生"],
    l1Id: "novel", l2Id: "literary", l3Id: "modern-literature",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.80,
  },
  {
    variants: ["高村薫"],
    l1Id: "novel", l2Id: "literary", l3Id: "modern-literature",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.82,
  },
  {
    variants: ["小川洋子"],
    l1Id: "novel", l2Id: "literary", l3Id: "modern-literature",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.80,
  },
  {
    variants: ["恩田陸"],
    l1Id: "novel", l2Id: "literary", l3Id: "modern-literature",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.78,
  },
  {
    variants: ["森見登美彦"],
    l1Id: "novel", l2Id: "literary", l3Id: "modern-literature",
    boostL1: 4, boostL2: 8, boostL3: 4, confidence: 0.78,
  },
  {
    variants: ["西加奈子"],
    l1Id: "novel", l2Id: "literary", l3Id: "modern-literature",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.80,
  },
  {
    variants: ["朝井リョウ"],
    l1Id: "novel", l2Id: "literary", l3Id: "award",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.82,
  },
  {
    variants: ["又吉直樹"],
    l1Id: "novel", l2Id: "literary", l3Id: "award",
    boostL1: 4, boostL2: 9, boostL3: 5, confidence: 0.88,
  },
  {
    variants: ["川上未映子"],
    l1Id: "novel", l2Id: "literary", l3Id: "award",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.82,
  },

  // ── エンタメ小説 ─────────────────────────────────────────────────────────
  {
    variants: ["池井戸潤"],
    l1Id: "novel", l2Id: "entertainment", l3Id: "movie-adapted",
    boostL1: 4, boostL2: 9, boostL3: 3, confidence: 0.85,
  },
  {
    variants: ["百田尚樹"],
    l1Id: "novel",
    boostL1: 4, confidence: 0.75,
    notes: "歴史小説・エンタメ両方あり",
  },
  {
    variants: ["重松清"],
    l1Id: "novel", l2Id: "youth", l3Id: "growth",
    boostL1: 4, boostL2: 8, boostL3: 3, confidence: 0.75,
  },
  {
    variants: ["住野よる"],
    l1Id: "novel", l2Id: "youth", l3Id: "school",
    boostL1: 4, boostL2: 9, boostL3: 4, confidence: 0.82,
  },
  {
    variants: ["瀬尾まいこ"],
    l1Id: "novel", l2Id: "youth", l3Id: "growth",
    boostL1: 4, boostL2: 8, boostL3: 3, confidence: 0.78,
  },

  // ── 歴史小説 ─────────────────────────────────────────────────────────────
  {
    variants: ["司馬遼太郎"],
    l1Id: "novel", l2Id: "historical-novel", l3Id: "sengoku-bakumatsu",
    boostL1: 5, boostL2: 9, boostL3: 4, confidence: 0.95,
  },
  {
    variants: ["吉川英治"],
    l1Id: "novel", l2Id: "historical-novel", l3Id: "sengoku-bakumatsu",
    boostL1: 5, boostL2: 9, boostL3: 4, confidence: 0.95,
  },
  {
    variants: ["池波正太郎"],
    l1Id: "novel", l2Id: "historical-novel", l3Id: "jp-history",
    boostL1: 5, boostL2: 9, boostL3: 4, confidence: 0.95,
  },
  {
    variants: ["隆慶一郎"],
    l1Id: "novel", l2Id: "historical-novel", l3Id: "sengoku-bakumatsu",
    boostL1: 5, boostL2: 9, boostL3: 4, confidence: 0.95,
  },
  {
    variants: ["藤沢周平"],
    l1Id: "novel", l2Id: "historical-novel", l3Id: "jp-history",
    boostL1: 5, boostL2: 9, boostL3: 4, confidence: 0.93,
  },
  {
    variants: ["山岡荘八"],
    l1Id: "novel", l2Id: "historical-novel", l3Id: "sengoku-bakumatsu",
    boostL1: 4, boostL2: 8, boostL3: 4, confidence: 0.88,
  },

  // ── ホラー ───────────────────────────────────────────────────────────────
  {
    variants: ["スティーブン・キング", "スティーブンキング", "stephen king"],
    l1Id: "novel", l2Id: "horror",
    boostL1: 5, boostL2: 5, confidence: 0.92,
  },
  {
    variants: ["小野不由美"],
    l1Id: "novel", l2Id: "horror",
    boostL1: 4, boostL2: 3, confidence: 0.78,
    notes: "ホラー・ファンタジー両方あり",
  },

  // ── 哲学・思想 ───────────────────────────────────────────────────────────
  {
    variants: ["カント", "イマヌエル・カント", "immanuel kant"],
    l1Id: "philosophy", l2Id: "western", l3Id: "philosophy-history",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.97,
  },
  {
    variants: ["ニーチェ", "フリードリヒ・ニーチェ", "friedrich nietzsche", "nietzsche"],
    l1Id: "philosophy", l2Id: "western",
    boostL1: 5, boostL2: 5, confidence: 0.92,
  },
  {
    variants: ["デカルト", "ルネ・デカルト", "rene descartes", "descartes"],
    l1Id: "philosophy", l2Id: "western",
    boostL1: 5, boostL2: 5, confidence: 0.92,
  },
  {
    variants: ["プラトン", "plato"],
    l1Id: "philosophy", l2Id: "western", l3Id: "philosophy-history",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.97,
  },
  {
    variants: ["ソクラテス", "socrates"],
    l1Id: "philosophy", l2Id: "western", l3Id: "philosophy-history",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.95,
  },
  {
    variants: ["アリストテレス", "aristotle"],
    l1Id: "philosophy", l2Id: "western", l3Id: "philosophy-history",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.97,
  },
  {
    variants: ["マルティン・ハイデガー", "ハイデガー", "martin heidegger", "heidegger"],
    l1Id: "philosophy", l2Id: "western",
    boostL1: 5, boostL2: 5, confidence: 0.92,
  },
  {
    variants: ["ジャン＝ポール・サルトル", "サルトル", "jean-paul sartre", "sartre"],
    l1Id: "philosophy", l2Id: "western", l3Id: "existentialism",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.93,
  },
  {
    variants: ["ハンナ・アーレント", "アーレント", "hannah arendt"],
    l1Id: "philosophy", l2Id: "western",
    boostL1: 5, boostL2: 4, confidence: 0.88,
  },
  {
    variants: ["バートランド・ラッセル", "ラッセル", "bertrand russell"],
    l1Id: "philosophy", l2Id: "western",
    boostL1: 5, boostL2: 4, confidence: 0.85,
  },
  {
    variants: ["老子", "ろうし"],
    l1Id: "philosophy", l2Id: "eastern", l3Id: "taoism",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.95,
  },
  {
    variants: ["孔子", "こうし"],
    l1Id: "philosophy", l2Id: "eastern", l3Id: "confucianism",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.95,
  },

  // ── 心理学・行動経済学 ────────────────────────────────────────────────────
  {
    variants: ["ダニエル・カーネマン", "ダニエルカーネマン", "daniel kahneman", "kahneman"],
    l1Id: "psychology", l2Id: "behavioral-econ",
    boostL1: 5, boostL2: 5, confidence: 0.92,
  },
  {
    variants: ["リチャード・セイラー", "リチャードセイラー", "richard thaler", "thaler"],
    l1Id: "psychology", l2Id: "behavioral-econ",
    boostL1: 5, boostL2: 5, confidence: 0.92,
  },
  {
    variants: ["ロバート・チャルディーニ", "チャルディーニ", "robert cialdini", "cialdini"],
    l1Id: "psychology", l2Id: "social-psych",
    boostL1: 5, boostL2: 4, confidence: 0.87,
  },
  {
    variants: ["アンジェラ・ダックワース", "アンジェラダックワース", "angela duckworth"],
    l1Id: "psychology",
    boostL1: 4, confidence: 0.82,
  },
  {
    variants: ["マーティン・セリグマン", "セリグマン", "martin seligman", "seligman"],
    l1Id: "psychology",
    boostL1: 4, confidence: 0.82,
  },

  // ── 科学 ─────────────────────────────────────────────────────────────────
  {
    variants: ["スティーブン・ホーキング", "スティーブンホーキング", "stephen hawking", "hawking"],
    l1Id: "science", l2Id: "physics-space",
    boostL1: 5, boostL2: 5, confidence: 0.93,
  },
  {
    variants: ["リチャード・ドーキンス", "リチャードドーキンス", "richard dawkins", "dawkins"],
    l1Id: "science", l2Id: "bio-med",
    boostL1: 5, boostL2: 4, confidence: 0.87,
  },
  {
    variants: ["カール・セーガン", "カールセーガン", "carl sagan", "sagan"],
    l1Id: "science", l2Id: "physics-space",
    boostL1: 5, boostL2: 5, confidence: 0.90,
  },
  {
    variants: ["アルベルト・アインシュタイン", "アインシュタイン", "albert einstein", "einstein"],
    l1Id: "science", l2Id: "physics-space",
    boostL1: 4, boostL2: 4, confidence: 0.85,
    notes: "伝記・解説書も多い",
  },
  {
    variants: ["チャールズ・ダーウィン", "ダーウィン", "charles darwin", "darwin"],
    l1Id: "science", l2Id: "bio-med", l3Id: "evolution",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.93,
  },

  // ── ビジネス ─────────────────────────────────────────────────────────────
  {
    variants: ["ピーター・ドラッカー", "ピータードラッカー", "peter drucker", "drucker"],
    l1Id: "business", l2Id: "management", l3Id: "org-management",
    boostL1: 5, boostL2: 5, boostL3: 4, confidence: 0.93,
  },
  {
    variants: ["マイケル・ポーター", "マイケルポーター", "michael porter", "porter"],
    l1Id: "business", l2Id: "management", l3Id: "business-strategy",
    boostL1: 5, boostL2: 5, boostL3: 5, confidence: 0.93,
  },
  {
    variants: ["クレイトン・クリステンセン", "クリステンセン", "clayton christensen", "christensen"],
    l1Id: "business", l2Id: "management", l3Id: "business-strategy",
    boostL1: 5, boostL2: 4, boostL3: 3, confidence: 0.90,
  },
  {
    variants: ["デール・カーネギー", "デールカーネギー", "dale carnegie", "carnegie"],
    l1Id: "self-help", l2Id: "communication",
    boostL1: 5, boostL2: 4, confidence: 0.90,
  },
  {
    variants: ["スティーブン・コヴィー", "スティーブンコヴィー", "stephen covey", "covey"],
    l1Id: "self-help", l2Id: "habit",
    boostL1: 5, boostL2: 4, confidence: 0.90,
  },
  {
    variants: ["フィリップ・コトラー", "フィリップコトラー", "philip kotler", "kotler"],
    l1Id: "business", l2Id: "marketing", l3Id: "digital-marketing",
    boostL1: 5, boostL2: 5, boostL3: 3, confidence: 0.90,
  },
  {
    variants: ["ロバート・キヨサキ", "ロバートキヨサキ", "robert kiyosaki", "kiyosaki"],
    l1Id: "investing", l2Id: "asset-building",
    boostL1: 5, boostL2: 4, confidence: 0.88,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// シリーズ Prior
// ─────────────────────────────────────────────────────────────────────────────

export const SERIES_PRIORS_DATA: readonly PriorEntry[] = [
  {
    variants: ["シャーロック・ホームズ", "シャーロックホームズ", "sherlock holmes"],
    l1Id: "novel", l2Id: "mystery", l3Id: "classic-mystery",
    boostL1: 5, boostL2: 6, boostL3: 6, confidence: 0.99,
  },
  {
    variants: ["エルキュール・ポアロ", "エルキュールポアロ", "hercule poirot", "ポアロ"],
    l1Id: "novel", l2Id: "mystery", l3Id: "classic-mystery",
    boostL1: 4, boostL2: 6, boostL3: 6, confidence: 0.99,
  },
  {
    variants: ["ミス・マープル", "ミスマープル", "jane marple", "マープル"],
    l1Id: "novel", l2Id: "mystery", l3Id: "classic-mystery",
    boostL1: 4, boostL2: 6, boostL3: 6, confidence: 0.99,
  },
  {
    variants: ["金田一耕助", "金田一"],
    l1Id: "novel", l2Id: "mystery", l3Id: "classic-mystery",
    boostL1: 4, boostL2: 5, boostL3: 4, confidence: 0.95,
  },
  {
    variants: ["加賀恭一郎"],
    l1Id: "novel", l2Id: "mystery",
    boostL1: 4, boostL2: 4, confidence: 0.90,
    notes: "東野圭吾 加賀刑事シリーズ",
  },
  {
    variants: ["ガリレオ", "湯川学"],
    l1Id: "novel", l2Id: "mystery",
    boostL1: 4, boostL2: 4, confidence: 0.88,
    notes: "東野圭吾 ガリレオシリーズ",
  },
  {
    variants: ["銀河帝国", "ファウンデーション", "foundation"],
    l1Id: "novel", l2Id: "sf", l3Id: "space-sf",
    boostL1: 4, boostL2: 5, boostL3: 4, confidence: 0.92,
  },
  {
    variants: ["ハリー・ポッター", "ハリーポッター", "harry potter"],
    l1Id: "novel", l2Id: "fantasy",
    boostL1: 5, boostL2: 5, confidence: 0.99,
  },
  {
    variants: ["指輪物語", "ロード・オブ・ザ・リング", "ロードオブザリング", "lord of the rings"],
    l1Id: "novel", l2Id: "fantasy", l3Id: "adventure-fantasy",
    boostL1: 5, boostL2: 6, boostL3: 4, confidence: 0.99,
  },
  {
    variants: ["三体", "the three-body problem"],
    l1Id: "novel", l2Id: "sf",
    boostL1: 5, boostL2: 5, confidence: 0.95,
  },
  {
    variants: ["銀河英雄伝説"],
    l1Id: "novel", l2Id: "sf",
    boostL1: 5, boostL2: 5, confidence: 0.95,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Map 構築（表記ゆれを正規化キーに変換）
// ─────────────────────────────────────────────────────────────────────────────

function normalizeVariant(v: string): string {
  return v
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function buildFlatMap(data: readonly PriorEntry[]): Map<string, PriorEntry> {
  const map = new Map<string, PriorEntry>();
  for (const entry of data) {
    for (const variant of entry.variants) {
      const key = normalizeVariant(variant);
      if (key && !map.has(key)) map.set(key, entry);
    }
  }
  return map;
}

export const AUTHOR_PRIORS_MAP: Map<string, PriorEntry> = buildFlatMap(AUTHOR_PRIORS_DATA);
export const SERIES_PRIORS_MAP: Map<string, PriorEntry> = buildFlatMap(SERIES_PRIORS_DATA);
