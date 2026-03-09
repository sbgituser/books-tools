/**
 * カテゴリツリー定義（任意階層対応）
 *
 * - L1: 大分類
 * - Category（L2以降）: 再帰的なサブカテゴリ
 * - keywords: books.index.json の searchableText + title に対して部分一致で分類
 * - mappedLabels: indexProvider.ts の mapCategory() が返す値（book.category）に対応
 */

export interface Category {
  id: string;
  label: string;
  keywords: string[];
  subcategories?: Category[];
}

/** 後方互換エイリアス */
export type L2Category = Category;

export interface L1Category {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  mappedLabels: string[];
  subcategories: Category[];
}

export const CATEGORY_TREE: L1Category[] = [
  {
    id: "business",
    label: "ビジネス・経済",
    emoji: "💼",
    desc: "経営・起業・仕事術・マーケティング",
    mappedLabels: ["ビジネス・経済"],
    subcategories: [
      {
        id: "productivity",
        label: "仕事術・生産性",
        keywords: ["仕事術", "生産性", "タスク管理", "時間管理", "効率化", "時短", "残業", "集中力", "働き方", "手帳", "時間術", "すぐやる", "やる気", "働く", "ノート術", "仕事力"],
      },
      {
        id: "thinking",
        label: "思考法・問題解決",
        keywords: ["思考法", "問題解決", "フレームワーク", "ロジカル", "意思決定", "コンサル", "論理思考", "思考力", "知的生産", "行動経済学", "仮説", "水平思考", "論理的", "ファクト", "話し方", "伝え方", "図解力"],
      },
      {
        id: "management",
        label: "経営・マネジメント",
        keywords: ["経営", "マネジメント", "組織", "リーダー", "マネジャー", "管理職", "ガバナンス", "人材", "チーム", "人事", "採用", "キャリア", "リスキリング"],
      },
      {
        id: "startup",
        label: "起業・イノベーション",
        keywords: ["起業", "スタートアップ", "ベンチャー", "イノベーション", "シリコンバレー", "事業", "開業", "フリーランス", "独立", "副業"],
      },
      {
        id: "marketing",
        label: "マーケティング・戦略",
        keywords: ["マーケティング", "ブランディング", "セールス", "戦略", "マーケ", "ビジネスモデル", "EC", "Shopify", "データ視覚化"],
        subcategories: [
          { id: "digital",   label: "デジタル・SNS",     keywords: ["デジタルマーケティング", "SNS", "コンテンツ", "グロース", "Web広告", "グロースハック"] },
          { id: "strategy",  label: "経営戦略・競争優位", keywords: ["経営戦略", "競争優位", "差別化", "ポジショニング", "ポーター"] },
          { id: "sales",     label: "営業・顧客体験",     keywords: ["営業", "セールス", "顧客体験", "CX", "カスタマー"] },
        ],
      },
      {
        id: "finance",
        label: "財務・会計",
        keywords: ["財務", "会計", "経理", "財務諸表", "簿記", "資産形成", "FP", "ファイナンス", "投資信託", "家計管理", "お金の教科書", "資産管理"],
      },
    ],
  },
  {
    id: "tech",
    label: "テクノロジー・IT",
    emoji: "💻",
    desc: "AI・プログラミング・DX・データサイエンス",
    mappedLabels: ["テクノロジー・AI"],
    subcategories: [
      {
        id: "ai",
        label: "AI・機械学習",
        keywords: ["AI", "人工知能", "機械学習", "ディープラーニング", "ChatGPT", "LLM"],
        subcategories: [
          { id: "generative",      label: "生成AI・LLM",       keywords: ["生成AI", "ChatGPT", "GPT", "LLM", "大規模言語", "プロンプト", "Copilot", "Gemini", "LangChain", "Bedrock", "Azure AI"] },
          { id: "ml-dl",           label: "機械学習・深層学習", keywords: ["機械学習", "ディープラーニング", "ニューラル", "深層学習", "強化学習", "教師あり", "コンテナ"] },
          { id: "data-sci",        label: "データサイエンス",   keywords: ["データサイエンス", "データ分析", "pandas", "Jupyter", "データエンジニア", "特徴量"] },
          { id: "ai-application",  label: "AI活用・ビジネス応用", keywords: ["AI活用", "AIビジネス", "AI社会", "人工知能活用", "AIサービス", "AI-900", "Scratch 3", "子どもAI"] },
        ],
      },
      {
        id: "programming",
        label: "プログラミング・開発",
        keywords: ["プログラミング", "ソフトウェア", "エンジニア", "開発", "アーキテクチャ", "コード", "Python", "JavaScript", "Java", "Vue", "PHP", "Git", "API", "Web開発", "Web制作", "RPA", "自動化"],
        subcategories: [
          { id: "web",         label: "Web開発",             keywords: ["JavaScript", "TypeScript", "React", "Next.js", "フロントエンド", "CSS", "Vue", "Angular", "HTML", "PHP", "UI", "UX", "Webデザイン"] },
          { id: "infra",       label: "インフラ・クラウド",   keywords: ["DevOps", "AWS", "Azure", "GCP", "クラウド", "インフラ", "Docker", "Kubernetes", "CI/CD", "Ansible", "RPA", "自動化"] },
          { id: "security",    label: "セキュリティ",         keywords: ["セキュリティ", "脆弱性", "サイバー", "暗号", "ハッキング", "ペネトレーション", "安全確保支援士", "NIST", "情報セキュリティ"] },
          { id: "design-arch", label: "設計・アーキテクチャ", keywords: ["アーキテクチャ", "設計", "リファクタリング", "クリーンコード", "デザインパターン", "テスト駆動", "アジャイル", "スクラム", "マイクロサービス", "ソフトウェアエンジニアリング"] },
          { id: "backend",     label: "バックエンド・開発言語", keywords: ["Java", "Swift", "Ruby", "Go言語", "C言語", "C/C++", "バックエンド", "サーバサイド", "スッキリわかる"] },
        ],
      },
      {
        id: "dx",
        label: "DX・デジタル活用",
        keywords: ["DX", "デジタル", "クラウド", "データ活用", "デジタルトランスフォーメーション", "IoT", "Excel", "Word", "Office", "パソコン", "Power BI", "プロセス改善"],
      },
      {
        id: "it-cert",
        label: "IT資格・試験対策",
        keywords: ["基本情報", "ITパスポート", "情報処理", "安全確保支援士", "ウェブ解析士", "検定試験", "試験対策", "認定試験", "シスコ", "CCNA", "Java SE"],
      },
    ],
  },
  {
    id: "self-help",
    label: "自己啓発",
    emoji: "🌱",
    desc: "習慣・マインドセット・コミュニケーション",
    mappedLabels: ["自己啓発"],
    subcategories: [
      {
        id: "habit",
        label: "習慣・行動変容",
        keywords: ["習慣", "行動", "継続", "自己管理", "ルーティン", "モチベーション", "やる気", "マインドフルネス", "瞑想", "時間術"],
      },
      {
        id: "mindset",
        label: "マインドセット・人生論",
        keywords: ["マインドセット", "成功", "幸福", "価値観", "人生", "自己実現", "メンタル"],
      },
      {
        id: "communication",
        label: "コミュニケーション",
        keywords: ["コミュニケーション", "人間関係", "対話", "説得", "交渉", "プレゼン"],
      },
    ],
  },
  {
    id: "investing",
    label: "投資・お金",
    emoji: "📈",
    desc: "資産運用・NISA・財務・節約",
    mappedLabels: ["投資・お金"],
    subcategories: [
      {
        id: "index",
        label: "インデックス・長期投資",
        keywords: ["インデックス投資", "NISA", "つみたて", "長期投資", "複利", "積立"],
      },
      {
        id: "stock",
        label: "株式・FX投資",
        keywords: ["株式", "FX", "トレード", "相場", "投資信託", "株"],
      },
      {
        id: "money",
        label: "お金・資産形成",
        keywords: ["節約", "財務", "お金", "資産形成", "家計", "貯金", "貯蓄"],
      },
    ],
  },
  {
    id: "psychology",
    label: "心理学・行動科学",
    emoji: "🧠",
    desc: "認知バイアス・行動経済学・脳科学",
    mappedLabels: ["心理学"],
    subcategories: [
      {
        id: "behavioral",
        label: "行動経済学・意思決定",
        keywords: ["行動経済学", "意思決定", "認知バイアス", "心理学", "行動科学", "ナッジ"],
      },
      {
        id: "neuroscience",
        label: "脳科学・メンタル",
        keywords: ["脳科学", "神経科学", "脳", "記憶", "集中", "睡眠", "ストレス"],
      },
    ],
  },
  {
    id: "novel",
    label: "小説・文芸",
    emoji: "📖",
    desc: "ミステリー・SF・恋愛・純文学",
    mappedLabels: ["小説・文学"],
    subcategories: [
      { id: "mystery",  label: "ミステリー・サスペンス", keywords: ["ミステリー", "推理", "サスペンス", "スリラー", "犯罪"] },
      { id: "sf",       label: "SF・ファンタジー",       keywords: ["SF", "ファンタジー", "近未来", "宇宙", "ディストピア"] },
      { id: "romance",  label: "恋愛・青春",             keywords: ["恋愛", "青春", "感動", "ラブ"] },
      { id: "literary", label: "純文学・日本文学",       keywords: ["純文学", "日本文学", "直木賞", "芥川賞", "文芸", "村上春樹"] },
    ],
  },
  {
    id: "philosophy",
    label: "哲学・思想",
    emoji: "🔭",
    desc: "倫理・宗教・古典・人生論",
    mappedLabels: ["哲学・思想"],
    subcategories: [
      { id: "western", label: "西洋哲学・倫理", keywords: ["哲学", "倫理", "西洋哲学", "道徳", "形而上学", "ソクラテス", "ニーチェ", "カント", "ストア"] },
      { id: "eastern", label: "東洋思想・宗教", keywords: ["仏教", "東洋思想", "宗教", "禅", "道教", "儒教", "老子", "孔子", "ヨーガ"] },
    ],
  },
  {
    id: "history",
    label: "歴史・社会",
    emoji: "🏛️",
    desc: "世界史・日本史・社会問題・政治",
    mappedLabels: ["歴史・社会"],
    subcategories: [
      { id: "world",  label: "世界史・文明",     keywords: ["世界史", "文明", "ヨーロッパ", "グローバル", "人類", "地政学", "帝国", "植民地"] },
      { id: "japan",  label: "日本史・近現代",   keywords: ["日本史", "近現代史", "昭和", "明治", "戦後", "江戸", "幕末", "戦国", "明治維新"] },
      { id: "social", label: "社会・政治・経済", keywords: ["社会", "政治", "格差", "社会問題", "経済学", "民主主義", "少子化", "環境問題", "SDGs"] },
    ],
  },
  {
    id: "science",
    label: "科学・教養",
    emoji: "🔬",
    desc: "物理・生物・数学・統計・宇宙",
    mappedLabels: ["科学・教養", "科学・技術"],
    subcategories: [
      {
        id: "physics",
        label: "物理・宇宙科学",
        keywords: ["物理", "宇宙", "天文", "量子", "相対性"],
        subcategories: [
          { id: "quantum",   label: "量子力学・素粒子", keywords: ["量子力学", "量子", "素粒子", "量子コンピュータ", "量子論"] },
          { id: "cosmology", label: "宇宙・天文学",     keywords: ["宇宙論", "天文", "ブラックホール", "相対性", "宇宙探査", "銀河", "ホーキング"] },
        ],
      },
      {
        id: "bio",
        label: "生物・進化・医学",
        keywords: ["生物学", "進化論", "遺伝子", "生命", "医学", "DNA", "ゲノム", "微生物", "人体"],
      },
      {
        id: "math",
        label: "数学・統計・データ",
        keywords: ["数学", "統計学", "データ分析", "確率", "データサイエンス"],
        subcategories: [
          { id: "statistics",     label: "統計学・確率",   keywords: ["統計学", "統計", "ベイズ", "確率論", "回帰", "仮説検定"] },
          { id: "linear-algebra", label: "線形代数",       keywords: ["線形代数", "行列", "ベクトル", "固有値", "行列式"] },
          { id: "applied-math",   label: "数学・教養",     keywords: ["数学", "算数", "微分積分", "数理", "数学的思考"] },
        ],
      },
    ],
  },
  {
    id: "manga",
    label: "漫画",
    emoji: "🎨",
    desc: "少年・少女・青年コミック",
    mappedLabels: ["漫画"],
    subcategories: [
      { id: "shonen", label: "少年コミック",       keywords: ["少年", "バトル", "冒険", "友情", "ジャンプ", "スポーツ", "野球", "サッカー", "キャプテン", "プレイボール"] },
      { id: "shojo",  label: "少女・恋愛コミック", keywords: ["少女", "恋愛", "ラブコメ", "花とゆめ", "マーガレット"] },
      { id: "seinen", label: "青年・一般コミック", keywords: ["青年", "ビジネス", "社会人", "大人", "グルメ", "モーニング"] },
    ],
  },
];

/** @deprecated Use CATEGORY_TREE directly */
export const OTHER_CATEGORY: Category = { id: "other", label: "その他", keywords: [] };
/** @deprecated */
export const OTHER_L2 = OTHER_CATEGORY;
