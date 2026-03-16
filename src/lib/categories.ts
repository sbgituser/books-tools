/**
 * カテゴリツリー定義（L1/L2/L3） + ファセットタグ（L4/L5）
 *
 * 新フィールド（任意）:
 *   weakKeywords    — 曖昧語（スコア重み低め）
 *   phraseKeywords  — タイトル完全一致フレーズ（高スコア）
 *   requiredAny     — このうち1つ以上が全文中に存在しないとスコア0扱い
 *   requiredAll     — これら全てが存在しないとスコア0扱い
 *   minScore        — このカテゴリが採用されるための最低スコア（L2/L3で使用）
 *   minMargin       — 1位と2位のスコア差がこれ未満なら未確定にする
 */

export interface Category {
  id: string;
  label: string;
  keywords: string[];
  strongKeywords?: string[];
  weakKeywords?: string[];
  phraseKeywords?: string[];
  aliases?: string[];
  excludeKeywords?: string[];
  requiredAny?: string[];
  requiredAll?: string[];
  minScore?: number;
  minMargin?: number;
  subcategories?: Category[];
}

export type L2Category = Category;

export interface L1Category {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  mappedLabels: string[];
  keywords: string[];
  strongKeywords?: string[];
  weakKeywords?: string[];
  phraseKeywords?: string[];
  aliases?: string[];
  excludeKeywords?: string[];
  requiredAny?: string[];
  requiredAll?: string[];
  minScore?: number;
  minMargin?: number;
  subcategories: Category[];
}

export interface FacetTagRule {
  id: string;
  label: string;
  keywords: string[];
  strongKeywords?: string[];
  phraseKeywords?: string[];
  aliases?: string[];
  excludeKeywords?: string[];
  requiredAny?: string[];
  minScore?: number;
  l1Allow?: string[];
  l2Allow?: string[];
}

const c = (
  id: string,
  label: string,
  keywords: string[],
  subcategories?: Category[],
  extra?: Partial<Category>,
): Category => ({ id, label, keywords, ...(subcategories ? { subcategories } : {}), ...(extra ?? {}) });

