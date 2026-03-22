/**
 * trendBooks.ts
 *
 * ニュース・社会テーマから本を探すツール用データ定義。
 * テーマ → レベル → 書籍 という構造で管理する。
 */

// ── 型定義 ────────────────────────────────────────────────────

export type BookLevel = "beginner" | "intermediate" | "advanced";

export type TrendTheme = {
  id: string;
  label: string;
  icon: string;
  description: string;
  /** Tailwind クラス（カード背景・ボーダー色） */
  cardClass: string;
  /** Tailwind クラス（アクセント・テキスト色） */
  accentClass: string;
};

export type TrendBook = {
  id: string;
  title: string;
  author: string;
  themeId: string;
  level: BookLevel;
  /** なぜ今読むか（1文。「今」の文脈を入れる） */
  reason: string;
  /** 内容の特徴（2〜3文） */
  description: string;
  /** タグ（追加分類用） */
  tags?: string[];
  /** 読者が理解できるようになること（モーダル詳細用） */
  whatYouLearn?: string;
  /** 想定読者（モーダル詳細用） */
  targetReader?: string;
  /** 関連テーマID（モーダル詳細用） */
  relatedThemeIds?: string[];
};

export type FeaturedCollection = {
  id: string;
  label: string;
  icon: string;
  themeId: string;
  level?: BookLevel;
  description: string;
};

// ── テーマ定義 ────────────────────────────────────────────────

export const TREND_THEMES: TrendTheme[] = [
  {
    id: "ai",
    label: "AI・テクノロジー",
    icon: "🤖",
    description: "生成AI・自動化・デジタル変革",
    cardClass:
      "bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200 hover:border-cyan-400",
    accentClass: "text-cyan-700",
  },
  {
    id: "economy",
    label: "経済・お金",
    icon: "💰",
    description: "物価・投資・格差・資本主義",
    cardClass:
      "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-400",
    accentClass: "text-green-700",
  },
  {
    id: "education",
    label: "教育・学び",
    icon: "📚",
    description: "学校改革・認知科学・自律学習",
    cardClass:
      "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400",
    accentClass: "text-blue-700",
  },
  {
    id: "war",
    label: "戦争・国際情勢",
    icon: "🌍",
    description: "紛争・地政学・外交・安全保障",
    cardClass:
      "bg-gradient-to-br from-slate-50 to-stone-50 border-slate-200 hover:border-slate-400",
    accentClass: "text-slate-700",
  },
  {
    id: "environment",
    label: "環境・気候変動",
    icon: "🌱",
    description: "温暖化・脱炭素・生物多様性",
    cardClass:
      "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:border-emerald-400",
    accentClass: "text-emerald-700",
  },
  {
    id: "politics",
    label: "政治・民主主義",
    icon: "🏛️",
    description: "選挙・権威主義・政策・統治",
    cardClass:
      "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:border-purple-400",
    accentClass: "text-purple-700",
  },
  {
    id: "health",
    label: "医療・健康",
    icon: "🏥",
    description: "感染症・メンタルヘルス・長寿科学",
    cardClass:
      "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 hover:border-rose-400",
    accentClass: "text-rose-700",
  },
  {
    id: "business",
    label: "ビジネス・経営",
    icon: "📊",
    description: "スタートアップ・イノベーション・組織",
    cardClass:
      "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 hover:border-amber-400",
    accentClass: "text-amber-700",
  },
  {
    id: "psychology",
    label: "心理・行動科学",
    icon: "🧠",
    description: "認知バイアス・対人関係・幸福論",
    cardClass:
      "bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-200 hover:border-violet-400",
    accentClass: "text-violet-700",
  },
  {
    id: "history",
    label: "歴史・文明",
    icon: "📜",
    description: "近代史・文明論・国家の盛衰",
    cardClass:
      "bg-gradient-to-br from-stone-50 to-amber-50 border-stone-200 hover:border-stone-400",
    accentClass: "text-stone-700",
  },
];

// ── レベル設定 ────────────────────────────────────────────────

export const LEVEL_CONFIG: Record<
  BookLevel,
  { label: string; shortLabel: string; badgeClass: string; description: string }
