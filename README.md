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
│   ├── types/
│   │   ├── work.ts                   # Work / Volume / DiscoveryIndex 型
│   │   └── book.ts                   # 既存 Mood タグ型
│   └── ...
├── scripts/
│   ├── normalize-works.ts            # [NEW] books.index.json → works / volumes
│   ├── generate-works-data.ts        # [NEW] normalized → public/data/
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
generate-works-data.ts
       ↓
public/data/works-list.json
public/data/discovery-index.json
public/data/works/{fileId}.json  ← per-work 詳細（巻情報含む）
```

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

# 上記をまとめて実行
npm run collect:works

# 既存の書籍メタデータ補完（Google Books API 使用）
npm run fetch:books

# 関連書籍グラフ生成
npm run build:related
```

## ローカル起動

```bash
npm run dev
# → http://localhost:3000
```

## ビルド

```bash
npm run build
# prebuild: normalize-works → generate-works → build-split-index → build-search-index → generate-feeds
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
| `/` | トップページ（気分タグ導線・発見ファーストUI） |
| `/discover` | 発見機能（タグフィルタ + 作品グリッド） |
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
| `OPENAI_API_KEY` | ブログ自動生成 | 任意 |
| `YOUTUBE_API_KEY` | ブログ自動生成 | 任意 |
