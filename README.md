# Books Discover — books.kuras-plus.com

小説・漫画に特化した「直感的な発見サイト」。
気分・雰囲気タグから次の一冊を見つけられます。

## コンセプト

Amazon的な「検索支援サイト」ではなく、**発見支援サイト**を目指しています。

- タイトルが分からなくても探せる
- 「泣きたい」「一気読みしたい」など体験ベースで絞り込める
- 作品単位で一覧 → 作品詳細で巻一覧という段階的表示
- 将来の発見軸追加に耐える拡張可能な構造

## 技術スタック

| 技術 | 選定理由 |
|------|----------|
| **Next.js 16 (App Router)** | `output: 'export'` による完全静的出力 |
| **TypeScript** | 型安全による品質維持 |
| **Tailwind CSS v4** | クラスベースで素早いUI構築 |
| **Cloudflare Pages** | 無料プランで静的ホスティング |

## ディレクトリ構成

```
books-tools/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # トップページ（発見導線）
│   │   ├── discover/                 # 発見機能ページ
│   │   ├── works/[workId]/           # 作品詳細 + 巻一覧
│   │   ├── manga/mood/               # 漫画 × 気分タグ（既存）
│   │   ├── manga/by-mood/[slug]/     # 漫画 × ムードカテゴリ（既存）
│   │   ├── books/[id]/               # 個別書籍詳細（後方互換）
│   │   ├── blog/                     # ブログ
│   │   └── search/                   # テキスト検索（既存）
│   ├── components/
│   │   ├── works/
│   │   │   ├── WorkCard.tsx          # 作品カード
│   │   │   └── DiscoverSection.tsx   # 発見UIセクション（クライアント）
│   │   └── ...（既存コンポーネント）
│   ├── constants/
│   │   └── readingScenes.ts          # 読書シーン定義（9シーン）
│   ├── types/
│   │   ├── work.ts                   # Work / Volume / DiscoveryIndex / SceneWorksData 型
│   │   └── book.ts                   # 既存 Mood タグ型
│   └── ...
├── scripts/
│   ├── normalize-works.ts            # books.index.json → works / volumes
│   ├── generate-works-data.ts        # normalized → public/data/
│   ├── generate-scenes-data.ts       # [NEW] 読書シーン別作品JSON生成
│   ├── build-split-index.ts          # カテゴリ別分割インデックス（既存）
│   ├── build-search-index.ts         # テキスト検索インデックス（既存）
│   └── ...（その他既存スクリプト）
├── data/
│   ├── normalized/
│   │   ├── works.json               # 正規化済み作品データ
│   │   └── volumes.json             # 正規化済み巻データ
│   └── raw/                         # （将来: 外部APIの生データ保存先）
├── public/data/
│   ├── works-list.json              # 作品一覧用（軽量）
│   ├── discovery-index.json         # タグ → 作品IDマップ（発見機能用）
│   ├── work-id-map.json             # workId → fileId マッピング
│   ├── works/                       # per-work 詳細JSON（巻情報含む）
│   ├── scenes/                      # [NEW] 読書シーン別JSON
│   │   ├── index.json               # 全シーンのメタ情報（件数付き）
│   │   ├── commute.json             # 通勤・通学
│   │   ├── before-sleep.json        # 寝る前
│   │   └── ...（その他7シーン）
│   └── ...（既存の books-*.json, meta.json 等）
└── content/blog/                    # ブログ記事（MDX）
```

## データパイプライン

```
books.index.json  (マスターデータ)
       ↓
normalize-works.ts
       ↓
data/normalized/works.json + volumes.json
       ↓
generate-works-data.ts          generate-scenes-data.ts
       ↓                               ↓
public/data/works-list.json     public/data/scenes/{slug}.json
public/data/discovery-index.json public/data/scenes/index.json
public/data/works/{fileId}.json
       ↓
generate-scene-candidates.ts         (★ AI選書パイプライン)
       ↓
data/scene-candidates/{slug}.json    (内部用・候補集合)
       ↓
generate-scene-curated.ts  ← 生成AI（Claude）が選書・推薦理由を生成
       ↓
data/scene-curated/{slug}.json  (git管理・ビルド時に参照)
```