> = {
  beginner: {
    label: "初心者向け",
    shortLabel: "初心者",
    badgeClass: "bg-emerald-100 text-emerald-700",
    description: "前提知識なし。やさしい言葉で全体像が掴める",
  },
  intermediate: {
    label: "中級向け",
    shortLabel: "中級",
    badgeClass: "bg-amber-100 text-amber-700",
    description: "基礎知識があると読みやすい。体系的に理解できる",
  },
  advanced: {
    label: "深掘り向け",
    shortLabel: "深掘り",
    badgeClass: "bg-rose-100 text-rose-700",
    description: "専門寄り。テーマへの深い理解が得られる",
  },
};

// ── 書籍データ ────────────────────────────────────────────────

export const TREND_BOOKS: TrendBook[] = [
  // AI・テクノロジー ────────────────────────────────────────
  {
    id: "ai-2041",
    title: "AI 2041",
    author: "カイフー・リー / チェン・チウファン",
    themeId: "ai",
    level: "intermediate",
    reason:
      "生成AIが社会を塗り替えつつある今、20年後の現実を先取りして理解できる一冊。",
    description:
      "AI研究者と小説家のコラボによる近未来短編集。医療・教育・金融・戦争など各分野へのAI浸透を、フィクションと解説で体験的に学べる。",
    tags: ["AI", "近未来", "社会変革"],
    whatYouLearn:
      "AIが各産業に与えるリアルなインパクト。技術の進歩とそれに伴う倫理的問題を体感できる。",
    targetReader:
      "AIを漠然と不安・期待に思っている人。将来のキャリアをAI時代に備えて考えたい人。",
    relatedThemeIds: ["business", "economy"],
  },
  {
    id: "ai-matsuo",
    title: "人工知能は人間を超えるか",
    author: "松尾豊",
    themeId: "ai",
    level: "beginner",
    reason:
      "ChatGPTが日常に入り込んだ今、AIの「なぜ賢くなったのか」を基礎から理解するための入門書。",
    description:
      "日本のAI研究の第一人者・松尾豊によるディープラーニング入門。難しい数式は使わず、AIがなぜ驚異的な能力を持つのかを平易に解説。",
    tags: ["AI", "ディープラーニング", "入門"],
    whatYouLearn:
      "機械学習・ディープラーニングの基本概念。なぜ今のAIブームが起きているのかの背景理解。",
    targetReader:
      "AIを使っているが仕組みを知らない人。技術系でないがAIを学びたい人。",
    relatedThemeIds: ["education"],
  },
  {
    id: "ai-zero",
    title: "ゼロから作るDeep Learning",
    author: "斎藤康毅",
    themeId: "ai",
    level: "advanced",
    reason:
      "AI活用が競争優位となった今、技術の中身を実際に手を動かして理解したい人のための定番書。",
    description:
      "Pythonとライブラリ最小限でニューラルネットワークをスクラッチ実装する実践書。理論と実装が対になっており、AIの動作原理を本質から理解できる。",
    tags: ["AI", "プログラミング", "機械学習"],
    whatYouLearn:
      "ニューラルネットワークの内部動作。バックプロパゲーション・最適化アルゴリズムの実装レベルの理解。",
    targetReader:
      "プログラミング経験のある人。AIの仕組みを技術的に理解したいエンジニア・研究者志望の人。",
    relatedThemeIds: [],
  },
  {
    id: "ai-singularity",
    title: "シンギュラリティは近い",
    author: "レイ・カーツワイル",
    themeId: "ai",
    level: "advanced",
    reason:
      "AGI（汎用人工知能）論争が盛んな今、AIが人間を超える転換点について最も体系的に論じた古典的大作。",
    description:
      "テクノロジーの指数関数的成長を理論化したカーツワイルの代表作。加速する変化の未来像と人間の拡張について壮大なスケールで論じる。",
    tags: ["AI", "未来", "技術的特異点"],
    targetReader:
      "AI・テクノロジーの長期的影響を深く考えたい人。哲学・倫理的議論も含めて読みたい人。",
    relatedThemeIds: ["history"],
  },

  // 経済・お金 ───────────────────────────────────────────────
  {
    id: "money-riberyu",
    title: "本当の自由を手に入れるお金の大学",
    author: "両＠リベ大学長",
    themeId: "economy",
    level: "beginner",
    reason:
      "物価上昇・老後不安が続く今、個人の経済的自由を築くための基礎を体系的に学べる一冊。",
    description:
      "貯める・稼ぐ・増やす・守る・使うという5つの力を、図解でわかりやすく解説。投資・節税・保険の見直しまでカバーする実践的な入門書。",
    tags: ["個人金融", "投資", "節税"],
    whatYouLearn:
      "日本人が知らない資産形成の基本。NISA・iDeCoの活用法と生活コストの最適化。",
    targetReader:
      "お金の管理に自信がない20〜40代。老後資金への不安を解消したい人。",
    relatedThemeIds: ["business"],
  },
  {
    id: "economy-21c-capital",
    title: "21世紀の資本",
    author: "トマ・ピケティ",
    themeId: "economy",
    level: "advanced",
    reason:
      "富の集中と格差拡大が加速する今、「なぜ格差は広がるのか」を歴史データで証明した現代経済学の金字塔。",
    description:
      "300年分の富と所得データを分析し、資本収益率が経済成長率を上回り続ける限り格差は拡大するという「r>g」を論証。世界的ベストセラー。",
    tags: ["格差", "資本主義", "税制"],
    whatYouLearn:
      "格差拡大の構造的メカニズム。資本主義の本質的矛盾とその是正策の議論。",
    targetReader:
      "格差問題・資本主義に関心があり、経済学的な理解を深めたい人。",
    relatedThemeIds: ["politics", "history"],
  },
  {
    id: "economy-mankiw",
    title: "マンキュー経済学（ミクロ編）",
    author: "N・グレゴリー・マンキュー",
    themeId: "economy",
    level: "intermediate",
    reason:
      "インフレ・金利・為替が連日ニュースになる今、経済の基本原理を正確に理解したい人のための世界標準テキスト。",
    description:
      "世界中の大学で使われる経済学入門の定番。需要と供給・価格メカニズム・市場の効率性を丁寧に解説。難しい数学は最小限。",
    tags: ["ミクロ経済学", "市場", "教科書"],
    whatYouLearn:
      "市場がどのように機能するか。価格・競争・政府介入の経済学的解釈。",
    targetReader:
      "経済ニュースを正確に読みたいが、基礎から学び直したい人。",
    relatedThemeIds: ["politics"],
  },
  {
    id: "economy-factfulness",
    title: "FACTFULNESS",
    author: "ハンス・ロスリング",
    themeId: "economy",
    level: "beginner",
    reason:
      "フェイクニュース・バイアス情報が氾濫する今、世界の現実をデータで正しく理解するための思考法。",
    description:
      "「世界は思っているより良くなっている」をデータで証明。人間の思い込みを10のパターンに分類し、ファクトベースの思考法を教える世界的ベストセラー。",
    tags: ["データ思考", "バイアス", "グローバル"],
    whatYouLearn:
      "10の思い込みパターンとその克服法。統計・データの正しい読み方。",
    targetReader:
      "ニュースを見て世界に悲観的になりがちな人。データリテラシーを高めたい人。",
    relatedThemeIds: ["war", "environment", "health"],
  },

  // 教育・学び ──────────────────────────────────────────────
  {
    id: "edu-output",
    title: "学びを結果に変えるアウトプット大全",
    author: "樺沢紫苑",
    themeId: "education",
    level: "beginner",
    reason:
      "情報過多・学び疲れが深刻な今、「学んでも変わらない」を解消するアウトプット最優先の学習術。",
    description:
      "精神科医の著者が脳科学に基づいて解説する80のアウトプット技術。話す・書く・行動するという3分類で、知識を結果に変える具体的な方法を解説。",
    tags: ["学習法", "アウトプット", "脳科学"],
    whatYouLearn:
      "インプットとアウトプットの正しい比率。読書・勉強・仕事に即使えるアウトプット技術。",
    targetReader:
      "学習・読書をしているが結果が出ない人。仕事の生産性を上げたい人。",
    relatedThemeIds: ["psychology"],
  },
  {
    id: "edu-curiosity",
    title: "「学力」の経済学",
    author: "中室牧子",
    themeId: "education",
    level: "intermediate",
    reason:
      "教育格差・子育て不安が社会問題化する今、「何が子どもの学力・成功を決めるか」をデータで解明した必読書。",
    description:
      "教育経済学者が日本初の大規模実験・研究データを基に、褒め方・ゲーム・学習塾の効果を科学的に検証。教育神話と現実のギャップを示す。",
    tags: ["教育格差", "子育て", "科学的育児"],
    whatYouLearn:
      "何が子どもの学力に影響するかのエビデンス。非認知能力の重要性と伸ばし方。",
    targetReader:
      "子育て中の親。教育政策・学校改革に関心のある人。",
    relatedThemeIds: ["economy", "psychology"],
  },
  {
    id: "edu-deep-work",
    title: "DEEP WORK",
    author: "カル・ニューポート",
    themeId: "education",
    level: "intermediate",
    reason:
      "SNS・通知に集中力を奪われる今、深い集中が競争優位の源泉となる時代への適応法。",
    description:
      "「深い集中」をビジネス・学習の最重要スキルと定義し、それを習慣化する具体的戦略を提示。スマホ以前のプロの集中法を現代に復元する方法論。",
    tags: ["集中力", "生産性", "ワークスタイル"],
    whatYouLearn:
      "深い集中と浅い作業の区別。集中時間を増やし、知識労働の生産性を劇的に高める方法。",
    targetReader:
      "集中できずに困っている人。知識労働者として差別化したい人。",
    relatedThemeIds: ["psychology", "business"],
  },

  // 戦争・国際情勢 ──────────────────────────────────────────
  {
    id: "war-gun",
    title: "銃・病原菌・鉄",
    author: "ジャレド・ダイアモンド",
    themeId: "war",
    level: "intermediate",
    reason:
      "国際秩序の再編が進む今、なぜある国が力を持ち、他が従属するのかを1万3000年のスケールで理解できる。",
    description:
      "なぜ西洋文明が世界を征服できたのかを、地理・環境・微生物という意外な視点から解明するピュリッツァー賞受賞作。現代の格差・権力構造の根拠が見えてくる。",
    tags: ["地政学", "文明", "権力"],
    whatYouLearn:
      "文明の盛衰を決めた地理的・生物的要因。現代の国際秩序の歴史的ルーツ。",
    targetReader:
      "国際ニュースの背景を深く理解したい人。なぜ世界がこうなったのかを知りたい人。",
    relatedThemeIds: ["history", "environment"],
  },
  {
    id: "war-ikegami",
    title: "池上彰の世界を変えた10冊の本",
    author: "池上彰",
    themeId: "war",
    level: "beginner",
    reason:
      "複雑化する国際情勢を理解したい今、歴史的名著を通じて世界を動かす思想の地図を手に入れられる。",
    description:
      "聖書・資本論・アンネの日記・コーランなど世界を動かした10冊を池上彰が解説。それぞれの書籍が今の世界にどう影響しているかが分かる入門書。",
    tags: ["国際情勢", "思想", "入門"],
    whatYouLearn:
      "世界の宗教・思想・イデオロギーの基本。現代の紛争・対立の文化的・思想的背景。",
    targetReader:
      "国際ニュースが分かりにくいと感じる人。世界史・思想の入口として使いたい人。",
    relatedThemeIds: ["politics", "history"],
  },
  {
    id: "war-geopolitics",
    title: "地政学の逆襲",
    author: "ロバート・D・カプラン",
    themeId: "war",
    level: "advanced",
    reason:
      "ロシア・中国・中東の動向が世界を揺らす今、地形・地理が国家の戦略をどう規定するかを深く理解するために。",
    description:
      "冷戦後に「時代遅れ」とされた地政学が21世紀に復活した理由を説明。地形・資源・人口が国家戦略に与える影響をリアリズム的視点で分析。",
    tags: ["地政学", "国際政治", "安全保障"],
    whatYouLearn:
      "各国の戦略行動を地理から読み解く思考法。現代の紛争・連合・対立のパターン。",
    targetReader:
      "国際政治・安全保障を専門的に理解したい人。地政学的視点を仕事・研究に活かしたい人。",
    relatedThemeIds: ["politics"],
  },

  // 環境・気候変動 ──────────────────────────────────────────
  {
    id: "env-gates",
    title: "地球の未来のため僕が決断したこと",
    author: "ビル・ゲイツ",
    themeId: "environment",
    level: "beginner",
    reason:
      "気候変動対策が待ったなしの今、具体的にどのテクノロジーで脱炭素を実現するかを最も分かりやすく解説した一冊。",
    description:
      "温室効果ガスをゼロにする方法を産業別に分解し、現実的な技術的解決策を提示。感情論でなくエンジニアリング視点で気候変動を論じる。",
    tags: ["脱炭素", "クリーンエネルギー", "テクノロジー"],
    whatYouLearn:
      "CO2排出源の産業別内訳。再エネ・原子力・DAC・農業改革など実現可能な解決策の全体像。",
    targetReader:
      "気候変動に関心があるが何から理解すればいいか分からない人。環境ビジネスに興味がある人。",
    relatedThemeIds: ["ai", "economy"],
  },
  {
    id: "env-doughnut",
    title: "ドーナツ経済学が世界を救う",
    author: "ケイト・ラワース",
    themeId: "environment",
    level: "intermediate",
    reason:
      "経済成長と環境保全の両立が問われる今、「成長の限界」を超えた新しい経済モデルを提示する。",
    description:
      "「地球の限界」と「社会的基盤」の間に経済を収める「ドーナツ型」経済学を提唱。GDP成長至上主義への代替ビジョンを描く。",
    tags: ["経済学", "持続可能性", "社会変革"],
    whatYouLearn:
      "従来の経済学の7つの前提への批判と代替モデル。環境と福祉を両立する政策の方向性。",
    targetReader:
      "経済と環境の関係を考えたい人。持続可能な社会のビジョンを学びたい人。",
    relatedThemeIds: ["economy", "politics"],
  },
  {
    id: "env-plastic",
    title: "プラスチックフリー生活",
    author: "ベス・テリー",
    themeId: "environment",
    level: "beginner",
    reason:
      "海洋プラスチック問題が深刻化する今、個人レベルで今すぐできる実践的な行動が学べる。",
    description:
      "プラスチックをほぼ使わない生活を実践した著者の記録と提案。脱プラの具体的アイデアと、各製品の代替品リストが充実した行動の教科書。",
    tags: ["プラスチック", "ライフスタイル", "環境行動"],
    targetReader:
      "環境に関心があり具体的なアクションを起こしたい人。サステナブルな暮らしを始めたい人。",
    relatedThemeIds: [],
  },

  // 政治・民主主義 ──────────────────────────────────────────
  {
    id: "pol-democracy",
    title: "民主主義とは何か",
    author: "宇野重規",
    themeId: "politics",
    level: "beginner",
    reason:
      "世界各地で民主主義への信頼が揺らいでいる今、民主主義の原理と歴史を改めて問い直す入門書。",
    description:
      "古代ギリシャから現代まで、民主主義の歴史と思想を分かりやすく整理。「民主主義の危機」と言われる今、その意義と限界を冷静に考えるための基礎。",
    tags: ["民主主義", "政治思想", "入門"],
    whatYouLearn:
      "民主主義の歴史的変遷と主要概念。ポピュリズム・権威主義台頭の背景の理解。",
    targetReader:
      "選挙・政治ニュースへの理解を深めたい人。民主主義を当たり前と思わず疑いたい人。",
    relatedThemeIds: ["history", "war"],
  },
  {
    id: "pol-nations",
    title: "国家はなぜ衰退するのか",
    author: "ダロン・アセモグル / ジェイムズ・A・ロビンソン",
    themeId: "politics",
    level: "advanced",
    reason:
      "権威主義・独裁が台頭する中、政治・経済制度の違いが国家の繁栄と衰退を決めることをデータで示す。",
    description:
      "「なぜ豊かな国と貧しい国が存在するのか」を100を超える歴史的事例で検証。包括的制度vs収奪的制度という枠組みで国家の盛衰を解明。",
    tags: ["制度論", "政治経済学", "発展途上国"],
    whatYouLearn:
      "政治・経済制度が国の富を決めるメカニズム。民主主義と市場経済が機能する条件。",
    targetReader:
      "政治経済の専門的な理解を深めたい人。開発経済・国際政治に関心のある人。",
    relatedThemeIds: ["economy", "history"],
  },
  {
    id: "pol-handbook",
    title: "独裁者のためのハンドブック",
    author: "ブルース・ブエノ・デ・メスキータ",
    themeId: "politics",
    level: "intermediate",
    reason:
      "民主主義が後退し独裁体制が増える今、権力がどのように機能・維持されるかを政治学的に理解するために。",
    description:
      "「なぜ独裁者は長期間権力を維持できるのか」を少数の核心支持者（連合）という概念で解明。独裁と民主主義の両方に通底する権力の原理を描く。",
    tags: ["権威主義", "権力論", "政治学"],
    whatYouLearn:
      "権力維持の普遍的ロジック。民主主義でも機能する同じ権力原理の理解。",
    targetReader:
      "政治のリアルな権力構造を学びたい人。国際政治の「なぜ」を深く理解したい人。",
    relatedThemeIds: ["war", "history"],
  },

  // 医療・健康 ──────────────────────────────────────────────
  {
    id: "health-sleep",
    title: "睡眠こそ最強の解決策である",
    author: "マシュー・ウォーカー",
    themeId: "health",
    level: "beginner",
    reason:
      "睡眠不足が社会問題化する今、睡眠が健康・仕事・学習に与える影響を科学的に示した決定版。",
    description:
      "世界的睡眠研究者が20年間の研究を集大成。睡眠不足がガン・アルツハイマー・精神疾患のリスクを高める証拠と、質の高い睡眠を得る実践法を解説。",
    tags: ["睡眠", "健康", "パフォーマンス"],
    whatYouLearn:
      "睡眠と健康の科学的関係。7〜9時間睡眠を実現するための具体的な習慣改善法。",
    targetReader:
      "睡眠を削りがちな人。睡眠の重要性を科学的に理解したい人。",
    relatedThemeIds: ["psychology", "education"],
  },
  {
    id: "health-brain",
    title: "脳を鍛えるには運動しかない",
    author: "ジョン・J・レイティ",
    themeId: "health",
    level: "intermediate",
    reason:
      "メンタルヘルスの問題が増加する今、運動が脳・精神健康・学習能力に与える科学的効果を解明。",
    description:
      "運動が脳の神経新生・記憶・意欲・うつ改善に与える効果をハーバード医大の教授が解説。具体的な運動種類・強度・頻度の処方箋まで提示。",
    tags: ["運動", "脳科学", "メンタルヘルス"],
    whatYouLearn:
      "有酸素運動と脳機能の科学的関係。うつ・ADHD・認知症の予防に効く運動プログラム。",
    targetReader:
      "運動不足が気になる人。メンタルヘルス・認知機能を改善したい人。",
    relatedThemeIds: ["psychology"],
  },
  {
    id: "health-gut",
    title: "腸の力であなたは変わる",
    author: "エムラン・メイヤー",
    themeId: "health",
    level: "intermediate",
    reason:
      "腸内細菌・腸脳連関への関心が高まる今、腸が脳・免疫・メンタルをどう左右するかを最新研究で解説。",
    description:
      "「第二の脳」とも呼ばれる腸と脳の双方向コミュニケーションを解明。腸内フローラが気分・免疫・体重を制御するメカニズムと食事による改善法を解説。",
    tags: ["腸内細菌", "免疫", "食事"],
    whatYouLearn:
      "腸脳軸の科学的メカニズム。食事・生活習慣で腸内環境を整える具体的方法。",
    targetReader:
      "消化器系の不調・メンタル不調が気になる人。食事と体調の関係を科学的に知りたい人。",
    relatedThemeIds: ["psychology"],
  },

  // ビジネス・経営 ──────────────────────────────────────────
  {
    id: "biz-zero-to-one",
    title: "ゼロ・トゥ・ワン",
    author: "ピーター・ティール",
    themeId: "business",
    level: "intermediate",
    reason:
      "スタートアップが経済変革の主役になった今、「真に新しいものを作る」とはどういうことかを最深部で問い直す。",
    description:
      "PayPal・Palantir創業者ティールが語る独占とイノベーションの哲学。競争を避け独占を狙うという逆説的な起業論で、多くの起業家・投資家に影響を与えた。",
    tags: ["スタートアップ", "イノベーション", "独占"],
    whatYouLearn:
      "競争と独占の逆説的な経済学。技術スタートアップが生き残るための秘密の法則。",
    targetReader:
      "起業・新規事業を考えている人。イノベーションの本質を考えたい人。",
    relatedThemeIds: ["ai", "economy"],
  },
  {
    id: "biz-innovators-dilemma",
    title: "イノベーションのジレンマ",
    author: "クレイトン・クリステンセン",
    themeId: "business",
    level: "advanced",
    reason:
      "AIや新技術が既存産業を破壊する今、なぜ「良い企業」が革新的変化を見逃すのかを理論化した経営学の古典。",
    description:
      "優良企業が既存顧客への注力により破壊的イノベーションに乗り遅れるメカニズムを解明。ハードディスク・掘削機・鉄鋼業など多様な事例で検証。",
    tags: ["破壊的イノベーション", "経営戦略", "テクノロジー"],
    whatYouLearn:
      "破壊的技術と持続的技術の違い。成功企業がなぜ変化を見逃すかの組織論的メカニズム。",
    targetReader:
      "経営・戦略を学びたい人。AI時代に既存ビジネスをどう変革するか考えているマネージャー。",
    relatedThemeIds: ["ai", "economy"],
  },
  {
    id: "biz-team-geek",
    title: "Team Geek",
    author: "ブライアン・W・フィッツパトリック",
    themeId: "business",
    level: "beginner",
    reason:
      "リモートワーク・多様なチームが当たり前になった今、Googleエンジニアが語る「人と協力する」技術が効く。",
    description:
      "Google出身エンジニアが語るソフトウェア開発における人間関係・チームワークの技術。謙虚・尊重・信頼というHRTフレームワークを提唱。",
    tags: ["チームワーク", "組織", "コミュニケーション"],
    whatYouLearn:
      "エゴと防衛心を克服するチーム文化の作り方。毒になる人・環境の対処法。",
    targetReader:
      "チームで働くエンジニア・マネージャー。組織文化を改善したい人。",
    relatedThemeIds: ["psychology"],
  },

  // 心理・行動科学 ──────────────────────────────────────────
  {
    id: "psy-kirai",
    title: "嫌われる勇気",
    author: "岸見一郎 / 古賀史健",
    themeId: "psychology",
    level: "beginner",
    reason:
      "承認欲求・SNS疲れが蔓延する今、「他者の評価を気にしない生き方」の哲学的根拠を対話形式で学べる。",
    description:
      "アドラー心理学を哲人と青年の対話形式で解説。「すべての悩みは対人関係の悩みである」という命題から、自由に生きるための原理を探る。日本で300万部超のベストセラー。",
    tags: ["アドラー心理学", "対人関係", "自己啓発"],
    whatYouLearn:
      "原因論と目的論の違い。課題の分離という実践的な対人関係のフレームワーク。",
    targetReader:
      "承認欲求・人間関係の悩みを持つ人。自己啓発書でなく哲学として心理学を学びたい人。",
    relatedThemeIds: ["education", "health"],
  },
  {
    id: "psy-influence",
    title: "影響力の武器",
    author: "ロバート・B・チャルディーニ",
    themeId: "psychology",
    level: "intermediate",
    reason:
      "広告・SNS・詐欺が巧妙化する今、人間が説得される6つの心理的原則を知ることが自衛になる。",
    description:
      "返報性・一貫性・社会的証明・好意・権威・希少性という6原則で人間の同意行動を解明した社会心理学の古典。マーケター・交渉者・消費者全員に関連する内容。",
    tags: ["説得心理学", "マーケティング", "意思決定"],
    whatYouLearn:
      "6つの影響力の武器とその作用メカニズム。自分が操作されていることに気づく防御知識。",
    targetReader:
      "広告・セールスに対して自分の判断を守りたい人。マーケティング・営業を学びたい人。",
    relatedThemeIds: ["business", "education"],
  },
  {
    id: "psy-fast-slow",
    title: "ファスト＆スロー",
    author: "ダニエル・カーネマン",
    themeId: "psychology",
    level: "advanced",
    reason:
      "情報過多・AI意思決定が台頭する今、人間の認知バイアスの全体像を理解することが判断力の基礎になる。",
    description:
      "ノーベル賞経済学者カーネマンが40年の研究を集大成。システム1（直感的・高速）とシステム2（熟考的・低速）という思考の二重過程理論でバイアスを体系化。",
    tags: ["認知バイアス", "行動経済学", "意思決定"],
    whatYouLearn:
      "100以上の認知バイアスの体系的理解。直感と論理を使い分けるメタ認知能力の強化。",
    targetReader:
      "意思決定の質を上げたい人。行動経済学・心理学を本格的に学びたい人。",
    relatedThemeIds: ["economy", "business"],
  },
  {
    id: "psy-failure",
    title: "失敗の科学",
    author: "マシュー・サイド",
    themeId: "psychology",
    level: "intermediate",
    reason:
      "組織の失敗・事故が後を絶たない今、なぜ人は失敗から学べないのか・どうすれば学べるのかを科学する。",
    description:
      "医療・航空・スポーツ・ビジネスの失敗事例を通じて、失敗を隠蔽する組織文化と失敗から学ぶ成長型マインドセットの違いを解説。",
    tags: ["失敗学", "組織文化", "成長"],
    whatYouLearn:
      "固定型マインドセットと成長型マインドセットの違い。心理的安全性が失敗学習に必要な理由。",
    targetReader:
      "組織改善・マネジメントに関わる人。失敗を恐れて挑戦できない人。",
    relatedThemeIds: ["business", "education"],
  },

  // 歴史・文明 ──────────────────────────────────────────────
  {
    id: "hist-sapiens",
    title: "サピエンス全史",
    author: "ユヴァル・ノア・ハラリ",
    themeId: "history",
    level: "intermediate",
    reason:
      "AIと人間の関係が問われる今、ホモ・サピエンスがなぜ地球を支配できたかを知ることで現在の座標が見えてくる。",
    description:
      "7万年前の認知革命から現代の科学革命まで、人類史を俯瞰する世界的ベストセラー。虚構を共有する能力こそが人類の最大の武器だったという主張が衝撃的。",
    tags: ["人類史", "文明論", "認知革命"],
    whatYouLearn:
      "ホモ・サピエンスが他の動物・人種を凌駕した理由。お金・国家・宗教という虚構が文明を作った仕組み。",
    targetReader:
      "人類史・文明論を大きな視点で学びたい人。AIと人間の未来を歴史的文脈で考えたい人。",
    relatedThemeIds: ["ai", "politics"],
  },
  {
    id: "hist-showa",
    title: "昭和史 1926-1945",
    author: "半藤一利",
    themeId: "history",
    level: "beginner",
    reason:
      "日本の安全保障論議が活発化する今、80年前に日本がなぜ無謀な戦争に突き進んだかの構造を理解するために。",
    description:
      "昭和史研究の第一人者・半藤一利が語りかける口調で昭和の歴史を解説。政治・軍部・メディアが絡み合う意思決定の失敗を追体験できる読みやすい入門書。",
    tags: ["近現代史", "太平洋戦争", "日本史"],
    whatYouLearn:
      "昭和日本が戦争に突き進んだ構造的要因。集団思考・無責任体制という現代にも通じる問題。",
    targetReader:
      "日本の近代史を学び直したい人。今の日本社会の問題を歴史的に理解したい人。",
    relatedThemeIds: ["war", "politics"],
  },
  {
    id: "hist-clash",
    title: "文明の衝突",
    author: "サミュエル・P・ハンティントン",
    themeId: "history",
    level: "advanced",
    reason:
      "宗教・文明の違いによる対立が激化する今、冷戦後の世界秩序を「文明の衝突」で予見したハンティントンの分析が改めて問われている。",
    description:
      "冷戦後の世界を8つの文明圏（西洋・中華・イスラム・ヒンドゥーなど）の衝突として分析。予言的な部分と批判される部分を含む現代国際関係論の必読書。",
    tags: ["国際関係論", "文明論", "宗教"],
    whatYouLearn:
      "文明を単位とした国際政治の見方。イスラム・中国・西洋の対立構図の歴史的背景。",
    targetReader:
      "国際政治・文明論を専門的に学びたい人。宗教・文化の対立を歴史的文脈で理解したい人。",
    relatedThemeIds: ["war", "politics"],
  },
];

