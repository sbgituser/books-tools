/**
 * /contact — お問い合わせページ
 */

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `お問い合わせ | ${SITE_NAME}`,
  description: "Books Tools（books.kuras-plus.com）へのお問い合わせ。サイトに関するご意見・ご質問はこちらから。",
  alternates: { canonical: `${SITE_URL}/contact` },
  robots: { index: true, follow: true },
};

export default function ContactPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "お問い合わせ", item: `${SITE_URL}/contact` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          {/* パンくず */}
          <nav aria-label="パンくず" className="text-xs text-stone-400 mb-6">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-rose-500">ホーム</Link></li>
              <li>/</li>
              <li className="text-stone-600 font-medium">お問い合わせ</li>
            </ol>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-4">
            お問い合わせ
          </h1>
          <p className="text-stone-500 text-sm mb-10 leading-relaxed">
            Books Toolsに関するご意見・ご質問・不具合のご報告などをお待ちしております。
          </p>

          <div className="space-y-6">
            {/* 不具合の報告 */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl" aria-hidden="true">🐛</span>
                <h2 className="text-lg font-bold text-stone-800">不具合の報告</h2>
              </div>
              <p className="text-stone-600 text-sm leading-relaxed">
                表示の不具合やデータの誤りを発見された場合は、ご報告いただけると助かります。
                書籍タイトル・URL等、具体的な情報をお添えいただけるとスムーズに対応できます。
              </p>
            </div>

            {/* FAQ */}
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl" aria-hidden="true">❓</span>
                <h2 className="text-lg font-bold text-stone-800">よくあるご質問</h2>
              </div>
              <dl className="text-sm space-y-4 text-stone-600">
                <div>
                  <dt className="font-bold text-stone-700">Q. 書籍の掲載を依頼できますか？</dt>
                  <dd className="mt-1 leading-relaxed">
                    現在、書籍データは定期的に自動収集・更新しています。
                    特定の書籍の掲載をご希望の場合は、お気軽にご連絡ください。
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-stone-700">Q. 掲載情報に誤りがあります</dt>
                  <dd className="mt-1 leading-relaxed">
                    書籍情報はGoogle Books APIおよびAmazon商品データに基づいています。
                    誤りを発見された場合は、該当ページのURLとともにご連絡ください。
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-stone-700">Q. 利用料金はかかりますか？</dt>
                  <dd className="mt-1 leading-relaxed">
                    当サイトはすべて無料でご利用いただけます。
                    ユーザー登録も不要です。
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
