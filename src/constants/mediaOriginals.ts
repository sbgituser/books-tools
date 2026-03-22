/**
 * mediaOriginals.ts
 *
 * メディア横断原作逆引きツール用データ定義。
 * 映像作品（映画・ドラマ・アニメ・海外）と、その原作書籍の対応表。
 */

export type MediaType = "movie" | "drama" | "anime" | "overseas";
export type OriginalType = "novel" | "manga" | "nonfiction" | "essay";

export type MediaOriginalItem = {
  id: string;
  /** 映像作品名 */
  mediaTitle: string;
  /** メディア種別 */
  mediaType: MediaType;
  /** 公開・放送年 */
  mediaYear?: number;
  /** 原作が存在するか */
  originalExists: boolean;
  /** 原作タイトル */
  originalTitle?: string;
  /** 原作著者 */
  originalAuthor?: string;
  /** 原作種別 */
  originalType?: OriginalType;
  /** 映像化の形式（例: テレビドラマ化・映画化） */
  adaptationLabel?: string;
  /** 一言説明 */
  description: string;
  /** 検索用別名・表記揺れ */
  searchAliases?: string[];
  /** 原作と映像の違い（モーダル詳細用） */
  adaptationNotes?: string;
  /** おすすめ対象（モーダル詳細用） */
  recommendedFor?: string;
};

