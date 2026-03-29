/**
 * OGP画像自動生成スクリプト
 * 使い方: npx tsx scripts/generate-ogp-images.tsx
 * 出力先: public/ogp/{scenes,blog,genre,manga/by-mood,works}/{slug}.png
 *
 * フォントキャッシュ: scripts/fonts/NotoSansJP-Bold.woff
 * （2回目以降のビルドでは再ダウンロードしない）
 */

import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { READING_SCENES } from "../src/constants/readingScenes";
import { PRESET_SEARCHES } from "../src/constants/bookTags";
import { CATEGORY_TREE } from "../src/lib/categories";
import { getAllBlogMeta } from "../src/lib/blog";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "public", "ogp");
const FONTS_DIR = path.join(ROOT, "scripts", "fonts");

// ---------------------------------------------------------------------------
// フォント読み込み（キャッシュ付き）
// ---------------------------------------------------------------------------

async function loadFont(): Promise<ArrayBuffer> {
  const candidates = [
    path.join(FONTS_DIR, "NotoSansJP-Bold.woff"),
    path.join(FONTS_DIR, "NotoSansJP-Bold.ttf"),
    path.join(FONTS_DIR, "NotoSansJP-Bold.otf"),
  ];

  for (const fontPath of candidates) {
    if (fs.existsSync(fontPath)) {
      const buf = fs.readFileSync(fontPath);
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    }
  }

  console.log("📥 NotoSansJP フォントをダウンロード中...");
  fs.mkdirSync(FONTS_DIR, { recursive: true });

  try {
    const url =
      "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp@5/files/noto-sans-jp-japanese-700-normal.woff";
    const fontData = await fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.arrayBuffer();
    });
    fs.writeFileSync(path.join(FONTS_DIR, "NotoSansJP-Bold.woff"), Buffer.from(fontData));
    console.log("✅ フォントのダウンロード完了 (jsDelivr)");
    return fontData;
  } catch (err) {
    console.warn("⚠️  jsDelivr からの取得に失敗:", (err as Error).message);
  }

  try {
    const url =
      "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-700-normal.woff";
    const fontData = await fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.arrayBuffer();
    });
    fs.writeFileSync(path.join(FONTS_DIR, "NotoSansJP-Bold.woff"), Buffer.from(fontData));
    console.log("✅ フォントのダウンロード完了 (jsDelivr fallback)");
    return fontData;
  } catch (err) {
    console.warn("⚠️  jsDelivr fallback からの取得に失敗:", (err as Error).message);
  }

  throw new Error(
    [
      "フォントの自動ダウンロードに失敗しました。",
      "以下の方法でフォントを配置してください:",
      "  npm install @fontsource/noto-sans-jp を実行後、",
      "  node_modules/@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-700-normal.woff を",
      "  scripts/fonts/NotoSansJP-Bold.woff としてコピー",
    ].join("\n")
  );
}

// ---------------------------------------------------------------------------
// OGP画像テンプレート
// ---------------------------------------------------------------------------

function calcFontSize(text: string): number {
  const len = text.length;
  if (len <= 15) return 64;
  if (len <= 25) return 54;
  if (len <= 35) return 44;
  if (len <= 50) return 36;
  return 30;
}

function buildOgElement(
  title: string,
  badgeLabel: string,
  badgeColor: string,
  typeLabel: string
): object {
  const fontSize = calcFontSize(title);

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        background: "linear-gradient(135deg, #1c1409 0%, #0c0a05 100%)",
        padding: "0",
        fontFamily: "Noto Sans JP",
        position: "relative",
      },
      children: [
        // トップアクセントバー（アンバー）
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              height: "6px",
              background: "linear-gradient(90deg, #d97706, #f59e0b)",
            },
          },
        },
        // メインコンテンツエリア
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              flex: "1",
              padding: "64px",
              paddingTop: "72px",
            },
            children: [
              // バッジ行
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "32px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          background: badgeColor,
                          color: "white",
                          fontSize: "22px",
                          fontWeight: "700",
                          padding: "6px 20px",
                          borderRadius: "100px",
                        },
                        children: badgeLabel,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "18px",
                        },
                        children: typeLabel,
                      },
                    },
                  ],
                },
              },
              // タイトル
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flex: "1",
                    alignItems: "center",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: `${fontSize}px`,
                          fontWeight: "700",
                          color: "#ffffff",
                          lineHeight: "1.45",
                          maxWidth: "1072px",
                        },
                        children: title,
                      },
                    },
                  ],
                },
              },
              // フッター
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                    paddingTop: "24px",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        },
                        children: [
                          {
                            type: "div",
                            props: {
                              style: {
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                background: "#d97706",
                              },
                            },
                          },
                          {
                            type: "div",
                            props: {
                              style: {
                                color: "#d97706",
                                fontSize: "22px",
                                fontWeight: "700",
                              },
                              children: "Books Tools",
                            },
                          },
                        ],
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          color: "rgba(255,255,255,0.35)",
                          fontSize: "17px",
                        },
                        children: "books.kuras-plus.com",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// PNG レンダリング
