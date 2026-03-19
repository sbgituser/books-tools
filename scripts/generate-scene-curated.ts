#!/usr/bin/env tsx
/**
 * generate-scene-curated.ts
 *
 * シーン候補集合に対して生成AIで選書を行い、本番表示用JSONを生成する。
 *
 * 入力:
 *   data/scene-candidates/{slug}.json  (generate-scene-candidates.ts の出力)
 *
 * 出力:
 *   public/data/scene-curated/{slug}.json  (本番表示用)
 *
 * 前提:
 *   環境変数 ANTHROPIC_API_KEY が設定されていること
 *   scripts/.env または OS の環境変数として設定する
 *
 * 使い方:
 *   npm run generate:curated
 *   npm run generate:curated -- --scene commute    # 特定シーンのみ
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { READING_SCENES } from "../src/constants/readingScenes.js";
import type { SceneCandidates, SceneCandidateItem, SceneCurated, CuratedSection, CuratedItem } from "../src/types/scene-curated.js";

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
const CANDIDATES_DIR = join(ROOT, "data", "scene-candidates");
// AI選書結果は data/scene-curated/ に保存する（gitで管理するため public/ 外に置く）
// prebuild スクリプトが public/data/scene-curated/ にコピーする
const CURATED_DIR = join(ROOT, "data", "scene-curated");
mkdirSync(CURATED_DIR, { recursive: true });

// ── CLI オプション ────────────────────────────────────────────────
const targetSlug = (() => {
  const idx = process.argv.indexOf("--scene");
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const scenes = targetSlug
  ? READING_SCENES.filter((s) => s.slug === targetSlug)
  : READING_SCENES;

if (scenes.length === 0) {
  console.error(`❌ シーン "${targetSlug}" が見つかりません`);
  process.exit(1);
}

// ── シーンごとの評価観点 ──────────────────────────────────────────
const SCENE_CRITERIA: Record<string, string> = {
  commute: `
- 短い移動時間でも入りやすい（章・話のまとまりが短い）
- 途中で止めても戻りやすい（話を忘れにくい構成）
- テンポがよく、情報負荷が高すぎない
- 読んで気分が落ち込まない`,

  "before-sleep": `
- 感情の刺激が強すぎず、穏やかに読める
- 区切りよく読め、キリよく手を置ける
- 静かに浸れる余韻がある
- 読後が重くなりすぎない、翌朝に引きずらない`,

  "holiday-binge": `
- 没入感があり、続きが気になる
- 長めに読んでも疲れにくい（テンポ・リズムが持続する）
- 世界観や登場人物の奥行きがある
- 1冊読み終えたら次の巻へ手が伸びる`,

  "short-break": `
- 5〜15分の断続的な読書でも楽しめる
- 1話・1章が短く独立していることが望ましい
- 流れを忘れても再開しやすい
- 読み終えた後に疲労感が少ない`,

  cafe: `
- ゆっくり雰囲気を味わいながら読める
- 少し感傷的・情緒的になれる
- 騒がしい場所でも集中できるほど読み入れる
- 読書自体が「体験」になる深さがある`,

  "stress-relief": `
- 読んでスカッと気分転換できる
- 推進力・爽快感がある
- ストレスを別の何かに集中させてくれる
- 読後に少し前向きになれる`,

  "calm-down": `
- 刺激が強すぎず、心が落ち着く
- 穏やかなテンポで読める
- 登場人物や世界観に安心感がある
- 読後に「ほっ」とできる`,

  exciting: `
- 高揚感や冒険感がある
- 手が止まりにくい展開
- 読み始めたら続きが気になる
- エネルギーが上がる`,

  "think-deeply": `
- 読後に余韻や思考が残る
- テーマ性・メッセージ性がある
- 登場人物の心理や社会の構造を考えさせる
- ただのエンタメ以上の何かを持っている`,
};

// ── AI プロンプト生成 ─────────────────────────────────────────────

function buildPrompt(candidates: SceneCandidates): string {
  const criteria = SCENE_CRITERIA[candidates.slug] ?? "";

  // 候補をAI入力用にシンプル化
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
以下の読書シーン「${candidates.label}」に合う作品を、候補リストから厳選してください。

## シーンの説明
${candidates.description}

## このシーンで重視する観点
${criteria}

## 候補作品（${candidates.candidateCount}件）
${candidateLines.join("\n")}

## 選書ルール
- 候補の中から10〜15件を選ぶ（多すぎず、少なすぎず）
- 同系統の作品が固まりすぎないよう、タイプや雰囲気を散らす
- 漫画と小説のバランスを考慮する（どちらかに偏りすぎない）
- 各作品に40〜100字の自然な日本語の推薦理由を書く
- 推薦理由は「〇〇が良い」という断定よりも「〇〇を楽しみたいときに」「〇〇が好きな人に」のような提案トーンで
- 2〜3のセクションに分ける（セクション名は具体的かつ自然な日本語で）
- ランキング感を出さない。選書・提案のトーンで
- このシーンの導入文を80〜120字で書く

## 出力形式
必ず以下のJSONのみを出力してください（マークダウンコードブロック不要）:
{
  "intro": "シーンの導入文（80〜120字）",
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

  const text = data.content.find((b) => b.type === "text")?.text ?? "";
  return text;
}

// ── レスポンス検証 ────────────────────────────────────────────────

function validateAndParse(
  raw: string,
  candidates: SceneCandidates
): ClaudeResponse {
  // JSON 部分だけ抽出（コードブロックに包まれていた場合に対応）
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
  const validSections: CuratedSection[] = [];

  for (const sec of obj.sections as unknown[]) {
    const s = sec as Record<string, unknown>;
    if (typeof s.title !== "string" || !Array.isArray(s.items)) continue;

    const validItems: CuratedItem[] = [];
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

  return {
    intro: obj.intro.trim(),
    sections: validSections,
  };
}

// ── メイン処理 ────────────────────────────────────────────────────

async function processScene(scene: (typeof READING_SCENES)[number]): Promise<void> {
  const candidatePath = join(CANDIDATES_DIR, `${scene.slug}.json`);
  if (!existsSync(candidatePath)) {
    console.warn(`  ⚠ 候補ファイルが見つかりません: ${candidatePath}`);
    console.warn(`    先に npm run generate:candidates を実行してください`);
    return;
  }

  const candidates: SceneCandidates = JSON.parse(readFileSync(candidatePath, "utf-8"));
  console.log(`\n🔍 [${scene.label}] 候補 ${candidates.candidateCount} 件 → AI 選書中...`);

  const prompt = buildPrompt(candidates);

  let parsed: ClaudeResponse;
  let lastError: Error | null = null;

  // リトライ 2 回
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const raw = await callClaude(prompt);
      parsed = validateAndParse(raw, candidates);
      break;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      console.warn(`  ⚠ 試行${attempt} 失敗: ${lastError.message}`);
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  if (!parsed!) {
    console.error(`  ❌ [${scene.label}] 生成失敗: ${lastError?.message}`);
    return;
  }

  const totalSelected = parsed.sections.reduce((sum, s) => sum + s.items.length, 0);

  const output: SceneCurated = {
    scene: scene.label,
    slug: scene.slug,
    intro: parsed.intro,
    sections: parsed.sections,
    allCandidatesCount: candidates.candidateCount,
    selectedCount: totalSelected,
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(
    join(CURATED_DIR, `${scene.slug}.json`),
    JSON.stringify(output, null, 2),
    "utf-8"
  );

  console.log(`  ✓ scene-curated/${scene.slug}.json  (${totalSelected} 件選書, ${parsed.sections.length} セクション)`);
}

async function main(): Promise<void> {
  console.log(`AI選書バッチ開始 — 対象シーン: ${scenes.map((s) => s.label).join(", ")}`);
  console.log(`モデル: claude-sonnet-4-6\n`);

  for (const scene of scenes) {
    await processScene(scene);
    // レート制限対策
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n完了。選書結果 → public/data/scene-curated/`);
  console.log("次のステップ: npm run build");
}

main().catch((e) => {
  console.error("予期しないエラー:", e);
  process.exit(1);
});
