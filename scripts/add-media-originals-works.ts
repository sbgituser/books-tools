#!/usr/bin/env tsx
/**
 * add-media-originals-works.ts
 *
 * mediaOriginals.ts で workId が未設定の作品を
 * Google Books API で検索し、normalized data に追加する。
 */

import * as fs from "fs";
import * as path from "path";

// scripts/.env をロード
{
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim();
    }
  }
}

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
if (!API_KEY) {
  console.error("GOOGLE_BOOKS_API_KEY が設定されていません");
  process.exit(1);
}

const WORKS_PATH = path.join(__dirname, "../data/normalized/works.json");
const VOLUMES_PATH = path.join(__dirname, "../data/normalized/volumes.json");

// djb2 ハッシュ (generate-works-data.ts と同じ実装)
function djb2hash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (((h << 5) + h) + str.charCodeAt(i)) >>> 0;
  }
  return h.toString(36).padStart(7, "0");
}

function titleToKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\s　]+/g, "_")
    .replace(/[^\w\u3040-\u9fff\uFF00-\uFFEF]/g, "")
    .substring(0, 40);
}

function authorToKey(author: string): string {
  return author
    .replace(/[\s　・·.]+/g, "")
    .substring(0, 20);
}

interface Target {
  title: string;         // 原作本タイトル (Google Books 検索用)
  author: string;        // 著者名
  type: "novel" | "manga" | "overseas_novel";
  searchQuery?: string;  // 検索クエリ override (ISBNや追加キーワード)
  summaryShort?: string; // 手動サマリー
}

