/**
 * カテゴリツリー定義（L1/L2/L3） + ファセットタグ（L4/L5）
 */

export interface Category {
  id: string;
  label: string;
  keywords: string[];
  strongKeywords?: string[];
  aliases?: string[];
  excludeKeywords?: string[];
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
  aliases?: string[];
  excludeKeywords?: string[];
  subcategories: Category[];
}

export interface FacetTagRule {
  id: string;
  label: string;
  keywords: string[];
  strongKeywords?: string[];
  aliases?: string[];
  excludeKeywords?: string[];
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
  {
    id: "business",
    label: "ビジネス・経済",
    emoji: "💼",
    desc: "仕事術・経営・マーケ・会計・キャリア・起業",
    mappedLabels: ["ビジネス・経済"],
    keywords: ["ビジネス", "経営", "会計", "マーケ", "起業", "キャリア", "仕事術"],
    strongKeywords: ["マネジメント", "財務", "コンサル", "BtoB", "BtoC"],
    subcategories: [
      c("workstyle", "仕事術", ["仕事術", "生産性", "働き方"], [
        c("task-management", "タスク管理", ["タスク管理", "todo", "gtd", "段取り"]),
        c("time-management", "時間管理", ["時間管理", "タイムマネジメント", "時短"]),
        c("focus", "集中力", ["集中力", "先延ばし", "ルーティン"]),
        c("meeting-doc", "会議・資料作成", ["会議", "議事録", "資料作成", "スライド"]),
        c("team-practice", "チーム実務", ["チーム", "実務", "連携", "業務改善"]),
      ]),
      c("thinking", "思考法", ["思考法", "論理", "問題解決"], [
        c("logical-thinking", "ロジカルシンキング", ["ロジカル", "論理思考", "mece"]),
        c("problem-solving", "問題解決", ["問題解決", "課題解決", "ボトルネック"]),
        c("decision-making", "意思決定", ["意思決定", "判断", "選択"]),
        c("hypothesis", "仮説思考", ["仮説", "仮説思考", "検証"]),
        c("explanation", "伝達・説明", ["説明", "伝え方", "図解", "プレゼン"]),
      ]),
      c("management", "経営", ["経営", "事業", "組織"], [
        c("business-strategy", "経営戦略", ["経営戦略", "競争優位", "戦略"]),
        c("org-management", "組織マネジメント", ["組織", "マネジメント", "チーム"]),
        c("leadership", "リーダーシップ", ["リーダー", "リーダーシップ", "管理職"]),
        c("hr-system", "人事・制度", ["人事", "制度", "評価", "採用"]),
        c("biz-planning", "事業企画", ["事業企画", "企画", "kpi", "新規事業計画"]),
      ]),
      c("marketing", "マーケティング", ["マーケティング", "セールス", "顧客"], [
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
  {
    id: "tech",
    label: "テクノロジー・IT",
    emoji: "💻",
    desc: "AI・開発・クラウド・セキュリティ・データ・DX",
    mappedLabels: ["テクノロジー・AI"],
    keywords: ["プログラミング", "ai", "it", "クラウド", "セキュリティ", "データ"],
    strongKeywords: ["python", "javascript", "aws", "docker", "kubernetes", "sql", "chatgpt", "llm"],
    subcategories: [
      c("ai-ml", "AI・機械学習", ["ai", "機械学習", "llm", "生成ai"], [
        c("genai", "生成AI", ["生成ai", "chatgpt", "gpt", "gemini"]),
        c("llm-app", "LLMアプリ開発", ["llm", "rag", "langchain", "agent"]),
        c("ml-basic", "機械学習基礎", ["機械学習", "回帰", "分類", "特徴量"]),
        c("deep-learning", "深層学習", ["深層学習", "ニューラル", "cnn", "transformer"]),
        c("ai-business", "AIビジネス活用", ["ai活用", "業務活用", "ai導入"]),
      ]),
      c("programming", "プログラミング", ["プログラミング", "開発", "コード"], [
        c("frontend", "Webフロントエンド", ["react", "next.js", "vue", "css", "typescript"]),
        c("backend", "バックエンド", ["java", "go", "ruby", "node", "api"]),
        c("algorithm", "アルゴリズム", ["アルゴリズム", "計算量", "データ構造"]),
        c("architecture", "設計・アーキテクチャ", ["アーキテクチャ", "設計", "クリーンコード"]),
        c("dev-process", "開発プロセス", ["アジャイル", "スクラム", "テスト", "ci/cd"]),
      ]),
      c("infra-cloud", "インフラ・クラウド", ["インフラ", "クラウド", "sre"], [
        c("aws", "AWS", ["aws", "ec2", "lambda", "s3"]),
        c("gcp-azure", "GCP・Azure", ["gcp", "azure", "bigquery"]),
        c("container", "Docker・Kubernetes", ["docker", "kubernetes", "k8s"]),
        c("network", "ネットワーク", ["ネットワーク", "tcp/ip", "dns", "ルーティング"]),
        c("sre-ops", "SRE・運用", ["sre", "運用", "監視", "可観測性"]),
      ]),
      c("security", "セキュリティ", ["セキュリティ", "脆弱性", "暗号"], [
        c("security-basic", "セキュリティ基礎", ["セキュリティ基礎", "脅威", "脆弱性"]),
        c("web-security", "Webセキュリティ", ["webセキュリティ", "xss", "sqlインジェクション"]),
        c("network-security", "ネットワークセキュリティ", ["firewall", "ids", "vpn"]),
        c("auth-crypto", "認証・暗号", ["認証", "暗号", "公開鍵", "oauth"]),
        c("incident", "インシデント対応", ["インシデント", "csirt", "フォレンジック"]),
      ]),
      c("data", "データ活用", ["データ分析", "sql", "bi", "統計"], [
        c("sql", "SQL", ["sql", "クエリ", "join", "postgres", "mysql"]),
        c("bi", "BI", ["bi", "power bi", "tableau", "ダッシュボード"]),
        c("data-analysis", "データ分析", ["データ分析", "pandas", "分析"]),
        c("stats-basic", "統計基礎", ["統計", "確率", "回帰", "検定"]),
        c("data-platform", "データ基盤", ["データ基盤", "dwh", "etl", "dbt"]),
      ]),
      c("dx", "IT戦略・DX", ["dx", "業務改善", "it企画"], [
        c("dx-promotion", "DX推進", ["dx推進", "デジタル変革"]),
        c("process-improve", "業務改善", ["業務改善", "bpr", "業務改革"]),
        c("automation-rpa", "自動化・RPA", ["rpa", "自動化", "power automate"]),
        c("it-planning", "IT企画", ["it企画", "ロードマップ", "要件定義"]),
        c("system-intro", "システム導入", ["システム導入", "erp", "crm"]),
      ]),
      c("cert", "資格試験", ["基本情報", "応用情報", "aws認定", "試験"], [
        c("fe", "基本情報", ["基本情報", "fe", "itパスポート"]),
        c("ap", "応用情報", ["応用情報", "ap"]),
        c("ipa-advanced", "高度情報処理", ["高度情報処理", "ネットワークスペシャリスト", "dbスペ"]),
        c("aws-cert", "AWS認定", ["aws認定", "saa", "soa", "dva"]),
        c("security-cert", "セキュリティ資格", ["情報処理安全確保支援士", "security+", "cissp"]),
      ]),
    ],
  },
  {
    id: "self-help",
    label: "自己啓発",
    emoji: "🌱",
    desc: "習慣・マインドセット・学習法・生き方",
    mappedLabels: ["自己啓発"],
    keywords: ["自己啓発", "習慣", "モチベーション", "生き方"],
    subcategories: [
      c("habit", "習慣", ["習慣", "継続", "行動"], [
        c("habit-formation", "習慣化", ["習慣化", "継続", "ルーティン"]),
        c("motivation", "モチベーション", ["モチベーション", "やる気"]),
      ]),
      c("mindset", "マインドセット", ["マインドセット", "自己理解"], [
        c("self-understanding", "自己理解", ["自己理解", "自己分析"]),
        c("wellbeing", "幸福論", ["幸福", "ウェルビーイング", "幸せ"]),
      ]),
      c("communication", "コミュニケーション", ["対話", "交渉", "プレゼン"], [
        c("listening", "対話・傾聴", ["傾聴", "対話", "質問力"]),
        c("negotiation", "説得・交渉", ["説得", "交渉", "合意形成"]),
        c("presentation", "プレゼン", ["プレゼン", "発信", "話し方"]),
      ]),
      c("learning", "学び方", ["学習法", "記憶", "勉強法"], [
        c("study-method", "学習法", ["学習法", "勉強法", "学び方"]),
        c("memory", "記憶法", ["記憶法", "暗記", "記憶術"]),
      ]),
      c("life", "生き方", ["人生", "人生設計", "生き方"], [
        c("life-design", "人生設計", ["人生設計", "ライフデザイン", "キャリア観"]),
      ]),
    ],
  },
  {
    id: "investing",
    label: "投資・お金",
    emoji: "📈",
    desc: "資産形成・株式・NISA・FX・家計",
    mappedLabels: ["投資・お金"],
    keywords: ["投資", "nisa", "株", "資産形成", "家計"],
    subcategories: [
      c("asset-building", "資産形成", ["資産形成", "長期投資", "分散投資"], [
        c("beginner-invest", "初心者向け投資", ["初心者", "入門", "投資入門"]),
        c("long-term-invest", "長期投資", ["長期投資", "積立", "複利"]),
      ]),
      c("stock", "株式投資", ["株式", "日本株", "米国株", "高配当"], [
        c("high-dividend", "高配当株", ["高配当", "配当"]),
        c("jp-stock", "日本株", ["日本株", "東証"]),
        c("us-stock", "米国株", ["米国株", "nasdaq", "nyse"]),
      ]),
      c("nisa-fund", "投資信託・NISA", ["nisa", "投資信託", "etf"], [
        c("nisa", "NISA", ["nisa", "新nisa"]),
        c("etf", "ETF", ["etf", "インデックスファンド"]),
      ]),
      c("fx-trade", "FX・トレード", ["fx", "トレード", "為替"], [
        c("fx", "FX", ["fx", "為替", "通貨ペア"]),
      ]),
      c("money-lit", "マネーリテラシー", ["家計", "税金", "節約"], [
        c("household", "家計管理", ["家計管理", "家計簿"]),
        c("saving", "節約", ["節約", "固定費", "支出"]),
        c("tax", "税金", ["税金", "節税", "確定申告"]),
      ]),
      c("real-estate-invest", "不動産投資", ["不動産投資", "キャッシュフロー", "物件"], [
        c("real-estate", "不動産投資", ["不動産投資", "rc", "利回り"]),
      ]),
    ],
  },
  {
    id: "psychology",
    label: "心理学・行動科学",
    emoji: "🧠",
    desc: "行動経済学・認知心理・メンタル",
    mappedLabels: ["心理学"],
    keywords: ["心理学", "行動経済学", "脳科学", "メンタル"],
    subcategories: [
      c("behavioral-econ", "行動経済学", ["行動経済学", "意思決定", "バイアス"], [
        c("bias", "バイアス", ["バイアス", "ヒューリスティック"]),
        c("decision", "意思決定", ["意思決定", "判断"]),
      ]),
      c("cognitive", "認知心理学", ["認知心理", "学習", "記憶"], [
        c("learning-memory", "学習・記憶", ["学習", "記憶", "認知"]),
      ]),
      c("neuroscience", "脳科学", ["脳科学", "脳", "神経"], [
        c("habit-build", "習慣形成", ["習慣形成", "習慣化"]),
      ]),
      c("mental-care", "メンタルケア", ["ストレス", "メンタル", "感情"], [
        c("stress", "ストレス", ["ストレス", "不安", "回復"]),
        c("emotion", "感情", ["感情", "情動", "セルフケア"]),
      ]),
      c("social-psych", "対人心理", ["対人", "説得", "人間関係"], [
        c("persuasion", "説得", ["説得", "影響力"]),
        c("relationships", "人間関係", ["人間関係", "対人関係"]),
      ]),
    ],
  },
  {
    id: "novel",
    label: "小説・文芸",
    emoji: "📖",
    desc: "ミステリー・SF・恋愛・文学・ホラー",
    mappedLabels: ["小説・文学"],
    keywords: ["小説", "文芸", "物語", "ミステリー", "sf", "ファンタジー"],
    strongKeywords: ["探偵", "ミステリー", "サスペンス", "恋愛小説", "純文学"],
    subcategories: [
      c("mystery", "ミステリー", ["ミステリー", "推理", "探偵", "サスペンス"], [
        c("honkaku-mystery", "本格ミステリー", ["本格", "トリック", "密室"]),
        c("suspense", "サスペンス", ["サスペンス", "緊張感", "心理戦"]),
        c("police", "警察小説", ["警察", "刑事", "捜査"]),
        c("court-social", "法廷・社会派", ["法廷", "社会派", "冤罪"]),
        c("classic-mystery", "古典ミステリー", ["古典", "ホームズ", "ポアロ", "クリスティ"]),
      ]),
      c("sf", "SF", ["sf", "宇宙", "ディストピア", "近未来"], [
        c("hard-sf", "ハードSF", ["ハードsf", "科学考証", "工学"]),
        c("near-future", "近未来SF", ["近未来", "未来社会"]),
        c("dystopia", "ディストピア", ["ディストピア", "管理社会"]),
        c("space-sf", "宇宙SF", ["宇宙", "惑星", "宇宙船"]),
        c("ai-tech-sf", "AI・テクノロジーSF", ["ai", "人工知能", "テクノロジー"]),
      ]),
      c("fantasy", "ファンタジー", ["ファンタジー", "魔法", "異世界"], [
        c("isekai", "異世界", ["異世界", "転生", "召喚"]),
        c("dark-fantasy", "ダークファンタジー", ["ダーク", "退廃", "呪い"]),
        c("adventure-fantasy", "冒険ファンタジー", ["冒険", "旅", "王国"]),
        c("myth", "神話・伝承系", ["神話", "伝承", "英雄譚"]),
        c("modern-fantasy", "現代ファンタジー", ["現代ファンタジー", "日常×幻想"]),
      ]),
      c("romance", "恋愛", ["恋愛", "ラブ", "純愛"], [
        c("pure-love", "純愛", ["純愛", "一途"]),
        c("adult-romance", "大人の恋愛", ["大人の恋愛", "再会"]),
        c("sad-romance", "切ない恋愛", ["切ない", "喪失", "別れ"]),
        c("romcom", "ラブコメ", ["ラブコメ", "恋愛コメディ"]),
        c("women-romance", "女性向け恋愛", ["女性向け", "恋愛小説"]),
      ]),
      c("youth", "青春", ["青春", "学園", "成長"], [
        c("school", "学園", ["学園", "学校", "高校"]),
        c("growth", "成長物語", ["成長", "自立", "葛藤"]),
        c("friendship", "友情", ["友情", "仲間"]),
        c("club-sports", "部活・競技", ["部活", "競技", "大会"]),
        c("summer", "ひと夏系", ["ひと夏", "夏休み", "夏"]),
      ]),
      c("literary", "純文学", ["純文学", "文学", "文芸", "受賞"], [
        c("modern-literature", "現代文学", ["現代文学", "現代小説"]),
        c("jp-literature", "日本文学", ["日本文学", "文豪"]),
        c("foreign-literature", "海外文学", ["海外文学", "翻訳文学"]),
        c("award", "受賞作", ["受賞作", "芥川賞", "直木賞", "本屋大賞"]),
        c("classic-literature", "古典文学", ["古典文学", "古典"]),
      ]),
      c("historical-novel", "歴史小説", ["歴史小説", "時代小説", "戦国", "幕末"], [
        c("jp-history", "日本史", ["日本史", "時代小説"]),
        c("sengoku-bakumatsu", "戦国・幕末", ["戦国", "幕末"]),
        c("ancient-medieval", "古代・中世", ["古代", "中世"]),
        c("foreign-history", "海外歴史", ["海外歴史", "欧州史"]),
        c("modern-history", "近現代史", ["近現代", "戦後"]),
      ]),
      c("horror", "ホラー", ["ホラー", "怪談", "恐怖"], [
        c("ghost-story", "怪談", ["怪談", "怪異"]),
        c("psycho-horror", "心理ホラー", ["心理ホラー", "不安", "狂気"]),
        c("splatter", "スプラッタ", ["スプラッタ", "残虐"]),
        c("j-horror", "和風ホラー", ["和風ホラー", "和風"]),
        c("suspense-horror", "サスペンスホラー", ["サスペンスホラー", "追跡"]),
      ]),
      c("entertainment", "エンタメ小説", ["エンタメ", "ベストセラー", "映像化"], [
        c("tearjerker", "泣ける", ["泣ける", "感動"]),
        c("twist", "どんでん返し", ["どんでん返し", "意外な結末"]),
        c("movie-adapted", "映像化作品", ["映像化", "映画化", "ドラマ化"]),
        c("easy-masterpiece", "読みやすい名作", ["読みやすい", "名作", "入門"]),
        c("bestseller", "ベストセラー", ["ベストセラー", "話題作"]),
      ]),
    ],
  },
  {
    id: "philosophy",
    label: "哲学・思想",
    emoji: "🔭",
    desc: "西洋哲学・東洋思想・倫理・宗教",
    mappedLabels: ["哲学・思想"],
    keywords: ["哲学", "思想", "倫理", "宗教"],
    subcategories: [
      c("western", "西洋哲学", ["西洋哲学", "哲学史", "実存", "ニーチェ", "カント"], [
        c("philosophy-history", "哲学史", ["哲学史", "ソクラテス", "カント", "ニーチェ"]),
        c("existentialism", "実存", ["実存", "実存主義", "サルトル"]),
      ]),
      c("eastern", "東洋思想", ["東洋思想", "仏教", "儒教", "道教", "禅"], [
        c("buddhism", "仏教", ["仏教", "仏典"]),
        c("zen", "禅", ["禅", "坐禅"]),
        c("confucianism", "儒教", ["儒教", "論語"]),
        c("taoism", "道教", ["道教", "老子", "荘子"]),
      ]),
      c("ethics-life", "倫理・人生論", ["倫理", "人生論", "生き方"], [
        c("ethics", "倫理学", ["倫理学", "規範", "善悪"]),
        c("life-theory", "人生論", ["人生論", "生き方", "幸福"]),
      ]),
      c("religion", "宗教", ["宗教", "宗教学", "信仰"], [
        c("religious-studies", "宗教学", ["宗教学", "宗教史"]),
        c("intro-thought", "思想入門", ["思想入門", "哲学入門"]),
      ]),
    ],
  },
  {
    id: "history",
    label: "歴史・社会",
    emoji: "🏛️",
    desc: "世界史・日本史・政治・社会課題",
    mappedLabels: ["歴史・社会"],
    keywords: ["歴史", "社会", "政治", "地政学", "国際"],
    subcategories: [
      c("world-history", "世界史", ["世界史", "文明", "地政学"], [
        c("ancient", "古代", ["古代", "古代文明"]),
        c("medieval", "中世", ["中世"]),
        c("modern", "近代", ["近代", "帝国"]),
        c("contemporary", "現代", ["現代", "冷戦", "グローバル"]),
      ]),
      c("japanese-history", "日本史", ["日本史", "戦国", "幕末", "戦後"], [
        c("sengoku", "戦国・幕末", ["戦国", "幕末", "維新"]),
        c("postwar", "戦後", ["戦後", "昭和", "平成"]),
      ]),
      c("politics", "政治・制度", ["政治", "制度", "政策"], [
        c("policy", "政策", ["政策", "行政", "制度設計"]),
      ]),
      c("social-issue", "社会課題", ["社会問題", "格差", "少子化"], [
        c("social-problem", "社会問題", ["社会問題", "格差", "貧困"]),
      ]),
      c("global", "環境・国際", ["sdgs", "環境", "国際", "国際関係"], [
        c("sdgs", "SDGs", ["sdgs", "サステナビリティ", "気候変動"]),
        c("international", "国際関係", ["国際関係", "外交", "国連"]),
      ]),
    ],
  },
  {
    id: "science",
    label: "科学・教養",
    emoji: "🔬",
    desc: "物理・生物・数学・一般教養",
    mappedLabels: ["科学・教養", "科学・技術"],
    keywords: ["科学", "物理", "宇宙", "数学", "統計", "生物"],
    subcategories: [
      c("physics-space", "物理・宇宙", ["物理", "宇宙", "量子"], [
        c("quantum", "量子", ["量子", "素粒子"]),
        c("space", "宇宙", ["宇宙", "天文学", "銀河"]),
      ]),
      c("bio-med", "生物・医学", ["生物", "遺伝", "人体", "医学"], [
        c("evolution", "進化", ["進化", "生態"]),
        c("genetics", "遺伝", ["遺伝", "dna", "ゲノム"]),
        c("human-body", "人体", ["人体", "解剖", "脳"]),
      ]),
      c("math-stats", "数学・統計", ["数学", "統計", "確率", "線形代数"], [
        c("statistics", "統計", ["統計", "回帰", "仮説検定"]),
        c("probability", "確率", ["確率", "確率論"]),
        c("linear-algebra", "線形代数", ["線形代数", "行列", "ベクトル"]),
      ]),
      c("general-education", "一般教養", ["教養", "科学読み物", "サイエンス"], [
        c("math-literacy", "数学教養", ["数学教養", "数理思考"]),
        c("science-reading", "科学読み物", ["科学読み物", "科学エッセイ"]),
      ]),
    ],
  },
  {
    id: "manga",
    label: "漫画",
    emoji: "🎨",
    desc: "少年・少女・青年・一般漫画",
    mappedLabels: ["漫画"],
    keywords: ["漫画", "コミック", "マンガ"],
    subcategories: [
      c("shonen", "少年漫画", ["少年", "ジャンプ", "バトル", "スポーツ"], [
        c("battle", "バトル", ["バトル", "異能", "能力"]),
        c("adventure", "冒険", ["冒険", "旅"]),
        c("sports", "スポーツ", ["スポーツ", "野球", "サッカー"]),
      ]),
      c("shojo", "少女漫画", ["少女", "恋愛", "ラブコメ"], [
        c("romance", "恋愛", ["恋愛", "胸キュン"]),
        c("romcom", "ラブコメ", ["ラブコメ", "コメディ"]),
      ]),
      c("seinen", "青年漫画", ["青年", "社会派", "ドラマ", "グルメ"], [
        c("social", "社会派", ["社会派", "社会問題"]),
        c("drama", "ドラマ", ["ドラマ", "人間ドラマ"]),
        c("hobby-gourmet", "趣味・グルメ", ["グルメ", "趣味", "料理"]),
      ]),
      c("general", "一般漫画", ["日常", "ギャグ", "一般"], [
        c("daily", "日常", ["日常", "ほのぼの"]),
        c("gag", "ギャグ", ["ギャグ", "コメディ", "笑い"]),
      ]),
    ],
  },
];

export const L4_TAG_RULES: FacetTagRule[] = [
  { id: "intro", label: "入門", keywords: ["入門", "はじめて", "最初の1冊"] },
  { id: "beginner", label: "初級", keywords: ["初級", "初心者向け", "やさしい"] },
  { id: "intermediate", label: "中級", keywords: ["中級"] },
  { id: "advanced", label: "上級", keywords: ["上級", "実践上級"] },
  { id: "practical", label: "実務向け", keywords: ["実務", "現場", "業務で使う"] },
  { id: "exam", label: "試験対策", keywords: ["試験対策", "頻出", "過去問"] },
  { id: "diagram", label: "図解", keywords: ["図解"] },
  { id: "case-study", label: "事例中心", keywords: ["事例", "ケーススタディ"] },
  { id: "workbook", label: "ワーク付き", keywords: ["ワーク", "演習", "問題集"] },
  { id: "readable", label: "読みやすい", keywords: ["読みやすい", "わかりやすい"] },
  { id: "dense", label: "重厚", keywords: ["重厚", "大作", "本格長編"] },
  { id: "short-story", label: "短編集", keywords: ["短編集", "短編", "連作短編"] },
  { id: "long-form", label: "長編", keywords: ["長編"] },
  { id: "series", label: "シリーズ", keywords: ["シリーズ", "第1巻", "続編"] },
  { id: "adapted", label: "映像化", keywords: ["映像化", "映画化", "ドラマ化"] },
  { id: "analysis", label: "考察向け", keywords: ["考察", "解釈", "テーマ性"] },
];

export const L5_TAG_RULES: FacetTagRule[] = [
  // 小説・文芸（重点）
  { id: "locked-room", label: "密室", keywords: ["密室"], l1Allow: ["novel"] },
  { id: "unreliable-trick", label: "叙述トリック", keywords: ["叙述トリック"], l1Allow: ["novel"] },
  { id: "plot-twist", label: "どんでん返し", keywords: ["どんでん返し", "意外な結末"], l1Allow: ["novel"] },
  { id: "page-turner", label: "一気読み", keywords: ["一気読み", "止まらない"], l1Allow: ["novel"] },
  { id: "dark-aftertaste", label: "後味が悪い", keywords: ["後味が悪い"], l1Allow: ["novel"] },
  { id: "tearjerker", label: "泣ける", keywords: ["泣ける", "涙"], l1Allow: ["novel"] },
  { id: "moving", label: "感動", keywords: ["感動"], l1Allow: ["novel"] },
  { id: "female-lead", label: "女主人公", keywords: ["女性主人公", "女主人公"], l1Allow: ["novel"] },
  { id: "male-lead", label: "男主人公", keywords: ["男性主人公", "男主人公"], l1Allow: ["novel"] },
  { id: "ensemble", label: "群像劇", keywords: ["群像劇"], l1Allow: ["novel"] },
  { id: "school", label: "学園", keywords: ["学園", "学校"], l1Allow: ["novel", "manga"] },
  { id: "police", label: "警察", keywords: ["警察", "刑事"], l1Allow: ["novel"] },
  { id: "detective", label: "探偵", keywords: ["探偵", "ホームズ", "ポアロ"], l1Allow: ["novel"] },
  { id: "courtroom", label: "法廷", keywords: ["法廷"], l1Allow: ["novel"] },
  { id: "war", label: "戦争", keywords: ["戦争", "戦時"], l1Allow: ["novel", "history"] },
  { id: "isekai", label: "異世界", keywords: ["異世界", "転生"], l1Allow: ["novel", "manga"] },
  { id: "space", label: "宇宙", keywords: ["宇宙"], l1Allow: ["novel", "science"] },
  { id: "ai-theme", label: "AIテーマ", keywords: ["ai", "人工知能"], l1Allow: ["novel", "tech"] },
  { id: "adapted-original", label: "映像化原作", keywords: ["映像化", "映画化", "ドラマ化"], l1Allow: ["novel"] },
  { id: "linked-shorts", label: "短編連作", keywords: ["連作", "短編連作"], l1Allow: ["novel"] },

  // テクノロジー・IT（重点）
  { id: "python", label: "Python", keywords: ["python"], l1Allow: ["tech"] },
  { id: "javascript", label: "JavaScript", keywords: ["javascript"], l1Allow: ["tech"] },
  { id: "typescript", label: "TypeScript", keywords: ["typescript"], l1Allow: ["tech"] },
  { id: "react", label: "React", keywords: ["react"], l1Allow: ["tech"] },
  { id: "nextjs", label: "Next.js", keywords: ["next.js", "nextjs"], l1Allow: ["tech"] },
  { id: "aws", label: "AWS", keywords: ["aws"], l1Allow: ["tech"] },
  { id: "docker", label: "Docker", keywords: ["docker"], l1Allow: ["tech"] },
  { id: "kubernetes", label: "Kubernetes", keywords: ["kubernetes", "k8s"], l1Allow: ["tech"] },
  { id: "chatgpt", label: "ChatGPT", keywords: ["chatgpt"], l1Allow: ["tech"] },
  { id: "llm", label: "LLM", keywords: ["llm", "rag"], l1Allow: ["tech"] },
  { id: "sql", label: "SQL", keywords: ["sql", "postgres", "mysql"], l1Allow: ["tech"] },
  { id: "hands-on", label: "ハンズオン", keywords: ["ハンズオン", "手を動かす"], l1Allow: ["tech"] },
  { id: "sample-code", label: "サンプルコードあり", keywords: ["サンプルコード", "コード例"], l1Allow: ["tech"] },
  { id: "non-engineer", label: "非エンジニア向け", keywords: ["非エンジニア", "文系", "入門"], l1Allow: ["tech"] },
  { id: "for-practice", label: "現場向け", keywords: ["現場向け", "実務", "運用"], l1Allow: ["tech"] },
  { id: "implementation", label: "実装重視", keywords: ["実装", "実践", "コード中心"], l1Allow: ["tech"] },
  { id: "theory", label: "理論重視", keywords: ["理論", "数理", "理論重視"], l1Allow: ["tech"] },
  { id: "exam-freq", label: "試験頻出", keywords: ["頻出", "過去問", "試験"], l1Allow: ["tech"] },

  // 他ジャンル（最小限）
  { id: "manager-target", label: "管理職向け", keywords: ["管理職", "マネージャー"], l1Allow: ["business"] },
  { id: "career-change", label: "キャリア転職", keywords: ["転職", "キャリアチェンジ"], l1Allow: ["business"] },
  { id: "new-nisa", label: "新NISA", keywords: ["新nisa", "nisa"], l1Allow: ["investing"] },
  { id: "index-invest", label: "インデックス", keywords: ["インデックス", "etf"], l1Allow: ["investing"] },
  { id: "mental-recovery", label: "メンタル回復", keywords: ["回復", "ストレス", "不安"], l1Allow: ["psychology", "self-help"] },
  { id: "self-analysis", label: "自己分析", keywords: ["自己分析", "自己理解"], l1Allow: ["self-help"] },
];

export type AuthorPrior = {
  l1Id: string;
  l2Id?: string;
  l3Id?: string;
  boostL1?: number;
  boostL2?: number;
  boostL3?: number;
};

export const AUTHOR_PRIORS: Record<string, AuthorPrior> = {
  "アガサ・クリスティ": { l1Id: "novel", l2Id: "mystery", l3Id: "classic-mystery", boostL1: 4, boostL2: 5, boostL3: 5 },
  "東野圭吾": { l1Id: "novel", l2Id: "mystery", boostL1: 4, boostL2: 4 },
  "村上春樹": { l1Id: "novel", l2Id: "literary", boostL1: 4, boostL2: 4 },
  "j.r.r.トールキン": { l1Id: "novel", l2Id: "fantasy", boostL1: 4, boostL2: 5 },
  "jrrトールキン": { l1Id: "novel", l2Id: "fantasy", boostL1: 4, boostL2: 5 },
  "コナン・ドイル": { l1Id: "novel", l2Id: "mystery", l3Id: "classic-mystery", boostL1: 4, boostL2: 5, boostL3: 5 },
};

export const SERIES_PRIORS: Record<string, AuthorPrior> = {
  "シャーロック・ホームズ": { l1Id: "novel", l2Id: "mystery", l3Id: "classic-mystery", boostL1: 4, boostL2: 6, boostL3: 6 },
  "ポアロ": { l1Id: "novel", l2Id: "mystery", l3Id: "classic-mystery", boostL1: 3, boostL2: 5, boostL3: 5 },
  "ファウンデーション": { l1Id: "novel", l2Id: "sf", l3Id: "space-sf", boostL1: 3, boostL2: 5, boostL3: 4 },
};

/** @deprecated Use CATEGORY_TREE directly */
export const OTHER_CATEGORY: Category = { id: "other", label: "その他", keywords: [] };
/** @deprecated */
export const OTHER_L2 = OTHER_CATEGORY;

