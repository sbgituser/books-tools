/**
 * readingScenes.ts
 *
 * 読書シーン定義。シーンの追加はこのファイルに1エントリ追加するだけでよい。
 * generate-scenes-data.ts がこの定義を読んで静的JSONを生成する。
 */

export interface ReadingScene {
  /** URLスラッグ（/scene/{slug}） */
  slug: string;
  /** 表示ラベル */
  label: string;
  /** 絵文字アイコン */
  icon: string;
  /** 短い説明 */
  description: string;
  /** SEO: タイトルサフィックス */
  seoTitle: string;
  /** SEO: メタディスクリプション */
  seoDescription: string;

  // ── マッチングルール ──────────────────────────────────────────
  /** これらのタグのいずれかがあれば +3 */
  primaryTags: string[];
  /** これらのタグのいずれかがあれば +1（bonus） */
  bonusTags: string[];
  /** これらのタグのいずれかがあれば除外 */
  excludeTags: string[];
  /** paceTag がこのいずれかなら +1 */
  paceTags?: string[];
  /** depthTag がこのいずれかなら +1 */
  depthTags?: string[];
  /** 巻数条件（min/max）を満たせば +1 */
  volumeCountMin?: number;
  volumeCountMax?: number;
  /** 作品タイプ優先（優先するタイプがあれば +1） */
  preferredType?: "manga" | "novel";
  /** 最低スコア閾値（これ未満は除外）。デフォルト=1 */
  minScore?: number;
}

export const READING_SCENES: ReadingScene[] = [
  {
    slug: "commute",
    label: "通勤・通学",
    icon: "🚃",
    description: "電車・バスの移動中にサクッと読める",
    seoTitle: "通勤・通学に読む本",
    seoDescription: "電車やバスで読みやすい漫画・小説。テンポよく読める作品を集めました。",
    primaryTags: ["読みやすい", "一気読み", "短編", "笑える", "爽快"],
    bonusTags: ["明るい", "前向き", "日常系"],
    excludeTags: ["深い", "絶望"],
    paceTags: ["早い", "テンポ良い"],
    depthTags: ["軽い"],
    volumeCountMax: 12,
    minScore: 1,
  },
  {
    slug: "before-sleep",
    label: "寝る前",
    icon: "🌙",
    description: "就寝前にほっこり・癒やされる作品",
    seoTitle: "寝る前に読む本",
    seoDescription: "就寝前にゆったり読める癒やし系漫画・小説。穏やかな気持ちで眠れる作品。",
    primaryTags: ["癒やし", "穏やか", "優しい", "日常系", "心温まる"],
    bonusTags: ["明るい", "切ない", "感動"],
    excludeTags: ["怖い", "絶望", "ダーク", "バトル"],
    depthTags: ["軽い", "中程度"],
    preferredType: "novel",
    minScore: 1,
  },
  {
    slug: "holiday-binge",
    label: "休日に一気読み",
    icon: "📚",
    description: "休みの日にどっぷり没入して読み切る",
    seoTitle: "休日に一気読みしたい本",
    seoDescription: "休日に一気読みできる漫画・小説。世界観に没入できる長編・シリーズ作品。",
    primaryTags: ["一気読み", "世界観重視", "熱い", "バトル", "感動"],
    bonusTags: ["考えさせられる", "泣ける", "深い"],
    excludeTags: [],
    volumeCountMin: 5,
    minScore: 1,
  },
  {
    slug: "short-break",
    label: "すきま時間",
    icon: "⏱️",
    description: "5〜15分の合間にサッと読める",
    seoTitle: "すきま時間に読む本",
    seoDescription: "5〜15分のすきま時間に読める短編・軽い読み口の漫画・小説。",
    primaryTags: ["短編", "読みやすい", "笑える", "日常系"],
    bonusTags: ["明るい", "爽快", "癒やし"],
    excludeTags: ["世界観重視", "深い", "絶望"],
    paceTags: ["早い"],
    depthTags: ["軽い"],
    volumeCountMax: 5,
    minScore: 1,
  },
  {
    slug: "cafe",
    label: "カフェでゆっくり",
    icon: "☕",
    description: "カフェで落ち着いてじっくり味わえる",
    seoTitle: "カフェで読みたい本",
    seoDescription: "カフェでゆっくり楽しめる漫画・小説。雰囲気のある読書体験に。",
    primaryTags: ["穏やか", "癒やし", "日常系", "心温まる", "優しい", "感動"],
    bonusTags: ["切ない", "考えさせられる", "明るい"],
    excludeTags: ["バトル", "絶望", "怖い", "熱い"],
    depthTags: ["軽い", "中程度"],
    preferredType: "novel",
    minScore: 1,
  },
  {
    slug: "stress-relief",
    label: "ストレス解消したい",
    icon: "💪",
    description: "スカッと発散できる爽快・熱い作品",
    seoTitle: "ストレス解消になる本",
    seoDescription: "ストレス解消に効く爽快・熱い漫画・小説。読んでスカッとできる作品。",
    primaryTags: ["笑える", "爽快", "熱い", "前向き", "やる気が出る", "バトル"],
    bonusTags: ["明るい", "一気読み"],
    excludeTags: ["ダーク", "絶望", "怖い"],
    paceTags: ["早い"],
    preferredType: "manga",
    minScore: 1,
  },
  {
    slug: "calm-down",
    label: "気分を落ち着けたい",
    icon: "🍃",
    description: "心を穏やかにしてくれる癒やし系",
    seoTitle: "気分を落ち着けたいときの本",
    seoDescription: "気持ちを落ち着かせてくれる癒やし系漫画・小説。穏やかな読書体験。",
    primaryTags: ["癒やし", "優しい", "穏やか", "心温まる", "日常系"],
    bonusTags: ["感動", "泣ける", "切ない"],
    excludeTags: ["バトル", "怖い", "絶望", "ダーク"],
    depthTags: ["軽い", "中程度"],
    minScore: 1,
  },
  {
    slug: "exciting",
    label: "ワクワクしたい",
    icon: "✨",
    description: "ドキドキ・ワクワクが止まらない作品",
    seoTitle: "ワクワクする本",
    seoDescription: "ワクワクが止まらない冒険・熱い展開の漫画・小説。読み始めたら止まらない。",
    primaryTags: ["熱い", "爽快", "バトル", "ファンタジー", "やる気が出る", "世界観重視", "一気読み"],
    bonusTags: ["明るい", "前向き", "感動"],
    excludeTags: ["絶望"],
    paceTags: ["早い"],
    preferredType: "manga",
    minScore: 1,
  },
  {
    slug: "think-deeply",
    label: "考えたい",
    icon: "🧠",
    description: "読み終わった後も考え続けてしまう作品",
    seoTitle: "考えさせられる本",
    seoDescription: "読後に深く考えさせられる漫画・小説。哲学・ミステリー・人間ドラマ系。",
    primaryTags: ["考えさせられる", "深い", "学べる", "世界観重視", "ダーク"],
    bonusTags: ["感動", "泣ける", "絶望", "切ない"],
    excludeTags: ["笑える"],
    depthTags: ["重い", "中程度"],
    preferredType: "novel",
    minScore: 1,
  },
];

/** slug → ReadingScene のマップ */
export const SCENE_MAP = new Map<string, ReadingScene>(
  READING_SCENES.map((s) => [s.slug, s])
);
