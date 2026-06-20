# T-1180 books-tools SEO構造改善レポート

- **対象サイト**: https://books.kuras-plus.com/ (Books Discover)
- **リポジトリ**: `C:\Users\ukuiu\Documents\work\books-tools`
- **スタック**: Next.js 16 (App Router) static export → Cloudflare Pages
- **作業日**: 2026-06-21
- **目的**: Search Consoleで「クロール済み - インデックス未登録」が大量発生しインデックス登録0件の状態を、GA4実績ページを保護しつつ構造的に改善する。

> ⚠️ タスク指示は「Astro想定」でしたが、実際のスタックは **Next.js 16 App Router** でした。指示の意図（保護リスト・seoPolicy・seo-audit・frontmatter seoStatus・sitemap再構成・E-E-A-T修正）を Next.js の構成に合わせて実装しています。

---

## 1. 変更したファイル一覧

### 新規作成
| ファイル | 役割 |
|---|---|
| `src/data/seo-protected-pages.ts` | GA4実績ページ／ユーザー指定の保護リスト（保護判定API付き） |
| `src/lib/seoPolicy.ts` | index/protect/noindex/sitemap掲載の判定を一元化。protected違反検出の安全装置 |
| `scripts/seo-audit.ts` | サイト全体のSEO監査。`reports/seo-audit.md` / `reports/seo-audit.csv` を出力 |

### 変更
| ファイル | 変更内容 |
|---|---|
| `src/lib/blog.ts` | `BlogMeta` に `seoStatus` / `canonicalSlug` / `redirectTo` / `pillarGroup` / `isPillar` / `protectedReason` を追加。`parseMeta` でfrontmatterから読み込み |
| `src/app/blog/[slug]/page.tsx` | `resolveBlogSeo()` で robots・canonical を出力。危険なE-E-A-T表現（「実際の読書体験をもとに作成」）を修正。メタ説明のフォールバック文言を是正 |
| `src/app/page.tsx` | トップの「今週の人気記事」で保護記事を優先表示（内部リンク集中） |
| `src/app/about/page.tsx` | 「実際に読了した作品のみ」「年間200冊読了する編集部」等の虚偽E-E-A-T表現を、データ・選定基準ベースの記述に全面修正 |
| `scripts/generate-sitemap.ts` | blog sitemapに `seoPolicy` を適用（noindex/redirect/canonical統合を除外）。protected記事の優先度引き上げ。**protected記事がsitemapから漏れたらビルドを止める安全装置**を追加 |
| `package.json` | `seo:audit` スクリプトを追加 |
| `content/blog/*.mdx` (4本) | 保護記事に `seoStatus: "protect"` 等のfrontmatterを追加（下記） |
| `content/blog/*.mdx` (22本) | 虚偽E-E-A-T表現（読了済み・未確認レビュー引用・無出典の受賞断定）を中立表現へ修正 |

---

## 2. protected対象ページ一覧とseoStatus

| URL / path | タイトル | GA4実績(表示/UU) | seoStatus | 管理方法 |
|---|---|---|---|---|
| `/` | Books Discover トップページ | 38 / 37 | protect | `seo-protected-pages.ts`（パス保護）+ ルートlayout自己canonical |
| `/blog/2026-adaptation-original-books` | 2026年映像化決定・公開予定の原作本一覧 | 290 / 218 | protect | frontmatter + 保護リスト |
| `/blog/movie-adapted-novels` | 映画化・映像化された小説おすすめ30選 | 42 / 37 | protect | frontmatter + 保護リスト |
| `/blog/trending-novels-2026` | 2026年 今話題の小説おすすめ20選 | 26 / 22 | protect | frontmatter + 保護リスト |
| `/blog/philosophical-novels` | 哲学的な小説おすすめ15選 | 20 / 16 | protect | frontmatter + 保護リスト |