// ---------------------------------------------------------------------------

async function renderToPng(
  element: object,
  fontData: ArrayBuffer,
  outputPath: string
): Promise<void> {
  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "Noto Sans JP",
        data: fontData,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, pngBuffer);
}

// ---------------------------------------------------------------------------
// コンテンツタイプ別ジェネレーター
// ---------------------------------------------------------------------------

async function generateDefaultImage(fontData: ArrayBuffer): Promise<void> {
  const element = buildOgElement(
    "漫画・小説を気分・シーンで探す",
    "Books Tools",
    "#d97706",
    "本の探索ツール"
  );
  await renderToPng(element, fontData, path.join(OUTPUT_DIR, "default-ogp.png"));
  console.log("  ✅ default-ogp.png");
}

async function generateSceneImages(fontData: ArrayBuffer): Promise<number> {
  let count = 0;
  for (const scene of READING_SCENES) {
    const outputPath = path.join(OUTPUT_DIR, "scenes", `${scene.slug}.png`);
    try {
      const element = buildOgElement(scene.label, "読書シーン", "#0891b2", "シーン別おすすめ");
      await renderToPng(element, fontData, outputPath);
      console.log(`  ✅ scenes/${scene.slug}.png`);
      count++;
    } catch (err) {
      console.error(`  ❌ scenes/${scene.slug}.png:`, (err as Error).message);
    }
  }
  return count;
}

async function generateBlogImages(fontData: ArrayBuffer): Promise<number> {
  let posts: Array<{ slug: string; title: string; tags: string[] }>;
  try {
    posts = getAllBlogMeta();
  } catch (err) {
    console.warn("⚠️  ブログメタデータの取得に失敗:", (err as Error).message);
    return 0;
  }

  let count = 0;
  for (const post of posts) {
    const outputPath = path.join(OUTPUT_DIR, "blog", `${post.slug}.png`);
    try {
      const typeLabel = post.tags[0] ?? "Books Tools";
      const element = buildOgElement(post.title, "ブログ", "#d97706", typeLabel);
      await renderToPng(element, fontData, outputPath);
      console.log(`  ✅ blog/${post.slug}.png`);
      count++;
    } catch (err) {
      console.error(`  ❌ blog/${post.slug}.png:`, (err as Error).message);
    }
  }
  return count;
}

async function generateGenreImages(fontData: ArrayBuffer): Promise<number> {
  let count = 0;
  for (const l1 of CATEGORY_TREE) {
    for (const l2 of l1.subcategories ?? []) {
      const l2Id = l2.id;
      const outputPath = path.join(OUTPUT_DIR, "genre", `${l2Id}.png`);
      try {
        const badgeColor = (l1 as { id: string }).id === "manga" ? "#9333ea" : "#3b82f6";
        const typeLabel = (l1 as { id: string }).id === "manga" ? "漫画ジャンル" : "小説ジャンル";
        const element = buildOgElement(
          `${l2.label}のおすすめ`,
          "ジャンル",
          badgeColor,
          typeLabel
        );
        await renderToPng(element, fontData, outputPath);
        console.log(`  ✅ genre/${l2Id}.png`);
        count++;
      } catch (err) {
        console.error(`  ❌ genre/${l2Id}.png:`, (err as Error).message);
      }
    }
  }
  return count;
}

