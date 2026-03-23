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
  /** /works/[workId] に対応するID（存在する場合のみ） */
  workId?: string;
  /** 原作書籍のサムネイルURL */
  thumbnailUrl?: string;
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
    workId: "05gq12q",
  thumbnailUrl: "https://books.google.com/books/content?id=X2s-AgAACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "0bkks71",
  thumbnailUrl: "https://books.google.com/books/content?id=eNjdDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "1kx24fd",
  thumbnailUrl: "https://books.google.com/books/content?id=GZpnEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "1kx24fd",
  thumbnailUrl: "https://books.google.com/books/content?id=GZpnEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "1m22mge",
  thumbnailUrl: "https://books.google.com/books/content?id=_ERuCwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
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
    workId: "1m22mge",
  thumbnailUrl: "https://books.google.com/books/content?id=_ERuCwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
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
    workId: "045cnn5",
  thumbnailUrl: "https://books.google.com/books/content?id=aYP2vwEACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "16a2phy",
  thumbnailUrl: "https://books.google.com/books/content?id=GVNODwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "16a2phy",
  thumbnailUrl: "https://books.google.com/books/content?id=GVNODwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "05vxbou",
  thumbnailUrl: "https://books.google.com/books/content?id=q1imYpx_hbUC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "1tzlddg",
  thumbnailUrl: "https://books.google.com/books/content?id=KZgLEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "0kn9l8z",
  thumbnailUrl: "https://books.google.com/books/content?id=-V6YzwEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE70ryxsYTDYDZugfH6AcBU1msbde1jggv_LeTIO-raQ2hh_eNsa4WQX_5f5u_ugemP8OSlLMiGsUDKZomB396C9WtWALT8Tq5tbAdbvsQ2zYI8Af2WbfFYvyghqPMmVjoY31Blyy&source=gbs_api",
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
    workId: "1rmuzaj",
  thumbnailUrl: "https://books.google.com/books/content?id=-g-O0AEACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "0iuwa8r",
  thumbnailUrl: "https://books.google.com/books/content?id=Mj1cDAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
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
    workId: "0zni0pn",
  thumbnailUrl: "https://books.google.com/books/content?id=nMjEBQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
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
    workId: "0r02lo2",
  thumbnailUrl: "https://books.google.com/books/content?id=ITHyAAAAMAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "0cy5usk",
  thumbnailUrl: "https://books.google.com/books/content?id=bG-DDAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "0qseeqa",
  thumbnailUrl: "https://books.google.com/books/content?id=ncVYzgEACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "004w4z3",
  thumbnailUrl: "https://books.google.com/books/content?id=vYbDBQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "0lu6cg1",
  thumbnailUrl: "https://books.google.com/books/content?id=4kMrtAEACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "1dem5jj",
  thumbnailUrl: "https://books.google.com/books/content?id=1WAsAQAAIAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE706MT_6rwnodk1OVZqKqAsHJGS0wFu7pd2M1pWFKZqsULVGcj0bxG8kdZNdqj7XHFnzgMO9-00GE-Vpi0E_Si9tXmeadllWEIKcmKzgPDEeDuuplrBT4v1n1cVKsc_K-xQIvQr1&source=gbs_api",
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
    workId: "1qznmx7",
  thumbnailUrl: "https://books.google.com/books/content?id=cTTBMgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
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
    workId: "1shuw72",
  thumbnailUrl: "https://books.google.com/books/content?id=mi8hwAEACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "1mij96r",
  thumbnailUrl: "https://books.google.com/books/content?id=UiiOPgAACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
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
    workId: "1cv7fb3",
  thumbnailUrl: "https://books.google.com/books/content?id=7qHvDQAAQAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },

  // ── 2000年代 ────────────────────────────────────────────────────

  {
    id: "hana-yori-dango",
    mediaTitle: "花より男子",
    mediaType: "drama",
    mediaYear: 2005,
    originalExists: true,
    originalTitle: "花より男子",
    originalAuthor: "神尾葉子",
    originalType: "manga",
    adaptationLabel: "テレビドラマ化",
    description:
      "平凡な少女が花の御堂4グループ（F4）と衝突するラブストーリー。TBS系。松本潤・井上真央主演。アジア全域でリメイクされた人気漫画原作。",
    searchAliases: ["神尾葉子", "F4", "道明寺", "つくし", "ハナダン"],
    adaptationNotes:
      "ドラマは原作の長大なストーリーを大幅に圧縮。原作漫画は全36巻で、ドラマで描かれないエピソードや登場人物が多数ある。",
    recommendedFor:
      "ドラマで恋愛展開にドキドキした人。王道少女漫画の原点を体験したい人。",
    workId: "1v5wh1g",
  thumbnailUrl: "https://books.google.com/books/content?id=oaQUAQAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "rookies-drama",
    mediaTitle: "ROOKIES",
    mediaType: "drama",
    mediaYear: 2008,
    originalExists: true,
    originalTitle: "ROOKIES",
    originalAuthor: "森田まさのり",
    originalType: "manga",
    adaptationLabel: "テレビドラマ化",
    description:
      "問題校の野球部を立て直す熱血教師の物語。TBS系。佐藤隆太主演。甲子園を目指す高校生の青春を描く。週刊少年ジャンプ連載漫画が原作。",
    searchAliases: ["森田まさのり", "ルーキーズ", "甲子園", "川藤"],
    adaptationNotes:
      "ドラマは原作の前半〜中盤を主に映像化。漫画は全24巻で、甲子園出場後の展開もしっかり描かれている。",
    recommendedFor:
      "ドラマで青春の熱さに感動した人。師弟関係と不良の更生をテーマにした漫画が好きな人。",
    workId: "0hy0c7e",
  thumbnailUrl: "https://books.google.com/books/content?id=gq7ICwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "hachi-kuro-anime",
    mediaTitle: "ハチミツとクローバー",
    mediaType: "anime",
    mediaYear: 2005,
    originalExists: true,
    originalTitle: "ハチミツとクローバー",
    originalAuthor: "羽海野チカ",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "美大生たちの青春と恋愛と挫折を描く群像劇。J.C.STAFF制作。ヤングユーコミックス連載。後に実写映画化・実写ドラマ化も。",
    searchAliases: ["羽海野チカ", "ハチクロ", "竹本", "花本"],
    adaptationNotes:
      "アニメは原作の雰囲気をよく再現。漫画は全10巻で、アニメよりも内面描写が丁寧で余韻が深い。",
    recommendedFor:
      "アニメで芸術・青春・一方通行の恋のテーマに共感した人。3月のライオンも好きな人。",
    workId: "1136xxp",
  thumbnailUrl: "https://books.google.com/books/content?id=WKGADwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "nana-anime",
    mediaTitle: "NANA",
    mediaType: "anime",
    mediaYear: 2006,
    originalExists: true,
    originalTitle: "NANA",
    originalAuthor: "矢沢あい",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "同じ名前の対照的な二人の「ナナ」の友情と恋愛を描く人気少女漫画のアニメ版。マッドハウス制作。Cookies連載。",
    searchAliases: ["矢沢あい", "ナナ", "ブラスト", "大崎ナナ", "小松奈々"],
    adaptationNotes:
      "アニメは原作の連載中断までの内容を丁寧に映像化。漫画は2009年から休載中のため、物語の続きはアニメでも未完。",
    recommendedFor:
      "アニメで二人のナナの友情に感動した人。音楽と恋愛と友情をテーマにした少女漫画が好きな人。",
    workId: "0xg4crk",
  thumbnailUrl: "https://books.google.com/books/content?id=eNzICwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "kimi-ni-todoke-anime",
    mediaTitle: "君に届け",
    mediaType: "anime",
    mediaYear: 2009,
    originalExists: true,
    originalTitle: "君に届け",
    originalAuthor: "椎名軽穂",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "陰気と思われていた少女・爽子と人気者・風早の純粋な恋愛を描く少女漫画のアニメ版。Production I.G制作。週刊別マーガレット連載。",
    searchAliases: ["椎名軽穂", "爽子", "風早", "くらのすけ"],
    adaptationNotes:
      "アニメは原作の序盤〜中盤を映像化。漫画全30巻で描かれる二人の関係の進展はアニメよりもはるかに長い。",
    recommendedFor:
      "アニメで純粋な恋愛模様に癒された人。不器用な女の子が成長する王道少女漫画が好きな人。",
    workId: "1d6gduo",
  thumbnailUrl: "https://books.google.com/books/content?id=b88vAQAAIAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "fma-brotherhood",
    mediaTitle: "鋼の錬金術師 BROTHERHOOD",
    mediaType: "anime",
    mediaYear: 2009,
    originalExists: true,
    originalTitle: "鋼の錬金術師",
    originalAuthor: "荒川弘",
    originalType: "manga",
    adaptationLabel: "アニメ化（完全版）",
    description:
      "錬金術師の兄弟が「賢者の石」を求めて旅する壮大な冒険物語。BONES制作。月刊少年ガンガン連載原作を完全映像化。",
    searchAliases: ["荒川弘", "エドワード", "アルフォンス", "錬金術師", "FMA"],
    adaptationNotes:
      "BROTHERHOODは2003年版と異なり、原作漫画全27巻を忠実に映像化。アニメ史に残る高完成度の作品。原作漫画は伏線の密度と戦略的な戦闘描写が特徴。",
    recommendedFor:
      "アニメの完成度の高い物語に感動した人。「等価交換」「人間の傲慢さ」というテーマを原作で深く味わいたい人。",
    workId: "0zref9t",
  thumbnailUrl: "https://books.google.com/books/content?id=PQ7FDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "naruto-anime",
    mediaTitle: "NARUTO -ナルト-",
    mediaType: "anime",
    mediaYear: 2002,
    originalExists: true,
    originalTitle: "NARUTO",
    originalAuthor: "岸本斉史",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "忍者の里の落ちこぼれ少年・ナルトが火影を目指す忍者アクション。スタジオぴえろ制作。週刊少年ジャンプ連載。世界累計2.5億部超。",
    searchAliases: ["岸本斉史", "ナルト", "サスケ", "忍者", "忍里"],
    adaptationNotes:
      "アニメはオリジナルエピソード（アニオリ）が多数挿入されているため、原作漫画のほうがテンポよく読める。漫画全72巻。",
    recommendedFor:
      "アニメで忍者の熱い展開が好きだった人。成長・友情・裏切りのテーマを原作で追いたい人。",
    workId: "17otkk9",
  thumbnailUrl: "https://books.google.com/books/content?id=ji3NCwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "bleach-anime",
    mediaTitle: "BLEACH",
    mediaType: "anime",
    mediaYear: 2004,
    originalExists: true,
    originalTitle: "BLEACH",
    originalAuthor: "久保帯人",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "死神代行として戦う高校生・一護の物語。スタジオぴえろ制作。週刊少年ジャンプ連載。2022年に「千年血戦篇」がアニメ化され大きな話題に。",
    searchAliases: ["久保帯人", "一護", "ルキア", "死神", "卍解"],
    adaptationNotes:
      "2022年の千年血戦篇アニメは高クオリティで旧来ファンを驚かせた。原作漫画全74巻は斬新なデザインと独自の世界観が特徴。",
    recommendedFor:
      "千年血戦篇アニメで感動した人。死神と虚の壮大な世界観を原作で読みたい人。",
    workId: "0xf2b4f",
  thumbnailUrl: "https://books.google.com/books/content?id=FQTwAQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "pinpon-movie",
    mediaTitle: "ピンポン",
    mediaType: "movie",
    mediaYear: 2002,
    originalExists: true,
    originalTitle: "ピンポン",
    originalAuthor: "松本大洋",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "卓球の天才少年と凡才少年の青春を描く実写映画。窪塚洋介・ARATA主演。2014年にはアニメ版も制作された人気漫画が原作。",
    searchAliases: ["松本大洋", "ペコ", "スマイル", "卓球"],
    adaptationNotes:
      "映画は原作の雰囲気を見事に再現した名作として評価が高い。漫画全5巻は映画よりも内面描写と哲学的テーマが深く、短編として完成度が高い。",
    recommendedFor:
      "映画の疾走感と映像美が忘れられない人。才能・友情・アイデンティティをテーマにした漫画が好きな人。",
    workId: "1xytg7s",
  thumbnailUrl: "https://books.google.com/books/content?id=HQfzCgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },

  // ── 2010年代前半 ─────────────────────────────────────────────────

  {
    id: "thermae-romae",
    mediaTitle: "テルマエ・ロマエ",
    mediaType: "movie",
    mediaYear: 2012,
    originalExists: true,
    originalTitle: "テルマエ・ロマエ",
    originalAuthor: "ヤマザキマリ",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "古代ローマの建築家が現代日本の風呂文化にタイムスリップするコメディ。阿部寛主演。興収59億円の大ヒット。月刊コミックビーム連載漫画が原作。",
    searchAliases: ["ヤマザキマリ", "ルシウス", "ローマ", "お風呂"],
    adaptationNotes:
      "映画は原作のユーモアをよく再現。漫画全6巻はローマ史の考証が丁寧で、映画よりもルシウスの葛藤と文化的考察が深い。",
    recommendedFor:
      "映画で笑いと感動を味わった人。ローマ史や浴場文化に興味がある人。",
    workId: "0up6xx8",
  thumbnailUrl: "https://books.google.com/books/content?id=BESSrIdvibYC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "uchu-kyodai",
    mediaTitle: "宇宙兄弟",
    mediaType: "movie",
    mediaYear: 2012,
    originalExists: true,
    originalTitle: "宇宙兄弟",
    originalAuthor: "小山宙哉",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "幼い頃宇宙飛行士を夢見た兄弟の物語。小栗旬・岡田将生主演。同年アニメも放送。NASAやJAXAが監修した精密なリアリズムが特徴。",
    searchAliases: ["小山宙哉", "南波六太", "日々人", "宇宙飛行士", "NASA"],
    adaptationNotes:
      "映画は原作の序盤を1本に凝縮。漫画は長期連載中で宇宙開発の最前線と人間ドラマを丁寧に積み重ねており、映画よりはるかに深い。",
    recommendedFor:
      "映画で夢を追い続けることに勇気をもらった人。宇宙・科学好きが人間ドラマも楽しみたい場合。",
    workId: "1vgzl4a",
  thumbnailUrl: "https://books.google.com/books/content?id=KrtxEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "jojo-anime",
    mediaTitle: "ジョジョの奇妙な冒険",
    mediaType: "anime",
    mediaYear: 2012,
    originalExists: true,
    originalTitle: "ジョジョの奇妙な冒険",
    originalAuthor: "荒木飛呂彦",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "ジョースター家と宿敵ディオの因縁を描く壮大な冒険物語。david production制作。週刊少年ジャンプ→ウルトラジャンプ連載。全8部が映像化。",
    searchAliases: ["荒木飛呂彦", "ジョジョ", "ディオ", "スタンド", "波紋"],
    adaptationNotes:
      "アニメは各部ごとに高クオリティで映像化。原作漫画は部によって主人公・時代・世界観が大きく変わる独特の構成が魅力。",
    recommendedFor:
      "アニメで荒木ワールドのセンスに魅了された人。バトルの演出と独特のファッションセンスが好きな人。",
  },
  {
    id: "funa-o-amu",
    mediaTitle: "舟を編む",
    mediaType: "movie",
    mediaYear: 2013,
    originalExists: true,
    originalTitle: "舟を編む",
    originalAuthor: "三浦しをん",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "辞書編集者たちの15年にわたる奮闘を描く文学映画。松田龍平主演。本屋大賞受賞の原作小説。2013年には辞書作りの熱量が話題に。",
    searchAliases: ["三浦しをん", "辞書", "大渡海", "馬締"],
    adaptationNotes:
      "映画は原作の静かな情緒をよく再現。原作小説はより豊かな言葉の描写と、言葉に向き合う人々の内面が丁寧に書かれている。",
    recommendedFor:
      "映画で言葉・日本語・辞書というテーマに興味を持った人。静かで深い文学作品を読みたい人。",
    workId: "0zz63zd",
  thumbnailUrl: "https://books.google.com/books/content?id=EMUPrgEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE70NT17-ktZP0AmqvWl7INBvUWur2tjnqQwsXdwvq5aUAUuIoqpZ9OqrpUs58ab9VJvsx9mCMMPUr84GSj-qgBj2HBeopVokExIWfXW_1f-7F3FGoR1a8yzASFiMPRhbyq9YQpF5&source=gbs_api",
  },
  {
    id: "eien-no-zero",
    mediaTitle: "永遠の0",
    mediaType: "movie",
    mediaYear: 2013,
    originalExists: true,
    originalTitle: "永遠の0",
    originalAuthor: "百田尚樹",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "特攻隊員だった祖父の真実を孫が追う戦争ドラマ。岡田准一主演。国内興収87億円超の大ヒット。本屋大賞受賞の累計700万部超の原作小説。",
    searchAliases: ["百田尚樹", "宮部久蔵", "特攻隊", "ゼロ戦"],
    adaptationNotes:
      "映画は原作の主要な場面を丁寧に映像化。原作小説はより複数の視点からの証言形式で、戦争の悲惨さと人間の葛藤がより深く伝わる。",
    recommendedFor:
      "映画で日本の戦争と家族愛のテーマに感動した人。歴史小説・戦争文学に入門したい人。",
    workId: "07j5tto",
  thumbnailUrl: "https://books.google.com/books/content?id=ofeFQgAACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "parasyte-anime",
    mediaTitle: "寄生獣 セイの格率",
    mediaType: "anime",
    mediaYear: 2014,
    originalExists: true,
    originalTitle: "寄生獣",
    originalAuthor: "岩明均",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "地球外生命体・パラサイトに侵食される世界で人間と共存する少年の物語。マッドハウス制作。1990年連載の傑作をフルリメイク。実写映画も同年公開。",
    searchAliases: ["岩明均", "新一", "ミギー", "パラサイト"],
    adaptationNotes:
      "アニメは原作漫画（全10巻）をほぼ忠実に映像化。漫画は白黒の荒削りな画風が独特の緊張感を生んでおり、アニメとは異なる質感が楽しめる。",
    recommendedFor:
      "アニメで「人間とは何か」というテーマに引き込まれた人。SFホラーとヒューマンドラマが好きな人。",
    workId: "1k8u22x",
  thumbnailUrl: "https://books.google.com/books/content?id=h4S_oQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "tokyo-ghoul-anime",
    mediaTitle: "東京喰種",
    mediaType: "anime",
    mediaYear: 2014,
    originalExists: true,
    originalTitle: "東京喰種トーキョーグール",
    originalAuthor: "石田スイ",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "人肉を食う「喰種」と人間の境界で生きる青年を描くダークファンタジー。スタジオぴえろ制作。週刊ヤングジャンプ連載。",
    searchAliases: ["石田スイ", "金木研", "カネキ", "グール"],
    adaptationNotes:
      "アニメは原作を大幅に改変・圧縮しており、特にルート（√A）以降は別の展開をたどる。原作漫画（全14巻）を読むとより整合性のある深い物語が理解できる。",
    recommendedFor:
      "アニメで世界観に引き込まれた人。原作でアニメとの違いを確かめたい人。人間とモンスターの境界をテーマにした作品が好きな人。",
    workId: "1szm3ez",
  thumbnailUrl: "https://books.google.com/books/content?id=-xrLCwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "haikyuu-anime",
    mediaTitle: "ハイキュー!!",
    mediaType: "anime",
    mediaYear: 2014,
    originalExists: true,
    originalTitle: "ハイキュー!!",
    originalAuthor: "古舘春一",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "高校バレーを舞台に全国制覇を目指す少年たちの物語。Production I.G制作。週刊少年ジャンプ連載。国内外で絶大な人気を誇る。",
    searchAliases: ["古舘春一", "日向翔陽", "影山飛雄", "烏野高校", "バレーボール"],
    adaptationNotes:
      "アニメは原作に忠実で映像・音楽のクオリティが高く評価される。漫画は全45巻で完結しており、全国大会の決勝まで描かれている。2024年には劇場版も公開。",
    recommendedFor:
      "アニメで試合の熱さに感動した人。スポーツ漫画でチームワークと成長のテーマが好きな人。",
    workId: "1d7xco7",
  thumbnailUrl: "https://books.google.com/books/content?id=wI7LCwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "shigatsu-wa-kimi-anime",
    mediaTitle: "四月は君の嘘",
    mediaType: "anime",
    mediaYear: 2014,
    originalExists: true,
    originalTitle: "四月は君の嘘",
    originalAuthor: "新川直司",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "ピアノの天才少年と自由奔放なバイオリニストの出会いと別れを描く青春音楽アニメ。A-1 Pictures制作。月刊少年マガジン連載。",
    searchAliases: ["新川直司", "有馬公生", "宮園かをり", "ピアノ", "バイオリン"],
    adaptationNotes:
      "アニメは原作全11巻をほぼ忠実に映像化。音楽の演奏シーンが特に高く評価される。漫画は音楽描写と心理描写が繊細で、涙なしには読めない。",
    recommendedFor:
      "アニメで音楽と感動の物語に引き込まれた人。青春・音楽・死と再生のテーマが好きな人。",
    workId: "0h9zmq9",
  thumbnailUrl: "https://books.google.com/books/content?id=n0fKBQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "umi-machi-diary",
    mediaTitle: "海街diary",
    mediaType: "movie",
    mediaYear: 2015,
    originalExists: true,
    originalTitle: "海街diary",
    originalAuthor: "吉田秋生",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "鎌倉を舞台に4姉妹の日常を描く是枝裕和監督の人間ドラマ。綾瀬はるか・長澤まさみ・夏帆・広瀬すず主演。カンヌ国際映画祭コンペティション選出。",
    searchAliases: ["吉田秋生", "鎌倉", "4姉妹", "すず", "是枝裕和"],
    adaptationNotes:
      "映画は原作漫画の序盤をほぼ忠実に映像化。漫画は全9巻で、映画後の4姉妹のさらなる変化と鎌倉の四季が丁寧に描かれる。",
    recommendedFor:
      "映画で静かな感動を覚えた人。家族・姉妹・日常の美しさを描いた作品が好きな人。",
    workId: "01f86a7",
  thumbnailUrl: "https://books.google.com/books/content?id=QhSCDAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "bakuman-movie",
    mediaTitle: "バクマン。",
    mediaType: "movie",
    mediaYear: 2015,
    originalExists: true,
    originalTitle: "バクマン。",
    originalAuthor: "大場つぐみ・小畑健",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "漫画家を目指す二人の少年の青春を描く実写映画。佐藤健・神木隆之介主演。「週刊少年ジャンプ」の世界を内側から描いた原作漫画。",
    searchAliases: ["大場つぐみ", "小畑健", "亜城木夢叶", "漫画家", "ジャンプ"],
    adaptationNotes:
      "映画はミュージカル的演出で原作を大胆に再構成。漫画全20巻はジャンプの仕組みや連載の過酷さをリアルに描いており、漫画好きに刺さる内容。",
    recommendedFor:
      "映画の熱い創作バトルに興奮した人。漫画家・創作の世界を深く知りたい人。",
    workId: "1hmxear",
  thumbnailUrl: "https://books.google.com/books/content?id=rhcljgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "ansatsu-kyoshitsu-movie",
    mediaTitle: "暗殺教室",
    mediaType: "movie",
    mediaYear: 2015,
    originalExists: true,
    originalTitle: "暗殺教室",
    originalAuthor: "松井優征",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "月を破壊した謎の生物を教師として「暗殺」する中学生たちの物語。山田涼介・二宮和也主演。週刊少年ジャンプ連載漫画の実写映画化。",
    searchAliases: ["松井優征", "殺せんせー", "渚", "業", "E組"],
    adaptationNotes:
      "映画は原作序盤のアークを中心に構成。漫画全21巻は各キャラクターの成長と終盤の感動的な結末まで描かれており、映画では味わえない深みがある。",
    recommendedFor:
      "映画で殺せんせーとE組の絆に感動した人。笑いと感動が共存する漫画を読みたい人。",
    workId: "05mqcs1",
  thumbnailUrl: "https://books.google.com/books/content?id=xZ_MCwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "rurouni-kenshin-movie",
    mediaTitle: "るろうに剣心",
    mediaType: "movie",
    mediaYear: 2012,
    originalExists: true,
    originalTitle: "るろうに剣心",
    originalAuthor: "和月伸宏",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "明治時代の不殺の剣客・緋村剣心の物語。佐藤健主演。実写化困難とされた人気漫画の映像化に成功し、シリーズ5作で興収200億円超。",
    searchAliases: ["和月伸宏", "剣心", "緋村剣心", "薫", "志志雄"],
    adaptationNotes:
      "映画は原作の主要アーク（東京編・京都編・人誅編）をシリーズで映像化。漫画全28巻はキャラクターの背景や剣術の描写がより詳細。",
    recommendedFor:
      "映画のアクションと時代劇の世界観が好きな人。明治維新の歴史と剣の哲学を漫画で楽しみたい人。",
    workId: "0fcv3n3",
  thumbnailUrl: "https://books.google.com/books/content?id=JGPKCwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "boku-no-hero-anime",
    mediaTitle: "僕のヒーローアカデミア",
    mediaType: "anime",
    mediaYear: 2016,
    originalExists: true,
    originalTitle: "僕のヒーローアカデミア",
    originalAuthor: "堀越耕平",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "個性（超能力）を持たない少年が最強ヒーローを目指すアクション。BONES制作。週刊少年ジャンプ連載。世界190カ国以上で配信される国際的ヒット作。",
    searchAliases: ["堀越耕平", "緑谷出久", "デク", "オールマイト", "ヒロアカ"],
    adaptationNotes:
      "アニメは原作に概ね忠実。漫画は完結しており、ヒーロー社会の崩壊と再建という壮大なエンディングまで描かれている（アニメはほぼ完結）。",
    recommendedFor:
      "アニメで「自分を超えていく」成長ドラマが好きな人。アメコミ風のヒーロー漫画が好きな人。",
    workId: "032sc3q",
  thumbnailUrl: "https://books.google.com/books/content?id=7iLLCwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "konosuba-anime",
    mediaTitle: "この素晴らしい世界に祝福を！",
    mediaType: "anime",
    mediaYear: 2016,
    originalExists: true,
    originalTitle: "この素晴らしい世界に祝福を！",
    originalAuthor: "暁なつめ",
    originalType: "novel",
    adaptationLabel: "アニメ化",
    description:
      "異世界転生したダメ人間と個性豊かな仲間たちのコメディ。Studio DEEN制作。「なろう系」の元祖として知られるライトノベル原作。",
    searchAliases: ["暁なつめ", "カズマ", "アクア", "めぐみん", "ダクネス", "コノスバ"],
    adaptationNotes:
      "アニメはコメディのテンポが非常に良く、原作の笑いをうまく映像化。ライトノベル原作は17巻で完結しており、アニメよりさらに多くのエピソードが読める。",
    recommendedFor:
      "アニメでゆるいコメディに笑い転げた人。異世界転生ジャンルでコメディ寄りの作品が好きな人。",
    workId: "1r4zopm",
  thumbnailUrl: "https://books.google.com/books/content?id=59gNzwEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },

  // ── 2010年代後半 ────────────────────────────────────────────────

  {
    id: "march-lion-movie",
    mediaTitle: "3月のライオン",
    mediaType: "movie",
    mediaYear: 2017,
    originalExists: true,
    originalTitle: "3月のライオン",
    originalAuthor: "羽海野チカ",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "孤独な天才将棋棋士・桐山零の成長と人との絆を描く実写映画。神木隆之介主演。前後編2作。月刊ヤングアニマル連載の人気漫画が原作。",
    searchAliases: ["羽海野チカ", "桐山零", "将棋", "川本", "三月のライオン"],
    adaptationNotes:
      "映画は原作の前半のエッセンスをうまく2本に凝縮。漫画は将棋の世界の奥深さとキャラクターの感情の細やかさが映画よりさらに豊か。",
    recommendedFor:
      "映画で孤独と再生のテーマに感動した人。将棋・家族・癒しをテーマにした漫画が好きな人。",
    workId: "0le0pd2",
  thumbnailUrl: "https://books.google.com/books/content?vid=ISBN9784592141105&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "okotoko",
    mediaTitle: "億男",
    mediaType: "movie",
    mediaYear: 2018,
    originalExists: true,
    originalTitle: "億男",
    originalAuthor: "川村元気",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "宝くじで3億円を当てた男が幸福とお金の意味を問う物語。佐藤健・高橋一生主演。「君の名は。」プロデューサー・川村元気の小説が原作。",
    searchAliases: ["川村元気", "お金", "幸福", "一男"],
    adaptationNotes:
      "映画は原作の構成をよく再現。小説は哲学的な問いをより深く掘り下げており、各章の仕掛けも読みどころ。",
    recommendedFor:
      "映画で「お金と幸せ」の問いに考えさせられた人。川村元気ファンや軽妙なエンタメ小説が好きな人。",
    workId: "1p3apoo",
  thumbnailUrl: "https://books.google.com/books/content?id=0265DAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "tenki-danran-iken",
    mediaTitle: "転生したらスライムだった件",
    mediaType: "anime",
    mediaYear: 2018,
    originalExists: true,
    originalTitle: "転生したらスライムだった件",
    originalAuthor: "伏瀬",
    originalType: "novel",
    adaptationLabel: "アニメ化",
    description:
      "転生してスライムになった主人公がどんどん進化する異世界ファンタジー。8bit制作。「小説家になろう」発の人気ライトノベルシリーズ原作。",
    searchAliases: ["伏瀬", "リムル", "スライム", "テンスラ", "大賢者"],
    adaptationNotes:
      "アニメは原作のアニメ化に成功したが、原作小説（全25巻完結）のほうが世界観の設定と内面描写が圧倒的に詳細。",
    recommendedFor:
      "アニメで無双系異世界ファンタジーの爽快感が好きな人。国家経営系ストーリーが好きな人。",
    workId: "1aakpum",
  thumbnailUrl: "https://books.google.com/books/content?id=ZRrjEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "masquerade-hotel",
    mediaTitle: "マスカレード・ホテル",
    mediaType: "movie",
    mediaYear: 2019,
    originalExists: true,
    originalTitle: "マスカレード・ホテル",
    originalAuthor: "東野圭吾",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "ホテルに潜入捜査する刑事とフロントクラーク女性の連続殺人事件捜査。木村拓哉・長澤まさみ主演。東野圭吾の人気シリーズ小説が原作。",
    searchAliases: ["東野圭吾", "マスカレード", "新田", "山岸"],
    adaptationNotes:
      "映画は原作のホテルという密閉空間での謎解きをよく再現。原作は伏線の精密さとホテルの描写がより詳細。",
    recommendedFor:
      "映画で優雅な謎解きに引き込まれた人。東野圭吾ミステリーの優雅な世界観が好きな人。",
    workId: "069g6xa",
  thumbnailUrl: "https://books.google.com/books/content?id=Uo7toAEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE72mZj0W2yBEDLCsICscw_WhimvO8k4J2UHltkkz6gwNpsfjSIz1Gxrjaf2hrMm7iLWAdb_86Xw_0E8uqhtWmrzJbgYmrSsxB24RpPBolVkf87kxVoGtWBiIbmaXckMPKRjLDItN&source=gbs_api",
  },
  {
    id: "mitsubachi-to-enrai",
    mediaTitle: "蜜蜂と遠雷",
    mediaType: "movie",
    mediaYear: 2019,
    originalExists: true,
    originalTitle: "蜜蜂と遠雷",
    originalAuthor: "恩田陸",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "国際ピアノコンクールを舞台に4人のピアニストの戦いと内面を描く音楽ドラマ。松岡茉優・松坂桃李主演。直木賞・本屋大賞W受賞の原作小説。",
    searchAliases: ["恩田陸", "コンクール", "栄伝亜夜", "高島明石", "マサル"],
    adaptationNotes:
      "映画は映像と音楽で原作の世界観を再現。原作小説（上下巻）はより濃密な心理描写と音楽描写で、各ピアニストの内面と演奏が言葉で丁寧に表現されている。",
    recommendedFor:
      "映画で音楽と才能のテーマに感動した人。クラシック音楽が好きな人。文学作品として深い読書体験をしたい人。",
    workId: "0mbk7f7",
  thumbnailUrl: "https://books.google.com/books/content?id=eGNVygEACAAJ&printsec=frontcover&img=1&zoom=1&imgtk=AFLRE71Xczj0OwjZZ7VEr0_Q5-Ty6BIbIAVVbQAbtbz8lu4HAJJR4MuWLJwYC67QZgqcMBDFZswn_C9ENEuR92VPx8i2DiKsouOfxup6jSwmN0tFCT1o3jlZxfdLsEX1twum64j7XMfT&source=gbs_api",
  },
  {
    id: "mushoku-tensei-anime",
    mediaTitle: "無職転生 〜異世界行ったら本気だす〜",
    mediaType: "anime",
    mediaYear: 2021,
    originalExists: true,
    originalTitle: "無職転生 〜異世界行ったら本気だす〜",
    originalAuthor: "理不尽な孫の手",
    originalType: "novel",
    adaptationLabel: "アニメ化",
    description:
      "人生をやり直した引きこもりが異世界で真剣に生きるファンタジー。スタジオバインド制作。「なろう系」ライトノベルの最高峰と称される作品。",
    searchAliases: ["理不尽な孫の手", "ルーデウス", "シルフィ", "無職転生"],
    adaptationNotes:
      "アニメの作画クオリティが高く評価されている。原作小説（全26巻完結）は心理描写と世界設定の緻密さが際立っており、アニメより深い没入感がある。",
    recommendedFor:
      "アニメで異世界ファンタジーの丁寧な世界観に惹かれた人。人生やり直し・成長テーマが好きな人。",
    workId: "00ge48i",
  thumbnailUrl: "https://books.google.com/books/content?id=4L8czgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "tsumi-no-koe",
    mediaTitle: "罪の声",
    mediaType: "movie",
    mediaYear: 2020,
    originalExists: true,
    originalTitle: "罪の声",
    originalAuthor: "塩田武士",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "昭和最大の未解決事件「グリコ・森永事件」を題材にした社会派ミステリー。小栗旬・星野源主演。著者・塩田武士による徹底取材を基にした小説。",
    searchAliases: ["塩田武士", "グリコ森永事件", "曽根俊也", "阿久津英士"],
    adaptationNotes:
      "映画は原作のエッセンスをよく凝縮。原作小説はジャーナリズムと家族の痛みを二軸で丁寧に描いており、映画より事件の詳細と登場人物の葛藤が深く描かれる。",
    recommendedFor:
      "映画で昭和の未解決事件ミステリーに引き込まれた人。実際の事件を基にした社会派小説が好きな人。",
    workId: "0ar8707",
  thumbnailUrl: "https://books.google.com/books/content?id=bI3mxQEACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "drive-my-car",
    mediaTitle: "ドライブ・マイ・カー",
    mediaType: "movie",
    mediaYear: 2021,
    originalExists: true,
    originalTitle: "ドライブ・マイ・カー",
    originalAuthor: "村上春樹",
    originalType: "novel",
    adaptationLabel: "映画化",
    description:
      "妻を失った舞台俳優と寡黙なドライバーの旅を描く濱口竜介監督作品。西島秀俊主演。アカデミー賞国際長編映画賞受賞。原作は短編小説集収録作品。",
    searchAliases: ["村上春樹", "濱口竜介", "家福悠介", "チェーホフ", "女のいない男たち"],
    adaptationNotes:
      "映画は約3時間の大作で原作の世界を大幅に拡張・映像化。原作は「女のいない男たち」に収録の短編で、映画とは異なる凝縮された文体で読める。",
    recommendedFor:
      "映画の静かで深い余韻が忘れられない人。村上春樹の原作短編と映画の差異を楽しみたい人。",
    workId: "11fitjc",
  thumbnailUrl: "https://books.google.com/books/content?id=gdDWoAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "danmachi-anime",
    mediaTitle: "ダンジョンに出会いを求めるのは間違っているだろうか",
    mediaType: "anime",
    mediaYear: 2015,
    originalExists: true,
    originalTitle: "ダンジョンに出会いを求めるのは間違っているだろうか",
    originalAuthor: "大森藤ノ",
    originalType: "novel",
    adaptationLabel: "アニメ化",
    description:
      "異世界の迷宮都市で冒険者として成長する少年の物語。J.C.STAFF制作。GA文庫のライトノベルシリーズが原作。「ダンまち」の略称で親しまれる。",
    searchAliases: ["大森藤ノ", "ベル", "ヘスティア", "ダンまち", "迷宮"],
    adaptationNotes:
      "アニメは各シーズンで原作の各巻に対応して映像化。ライトノベル原作（既刊20巻超）はアニメよりもキャラクターの内面と世界観の設定が詳細。",
    recommendedFor:
      "アニメで成長系ファンタジーの世界観にハマった人。ダンジョン探索と神様コミュニティという設定が好きな人。",
    workId: "0ecjsmn",
  thumbnailUrl: "https://books.google.com/books/content?id=JIbnnAAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "yuru-camp-anime",
    mediaTitle: "ゆるキャン△",
    mediaType: "anime",
    mediaYear: 2018,
    originalExists: true,
    originalTitle: "ゆるキャン△",
    originalAuthor: "あfろ",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "女子高生たちのキャンプライフを描く癒し系アウトドア漫画のアニメ版。C-Station制作。月刊ComicFuz連載。キャンプブームに火をつけた作品。",
    searchAliases: ["あfろ", "リン", "なでしこ", "野外活動サークル", "キャンプ"],
    adaptationNotes:
      "アニメは原作の雰囲気を忠実に再現した高評価作。漫画はキャンプの実用情報も豊富で、アニメよりも各キャラクターの成長がゆっくり丁寧に描かれる。",
    recommendedFor:
      "アニメで癒しとキャンプの魅力を感じた人。アウトドア好き・ソロ活動好きの人に特にお薦め。",
    workId: "02ro5k9",
  thumbnailUrl: "https://books.google.com/books/content?id=gVfuEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },

  // ── 2020年代 ─────────────────────────────────────────────────────

  {
    id: "got-overseas",
    mediaTitle: "ゲーム・オブ・スローンズ",
    mediaType: "overseas",
    mediaYear: 2011,
    originalExists: true,
    originalTitle: "氷と炎の歌",
    originalAuthor: "ジョージ・R・R・マーティン",
    originalType: "novel",
    adaptationLabel: "HBOドラマ化（海外）",
    description:
      "王座を巡る貴族たちの血みどろの権力争いを描くファンタジー大作。HBOドラマ。シーズン8まで放送。世界中で大ヒットし現代ファンタジーの金字塔に。",
    searchAliases: ["ゲームオブスローンズ", "マーティン", "ウェスタロス", "ドラゴン", "ラニスター"],
    adaptationNotes:
      "ドラマはシーズン5まで概ね原作に沿い、シーズン6以降は未完の原作を先行して独自に展開。原作（5部作・未完）はより複雑な政治描写と視点が多い。",
    recommendedFor:
      "ドラマで壮大な権力ゲームの世界観に引き込まれた人。西洋ファンタジーの大作小説を原文・翻訳で読みたい人。",
    workId: "1m7e2ww",
  thumbnailUrl: "https://books.google.com/books/content?id=BI11QgAACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "sherlock-bbc",
    mediaTitle: "SHERLOCK（BBC）",
    mediaType: "overseas",
    mediaYear: 2010,
    originalExists: true,
    originalTitle: "シャーロック・ホームズ",
    originalAuthor: "アーサー・コナン・ドイル",
    originalType: "novel",
    adaptationLabel: "BBCドラマ化（海外）",
    description:
      "シャーロック・ホームズを現代ロンドンに置き換えたBBCドラマ。ベネディクト・カンバーバッチ主演。原作の名探偵を現代的に大胆リブート。",
    searchAliases: ["ホームズ", "ワトソン", "コナン・ドイル", "BBC", "カンバーバッチ"],
    adaptationNotes:
      "ドラマは原作の事件を現代版にアレンジしており、原作既読者には「元ネタ探し」も楽しめる。原作短編集は本格ミステリーの祖として現代でも色褪せない面白さ。",
    recommendedFor:
      "ドラマで頭脳明晰なホームズのキャラクターに惹かれた人。古典ミステリーを楽しみたい人。",
    workId: "0hnqg2i",
  thumbnailUrl: "https://books.google.com/books/content?id=6e3KAwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },

  // ── 2015–2025 ───────────────────────────────────────────────────

  {
    id: "nigeru-wa-haji",
    mediaTitle: "逃げるは恥だが役に立つ",
    mediaType: "drama",
    mediaYear: 2016,
    originalExists: true,
    originalTitle: "逃げるは恥だが役に立つ",
    originalAuthor: "海野つなみ",
    originalType: "manga",
    adaptationLabel: "テレビドラマ化",
    description:
      "契約結婚から始まる恋愛コメディ。TBS系。星野源・新垣結衣主演。「恋ダンス」が社会現象に。Kiss連載漫画が原作。",
    searchAliases: ["にげはじ", "海野つなみ", "ガッキー", "星野源", "みくり"],
    adaptationNotes:
      "ドラマはほぼ原作に忠実だが、職場での男女格差・経済格差のテーマを現代的に強調している。原作漫画はドラマ後半の展開もさらに続く。",
    recommendedFor:
      "ドラマで「働き方」や「生き方」を考えさせられた人。ラブコメと社会派テーマを同時に楽しみたい人。",
    workId: "1foo4fe",
  thumbnailUrl: "https://books.google.com/books/content?id=V9c_DgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "kounotori",
    mediaTitle: "コウノドリ",
    mediaType: "drama",
    mediaYear: 2015,
    originalExists: true,
    originalTitle: "コウノドリ",
    originalAuthor: "鈴ノ木ユウ",
    originalType: "manga",
    adaptationLabel: "テレビドラマ化",
    description:
      "産婦人科医が主人公の医療ドラマ。TBS系。綾野剛主演。出産・命・家族の葛藤をリアルに描く。週刊モーニング連載漫画が原作。",
    searchAliases: ["鈴ノ木ユウ", "産婦人科", "コウノドリ"],
    adaptationNotes:
      "ドラマは原作のエピソードをほぼ忠実に映像化。漫画は産科医療の倫理的問題をより深く掘り下げており、医療従事者にも高く評価されている。",
    recommendedFor:
      "命の誕生と医療の現実に関心がある人。感動的な医療ドラマを探している人。",
    workId: "1vrawnp",
  thumbnailUrl: "https://books.google.com/books/content?id=HIE-DwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "rikuo-drama",
    mediaTitle: "陸王",
    mediaType: "drama",
    mediaYear: 2017,
    originalExists: true,
    originalTitle: "陸王",
    originalAuthor: "池井戸潤",
    originalType: "novel",
    adaptationLabel: "テレビドラマ化",
    description:
      "足袋製造の老舗中小企業がランニングシューズ開発に挑む物語。TBS系。役所広司主演。直木賞作家・池井戸潤の原作小説。",
    searchAliases: ["池井戸潤", "ランニングシューズ", "陸王"],
    adaptationNotes:
      "ドラマは原作のストーリーラインを忠実に追いながらも、キャラクターの描写を若干変更。ものづくりと組織の葛藤は原作でより深く描かれる。",
    recommendedFor:
      "ドラマで熱い展開に感動した人。中小企業の奮闘を描く経済小説が好きな人。",
    workId: "1ycw3o9",
  thumbnailUrl: "https://books.google.com/books/content?id=GWLvxgEACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "mystery-to-iu-nakare",
    mediaTitle: "ミステリと言う勿れ",
    mediaType: "drama",
    mediaYear: 2022,
    originalExists: true,
    originalTitle: "ミステリと言う勿れ",
    originalAuthor: "田村由美",
    originalType: "manga",
    adaptationLabel: "テレビドラマ化",
    description:
      "独特の語り口と鋭い観察眼を持つ青年・久能整が事件に巻き込まれるミステリー。フジテレビ系。菅田将暉主演。",
    searchAliases: ["田村由美", "久能整", "ミステリ言う勿れ"],
    adaptationNotes:
      "ドラマは原作の代表的なエピソードをよく再現。漫画は既刊20巻超で、ドラマ化されていない事件やキャラクターの深掘りが続く。",
    recommendedFor:
      "ドラマで久能整のセリフに共感した人。社会問題・哲学的テーマを絡めたミステリーが好きな人。",
    workId: "0436z1i",
  thumbnailUrl: "https://books.google.com/books/content?id=RpiiswEACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "kingdom-movie",
    mediaTitle: "キングダム",
    mediaType: "movie",
    mediaYear: 2019,
    originalExists: true,
    originalTitle: "キングダム",
    originalAuthor: "原泰久",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "中国春秋戦国時代を舞台にした歴史漫画の実写映画版。山崎賢人・吉沢亮主演。シリーズ累計1億部超の人気漫画。",
    searchAliases: ["原泰久", "信", "嬴政", "春秋戦国"],
    adaptationNotes:
      "映画は原作序盤のアーク（山の民）を圧縮して映像化。漫画はより壮大なスケールで長期連載が続いており、映画よりはるかに多くの戦略・人物が描かれる。",
    recommendedFor:
      "映画でスケールの大きさに引かれた人。歴史・戦略漫画の大作を読みたい人。",
    workId: "0u6ruh5",
  thumbnailUrl: "https://books.google.com/books/content?id=bCXKCwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "tonde-saitama",
    mediaTitle: "翔んで埼玉",
    mediaType: "movie",
    mediaYear: 2019,
    originalExists: true,
    originalTitle: "翔んで埼玉",
    originalAuthor: "魔夜峰央",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "埼玉県民への壮大なディスりギャグ漫画の実写映画版。GACKT・二階堂ふみ主演。興収37億円超の大ヒット。",
    searchAliases: ["魔夜峰央", "さいたま", "翔んで埼玉"],
    adaptationNotes:
      "映画は原作の設定・世界観を膨らませてオリジナルストーリーを加えた作品。原作漫画は1982年連載の短編で、映画のほうがボリュームが多い。",
    recommendedFor:
      "映画で爆笑した人。ギャグ・パロディ漫画の元祖を読んでみたい人。",
    workId: "07f06ti",
  thumbnailUrl: "https://books.google.com/books/content?id=wVOVjwEACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "tokyo-revengers-movie",
    mediaTitle: "東京リベンジャーズ",
    mediaType: "movie",
    mediaYear: 2021,
    originalExists: true,
    originalTitle: "東京卍リベンジャーズ",
    originalAuthor: "和久井健",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "タイムリープで過去に戻り悪の組織を変えようとする青春ヤンキーアクション。北村匠海主演。週刊少年マガジン連載。",
    searchAliases: ["和久井健", "東リベ", "マイキー", "タケミチ"],
    adaptationNotes:
      "映画は原作序盤の東京卍會との戦いを中心に構成。原作漫画（全31巻）はタイムリープと複雑な組織の因果関係がより詳細に描かれる。",
    recommendedFor:
      "映画でタイムリープと友情の物語にハマった人。ヤンキー漫画×サスペンスが好きな人。",
    workId: "0sz79up",
  thumbnailUrl: "https://books.google.com/books/content?id=A5_XtAEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "tenki-no-ko",
    mediaTitle: "天気の子",
    mediaType: "movie",
    mediaYear: 2019,
    originalExists: true,
    originalTitle: "天気の子",
    originalAuthor: "新海誠",
    originalType: "novel",
    adaptationLabel: "映画→ノベライズ",
    description:
      "家出少年と「晴れ女」の少女の出会いを描く新海誠監督作品。国内興収142億円超。映画公開と同時にノベライズが刊行。",
    searchAliases: ["新海誠", "天気の子", "ほだか", "ひな"],
    adaptationNotes:
      "小説は映画と同内容だが、帆高・陽菜それぞれの視点から語られる心理描写が丁寧に補完されている。映画後に読むと世界観がより深まる。",
    recommendedFor:
      "映画の余韻に浸りたい人。君の名は。を楽しんだ人。新海誠の世界観を活字で体験したい人。",
    workId: "1ytttd6",
  thumbnailUrl: "https://books.google.com/books/content?id=6SkvyQEACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "slam-dunk-movie",
    mediaTitle: "THE FIRST SLAM DUNK",
    mediaType: "movie",
    mediaYear: 2022,
    originalExists: true,
    originalTitle: "SLAM DUNK",
    originalAuthor: "井上雄彦",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "伝説のバスケ漫画を原作者・井上雄彦自身が監督した劇場版。国内興収159億円超の大ヒット。週刊少年ジャンプの名作が原作。",
    searchAliases: ["スラムダンク", "井上雄彦", "桜木花道", "流川楓"],
    adaptationNotes:
      "映画はリョータを主人公に山王戦を描くオリジナル視点の構成。原作漫画（全31巻）は桜木を主人公に湘北の成長を全体通して描く。どちらから入っても楽しめる。",
    recommendedFor:
      "映画で感動した人・ドリブルのシーンが忘れられない人。青春バスケ漫画の金字塔を読みたい人。",
    workId: "15ther4",
  thumbnailUrl: "https://books.google.com/books/content?id=aRhXygEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "suzume",
    mediaTitle: "すずめの戸締まり",
    mediaType: "movie",
    mediaYear: 2022,
    originalExists: true,
    originalTitle: "すずめの戸締まり",
    originalAuthor: "新海誠",
    originalType: "novel",
    adaptationLabel: "映画→ノベライズ",
    description:
      "日本各地の「廃墟の扉」を閉めて回る少女の旅を描く新海誠監督作品。国内興収149億円超。映画公開と同時にノベライズが刊行。",
    searchAliases: ["新海誠", "すずめの戸締まり", "宗像草太"],
    adaptationNotes:
      "小説では映画で語られない登場人物の背景・内面が丁寧に補完されている。災害・記憶・復興のテーマが活字でより深く感じられる。",
    recommendedFor:
      "映画の余韻を大切にしたい人。東日本大震災と記憶というテーマに向き合いたい人。",
    workId: "053jq1a",
  thumbnailUrl: "https://books.google.com/books/content?id=1QgN0AEACAAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "blue-giant-movie",
    mediaTitle: "BLUE GIANT",
    mediaType: "movie",
    mediaYear: 2023,
    originalExists: true,
    originalTitle: "BLUE GIANT",
    originalAuthor: "石塚真一",
    originalType: "manga",
    adaptationLabel: "映画化",
    description:
      "東北出身の青年がジャズサックスで世界を目指す青春音楽漫画の映画版。ビッグコミック連載。音楽制作に上原ひろみが参加。",
    searchAliases: ["石塚真一", "ジャズ", "サックス", "大"],
    adaptationNotes:
      "映画は原作の「東京編」を中心に再構成。漫画シリーズはヨーロッパ・アメリカ編へと続いており、ジャズを軸にした成長の物語がさらに広がる。",
    recommendedFor:
      "映画の演奏シーンに心を動かされた人。音楽・ジャズに興味を持った人。青春と挑戦の物語が好きな人。",
    workId: "1n6ojyj",
  thumbnailUrl: "https://books.google.com/books/content?id=ia_6CgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "jujutsu-kaisen-anime",
    mediaTitle: "呪術廻戦",
    mediaType: "anime",
    mediaYear: 2020,
    originalExists: true,
    originalTitle: "呪術廻戦",
    originalAuthor: "芥見下々",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "呪霊と戦う呪術師たちを描くダークファンタジーアクション。MAPPA制作。週刊少年ジャンプ連載。劇場版・第2期も大ヒット。",
    searchAliases: ["じゅじゅつかいせん", "芥見下々", "虎杖悠仁", "五条悟"],
    adaptationNotes:
      "アニメは原作に忠実で、映像・音楽のクオリティが特に高く評価される。漫画は全26巻で完結。渋谷事変以降の展開がアニメ第2期・3期で映像化されている。",
    recommendedFor:
      "アニメで世界観に引き込まれた人。バトルと哲学的テーマが融合した漫画が好きな人。",
    workId: "1er2ue6",
  thumbnailUrl: "https://books.google.com/books/content?id=XhvH0QEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "spy-family-anime",
    mediaTitle: "SPY×FAMILY",
    mediaType: "anime",
    mediaYear: 2022,
    originalExists: true,
    originalTitle: "SPY×FAMILY",
    originalAuthor: "遠藤達哉",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "スパイ・殺し屋・超能力者の三人が偽家族を演じるコメディ。WIT STUDIO×CloverWorks制作。少年ジャンプ＋連載。",
    searchAliases: ["スパイファミリー", "遠藤達哉", "ロイド", "アーニャ", "ヨル"],
    adaptationNotes:
      "アニメは原作に忠実で、アーニャのリアクション演技が特に人気。漫画は最新話まで連載中でアニメ未収録の展開が続く。",
    recommendedFor:
      "アニメで笑いと感動を味わった人。スパイアクション×家族コメディという組み合わせが好きな人。",
    workId: "1r7geub",
  thumbnailUrl: "https://books.google.com/books/content?id=0dSZDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "chainsaw-man-anime",
    mediaTitle: "チェンソーマン",
    mediaType: "anime",
    mediaYear: 2022,
    originalExists: true,
    originalTitle: "チェンソーマン",
    originalAuthor: "藤本タツキ",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "チェンソーの悪魔と合体した少年・デンジが悪魔狩りをするダークアクション。MAPPA制作。週刊少年ジャンプ連載。",
    searchAliases: ["藤本タツキ", "デンジ", "パワー", "マキマ"],
    adaptationNotes:
      "アニメはPART1（公安編）を映像化。映像・音楽の演出が高く評価されるが、漫画PART2（学校編）はまだアニメ化されておらず原作でしか読めない。",
    recommendedFor:
      "アニメの独特な演出と世界観にハマった人。不条理・バイオレンス系の漫画が好きな人。",
    workId: "04hn7u2",
  thumbnailUrl: "https://books.google.com/books/publisher/content?id=NyOEDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&imgtk=AFLRE73HQcUg7k2hy6mBM4ztXIPmJP450vFE73Mw21xeOJIQG_dEenybCegvoDyhoO5qDc6T1O8REj88_3p6oRmuPkDoW1JEoSR77sUjT9I6jdXxCXxJYF7v8xe3zVzSohnGtWSB-WJT&source=gbs_api",
  },
  {
    id: "blue-lock-anime",
    mediaTitle: "ブルーロック",
    mediaType: "anime",
    mediaYear: 2022,
    originalExists: true,
    originalTitle: "ブルーロック",
    originalAuthor: "金城宗幸",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "日本最高のストライカーを育てる極限サバイバルサッカー漫画のアニメ版。週刊少年マガジン連載。シリーズ累計3000万部超。",
    searchAliases: ["金城宗幸", "ブルーロック", "潔世一", "サッカー"],
    adaptationNotes:
      "アニメは原作の前半（ブルーロック施設編）を映像化。漫画は欧州リーグ編へと展開が続いており、アニメよりさらに先の物語が読める。",
    recommendedFor:
      "アニメで極限の競争と才能の物語にハマった人。スポーツ漫画で心理戦・個人主義テーマが好きな人。",
    workId: "156varz",
  thumbnailUrl: "https://books.google.com/books/content?id=5Ft2DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "frieren-anime",
    mediaTitle: "葬送のフリーレン",
    mediaType: "anime",
    mediaYear: 2023,
    originalExists: true,
    originalTitle: "葬送のフリーレン",
    originalAuthor: "山田鐘人",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "魔王討伐後の世界を旅するエルフの魔法使いを描くファンタジー。Madhouse制作。週刊少年サンデー連載。アニメ賞多数受賞。",
    searchAliases: ["山田鐘人", "フリーレン", "ヒンメル", "エルフ"],
    adaptationNotes:
      "アニメは原作に非常に忠実で、作画・音楽のクオリティが特に高い。漫画は連載継続中でアニメ第2期以降の展開が原作で先行している。",
    recommendedFor:
      "アニメで「時間・別れ・人の営み」というテーマに心打たれた人。ファンタジーを哲学的視点で楽しみたい人。",
    workId: "154nqi5",
  thumbnailUrl: "https://books.google.com/books/content?id=jJnjzQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "kusuriya-anime",
    mediaTitle: "薬屋のひとりごと",
    mediaType: "anime",
    mediaYear: 2023,
    originalExists: true,
    originalTitle: "薬屋のひとりごと",
    originalAuthor: "日向夏",
    originalType: "novel",
    adaptationLabel: "アニメ化",
    description:
      "後宮を舞台に薬師の少女・猫猫が謎を解くミステリー。OLM/TOHO Animation制作。小説・漫画（2種類の漫画版）が原作。",
    searchAliases: ["日向夏", "猫猫", "壬氏", "後宮"],
    adaptationNotes:
      "アニメは漫画版（ビッグガンガン連載）を主に参考に映像化。ライトノベル原作はより文章的な情報密度が高く、後宮の政治背景が詳細。",
    recommendedFor:
      "アニメで後宮ミステリーの世界観に引き込まれた人。中華風ファンタジーと謎解きが好きな人。",
    workId: "0g6vt24",
  thumbnailUrl: "https://books.google.com/books/content?id=7C_GDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
  },
  {
    id: "kaiju-8-anime",
    mediaTitle: "怪獣8号",
    mediaType: "anime",
    mediaYear: 2024,
    originalExists: true,
    originalTitle: "怪獣8号",
    originalAuthor: "松本直也",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "怪獣に変身できる青年が防衛隊員を目指すアクション漫画のアニメ版。Production I.G制作。少年ジャンプ＋連載。",
    searchAliases: ["松本直也", "怪獣8号", "日比野化", "防衛隊"],
    adaptationNotes:
      "アニメは原作の前半を忠実に映像化。漫画は連載継続中でアニメ未収録の展開が読める。",
    recommendedFor:
      "アニメで怪獣×人間ドラマの組み合わせにハマった人。努力と成長のバトル漫画が好きな人。",
    workId: "08tvese",
  thumbnailUrl: "https://books.google.com/books/content?id=jRgFEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "one-piece-netflix",
    mediaTitle: "ONE PIECE（Netflix実写版）",
    mediaType: "overseas",
    mediaYear: 2023,
    originalExists: true,
    originalTitle: "ONE PIECE",
    originalAuthor: "尾田栄一郎",
    originalType: "manga",
    adaptationLabel: "Netflix実写化",
    description:
      "世界累計5億部超の海賊冒険漫画のNetflixオリジナル実写ドラマ。東バラジ・マガスハキ主演。シーズン1は東の海編を映像化。",
    searchAliases: ["ワンピース", "尾田栄一郎", "ルフィ", "麦わらの一味"],
    adaptationNotes:
      "実写版は原作の大ファンである尾田栄一郎が制作に深く関与しており、原作へのリスペクトが高く評価されている。原作漫画は1000話超の大作。",
    recommendedFor:
      "実写版から原作に興味を持った人。冒険・仲間・意志のテーマが好きな人。",
    workId: "0cb8t8s",
  thumbnailUrl: "https://books.google.com/books/content?id=9ca7CwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "santi-netflix",
    mediaTitle: "三体",
    mediaType: "overseas",
    mediaYear: 2024,
    originalExists: true,
    originalTitle: "三体",
    originalAuthor: "劉慈欣",
    originalType: "novel",
    adaptationLabel: "Netflix実写化",
    description:
      "中国SFの金字塔をNetflixが実写ドラマ化。文化大革命から始まる壮大なファーストコンタクト物語。ヒューゴー賞受賞の原作小説。",
    searchAliases: ["リュウジキン", "さんたい", "ファーストコンタクト", "SF"],
    adaptationNotes:
      "Netflix版は舞台を現代のイギリスに変更しているが、物語の核心は忠実に再現。小説の三部作（三体・黒暗森林・死神永生）は膨大なスケールのSF叙事詩。",
    recommendedFor:
      "ドラマでスケールの大きさに圧倒された人。ハードSFの最高峰に挑戦したい人。",
    workId: "0w8wdw1",
  thumbnailUrl: "https://books.google.com/books/content?id=BZV9zgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
  },
  {
    id: "blue-period-anime",
    mediaTitle: "ブルーピリオド",
    mediaType: "anime",
    mediaYear: 2021,
    originalExists: true,
    originalTitle: "ブルーピリオド",
    originalAuthor: "山口つばさ",
    originalType: "manga",
    adaptationLabel: "アニメ化",
    description:
      "成績優秀なリア充が美術に目覚め東京藝大を目指す青春漫画のアニメ版。月刊アフタヌーン連載。アニメーション制作：七緒。",
    searchAliases: ["山口つばさ", "矢口八虎", "東京藝大", "美術"],
    adaptationNotes:
      "アニメは原作の藝大受験まで（序盤）を映像化。漫画は入学後の苦悩・成長・アイデンティティの模索が続いており、アニメよりはるかに長い。",
    recommendedFor:
      "アニメで「なぜ絵を描くのか」という問いに共感した人。芸術・創作・自己表現をテーマにした漫画が好きな人。",
    workId: "0295sk0",
  thumbnailUrl: "https://books.google.com/books/content?id=W8qGswEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api",
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
  "鬼滅の刃",
  "呪術廻戦",
  "SPY×FAMILY",
  "葬送のフリーレン",
  "君の名は。",
  "半沢直樹",
  "逃げるは恥",
  "キングダム",
  "SLAM DUNK",
  "チェンソーマン",
  "三体",
  "ガリレオ",
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
