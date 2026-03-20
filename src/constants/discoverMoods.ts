/**
 * discoverMoods.ts
 *
 * 「発見する」ページで使用するムード（ユーザーの読書意図）定義。
 * 技術的なタグではなく、ユーザーが自然に感じる「今の気分」を表す。
 *
 * 各ムードは discovery-index.json の discoveryTags に対応している。
 */

export interface DiscoverMoodDef {
  /** URLスラグ（例: "emotional"） */
  slug: string;
  /** 表示ラベル（例: "感動したい"） */
  label: string;
  /** アイコン絵文字 */
  icon: string;
  /** サブ説明文 */
  description: string;
  /**
   * このムードに対応する discoveryTags（複数可）。
   * 候補抽出時にいずれかに一致する作品を集める。
   */
  tags: string[];
  /**
   * タグのスコア重みづけ（tags の順に対応）。
   * 省略した場合はすべて 1。
   */
  tagWeights?: number[];
}

export const DISCOVER_MOODS: DiscoverMoodDef[] = [
  {
    slug: "emotional",
    label: "感動したい",
    icon: "😢",
    description: "心に響く、じんとくる作品を",
    tags: ["感動", "泣ける", "切ない", "心温まる"],
    tagWeights: [3, 3, 2, 2],
  },
  {
    slug: "think",
    label: "深く考えたい",
    icon: "🧠",
    description: "読後も頭に残るテーマ・思考の作品を",
    tags: ["考えさせられる", "深い", "学べる"],
    tagWeights: [3, 2, 1],
  },
  {
    slug: "binge",
    label: "一気読みしたい",
    icon: "📖",
    description: "止まれない、続きが気になる作品を",
    tags: ["一気読み", "世界観重視"],
    tagWeights: [3, 2],
  },
  {
    slug: "excited",
    label: "熱くなりたい",
    icon: "🔥",
    description: "燃えられる・爽快感のある作品を",
    tags: ["熱い", "爽快", "バトル", "やる気が出る", "前向き"],
    tagWeights: [3, 2, 2, 1, 1],
  },
  {
    slug: "laugh",
    label: "笑いたい",
    icon: "😄",
    description: "クスッと笑える、明るい気分になれる作品を",
    tags: ["笑える", "明るい", "日常系"],
    tagWeights: [3, 2, 1],
  },
  {
    slug: "dark",
    label: "ダークな世界を覗きたい",
    icon: "🌑",
    description: "重く・暗く・ぞくりとする作品を",
    tags: ["ダーク", "怖い", "絶望", "深い"],
    tagWeights: [3, 2, 2, 1],
  },
  {
    slug: "immerse",
    label: "世界観に浸りたい",
    icon: "🌍",
    description: "独自の世界観・設定に引き込まれる作品を",
    tags: ["世界観重視", "ファンタジー", "深い"],
    tagWeights: [3, 2, 1],
  },
  {
    slug: "easy",
    label: "気軽に読みたい",
    icon: "😌",
    description: "肩肘張らず、サクッと読める作品を",
    tags: ["読みやすい", "明るい", "日常系", "短編"],
    tagWeights: [3, 2, 2, 1],
  },
];