export const MEDIA_ORIGINALS: MediaOriginalItem[] = [
  {
    id: "galileo-drama",
    mediaTitle: "ガリレオ",
    mediaType: "drama",
    mediaYear: 2007,
    originalExists: true,
    originalTitle: "探偵ガリレオ",
    originalAuthor: "東野圭吾",
    originalType: "novel",
    adaptationLabel: "テレビドラマ化",
    description:
      "天才物理学者・湯川学が難事件を解決する人気推理ドラマ。フジテレビ系。原作は1998年刊の連作短編集。",
    searchAliases: ["探偵ガリレオ", "湯川学", "東野圭吾", "福山雅治"],
    adaptationNotes:
      "ドラマではオリジナルエピソードや女性刑事・内海薫のキャラクターが加えられている。原作は短編中心で、ドラマよりもロジックの密度が高い。",
    recommendedFor:
      "ドラマを見て東野圭吾の世界観に興味を持った人。科学的トリックと人間ドラマのバランスが好きな人。",
  },
  {
    id: "suspect-x",
    mediaTitle: "容疑者Xの献身",
    mediaType: "movie",
    mediaYear: 2008,
    originalExists: true,
    originalTitle: "容疑者Xの献身",
    originalAuthor: "東野圭吾",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "天才数学者の犯罪と湯川の推理が交わるガリレオシリーズ映画版。直木賞・本格ミステリ大賞受賞の原作小説。",
    searchAliases: ["ガリレオ", "東野圭吾", "容疑者X"],
    adaptationNotes:
      "映画は概ね原作に忠実。ラストシーンの演出に若干の変更あり。原作の方が石神（犯人）の心理描写が深い。",
    recommendedFor:
      "映画で感動した人。東野圭吾ミステリーで「犯人側の視点」を楽しみたい人。",
  },
  {
    id: "nodame-drama",
    mediaTitle: "のだめカンタービレ",
    mediaType: "drama",
    mediaYear: 2006,
    originalExists: true,
    originalTitle: "のだめカンタービレ",
    originalAuthor: "二ノ宮知子",
    originalType: "manga",
    adaptationLabel: "テレビドラマ化",
    description:
      "音楽大学を舞台にしたラブコメディ。Kiss連載の漫画原作。クラシック音楽ブームのきっかけとなった人気作。",
    searchAliases: ["のだめ", "二ノ宮知子", "千秋先輩"],
    adaptationNotes:
      "ドラマは漫画のトーンをよく再現。一部エピソードが省略・再構成されている。原作はパリ編・ウィーン編がさらに続く。",
    recommendedFor:
      "音楽・クラシックに興味を持った人。ラブコメとして楽しみたい人。",
  },
  {
    id: "nodame-anime",
    mediaTitle: "のだめカンタービレ（アニメ）",
    mediaType: "anime",
    mediaYear: 2007,
    originalExists: true,
    originalTitle: "のだめカンタービレ",
    originalAuthor: "二ノ宮知子",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "同名漫画のTVアニメ版。J.C.STAFF制作。原作の雰囲気を保ちながら漫画的テンポで描く。",
    searchAliases: ["のだめ", "二ノ宮知子"],
  },
  {
    id: "death-note-anime",
    mediaTitle: "DEATH NOTE",
    mediaType: "anime",
    mediaYear: 2006,
    originalExists: true,
    originalTitle: "DEATH NOTE",
    originalAuthor: "大場つぐみ・小畑健",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "名前を書いた人間を死なせるノートを手にした高校生の心理戦ミステリー。週刊少年ジャンプ連載漫画のアニメ化。",
    searchAliases: ["デスノート", "大場つぐみ", "小畑健", "ライト", "L"],
    adaptationNotes:
      "アニメ版は原作に概ね忠実だが、後半の展開に変更がある（Nとの対決など）。原作漫画の方が心理描写のテンポが速い。",
    recommendedFor:
      "心理戦・頭脳戦が好きな人。善悪の境界を問う倫理的テーマに興味がある人。",
  },
  {
    id: "death-note-movie",
    mediaTitle: "DEATH NOTE（実写映画）",
    mediaType: "movie",
    mediaYear: 2006,
    originalExists: true,
    originalTitle: "DEATH NOTE",
    originalAuthor: "大場つぐみ・小畑健",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "同名漫画の実写映画版。藤原竜也・松山ケンイチ主演。前後編2作構成。",
    searchAliases: ["デスノート", "大場つぐみ", "小畑健"],
  },
  {
    id: "kimi-no-na-wa",
    mediaTitle: "君の名は。",
    mediaType: "movie",
    mediaYear: 2016,
    originalExists: true,
    originalTitle: "君の名は。",
    originalAuthor: "新海誠",
    originalType: "novel",
    adaptationLabel: "映画→ノベライズ",
    description:
      "新海誠監督のアニメーション映画。映画公開とほぼ同時にノベライズが刊行。国内興収250億円超の大ヒット作。",
    searchAliases: ["きみのなは", "新海誠", "ほだか", "みつは"],
    adaptationNotes:
      "小説は映画と同内容だが、心理描写・情景描写が文章で丁寧に補完されている。映画を見た後に読むと新たな発見がある。",
    recommendedFor:
      "映画を見て余韻に浸りたい人。新海誠ワールドを活字で体験したい人。",
  },
  {
    id: "chihayafuru-anime",
    mediaTitle: "ちはやふる",
    mediaType: "anime",
    mediaYear: 2011,
    originalExists: true,
    originalTitle: "ちはやふる",
    originalAuthor: "末次由紀",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "競技かるたに青春をかける少女を描く漫画のアニメ版。マドハウス制作。競技かるたの認知を大きく広めた。",
    searchAliases: ["末次由紀", "かるた", "ちはやふる"],
    adaptationNotes:
      "アニメは原作の雰囲気を高水準で再現。漫画は全50巻で、アニメよりさらに先まで物語が続く。",
    recommendedFor:
      "アニメで感動した人。百人一首・競技かるたに興味を持った人。",
  },
  {
    id: "chihayafuru-movie",
    mediaTitle: "ちはやふる（実写映画）",
    mediaType: "movie",
    mediaYear: 2016,
    originalExists: true,
    originalTitle: "ちはやふる",
    originalAuthor: "末次由紀",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "同名漫画の実写映画版。広瀬すず・野村周平主演。上の句・下の句・結び の3部作。",
    searchAliases: ["末次由紀", "かるた", "広瀬すず"],
  },
  {
    id: "toshokan-senso",
    mediaTitle: "図書館戦争",
    mediaType: "movie",
    mediaYear: 2013,
    originalExists: true,
    originalTitle: "図書館戦争",
    originalAuthor: "有川浩",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "メディア規制に立ち向かう図書館防衛隊を描くラブストーリー＆アクション。岡田准一・榮倉奈々主演。",
    searchAliases: ["有川浩", "有川ひろ", "としょかんせんそう"],
    adaptationNotes:
      "映画は原作をかなり圧縮。原作シリーズは全4巻＋外伝があり、恋愛描写がより丁寧に描かれている。",
    recommendedFor:
      "映画でキャラクターが好きになった人。言論の自由・検閲というテーマに興味がある人。",
  },
  {
    id: "hakuyako-drama",
    mediaTitle: "白夜行",
    mediaType: "drama",
    mediaYear: 2006,
    originalExists: true,
    originalTitle: "白夜行",
    originalAuthor: "東野圭吾",
    originalType: "novel",
    adaptationLabel: "テレビドラマ化",
    description:
      "1973年の殺人事件から始まる二人の男女の長い物語。TBS系。山田孝之・綾瀬はるか主演。",
    searchAliases: ["東野圭吾", "はくやこう", "白夜行"],
    adaptationNotes:
      "ドラマと原作でラストが異なる。原作は「描かれない」ことで成立する構造が特徴で、より謎が深い。",
    recommendedFor:
      "ドラマで感動した人。東野圭吾の暗黒面・社会派ミステリーが好きな人。",
  },
  {
    id: "kokuhaku-movie",
    mediaTitle: "告白",
    mediaType: "movie",
    mediaYear: 2010,
    originalExists: true,
    originalTitle: "告白",
    originalAuthor: "湊かなえ",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "子供を殺された女性教師の復讐を描く心理サスペンス映画。松たか子主演。本屋大賞受賞の原作小説。",
    searchAliases: ["湊かなえ", "みなとかなえ", "告白"],
    adaptationNotes:
      "映画は原作の複数視点構造を映像的に高度に再現。中島哲也監督の映像表現が原作の世界観をさらに深めている。",
    recommendedFor:
      "映画の衝撃に圧倒された人。湊かなえのイヤミスジャンルを知りたい人。",
  },
  {
    id: "harry-potter",
    mediaTitle: "ハリー・ポッター",
    mediaType: "overseas",
    mediaYear: 2001,
    originalExists: true,
    originalTitle: "ハリー・ポッターと賢者の石",
    originalAuthor: "J.K.ローリング",
    originalType: "novel",
    adaptationLabel: "映画化（海外）",
    description:
      "魔法学校を舞台にした世界的ベストセラー小説の映画版。全8作。世界累計5億部を超える原作小説。",
    searchAliases: ["ハリポタ", "J.K.ローリング", "ホグワーツ", "ハーミオーニー"],
    adaptationNotes:
      "映画は各巻を1〜2本に圧縮しており、原作のエピソードが多数省略されている。原作の方が世界観と人物描写が圧倒的に豊か。",
    recommendedFor:
      "映画シリーズを楽しんだ人。子供から大人まで楽しめるファンタジーを読みたい人。",
  },
  {
    id: "kimetsu",
    mediaTitle: "鬼滅の刃",
    mediaType: "anime",
    mediaYear: 2019,
    originalExists: true,
    originalTitle: "鬼滅の刃",
    originalAuthor: "吾峠呼世晴",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "大正時代を舞台にした鬼狩りの物語。ufotable制作のアニメが爆発的ヒット。週刊少年ジャンプ連載。",
    searchAliases: ["きめつのやいば", "吾峠呼世晴", "炭治郎"],
    adaptationNotes:
      "アニメは原作に非常に忠実で、映像・音楽のクオリティが高く評価されている。原作漫画は全23巻で完結済み。",
    recommendedFor:
      "アニメを見てもっと世界観を知りたい人。大正時代の設定と鬼との戦いを活字で楽しみたい人。",
  },
  {
    id: "shingeki",
    mediaTitle: "進撃の巨人",
    mediaType: "anime",
    mediaYear: 2013,
    originalExists: true,
    originalTitle: "進撃の巨人",
    originalAuthor: "諫山創",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "巨人に支配された世界を描く壮大なアクション・ミステリー。別冊少年マガジン連載。WIT STUDIO/MAPPA制作。",
    searchAliases: ["しんげき", "諫山創", "エレン", "リヴァイ"],
    adaptationNotes:
      "アニメは原作に忠実だが、制作スタジオが途中で変更されるため画風が変わる。原作漫画全34巻で完結済み。",
    recommendedFor:
      "アニメの謎と世界観に引き込まれた人。伏線・考察が好きな人。",
  },
  {
    id: "hanzawa-drama",
    mediaTitle: "半沢直樹",
    mediaType: "drama",
    mediaYear: 2013,
    originalExists: true,
    originalTitle: "オレたちバブル入行組",
    originalAuthor: "池井戸潤",
    originalType: "novel",
    adaptationLabel: "テレビドラマ化",
    description:
      "銀行員・半沢直樹が組織の不正に立ち向かうビジネスドラマ。TBS系。最高視聴率42.2%を記録した社会現象。",
    searchAliases: ["池井戸潤", "バブル入行組", "倍返し", "半沢"],
    adaptationNotes:
      "原作のタイトルは「オレたちバブル入行組」で、ドラマが半沢直樹の名を冠して独自に展開。続編シリーズも小説・ドラマで展開している。",
    recommendedFor:
      "ドラマで痛快なカタルシスを味わった人。組織の不正に立ち向かう社会派小説が好きな人。",
  },
  {
    id: "shitamachi-rocket",
    mediaTitle: "下町ロケット",
    mediaType: "drama",
    mediaYear: 2015,
    originalExists: true,
    originalTitle: "下町ロケット",
    originalAuthor: "池井戸潤",
    originalType: "novel",
    adaptationLabel: "テレビドラマ化",
    description:
      "中小企業の社長が夢を追いかけるビジネスドラマ。TBS系。直木賞受賞の原作小説。阿部寛主演。",
    searchAliases: ["池井戸潤", "下町ロケット"],
    adaptationNotes:
      "ドラマは原作に概ね忠実。シーズン2（ゴースト/ヤタガラス）はドラマ独自のストーリー展開が増える。",
    recommendedFor:
      "ものづくりと組織の葛藤を描いた物語が好きな人。池井戸潤のビジネス小説に入門したい人。",
  },
  {
    id: "dragon-zakura",
    mediaTitle: "ドラゴン桜",
    mediaType: "drama",
    mediaYear: 2005,
    originalExists: true,
    originalTitle: "ドラゴン桜",
    originalAuthor: "三田紀房",
    originalType: "manga",
    adaptationLabel: "テレビドラマ化",
    description:
      "落ちこぼれ高校生を東大合格させようとする弁護士の物語。TBS系。2021年に続編ドラマも放送。",
    searchAliases: ["三田紀房", "東大", "ドラゴン桜2", "阿部寛"],
  },
  {
    id: "hakase-no-ai",
    mediaTitle: "博士の愛した数式",
    mediaType: "movie",
    mediaYear: 2006,
    originalExists: true,
    originalTitle: "博士の愛した数式",
    originalAuthor: "小川洋子",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "80分しか記憶が続かない博士と家政婦の交流を描く温かい物語。寺尾聰主演。読売文学賞・本屋大賞受賞作。",
    searchAliases: ["小川洋子", "数式", "博士"],
    adaptationNotes:
      "映画は原作に忠実で、文学的な余韻も丁寧に再現。原作の方が数学への愛情と人物の内面描写が豊かで深い。",
    recommendedFor:
      "映画で涙した人。静かで知的な文学作品を読みたい人。数学と人間の関わりに興味がある人。",
  },
  {
    id: "alice-in-borderland",
    mediaTitle: "今際の国のアリス",
    mediaType: "drama",
    mediaYear: 2020,
    originalExists: true,
    originalTitle: "今際の国のアリス",
    originalAuthor: "麻生羽呂",
    originalType: "manga",
    adaptationLabel: "Netflix実写化",
    description:
      "謎のゲームに巻き込まれる若者たちのサバイバル。Netflixオリジナルドラマ。週刊少年サンデーS連載漫画が原作。",
    searchAliases: ["アリスインボーダーランド", "麻生羽呂", "今際"],
    adaptationNotes:
      "Netflixドラマは原作のゲーム・キャラクターを一部変更・再構成。原作漫画は全18巻でより緻密なゲームルール設計がされている。",
    recommendedFor:
      "ドラマのサバイバル展開にハマった人。デスゲーム・謎解きジャンルが好きな人。",
  },
  {
    id: "suna-no-utsuwa",
    mediaTitle: "砂の器",
    mediaType: "movie",
    mediaYear: 1974,
    originalExists: true,
    originalTitle: "砂の器",
    originalAuthor: "松本清張",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "殺人事件と人物の壮絶な過去が交差する社会派ミステリー。野村芳太郎監督。日本映画史に残る名作映画。",
    searchAliases: ["松本清張", "すなのうつわ"],
    adaptationNotes:
      "映画はラストシーンの音楽演奏と回想の交差が特に高く評価される。原作小説はより社会批評的な視点が強く、事件の社会背景が詳細。",
    recommendedFor:
      "映画を見て松本清張に興味を持った人。社会派ミステリーに入門したい人。",
  },
  {
    id: "64-movie",
    mediaTitle: "64-ロクヨン-",
    mediaType: "movie",
    mediaYear: 2016,
    originalExists: true,
    originalTitle: "64（ロクヨン）",
    originalAuthor: "横山秀夫",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "昭和64年の誘拐事件が現代に再び動き出す警察ミステリー。佐藤浩市主演。前後編映画。",
    searchAliases: ["横山秀夫", "ろくよん", "64"],
    adaptationNotes:
      "映画は原作を前後編に圧縮しており、警察組織内部の権力闘争の細部が省略されている。原作の方が組織小説として読み応えが高い。",
    recommendedFor:
      "映画を見て横山秀夫に興味を持った人。警察組織の内部を描く社会派ミステリーが好きな人。",
  },
  {
    id: "kotonoha-no-niwa",
    mediaTitle: "言の葉の庭",
    mediaType: "movie",
    mediaYear: 2013,
    originalExists: true,
    originalTitle: "言の葉の庭",
    originalAuthor: "新海誠",
    originalType: "novel",
    adaptationLabel: "映画→ノベライズ",
    description:
      "新海誠監督の短編アニメーション映画（46分）。雨の日の公園で出会う男女の物語。映画公開後にノベライズが刊行。",
    searchAliases: ["新海誠", "ことのはのにわ"],
    adaptationNotes:
      "小説では映画で描かれない側の登場人物の心理・背景が補完されており、映画の後に読むと新たな感動がある。",
    recommendedFor:
      "新海誠の映像美に感動した人。短時間で感動体験したい人。",
  },
  {
    id: "joker-game",
    mediaTitle: "ジョーカー・ゲーム",
    mediaType: "movie",
    mediaYear: 2015,
    originalExists: true,
    originalTitle: "ジョーカー・ゲーム",
    originalAuthor: "柳広司",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "第二次世界大戦前後を舞台にしたスパイ小説の映画化。亀梨和也主演。直木賞候補の原作連作短編集。",
    searchAliases: ["柳広司", "スパイ", "D機関"],
  },
  {
    id: "eizo-ken",
    mediaTitle: "映像研には手を出すな！",
    mediaType: "anime",
    mediaYear: 2020,
    originalExists: true,
    originalTitle: "映像研には手を出すな！",
    originalAuthor: "大童澄瞳",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "高校のアニメ部を舞台に映像制作に情熱を注ぐ少女たちの物語。Science SARU制作。湯浅政明監督。",
    searchAliases: ["映像研", "大童澄瞳"],
    adaptationNotes:
      "アニメはアニメーション表現そのものへのメタ的な演出が特に高く評価される。原作漫画もアニメーション制作の現場描写が詳細。",
    recommendedFor:
      "アニメ制作・創作に興味がある人。青春と情熱を描いた作品が好きな人。",
  },
];