### AI選書の仕組み（ハイブリッド方式）

| フェーズ | 役割 | 使用技術 |
|--------|------|---------|
| 候補抽出 | タグ・属性スコアリングで30〜70件に絞り込む | ルールベース（既存ロジック） |
| 最終選書 | 候補から10〜15件を厳選・理由を生成 | 生成AI（Claude API） |
| 本番配信 | 生成済みJSONを静的に配信 | Next.js SSG |

- **本番ではリアルタイムにAIへ問い合わせない**
- AI選書はバッチ生成時にのみ実行し、成果物として保存する
- 既存の works/volumes データ構造は一切変更していない

## セットアップ

```bash
# Node.js 18+ が必要
npm install
```

環境変数（オプション）:

```bash
cp .env.example .env.local
# NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_GA_ID を設定
```

## データ収集・正規化・生成

```bash
# 作品データ正規化（books.index.json → data/normalized/）
npm run normalize:works

# 生成物作成（data/normalized/ → public/data/）
npm run generate:works

# 読書シーン別JSON生成（public/data/scenes/）
npm run generate:scenes

# 上記3つをまとめて実行
npm run collect:works

# ── AI選書パイプライン ──────────────────────────────────────

# シーン候補集合を生成（data/scene-candidates/）
# ※ collect:works を先に実行しておく必要がある
npm run generate:candidates

# AI選書バッチを実行（data/scene-curated/）
# ※ ANTHROPIC_API_KEY が必要（scripts/.env に設定）
npm run generate:curated

# 特定シーンのみ再生成する場合
npx tsx scripts/generate-scene-curated.ts --scene commute

# 候補生成 + AI選書を一括実行
npm run collect:curated

# 書籍追加から選書まで全工程を一括実行
npm run collect:all

# ── その他 ──────────────────────────────────────────────────

# 既存の書籍メタデータ補完（Google Books API 使用）
npm run fetch:books

# 関連書籍グラフ生成
npm run build:related
```

## 書籍情報追加時の更新フロー

新しい書籍を `src/data/books.index.json` に追加した後は、以下の順で更新する。
**対応漏れが出ないよう、このフローをそのまま実行すること。**

```bash
# Step 1: 書籍データを正規化・生成（既存フロー）
npm run collect:works

# Step 2: シーン候補を再生成（新書籍が候補に含まれるようになる）
npm run generate:candidates

# Step 3: AI選書を再実行（新書籍が適切なシーンに追加される可能性あり）
#   全シーン再生成する場合:
npm run generate:curated
#   特定シーンだけ更新する場合（例: 通勤・通学シーンのみ）:
npx tsx scripts/generate-scene-curated.ts --scene commute

# Step 4: ビルドして確認
npm run build

# Step 5: デプロイ
git add . && git commit -m "feat: ..." && git push origin master
```

> **Note:** AI選書の再実行は Anthropic API キーが必要。
> `scripts/.env` に `ANTHROPIC_API_KEY=sk-ant-...` を設定すること。
> curated JSON は `data/scene-curated/` に保存されるため、
> ビルド時には自動的にバンドルされる。

## 読書シーンの追加方法

1. `src/constants/readingScenes.ts` の `READING_SCENES` 配列に新しいシーンを追加する：

```typescript
{
  slug: "new-scene-slug",      // URL: /scene/new-scene-slug
  label: "シーン名",
  icon: "🎯",
  description: "短い説明文",
  seoTitle: "SEOタイトル",
  seoDescription: "メタディスクリプション",
  primaryTags: ["タグ1", "タグ2"],  // マッチで+3点
  bonusTags: ["タグ3"],              // マッチで+1点
  excludeTags: ["除外タグ"],
}
```

2. `npm run collect:works` でJSON再生成
3. `npm run generate:candidates` で候補データを生成（新シーン含む）
4. `npx tsx scripts/generate-scene-curated.ts --scene new-scene-slug` でAI選書
5. `npm run build` でビルド確認