const TARGETS: Target[] = [
  // ── 小説 ─────────────────────────────────────────────
  {
    title: "探偵ガリレオ",
    author: "東野圭吾",
    type: "novel",
    summaryShort: "天才物理学者・湯川学が不可解な事件の謎を科学的思考で解き明かすガリレオシリーズ第一作。理系ミステリの金字塔として絶大な人気を誇り、テレビドラマ化で福山雅治が主演した。",
  },
  {
    title: "オレたちバブル入行組",
    author: "池井戸潤",
    type: "novel",
    summaryShort: "バブル期に銀行に入行した半沢直樹が、不正を暴くために「倍返し」で立ち向かう痛快企業小説。「半沢直樹」の原作で、組織の不条理と主人公の信念が鮮やかに描かれる。",
  },
  {
    title: "下町ロケット",
    author: "池井戸潤",
    type: "novel",
    summaryShort: "中小企業の社長・佃航平がロケット部品の特許を武器に大企業と戦う熱血企業小説。夢を諦めない姿勢と仲間との絆が胸を熱くする、直木賞受賞の傑作エンターテインメント。",
  },
  {
    title: "陸王",
    author: "池井戸潤",
    type: "novel",
    summaryShort: "創業百年の老舗足袋屋が開発した革新的なランニングシューズで復活を目指す感動の企業再生小説。小さな会社が大企業に立ち向かう姿と人情が心を揺さぶる池井戸潤の代表作。",
  },
  {
    title: "君の名は。",
    author: "新海誠",
    type: "novel",
    summaryShort: "田舎の女子高生と東京の男子高生が夢の中で入れ替わる不思議な体験を描いた新海誠監督の大ヒットアニメ映画のノベライズ。運命的な出会いと別れ、時を超えた恋愛が美しく綴られる。",
  },
  {
    title: "言の葉の庭",
    author: "新海誠",
    type: "novel",
    summaryShort: "靴職人を目指す高校生と年上の女性が雨の日の公園で出会う、繊細で詩的な恋愛物語。新海誠監督のアニメ映画のノベライズで、梅雨の情景と孤独な心の交流が美しく描かれる。",
  },
  {
    title: "天気の子",
    author: "新海誠",
    type: "novel",
    summaryShort: "家出少年と晴れ女の少女の出会いと、世界を救うか彼女を選ぶかという選択を描いた新海誠の映画ノベライズ。圧倒的な映像美と純粋な愛の物語が胸を打つ現代ファンタジー。",
  },
  {
    title: "すずめの戸締まり",
    author: "新海誠",
    type: "novel",
    summaryShort: "扉を閉めて旅をする少女・すずめと謎の青年の出会いを描く、新海誠監督のロードムービー的ファンタジーのノベライズ。日本各地の廃墟を舞台に繰り広げられる冒険と成長の物語。",
  },
  {
    title: "永遠の0",
    author: "百田尚樹",
    type: "novel",
    summaryShort: "零戦パイロットだった祖父の謎の死を孫が調べるうちに浮かび上がる感動の物語。戦争の悲惨さと人間の誇り、家族への愛を描いた百田尚樹のベストセラー戦争小説。",
  },
  {
    title: "億男",
    author: "川村元気",
    type: "novel",
    summaryShort: "宝くじで三億円を当てたことで人生が狂い始めた男と親友との再会を描く感動小説。お金と幸福の意味を問う川村元気の代表作で、映画化された人気作品。",
  },
  {
    title: "ドライブ・マイ・カー",
    author: "村上春樹",
    type: "novel",
    searchQuery: "ドライブ・マイ・カー 村上春樹 女のいない男たち",
    summaryShort: "妻を亡くした舞台俳優が専属ドライバーの女性と交わす対話を通じて癒しを得る短編小説。村上春樹の短編集「女のいない男たち」に収録され、濱口竜介監督の映画化でカンヌ映画祭を席巻した。",
  },
  {
    title: "罪の声",
    author: "塩田武士",
    type: "novel",
    summaryShort: "実在のグリコ・森永事件を題材に、テープに使われた子供の声の主を追う記者と、その声の持ち主だった男を描くサスペンス小説。塩田武士の代表作で圧倒的なリアリティが話題になった。",
  },
  {
    title: "ハリー・ポッターと賢者の石",
    author: "J.K.ローリング",
    type: "overseas_novel",
    searchQuery: "ハリー・ポッターと賢者の石 J.K.ローリング 松岡佑子",
    summaryShort: "魔法使いの少年ハリー・ポッターがホグワーツ魔法魔術学校に入学し、ヴォルデモートの陰謀と戦う冒険を描いた世界的ベストセラーシリーズの第一作。全世界5億部超えの不朽の名作。",
  },
  {
    title: "氷と炎の歌",
    author: "ジョージ・R・R・マーティン",
    type: "overseas_novel",
    searchQuery: "七王国の玉座 ジョージ・R・R・マーティン",
    summaryShort: "七つの王国をめぐる権力闘争と壮大な冒険を描くファンタジー大作「氷と炎の歌」シリーズ。HBOドラマ「ゲーム・オブ・スローンズ」の原作で、予測不能な展開と緻密な世界観で世界を熱狂させた。",
  },

  // ── 漫画 ─────────────────────────────────────────────
  {
    title: "のだめカンタービレ",
    author: "二ノ宮知子",
    type: "manga",
    summaryShort: "天才ピアニストを目指すのだめと指揮者志望の千秋のドタバタ恋愛を描く音楽ラブコメの傑作。クラシック音楽の魅力をわかりやすく伝えながら、笑いと感動を届ける人気漫画。",
  },
  {
    title: "DEATH NOTE",
    author: "大場つぐみ",
    type: "manga",
    summaryShort: "名前を書けば人を死に至らしめるデスノートを拾った高校生・夜神月と、天才探偵Lの頭脳戦を描くサスペンスサスペンス漫画。善悪の定義と神になろうとする人間の傲慢さを問う衝撃作。",
  },
  {
    title: "ドラゴン桜",
    author: "三田紀房",
    type: "manga",
    summaryShort: "落ちこぼれ高校生たちが東大合格を目指す姿を描いた教育エンターテインメント漫画。型破りな弁護士教師・桜木建二の指導のもと、勉強の本質と人生の目標が鮮やかに描かれる。",
  },
  {
    title: "今際の国のアリス",
    author: "麻生羽呂",
    type: "manga",
    summaryShort: "謎のゲームが行われる別世界に迷い込んだ青年・アリスが生死を懸けたゲームに挑む脱出サバイバル漫画。NETFLIXでの実写ドラマ化で世界的な人気を博した緊張感あふれる傑作。",
  },
  {
    title: "テルマエ・ロマエ",
    author: "ヤマザキマリ",
    type: "manga",
    summaryShort: "古代ローマの浴場設計士が現代日本の風呂文化にタイムスリップして衝撃を受けるコメディ漫画。異文化交流とユーモラスな発見が笑いを誘う、ヤマザキマリの代表的ヒット作。",
  },
  {
    title: "東京喰種トーキョーグール",
    author: "石田スイ",
    type: "manga",
    summaryShort: "人間を食べる喰種と人間の狭間で揺れる青年・金木研の葛藤を描くダークファンタジー漫画。人間性とは何かを問う深いテーマと迫力ある戦闘シーンで絶大な人気を誇る。",
  },
  {
    title: "海街diary",
    author: "吉田秋生",
    type: "manga",
    summaryShort: "鎌倉に住む三姉妹と異母妹の共同生活を丁寧に描いた吉田秋生の代表的な家族ドラマ漫画。日常の美しさと家族の絆、女性の生き方を繊細に描いたヒューマンドラマの傑作。",
  },
  {
    title: "逃げるは恥だが役に立つ",
    author: "海野つなみ",
    type: "manga",
    summaryShort: "就活に失敗した女性が生活のため「契約結婚」から始まる恋愛を描いたラブコメ漫画。TBSドラマで新垣結衣・星野源主演で社会現象を起こし「恋ダンス」が大流行した人気作品。",
  },
  {
    title: "ミステリと言う勿れ",
    author: "田村由美",
    type: "manga",
    summaryShort: "哲学的思考と独自の洞察力で事件を解決する大学生・整の活躍を描くミステリ漫画。犯人の心理や社会問題を深く掘り下げながら、人間の本質に迫る田村由美の話題作。",
  },
  {
    title: "翔んで埼玉",
    author: "魔夜峰央",
    type: "manga",
    summaryShort: "埼玉県民が差別される架空の日本を舞台に、解放運動を描くギャグ漫画。1983年発表の伝説的作品が2019年に映画化されて再ブームを起こし、埼玉愛と郷土ネタで全国を笑いの渦に巻き込んだ。",
  },
  {
    title: "東京卍リベンジャーズ",
    author: "和久井健",
    type: "manga",
    searchQuery: "東京卍リベンジャーズ 和久井健",
    summaryShort: "タイムリープ能力を得た青年が過去に戻り、悲惨な未来を変えるべく不良グループと戦う青春ヤンキー漫画。熱い友情と仲間を守る信念が胸を熱くする少年マガジンの超人気作品。",
  },
  {
    title: "映像研には手を出すな！",
    author: "大童澄瞳",
    type: "manga",
    summaryShort: "アニメ制作に情熱を注ぐ女子高生3人組の青春を描いた漫画。世界観の構築とアニメ制作の喜びを生き生きと描き、湯浅政明監督によるアニメ化・実写映画化でも高く評価された。",
  },
  {
    title: "ジョーカー・ゲーム",
    author: "柳広司",
    type: "novel",
    summaryShort: "戦前の日本で秘密諜報機関「D機関」のスパイたちが活躍するスパイ小説シリーズ。知略と心理戦、スパイの美学を描いた柳広司の代表作で、直木賞候補・山本周五郎賞受賞の傑作。",
  },
];

