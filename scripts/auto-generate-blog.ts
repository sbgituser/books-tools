#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import googleTrends from "google-trends-api";

type YoutubeVideo = {
  title: string;
  channelTitle: string;
  publishedAt: string;
  videoId: string;
};

type TrendItem = {
  query: string;
  value: number;
};

type GeneratedArticle = {
  title: string;
  description: string;
  tags: string[];
  body: string;
};

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const rows = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const row of rows) {
    const m = row.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    const key = m[1];
    const value = m[2].trim().replace(/^"|"$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function todayJst(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function fetchGoogleTrends(region: string): Promise<TrendItem[]> {
  const raw = await googleTrends.dailyTrends({
    trendDate: new Date(),
    geo: region,
  });

  const parsed = JSON.parse(raw) as {
    default?: {
      trendingSearchesDays?: Array<{
        trendingSearches?: Array<{
          title?: { query?: string };
          formattedTraffic?: string;
        }>;
      }>;
    };
  };

  const searches = parsed.default?.trendingSearchesDays?.[0]?.trendingSearches ?? [];
  return searches
    .map((x) => {
      const q = x.title?.query?.trim() ?? "";
      const numeric = Number((x.formattedTraffic ?? "").replace(/[^0-9]/g, "")) || 0;
      return { query: q, value: numeric };
    })
    .filter((x) => x.query.length > 0)
    .slice(0, 15);
}

async function fetchYoutubeVideos(apiKey: string, query: string): Promise<YoutubeVideo[]> {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "10");
  url.searchParams.set("order", "date");
  url.searchParams.set("q", query);
  url.searchParams.set("regionCode", "JP");
  url.searchParams.set("relevanceLanguage", "ja");
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);

  const json = (await res.json()) as {
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        channelTitle?: string;
        publishedAt?: string;
      };
    }>;
  };

  return (json.items ?? [])
    .map((item) => ({
      title: item.snippet?.title ?? "",
      channelTitle: item.snippet?.channelTitle ?? "",
      publishedAt: item.snippet?.publishedAt ?? "",
      videoId: item.id?.videoId ?? "",
    }))
    .filter((x) => x.title && x.videoId);
}

function buildSafetySystemPrompt(): string {
  return [
    "あなたは日本語記事編集者です。出力は必ず日本語で、ですます調にしてください。",
    "書籍に関連する一般向け記事を作成してください。",
    "絶対条件:",
    "- ネタバレ禁止（物語の結末・核心展開・犯人・トリックの開示は禁止）",
    "- 著作権侵害禁止（本文の引用は行わない。歌詞・本文・長文引用を出さない）",
    "- センシティブ内容禁止（暴力/性的/差別/違法行為の助長を含めない）",
    "- 事実不明な断定を避け、『〜とされます』『〜が見られます』のように表現する",
    "出力形式はJSONのみ。",
  ].join("\n");
}

function buildUserPrompt(trends: TrendItem[], videos: YoutubeVideo[]): string {
  return [
    "以下の情報を参考に、書籍関連のブログ記事を1本作成してください。",
    "タイトルは読書ユーザー向けにわかりやすくしてください。",
    "本文はh2見出しを3つ以上含むMarkdown形式にしてください。",
    "出力JSON schema:",
    '{"title":"...","description":"...","tags":["..."],"body":"...markdown..."}',
    "\n[Google Trends]",
    ...trends.map((t) => `- ${t.query} (${t.value})`),
    "\n[YouTube recent videos]",
    ...videos.map((v) => `- ${v.title} / ${v.channelTitle} / ${v.publishedAt}`),
  ].join("\n");
}

async function generateArticle(openAiApiKey: string, trends: TrendItem[], videos: YoutubeVideo[]): Promise<GeneratedArticle> {
  const res = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: process.env["OPENAI_MODEL"] || "gpt-4o-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSafetySystemPrompt() },
        { role: "user", content: buildUserPrompt(trends, videos) },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${text}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI response is empty");

  const parsed = JSON.parse(content) as GeneratedArticle;
  if (!parsed.title || !parsed.body) throw new Error("Invalid generated article format");
  return {
    title: parsed.title,
    description: parsed.description || "書籍関連のトレンド記事です。",
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 6) : ["読書", "トレンド"],
    body: parsed.body,
  };
}

function verifySafety(article: GeneratedArticle) {
  const text = `${article.title}\n${article.description}\n${article.body}`;
  const forbidden = ["犯人は", "結末は", "ラストは", "全文引用", "違法", "差別"];
  const hit = forbidden.find((w) => text.includes(w));
  if (hit) throw new Error(`Safety check failed: contains forbidden term (${hit})`);
}

function saveArticle(article: GeneratedArticle): string {
  const date = todayJst();
  const slug = `${date}-${slugify(article.title)}`;
  const dir = path.join(process.cwd(), "content", "blog");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, `${slug}.md`);

  const frontmatter = [
    "---",
    `title: \"${article.title.replace(/\"/g, "\\\"")}\"`,
    `slug: \"${slug}\"`,
    `description: \"${article.description.replace(/\"/g, "\\\"")}\"`,
    `date: \"${date}\"`,
    `tags: [${article.tags.map((t) => `\"${t.replace(/\"/g, "\\\"")}\"`).join(", ")}]`,
    "---",
    "",
  ].join("\n");

  fs.writeFileSync(outPath, `${frontmatter}${article.body.trim()}\n`, "utf-8");
  return outPath;
}

async function main() {
  loadDotEnv();

  const youtubeApiKey = process.env["YOUTUBE_API_KEY"];
  const openAiApiKey = process.env["OPENAI_API_KEY"];
  if (!youtubeApiKey) throw new Error("YOUTUBE_API_KEY is required");
  if (!openAiApiKey) throw new Error("OPENAI_API_KEY is required");

  const trends = await fetchGoogleTrends("JP");
  const topQuery = trends[0]?.query ?? "読書";
  const videos = await fetchYoutubeVideos(youtubeApiKey, `${topQuery} 本`);

  const article = await generateArticle(openAiApiKey, trends, videos);
  verifySafety(article);
  const outPath = saveArticle(article);

  console.log(`✅ generated: ${outPath}`);
}

main().catch((e) => {
  console.error("[FATAL]", e);
  process.exit(1);
});