> **候補抽出ルールの追加箇所:**
> `scripts/generate-scene-candidates.ts` の `structuralScore()` 関数に
> 新シーン向けのヒューリスティックを追加できる（任意）。
>
> **AI選書のシーン観点（プロンプト）の追加箇所:**
> `scripts/generate-scene-curated.ts` の `SCENE_CRITERIA` オブジェクトに
> `slug: "評価観点の文字列"` を追加すること。

## ローカル起動

```bash
npm run dev
# → http://localhost:3000
```

## ビルド

```bash
npm run build
# prebuild: normalize-works → generate-works → generate-scenes → build-split-index → build-search-index → generate-feeds
# → out/ に静的ファイルが生成される
```

## デプロイ

Cloudflare Pages へ自動デプロイ。`master` ブランチへの push でトリガー。

```bash
git add .
git commit -m "your message"
git push origin master
# → Cloudflare Pages が自動でビルド & デプロイ
```

## 主要ルート

| URL | 概要 |
|-----|------|
| `/` | トップページ（気分タグ・読書シーン導線） |
| `/discover` | 発見機能（タグフィルタ + 作品グリッド） |
| `/scene` | 読書シーン一覧（9シーン） |
| `/scene/{slug}` | 読書シーン別作品一覧（静的SSGページ） |
| `/works/{fileId}` | 作品詳細 + 巻一覧 |
| `/manga/mood` | 漫画×気分タグ（インタラクティブ） |
| `/manga/by-mood/{slug}` | 漫画×ムードカテゴリ（静的SEOページ） |
| `/blog` | ブログ一覧 |
| `/blog/{slug}` | ブログ記事詳細 |
| `/books/{id}` | 個別書籍詳細（後方互換） |
| `/search` | テキスト検索 |

## 発見タグの追加方法

1. `src/data/books.index.json` の `moodTags` フィールドを更新
2. `scripts/normalize-works.ts` の `buildDiscoveryTags()` に新しいタグマッピングを追加
3. `npm run collect:works` で再生成
4. `npm run build` でビルド

## 環境変数一覧

| 変数名 | 用途 | 必須 |
|--------|------|------|
| `NEXT_PUBLIC_SITE_URL` | サイトURL | 推奨 |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 | 任意 |
| `GOOGLE_BOOKS_API_KEY` | Google Books APIキー | スクリプト実行時 |
| `ANTHROPIC_API_KEY` | AI選書バッチ（generate-scene-curated.ts） | AI選書実行時 |
| `OPENAI_API_KEY` | ブログ自動生成 | 任意 |
| `YOUTUBE_API_KEY` | ブログ自動生成 | 任意 |

> `ANTHROPIC_API_KEY` は `scripts/.env` に設定するか、OS の環境変数として設定する。
> [Anthropic Console](https://console.anthropic.com/) から取得できる。
> AI選書結果は `data/scene-curated/` に保存済みのため、
> 通常のビルド・閲覧には不要。書籍追加後の再生成時にのみ必要。

## 今回追加した機能の概要（AI選書型読書シーン）

### 変更内容
- 読書シーン画面（`/scene/{slug}`）を「大量一覧」から「AI選書結果」中心に変更
- 各作品に短い推薦理由を表示（選書・提案のトーン）
- ランキングではなく、2〜3セクションに分けた選書棚スタイルの表示
- 全作品一覧は折りたたみ（`<details>`）で補助的に残す

### 追加ファイル
| ファイル | 役割 |
|--------|------|
| `src/types/scene-curated.ts` | AI選書結果の型定義 |
| `scripts/generate-scene-candidates.ts` | シーン候補集合の生成 |
| `scripts/generate-scene-curated.ts` | AI選書バッチ（Anthropic API使用） |
| `src/components/works/CuratedSceneView.tsx` | 選書結果表示コンポーネント |
| `data/scene-candidates/{slug}.json` | 候補集合（内部用・gitignore推奨） |
| `data/scene-curated/{slug}.json` | AI選書結果（git管理・ビルド時に参照） |

### 設計原則
- **既存データ構造は変更しない**: works/volumes/scenes は一切手を加えていない
- **本番でAIを呼ばない**: 生成済みJSONを静的に配信する
- **AI選書はバッチ実行**: `npm run generate:curated` で手動または定期実行
- **フォールバック**: curated JSONが存在しないシーンは既存の全件グリッドを表示