保護記事のfrontmatterには以下を設定：
```yaml
seoStatus: "protect"
protectedReason: "GA4で表示回数またはアクティブユーザー実績あり。SEO整理時にnoindex/redirect/canonical統合しない。"
pillarGroup: "adaptation" | "novel-picks"
isPillar: true
```

**二重防御**: frontmatterと `seo-protected-pages.ts` の両方に登録。`seoPolicy` は保護リストを最優先で評価するため、万一frontmatterが書き換わってもprotectが維持されます。

---

## 3. URL数サマリ（seo:audit / 実ビルド出力）

### 監査結果（`npm run seo:audit`）
| 指標 | 値 |
|---|---|
| 監査URL総数 | 3,060 |
| **index対象URL数** | **1,639** |
| **noindex対象URL数** | **1,421**（薄い作品ページ。noindex,follow） |
| **sitemap掲載URL数** | **1,639** |
| protected対象URL数 | 5 |
| strengthen推奨 | 339（薄いが流入可能性があるためnoindex化せず強化推奨） |
| merge候補 | 120（重複候補。統合は自動処理せず要判断） |
| **protected違反** | **0** |

### 実ビルドで生成されたsitemap（`public/sitemap-*.xml`）
| sitemap | URL数 |
|---|---|
| sitemap-static.xml | 4 |
| sitemap-tools.xml | 104 |
| sitemap-works-1.xml | 500（summaryあり・高品質） |
| sitemap-works-2.xml | 437（summaryあり・高品質） |
| sitemap-works-tags.xml | 339（タグのみ・低優先度） |
| sitemap-blog.xml | 257（/blog + 記事256本、除外0件） |
| sitemap-discover.xml | 1 |
| **合計** | **1,642 URL** |

> 薄い作品ページ約1,369本はsitemapから除外され `noindex,follow`。クロール予算を保護記事・柱記事・あらすじ付き作品ページへ集中させます。

---

## 4. protected検証結果（実ビルドHTMLで確認）

### ✅ protected対象がsitemapに含まれていること
ビルドログで安全装置が確認：
```
✅ sitemap-blog.xml   : 257 URLs (除外 0 件)
🛡️  protected記事 4 件すべて sitemap に掲載確認
```
トップページ `/` は `sitemap-static.xml` に掲載済み。

### ✅ protected対象にnoindexが出ていないこと
実際の静的HTML（`out/blog/*.html`）を grep で確認。4本すべて：
```
<meta name="robots" content="index, follow">
```

### ✅ protected対象のcanonicalが自己参照であること
| ページ | canonical |
|---|---|
| `/` | `https://books.kuras-plus.com` |
| movie-adapted-novels | `…/blog/movie-adapted-novels` |
| philosophical-novels | `…/blog/philosophical-novels` |
| 2026-adaptation-original-books | `…/blog/2026-adaptation-original-books` |
| trending-novels-2026 | `…/blog/trending-novels-2026` |

### 参考: 薄い作品ページのnoindex動作確認
`out/works/002teaa.html` → `<meta name="robots" content="noindex, follow">`（既存方針どおり動作）。

---

## 5. seo-audit実行結果サマリ

`npm run seo:audit` で `reports/seo-audit.md` と `reports/seo-audit.csv` を出力。

### 推奨対応の優先順位（指示どおり）
`protected > index > strengthen > merge > noindex / redirect / canonical`
→ **アクセス実績がある可能性のあるページはいきなりnoindexにせず strengthen** と判定。

### 種別別 index/noindex
| 種別 | index | noindex |
|---|---:|---:|
| blog | 256 | 0 |
| work | 1,276 | 1,369 |
| genre / scene / tool / その他 | 107 | 0 |

### 重複候補グループ（merge要判断・自動処理なし）
ランキング(36) / 初心者(21) / ミステリー(19) / SF(14) / アニメ(8) / 異世界(6) / ファンタジー漫画(4) / 歴史(4) / 泣ける(4) / 恋愛(4)

---

## 6. npm run build 結果

