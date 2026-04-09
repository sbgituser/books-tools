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
        c("honkaku-mystery", "本格ミステリー", ["本格", "トリック", "密室", "本格ミステリー", "謎解き", "犯人探し", "アリバイ", "推理合戦", "フーダニット"],
          undefined, { strongKeywords: ["密室", "アリバイ", "トリック", "本格推理"], requiredAny: ["本格", "トリック", "密室", "アリバイ", "謎解き", "フーダニット"] }),
        c("suspense", "サスペンス", ["サスペンス", "緊張感", "心理戦", "スリラー", "スリル", "緊迫", "逃亡劇", "犯罪", "危機", "恐怖"]),
        c("police", "警察小説", ["警察", "刑事", "捜査", "警察小説", "捜査班", "所轄", "事件捜査", "犯罪捜査", "事件解決"],
          undefined, { requiredAny: ["警察", "刑事", "捜査", "警察官", "刑事小説", "所轄", "捜査班"] }),
        c("court-social", "法廷・社会派", ["法廷", "社会派", "冤罪", "弁護士", "検察", "裁判", "裁判官", "無実", "司法"]),
        c("classic-mystery", "古典ミステリー", ["古典", "ホームズ", "ポアロ", "クリスティ", "名探偵", "古典探偵", "アガサ・クリスティ", "コナン・ドイル"],
          undefined, { strongKeywords: ["ホームズ", "ポアロ", "クリスティ", "コナンドイル"] }),
      ], { requiredAny: ["ミステリー", "推理", "探偵", "サスペンス", "犯人", "事件", "謎", "犯罪", "刑事"] }),
      c("sf", "SF", ["sf", "宇宙", "ディストピア", "近未来", "サイエンスフィクション", "科学小説"], [
        c("hard-sf", "ハードSF", ["ハードsf", "科学考証", "工学", "hard sf", "科学的考証", "リアルな科学", "物理法則"],
          undefined, { strongKeywords: ["ハードsf", "科学考証", "hard sf"] }),
        c("near-future", "近未来SF", ["近未来", "未来社会", "ai", "人工知能", "テクノロジー", "ロボット社会", "デジタル社会", "未来のテクノロジー"]),
        c("dystopia", "ディストピア", ["ディストピア", "管理社会", "全体主義", "監視社会", "独裁", "支配", "反乱", "自由を奪われ"]),
        c("space-sf", "宇宙SF", ["宇宙", "惑星", "宇宙船", "銀河", "星間", "宇宙探査", "宇宙開拓"]),
        c("ai-tech-sf", "AI・テクノロジーSF", ["ai", "人工知能", "テクノロジー", "サイバーパンク", "ロボット", "人工意識", "サイバー空間", "ai時代"]),
      ], { requiredAny: ["sf", "サイエンスフィクション", "科学小説", "宇宙", "ディストピア", "近未来", "人工知能", "異星", "タイムトラベル"] }),
      c("fantasy", "ファンタジー", ["ファンタジー", "魔法", "異世界", "剣と魔法"], [
        c("isekai", "異世界", ["異世界", "転生", "召喚", "チート", "異世界へ", "転生後", "チート能力"]),
        c("dark-fantasy", "ダークファンタジー", ["ダーク", "退廃", "呪い", "ダークファンタジー", "闇", "邪悪", "不気味な世界"]),
        c("adventure-fantasy", "冒険ファンタジー", ["冒険", "旅", "王国", "勇者", "魔物", "ダンジョン", "冒険者", "魔王", "パーティ"]),
        c("myth", "神話・伝承系", ["神話", "伝承", "英雄譚", "叙事詩", "英雄", "神々", "伝説", "神話世界"]),
        c("modern-fantasy", "現代ファンタジー", ["現代ファンタジー", "日常×幻想", "魔法少女", "日常に魔法", "異能力", "魔法使い", "現代と魔法"]),
      ], { requiredAny: ["ファンタジー", "魔法", "異世界", "ドラゴン", "騎士", "冒険", "伝説", "指輪物語", "ハリーポッター"] }),
      c("romance", "恋愛", ["恋愛", "ラブ", "純愛", "恋愛小説"], [
        c("pure-love", "純愛", ["純愛", "一途", "初恋", "ピュアな恋", "一途な恋", "恋心", "純粋な気持ち"]),
        c("adult-romance", "大人の恋愛", ["大人の恋愛", "再会", "不倫", "大人の恋", "複雑な関係", "禁断", "大人の事情"]),
        c("sad-romance", "切ない恋愛", ["切ない", "喪失", "別れ", "悲しい恋", "悲恋", "喪失感", "哀愁", "切ない気持ち"]),
        c("romcom", "ラブコメ", ["ラブコメ", "恋愛コメディ", "ラブコメディ", "笑える恋愛", "ドタバタ恋愛", "かわいい恋愛"]),
        c("women-romance", "女性向け恋愛", ["女性向け", "恋愛小説", "少女小説", "乙女", "乙女心", "女性主人公の恋"]),
      ], { requiredAny: ["恋愛", "ラブ", "純愛", "恋", "ロマンス", "愛"] }),
      c("youth", "青春", ["青春", "学園", "成長", "青春小説"], [
        c("school", "学園", ["学園", "学校", "高校", "大学", "学校生活", "クラス", "教室", "先生", "学生"]),
        c("growth", "成長物語", ["成長", "自立", "葛藤", "挑戦", "成長物語", "変わっていく", "自己成長"]),
        c("friendship", "友情", ["友情", "仲間", "絆", "友人関係", "友達", "親友", "友情の絆"]),
        c("club-sports", "部活・競技", ["部活", "競技", "大会", "スポーツ", "部活動", "練習試合", "大会出場"]),
        c("summer", "ひと夏系", ["ひと夏", "夏休み", "夏", "青春の夏", "夏の思い出", "夏の恋", "夏の出来事"]),
      ], { requiredAny: ["青春", "学園", "成長物語", "学校", "友情", "部活"] }),
      c("literary", "純文学", ["純文学", "文学", "文芸", "受賞", "芥川賞", "直木賞"], [
        c("modern-literature", "現代文学", ["現代文学", "現代小説", "日本現代文学", "現代日本文学", "純文学的", "文芸作品"]),
        c("jp-literature", "日本文学", ["日本文学", "文豪", "日本近代文学", "漱石", "芥川", "太宰", "三島", "川端"]),
        c("foreign-literature", "海外文学", ["海外文学", "翻訳文学", "世界文学", "外国文学", "翻訳", "世界の名作", "欧米文学"]),
        c("award", "受賞作", ["受賞作", "芥川賞", "直木賞", "本屋大賞", "ブッカー賞", "芥川賞受賞", "直木賞受賞", "本屋大賞受賞", "文学賞"]),
        c("classic-literature", "古典文学", ["古典文学", "古典", "源氏物語", "日本古典", "平安文学", "枕草子"]),
      ]),
      c("historical-novel", "歴史小説", ["歴史小説", "時代小説", "戦国", "幕末", "江戸"], [
        c("jp-history", "日本史", ["日本史", "時代小説", "武士", "侍", "武家", "庶民", "町人", "江戸時代"]),
        c("sengoku-bakumatsu", "戦国・幕末", ["戦国", "幕末", "維新", "坂本龍馬", "戦国時代", "幕末期", "明治維新", "志士", "薩摩", "長州"]),
        c("ancient-medieval", "古代・中世", ["古代", "中世", "平安", "奈良", "平安時代", "鎌倉", "室町", "鎌倉時代"]),
        c("foreign-history", "海外歴史", ["海外歴史", "欧州史", "ローマ帝国", "欧州の歴史", "西洋中世", "ナポレオン", "古代ローマ"]),
        c("modern-history", "近現代史", ["近現代", "戦後", "明治", "大正", "近代史", "昭和", "太平洋戦争", "戦後日本"]),
      ], { requiredAny: ["歴史小説", "時代小説", "戦国", "幕末", "武士", "江戸", "歴史長編"] }),
      c("horror", "ホラー", ["ホラー", "怪談", "恐怖", "心霊"], [
        c("ghost-story", "怪談", ["怪談", "怪異", "幽霊", "心霊体験", "恐怖体験", "呪い", "お化け", "心霊現象", "霊"]),
        c("psycho-horror", "心理ホラー", ["心理ホラー", "不安", "狂気", "異常心理", "精神的恐怖", "ゆがんだ現実", "精神崩壊"]),
        c("splatter", "スプラッタ", ["スプラッタ", "残虐", "グロ"]),
        c("j-horror", "和風ホラー", ["和風ホラー", "和風", "日本ホラー", "和ホラー", "じわじわくる恐怖"]),
        c("suspense-horror", "サスペンスホラー", ["サスペンスホラー", "追跡", "逃亡", "命を狙われ", "追い詰められ", "恐怖の逃走"]),
      ], { requiredAny: ["ホラー", "怪談", "恐怖", "心霊", "怪異", "狂気", "スリラー"] }),
      c("entertainment", "エンタメ小説", ["エンタメ", "ベストセラー", "映像化", "読みやすい"], [
        c("tearjerker", "泣ける", ["泣ける", "感動", "涙", "泣ける話", "感動的な", "涙が出る"]),
        c("twist", "どんでん返し", ["どんでん返し", "意外な結末", "伏線回収", "予想外の展開", "ラスト衝撃"]),
        c("movie-adapted", "映像化作品", ["映像化", "映画化", "ドラマ化", "アニメ化作品"]),
        c("easy-masterpiece", "読みやすい名作", ["読みやすい", "名作", "入門", "一気読み", "サクサク読める"]),
        c("bestseller", "ベストセラー", ["ベストセラー", "話題作", "累計", "累計発行"]),
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
        c("battle", "バトル", ["バトル", "異能", "能力", "戦闘", "戦闘シーン", "能力バトル", "戦い", "必殺技", "強敵", "バトル漫画"]),
        c("adventure", "冒険", ["冒険", "旅", "冒険漫画", "冒険する", "探検", "旅する", "未知の世界"]),
        c("sports", "スポーツ", ["スポーツ", "野球", "サッカー", "バスケ", "試合", "スポーツ選手", "勝利", "競争", "スポーツ漫画", "野球漫画", "サッカー漫画"]),
      ]),
      c("shojo", "少女漫画", ["少女", "恋愛", "ラブコメ", "少女漫画"], [
        c("romance", "恋愛", ["恋愛", "胸キュン", "片思い", "恋愛漫画", "ラブストーリー", "告白", "好き", "ドキドキ", "恋する"]),
        c("romcom", "ラブコメ", ["ラブコメ", "コメディ", "甘々", "笑える恋愛", "コメディ要素", "ドタバタ"]),
      ]),
      c("seinen", "青年漫画", ["青年", "社会派", "ドラマ", "グルメ", "青年漫画"], [
        c("social", "社会派", ["社会派", "社会問題", "リアル", "社会的テーマ", "現代問題", "格差社会", "リアリティ"]),
        c("drama", "ドラマ", ["ドラマ", "人間ドラマ", "感動", "ドラマチック", "泣ける漫画", "感動作品", "家族"]),
        c("hobby-gourmet", "趣味・グルメ", ["グルメ", "趣味", "料理", "食", "食べ物", "グルメ漫画", "料理漫画", "食文化", "レストラン"]),
      ]),
      c("general", "一般漫画", ["日常", "ギャグ", "一般", "コメディ"], [
        c("daily", "日常", ["日常", "ほのぼの", "日常系", "日常コメディ", "日常生活", "癒し", "ほのぼのした"]),
        c("gag", "ギャグ", ["ギャグ", "コメディ", "笑い", "4コマ", "ギャグ漫画", "笑える", "ユーモア", "ボケ"]),
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
    l1Allow: ["novel"],
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
    l1Allow: ["novel"],
    minScore: 2.8,
  },
  {
    id: "ai-theme", label: "AIテーマ",
    keywords: ["ai", "人工知能"],
    requiredAny: ["ai", "人工知能", "ロボット", "機械知性"],
    l1Allow: ["novel"],
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

  // ── (tech/business/investing/psychology/self-help tags removed) ───────────
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