const MOOD_LABELS: Record<string, string> = {
  cry: "泣ける漫画 おすすめ一覧",
  healing: "癒やされる漫画 おすすめ一覧",
  hot: "熱い・燃える漫画 おすすめ一覧",
  heartwarming: "キュンとする恋愛漫画 おすすめ一覧",
  thinking: "頭を使う漫画 おすすめ一覧",
  easy: "気軽に読める漫画 おすすめ一覧",
  dark: "ダークな漫画 おすすめ一覧",
  binge: "一気読みしたい漫画 おすすめ一覧",
  completed: "完結済み漫画 おすすめ一覧",
  beginner: "漫画入門・初心者向け おすすめ一覧",
};

async function generateMoodImages(fontData: ArrayBuffer): Promise<number> {
  let count = 0;
  for (const preset of PRESET_SEARCHES) {
    const label = MOOD_LABELS[preset.slug] ?? preset.label;
    const outputPath = path.join(OUTPUT_DIR, "manga", "by-mood", `${preset.slug}.png`);
    try {
      const element = buildOgElement(label, "気分で探す", "#ec4899", "漫画おすすめ");
      await renderToPng(element, fontData, outputPath);
      console.log(`  ✅ manga/by-mood/${preset.slug}.png`);
      count++;
    } catch (err) {
      console.error(`  ❌ manga/by-mood/${preset.slug}.png:`, (err as Error).message);
    }
  }
  return count;
}

async function generateWorksImages(fontData: ArrayBuffer): Promise<number> {
  const worksDir = path.join(ROOT, "public", "data", "works");
  if (!fs.existsSync(worksDir)) {
    console.warn("⚠️  worksディレクトリが見つかりません（スキップ）:", worksDir);
    return 0;
  }

  const files = fs.readdirSync(worksDir).filter((f) => f.endsWith(".json"));
  let count = 0;

  for (const file of files) {
    const workId = file.replace(/\.json$/, "");
    const outputPath = path.join(OUTPUT_DIR, "works", `${workId}.png`);

    try {
      const raw = fs.readFileSync(path.join(worksDir, file), "utf-8");
      const data = JSON.parse(raw) as {
        title?: string;
        type?: string;
        authorDisplay?: string;
      };

      const title = data.title ?? workId;
      const isManga = data.type === "manga";
      const badgeLabel = isManga ? "漫画" : "小説";
      const badgeColor = isManga ? "#9333ea" : "#3b82f6";
      const typeLabel = data.authorDisplay ?? "";

      const element = buildOgElement(title, badgeLabel, badgeColor, typeLabel);
      await renderToPng(element, fontData, outputPath);
      count++;

      if (count % 100 === 0) {
        console.log(`  ✅ works: ${count}件完了...`);
      }
    } catch (err) {
      console.error(`  ❌ works/${workId}.png:`, (err as Error).message);
    }
  }

  console.log(`  ✅ works: 計${count}件`);
  return count;
}

// ---------------------------------------------------------------------------
// メイン
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log("🎨 OGP画像を生成中...\n");
  const startTime = Date.now();

  let fontData: ArrayBuffer;
  try {
    fontData = await loadFont();
  } catch (err) {
    console.error("\n❌ フォントの読み込みに失敗しました:");
    console.error((err as Error).message);
    process.exit(1);
  }

  let totalCount = 0;

  console.log("\n🔖 デフォルトOGP画像を生成中...");
  await generateDefaultImage(fontData);
  totalCount += 1;

  console.log("\n📍 シーンページのOGP画像を生成中...");
  totalCount += await generateSceneImages(fontData);

  console.log("\n📝 ブログのOGP画像を生成中...");
  totalCount += await generateBlogImages(fontData);

  console.log("\n📚 ジャンルページのOGP画像を生成中...");
  totalCount += await generateGenreImages(fontData);

  console.log("\n🎭 気分別漫画ページのOGP画像を生成中...");
  totalCount += await generateMoodImages(fontData);

  console.log("\n📖 作品ページのOGP画像を生成中...");
  totalCount += await generateWorksImages(fontData);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✅ 合計 ${totalCount} 枚のOGP画像を生成しました → public/ogp/ (${elapsed}秒)`);
}

main().catch((err) => {
  console.error("\n❌ OGP画像生成に失敗しました:", err);
  process.exit(1);
});