✅ **成功（exit code 0）**

- `prebuild`（works正規化・sitemap生成・OGP生成等）完了
- TypeScript型チェック通過
- 静的ページ 3,071 ページ生成完了
- `postbuild-cleanup` 実行完了（RSC subdir 2,980件整理、最終ファイル数 12,516）
- ビルド時の sitemap 安全装置でprotected 4記事の掲載を確認

補足: `npm run lint` は既存コード（discover系・blog.tsのtagsLower等）に既存の警告/エラーが多数ありますが、**今回追加した新規ファイル（seoPolicy.ts / seo-protected-pages.ts / seo-audit.ts / blog [slug] 修正）にはlint問題なし**。`npm run build` 自体は成功しています。

---

## 7. Search ConsoleでURL検査すべきURL 10本

インデックス回復の起点として、以下を優先的にURL検査・インデックス登録リクエスト：

1. `https://books.kuras-plus.com/`（トップ・保護）
2. `https://books.kuras-plus.com/blog/2026-adaptation-original-books`（最多流入・保護）
3. `https://books.kuras-plus.com/blog/movie-adapted-novels`（保護）
4. `https://books.kuras-plus.com/blog/trending-novels-2026`（保護）
5. `https://books.kuras-plus.com/blog/philosophical-novels`（保護）
6. `https://books.kuras-plus.com/blog`（ブログ一覧・主要導線）
7. `https://books.kuras-plus.com/discover`（ツール型トップ）
8. `https://books.kuras-plus.com/tools/media-originals`（映像→原作。保護記事と相互送客する柱ツール）
9. `https://books.kuras-plus.com/tools/reading-order`（読む順番。独自性の高い柱）
10. `https://books.kuras-plus.com/scene`（シーンで探す。ツール型サイトの核）

---

## 8. 今後判断が必要なページ一覧（今回noindexにしていない）

指示の「いきなりnoindexにせず、まず分類する」に従い、以下は**今回noindex/redirect/削除していません**。GA4で流入を確認のうえ次フェーズで判断してください。

### A. strengthen候補（本文が薄い／約1,200字未満・339件）
流入実績が不明なため noindex化せず**内容強化**を推奨。代表例は `reports/seo-audit.csv` の `recommendation=strengthen` 行を参照。

### B. merge候補（重複グループ・120件）
柱記事への統合または内部リンク強化を要検討（**削除・redirectはしない**）。代表例：
- 異世界系6本 → 柱記事へ集約検討
- ファンタジー漫画4本 → 柱記事へ集約検討
- 初心者向け21本 / ミステリー19本 / ランキング36本 → 柱記事を1本立て、残りはsupportとして内部リンク

### C. 作品タグのみページ（339件・sitemap低優先度）
あらすじ追記で summary 付きに昇格できれば index 強化。未対応なら現状維持（noindexではない）。

### 次フェーズ推奨アクション
1. GA4で過去90日の記事別流入を取得し、strengthen候補のうち**流入0かつ重複**のものだけ `seoStatus: "noindex"` または `"canonical"` を frontmatter に設定（seoPolicyが自動でsitemap除外）。
2. 柱記事を確定し、pillarGroup単位の相互内部リンクを実装。
3. 映像化系記事（adaptation pillarGroup）と novel-picks の相互リンクを本文に追加。

---

## 付録: 安全装置（再発防止）

- **ビルド時ガード**: `generate-sitemap.ts` が protected記事のsitemap漏れを検出するとビルドを **throw で停止**。
- **監査時ガード**: `seo-audit.ts` が protected記事へのnoindex/redirect/別canonical設定を検出すると `process.exitCode=1` で警告。
- **二重登録**: 保護対象はfrontmatterと `seo-protected-pages.ts` の両方で管理し、`seoPolicy` が保護を最優先評価。

これにより「protected対象を誤ってnoindex/redirect/canonical統合/sitemap除外する」事故を構造的に防止します。
