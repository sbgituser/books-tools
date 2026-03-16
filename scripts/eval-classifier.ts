/**
 * eval-classifier.ts — 分類ロジック評価・デバッグスクリプト
 *
 * 使い方:
 *   npx tsx scripts/eval-classifier.ts              # 全サンプル評価
 *   npx tsx scripts/eval-classifier.ts --explain    # 詳細スコア出力
 *   npx tsx scripts/eval-classifier.ts --id "blog-進撃の巨人-諫山創"  # 特定書籍
 *
 * 実データ検証:
 *   npx tsx scripts/eval-classifier.ts --data       # books.index.jsonで誤分類チェック
 */

import { readFileSync } from "fs";
import { join } from "path";
import {
  resolveBookClassification,
  classifyBookWithExplain,
  type ClassifiableBook,
} from "../src/lib/categoryClassifier";

// ─────────────────────────────────────────────────────────────────────────────
// サンプルテストケース
// ─────────────────────────────────────────────────────────────────────────────

interface TestCase {
  id: string;
  title: string;
  author?: string;
  subjects?: string[];     // Google Books subjects (高重みでL2判定に効く)
  searchableText?: string;
  expectedL1: string;
  expectedL2?: string;
  expectedL3?: string;
  note?: string;
}

const TEST_CASES: TestCase[] = [
  // ── ビジネス ──
  {
    id: "t-business-1",
    title: "ゼロ・トゥ・ワン 君はゼロから何を生み出せるか",
    author: "ピーター・ティール",
    subjects: ["起業", "スタートアップ", "イノベーション"],
    searchableText: "スタートアップ 起業 経営 イノベーション ビジネス",
    expectedL1: "business",
    expectedL2: "startup",
    note: "スタートアップの定番書",
  },
  {
    id: "t-business-2",
    title: "FACTFULNESS（ファクトフルネス）",
    author: "ハンス・ロスリング",
    subjects: ["ビジネス", "経営", "社会"],
    searchableText: "ビジネス 思い込み 世界 事実 経済",
    expectedL1: "business",
    note: "データ思考系ビジネス書(subjectsにビジネス)",
  },
  {
    id: "t-business-3",
    title: "コトラーのマーケティング・マネジメント",
    author: "フィリップ・コトラー",
    searchableText: "マーケティング 戦略 ブランド 顧客 市場",
    expectedL1: "business",
    expectedL2: "marketing",
    note: "マーケティング古典",
  },

  // ── テック ──
  {
    id: "t-tech-1",
    title: "Pythonで始める機械学習",
    author: "Andreas C. Müller",
    searchableText: "Python 機械学習 scikit-learn データ アルゴリズム",
    expectedL1: "tech",
    expectedL2: "ai-ml",
    note: "ML技術書",
  },
  {
    id: "t-tech-2",
    title: "リーダブルコード",
    author: "Dustin Boswell",
    searchableText: "プログラミング コード 可読性 設計 ソフトウェア",
    expectedL1: "tech",
    expectedL2: "programming",
    note: "プログラミング入門書",
  },

  // ── 自己啓発 ──
  {
    id: "t-selfhelp-1",
    title: "7つの習慣 成功には原則があった",
    author: "スティーブン・R・コヴィー",
    searchableText: "習慣 成功 人生 原則 リーダーシップ 自己啓発",
    expectedL1: "self-help",
    note: "自己啓発の定番",
  },
  {
    id: "t-selfhelp-2",
    title: "嫌われる勇気 自己啓発の源流「アドラー」の教え",
    author: "岸見一郎",
    searchableText: "アドラー 哲学 心理学 勇気 自己啓発 人間関係",
    expectedL1: "self-help",
    note: "アドラー心理学 — 自己啓発寄り",
  },

  // ── 投資 ──
  {
    id: "t-investing-1",
    title: "バフェットの株主への手紙",
    author: "ウォーレン・バフェット",
    searchableText: "投資 株式 バリュー投資 資産運用 株主",
    expectedL1: "investing",
    note: "投資の古典",
  },
  {
    id: "t-investing-2",
    title: "インデックス投資は勝者のゲーム",
    author: "ジョン・C・ボーグル",
    searchableText: "インデックス 投資信託 NISA 資産形成 長期投資",
    expectedL1: "investing",
    note: "インデックス投資",
  },

  // ── 心理学 ──
  {
    id: "t-psychology-1",
    title: "ファスト＆スロー あなたの意思はどのように決まるか",
    author: "ダニエル・カーネマン",
    searchableText: "心理学 認知 バイアス 意思決定 行動経済学 ヒューリスティック",
    expectedL1: "psychology",
    note: "認知心理学の定番",
  },
  {
    id: "t-psychology-2",
    title: "影響力の武器 なぜ人は動かされるのか",
    author: "ロバート・B・チャルディーニ",
    searchableText: "心理学 説得 影響力 行動 社会心理学",
    expectedL1: "psychology",
    note: "社会心理学",
  },

  // ── 小説 ──
  {
    id: "t-novel-1",
    title: "容疑者Xの献身",
    author: "東野圭吾",
    searchableText: "小説 ミステリー 探偵 殺人 ガリレオ 推理",
    expectedL1: "novel",
    expectedL2: "mystery",
    note: "ミステリー小説(著者prior)",
  },
  {
    id: "t-novel-2",
    title: "ハリー・ポッターと賢者の石",
    author: "J.K.ローリング",
    subjects: ["ファンタジー", "小説", "魔法"],
    searchableText: "小説 ファンタジー 魔法 魔法使い 冒険 ホグワーツ",
    expectedL1: "novel",
    expectedL2: "fantasy",
    note: "ファンタジー小説(著者prior+subjects)",
  },
  {
    id: "t-novel-3",
    title: "羅生門・鼻",
    author: "芥川龍之介",
    subjects: ["純文学", "文学", "小説"],
    searchableText: "小説 文学 純文学 短編 文豪 古典",
    expectedL1: "novel",
    expectedL2: "literary",
    note: "純文学(著者prior+subjects)",
  },

  // ── 哲学 ──
  {
    id: "t-philosophy-1",
    title: "ソクラテスの弁明",
    author: "プラトン",
    searchableText: "哲学 古代ギリシャ 哲学者 イデア 倫理",
    expectedL1: "philosophy",
    note: "哲学古典(著者prior)",
  },
  {
    id: "t-philosophy-2",
    title: "善の研究",
    author: "西田幾多郎",
    searchableText: "哲学 純粋経験 思想 宗教 倫理学",
    expectedL1: "philosophy",
    note: "日本哲学",
  },

  // ── 歴史 ──
  {
    id: "t-history-1",
    title: "サピエンス全史 文明の構造と人類の幸福",
    author: "ユヴァル・ノア・ハラリ",
    searchableText: "歴史 人類 文明 進化 農業革命 認知革命",
    expectedL1: "history",
    note: "人類史の定番",
  },

  // ── サイエンス ──
  {
    id: "t-science-1",
    title: "ホーキング、宇宙を語る",
    author: "スティーブン・ホーキング",
    searchableText: "科学 宇宙 物理 ブラックホール 量子力学 相対性理論",
    expectedL1: "science",
    note: "宇宙物理(著者prior)",
  },
  {
    id: "t-science-2",
    title: "利己的な遺伝子",
    author: "リチャード・ドーキンス",
    searchableText: "科学 生物学 進化 遺伝子 自然選択",
    expectedL1: "science",
    note: "進化生物学(著者prior)",
  },

  // ── 漫画 ──
  {
    id: "t-manga-1",
    title: "進撃の巨人（１）",
    author: "諫山創",
    searchableText: "漫画 コミック 巨人 壁 少年マンガ",
    expectedL1: "manga",
    note: "漫画の定番",
  },
  {
    id: "t-manga-2",
    title: "ワンピース 1",
    author: "尾田栄一郎",
    searchableText: "漫画 コミック 海賊 冒険 少年ジャンプ",
    expectedL1: "manga",
    note: "漫画の定番",
  },

  // ── 境界線テスト (誤分類しやすいケース) ──
  {
    id: "t-edge-1",
    title: "問題解決の全技法",
    searchableText: "ビジネス 問題解決 フレームワーク 思考 経営",
    expectedL1: "business",
    note: "weakKeyword「問題解決」+ 強いビジネスキーワード → business",
  },
  {
    id: "t-edge-2",
    title: "AI時代の思考法",
    searchableText: "AI 思考 テクノロジー 未来 ビジネス 戦略",
    expectedL1: "tech",
    note: "「AI テクノロジー」強 → tech (ビジネス寄りでも tech 優先)",
  },
  {
    id: "t-edge-3",
    title: "哲学的思考のすすめ",
    author: "池田晶子",
    searchableText: "哲学 思考 人生 問い 考え方",
    expectedL1: "philosophy",
    note: "「哲学」必須キーワード → philosophy",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 評価ロジック
// ─────────────────────────────────────────────────────────────────────────────

interface EvalResult {
  id: string;
  title: string;
  expected: { l1: string; l2?: string; l3?: string };
  actual: { l1: string; l2?: string; l3?: string };
  pass: boolean;
  note?: string;
}

function runEval(tc: TestCase): EvalResult {
  const book: ClassifiableBook = {
    title: tc.title,
    subjects: tc.subjects,
    searchableText: [tc.author, tc.searchableText].filter(Boolean).join(" "),
  };

  const result = resolveBookClassification(book);
  const actualL1 = result.l1Id ?? "none";
  const actualL2 = result.l2Id ?? undefined;
  const actualL3 = result.l3Id ?? undefined;

  const pass =
    actualL1 === tc.expectedL1 &&
    (tc.expectedL2 === undefined || actualL2 === tc.expectedL2) &&
    (tc.expectedL3 === undefined || actualL3 === tc.expectedL3);

  return {
    id: tc.id,
    title: tc.title,
    expected: { l1: tc.expectedL1, l2: tc.expectedL2, l3: tc.expectedL3 },
    actual: { l1: actualL1, l2: actualL2, l3: actualL3 },
    pass,
    note: tc.note,
  };
}

function printExplain(tc: TestCase) {
  const book: ClassifiableBook = {
    title: tc.title,
    subjects: tc.subjects,
    searchableText: [tc.author, tc.searchableText].filter(Boolean).join(" "),
  };

  console.log(`\n${"─".repeat(60)}`);
  console.log(`📖 ${tc.title}`);
  if (tc.note) console.log(`   [${tc.note}]`);

  const explain = classifyBookWithExplain(book);

  console.log(`\n  L1 candidates (top 3):`);
  explain.l1Candidates
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 3)
    .forEach((c) => {
      const flag = c.categoryId === explain.l1?.id ? "✓" : " ";
      console.log(`    ${flag} ${c.categoryId.padEnd(15)} score=${c.totalScore.toFixed(2)}  hits=[${c.hitWords.join(",")}]`);
    });

  if (explain.l2Candidates.length > 0) {
    console.log(`\n  L2 candidates (top 3):`);
    explain.l2Candidates
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 3)
      .forEach((c) => {
        const flag = c.categoryId === explain.l2?.id ? "✓" : " ";
        console.log(`    ${flag} ${c.categoryId.padEnd(20)} score=${c.totalScore.toFixed(2)}  hits=[${c.hitWords.join(",")}]`);
      });
  }

  console.log(`\n  Result: L1=${explain.l1?.id ?? "-"} / L2=${explain.l2?.id ?? "-"} / L3=${explain.l3?.id ?? "-"}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 実データ検証 (books.index.json)
// ─────────────────────────────────────────────────────────────────────────────

function runDataCheck(limit = 100) {
  const indexPath = join(process.cwd(), "src/data/books.index.json");
  let books: Array<{ id: string; title: string; searchableText?: string; l1Id?: string; l2Id?: string }>;

  try {
    books = JSON.parse(readFileSync(indexPath, "utf-8"));
  } catch {
    console.error("❌ books.index.json が見つかりません。先に npm run prebuild を実行してください。");
    process.exit(1);
  }

  console.log(`\n実データ検証: ${books.length}冊中 ${limit}冊をサンプリング\n`);

  const sample = books.slice(0, limit);
  let changed = 0;

  for (const book of sample) {
    const result = resolveBookClassification({ title: book.title, searchableText: book.searchableText });
    const newL1 = result.l1Id ?? "none";
    const newL2 = result.l2Id ?? "-";

    if (book.l1Id && book.l1Id !== newL1) {
      console.log(`  CHANGE ${book.id.substring(0, 40).padEnd(40)} ${book.l1Id} → ${newL1} (L2: ${book.l2Id ?? "-"} → ${newL2})`);
      changed++;
    }
  }

  console.log(`\n変更あり: ${changed}/${limit}件`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const doExplain = args.includes("--explain");
const doData = args.includes("--data");
const targetId = args[args.indexOf("--id") + 1];

if (doData) {
  runDataCheck(200);
  process.exit(0);
}

const cases = targetId ? TEST_CASES.filter((tc) => tc.id === targetId) : TEST_CASES;

if (doExplain) {
  for (const tc of cases) {
    printExplain(tc);
  }
  process.exit(0);
}

// 通常評価
let pass = 0;
let fail = 0;

console.log("\n分類評価スクリプト\n" + "=".repeat(70));

for (const tc of cases) {
  const r = runEval(tc);
  const icon = r.pass ? "✓" : "✗";
  const note = r.note ? ` [${r.note}]` : "";

  if (r.pass) {
    console.log(`${icon} ${r.id.padEnd(18)} L1=${r.actual.l1}${r.actual.l2 ? "/L2=" + r.actual.l2 : ""}${note}`);
    pass++;
  } else {
    const exp = `L1=${r.expected.l1}${r.expected.l2 ? "/L2=" + r.expected.l2 : ""}`;
    const act = `L1=${r.actual.l1}${r.actual.l2 ? "/L2=" + r.actual.l2 : ""}`;
    console.log(`${icon} ${r.id.padEnd(18)} expected=${exp}  actual=${act}${note}`);
    fail++;
  }
}

console.log(`\n結果: ${pass}/${pass + fail} 件通過`);
if (fail > 0) {
  console.log(`失敗: ${fail}件  (--explain オプションで詳細確認可能)`);
}
