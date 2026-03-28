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
  /** /works/[workId] に対応するID（存在する場合のみ） */
  workId?: string;
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

  // ── 追加書籍（AI・テクノロジー）──────────────────────────
  {
    id: "ai-vs-kids",
    title: "AI vs. 教科書が読めない子どもたち",
    author: "新井紀子",
    themeId: "ai",
    level: "intermediate",
    reason:
      "AIが急速に社会へ浸透する今、AIの「できること・できないこと」を正確に把握しておくことが人間の競争力の鍵となる。",
    description:
      "数学者・新井紀子が率いるプロジェクト「ロボットは東大に入れるか」の知見を基に、AI（東ロボくん）の限界と日本の教育問題を明快に論じた問題作。AIに代替されない読解力の重要性を説く。",
    tags: ["AI", "教育", "読解力"],
    whatYouLearn:
      "現在のAIが苦手とする分野（意味理解・文脈把握）。人間がAI時代に磨くべき認知能力。",
    targetReader:
      "AIの実力を正確に知りたい人。子どもの教育や自身のスキルアップを考えている人。",
    relatedThemeIds: ["education"],
  },
  {
    id: "ai-second-machine-age",
    title: "第二の機械時代",
    author: "エリック・ブリニョルフソン / アンドリュー・マカフィー",
    themeId: "ai",
    level: "intermediate",
    reason:
      "AIによる自動化が雇用・格差・生産性を同時に変える今、デジタル技術の恩恵を最大化する方策を経済学者の視点で学べる。",
    description:
      "MITスローン経営大学院の研究者2人が、デジタル技術が引き起こす生産性の爆発と雇用格差の拡大を分析。勝者と敗者を生む「大分岐」への処方箋を提示する。",
    tags: ["AI", "自動化", "雇用", "経済"],
    whatYouLearn:
      "デジタル技術が生産性・格差・労働市場に与えるメカニズム。技術の恩恵を社会全体に広げるための政策の考え方。",
    targetReader:
      "AI・テクノロジーと経済の関係を学びたい人。政策・ビジネス戦略にAI変化を組み込みたい人。",
    relatedThemeIds: ["economy", "business"],
  },
  {
    id: "ai-after-digital",
    title: "アフターデジタル",
    author: "藤井保文 / 尾原和啓",
    themeId: "ai",
    level: "beginner",
    reason:
      "DXが叫ばれる今、中国・東南アジアで先行するデジタル社会の姿から日本企業・社会が学ぶべきことが具体的に見える。",
    description:
      "スマホ・AIが日常に溶け込んだ「アフターデジタル」社会（中国が先行）の実像を解説し、日本式DXとの本質的な違いを示す。デジタルトランスフォーメーションの教科書的一冊。",
    tags: ["DX", "デジタル変革", "ビジネスモデル"],
    whatYouLearn:
      "OMO（Online Merges with Offline）の概念と具体事例。日本企業が取り組むべきデジタル戦略の方向性。",
    targetReader:
      "DXを推進したいビジネスパーソン。デジタル社会の変化を肌感覚で理解したい人。",
    relatedThemeIds: ["business"],
  },
  {
    id: "ai-life-shift",
    title: "LIFE SHIFT（ライフ・シフト）",
    author: "リンダ・グラットン / アンドリュー・スコット",
    themeId: "ai",
    level: "beginner",
    reason:
      "AIと長寿化が同時進行する今、100年時代の人生設計を根本から見直す必要性をデータで示した現代の必読書。",
    description:
      "寿命100年時代にAI・テクノロジーが仕事・生活をどう変えるかを分析し、マルチステージの人生設計を提唱。「教育→仕事→引退」という3ステージ人生の終焉を説く。",
    tags: ["未来", "キャリア", "長寿化", "働き方"],
    whatYouLearn:
      "100年ライフにおける無形資産（スキル・人脈・健康）の重要性。AI時代に求められる学び続ける姿勢。",
    targetReader:
      "キャリアの先行きに不安を感じる人。AIと長寿化を踏まえた将来設計を立てたい人。",
    relatedThemeIds: ["economy", "education"],
  },
  {
    id: "ai-masters-algorithm",
    title: "マスター・アルゴリズム",
    author: "ペドロ・ドミンゴス",
    themeId: "ai",
    level: "advanced",
    reason:
      "機械学習が産業・社会インフラを支える今、AIの根幹にある「学習アルゴリズム」の体系を深く理解したい人のための一冊。",
    description:
      "機械学習の5大学派（記号主義・接続主義・進化主義・ベイズ主義・類推主義）を解説し、それらを統合する究極のアルゴリズムを探る知的冒険。AIの原理を技術寄りに学べる良書。",
    tags: ["AI", "機械学習", "アルゴリズム"],
    whatYouLearn:
      "機械学習の主要パラダイムの比較。深層学習の位置づけとその限界・可能性。",
    targetReader:
      "AIの技術的な体系を俯瞰したいエンジニア・研究者。AIの理論的背景を深掘りしたい人。",
    relatedThemeIds: [],
  },
  {
    id: "ai-chatgpt-impact",
    title: "生成AIで世界はこう変わる",
    author: "今井翔太",
    themeId: "ai",
    level: "beginner",
    reason:
      "ChatGPT登場から日常が急変した今、生成AIが産業・社会・仕事に与える変化を網羅的に把握できる解説書。",
    description:
      "東京大学松尾研究室出身のAI研究者が、大規模言語モデルの仕組みから産業変革・社会課題まで包括的に解説。技術の背景から実務への応用まで1冊で理解できる。",
    tags: ["生成AI", "ChatGPT", "社会変革"],
    whatYouLearn:
      "大規模言語モデルの仕組みと限界。生成AIが変える主要産業と新たなリスク。",
    targetReader:
      "生成AIの全体像を把握したい人。AIビジネスを考えるビジネスパーソン。",
    relatedThemeIds: ["business", "education"],
  },

  // ── 追加書籍（経済・お金）────────────────────────────────
  {
    id: "eco-loser-game",
    title: "敗者のゲーム",
    author: "チャールズ・エリス",
    themeId: "economy",
    level: "beginner",
    reason:
      "新NISAが普及し個人投資が身近になった今、「市場に勝とうとすること自体が間違い」という逆説的な投資哲学の原典。",
    description:
      "アマチュア投資家が株式市場に勝てない理由を「敗者のゲーム」という概念で解明し、インデックス投資を推奨する投資論の古典。数十年読み継がれてきた不変の原理を学べる。",
    tags: ["投資", "インデックス投資", "資産形成"],
    whatYouLearn:
      "アクティブ運用vsパッシブ運用の合理的な判断基準。長期投資で勝つための「何もしない」戦略。",
    targetReader:
      "投資を始めたいが何を信じればいいか分からない人。NISA活用で長期的な資産形成を考えている人。",
    relatedThemeIds: ["business"],
  },
  {
    id: "eco-rich-dad",
    title: "金持ち父さん貧乏父さん",
    author: "ロバート・T・キヨサキ",
    themeId: "economy",
    level: "beginner",
    reason:
      "資産形成への関心が高まる今、「学校では教えてくれないお金の教育」として世界3000万部の普及を誇る金融リテラシーの入門書。",
    description:
      "「資産」と「負債」を明確に定義し、金持ちが資産を増やし続ける仕組みを対比的なストーリーで解説。財務諸表の概念を個人の家計に応用する発想が画期的。",
    tags: ["資産形成", "財務リテラシー", "投資"],
    whatYouLearn:
      "資産・負債・収益の基本概念。お金持ちが持つ「お金に働かせる」思考回路。",
    targetReader:
      "お金の基礎から学びたい人。労働収入だけでなく資産所得を作ることを考えたい人。",
    relatedThemeIds: ["business"],
  },
  {
    id: "eco-kimi-okane",
    title: "きみのお金は誰のため",
    author: "田内学",
    themeId: "economy",
    level: "beginner",
    reason:
      "個人の「節約・投資」と社会全体の「お金の流れ」が乖離して語られがちな今、「お金とは何か」を根本から問い直す痛快な一冊。",
    description:
      "ゴールドマン・サックス出身の著者が、お金の本質と社会的役割を少年と謎の老人との対話形式で語る。「お金で世の中は変えられない」という逆説的命題が深い思考を促す。",
    tags: ["お金の本質", "マクロ経済", "社会論"],
    whatYouLearn:
      "個人の節約・投資と社会全体の経済の関係。お金が持つ本質的な機能と限界。",
    targetReader:
      "NISA・投資をしているが「なぜお金を増やすのか」を問い直したい人。経済の社会的意味を考えたい人。",
    relatedThemeIds: ["politics", "education"],
  },
  {
    id: "eco-random-walk",
    title: "ウォール街のランダム・ウォーカー",
    author: "バートン・マルキール",
    themeId: "economy",
    level: "intermediate",
    reason:
      "「株価予測は不可能」という事実が半世紀の研究で実証された今、それでも市場への参加を正当化する効率的市場仮説の標準的解説書。",
    description:
      "株価はランダムウォーク（予測不能な動き）であるという理論を検証し、インデックス投資の優位性を解説。技術的分析・ファンダメンタル分析への批判も含む定番の投資教科書。",
    tags: ["投資理論", "効率的市場", "ポートフォリオ"],
    whatYouLearn:
      "効率的市場仮説の概要と証拠。長期的にリターンを最大化するポートフォリオ構築の原則。",
    targetReader:
      "投資の理論的背景を学びたい人。なぜプロも市場に勝てないのかを理解したい人。",
    relatedThemeIds: ["business"],
  },
  {
    id: "eco-zero-capital",
    title: "ゼロからの「資本論」",
    author: "斎藤幸平",
    themeId: "economy",
    level: "intermediate",
    reason:
      "格差・気候危機・労働搾取が同時進行する今、マルクスの「資本論」を現代的問題への処方箋として読み直す刺激的な案内書。",
    description:
      "若き経済思想家・斎藤幸平がマルクスの資本論を丁寧に読み解き、21世紀の格差・環境問題・デジタル資本主義に接続させる。「人新世の資本論」の著者による入門書。",
    tags: ["マルクス", "資本主義批判", "格差"],
    whatYouLearn:
      "資本論の核心概念（剰余価値・商品・疎外）の現代的意味。脱成長・コモンズという代替的な経済ビジョン。",
    targetReader:
      "格差・環境問題と経済の関係を理論的に理解したい人。資本主義への批判的視点を持ちたい人。",
    relatedThemeIds: ["environment", "politics"],
  },

  // ── 追加書籍（教育・学び）────────────────────────────────
  {
    id: "edu-mindset",
    title: "マインドセット：「やればできる！」の研究",
    author: "キャロル・S・ドゥエック",
    themeId: "education",
    level: "intermediate",
    reason:
      "AI時代に継続的な学習が求められる今、「能力は伸ばせる」という成長型マインドセットが学びを根本から変えることを心理学的に示す。",
    description:
      "スタンフォード大学の心理学者が30年の研究を基に、「固定型マインドセット」vs「成長型マインドセット」を解明。学校・スポーツ・職場での応用例が豊富で教育・子育てに必読。",
    tags: ["成長型思考", "モチベーション", "教育心理"],
    whatYouLearn:
      "固定型・成長型マインドセットの違いとその脳科学的根拠。子育て・学習・組織に成長型思考を育む具体的方法。",
    targetReader:
      "自分や子どもの可能性を信じてあげたい人。努力の意味を問い直したいすべての人。",
    relatedThemeIds: ["psychology", "business"],
  },
  {
    id: "edu-dokugaku-taizen",
    title: "独学大全",
    author: "読書猿",
    themeId: "education",
    level: "intermediate",
    reason:
      "スキルの陳腐化が加速する時代に、学校・会社以外で自律的に学び続けるための最強のリファレンスブック。",
    description:
      "人気ブログ「読書猿」が55の独学技術を集大成した800ページ超の大著。目標設定・情報収集・読書法・記憶術・ノート術まで、自学自習に必要な全技術を網羅する。",
    tags: ["独学", "学習法", "読書術"],
    whatYouLearn:
      "自分の学習目標を正確に設定する方法。情報の収集・整理・定着のための55の具体的技術。",
    targetReader:
      "社会人として自律的に学び続けたい人。学び方そのものを根本から見直したい人。",
    relatedThemeIds: ["psychology"],
  },
  {
    id: "edu-thinking-method",
    title: "思考の整理学",
    author: "外山滋比古",
    themeId: "education",
    level: "beginner",
    reason:
      "情報過多の現代に、知識を「飛行機型思考」で昇華させる知的生産術の古典が今もなお有効な理由がある。",
    description:
      "受け身の「グライダー型」でなく自力で離陸する「飛行機型」の思考者を目指すための考え方を示したロングセラー。情報・記憶・アイデア創出について軽妙に語る知的エッセイ。",
    tags: ["思考法", "知的生産", "創造性"],
    whatYouLearn:
      "記憶に頼らず思考力を鍛えるアプローチ。アイデアを醸成させる「忘れる」「寝かせる」の技術。",
    targetReader:
      "自分の頭で考える力を鍛えたい学生・社会人。知識を活かせないと感じている人。",
    relatedThemeIds: ["psychology"],
  },
  {
    id: "edu-peak",
    title: "超一流になるのはなぜか",
    author: "アンダース・エリクソン / ロバート・プール",
    themeId: "education",
    level: "advanced",
    reason:
      "才能ではなく「正しい練習」が突出した能力を生むという科学的事実が、AI時代に人間が伸ばすべきスキルへの考え方を変える。",
    description:
      "「1万時間の法則」の元研究者エリクソンが「完璧な練習（意図的練習）」の科学を解説。チェス・音楽・スポーツ・医療の事例から、いかなる分野でも能力を伸ばせる普遍的な原則を抽出。",
    tags: ["意図的練習", "技能習得", "才能論"],
    whatYouLearn:
      "「天才」は生まれつきでなく作られるという証拠。どんな分野でも通用する「意図的練習」のステップ。",
    targetReader:
      "スキルの伸び悩みを感じている人。才能に関する思い込みを科学で解きたい人。",
    relatedThemeIds: ["psychology", "business"],
  },
  {
    id: "edu-reading-nonfiction",
    title: "知的複眼思考法",
    author: "苅谷剛彦",
    themeId: "education",
    level: "intermediate",
    reason:
      "フェイクニュース・偏向情報が氾濫する今、自分の頭で批判的に考え、問いを立てる力が学びの最重要スキルとなっている。",
    description:
      "東京大学教授（現オックスフォード大学）が、物事を複数の角度から捉える「複眼思考」を育む方法を解説。テキストの読み方・論理の組み立て方・問いの立て方を具体的に指導する。",
    tags: ["批判的思考", "論理", "学術的読書"],
    whatYouLearn:
      "一面的な思考を超えて問いを深める複眼思考のトレーニング法。テキストの行間を読み、問題を発見する方法。",
    targetReader:
      "大学生・社会人で批判的思考力を鍛えたい人。ニュースや情報を自分の頭で分析したい人。",
    relatedThemeIds: ["psychology"],
  },
  {
    id: "edu-chatgpt-learning",
    title: "ChatGPT学習法",
    author: "柴山政行",
    themeId: "education",
    level: "beginner",
    reason:
      "生成AIが学習パートナーになり得る今、AIを使って効果的に学ぶ具体的な方法を整理した実践的ガイド。",
    description:
      "ChatGPTを個人家庭教師・学習コーチとして活用する方法を解説。資格試験・語学・プログラミング・ビジネス知識の習得にAIを組み込む具体的なプロンプト例も豊富。",
    tags: ["生成AI", "学習ツール", "ChatGPT"],
    whatYouLearn:
      "AIを使った効率的なインプット・アウトプット方法。分野別のAI活用学習のテンプレート。",
    targetReader:
      "ChatGPTを学習に活かしたい人。AI時代の新しい学び方を試したい人。",
    relatedThemeIds: ["ai"],
  },

  // ── 追加書籍（戦争・国際情勢）──────────────────────────
  {
    id: "war-ukraine",
    title: "ウクライナ戦争",
    author: "小泉悠",
    themeId: "war",
    level: "beginner",
    reason:
      "ロシアのウクライナ侵攻が世界秩序を書き換えつつある今、現地の軍事状況と歴史的背景を最もわかりやすく解説した専門家の一冊。",
    description:
      "ロシア軍事研究の第一人者・小泉悠が、戦争の経緯・双方の軍事戦略・国際社会の反応を平易に解説。核兵器・ドローン・情報戦など現代戦争の新たな側面も丁寧に描く。",
    tags: ["ロシア", "ウクライナ", "現代戦争", "安全保障"],
    whatYouLearn:
      "ウクライナ戦争の歴史的背景と軍事的経緯。現代の戦争が持つ「ハイブリッド戦」の性質。",
    targetReader:
      "ウクライナ戦争を基礎から理解したい人。現代の国際安全保障を学びたい人。",
    relatedThemeIds: ["politics", "history"],
  },
  {
    id: "war-third-world-war",
    title: "第三次世界大戦はもう始まっている",
    author: "エマニュエル・トッド",
    themeId: "war",
    level: "beginner",
    reason:
      "ウクライナ戦争が局所的な紛争を超えて世界的な対立構図を生んでいる今、フランスの知性が地政学的本質を鋭く分析する。",
    description:
      "人口学・家族構造研究で知られるエマニュエル・トッドが、ウクライナ戦争を「NATO拡大とロシアの存亡をかけた戦い」として分析。西洋メディアとは異なる視座を提供する問題作。",
    tags: ["地政学", "ロシア", "NATO", "世界秩序"],
    whatYouLearn:
      "ウクライナ戦争の地政学的解釈。西欧中心的な報道とは異なる多面的な国際情勢の見方。",
    targetReader:
      "国際情勢をさまざまな視点から捉えたい人。欧米メディアへの批判的視点を持ちたい人。",
    relatedThemeIds: ["politics", "history"],
  },
  {
    id: "war-destined-war",
    title: "米中戦争前夜",
    author: "グレアム・アリソン",
    themeId: "war",
    level: "advanced",
    reason:
      "米中対立が台湾・貿易・技術覇権にわたって激化する今、「修正主義大国の台頭は必ず戦争を招くのか」をトゥキディデスの罠で論証する。",
    description:
      "ハーバード大学ケネディスクール教授が、歴史上の覇権交代16ケースを分析し米中が戦争に至るリスクを論じた戦略論の必読書。回避のための条件も提示する。",
    tags: ["米中関係", "覇権", "地政学", "安全保障"],
    whatYouLearn:
      "トゥキディデスの罠の歴史的事例と米中への適用。台湾問題・技術覇権争いの戦略的構図。",
    targetReader:
      "米中関係・東アジア安全保障を深く理解したい人。国際政治の理論を学びたい人。",
    relatedThemeIds: ["politics", "history"],
  },
  {
    id: "war-geopolitics-primer",
    title: "地政学入門",
    author: "曽村保信",
    themeId: "war",
    level: "intermediate",
    reason:
      "大国間競争が地理的制約によって動かされていることを理解するための、日本語で書かれた地政学の基礎入門書。",
    description:
      "マッキンダー・マハン・スパイクマンなど地政学の主要理論を整理し、冷戦から現代の国際政治を地理的視点で読み解く。新聞・ニュースの地政学的読み方が身につく。",
    tags: ["地政学", "国際政治", "歴史"],
    whatYouLearn:
      "地政学の主要理論（ランドパワー・シーパワー・リムランド）。地理的要因から国家行動を読み解く思考法。",
    targetReader:
      "地政学を基礎から学びたい人。国際ニュースを地理の視点で分析したい人。",
    relatedThemeIds: ["history", "politics"],
  },
  {
    id: "war-nuclear",
    title: "核兵器について、もっと知ろう",
    author: "広島市立大学広島平和研究所",
    themeId: "war",
    level: "beginner",
    reason:
      "核抑止論が再び現実政治の中心に返り咲いた今、核兵器の現状・廃絶への取り組み・核抑止の論理を市民として理解することが求められている。",
    description:
      "広島の平和研究機関が編んだ核兵器の基礎知識。核の歴史・現在の世界の核戦力・核廃絶条約の現状・核抑止理論の論理と矛盾をバランスよく解説する入門書。",
    tags: ["核兵器", "平和", "安全保障", "軍縮"],
    whatYouLearn:
      "世界の核戦力の現状と核不拡散条約の仕組み。核抑止論の論理と人道的問題の対立。",
    targetReader:
      "核問題を基礎から学びたい人。平和・安全保障について考えたい学生・市民。",
    relatedThemeIds: ["politics"],
  },
  {
    id: "war-never-again",
    title: "戦争の文化",
    author: "ジョン・ダワー",
    themeId: "war",
    level: "advanced",
    reason:
      "戦争の記憶が薄れ再び軍事力への回帰が語られる今、なぜ人間社会は繰り返し戦争を文化として組み込んできたのかを歴史的に問い直す。",
    description:
      "ピュリッツァー賞受賞歴史家ジョン・ダワーが、人間社会における戦争の文化的・心理的構造を日米の事例を中心に分析。「敵」のイメージ形成・プロパガンダ・戦争の美化を鋭く解剖。",
    tags: ["戦争論", "歴史", "プロパガンダ"],
    whatYouLearn:
      "戦争が社会・文化にどう刻み込まれるかのメカニズム。現代の軍事化・ナショナリズムの歴史的文脈。",
    targetReader:
      "戦争の社会・文化的側面を深く理解したい人。歴史から現代の安全保障問題を考えたい人。",
    relatedThemeIds: ["history", "politics"],
  },

  // ── 追加書籍（環境・気候変動）──────────────────────────
  {
    id: "env-silent-spring",
    title: "沈黙の春",
    author: "レイチェル・カーソン",
    themeId: "environment",
    level: "intermediate",
    reason:
      "生物多様性の喪失と農薬・化学物質汚染が再び問われる今、環境運動を生んだ60年前の警告が今も色褪せない古典的名著。",
    description:
      "農薬DDTが生態系・野生生物・人間に与える深刻な影響を科学的に告発し、近代環境運動の端緒となったノンフィクション。自然と人間の関係を根本から問い直す必読の一冊。",
    tags: ["環境汚染", "生態系", "環境古典"],
    whatYouLearn:
      "農薬・化学物質が食物連鎖を通じて生態系全体へ波及するメカニズム。科学的知見と市民行動が政策を変えた歴史。",
    targetReader:
      "環境問題の歴史的原点を学びたい人。農業・食・生態系への関心がある人。",
    relatedThemeIds: ["health", "politics"],
  },
  {
    id: "env-planet-limits",
    title: "成長の限界",
    author: "ドネラ・H・メドウズ ほか",
    themeId: "environment",
    level: "advanced",
    reason:
      "地球の資源・環境容量への圧力が増す今、1972年にコンピューターモデルで示した「このままでは100年以内に文明は崩壊する」という予測の今日的意義が問われている。",
    description:
      "ローマクラブが依頼したMITチームによる報告書を一般向けに解説。人口・工業・食料・資源・汚染の指数関数的成長とシステムダイナミクスを用いた未来シナリオ分析の古典。",
    tags: ["持続可能性", "システム思考", "資源"],
    whatYouLearn:
      "地球システムの限界とオーバーシュートの概念。複雑なシステムを動態的に理解するための思考枠組み。",
    targetReader:
      "環境問題を構造的・システム的に理解したい人。持続可能な社会の条件を深く考えたい人。",
    relatedThemeIds: ["economy", "politics"],
  },
  {
    id: "env-climate-crisis",
    title: "気候変動と文明の盛衰",
    author: "ブライアン・フェイガン",
    themeId: "environment",
    level: "intermediate",
    reason:
      "気候変動が現代文明に及ぼす影響が現実味を帯びる今、過去の文明が気候変動によって興亡した歴史を知ることで現在の危機を相対化できる。",
    description:
      "考古学・気候科学の知見を融合し、古代ローマの崩壊・中世の寒冷化・マヤ文明の衰退など、気候変動が文明に与えた影響を豊富な事例で解説。現代への警告として読む歴史書。",
    tags: ["気候変動", "文明", "歴史"],
    whatYouLearn:
      "過去3000年の気候変動と文明の盛衰の関係。現代の温暖化がもたらしうる社会的リスクの歴史的アナロジー。",
    targetReader:
      "気候変動を歴史的・文明論的視点で理解したい人。環境問題と文明の関係に関心がある人。",
    relatedThemeIds: ["history", "politics"],
  },
  {
    id: "env-carbon-neutral",
    title: "2050年カーボンニュートラル",
    author: "竹内純子 ほか",
    themeId: "environment",
    level: "beginner",
    reason:
      "企業・政府がカーボンニュートラルを表明する今、その実現可能性とエネルギー転換の全体像を日本の文脈で理解できる入門書。",
    description:
      "エネルギー政策の専門家たちが、2050年脱炭素社会の実現に向けた再エネ・水素・原子力・省エネのシナリオをわかりやすく解説。ビジネス・政策両面からの課題を整理する。",
    tags: ["脱炭素", "エネルギー政策", "再生可能エネルギー"],
    whatYouLearn:
      "カーボンニュートラルの意味とその達成に必要な技術・政策の全体像。日本のエネルギー転換の課題と選択肢。",
    targetReader:
      "脱炭素・エネルギー政策を基礎から学びたい人。環境ビジネスに関わるビジネスパーソン。",
    relatedThemeIds: ["politics", "business"],
  },
  {
    id: "env-biodiversity",
    title: "生物多様性という名の革命",
    author: "デイヴィッド・タカクス",
    themeId: "environment",
    level: "intermediate",
    reason:
      "生物多様性の損失が気候変動と並ぶ地球規模の危機として認識される今、「生物多様性」という概念がどのように生まれ普及したかを問い直す。",
    description:
      "「生物多様性（バイオダイバーシティ）」という言葉が科学・政治・社会運動を通じて形成されてきた過程を追うサイエンスノンフィクション。保全生態学の思想的背景が理解できる。",
    tags: ["生物多様性", "保全生態学", "環境思想"],
    whatYouLearn:
      "生物多様性保全の科学的・政治的背景。なぜ今「自然資本」「生態系サービス」が注目されるのかの文脈。",
    targetReader:
      "生態系・生物多様性を深く理解したい人。環境問題を社会科学の視点から捉えたい人。",
    relatedThemeIds: ["politics"],
  },
  {
    id: "env-cradle-to-cradle",
    title: "サーキュラー・エコノミー",
    author: "エレン・マッカーサー財団",
    themeId: "environment",
    level: "beginner",
    reason:
      "廃棄物ゼロ・資源循環をビジネスモデルに取り込む動きが加速する今、サーキュラーエコノミーの基本概念と事例を押さえる入門的一冊。",
    description:
      "「取って・作って・捨てる」線形経済から「使い続ける」循環経済へのシフトを解説。エレン・マッカーサー財団が推進するサーキュラーエコノミーの概念・事例・ビジネスチャンスを整理。",
    tags: ["サーキュラーエコノミー", "廃棄物", "持続可能なビジネス"],
    whatYouLearn:
      "サーキュラーエコノミーの3原則と代表的ビジネスモデル。SDGs・ESGとの接続と企業への実装事例。",
    targetReader:
      "サステナビリティ・ESGに取り組むビジネスパーソン。環境と経済の両立を考えたい人。",
    relatedThemeIds: ["business", "economy"],
  },

  // ── 追加書籍（政治・民主主義）──────────────────────────
  {
    id: "pol-how-democracies-die",
    title: "民主主義の死に方",
    author: "スティーブン・レビツキー / ダニエル・ジブラット",
    themeId: "politics",
    level: "intermediate",
    reason:
      "世界各地でポピュリズム・権威主義が台頭する今、民主主義がクーデターでなく民主主義の手続きで死ぬ「静かな崩壊」のパターンを学べる警告の書。",
    description:
      "ハーバード大学政治学者2名が南米・欧州の事例から、民主主義が選挙を通じて徐々に権威主義化するプロセスを分析。トランプ現象と重ね合わせた現代的な読み物。",
    tags: ["民主主義の危機", "ポピュリズム", "権威主義"],
    whatYouLearn:
      "民主主義を侵食する指導者の4つの行動パターン。民主主義が機能するための規範・制度の役割。",
    targetReader:
      "民主主義の現状に危機感を持つ人。ポピュリズム・右傾化を歴史的に理解したい人。",
    relatedThemeIds: ["history", "war"],
  },
  {
    id: "pol-1984",
    title: "1984年",
    author: "ジョージ・オーウェル",
    themeId: "politics",
    level: "beginner",
    reason:
      "監視社会・情報統制・ビッグテックによる行動追跡が現実となった今、全体主義的ディストピアを描いた20世紀最大の政治小説が再び光を放つ。",
    description:
      "「ビッグ・ブラザー」が支配する全体主義国家で、真実省に務める主人公が体制に反抗する古典的ディストピア小説。二重思考・新語・歴史改竄など現代社会への鋭い批評を含む。",
    tags: ["全体主義", "監視社会", "フィクション", "古典"],
    whatYouLearn:
      "全体主義が人間の思考・言語・歴史をいかに操るかの想像的体験。監視・情報統制への批判的視点。",
    targetReader:
      "政治・社会思想を物語で学びたい人。現代のSNS・監視資本主義に問題意識を持つ人。",
    relatedThemeIds: ["history", "ai"],
  },
  {
    id: "pol-political-philosophy",
    title: "政治哲学入門",
    author: "ウィル・キムリッカ",
    themeId: "politics",
    level: "advanced",
    reason:
      "「正義」「自由」「平等」の根拠が問われる今、現代政治哲学の主要理論（自由主義・リバタリアニズム・共同体主義・フェミニズム）を体系的に学べる標準的教科書。",
    description:
      "功利主義・自由主義（ロールズ）・リバタリアニズム・マルクス主義・コミュニタリアニズムなど6つの政治哲学を平等に解説し比較する。政治思想の基礎を一冊で習得できる。",
    tags: ["政治哲学", "正義論", "自由主義"],
    whatYouLearn:
      "6大政治哲学理論の核心と相互批判。「何が正義か」「自由の根拠は何か」という問いへの多角的な答え。",
    targetReader:
      "政治・倫理・社会問題を哲学的に考えたい人。大学・大学院で政治哲学を学ぶ人。",
    relatedThemeIds: ["history", "economy"],
  },
  {
    id: "pol-escape-freedom",
    title: "自由からの逃走",
    author: "エーリッヒ・フロム",
    themeId: "politics",
    level: "advanced",
    reason:
      "自由を与えられた現代人がなぜ権威主義的指導者・ナショナリズムに惹かれるのかを心理学・社会学で解明した現代の古典。",
    description:
      "ナチズムが台頭した理由を「自由の重荷から逃げたい人間心理」で説明する社会心理学の名著。自由と権威主義の関係を分析し、真の意味の自由と積極的自由の実現を訴える。",
    tags: ["権威主義", "社会心理学", "自由論"],
    whatYouLearn:
      "民主社会において権威主義的運動が生まれる社会心理学的メカニズム。「逃避」でなく「自発的な自由」を生きる方向性。",
    targetReader:
      "ポピュリズム・権威主義の心理的基盤を理解したい人。自由と孤独の関係を深く考えたい人。",
    relatedThemeIds: ["psychology", "history"],
  },
  {
    id: "pol-political-economy",
    title: "政治経済学入門",
    author: "岡田光雄",
    themeId: "politics",
    level: "intermediate",
    reason:
      "政治と経済が不可分に絡み合う現代社会において、両者の相互作用を体系的に理解するための基礎が得られる教科書。",
    description:
      "経済政策・規制・市場と国家の関係を政治経済学の視点から解説する入門書。なぜ政府は市場に介入するのか、誰の利益のために政策が作られるのかを問う枠組みを提供する。",
    tags: ["政治経済学", "経済政策", "国家論"],
    whatYouLearn:
      "政治と経済の相互作用のメカニズム。規制・補助金・税制が誰の利益になっているかを読み解く視点。",
    targetReader:
      "経済政策のニュースを政治的文脈で理解したい人。政治学・経済学の統合的な見方を身につけたい人。",
    relatedThemeIds: ["economy", "history"],
  },

  // ── 追加書籍（医療・健康）────────────────────────────────
  {
    id: "health-smartphone-brain",
    title: "スマホ脳",
    author: "アンデシュ・ハンセン",
    themeId: "health",
    level: "beginner",
    reason:
      "スマホ利用時間が過去最高を更新し続ける今、スマートフォンが脳・メンタル・集中力に与える科学的影響を知ることは緊急の課題。",
    description:
      "スウェーデンの精神科医が、スマホ使用がうつ・不安・集中力の低下・睡眠障害を引き起こすメカニズムを脳科学で解説。SNS・アプリ設計が人間の心理を操る実態も暴露。",
    tags: ["スマホ", "脳科学", "メンタルヘルス", "依存"],
    whatYouLearn:
      "スマホ使用が脳のドーパミン系に与える影響と依存のメカニズム。デジタルウェルビーイングのための具体的な対処法。",
    targetReader:
      "スマホ使用時間を減らしたい人。子どもへのスマホの影響を心配する保護者。",
    relatedThemeIds: ["psychology", "education"],
  },
  {
    id: "health-infectious-disease",
    title: "感染症の世界史",
    author: "石弘之",
    themeId: "health",
    level: "intermediate",
    reason:
      "コロナ禍を経て感染症リスクへの意識が高まった今、ペスト・天然痘・スペイン風邪から新型コロナまで、感染症が人類史を動かしてきた事実を学べる。",
    description:
      "文明の誕生とともに現れた感染症が、ローマ帝国の崩壊・植民地支配・二度の世界大戦にどう関与したかを医学・歴史学の観点で解説。パンデミックの構造的理解に不可欠な一冊。",
    tags: ["感染症", "パンデミック", "医学史"],
    whatYouLearn:
      "感染症と人類文明の盛衰の関係。現代のパンデミック対策が抱える課題の歴史的背景。",
    targetReader:
      "感染症・医療の社会的影響を歴史的に理解したい人。公衆衛生・医療政策に関心がある人。",
    relatedThemeIds: ["history", "politics"],
  },
  {
    id: "health-anti-aging",
    title: "LIFESPAN（ライフスパン）",
    author: "デビッド・A・シンクレア",
    themeId: "health",
    level: "intermediate",
    reason:
      "老化の研究が急速に進み「老化は治療できる疾患」という考え方が広まりつつある今、ハーバード医大の研究者が老化の仕組みと延命の可能性を解説する。",
    description:
      "老化の「情報理論」を提唱するハーバード医学部教授が、なぜ老化するのか・老化を遅らせる生活習慣・今後の長寿科学の展望を解説。サーチュイン・NAD+など最先端の知見を平易に解説。",
    tags: ["老化科学", "長寿", "健康管理"],
    whatYouLearn:
      "老化の科学的メカニズムとその遅延に有効な生活習慣の根拠。今後の抗老化医療の展望。",
    targetReader:
      "老化・長寿の科学的研究に関心がある人。健康寿命を延ばすための生活習慣を整えたい人。",
    relatedThemeIds: ["ai", "economy"],
  },
  {
    id: "health-mental-first-aid",
    title: "メンタルヘルス・ファーストエイド",
    author: "メアリー・エレン・コープランド",
    themeId: "health",
    level: "beginner",
    reason:
      "職場・学校でのメンタルヘルス問題が深刻化する今、精神的危機に直面した人を支えるための基礎知識と対応スキルが社会全体で必要とされている。",
    description:
      "うつ・不安・パニック・依存症などの精神的危機に対して、専門家でなくてもできる初期対応（ファーストエイド）の方法を解説。職場・学校・家庭での活用を想定した実践的なガイド。",
    tags: ["メンタルヘルス", "精神医学", "支援スキル"],
    whatYouLearn:
      "精神的危機の種類と基本的なサインの見分け方。危機に対応するための5ステップの実践的なアプローチ。",
    targetReader:
      "職場・家族の精神的危機をサポートしたい人。メンタルヘルスの基礎知識を身につけたい人。",
    relatedThemeIds: ["psychology"],
  },
  {
    id: "health-corona-aftermath",
    title: "コロナ後の世界を語る",
    author: "村上陽一郎 ほか",
    themeId: "health",
    level: "beginner",
    reason:
      "パンデミックが医療・社会・経済・倫理に与えた影響が問い直される今、多様な知識人の視点からコロナ後の世界を考える思考の入口として。",
    description:
      "科学史家・医療倫理学者から経済学者・哲学者まで、様々な専門家がコロナ禍が社会に突きつけた問いを論じる論考集。医療・民主主義・格差・科学の信頼など多角的に検討する。",
    tags: ["コロナ", "医療", "社会変容", "パンデミック後"],
    whatYouLearn:
      "パンデミックが暴き出した社会の脆弱性と構造的問題。ポストコロナにおける医療・政治・コミュニティの再設計の視点。",
    targetReader:
      "コロナ禍の経験を社会的・哲学的に振り返りたい人。医療と社会の関係を多角的に考えたい人。",
    relatedThemeIds: ["politics", "economy"],
  },
  {
    id: "health-obesity-science",
    title: "なぜ私たちは太るのか",
    author: "ゲアリー・タウブス",
    themeId: "health",
    level: "intermediate",
    reason:
      "肥満・糖尿病・メタボリックシンドロームが社会問題化する今、「カロリー制限が正しい」という通説を覆す栄養科学の論争を整理した一冊。",
    description:
      "科学ジャーナリスト・タウブスが「太るのはカロリーの取り過ぎでなく炭水化物のせい」という仮説を科学的証拠で検証。ダイエット・栄養学の常識を覆す問題提起が続く。",
    tags: ["栄養学", "肥満", "ダイエット科学"],
    whatYouLearn:
      "インスリン・炭水化物が脂肪蓄積に果たす役割の科学的証拠。何十年もダイエット論争が続いてきた栄養科学の複雑さ。",
    targetReader:
      "体重・健康管理に悩んでいる人。栄養学の「本当のところ」を知りたい人。",
    relatedThemeIds: ["psychology"],
  },

  // ── 追加書籍（ビジネス・経営）──────────────────────────
  {
    id: "biz-behavioral-econ",
    title: "行動経済学が最強の学問である",
    author: "相良奈美香",
    themeId: "business",
    level: "beginner",
    reason:
      "消費者行動・マーケティング・組織設計のすべてに人間の非合理性が絡む今、行動経済学の実務応用を最もわかりやすく解説した入門書。",
    description:
      "行動経済学のビジネス・マーケティング・採用・組織設計への応用を豊富な日本の事例で解説。理論の難しさを取り除き、即座に使えるナッジ・フレーミング・デフォルト設定の実践を学べる。",
    tags: ["行動経済学", "マーケティング", "ナッジ"],
    whatYouLearn:
      "行動経済学の主要理論の実務応用。顧客・従業員行動を設計するナッジ・チョイスアーキテクチャの具体例。",
    targetReader:
      "マーケティング・UX・HR担当者。人間の行動をビジネスに活かしたいすべての人。",
    relatedThemeIds: ["psychology", "economy"],
  },
  {
    id: "biz-teal-organization",
    title: "ティール組織",
    author: "フレデリック・ラルー",
    themeId: "business",
    level: "advanced",
    reason:
      "従来の階層型組織の機能不全が顕著になる今、自律分散型の組織形態（ティール）が日本でも実装され始めており、その哲学的根拠を理解する必要がある。",
    description:
      "マッキンゼー出身のコンサルタントが、上司も役職もない「自主経営組織」の事例を世界から収集し分析。組織の進化モデル（赤→橙→緑→ティール）を体系化した組織論の革命的一冊。",
    tags: ["組織設計", "ホラクラシー", "自律分散"],
    whatYouLearn:
      "組織の進化5段階モデルと各段階の特徴・限界。自主経営・全体性・進化的目的という3つのブレークスルー。",
    targetReader:
      "組織変革・マネジメント改革に関わる経営者・HR担当者。未来の組織の姿を深く考えたい人。",
    relatedThemeIds: ["psychology"],
  },
  {
    id: "biz-give-take",
    title: "GIVE & TAKE「与える人」こそ成功する時代",
    author: "アダム・グラント",
    themeId: "business",
    level: "intermediate",
    reason:
      "コラボレーションとネットワークが競争優位の源泉となった今、「ギバー（与える人）」が長期的に成功する理由を科学的に示す。",
    description:
      "ウォートン校最年少終身教授グラントが、職場・社会の成功者を「ギバー（与える人）」「テイカー（奪う人）」「マッチャー（等価交換する人）」に分類し、ギバーが最上位と最下位の両方に現れる逆説を解説。",
    tags: ["人間関係", "組織", "成功論"],
    whatYouLearn:
      "ギバー・テイカー・マッチャーの違いと職場での影響パターン。消耗しないギバーになるための実践的方法。",
    targetReader:
      "職場での協力関係・ネットワークを改善したい人。利他的行動と成功の関係を科学的に理解したい人。",
    relatedThemeIds: ["psychology"],
  },
  {
    id: "biz-hard-things",
    title: "ハードシングス",
    author: "ベン・ホロウィッツ",
    themeId: "business",
    level: "intermediate",
    reason:
      "起業・新規事業の困難が予測不能な時代に、「教科書に載っていない難問」をどう乗り越えるかをシリコンバレーの実業家が赤裸々に語る。",
    description:
      "A16Z創業者が自身のスタートアップ経営の修羅場（人材解雇・倒産寸前・競合との戦争）を率直に語り、「難しい問題に正解はない」という現実を突きつける経営者・起業家必読の書。",
    tags: ["起業", "スタートアップ", "リーダーシップ"],
    whatYouLearn:
      "教科書的な正解がない経営判断の現実。CEOとして孤独な意思決定を続けるための精神的フレームワーク。",
    targetReader:
      "起業家・経営者。難しい判断を迫られるマネージャー。スタートアップの現実を知りたい人。",
    relatedThemeIds: ["psychology"],
  },
  {
    id: "biz-world-mgmt-theory",
    title: "世界標準の経営理論",
    author: "入山章栄",
    themeId: "business",
    level: "advanced",
    reason:
      "日本企業のグローバル競争力が問われる今、欧米のMBAで教えられる経営理論を体系的に日本語で学べる唯一の総合書。",
    description:
      "早稲田大学ビジネススクール教授が30以上の主要経営理論（競争優位・イノベーション・組織・戦略・認知）を体系的に解説。各理論の背景・限界・応用まで網羅した700ページの大著。",
    tags: ["経営理論", "MBA", "戦略論"],
    whatYouLearn:
      "世界標準の経営理論30+の体系的理解。各理論が実際のビジネス・意思決定にどう適用されるか。",
    targetReader:
      "MBAで学ぶような経営理論を独学したい人。経営判断の理論的根拠を体系的に学びたい管理職。",
    relatedThemeIds: ["economy", "psychology"],
  },
  {
    id: "biz-lean-startup",
    title: "リーン・スタートアップ",
    author: "エリック・リース",
    themeId: "business",
    level: "intermediate",
    reason:
      "スタートアップから大企業の新規事業まで、仮説検証サイクルを高速で回すアジャイルな事業開発が標準となった今、その手法を確立した原典。",
    description:
      "「作って→測って→学ぶ」サイクルを最小限のコストで高速に回す「リーン・スタートアップ」手法を解説。MVP（最小限の製品）で顧客の反応を検証し、失敗コストを最小化する起業哲学。",
    tags: ["スタートアップ", "アジャイル", "製品開発"],
    whatYouLearn:
      "構築→計測→学習サイクルの実践方法。MVPによる仮説検証とピボットの判断基準。",
    targetReader:
      "新規事業・スタートアップに携わる人。製品・サービス開発のプロセスを改善したい人。",
    relatedThemeIds: ["ai", "economy"],
  },

  // ── 追加書籍（心理・行動科学）──────────────────────────
  {
    id: "psy-ariely-predictably",
    title: "予想どおりに不合理",
    author: "ダン・アリエリー",
    themeId: "psychology",
    level: "beginner",
    reason:
      "SNS・広告・ゲームが人間の非合理な判断を巧みに利用する今、自分がどのように「設計された罠」にはまるかを知ることが自衛につながる。",
    description:
      "MITの行動経済学者アリエリーが、アンカリング・無料の力・性的興奮時の判断変容など人間の非合理な行動パターンを実験で実証するベストセラー。読みながら自分の非合理に気づく。",
    tags: ["行動経済学", "認知バイアス", "意思決定"],
    whatYouLearn:
      "アンカリング・「無料」の心理・先送り癖など具体的な非合理パターン。自分のバイアスへの気づきと日常の意思決定改善。",
    targetReader:
      "自分や他人の「なぜこんな選択をするのか」を理解したい人。マーケティング・UXを学びたい人。",
    relatedThemeIds: ["economy", "business"],
  },
  {
    id: "psy-thaler-nudge",
    title: "実践行動経済学",
    author: "リチャード・セイラー / キャス・サンスティーン",
    themeId: "psychology",
    level: "intermediate",
    reason:
      "政府・企業がナッジ（nudge）で人の行動を誘導する時代に、その原理を知ることは市民として不可欠なリテラシーになった。",
    description:
      "ノーベル賞経済学者セイラーと法学者サンスティーンが提唱した「ナッジ（軽い後押し）」で人間の行動を良い方向に変える政策・ビジネスの設計論。選択アーキテクチャの実践入門。",
    tags: ["ナッジ", "行動経済学", "政策設計"],
    whatYouLearn:
      "ナッジの6原則と具体的な政策・ビジネス応用事例。チョイスアーキテクチャを設計する思考法。",
    targetReader:
      "行動経済学を政策・ビジネスに使いたい人。「良い選択」を促す仕組みを設計したい人。",
    relatedThemeIds: ["politics", "business"],
  },
  {
    id: "psy-happiness-advantage",
    title: "幸福優位7つの法則",
    author: "ショーン・エイカー",
    themeId: "psychology",
    level: "beginner",
    reason:
      "ウェルビーイング・エンゲージメントが経営・教育のキーワードになった今、「幸福が生産性を高める」という逆説を科学的に示す入門書。",
    description:
      "ハーバード大学でポジティブ心理学を講じる著者が、12年の研究から幸福がビジネスパフォーマンスを高める7つの原則を提示。具体的なエクササイズを通じて幸福を習慣化する方法を解説。",
    tags: ["ポジティブ心理学", "幸福", "生産性"],
    whatYouLearn:
      "幸福が成功に先行するという「幸福優位」の科学的根拠。幸福感を習慣的に高める7つの実践方法。",
    targetReader:
      "仕事・生活の満足感を高めたい人。組織のエンゲージメント改善に関心がある管理職・HR担当。",
    relatedThemeIds: ["business", "education"],
  },
  {
    id: "psy-not-react",
    title: "反応しない練習",
    author: "草薙龍瞬",
    themeId: "psychology",
    level: "beginner",
    reason:
      "SNS・炎上・承認欲求による精神的消耗が社会問題化する今、仏教の認知科学的手法で「反応しない」技術を学べる実践的な心の整え方。",
    description:
      "ブッダの教えを「余計な反応をしない技術」として現代語で解説するベストセラー。承認欲求・比較・怒りなど7つのムダな反応を科学的に分析し、心を落ち着かせる具体的な練習法を提示。",
    tags: ["マインドフルネス", "メンタルヘルス", "仏教心理学"],
    whatYouLearn:
      "感情的な反応を引き起こす7つのパターンとその克服法。日常の刺激に反応しない「俯瞰する感覚」の育て方。",
    targetReader:
      "SNS疲れ・感情的消耗を減らしたい人。マインドフルネスを仏教的背景から学びたい人。",
    relatedThemeIds: ["education", "health"],
  },
  {
    id: "psy-attachment",
    title: "愛着障害",
    author: "岡田尊司",
    themeId: "psychology",
    level: "intermediate",
    reason:
      "人間関係・育児・メンタルヘルスの問題の根底に愛着スタイルが深く関わることが広く認識される今、愛着理論の現代的応用を学べる一冊。",
    description:
      "精神科医・岡田尊司が愛着障害（アタッチメント障害）の概念を平易に解説し、回避型・不安型などの愛着スタイルが対人関係・仕事・子育てに与える影響を豊富な事例で描く。",
    tags: ["愛着理論", "対人関係", "精神医学"],
    whatYouLearn:
      "4つの愛着スタイルの特徴と日常の対人行動への影響。安定した愛着を後天的に育てる方法。",
    targetReader:
      "対人関係の難しさや孤独感を抱えている人。子育て・パートナーシップを改善したい人。",
    relatedThemeIds: ["health", "education"],
  },

  // ── 追加書籍（歴史・文明）────────────────────────────────
  {
    id: "hist-homo-deus",
    title: "ホモ・デウス",
    author: "ユヴァル・ノア・ハラリ",
    themeId: "history",
    level: "intermediate",
    reason:
      "AIと生命科学が人間を超える時代に、「人類は次に何を目指すのか」を問うサピエンス全史の続編が現代の知的な問いに直接応える。",
    description:
      "サピエンス全史の著者が、飢餓・疫病・戦争を克服した人類が次に「神になる」ことを目指す未来を描く。AIと生命工学がもたらす「データ教」の台頭と人間の意義の喪失を論じる。",
    tags: ["人類史", "AI", "未来", "宗教"],
    whatYouLearn:
      "人類が「神性」を追求する歴史的・論理的必然。データ主義・アルゴリズムが人間の意思決定を代替する未来の姿。",
    targetReader:
      "人類の未来とAIの関係を大きな視点で考えたい人。サピエンス全史を読んで続きを知りたい人。",
    relatedThemeIds: ["ai", "politics"],
  },
  {
    id: "hist-21-lessons",
    title: "21 Lessons：21世紀の人類のための21の思考",
    author: "ユヴァル・ノア・ハラリ",
    themeId: "history",
    level: "beginner",
    reason:
      "フェイクニュース・格差・AI・宗教・テロなど現代社会の21の重要問題を歴史的視点から整理した、今まさに読むべき思考のガイド。",
    description:
      "「過去」を問うサピエンス全史、「未来」を問うホモ・デウスに対し、「現在」に焦点を当てた3部作の完結編。仕事・自由・宗教・瞑想・正義など21テーマで21世紀を生き抜く思考を提示。",
    tags: ["現代社会", "思想", "文明論"],
    whatYouLearn:
      "テクノロジー・ポリティクス・文化・実存という4領域で現代社会が直面する問いの整理。批判的思考で21世紀を生きるための知的地図。",
    targetReader:
      "現代の多様な課題をまとめて俯瞰したい人。ハラリの3部作を完読したい人。",
    relatedThemeIds: ["politics", "ai"],
  },
  {
    id: "hist-roman-history",
    title: "ローマ人の物語（全15巻）",
    author: "塩野七生",
    themeId: "history",
    level: "beginner",
    reason:
      "民主主義・帝国・グローバリゼーションが揺らぐ今、ローマ帝国の盛衰1000年を通して権力・統治・文明の普遍的原理を体感できる歴史の大河ロマン。",
    description:
      "15年かけて書かれた塩野七生によるローマ通史。王政から共和政・帝国・崩壊まで、カエサル・アウグストゥスなど傑出した指導者たちの生涯を通じて文明の興亡を語る圧巻の大作。",
    tags: ["ローマ帝国", "世界史", "権力論"],
    whatYouLearn:
      "ローマが500年間繁栄した政治的・文化的秘密。帝国の崩壊が示す文明の持続可能性の条件。",
    targetReader:
      "歴史の壮大な物語を楽しみながら学びたい人。リーダーシップ・統治の古典的事例から学びたい人。",
    relatedThemeIds: ["politics", "war"],
  },
  {
    id: "hist-collapse",
    title: "文明崩壊",
    author: "ジャレド・ダイアモンド",
    themeId: "history",
    level: "advanced",
    reason:
      "環境破壊・資源枯渇・気候変動という現代の脅威に直面する今、過去の文明がなぜ崩壊したのかを科学的に分析した「銃・病原菌・鉄」の著者の続編。",
    description:
      "イースター島・マヤ・グリーンランドのバイキングなど過去の文明崩壊を環境・社会・政治から多角的に分析し、現代社会への教訓を導く。過去の失敗から学ぶ比較文明論の傑作。",
    tags: ["文明崩壊", "環境", "歴史", "比較文明論"],
    whatYouLearn:
      "文明崩壊を引き起こす5つの要因（環境破壊・気候変化・隣国との関係・貿易パートナー・社会の対応力）。現代文明が直面するリスクへの歴史的警告。",
    targetReader:
      "環境問題と文明の関係を歴史的に理解したい人。現代社会の持続可能性を深く考えたい人。",
    relatedThemeIds: ["environment", "politics"],
  },
  {
    id: "hist-showa-2",
    title: "昭和史 戦後篇 1945-1989",
    author: "半藤一利",
    themeId: "history",
    level: "beginner",
    reason:
      "戦後80年が経過し日本社会の成り立ちへの関心が高まる今、敗戦からバブル崩壊までの戦後日本を分かりやすく語り継ぐ半藤史学の後編。",
    description:
      "「昭和史 1926-1945」の戦後篇。占領・復興・高度成長・政治腐敗・バブルまで昭和後期の日本を語りかける文体で解説。戦後日本の光と影を知るための入門書。",
    tags: ["近現代史", "戦後日本", "高度成長"],
    whatYouLearn:
      "敗戦から「奇跡の復興」を実現した戦後日本の政治・経済のダイナミクス。高度成長と民主化の陰にあった矛盾と問題。",
    targetReader:
      "現代日本の出発点を理解したい人。昭和史前篇を読んで続きを知りたい人。",
    relatedThemeIds: ["politics", "economy"],
  },
  {
    id: "hist-ottoman",
    title: "オスマン帝国 繁栄と衰亡の600年史",
    author: "小笠原弘幸",
    themeId: "history",
    level: "intermediate",
    reason:
      "中東・トルコ・バルカンの紛争が絶えない現代に、その地域の600年を支配したオスマン帝国の歴史を知ることが地政学的理解の基礎となる。",
    description:
      "東洋と西洋の交差点に君臨したオスマン帝国の興亡を600年にわたって解説した通史。多民族・多宗教の共存と統治の仕組みを解明し、現代の中東問題への歴史的視点を提供する。",
    tags: ["オスマン帝国", "中東史", "イスラム"],
    whatYouLearn:
      "オスマン帝国の政治・軍事・宗教制度の全体像。現代の中東・トルコ・バルカンの紛争の歴史的ルーツ。",
    targetReader:
      "中東・イスラム・ヨーロッパの歴史を深く学びたい人。現代地政学の歴史的背景を理解したい人。",
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