export const CATEGORY_TREE: L1Category[] = [
  // ── ビジネス・経済 ────────────────────────────────────────────────────────
  {
    id: "business",
    label: "ビジネス・経済",
    emoji: "💼",
    desc: "仕事術・経営・マーケ・会計・キャリア・起業",
    mappedLabels: ["ビジネス・経済"],
    keywords: ["ビジネス", "経営", "会計", "マーケ", "起業", "キャリア", "仕事術"],
    strongKeywords: ["マネジメント", "財務", "コンサル", "BtoB", "BtoC", "経営戦略", "マーケティング"],
    weakKeywords: ["問題解決", "思考", "成長", "実践", "社会", "ai", "戦略", "学び"],
    excludeKeywords: [
      "小説", "物語", "探偵", "ミステリー", "ファンタジー", "ホラー", "怪談",
      "漫画", "コミック", "哲学者", "宗教", "仏教", "禅",
    ],
    subcategories: [
      c("workstyle", "仕事術", ["仕事術", "生産性", "働き方"], [
        c("task-management", "タスク管理", ["タスク管理", "todo", "gtd", "段取り"]),
        c("time-management", "時間管理", ["時間管理", "タイムマネジメント", "時短"]),
        c("focus", "集中力", ["集中力", "先延ばし", "ルーティン"]),
        c("meeting-doc", "会議・資料作成", ["会議", "議事録", "資料作成", "スライド"]),
        c("team-practice", "チーム実務", ["チーム", "実務", "連携", "業務改善"]),
      ]),
      c("thinking", "思考法", ["思考法", "論理", "問題解決", "フレームワーク"], [
        c("logical-thinking", "ロジカルシンキング", ["ロジカル", "論理思考", "mece", "ロジカルシンキング"]),
        c("problem-solving", "問題解決", ["問題解決", "課題解決", "ボトルネック"]),
        c("decision-making", "意思決定", ["意思決定", "判断", "選択"]),
        c("hypothesis", "仮説思考", ["仮説", "仮説思考", "検証"]),
        c("explanation", "伝達・説明", ["説明", "伝え方", "図解", "プレゼン"]),
      ]),
      c("management", "経営", ["経営", "事業", "組織", "経営戦略"], [
        c("business-strategy", "経営戦略", ["経営戦略", "競争優位", "戦略", "ポーター"]),
        c("org-management", "組織マネジメント", ["組織", "マネジメント", "チーム"]),
        c("leadership", "リーダーシップ", ["リーダー", "リーダーシップ", "管理職"]),
        c("hr-system", "人事・制度", ["人事", "制度", "評価", "採用"]),
        c("biz-planning", "事業企画", ["事業企画", "企画", "kpi", "新規事業計画"]),
      ]),
      c("marketing", "マーケティング", ["マーケティング", "セールス", "顧客", "ブランド"], [
        c("brand", "ブランド", ["ブランド", "ブランディング"]),
        c("digital-marketing", "デジタルマーケティング", ["デジタルマーケティング", "web広告", "seo"]),
        c("sns-content", "SNS・コンテンツ", ["sns", "コンテンツ", "発信", "youtube"]),
        c("sales", "セールス", ["営業", "セールス", "商談"]),
        c("customer-insight", "顧客理解", ["顧客理解", "インサイト", "ペルソナ", "cx"]),
      ]),
      c("finance", "会計・ファイナンス", ["会計", "簿記", "財務", "ファイナンス"], [
        c("bookkeeping", "簿記・会計", ["簿記", "会計", "仕訳", "財務諸表"]),
        c("managerial-accounting", "管理会計", ["管理会計", "原価", "予算管理"]),
        c("corporate-finance", "コーポレートファイナンス", ["企業価値", "dcf", "資本コスト"]),
        c("investment-decision", "投資判断", ["投資判断", "npv", "roi"]),
        c("personal-finance", "家計・資産管理", ["家計", "資産管理", "fp"]),
      ]),
      c("career", "キャリア", ["キャリア", "転職", "副業"], [
        c("job-change", "転職", ["転職", "職務経歴", "面接"]),
        c("workstyle-career", "働き方", ["働き方", "リモート", "ワークスタイル"]),
        c("career-design", "キャリア設計", ["キャリア設計", "キャリア形成"]),
        c("side-business", "副業", ["副業", "複業", "フリーランス"]),
        c("manager-practice", "マネージャー実務", ["マネージャー", "1on1", "評価"]),
      ]),
      c("startup", "起業", ["起業", "スタートアップ", "独立"], [
        c("startup-intro", "起業入門", ["起業入門", "起業", "会社設立"]),
        c("new-business", "新規事業", ["新規事業", "事業開発", "事業立ち上げ"]),
        c("pmf-growth", "PMF・グロース", ["pmf", "グロース", "成長戦略"]),
        c("fundraising", "資金調達", ["資金調達", "vc", "ピッチ"]),
        c("independent-practice", "独立実務", ["独立", "個人事業", "営業", "請求"]),
      ]),
    ],
  },

  // ── テクノロジー・IT ──────────────────────────────────────────────────────
  {
    id: "tech",
    label: "テクノロジー・IT",
    emoji: "💻",
    desc: "AI・開発・クラウド・セキュリティ・データ・DX",
    mappedLabels: ["テクノロジー・AI"],
    keywords: ["プログラミング", "ai", "it", "クラウド", "セキュリティ", "データ", "開発"],
    strongKeywords: [
      "python", "javascript", "typescript", "aws", "docker", "kubernetes",
      "sql", "chatgpt", "llm", "react", "next.js", "go", "rust", "java",
    ],
    excludeKeywords: [
      "小説", "物語", "漫画", "コミック", "歴史小説", "ミステリー", "ファンタジー",
      "哲学者", "宗教",
    ],
    subcategories: [
      c("ai-ml", "AI・機械学習", ["ai", "機械学習", "llm", "生成ai", "深層学習"], [
        c("genai", "生成AI", ["生成ai", "chatgpt", "gpt", "gemini", "claude"]),
        c("llm-app", "LLMアプリ開発", ["llm", "rag", "langchain", "agent", "プロンプト"]),
        c("ml-basic", "機械学習基礎", ["機械学習", "回帰", "分類", "特徴量"]),
        c("deep-learning", "深層学習", ["深層学習", "ニューラル", "cnn", "transformer"]),
        c("ai-business", "AIビジネス活用", ["ai活用", "業務活用", "ai導入"]),
      ]),
      c("programming", "プログラミング", ["プログラミング", "開発", "コード", "コーディング"], [
        c("frontend", "Webフロントエンド", ["react", "next.js", "vue", "css", "typescript", "html"]),
        c("backend", "バックエンド", ["java", "go", "ruby", "node", "api", "rust"]),
        c("algorithm", "アルゴリズム", ["アルゴリズム", "計算量", "データ構造"]),
        c("architecture", "設計・アーキテクチャ", ["アーキテクチャ", "設計", "クリーンコード", "solid"]),
        c("dev-process", "開発プロセス", ["アジャイル", "スクラム", "テスト", "ci/cd", "devops"]),
      ]),
      c("infra-cloud", "インフラ・クラウド", ["インフラ", "クラウド", "sre", "サーバー"], [
        c("aws", "AWS", ["aws", "ec2", "lambda", "s3", "iam"]),
        c("gcp-azure", "GCP・Azure", ["gcp", "azure", "bigquery"]),
        c("container", "Docker・Kubernetes", ["docker", "kubernetes", "k8s", "コンテナ"]),
        c("network", "ネットワーク", ["ネットワーク", "tcp/ip", "dns", "ルーティング"]),
        c("sre-ops", "SRE・運用", ["sre", "運用", "監視", "可観測性", "障害対応"]),
      ]),
      c("security", "セキュリティ", ["セキュリティ", "脆弱性", "暗号", "サイバー"], [
        c("security-basic", "セキュリティ基礎", ["セキュリティ基礎", "脅威", "脆弱性"]),
        c("web-security", "Webセキュリティ", ["webセキュリティ", "xss", "sqlインジェクション"]),
        c("network-security", "ネットワークセキュリティ", ["firewall", "ids", "vpn"]),
        c("auth-crypto", "認証・暗号", ["認証", "暗号", "公開鍵", "oauth"]),
        c("incident", "インシデント対応", ["インシデント", "csirt", "フォレンジック"]),
      ]),
      c("data", "データ活用", ["データ分析", "sql", "bi", "統計", "データ"], [
        c("sql", "SQL", ["sql", "クエリ", "join", "postgres", "mysql", "データベース"]),
        c("bi", "BI", ["bi", "power bi", "tableau", "ダッシュボード"]),
        c("data-analysis", "データ分析", ["データ分析", "pandas", "分析"]),
        c("stats-basic", "統計基礎", ["統計", "確率", "回帰", "検定"]),
        c("data-platform", "データ基盤", ["データ基盤", "dwh", "etl", "dbt"]),
      ]),
      c("dx", "IT戦略・DX", ["dx", "業務改善", "it企画", "デジタル化"], [
        c("dx-promotion", "DX推進", ["dx推進", "デジタル変革", "dx"]),
        c("process-improve", "業務改善", ["業務改善", "bpr", "業務改革"]),
        c("automation-rpa", "自動化・RPA", ["rpa", "自動化", "power automate"]),
        c("it-planning", "IT企画", ["it企画", "ロードマップ", "要件定義"]),
        c("system-intro", "システム導入", ["システム導入", "erp", "crm"]),
      ]),
      c("cert", "資格試験", ["基本情報", "応用情報", "aws認定", "試験", "情報処理"], [
        c("fe", "基本情報", ["基本情報", "fe", "itパスポート"]),
        c("ap", "応用情報", ["応用情報", "ap"]),
        c("ipa-advanced", "高度情報処理", ["高度情報処理", "ネットワークスペシャリスト", "dbスペ"]),
        c("aws-cert", "AWS認定", ["aws認定", "saa", "soa", "dva"]),
        c("security-cert", "セキュリティ資格", ["情報処理安全確保支援士", "security+", "cissp"]),
      ]),
    ],
  },

  // ── 自己啓発 ─────────────────────────────────────────────────────────────
  {
    id: "self-help",
    label: "自己啓発",
    emoji: "🌱",
    desc: "習慣・マインドセット・学習法・生き方",
    mappedLabels: ["自己啓発"],
    keywords: ["自己啓発", "習慣", "モチベーション", "生き方", "マインドセット", "学習法"],
    strongKeywords: ["自己啓発", "習慣化", "マインドセット", "モチベーション", "コミュニケーション"],
    weakKeywords: ["人生", "成長", "実践", "思考", "学び", "変化"],
    excludeKeywords: [
      "経営", "会計", "簿記", "財務", "プログラミング", "sql", "python",
      "投資", "株式", "nisa", "小説", "物語", "漫画", "コミック",
      "哲学者", "宗教", "歴史", "哲学史",
    ],
    subcategories: [
      c("habit", "習慣", ["習慣", "継続", "行動", "習慣化"], [
        c("habit-formation", "習慣化", ["習慣化", "継続", "ルーティン", "習慣"]),
        c("motivation", "モチベーション", ["モチベーション", "やる気", "意欲"]),
      ]),
      c("mindset", "マインドセット", ["マインドセット", "自己理解", "思考習慣"], [
        c("self-understanding", "自己理解", ["自己理解", "自己分析", "強み"]),
        c("wellbeing", "幸福論", ["幸福", "ウェルビーイング", "幸せ", "豊かさ"]),
      ]),
      c("communication", "コミュニケーション", ["対話", "交渉", "プレゼン", "コミュニケーション"], [
        c("listening", "対話・傾聴", ["傾聴", "対話", "質問力"]),
        c("negotiation", "説得・交渉", ["説得", "交渉", "合意形成"]),
        c("presentation", "プレゼン", ["プレゼン", "発信", "話し方"]),
      ]),
      c("learning", "学び方", ["学習法", "記憶", "勉強法", "読書術"], [
        c("study-method", "学習法", ["学習法", "勉強法", "学び方", "独学"]),
        c("memory", "記憶法", ["記憶法", "暗記", "記憶術"]),
      ]),
      c("life", "生き方", ["人生", "人生設計", "生き方", "ライフスタイル"], [
        c("life-design", "人生設計", ["人生設計", "ライフデザイン", "キャリア観"]),
      ]),
    ],
  },

  // ── 投資・お金 ───────────────────────────────────────────────────────────
  {
    id: "investing",
    label: "投資・お金",
    emoji: "📈",
    desc: "資産形成・株式・NISA・FX・家計",
    mappedLabels: ["投資・お金"],
    keywords: ["投資", "nisa", "株", "資産形成", "家計", "お金", "資産"],
    strongKeywords: ["nisa", "etf", "インデックス投資", "高配当株", "iDeCo", "fx", "米国株"],
    excludeKeywords: [
      "小説", "物語", "漫画", "コミック", "哲学", "宗教", "心理療法",
    ],
    subcategories: [
      c("asset-building", "資産形成", ["資産形成", "長期投資", "分散投資", "積立"], [
        c("beginner-invest", "初心者向け投資", ["初心者", "入門", "投資入門"]),
        c("long-term-invest", "長期投資", ["長期投資", "積立", "複利"]),
      ]),
      c("stock", "株式投資", ["株式", "日本株", "米国株", "高配当", "株"], [
        c("high-dividend", "高配当株", ["高配当", "配当", "連続増配"]),
        c("jp-stock", "日本株", ["日本株", "東証", "東京証券取引所"]),
        c("us-stock", "米国株", ["米国株", "nasdaq", "nyse", "sp500"]),
      ]),
      c("nisa-fund", "投資信託・NISA", ["nisa", "投資信託", "etf", "インデックス"], [
        c("nisa", "NISA", ["nisa", "新nisa", "ideco"]),
        c("etf", "ETF", ["etf", "インデックスファンド", "インデックス投資"]),
      ]),
      c("fx-trade", "FX・トレード", ["fx", "トレード", "為替", "テクニカル"], [
        c("fx", "FX", ["fx", "為替", "通貨ペア"]),
      ]),
      c("money-lit", "マネーリテラシー", ["家計", "税金", "節約", "お金の知識"], [
        c("household", "家計管理", ["家計管理", "家計簿", "支出管理"]),
        c("saving", "節約", ["節約", "固定費", "支出"]),
        c("tax", "税金", ["税金", "節税", "確定申告"]),
      ]),
      c("real-estate-invest", "不動産投資", ["不動産投資", "キャッシュフロー", "物件"], [
        c("real-estate", "不動産投資", ["不動産投資", "rc", "利回り"]),
      ]),
    ],
  },

  // ── 心理学・行動科学 ─────────────────────────────────────────────────────
  {
    id: "psychology",
    label: "心理学・行動科学",
    emoji: "🧠",
    desc: "行動経済学・認知心理・メンタル",
    mappedLabels: ["心理学"],
    keywords: ["心理学", "行動経済学", "脳科学", "メンタル", "認知", "感情", "心理"],
    strongKeywords: [
      "心理学", "認知心理学", "行動経済学", "脳科学", "心理療法",
      "バイアス", "認知バイアス", "ヒューリスティック",
    ],
    weakKeywords: ["学習", "記憶", "成長", "人間関係", "コミュニケーション"],
    excludeKeywords: [
      "小説", "物語", "漫画", "コミック",
      "経営戦略", "会計", "プログラミング", "sql", "投資", "株式",
      "哲学史", "宗教学",
    ],
    requiredAny: [
      "心理学", "心理", "認知", "脳科学", "精神", "メンタル",
      "感情", "行動経済学", "心理療法", "カウンセリング", "バイアス",
      "ヒューリスティック", "認知行動", "神経",
    ],
    subcategories: [
      c("behavioral-econ", "行動経済学", ["行動経済学", "意思決定", "バイアス", "ヒューリスティック"], [
        c("bias", "バイアス", ["バイアス", "ヒューリスティック", "認知バイアス"]),
        c("decision", "意思決定", ["意思決定", "判断", "選択バイアス"]),
      ], { requiredAny: ["行動経済学", "バイアス", "ヒューリスティック", "意思決定科学"] }),
      c("cognitive", "認知心理学", ["認知心理", "学習", "記憶", "知覚"], [
        c("learning-memory", "学習・記憶", ["学習", "記憶", "認知", "認知科学"]),
      ], { requiredAny: ["認知", "認知心理", "認知科学", "知覚"] }),
      c("neuroscience", "脳科学", ["脳科学", "脳", "神経", "神経科学"], [
        c("habit-build", "習慣形成", ["習慣形成", "習慣化", "脳の仕組み"]),
      ], { requiredAny: ["脳科学", "脳", "神経", "神経科学"] }),
      c("mental-care", "メンタルケア", ["ストレス", "メンタル", "感情", "不安", "うつ"], [
        c("stress", "ストレス", ["ストレス", "不安", "回復", "レジリエンス"]),
        c("emotion", "感情", ["感情", "情動", "セルフケア", "感情調整"]),
      ], { requiredAny: ["メンタル", "ストレス", "感情", "不安", "うつ", "精神"] }),
      c("social-psych", "対人心理", ["対人", "説得", "人間関係", "社会心理"], [
        c("persuasion", "説得", ["説得", "影響力", "説得心理"]),
        c("relationships", "人間関係", ["人間関係", "対人関係", "社会的影響"]),
      ], { requiredAny: ["対人", "社会心理", "人間関係", "説得", "影響力"] }),
    ],
  },

  // ── 小説・文芸 ───────────────────────────────────────────────────────────
  {
    id: "novel",
    label: "小説・文芸",
    emoji: "📖",
    desc: "ミステリー・SF・恋愛・文学・ホラー",
    mappedLabels: ["小説・文学"],
    keywords: ["小説", "文芸", "物語", "ミステリー", "sf", "ファンタジー", "文学"],
    strongKeywords: [
      "探偵", "ミステリー", "サスペンス", "恋愛小説", "純文学",
      "主人公", "登場人物", "著者", "作家", "新刊",
    ],
    weakKeywords: ["物語", "作品", "世界観", "結末"],
    excludeKeywords: [
      "経営", "会計", "簿記", "財務",
      "プログラミング", "sql", "python", "javascript", "aws", "docker",
      "投資", "nisa", "株式", "etf",
      "哲学史", "宗教学",
    ],
    requiredAny: [
      "小説", "文芸", "文学", "ミステリー", "sf", "ファンタジー",
      "ホラー", "探偵", "推理", "主人公", "登場人物", "著者",
      "純文学", "長編", "短編", "文豪", "受賞作",
    ],
    subcategories: [
      c("mystery", "ミステリー", ["ミステリー", "推理", "探偵", "サスペンス", "犯人", "事件"], [
        c("honkaku-mystery", "本格ミステリー", ["本格", "トリック", "密室", "本格ミステリー"],
          undefined, { strongKeywords: ["密室", "アリバイ", "トリック"], requiredAny: ["本格", "トリック", "密室", "アリバイ"] }),
        c("suspense", "サスペンス", ["サスペンス", "緊張感", "心理戦", "スリラー"]),
        c("police", "警察小説", ["警察", "刑事", "捜査", "警察小説"],
          undefined, { requiredAny: ["警察", "刑事", "捜査", "警察官", "刑事小説"] }),
        c("court-social", "法廷・社会派", ["法廷", "社会派", "冤罪", "弁護士", "検察"]),
        c("classic-mystery", "古典ミステリー", ["古典", "ホームズ", "ポアロ", "クリスティ", "名探偵"],
          undefined, { strongKeywords: ["ホームズ", "ポアロ", "クリスティ", "コナンドイル"] }),
      ], { requiredAny: ["ミステリー", "推理", "探偵", "サスペンス", "犯人", "事件", "謎", "犯罪", "刑事"] }),
      c("sf", "SF", ["sf", "宇宙", "ディストピア", "近未来", "サイエンスフィクション"], [
        c("hard-sf", "ハードSF", ["ハードsf", "科学考証", "工学", "hard sf"],
          undefined, { strongKeywords: ["ハードsf", "科学考証"] }),
        c("near-future", "近未来SF", ["近未来", "未来社会", "ai", "人工知能"]),
        c("dystopia", "ディストピア", ["ディストピア", "管理社会", "全体主義"]),
        c("space-sf", "宇宙SF", ["宇宙", "惑星", "宇宙船", "銀河", "星間"]),
        c("ai-tech-sf", "AI・テクノロジーSF", ["ai", "人工知能", "テクノロジー", "サイバーパンク"]),
      ], { requiredAny: ["sf", "サイエンスフィクション", "宇宙", "ディストピア", "近未来", "人工知能", "異星", "タイムトラベル"] }),
      c("fantasy", "ファンタジー", ["ファンタジー", "魔法", "異世界", "剣と魔法"], [
        c("isekai", "異世界", ["異世界", "転生", "召喚", "チート"]),
        c("dark-fantasy", "ダークファンタジー", ["ダーク", "退廃", "呪い", "ダークファンタジー"]),
        c("adventure-fantasy", "冒険ファンタジー", ["冒険", "旅", "王国", "勇者"]),
        c("myth", "神話・伝承系", ["神話", "伝承", "英雄譚", "叙事詩"]),
        c("modern-fantasy", "現代ファンタジー", ["現代ファンタジー", "日常×幻想", "魔法少女"]),
      ], { requiredAny: ["ファンタジー", "魔法", "異世界", "ドラゴン", "騎士", "冒険", "伝説", "指輪物語", "ハリーポッター"] }),
      c("romance", "恋愛", ["恋愛", "ラブ", "純愛", "恋愛小説"], [
        c("pure-love", "純愛", ["純愛", "一途", "初恋"]),
        c("adult-romance", "大人の恋愛", ["大人の恋愛", "再会", "不倫"]),
        c("sad-romance", "切ない恋愛", ["切ない", "喪失", "別れ"]),
        c("romcom", "ラブコメ", ["ラブコメ", "恋愛コメディ", "ラブコメディ"]),
        c("women-romance", "女性向け恋愛", ["女性向け", "恋愛小説", "少女小説"]),
      ], { requiredAny: ["恋愛", "ラブ", "純愛", "恋", "ロマンス", "愛"] }),
      c("youth", "青春", ["青春", "学園", "成長", "青春小説"], [
        c("school", "学園", ["学園", "学校", "高校", "大学"]),
        c("growth", "成長物語", ["成長", "自立", "葛藤", "挑戦"]),
        c("friendship", "友情", ["友情", "仲間", "絆"]),
        c("club-sports", "部活・競技", ["部活", "競技", "大会", "スポーツ"]),
        c("summer", "ひと夏系", ["ひと夏", "夏休み", "夏", "青春の夏"]),
      ], { requiredAny: ["青春", "学園", "成長物語", "学校", "友情", "部活"] }),
      c("literary", "純文学", ["純文学", "文学", "文芸", "受賞", "芥川賞", "直木賞"], [
        c("modern-literature", "現代文学", ["現代文学", "現代小説", "日本現代文学"]),
        c("jp-literature", "日本文学", ["日本文学", "文豪", "日本近代文学"]),
        c("foreign-literature", "海外文学", ["海外文学", "翻訳文学", "世界文学"]),
        c("award", "受賞作", ["受賞作", "芥川賞", "直木賞", "本屋大賞", "ブッカー賞"]),
        c("classic-literature", "古典文学", ["古典文学", "古典", "源氏物語"]),
      ]),
      c("historical-novel", "歴史小説", ["歴史小説", "時代小説", "戦国", "幕末", "江戸"], [
        c("jp-history", "日本史", ["日本史", "時代小説", "武士", "侍"]),
        c("sengoku-bakumatsu", "戦国・幕末", ["戦国", "幕末", "維新", "坂本龍馬"]),
        c("ancient-medieval", "古代・中世", ["古代", "中世", "平安", "奈良"]),
        c("foreign-history", "海外歴史", ["海外歴史", "欧州史", "ローマ帝国"]),
        c("modern-history", "近現代史", ["近現代", "戦後", "明治", "大正"]),
      ], { requiredAny: ["歴史小説", "時代小説", "戦国", "幕末", "武士", "江戸", "歴史長編"] }),
      c("horror", "ホラー", ["ホラー", "怪談", "恐怖", "心霊"], [
        c("ghost-story", "怪談", ["怪談", "怪異", "幽霊"]),
        c("psycho-horror", "心理ホラー", ["心理ホラー", "不安", "狂気", "異常心理"]),
        c("splatter", "スプラッタ", ["スプラッタ", "残虐", "グロ"]),
        c("j-horror", "和風ホラー", ["和風ホラー", "和風", "日本ホラー"]),
        c("suspense-horror", "サスペンスホラー", ["サスペンスホラー", "追跡", "逃亡"]),
      ], { requiredAny: ["ホラー", "怪談", "恐怖", "心霊", "怪異", "狂気", "スリラー"] }),
      c("entertainment", "エンタメ小説", ["エンタメ", "ベストセラー", "映像化", "読みやすい"], [
        c("tearjerker", "泣ける", ["泣ける", "感動", "涙"]),
        c("twist", "どんでん返し", ["どんでん返し", "意外な結末", "伏線回収"]),
        c("movie-adapted", "映像化作品", ["映像化", "映画化", "ドラマ化"]),
        c("easy-masterpiece", "読みやすい名作", ["読みやすい", "名作", "入門", "一気読み"]),
        c("bestseller", "ベストセラー", ["ベストセラー", "話題作", "累計"]),
      ]),
    ],
  },

  // ── 哲学・思想 ───────────────────────────────────────────────────────────
  {
    id: "philosophy",
    label: "哲学・思想",
    emoji: "🔭",
    desc: "西洋哲学・東洋思想・倫理・宗教",
    mappedLabels: ["哲学・思想"],
    keywords: ["哲学", "思想", "倫理", "宗教", "哲学者"],
    strongKeywords: [
      "哲学", "哲学史", "倫理学", "形而上学", "認識論",
      "実存主義", "唯物論", "観念論", "宗教学",
    ],
    weakKeywords: ["思想", "考え方", "信仰", "精神"],
    excludeKeywords: [
      "小説", "物語", "漫画", "コミック",
      "プログラミング", "sql", "python", "投資", "株式",
      "経営戦略", "会計", "簿記",
    ],
    requiredAny: [
      "哲学", "思想", "倫理", "宗教", "哲学者", "哲学史",
      "実存", "形而上", "認識論", "禅", "仏教", "儒教",
      "道教", "宗教学", "神学", "イデア", "弁証法",
    ],
    subcategories: [
      c("western", "西洋哲学", ["西洋哲学", "哲学史", "実存", "ニーチェ", "カント", "ソクラテス"], [
        c("philosophy-history", "哲学史", ["哲学史", "ソクラテス", "カント", "ニーチェ", "プラトン"]),
        c("existentialism", "実存", ["実存", "実存主義", "サルトル", "ハイデガー"]),
      ], { requiredAny: ["西洋哲学", "哲学史", "実存", "ニーチェ", "カント", "ソクラテス", "形而上学"] }),
      c("eastern", "東洋思想", ["東洋思想", "仏教", "儒教", "道教", "禅", "老子"], [
        c("buddhism", "仏教", ["仏教", "仏典", "悟り", "輪廻"]),
        c("zen", "禅", ["禅", "坐禅", "禅宗"]),
        c("confucianism", "儒教", ["儒教", "論語", "孔子"]),
        c("taoism", "道教", ["道教", "老子", "荘子"]),
      ], { requiredAny: ["東洋思想", "仏教", "儒教", "道教", "禅", "老子", "孔子", "仏典"] }),
      c("ethics-life", "倫理・人生論", ["倫理", "人生論", "生き方", "道徳"], [
        c("ethics", "倫理学", ["倫理学", "規範", "善悪", "道徳哲学"]),
        c("life-theory", "人生論", ["人生論", "生き方", "幸福論"]),
      ], { requiredAny: ["倫理", "倫理学", "道徳", "善悪", "人生論"] }),
      c("religion", "宗教", ["宗教", "宗教学", "信仰", "神学"], [
        c("religious-studies", "宗教学", ["宗教学", "宗教史", "宗教論"]),
        c("intro-thought", "思想入門", ["思想入門", "哲学入門", "哲学概論"]),
      ]),
    ],
  },

  // ── 歴史・社会 ───────────────────────────────────────────────────────────
  {
    id: "history",
    label: "歴史・社会",
    emoji: "🏛️",
    desc: "世界史・日本史・政治・社会課題",
    mappedLabels: ["歴史・社会"],
    keywords: ["歴史", "社会", "政治", "地政学", "国際", "文明", "史"],
    strongKeywords: ["世界史", "日本史", "地政学", "国際政治", "政治学", "社会問題"],
    weakKeywords: ["社会", "現代", "変化", "グローバル"],
    excludeKeywords: [
      "小説", "物語", "漫画", "コミック", "歴史小説", "時代小説",
      "プログラミング", "sql", "投資", "株式",
    ],
    subcategories: [
      c("world-history", "世界史", ["世界史", "文明", "地政学", "帝国史"], [
        c("ancient", "古代", ["古代", "古代文明", "ローマ", "ギリシャ"]),
        c("medieval", "中世", ["中世", "中世史", "十字軍"]),
        c("modern", "近代", ["近代", "帝国", "産業革命"]),
        c("contemporary", "現代", ["現代", "冷戦", "グローバル", "20世紀"]),
      ]),
      c("japanese-history", "日本史", ["日本史", "戦国", "幕末", "戦後", "明治"], [
        c("sengoku", "戦国・幕末", ["戦国", "幕末", "維新", "江戸幕府"]),
        c("postwar", "戦後", ["戦後", "昭和", "平成", "戦後日本"]),
      ]),
      c("politics", "政治・制度", ["政治", "制度", "政策", "行政"], [
        c("policy", "政策", ["政策", "行政", "制度設計", "法律"]),
      ]),
      c("social-issue", "社会課題", ["社会問題", "格差", "少子化", "貧困"], [
        c("social-problem", "社会問題", ["社会問題", "格差", "貧困", "差別"]),
      ]),
      c("global", "環境・国際", ["sdgs", "環境", "国際", "国際関係", "外交"], [
        c("sdgs", "SDGs", ["sdgs", "サステナビリティ", "気候変動", "環境問題"]),
        c("international", "国際関係", ["国際関係", "外交", "国連", "地政学"]),
      ]),
    ],
  },

  // ── 科学・教養 ───────────────────────────────────────────────────────────
  {
    id: "science",
    label: "科学・教養",
    emoji: "🔬",
    desc: "物理・生物・数学・一般教養",
    mappedLabels: ["科学・教養", "科学・技術"],
    keywords: ["科学", "物理", "宇宙", "数学", "統計", "生物", "化学", "天文"],
    strongKeywords: [
      "物理学", "量子力学", "素粒子", "天文学", "宇宙論",
      "進化論", "遺伝子", "dna", "生命科学", "数学",
    ],
    weakKeywords: ["ai", "技術", "情報", "科学技術", "統計"],
    excludeKeywords: [
      "小説", "物語", "漫画", "コミック",
      "ビジネス", "経営", "投資", "自己啓発",
      "プログラミング入門", "sqlチュートリアル",
    ],
    requiredAny: [
      "科学", "物理", "宇宙", "数学", "生物学", "化学", "天文学",
      "統計学", "進化", "遺伝子", "量子", "医学", "生命科学",
      "素粒子", "相対性理論", "熱力学",
    ],
    subcategories: [
      c("physics-space", "物理・宇宙", ["物理", "宇宙", "量子", "相対性理論", "素粒子"], [
        c("quantum", "量子", ["量子", "素粒子", "量子力学", "量子コンピュータ"]),
        c("space", "宇宙", ["宇宙", "天文学", "銀河", "ブラックホール", "惑星"]),
      ], { requiredAny: ["物理", "宇宙", "量子", "天文", "素粒子", "相対性理論"] }),
      c("bio-med", "生物・医学", ["生物", "遺伝", "人体", "医学", "生命"], [
        c("evolution", "進化", ["進化", "生態", "進化論", "自然選択"]),
        c("genetics", "遺伝", ["遺伝", "dna", "ゲノム", "遺伝子工学"]),
        c("human-body", "人体", ["人体", "解剖", "脳", "生理学"]),
      ], { requiredAny: ["生物", "遺伝", "進化", "医学", "生命科学", "ゲノム", "dna"] }),
      c("math-stats", "数学・統計", ["数学", "統計", "確率", "線形代数", "微積分"], [
        c("statistics", "統計", ["統計", "回帰", "仮説検定", "統計学"]),
        c("probability", "確率", ["確率", "確率論", "確率変数"]),
        c("linear-algebra", "線形代数", ["線形代数", "行列", "ベクトル"]),
      ], { requiredAny: ["数学", "統計学", "確率", "線形代数", "微積分", "数理"] }),
      c("general-education", "一般教養", ["教養", "科学読み物", "サイエンス", "科学エッセイ"], [
        c("math-literacy", "数学教養", ["数学教養", "数理思考", "数学的思考"]),
        c("science-reading", "科学読み物", ["科学読み物", "科学エッセイ", "ポピュラーサイエンス"]),
      ]),
    ],
  },

  // ── 漫画 ─────────────────────────────────────────────────────────────────
  {
    id: "manga",
    label: "漫画",
    emoji: "🎨",
    desc: "少年・少女・青年・一般漫画",
    mappedLabels: ["漫画"],
    keywords: ["漫画", "コミック", "マンガ", "コミックス"],
    strongKeywords: ["漫画", "コミック", "マンガ", "コミックス", "第1巻", "第一巻"],
    requiredAny: ["漫画", "コミック", "マンガ", "コミックス"],
    subcategories: [
      c("shonen", "少年漫画", ["少年", "ジャンプ", "バトル", "スポーツ", "友情"], [
        c("battle", "バトル", ["バトル", "異能", "能力", "戦闘"]),
        c("adventure", "冒険", ["冒険", "旅", "冒険漫画"]),
        c("sports", "スポーツ", ["スポーツ", "野球", "サッカー", "バスケ"]),
      ]),
      c("shojo", "少女漫画", ["少女", "恋愛", "ラブコメ", "少女漫画"], [
        c("romance", "恋愛", ["恋愛", "胸キュン", "片思い"]),
        c("romcom", "ラブコメ", ["ラブコメ", "コメディ", "甘々"]),
      ]),
      c("seinen", "青年漫画", ["青年", "社会派", "ドラマ", "グルメ", "青年漫画"], [
        c("social", "社会派", ["社会派", "社会問題", "リアル"]),
        c("drama", "ドラマ", ["ドラマ", "人間ドラマ", "感動"]),
        c("hobby-gourmet", "趣味・グルメ", ["グルメ", "趣味", "料理", "食"]),
      ]),
      c("general", "一般漫画", ["日常", "ギャグ", "一般", "コメディ"], [
        c("daily", "日常", ["日常", "ほのぼの", "日常系"]),
        c("gag", "ギャグ", ["ギャグ", "コメディ", "笑い", "4コマ"]),
      ]),
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// L4 ファセットタグ
// ─────────────────────────────────────────────────────────────────────────────

export const L4_TAG_RULES: FacetTagRule[] = [
  {
    id: "intro", label: "入門",
    keywords: ["入門", "はじめて", "最初の1冊", "超入門"],
    minScore: 2.0,
  },
  {
    id: "beginner", label: "初級",
    keywords: ["初級", "初心者向け", "やさしい", "初歩"],
    minScore: 2.0,
  },
  {
    id: "intermediate", label: "中級",
    keywords: ["中級", "中級者"],
    minScore: 2.0,
  },
  {
    id: "advanced", label: "上級",
    keywords: ["上級", "実践上級", "エキスパート"],
    minScore: 2.0,
  },
  {
    id: "practical", label: "実務向け",
    keywords: ["実務", "現場", "業務で使う", "実践"],
    minScore: 2.2,
  },
  {
    id: "exam", label: "試験対策",
    keywords: ["試験対策", "頻出", "過去問", "試験"],
    minScore: 2.2,
  },
  {
    id: "diagram", label: "図解",
    keywords: ["図解", "図でわかる", "ビジュアル"],
    minScore: 2.2,
  },
  {
    id: "case-study", label: "事例中心",
    keywords: ["事例", "ケーススタディ", "実例"],
    minScore: 2.2,
  },
  {
    id: "workbook", label: "ワーク付き",
    keywords: ["ワーク", "演習", "問題集", "ワークブック"],
    minScore: 2.2,
  },
  {
    id: "readable", label: "読みやすい",
    keywords: ["読みやすい", "わかりやすい", "読みやすさ"],
    minScore: 2.2,
    excludeKeywords: ["難解", "難しい", "高度"],
  },
  {
    id: "dense", label: "重厚",
    keywords: ["重厚", "大作", "本格長編"],
    phraseKeywords: ["大作", "本格長編"],
    minScore: 2.5,
  },
  {
    id: "short-story", label: "短編集",
    keywords: ["短編集", "短編", "連作短編"],
    phraseKeywords: ["短編集", "連作短編"],
    minScore: 2.5,
  },
  {
    id: "long-form", label: "長編",
    keywords: ["長編", "大長編"],
    phraseKeywords: ["長編", "大長編"],
    minScore: 2.5,
  },
  {
    id: "series", label: "シリーズ",
    keywords: ["シリーズ", "第1巻", "続編", "シリーズ作品"],
    minScore: 2.2,
  },
  {
    id: "adapted", label: "映像化",
    keywords: ["映像化", "映画化", "ドラマ化", "アニメ化"],
    minScore: 2.2,
  },
  {
    id: "analysis", label: "考察向け",
    keywords: ["考察", "解釈", "テーマ性", "深読み"],
    minScore: 2.5,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// L5 専門タグ
// ─────────────────────────────────────────────────────────────────────────────

export const L5_TAG_RULES: FacetTagRule[] = [
  // ── 小説・文芸（重点） ───────────────────────────────────────────────────
  {
    id: "locked-room", label: "密室",
    keywords: ["密室"],
    phraseKeywords: ["密室殺人", "密室トリック"],
    l1Allow: ["novel"], l2Allow: ["mystery"],
    minScore: 3.0,
  },
  {
    id: "unreliable-trick", label: "叙述トリック",
    keywords: ["叙述トリック"],
    phraseKeywords: ["叙述トリック"],
    l1Allow: ["novel"], l2Allow: ["mystery", "honkaku-mystery"],
    minScore: 3.0,
  },
  {
    id: "plot-twist", label: "どんでん返し",
    keywords: ["どんでん返し", "意外な結末"],
    phraseKeywords: ["どんでん返し"],
    l1Allow: ["novel"],
    minScore: 2.8,
  },
  {
    id: "page-turner", label: "一気読み",
    keywords: ["一気読み", "止まらない"],
    phraseKeywords: ["一気読み"],
    l1Allow: ["novel"],
    minScore: 2.8,
  },
  {
    id: "dark-aftertaste", label: "後味が悪い",
    keywords: ["後味が悪い"],
    phraseKeywords: ["後味が悪い"],
    l1Allow: ["novel"],
    minScore: 3.0,
  },
  {
    id: "tearjerker", label: "泣ける",
    keywords: ["泣ける", "涙"],
    requiredAny: ["泣ける", "号泣", "涙なしには"],
    l1Allow: ["novel"],
    minScore: 2.8,
  },
  {
    id: "moving", label: "感動",
    keywords: ["感動"],
    phraseKeywords: ["感動作", "感動の"],
    l1Allow: ["novel"],
    minScore: 2.8,
  },
  {
    id: "female-lead", label: "女主人公",
    keywords: ["女性主人公", "女主人公"],
    phraseKeywords: ["女性主人公"],
    l1Allow: ["novel"],
    minScore: 3.0,
  },
  {
    id: "male-lead", label: "男主人公",
    keywords: ["男性主人公", "男主人公"],
    phraseKeywords: ["男性主人公"],
    l1Allow: ["novel"],
    minScore: 3.0,
  },
  {
    id: "ensemble", label: "群像劇",
    keywords: ["群像劇"],
    phraseKeywords: ["群像劇"],
    l1Allow: ["novel"],
    minScore: 3.0,
  },
  {
    id: "school", label: "学園",
    keywords: ["学園", "学校"],
    requiredAny: ["学園", "学校", "高校生", "中学生"],
    l1Allow: ["novel", "manga"],
    minScore: 2.8,
  },
  {
    id: "police", label: "警察",
    keywords: ["警察", "刑事"],
    requiredAny: ["警察", "刑事", "捜査"],
    l1Allow: ["novel"], l2Allow: ["mystery"],
    minScore: 2.8,
  },
  {
    id: "detective", label: "探偵",
    keywords: ["探偵", "ホームズ", "ポアロ"],
    requiredAny: ["探偵", "名探偵", "私立探偵"],
    l1Allow: ["novel"], l2Allow: ["mystery"],
    minScore: 2.8,
  },
  {
    id: "courtroom", label: "法廷",
    keywords: ["法廷", "裁判"],
    phraseKeywords: ["法廷ミステリー", "法廷小説"],
    requiredAny: ["法廷", "裁判", "弁護士", "検察"],
    l1Allow: ["novel"], l2Allow: ["mystery"],
    minScore: 3.0,
  },
  {
    id: "war", label: "戦争",
    keywords: ["戦争", "戦時"],
    requiredAny: ["戦争", "戦時", "戦場", "兵士"],
    l1Allow: ["novel", "history"],
    minScore: 2.8,
  },
  {
    id: "isekai", label: "異世界",
    keywords: ["異世界", "転生"],
    requiredAny: ["異世界", "転生", "召喚"],
    l1Allow: ["novel", "manga"],
    minScore: 2.8,
  },
  {
    id: "space", label: "宇宙",
    keywords: ["宇宙"],
    requiredAny: ["宇宙", "惑星", "銀河", "宇宙船"],
    l1Allow: ["novel", "science"],
    minScore: 2.8,
  },
  {
    id: "ai-theme", label: "AIテーマ",
    keywords: ["ai", "人工知能"],
    requiredAny: ["ai", "人工知能", "ロボット", "機械知性"],
    l1Allow: ["novel", "tech"],
    minScore: 2.8,
  },
  {
    id: "adapted-original", label: "映像化原作",
    keywords: ["映像化", "映画化", "ドラマ化"],
    requiredAny: ["映像化", "映画化", "ドラマ化", "アニメ化"],
    l1Allow: ["novel"],
    minScore: 2.8,
  },
  {
    id: "linked-shorts", label: "短編連作",
    keywords: ["連作", "短編連作"],
    phraseKeywords: ["短編連作", "連作短編集"],
    l1Allow: ["novel"],
    minScore: 3.0,
  },

  // ── テクノロジー・IT（重点） ─────────────────────────────────────────────
  {
    id: "python", label: "Python",
    keywords: ["python"],
    l1Allow: ["tech"],
    minScore: 2.0,
  },
  {
    id: "javascript", label: "JavaScript",
    keywords: ["javascript"],
    l1Allow: ["tech"],
    minScore: 2.0,
  },
  {
    id: "typescript", label: "TypeScript",
    keywords: ["typescript"],
    l1Allow: ["tech"],
    minScore: 2.0,
  },
  {
    id: "react", label: "React",
    keywords: ["react"],
    l1Allow: ["tech"],
    minScore: 2.0,
  },
  {
    id: "nextjs", label: "Next.js",
    keywords: ["next.js", "nextjs"],
    l1Allow: ["tech"],
    minScore: 2.0,
  },
  {
    id: "aws", label: "AWS",
    keywords: ["aws"],
    l1Allow: ["tech"],
    minScore: 2.0,
  },
  {
    id: "docker", label: "Docker",
    keywords: ["docker"],
    l1Allow: ["tech"],
    minScore: 2.0,
  },
  {
    id: "kubernetes", label: "Kubernetes",
    keywords: ["kubernetes", "k8s"],
    l1Allow: ["tech"],
    minScore: 2.0,
  },
  {
    id: "chatgpt", label: "ChatGPT",
    keywords: ["chatgpt"],
    l1Allow: ["tech"],
    minScore: 2.0,
  },
  {
    id: "llm", label: "LLM",
    keywords: ["llm", "rag"],
    l1Allow: ["tech"],
    minScore: 2.0,
  },
  {
    id: "sql", label: "SQL",
    keywords: ["sql", "postgres", "mysql"],
    l1Allow: ["tech"],
    minScore: 2.0,
  },
  {
    id: "hands-on", label: "ハンズオン",
    keywords: ["ハンズオン", "手を動かす"],
    l1Allow: ["tech"],
    minScore: 2.2,
  },
  {
    id: "sample-code", label: "サンプルコードあり",
    keywords: ["サンプルコード", "コード例"],
    l1Allow: ["tech"],
    minScore: 2.2,
  },
  {
    id: "non-engineer", label: "非エンジニア向け",
    keywords: ["非エンジニア", "文系", "入門"],
    l1Allow: ["tech"],
    minScore: 2.2,
  },
  {
    id: "for-practice", label: "現場向け",
    keywords: ["現場向け", "実務", "運用"],
    l1Allow: ["tech"],
    minScore: 2.2,
  },
  {
    id: "implementation", label: "実装重視",
    keywords: ["実装", "実践", "コード中心"],
    l1Allow: ["tech"],
    minScore: 2.2,
  },
  {
    id: "theory", label: "理論重視",
    keywords: ["理論", "数理", "理論重視"],
    l1Allow: ["tech"],
    minScore: 2.5,
  },
  {
    id: "exam-freq", label: "試験頻出",
    keywords: ["頻出", "過去問", "試験"],
    l1Allow: ["tech"],
    minScore: 2.2,
  },

  // ── その他 ───────────────────────────────────────────────────────────────
  {
    id: "manager-target", label: "管理職向け",
    keywords: ["管理職", "マネージャー"],
    requiredAny: ["管理職", "マネージャー", "マネジメント"],
    l1Allow: ["business"],
    minScore: 2.5,
  },
  {
    id: "career-change", label: "キャリア転職",
    keywords: ["転職", "キャリアチェンジ"],
    requiredAny: ["転職", "キャリアチェンジ"],
    l1Allow: ["business"],
    minScore: 2.5,
  },
  {
    id: "new-nisa", label: "新NISA",
    keywords: ["新nisa", "nisa"],
    requiredAny: ["新nisa", "nisa"],
    l1Allow: ["investing"],
    minScore: 2.2,
  },
  {
    id: "index-invest", label: "インデックス",
    keywords: ["インデックス", "etf"],
    requiredAny: ["インデックス", "etf", "インデックスファンド"],
    l1Allow: ["investing"],
    minScore: 2.2,
  },
  {
    id: "mental-recovery", label: "メンタル回復",
    keywords: ["回復", "ストレス", "不安"],
    requiredAny: ["回復", "ストレス", "不安", "うつ"],
    l1Allow: ["psychology", "self-help"],
    minScore: 2.5,
  },
  {
    id: "self-analysis", label: "自己分析",
    keywords: ["自己分析", "自己理解"],
    requiredAny: ["自己分析", "自己理解"],
    l1Allow: ["self-help"],
    minScore: 2.5,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 後方互換スタブ
// ─────────────────────────────────────────────────────────────────────────────

/** @deprecated categoryClassifier.ts では AUTHOR_PRIORS_MAP (priors.ts) を使うこと */
export type AuthorPrior = {
  l1Id: string;
  l2Id?: string;
  l3Id?: string;
  boostL1?: number;
  boostL2?: number;
  boostL3?: number;
};

/** @deprecated priors.ts の AUTHOR_PRIORS_MAP に移行済み */
export const AUTHOR_PRIORS: Record<string, AuthorPrior> = {};

/** @deprecated priors.ts の SERIES_PRIORS_MAP に移行済み */
export const SERIES_PRIORS: Record<string, AuthorPrior> = {};

/** @deprecated Use CATEGORY_TREE directly */
export const OTHER_CATEGORY: Category = { id: "other", label: "その他", keywords: [] };
/** @deprecated */
export const OTHER_L2 = OTHER_CATEGORY;
