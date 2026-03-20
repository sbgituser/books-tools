#!/usr/bin/env tsx
/**
 * generate-discover-curated.ts
 *
 * 発見ムードの候補集合に対して生成AIで選書を行い、本番表示用JSONを生成する。
 *
 * 入力:
 *   data/discover-candidates/{slug}.json  (generate-discover-candidates.ts の出力)
 *
 * 出力:
 *   data/discover-curated/{slug}.json     (git管理・本番表示用)
 *   → prebuild で public/data/discover-curated/ にコピーされる
 *
 * 前提:
 *   環境変数 ANTHROPIC_API_KEY が設定されていること
 *
 * 使い方:
 *   npm run generate:discover-curated
 *   npm run generate:discover-curated -- --mood emotional   # 特定ムードのみ
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { DISCOVER_MOODS } from "../src/constants/discoverMoods.js";
import type {
  DiscoverCandidates,
  DiscoverCurated,
  DiscoverCuratedSection,
  DiscoverCuratedItem,
} from "../src/types/discover-curated.js";

// ── 環境変数 ──────────────────────────────────────────────────────
{
  const envPath = join(process.cwd(), "scripts", ".env");
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  }
}

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("❌ ANTHROPIC_API_KEY が設定されていません。");
  console.error("   scripts/.env または OS 環境変数に ANTHROPIC_API_KEY=sk-ant-... を設定してください。");
  process.exit(1);
}

// ── パス設定 ──────────────────────────────────────────────────────
const ROOT = process.cwd();
const CANDIDATES_DIR = join(ROOT, "data", "discover-candidates");
const CURATED_DIR = join(ROOT, "data", "discover-curated");
mkdirSync(CURATED_DIR, { recursive: true });

// ── CLI オプション ────────────────────────────────────────────────
const targetSlug = (() => {
  const idx = process.argv.indexOf("--mood");
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const moods = targetSlug
  ? DISCOVER_MOODS.filter((m) => m.slug === targetSlug)
  : DISCOVER_MOODS;

if (moods.length === 0) {
  console.error(`❌ ムード "${targetSlug}" が見つかりません`);
  process.exit(1);
}

// ── ムードごとの選書観点 ──────────────────────────────────────────
const MOOD_CRITERIA: Record<string, string> = {
  emotional: `
- 読み手の感情を動かす力がある
- 登場人物への感情移入がしやすい
- 泣ける、切ない、感動できる、あるいは心が温まる要素がある
- 読後に「何か残る」感覚を与える`,

  think: `
- 読後に余韻や思考が続く
- テーマ・メッセージ・問いかけを持っている
- 社会・人間・人生について何かを考えさせる
- ただの娯楽以上の「重さ」や「奥行き」がある`,

  binge: `
- 続きが気になって手が止まらない
- テンポが良く、展開が巧み
- 世界観・登場人物への興味が持続する
- 「次の巻をすぐ読みたい」と思わせる`,

  excited: `
- 読んでいると気持ちが高揚する
- アクション・スポーツ・バトルなどのエネルギーがある
- 主人公の成長や葛藤・勝利に胸が熱くなる
- 読後に前向きな気持ちになれる`,

  laugh: `
- 読んでいて自然と笑える
- 空気が明るく、テンポが軽い
- ギャグ・コメディ・ほのぼのした雰囲気がある
- 読後に気分が軽くなる`,

  dark: `
- 暗さ・重さ・不安感がある
- 人間の業・絶望・恐怖を描いている
- 「怖い」「ぞくっとする」「重い」感覚がある
- 一般的なエンタメとは一線を画す作品`,

  immerse: `
- 独自の世界観・設定が魅力的
- 読み始めたらその世界から抜け出せない
- ファンタジー・SF・歴史・異世界などの奥行きがある
- 作者が構築した世界に長く浸っていたくなる`,

  easy: `
- 肩肘張らず気軽に手が取れる
- テンポが軽く、読み疲れしない
- 日常系・ショート・読みやすい文体で書かれている
- スキマ時間でもサクッと楽しめる`,
};

// ── AI プロンプト生成 ─────────────────────────────────────────────

function buildPrompt(candidates: DiscoverCandidates): string {
  const criteria = MOOD_CRITERIA[candidates.slug] ?? "";

  const candidateLines = candidates.candidates.map((c) => {
    const attrs = c.discoveryAttributes as Record<string, unknown>;
    const parts: string[] = [
      `workId: ${c.workId}`,
      `title: 「${c.title}」`,
      `author: ${c.authorDisplay}`,
      `type: ${c.type === "manga" ? "漫画" : c.type === "novel" ? "小説" : "その他"}`,
      `volumes: ${c.volumeCount}巻`,
      `status: ${c.status === "completed" ? "完結" : c.status === "ongoing" ? "連載中" : "不明"}`,
    ];
    if (c.discoveryTags.length > 0) {
      parts.push(`tags: [${c.discoveryTags.slice(0, 6).join(", ")}]`);
    }
    if (attrs.paceTag) parts.push(`pace: ${attrs.paceTag}`);
    if (attrs.depthTag) parts.push(`depth: ${attrs.depthTag}`);
    if (attrs.recommendedFor && Array.isArray(attrs.recommendedFor)) {
      parts.push(`向き: ${(attrs.recommendedFor as string[]).slice(0, 3).join("、")}`);
    }
    return `  { ${parts.join(", ")} }`;
  });

  return `あなたは独立系書店の選書担当です。
「${candidates.label}」という気分の読者に向けて、候補リストから作品を厳選してください。

## 気分の説明
${candidates.description}

## この気分で重視する観点
${criteria}

## 候補作品（${candidates.candidateCount}件）
${candidateLines.join("\n")}

## 選書ルール
- 候補の中から10〜15件を選ぶ（多すぎず、少なすぎず）
- 同系統の作品が固まりすぎないよう、タイプや雰囲気を散らす
- 漫画と小説のバランスを考慮する（どちらかに偏りすぎない）
- 各作品に40〜100字の自然な日本語の推薦理由を書く
- 推薦理由は断定より「〇〇を楽しみたい人に」「〇〇が好きな人に」のような提案トーンで
- 2〜3のセクションに分ける（セクション名は具体的かつ自然な日本語で）
- ランキング感を出さない。書店員の推薦・提案のトーンで
- この気分への導入文を80〜120字で書く

## 出力形式
必ず以下のJSONのみを出力してください（マークダウンコードブロック不要）:
{
  "intro": "気分への導入文（80〜120字）",
  "sections": [
    {
      "title": "セクション名",
      "items": [
        { "workId": "workIdの値", "reason": "推薦理由（40〜100字）" }
      ]
    }
  ]
}`;
}

// ── Claude API 呼び出し ───────────────────────────────────────────

interface ClaudeResponse {
  intro: string;
  sections: Array<{
    title: string;
    items: Array<{ workId: string; reason: string }>;
  }>;
}

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    content: Array<{ type: string; text: string }>;
  };
  return data.content.find((b) => b.type === "text")?.text ?? "";
}

// ── レスポンス検証 ────────────────────────────────────────────────

function validateAndParse(
  raw: string,
  candidates: DiscoverCandidates,
): ClaudeResponse {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("JSON が見つかりません。レスポンス: " + raw.substring(0, 200));
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    throw new Error("JSON パースエラー: " + String(e));
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.intro !== "string" || obj.intro.trim() === "") {
    throw new Error("intro が文字列ではないか空です");
  }
  if (!Array.isArray(obj.sections) || obj.sections.length === 0) {
    throw new Error("sections が配列ではないか空です");
  }

  const candidateIds = new Set(candidates.candidates.map((c) => c.workId));
  const seenIds = new Set<string>();
  const validSections: DiscoverCuratedSection[] = [];

  for (const sec of obj.sections as unknown[]) {
    const s = sec as Record<string, unknown>;
    if (typeof s.title !== "string" || !Array.isArray(s.items)) continue;

    const validItems: DiscoverCuratedItem[] = [];
    for (const item of s.items as unknown[]) {
      const it = item as Record<string, unknown>;
      const workId = String(it.workId ?? "").trim();
      const reason = String(it.reason ?? "").trim();

      if (!workId || !reason) continue;
      if (!candidateIds.has(workId)) {
        console.warn(`  ⚠ 不明な workId をスキップ: ${workId}`);
        continue;
      }
      if (seenIds.has(workId)) continue;

      seenIds.add(workId);
      validItems.push({ workId, reason });
    }

    if (validItems.length > 0) {
      validSections.push({ title: s.title, items: validItems });
    }
  }

  const totalItems = validSections.reduce((sum, s) => sum + s.items.length, 0);
  if (totalItems < 5) {
    throw new Error(`選書数が少なすぎます（${totalItems}件）`);
  }

  return { intro: obj.intro.trim(), sections: validSections };
}

// ── メイン処理 ────────────────────────────────────────────────────

async function processMood(mood: (typeof DISCOVER_MOODS)[number]): Promise<void> {
  const candidatePath = join(CANDIDATES_DIR, `${mood.slug}.json`);
  if (!existsSync(candidatePath)) {
    console.warn(`  ⚠ 候補ファイルが見つかりません: ${candidatePath}`);
    console.warn(`    先に npm run generate:discover-candidates を実行してください`);
    return;
  }

  const candidates: DiscoverCandidates = JSON.parse(readFileSync(candidatePath, "utf-8"));
  console.log(`\n🔍 [${mood.label}] 候補 ${candidates.candidateCount} 件 → AI 選書中...`);

  const prompt = buildPrompt(candidates);

  let parsed: ClaudeResponse | undefined;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await callClaude(prompt);
      parsed = validateAndParse(raw, candidates);
      break;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.warn(`  ⚠ 試行${attempt} 失敗: ${lastError.message}`);
      if (attempt < 2) await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (!parsed) {
    console.error(`  ❌ [${mood.label}] 生成失敗: ${lastError?.message}`);
    return;
  }

  const totalSelected = parsed.sections.reduce((sum, s) => sum + s.items.length, 0);

  const output: DiscoverCurated = {
    axis: "mood",
    slug: mood.slug,
    label: mood.label,
    icon: mood.icon,
    intro: parsed.intro,
    sections: parsed.sections,
    allCount: candidates.candidateCount,
    selectedCount: totalSelected,
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(
    join(CURATED_DIR, `${mood.slug}.json`),
    JSON.stringify(output, null, 2),
    "utf-8"
  );

  console.log(`  ✓ discover-curated/${mood.slug}.json  (${totalSelected} 件選書, ${parsed.sections.length} セクション)`);
}

async function main(): Promise<void> {
  console.log(`AI選書バッチ開始 — 対象ムード: ${moods.map((m) => m.label).join(", ")}`);
  console.log(`モデル: claude-sonnet-4-6\n`);

  for (const mood of moods) {
    await processMood(mood);
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n完了。選書結果 → data/discover-curated/`);
  console.log("次のステップ: npm run build");
}

main().catch((e) => {
  console.error("予期しないエラー:", e);
  process.exit(1);
});
