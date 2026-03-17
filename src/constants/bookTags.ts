/**
 * bookTags.ts
 * 感情・目的・雰囲気タグの定数定義
 * 感情・目的ベース検索で使用するタグ体系
 */

// ── 感情タグ ─────────────────────────────────────────────────────────

export const EMOTIONAL_TAGS = [
  { id: "cry",          label: "泣ける",         icon: "😢" },
  { id: "emotional",    label: "感動",            icon: "🥺" },
  { id: "sad",          label: "切ない",          icon: "💔" },
  { id: "hot",          label: "熱い",            icon: "🔥" },
  { id: "refreshing",   label: "爽快",            icon: "⚡" },
  { id: "funny",        label: "笑える",          icon: "😄" },
  { id: "healing",      label: "癒やし",          icon: "🌿" },
  { id: "scary",        label: "怖い",            icon: "👻" },
  { id: "creepy",       label: "不気味",          icon: "🕷️" },
  { id: "hopeless",     label: "絶望",            icon: "🌑" },
  { id: "positive",     label: "前向き",          icon: "☀️" },
  { id: "heartwarming", label: "キュンとする",    icon: "💕" },
] as const;

// ── 目的タグ ─────────────────────────────────────────────────────────

export const PURPOSE_TAGS = [
  { id: "thinking",    label: "頭を使う",              icon: "🧠" },
  { id: "intellectual", label: "知的好奇心を刺激する", icon: "🔬" },
  { id: "learning",    label: "学びがある",            icon: "📚" },
  { id: "work",        label: "仕事に役立つ",          icon: "💼" },
  { id: "easy",        label: "気軽に読める",          icon: "😌" },
  { id: "binge",       label: "一気読みしやすい",      icon: "📖" },
  { id: "short",       label: "短時間で読める",        icon: "⏱️" },
  { id: "immersive",   label: "世界観に浸れる",        icon: "🌍" },
  { id: "analysis",    label: "考察したくなる",        icon: "🔍" },
  { id: "motivated",   label: "モチベーションが上がる", icon: "🚀" },
] as const;

// ── 雰囲気タグ ───────────────────────────────────────────────────────

export const ATMOSPHERE_TAGS = [
  { id: "dark",         label: "ダーク",        icon: "🌑" },
  { id: "bright",       label: "明るい",        icon: "☀️" },
  { id: "calm",         label: "静か",          icon: "🍃" },
  { id: "uneasy",       label: "不穏",          icon: "⚠️" },
  { id: "daily",        label: "日常",          icon: "🏡" },
  { id: "extraordinary", label: "非日常",       icon: "✨" },
  { id: "fantasy",      label: "幻想的",        icon: "🦄" },
  { id: "tense",        label: "緊張感がある",  icon: "⚔️" },
  { id: "gentle",       label: "優しい",        icon: "🌸" },
  { id: "profound",     label: "重厚",          icon: "🗿" },
] as const;

// ── その他フィルタ選択肢 ─────────────────────────────────────────────

export const PACE_OPTIONS = [
  { value: "早い",  label: "テンポ早め" },
  { value: "普通",  label: "普通" },
  { value: "遅い",  label: "じっくり系" },
] as const;

export const DEPTH_OPTIONS = [
  { value: "軽い",   label: "軽い" },
  { value: "中程度", label: "中程度" },
  { value: "重い",   label: "重い" },
] as const;

export const READING_EASE_OPTIONS = [
  { value: "初心者向け",    label: "初心者向け" },
  { value: "普通",          label: "普通" },
  { value: "読みごたえあり", label: "読みごたえあり" },
] as const;

export const COMPLETION_OPTIONS = [
  { value: "完結",  label: "完結済み" },
  { value: "連載中", label: "連載中" },
] as const;

export const READING_TIME_OPTIONS = [
  { value: "短め", label: "短め（3巻以内）" },
  { value: "普通", label: "普通（5〜15巻）" },
  { value: "長め", label: "長め（20巻以上）" },
] as const;

// ── 型エクスポート ───────────────────────────────────────────────────

export type EmotionalTagId    = typeof EMOTIONAL_TAGS[number]["id"];
export type PurposeTagId      = typeof PURPOSE_TAGS[number]["id"];
export type AtmosphereTagId   = typeof ATMOSPHERE_TAGS[number]["id"];
export type PaceTag           = typeof PACE_OPTIONS[number]["value"];
export type DepthTag          = typeof DEPTH_OPTIONS[number]["value"];
export type ReadingEaseTag    = typeof READING_EASE_OPTIONS[number]["value"];
export type CompletionStatus  = typeof COMPLETION_OPTIONS[number]["value"];
export type ReadingTimeCategory = typeof READING_TIME_OPTIONS[number]["value"];

// ── プリセット検索（ランディングページ用） ────────────────────────────

