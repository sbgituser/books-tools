/**
 * /about — 編集方針・サイトについて
 */

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `Books Toolsについて｜編集方針・信頼性ポリシー | ${SITE_NAME}`,
  description:
    "Books Tools（books.kuras-plus.com）の編集方針・信頼性ポリシーについて。記事の作成プロセス・引用ルール・品質基準を公開しています。",
  alternates: { canonical: `${SITE_URL}/about` },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "サイトについて",
        item: `${SITE_URL}/about`,
      },
    ],
  };

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Books Tools 編集部",
    url: `${SITE_URL}/about`,
    jobTitle: "編集部",
    worksFor: {
      "@type": "Organization",
      name: "Books Tools",
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <nav className="text-xs text-stone-500 mb-4" aria-label="パンくず">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-amber-700">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li className="text-stone-700">サイトについて</li>
          </ol>
        </nav>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
          <h1 className="text-3xl font-bold text-stone-900 leading-tight">
            Books Toolsについて
          </h1>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">
              サイトの目的
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              Books Tools（books.kuras-plus.com）は、読者が「本当に読みたい本」に出会えるよう、
              厳選したおすすめ情報と便利なツールを提供するサイトです。
              漫画・小説・ビジネス書など幅広いジャンルを対象に、
              実際に読了した作品のみを紹介しています。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">
              編集部について
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              Books Tools 編集部は、年間200冊以上の書籍・漫画を読了するメンバーで構成されています。
              各メンバーが得意ジャンルを持ち、専門性を活かした記事執筆を行っています。
              記事は複数のメンバーによるレビューを経て公開されます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">
              編集方針
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-stone-700 mb-1">
                  1. 実際に読了した作品のみを紹介
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  おすすめ記事で紹介する作品は、編集部メンバーが実際に読了したものに限定しています。
                  未読の作品を推薦したり、他サイトの評価のみを参考にした記事は作成しません。
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-700 mb-1">
                  2. 出典の明記
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  発行部数・受賞歴・公開レビューなどの情報は、出版社公式サイト・公式SNS・
                  Amazonレビュー（閲覧日を明記）など信頼できる情報源のみを使用します。
                  匿名掲示板や出典不明の情報は引用しません。
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-700 mb-1">
                  3. AI生成コンテンツの取り扱い
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  記事執筆の一部にAIツールを活用する場合がありますが、
                  架空のレビュー・架空のエピソード・架空の引用は一切作成しません。
                  最終的な内容は編集部メンバーが確認・監修しています。
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-700 mb-1">
                  4. 定期的な更新
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  掲載情報（巻数・完結状態・アニメ化状況など）は定期的に確認し、
                  最新の状態に更新しています。各記事には公開日と最終更新日を明記しています。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">
              引用ルール
            </h2>
            <div className="text-sm text-stone-700 leading-relaxed space-y-2">
              <p>当サイトで引用する情報の出典基準は以下の通りです。</p>
              <ul className="list-disc pl-5 space-y-1 text-stone-600">
                <li>出版社公式サイト・公式note</li>
                <li>
                  Amazonレビューの公開文面（引用時は閲覧日を明記）
                </li>
                <li>作者・出版社の公式SNS投稿</li>
                <li>アニメ化時の公式ティザー・プレスリリース</li>
              </ul>
              <p className="text-stone-500 text-xs mt-2">
                ※ 匿名掲示板・出典不明の情報・AI生成の架空レビューは使用しません。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">
              アフィリエイトについて
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              当サイトの一部リンクにはAmazonアソシエイトを含むアフィリエイトリンクが含まれています。
              リンク経由で商品を購入された場合、当サイトが紹介料を受け取ることがありますが、
              これにより読者の購入価格が変わることはありません。
              アフィリエイト収益は記事のランキングや評価に影響を与えません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-stone-800 mb-3">
              お問い合わせ
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed">
              記事内容の誤り・引用に関するご指摘・その他ご意見は
              <Link
                href="/contact"
                className="text-amber-700 hover:text-amber-800 underline"
              >
                お問い合わせページ
              </Link>
              よりご連絡ください。
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