// ── Google Books API ─────────────────────────────────────────────

interface GBVolume {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string };
    language?: string;
  };
}

async function searchGoogleBooks(query: string): Promise<GBVolume | null> {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=ja&maxResults=5&key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as { items?: GBVolume[] };
  return data.items?.[0] ?? null;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function coverUrl(gbId: string): string {
  return `https://books.google.com/books/content?id=${gbId}&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api`;
}

// ── メイン ────────────────────────────────────────────────────────

async function main() {
  const works: Record<string, unknown>[] = JSON.parse(fs.readFileSync(WORKS_PATH, "utf-8"));
  const volumes: Record<string, unknown>[] = JSON.parse(fs.readFileSync(VOLUMES_PATH, "utf-8"));

  const existingWorkIds = new Set(works.map((w) => w.workId as string));

  const fileIdResults: Array<{ mediaTitle: string; originalTitle: string; fileId: string; workId: string }> = [];

  for (const target of TARGETS) {
    const typePrefix = target.type === "overseas_novel" ? "novel" : target.type;
    const workId = `${typePrefix}__${titleToKey(target.title)}__${authorToKey(target.author)}`;

    if (existingWorkIds.has(workId)) {
      console.log(`SKIP (exists): ${target.title}`);
      const fileId = djb2hash(workId);
      fileIdResults.push({ mediaTitle: target.title, originalTitle: target.title, fileId, workId });
      continue;
    }

    const query = target.searchQuery ?? `${target.title} ${target.author}`;
    console.log(`Searching: ${query}`);

    const vol = await searchGoogleBooks(query);
    await delay(600);

    if (!vol) {
      console.warn(`  NOT FOUND: ${target.title}`);
      continue;
    }

    const vi = vol.volumeInfo;
    const isbn13 = vi.industryIdentifiers?.find((x) => x.type === "ISBN_13")?.identifier;
    const gbId = vol.id;
    const pubDate = vi.publishedDate ?? "";

    // workId の volume サフィックス
    const volSuffix = isbn13 ? `__${isbn13}` : `__gb-${gbId}`;
    const volumeId = `vol__${workId}${volSuffix}`;

    const workEntry = {
      workId,
      type: typePrefix,
      title: target.title,
      titleNormalized: target.title,
      authorDisplay: vi.authors?.join(" / ") ?? target.author,
      authors: vi.authors ?? [target.author],
      publisherMain: vi.publisher,
      summaryShort: target.summaryShort ?? "",
      status: "unknown",
      volumeCount: 1,
      firstPublishedDate: pubDate,
      latestPublishedDate: pubDate,
      coverImageUrl: coverUrl(gbId),
      discoveryTags: [],
      discoveryAttributes: {},
      relatedWorkIds: [],
      volumeIds: [volumeId],
    };

    const volumeEntry = {
      volumeId,
      workId,
      volumeNo: null,
      volumeLabel: vi.title ?? target.title,
      title: vi.title ?? target.title,
      ...(isbn13 ? { isbn13 } : {}),
      publishedDate: pubDate,
      pageCount: vi.pageCount,
      coverImageUrl: coverUrl(gbId),
      googleBooksId: gbId,
    };

    works.push(workEntry as Record<string, unknown>);
    volumes.push(volumeEntry as Record<string, unknown>);
    existingWorkIds.add(workId);

    const fileId = djb2hash(workId);
    fileIdResults.push({ mediaTitle: target.title, originalTitle: target.title, fileId, workId });
    console.log(`  ADD: ${target.title} → fileId=${fileId}, gbId=${gbId}`);
  }

  fs.writeFileSync(WORKS_PATH, JSON.stringify(works, null, 2));
  fs.writeFileSync(VOLUMES_PATH, JSON.stringify(volumes, null, 2));
  console.log("\n✓ normalized data updated");

  console.log("\n=== fileId mapping ===");
  for (const r of fileIdResults) {
    console.log(`  ${r.originalTitle}: "${r.fileId}"`);
  }
}

main().catch(console.error);
