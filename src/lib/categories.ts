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
        subcategories: [
          { id: "time", label: "時間管理・タスク設計", keywords: ["時間管理", "タスク管理", "時短", "段取り", "優先順位", "ToDo", "GTD"] },
          { id: "focus", label: "集中力・習慣化", keywords: ["集中力", "習慣", "継続", "ルーティン", "先延ばし", "モチベーション"] },
          { id: "workstyle", label: "働き方・キャリア実務", keywords: ["働き方", "リモートワーク", "会議", "資料作成", "メール", "ビジネスマナー"] },
        ],
      },
      {
        id: "thinking",
        label: "思考法・問題解決",
        keywords: ["思考法", "問題解決", "フレームワーク", "ロジカル", "意思決定", "コンサル", "論理思考", "思考力", "知的生産", "行動経済学", "仮説", "水平思考", "論理的", "ファクト", "話し方", "伝え方", "図解力"],
        subcategories: [
          { id: "logical", label: "ロジカル思考", keywords: ["ロジカル", "論理思考", "MECE", "ピラミッド", "仮説思考", "クリティカル"] },
          { id: "decision", label: "意思決定・判断", keywords: ["意思決定", "判断", "選択", "バイアス", "意思決定理論", "ナッジ"] },
          { id: "communication-thinking", label: "伝える技術", keywords: ["話し方", "伝え方", "説明", "図解", "プレゼン", "ストーリー"] },
        ],
      },
      {
        id: "management",
        label: "経営・マネジメント",
        keywords: ["経営", "マネジメント", "組織", "リーダー", "マネジャー", "管理職", "ガバナンス", "人材", "チーム", "人事", "採用", "キャリア", "リスキリング"],
        subcategories: [
          { id: "leadership", label: "リーダーシップ", keywords: ["リーダー", "リーダーシップ", "管理職", "1on1", "評価", "育成"] },
          { id: "organization", label: "組織開発・制度", keywords: ["組織", "制度", "人事", "採用", "オンボーディング", "カルチャー"] },
          { id: "strategy-mgmt", label: "経営実務", keywords: ["経営", "ガバナンス", "KPI", "事業計画", "意思決定会議", "経営企画"] },
        ],
      },
      {
        id: "startup",
        label: "起業・イノベーション",
        keywords: ["起業", "スタートアップ", "ベンチャー", "イノベーション", "シリコンバレー", "事業", "開業", "フリーランス", "独立", "副業"],
        subcategories: [
          { id: "new-business", label: "新規事業開発", keywords: ["新規事業", "事業開発", "PMF", "リーン", "仮説検証", "MVP"] },
          { id: "startup-fund", label: "資金調達・VC", keywords: ["資金調達", "VC", "エンジェル", "ピッチ", "株式", "ストックオプション"] },
          { id: "solo-business", label: "副業・独立", keywords: ["副業", "独立", "フリーランス", "個人事業", "案件", "営業"] },
        ],
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
        subcategories: [
          { id: "accounting", label: "会計・簿記", keywords: ["会計", "経理", "簿記", "仕訳", "損益計算書", "貸借対照表"] },
          { id: "corporate-finance", label: "ファイナンス", keywords: ["ファイナンス", "企業価値", "DCF", "資本コスト", "IR", "資金繰り"] },
          { id: "personal-finance", label: "家計・資産管理", keywords: ["家計", "資産管理", "FP", "保険", "家計簿", "ライフプラン"] },
        ],
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
          {
            id: "generative",
            label: "生成AI・LLM",
            keywords: ["生成AI", "ChatGPT", "GPT", "LLM", "大規模言語", "プロンプト", "Copilot", "Gemini", "LangChain", "Bedrock", "Azure AI"],
            subcategories: [
              { id: "chatgpt", label: "ChatGPT", keywords: ["ChatGPT", "GPT", "OpenAI", "GPT-4", "GPT-4o", "ChatGPT Plus"] },
              { id: "prompt", label: "プロンプト設計", keywords: ["プロンプト", "Prompt", "プロンプトエンジニアリング", "命令文", "Few-shot", "Chain-of-Thought"] },
              { id: "llm-app", label: "LLMアプリ開発", keywords: ["LangChain", "RAG", "Function Calling", "Agents", "Bedrock", "Azure OpenAI", "AIアプリ"] },
              { id: "genai-other", label: "その他の生成AI", keywords: ["生成AI", "画像生成", "音声生成", "AIツール"] },
            ],
          },
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
        subcategories: [
          { id: "dx-strategy", label: "DX戦略・推進", keywords: ["DX", "デジタル戦略", "業務改革", "BPR", "デジタル変革", "変革" ] },
          { id: "bi-automation", label: "BI・業務自動化", keywords: ["Power BI", "BI", "RPA", "自動化", "業務改善", "ダッシュボード"] },
          { id: "office-skill", label: "Office実務", keywords: ["Excel", "Word", "PowerPoint", "Office", "関数", "VBA"] },
        ],
      },
      {
        id: "it-cert",
        label: "IT資格・試験対策",
        keywords: ["基本情報", "ITパスポート", "情報処理", "安全確保支援士", "ウェブ解析士", "検定試験", "試験対策", "認定試験", "シスコ", "CCNA", "Java SE"],
        subcategories: [
          { id: "ipa", label: "情報処理試験（IPA）", keywords: ["基本情報", "応用情報", "情報処理", "ITパスポート", "高度試験"] },
          { id: "security-cert", label: "セキュリティ資格", keywords: ["安全確保支援士", "情報セキュリティ", "CISSP", "CompTIA Security+"] },
          { id: "vendor-cert", label: "ベンダー資格", keywords: ["CCNA", "AWS認定", "Azure認定", "Java SE", "Oracle"] },
        ],
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
        subcategories: [
          { id: "habit-design", label: "習慣設計", keywords: ["習慣", "ルーティン", "トリガー", "行動設計", "継続"] },
          { id: "mindfulness", label: "瞑想・マインドフルネス", keywords: ["マインドフルネス", "瞑想", "呼吸", "自己受容", "ストレス"] },
        ],
      },
      {
        id: "mindset",
        label: "マインドセット・人生論",
        keywords: ["マインドセット", "成功", "幸福", "価値観", "人生", "自己実現", "メンタル"],
        subcategories: [
          { id: "success", label: "成功哲学", keywords: ["成功", "目標達成", "セルフイメージ", "自己実現"] },
          { id: "wellbeing", label: "幸福・ウェルビーイング", keywords: ["幸福", "ウェルビーイング", "価値観", "人生", "生き方"] },
        ],
      },
      {
        id: "communication",
        label: "コミュニケーション",
        keywords: ["コミュニケーション", "人間関係", "対話", "説得", "交渉", "プレゼン"],
        subcategories: [
          { id: "dialogue", label: "対話・傾聴", keywords: ["対話", "傾聴", "質問", "1on1", "心理的安全性"] },
          { id: "persuasion", label: "説得・交渉", keywords: ["説得", "交渉", "合意形成", "影響力", "ネゴシエーション"] },
          { id: "presentation", label: "プレゼン・発信", keywords: ["プレゼン", "スピーチ", "資料", "話し方", "発信"] },
        ],
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
        subcategories: [
          { id: "nisa", label: "NISA制度", keywords: ["NISA", "新NISA", "つみたてNISA", "成長投資枠"] },
          { id: "index-fund", label: "インデックスファンド", keywords: ["インデックス", "投資信託", "S&P500", "全世界株", "ETF"] },
          { id: "long-term", label: "長期運用の考え方", keywords: ["長期投資", "積立", "複利", "ドルコスト", "リバランス"] },
        ],
      },
      {
        id: "stock",
        label: "株式・FX投資",
        keywords: ["株式", "FX", "トレード", "相場", "投資信託", "株"],
        subcategories: [
          { id: "japan-stock", label: "日本株", keywords: ["日本株", "東証", "銘柄", "決算", "配当"] },
          { id: "us-stock", label: "米国株", keywords: ["米国株", "NASDAQ", "S&P500", "ETF", "米国市場"] },
          { id: "fx-trade", label: "FX・短期売買", keywords: ["FX", "トレード", "テクニカル", "チャート", "為替"] },
        ],
      },
      {
        id: "money",
        label: "お金・資産形成",
        keywords: ["節約", "財務", "お金", "資産形成", "家計", "貯金", "貯蓄"],
        subcategories: [
          { id: "household", label: "家計管理", keywords: ["家計", "家計簿", "固定費", "節約", "支出"] },
          { id: "savings", label: "貯金・防衛資金", keywords: ["貯金", "貯蓄", "防衛資金", "生活防衛", "現金比率"] },
          { id: "money-literacy", label: "金融リテラシー", keywords: ["金融教育", "お金の教養", "資産形成", "税金", "社会保険"] },
        ],
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
        subcategories: [
          { id: "bias", label: "認知バイアス", keywords: ["認知バイアス", "ヒューリスティック", "確証バイアス", "アンカリング"] },
          { id: "nudge", label: "ナッジ・行動設計", keywords: ["ナッジ", "行動設計", "選択アーキテクチャ", "行動介入"] },
        ],
      },
      {
        id: "neuroscience",
        label: "脳科学・メンタル",
        keywords: ["脳科学", "神経科学", "脳", "記憶", "集中", "睡眠", "ストレス"],
        subcategories: [
          { id: "brain-learning", label: "学習・記憶", keywords: ["記憶", "学習", "脳", "集中", "認知"] },
          { id: "mental-care", label: "ストレス・メンタルケア", keywords: ["ストレス", "睡眠", "メンタル", "不安", "セルフケア"] },
        ],
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
      {
        id: "mystery",
        label: "ミステリー・サスペンス",
        keywords: ["ミステリー", "推理", "サスペンス", "スリラー", "犯罪"],
        subcategories: [
          { id: "classic-mystery", label: "本格・古典ミステリー", keywords: ["本格", "古典", "探偵", "密室", "ポアロ"] },
          { id: "modern-thriller", label: "現代サスペンス", keywords: ["サスペンス", "スリラー", "心理戦", "どんでん返し"] },
        ],
      },
      {
        id: "sf",
        label: "SF・ファンタジー",
        keywords: ["SF", "ファンタジー", "近未来", "宇宙", "ディストピア"],
        subcategories: [
          { id: "space-sf", label: "宇宙・ハードSF", keywords: ["宇宙", "ハードSF", "科学", "AI", "惑星"] },
          { id: "fantasy-world", label: "異世界・幻想", keywords: ["ファンタジー", "魔法", "異世界", "冒険", "王国"] },
        ],
      },
      {
        id: "romance",
        label: "恋愛・青春",
        keywords: ["恋愛", "青春", "感動", "ラブ"],
        subcategories: [
          { id: "youth", label: "青春小説", keywords: ["青春", "学生", "成長", "友情", "部活"] },
          { id: "love-story", label: "恋愛小説", keywords: ["恋愛", "ラブ", "切ない", "結婚", "再会"] },
        ],
      },
      {
        id: "literary",
        label: "純文学・日本文学",
        keywords: ["純文学", "日本文学", "直木賞", "芥川賞", "文芸", "村上春樹"],
        subcategories: [
          { id: "award", label: "受賞作", keywords: ["直木賞", "芥川賞", "本屋大賞", "受賞作"] },
          { id: "modern-jp", label: "現代日本文学", keywords: ["日本文学", "文芸", "純文学", "現代"] },
        ],
      },
    ],
  },
  {
    id: "philosophy",
    label: "哲学・思想",
    emoji: "🔭",
    desc: "倫理・宗教・古典・人生論",
    mappedLabels: ["哲学・思想"],
    subcategories: [
      {
        id: "western",
        label: "西洋哲学・倫理",
        keywords: ["哲学", "倫理", "西洋哲学", "道徳", "形而上学", "ソクラテス", "ニーチェ", "カント", "ストア"],
        subcategories: [
          { id: "ethics", label: "倫理学", keywords: ["倫理", "道徳", "善悪", "規範", "功利主義"] },
          { id: "history-philo", label: "哲学史", keywords: ["ソクラテス", "プラトン", "アリストテレス", "カント", "ニーチェ"] },
        ],
      },
      {
        id: "eastern",
        label: "東洋思想・宗教",
        keywords: ["仏教", "東洋思想", "宗教", "禅", "道教", "儒教", "老子", "孔子", "ヨーガ"],
        subcategories: [
          { id: "buddhism", label: "仏教・禅", keywords: ["仏教", "禅", "瞑想", "悟り", "仏典"] },
          { id: "chinese-thought", label: "儒教・道教", keywords: ["儒教", "道教", "老子", "孔子", "論語"] },
        ],
      },
    ],
  },
  {
    id: "history",
    label: "歴史・社会",
    emoji: "🏛️",
    desc: "世界史・日本史・社会問題・政治",
    mappedLabels: ["歴史・社会"],
    subcategories: [
      {
        id: "world",
        label: "世界史・文明",
        keywords: ["世界史", "文明", "ヨーロッパ", "グローバル", "人類", "地政学", "帝国", "植民地"],
        subcategories: [
          { id: "ancient-medieval", label: "古代〜中世", keywords: ["古代", "中世", "文明", "ローマ", "ギリシャ"] },
          { id: "modern-world", label: "近代〜現代", keywords: ["近代", "現代", "帝国", "植民地", "冷戦"] },
        ],
      },
      {
        id: "japan",
        label: "日本史・近現代",
        keywords: ["日本史", "近現代史", "昭和", "明治", "戦後", "江戸", "幕末", "戦国", "明治維新"],
        subcategories: [
          { id: "premodern-jp", label: "古代〜江戸", keywords: ["日本史", "古代", "中世", "江戸", "戦国"] },
          { id: "modern-jp-history", label: "明治〜戦後", keywords: ["明治", "大正", "昭和", "戦後", "近現代史"] },
        ],
      },
      {
        id: "social",
        label: "社会・政治・経済",
        keywords: ["社会", "政治", "格差", "社会問題", "経済学", "民主主義", "少子化", "環境問題", "SDGs"],
        subcategories: [
          { id: "politics", label: "政治・制度", keywords: ["政治", "民主主義", "政策", "選挙", "行政"] },
          { id: "social-issues", label: "社会課題", keywords: ["格差", "少子化", "高齢化", "教育", "貧困"] },
          { id: "environment", label: "環境・SDGs", keywords: ["環境", "気候変動", "SDGs", "サステナビリティ"] },
        ],
      },
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
        subcategories: [
          { id: "evolution", label: "進化・生態", keywords: ["進化", "生態", "自然選択", "生物多様性"] },
          { id: "genetics", label: "遺伝子・分子生物", keywords: ["遺伝子", "DNA", "ゲノム", "分子生物", "遺伝"] },
          { id: "medical", label: "医学・人体", keywords: ["医学", "人体", "解剖", "病気", "公衆衛生"] },
        ],
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
      {
        id: "shonen",
        label: "少年コミック",
        keywords: ["少年", "バトル", "冒険", "友情", "ジャンプ", "スポーツ", "野球", "サッカー", "キャプテン", "プレイボール"],
        subcategories: [
          { id: "battle", label: "バトル・冒険", keywords: ["バトル", "冒険", "能力", "異能", "ジャンプ"] },
          { id: "sports", label: "スポーツ", keywords: ["スポーツ", "野球", "サッカー", "バスケ", "部活"] },
        ],
      },
      {
        id: "shojo",
        label: "少女・恋愛コミック",
        keywords: ["少女", "恋愛", "ラブコメ", "花とゆめ", "マーガレット"],
        subcategories: [
          { id: "shojo-love", label: "恋愛", keywords: ["恋愛", "胸キュン", "少女", "学園", "ラブ"] },
          { id: "shojo-comedy", label: "ラブコメ", keywords: ["ラブコメ", "コメディ", "少女漫画", "日常"] },
        ],
      },
      {
        id: "seinen",
        label: "青年・一般コミック",
        keywords: ["青年", "ビジネス", "社会人", "大人", "グルメ", "モーニング"],
        subcategories: [
          { id: "seinen-drama", label: "社会派・ドラマ", keywords: ["社会", "仕事", "ビジネス", "ドラマ", "社会人"] },
          { id: "seinen-hobby", label: "趣味・グルメ", keywords: ["グルメ", "料理", "趣味", "日常", "ライフスタイル"] },
        ],
      },
    ],
  },
];

/** @deprecated Use CATEGORY_TREE directly */
export const OTHER_CATEGORY: Category = { id: "other", label: "その他", keywords: [] };
/** @deprecated */
export const OTHER_L2 = OTHER_CATEGORY;