export interface PresetSearch {
  slug: string;
  label: string;
  description: string;
  icon: string;
  filters: {
    emotionalTags?: EmotionalTagId[];
    purposeTags?: PurposeTagId[];
    atmosphereTags?: AtmosphereTagId[];
    depthTag?: DepthTag;
    completionStatus?: CompletionStatus;
  };
}

export const PRESET_SEARCHES: PresetSearch[] = [
  {
    slug: "cry",
    label: "泣ける漫画",
    description: "感動で涙があふれる名作",
    icon: "😢",
    filters: { emotionalTags: ["cry", "emotional"] },
  },
  {
    slug: "healing",
    label: "癒やされる漫画",
    description: "ほっとする日常系・温かい作品",
    icon: "🌿",
    filters: { emotionalTags: ["healing"], atmosphereTags: ["gentle", "daily"] },
  },
  {
    slug: "thinking",
    label: "頭を使う漫画",
    description: "頭脳戦・考察要素が光るサスペンス",
    icon: "🧠",
    filters: { purposeTags: ["thinking", "analysis"] },
  },
  {
    slug: "easy",
    label: "気軽に読める漫画",
    description: "さくさく読める入門作",
    icon: "😌",
    filters: { purposeTags: ["easy", "binge"], depthTag: "軽い" },
  },
  {
    slug: "dark",
    label: "ダークな漫画",
    description: "重く深い世界観の問題作",
    icon: "🌑",
    filters: { atmosphereTags: ["dark", "uneasy"] },
  },
  {
    slug: "hot",
    label: "熱い漫画",
    description: "燃えるバトル・スポーツ・友情の名作",
    icon: "🔥",
    filters: { emotionalTags: ["hot", "refreshing"], purposeTags: ["motivated"] },
  },
  {
    slug: "heartwarming",
    label: "恋愛でキュンとする",
    description: "胸きゅん恋愛漫画",
    icon: "💕",
    filters: { emotionalTags: ["heartwarming", "sad"] },
  },
  {
    slug: "binge",
    label: "一気読みしたい",
    description: "止まらなくなる中毒性",
    icon: "📖",
    filters: { purposeTags: ["binge", "immersive"] },
  },
  {
    slug: "completed",
    label: "完結済みで安心",
    description: "最後まで読める完結作品",
    icon: "✅",
    filters: { completionStatus: "完結" },
  },
  {
    slug: "beginner",
    label: "初心者向け",
    description: "漫画入門に最適な定番作",
    icon: "🌱",
    filters: { purposeTags: ["easy"], depthTag: "軽い" },
  },
];

// ── SEO用ムードページ定義 ────────────────────────────────────────────

export interface MoodPageDef {
  slug: string;
  type: "mood" | "purpose" | "atmosphere";
  tagId: EmotionalTagId | PurposeTagId | AtmosphereTagId;
  title: string;
  description: string;
  h1: string;
}

export const MOOD_PAGE_DEFS: MoodPageDef[] = [
  {
    slug: "cry",
    type: "mood",
    tagId: "cry",
    title: "泣ける漫画おすすめ一覧 | Books Tools",
    description: "感動で涙があふれる漫画を厳選。泣けるバトル・スポーツ・恋愛・日常系まで幅広く紹介します。",
    h1: "泣ける漫画 おすすめ一覧",
  },
  {
    slug: "healing",
    type: "mood",
    tagId: "healing",
    title: "癒やされる漫画おすすめ一覧 | Books Tools",
    description: "ほっこりした気持ちになれる癒やし漫画を厳選。日常系・コメディ・ほのぼの系を中心に紹介。",
    h1: "癒やされる漫画 おすすめ一覧",
  },
  {
    slug: "hot",
    type: "mood",
    tagId: "hot",
    title: "熱い漫画おすすめ一覧 | Books Tools",
    description: "燃えるバトル漫画・スポーツ漫画・友情の名作を厳選。読むとモチベーションが上がる作品集。",
    h1: "熱い漫画 おすすめ一覧",
  },
  {
    slug: "thinking",
    type: "purpose",
    tagId: "thinking",
    title: "頭を使う漫画おすすめ一覧 | Books Tools",
    description: "頭脳戦・考察・サスペンス要素が光る漫画を厳選。読後に語りたくなる知的な作品集。",
    h1: "頭を使う漫画 おすすめ一覧",
  },
  {
    slug: "easy",
    type: "purpose",
    tagId: "easy",
    title: "気軽に読める漫画おすすめ一覧 | Books Tools",
    description: "難しいことを考えず気軽に楽しめる漫画を厳選。コメディ・日常系・短編など入門作を紹介。",
    h1: "気軽に読める漫画 おすすめ一覧",
  },
  {
    slug: "dark",
    type: "atmosphere",
    tagId: "dark",
    title: "ダークな漫画おすすめ一覧 | Books Tools",
    description: "重く暗い世界観のダーク漫画を厳選。人間の本性・絶望・サスペンスを描く問題作集。",
    h1: "ダークな漫画 おすすめ一覧",
  },
];