// ── 特集コレクション ──────────────────────────────────────

export const FEATURED_COLLECTIONS: FeaturedCollection[] = [
  {
    id: "ai-beginner",
    label: "AI入門",
    icon: "🤖",
    themeId: "ai",
    level: "beginner",
    description: "技術知識ゼロからAIの本質を理解する",
  },
  {
    id: "economy-basics",
    label: "経済の基礎を学ぶ",
    icon: "💰",
    themeId: "economy",
    level: "beginner",
    description: "物価・格差・個人の資産形成を整理する",
  },
  {
    id: "psychology-life",
    label: "心理を使いこなす",
    icon: "🧠",
    themeId: "psychology",
    description: "人間関係・意思決定・自己理解を深める",
  },
  {
    id: "history-now",
    label: "歴史から今を読む",
    icon: "📜",
    themeId: "history",
    description: "現代の問題を人類史のスケールで理解する",
  },
  {
    id: "env-action",
    label: "環境問題を知る・動く",
    icon: "🌱",
    themeId: "environment",
    description: "気候変動の理解から個人の行動まで",
  },
  {
    id: "pol-democracy",
    label: "民主主義の今",
    icon: "🏛️",
    themeId: "politics",
    description: "揺らぐ民主主義を基礎から問い直す",
  },
];
