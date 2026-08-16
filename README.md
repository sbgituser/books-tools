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

# 類似作品データ生成（data/similar-works/）
npm run generate:similar

# 特定作品のみ再生成する場合
npx tsx scripts/generate-similar-works.ts --work manga__bleach__久保帯人

# 上記4つをまとめて実行（normalize + works + scenes + similar）
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
# Step 1: 書籍データを正規化・生成（既存フロー + 類似作品生成も含む）
npm run collect:works
# ※ collect:works は内部で以下を順に実行する:
#   normalize:works → generate:works → generate:scenes → generate:similar

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

> **Note:** 類似作品データ（`data/similar-works/`）は `npm run collect:works` に含まれるため、
> 書籍追加後に別途コマンドを実行する必要はない。

> **Note:** AI選書の再実行は Anthropic API キーが必要。
> `scripts/.env` に `ANTHROPIC_API_KEY=sk-ant-...` を設定すること。
> curated JSON は `data/scene-curated/` に保存されるため、
> ビルド時には自動的にバンドルされる。

### 画像・著作権チェックリスト(新しい書影表示箇所を追加する時に必ず確認)

本サイトの書影は **Google Books API**(`books.google.com/books/content?...`)と
**Open Library**(`covers.openlibrary.org`)から取得している。**Amazon商品画像は一切使用しない**
(Amazon PA-API/Creators APIは自社サーバーへの保存禁止・改変禁止など制約が厳しく、
かつ利用にはAmazonアソシエイトの売上実績が必要なため、現状は対象外)。

書影を表示する新しいコンポーネント・ページを追加する場合、以下を必ず満たすこと:

1. **Google Booksの画像を表示するページ・カードには、その書籍のGoogle Booksページ
   (`https://books.google.com/books?id={googleBooksId}`)への明確なリンクを必ず設置する。**
   (Googleの利用ガイドラインで必須。「表示する書籍には、Google Booksページまたは
   自サイトのプレビューページへの明確なリンクを付けること」と定められている)
   - 直接リンクを貼れない場合は、`/works/[workId]` など**それ自体がGoogle Booksへの
     リンクを持つ内部ページ**へリンクすることで代替可(間接的に要件を満たす)
   - 参考実装: `src/app/works/[workId]/page.tsx` の `googleBooksUrl` /
     `src/components/BlogBookInlineCard.tsx` / `src/components/tools/MediaOriginalsClient.tsx`
2. Open Libraryの画像については必須の帰属表示はないが、**自社サーバーへの保存・キャッシュや
   大量クロールは行わない**こと(`next.config.ts` の `images.unoptimized: true` により、
   常に画像元へ直接リクエストする構成を維持する。ダウンロードして自前ホスティングしない)
3. **Amazon商品画像を新たに使おうとしていないか確認する。** Amazonへのリンクは
   アフィリエイトリンク(`buildAmazonUrl`)としてのみ使用し、商品画像そのものは
   Amazonから取得しない
4. 新しいコンポーネントを追加した際は、そのコンポーネントが実際にどこかのページから
   使われているか確認すること(未使用の書影コンポーネントを増やさない。
   `src/components/BookCard.tsx` 等、過去に使われなくなったコンポーネントが残っている例がある)

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

## 追加した機能の概要（類似作品探索）

### 概要
作品詳細ページ（`/works/{fileId}`）に「似た作品」セクションを追加し、
作品起点で類似作品を探せる機能を実装。

従来の「似た作品を探す」ボタンは `/discover`（気分タグ検索）への汎用遷移だったが、
「この作品から自然に広げて探せる」体験へ置き換えた。

### 類似作品の生成ロジック（ルールベース・バッチ生成）

| グループ | 選定基準 | 上限 |
|--------|---------|------|
| 同じ作者の作品 | `authors` 配列の重複 | 6件 |
| 同じ出版社・レーベルから探す | `publisherMain` 一致 + 同タイプ | 5件 |
| 読み味が近い作品 | `discoveryTags` の共通数（2タグ以上） | 6件 |

- **本番でAIを呼ばない**: ルールベースで生成、静的JSONを配信
- **既存データ構造は変更しない**: works/volumes には手を加えていない
- **補助生成物として追加**: `data/similar-works/` に per-work JSON を保存

### 生成カバレッジ（757作品）
- 同一著者グループあり: 337作品
- 同一出版社グループあり: 374作品
- 読み味グループあり: 386作品
- 類似なし（表示なし）: 163作品

### 追加ファイル

| ファイル | 役割 |
|--------|------|
| `src/types/similar-works.ts` | 類似作品データの型定義 |
| `scripts/generate-similar-works.ts` | 類似作品バッチ生成 |
| `src/components/works/SimilarWorksSection.tsx` | 類似作品表示コンポーネント |
| `data/similar-works/{fileId}.json` | per-work 類似作品データ（git管理・ビルド時に参照） |

### 設計原則
- **既存データ構造は変更しない**: works/volumes/scenes は一切手を加えていない
- **本番でAIを呼ばない**: ルールベースで生成した静的JSONを読み込むだけ
- **補助生成物として外付け**: `data/similar-works/` に保存、`prebuild` で自動再生成
- **フォールバック**: 類似データが存在しない作品は「似た作品」セクションを非表示

