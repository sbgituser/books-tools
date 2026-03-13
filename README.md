# Books Tools — books.kuras-plus.com

Kindle本を感覚的に探索するためのツール集。

## 技術選定理由

| 技術 | 選定理由 |
|------|----------|
| **Next.js 16 (App Router)** | `output: 'export'` による完全静的出力。Cloudflare Pagesとの相性が良く、サーバーレス運用が可能 |
| **TypeScript** | 型安全によるバグ削減。プロバイダー抽象化（`BookProvider`インターフェース）で将来のAPI切り替えが容易 |
| **Tailwind CSS v4** | 設定ファイル不要・クラスベースで素早くUI構築。カスタムCSS最小化 |
| **Cloudflare Pages** | 無料プランで月間500ビルド・無制限リクエスト対応。不動産ツールズと同じ運用体制 |

## 低コスト理由

- **ホスティング**: Cloudflare Pages 無料プラン（$0/月）
- **データ**: 生成済みインデックスJSONを静的配信（API費用ゼロ）
- **サーバー**: 完全静的サイト（サーバー不要）
- **ドメイン**: kuras-plus.com のサブドメイン（追加費用なし）
- **Amazon API**: 初期は不要、将来のみ有料（PA-APIは無料だがアソシエイト審査が必要）

## ディレクトリ構成

```
src/
├── app/
│   ├── layout.tsx              # ルートレイアウト（メタデータ・フォント）
│   ├── page.tsx                # トップページ（ツール一覧）
│   ├── globals.css             # グローバルスタイル
│   └── similar-books/
│       └── page.tsx            # 類似本検索ツール
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── BookCard.tsx            # 書籍カード（類似理由・価格・Amazonリンク）
│   └── SearchBox.tsx
├── data/
│   ├── books.source.json       # ISBNソース（収集用）
│   └── books.index.json        # 正規化済み書誌インデックス（生成元）
└── lib/
    ├── categoryClassifier.ts   # カテゴリ推定ロジック
    └── bookProviders/
        ├── types.ts            # Book / SimilarityResult / BookProvider インターフェース
        ├── indexProvider.ts    # 分割インデックス読み込みプロバイダー（現在使用中）
        └── amazonProvider.ts   # Amazon PA-APIプロバイダー（将来用）
```

## ローカル起動

```bash
# Node.js 18+ が必要
cd books-tools
npm install
npm run dev
# → http://localhost:3000
```

## ビルド・確認

```bash
npm run build
# → out/ ディレクトリに静的ファイルが生成される
```

## デプロイ方法（Cloudflare Pages）

### 1. GitHubリポジトリを作成してプッシュ

```bash
cd books-tools
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/books-tools.git
git push -u origin main
```

### 2. Cloudflare Pagesプロジェクトを作成

1. Cloudflareダッシュボード → Workers & Pages → Create application → Pages
2. GitHubリポジトリを接続
3. ビルド設定:
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
4. 「Save and Deploy」

## DNS設定（books.kuras-plus.com）

Cloudflare DNSに以下のCNAMEレコードを追加:

```
Type:  CNAME
Name:  books
Value: <your-project>.pages.dev
TTL:   Auto
Proxy: オン（オレンジ雲）
```

### Cloudflare PagesでカスタムドメインをSet up:
1. Pages プロジェクト → Custom domains → Add custom domain
2. `books.kuras-plus.com` を入力
3. 自動でDNSレコードが追加される

## ツール追加方法

### 1. ページを追加

```bash
mkdir -p src/app/compare-books
touch src/app/compare-books/page.tsx
```

### 2. ナビゲーションに追加

`src/components/Header.tsx` の `tools` 配列にエントリを追加:

```typescript
const tools = [
  { href: "/similar-books", label: "類似本検索" },
  { href: "/compare-books", label: "本の比較" },  // ← 追加
];
```

### 3. トップページに追加

`src/app/page.tsx` の `tools` 配列に追加。

## Amazon PA-API連携方法

### 前提条件
1. Amazonアソシエイト・プログラムに参加（審査あり）
2. PA-APIのアクセスキーを取得

### 環境変数の設定

`.env.local` を作成:
```
AMAZON_ACCESS_KEY=your_access_key
AMAZON_SECRET_KEY=your_secret_key
AMAZON_PARTNER_TAG=your_associate_tag
```

### プロバイダーの実装

`src/lib/bookProviders/amazonProvider.ts` を実装:

```typescript
import { SearchItemsCommand } from "@aws-sdk/client-paapi5";

export const amazonProvider: BookProvider = {
  async search(query: string) {
    // PA-API SearchItems でキーワード検索
    // レスポンスを SimilarityResult[] に変換
    // findSimilarBooks() で類似度スコアを付与
  },
  async getById(id: string) {
    // PA-API GetItems でASIN検索
  },
};
```

### 切り替え

現在は `src/lib/bookProviders/indexProvider.ts` を利用中。将来 `amazonProvider` を使う場合は、利用箇所で `indexProvider` から差し替えます。

## 環境変数例

```bash
# .env.local（ローカル開発用）
AMAZON_ACCESS_KEY=         # Amazon PA-API アクセスキー（将来用）
AMAZON_SECRET_KEY=         # Amazon PA-API シークレットキー（将来用）
AMAZON_PARTNER_TAG=        # Amazonアソシエイトタグ（将来用）
NEXT_PUBLIC_SITE_URL=https://books.kuras-plus.com
```

## 将来拡張案

| ツール | 概要 |
|--------|------|
| `/compare-books` | 2〜3冊をサイドバイサイド比較 |
| `/book-map` | ジャンルの繋がりを視覚化（D3.js等） |
| `/kindle-sale` | Kindleセール中の本を一覧表示 |
| `/reading-time` | ページ数から読了時間を推定 |
| `/tag-explorer` | タグ・テーマベースで関連本を辿る |

## 類似表示ロジック

現在は事前計算済みの `relatedBookIds` を使って関連書籍を表示。
追加の理由表示（同著者・同カテゴリ・共通タグ）はフロント側で付与。

参照:
- `src/lib/bookProviders/indexProvider.ts`
- `scripts/build-related.ts`

スコアリング基準（`build-related.ts`）:

| 一致条件 | スコア |
|----------|--------|
| タイトルに完全含まれる | +10 |
| 著者名が一致 | +6 |
| カテゴリが一致 | +5 |
| タグが一致（1件あたり） | +3 |
| タイトルが部分一致（bigram） | +4 |
| 説明文に含まれる | +2 |

上位12件を返す。