/** フィルタ定義 */
export const MEDIA_TYPE_FILTERS = [
  { value: "all" as const, label: "すべて" },
  { value: "movie" as const, label: "映画" },
  { value: "drama" as const, label: "ドラマ" },
  { value: "anime" as const, label: "アニメ" },
  { value: "overseas" as const, label: "海外" },
] as const;

export type FilterValue = (typeof MEDIA_TYPE_FILTERS)[number]["value"];

/** クイック検索チップ */
export const QUICK_SEARCH_CHIPS = [
  "ガリレオ",
  "のだめカンタービレ",
  "DEATH NOTE",
  "君の名は。",
  "半沢直樹",
  "鬼滅の刃",
  "白夜行",
  "ハリー・ポッター",
];

/** メディア種別表示設定 */
export const MEDIA_TYPE_CONFIG: Record<
  MediaType,
  { label: string; icon: string; badgeClass: string }
> = {
  movie: {
    label: "映画",
    icon: "🎬",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  drama: {
    label: "ドラマ",
    icon: "📺",
    badgeClass: "bg-purple-100 text-purple-700",
  },
  anime: {
    label: "アニメ",
    icon: "✨",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  overseas: {
    label: "海外",
    icon: "🌍",
    badgeClass: "bg-emerald-100 text-emerald-700",
  },
};

/** 原作種別表示設定 */
export const ORIGINAL_TYPE_CONFIG: Record<
  OriginalType,
  { label: string; badgeClass: string }
> = {
  novel: { label: "小説", badgeClass: "bg-indigo-100 text-indigo-700" },
  manga: { label: "漫画", badgeClass: "bg-rose-100 text-rose-700" },
  nonfiction: {
    label: "ノンフィクション",
    badgeClass: "bg-stone-100 text-stone-600",
  },
  essay: { label: "エッセイ", badgeClass: "bg-stone-100 text-stone-600" },
};