### 保守上の注意
- `publisherMain` が未設定の作品（約291件）は同一出版社グループが出ない
- `discoveryTags` が未設定の作品は読み味グループが出ない
- 著者データ・タグデータが充実するほど類似精度が上がる
- 新しいグループ軸を追加する場合は `generate-similar-works.ts` に関数を追加し、
  `SimilarGroupType`（`src/types/similar-works.ts`）に型を追記する

---

## 追加した機能の概要（AI選書型読書シーン）

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

---

## 発見機能のcurated化（discover-curated）

### 変更内容
- 「発見する」ページ（`/discover`）を「条件選択 → 大量一覧」から「気分選択 → AI選書 → 補助一覧」へ改修
- ユーザーが技術的タグではなく「今の気分」（感動したい、深く考えたい等）を選ぶUI
- 選択後は10〜15作品に厳選されたAI選書を表示（ランキングなし・理由付き・セクション分割）
- 全作品は「全作品を見る」ボタンで補助的にアクセス可能

### 追加ファイル

| ファイル | 役割 |
|--------|------|
| `src/constants/discoverMoods.ts` | ムード（読書気分）定義（8種） |
| `src/types/discover-curated.ts` | AI選書結果の型定義 |
| `scripts/generate-discover-candidates.ts` | ムード候補集合の生成 |
| `scripts/generate-discover-curated.ts` | AI選書バッチ（Anthropic API使用） |
| `scripts/copy-discover-curated.ts` | `data/discover-curated/` → `public/data/discover-curated/` コピー（prebuild時） |
| `src/components/works/CuratedDiscoverView.tsx` | AI選書結果表示コンポーネント |
| `data/discover-candidates/{slug}.json` | 候補集合（内部用） |
| `data/discover-curated/{slug}.json` | AI選書結果（git管理・prebuildでpublicにコピー） |

### ムード一覧

| slug | ラベル | 対応タグ |
|------|--------|----------|
| emotional | 感動したい | 感動, 泣ける, 切ない, 心温まる |
| think | 深く考えたい | 考えさせられる, 深い, 学べる |
| binge | 一気読みしたい | 一気読み, 世界観重視 |
| excited | 熱くなりたい | 熱い, 爽快, バトル, やる気が出る, 前向き |
| laugh | 笑いたい | 笑える, 明るい, 日常系 |
| dark | ダークな世界を覗きたい | ダーク, 怖い, 絶望, 深い |
| immerse | 世界観に浸りたい | 世界観重視, ファンタジー, 深い |
| easy | 気軽に読みたい | 読みやすい, 明るい, 日常系, 短編 |

### 設計原則
- **既存データ構造は変更しない**: works/volumes/scenes は一切手を加えていない
- **本番でAIを呼ばない**: 生成済みJSONを静的に配信する
- **AI選書はバッチ実行**: `npm run generate:discover-curated` で手動実行
- **フォールバック**: curated JSONが存在しないムードは全件一覧を表示

### 更新手順

書籍データ更新後に発見機能を更新する場合：

```bash
# 1. 書籍データ更新・正規化
npm run normalize:works

# 2. works / シーンデータ再生成
npm run generate:works
npm run generate:scenes

# 3. 候補データ再生成（discover用）
npm run generate:discover-candidates

# 4. AI選書再生成（ANTHROPIC_API_KEY が必要）
#    scripts/.env に ANTHROPIC_API_KEY=sk-ant-... を追加してから実行
npm run generate:discover-curated

# 5. ビルド & デプロイ
npm run build
# → Cloudflare Pages に自動デプロイ（git push）

# ムードを特定して更新する場合
npm run generate:discover-candidates -- --mood emotional
npm run generate:discover-curated -- --mood emotional
```

### 新しいムードを追加する手順

1. `src/constants/discoverMoods.ts` に `DISCOVER_MOODS` エントリを追加
2. `scripts/generate-discover-curated.ts` の `MOOD_CRITERIA` に選書観点を追記
3. `npm run generate:discover-candidates -- --mood {新slug}` で候補生成
4. `npm run generate:discover-curated -- --mood {新slug}` でAI選書
5. `npm run build` でビルド

### コマンド一覧

| コマンド | 説明 |
|--------|------|
| `npm run generate:discover-candidates` | 全ムードの候補データ生成 |
| `npm run generate:discover-candidates -- --mood {slug}` | 特定ムードのみ |
| `npm run generate:discover-curated` | 全ムードのAI選書（API Key必要） |
| `npm run generate:discover-curated -- --mood {slug}` | 特定ムードのみ |
| `npm run collect:discover` | candidates + curated を連続実行 |
| `npm run generate:candidates` | シーン候補データ生成 |
| `npm run generate:curated` | シーンAI選書（API Key必要） |
| `npm run collect:curated` | シーン candidates + curated |
| `npm run collect:all` | 全データ再生成 |
| `npm run build` | 本番ビルド（prebuildで全コピー込み） |
