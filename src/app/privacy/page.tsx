/**
 * /privacy — プライバシーポリシーページ
 */

import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: `プライバシーポリシー | ${SITE_NAME}`,
  description: "Books Tools（books.kuras-plus.com）のプライバシーポリシー。個人情報の取扱い、Cookie、広告配信について。",
  alternates: { canonical: `${SITE_URL}/privacy` },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          {/* パンくず */}
          <nav aria-label="パンくず" className="text-xs text-stone-400 mb-6">
            <ol className="flex items-center gap-1.5">
              <li><Link href="/" className="hover:text-rose-500">ホーム</Link></li>
              <li>/</li>
              <li className="text-stone-600 font-medium">プライバシーポリシー</li>
            </ol>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-8">
            プライバシーポリシー
          </h1>

          <div className="prose prose-stone prose-sm max-w-none space-y-8">
            <section>
              <h2 className="text-lg font-bold text-stone-800 mb-3">1. 運営者情報</h2>
              <p className="text-stone-600 leading-relaxed">
                当サイト「Books Tools」（以下「当サイト」）は、kuras-plus が運営する
                書籍発見・探索サービスです。
              </p>
              <ul className="list-disc list-inside text-stone-600 mt-2 space-y-1">
                <li>サイト名: Books Tools</li>
                <li>URL: https://books.kuras-plus.com</li>
                <li>運営者: kuras-plus</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-800 mb-3">2. 個人情報の収集</h2>
              <p className="text-stone-600 leading-relaxed">
                当サイトは、ユーザー登録機能を提供しておらず、氏名・メールアドレス等の
                個人情報を直接収集することはありません。ただし、お問い合わせフォームを
                ご利用いただく場合は、ご連絡に必要な情報をご提供いただくことがあります。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-800 mb-3">3. アクセス解析ツール</h2>
              <p className="text-stone-600 leading-relaxed">
                当サイトでは、Googleアナリティクスを使用してアクセス情報を収集しています。
                このデータはCookieを使用して収集されており、個人を特定する情報は含まれません。
                データの収集・処理についてはGoogleのプライバシーポリシーに基づきます。
              </p>
              <p className="text-stone-600 leading-relaxed mt-2">
                Cookieを無効にすることで、これらの情報収集を拒否することが可能です。
                お使いのブラウザの設定をご確認ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-800 mb-3">4. 広告配信について</h2>
              <p className="text-stone-600 leading-relaxed">
                当サイトでは、第三者配信の広告サービス（Google AdSense等）を利用する場合があります。
                広告配信事業者は、ユーザーの興味に応じた広告を表示するためにCookieを使用することがあります。
              </p>
              <p className="text-stone-600 leading-relaxed mt-2">
                Google AdSenseに関する詳細は、
                <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-rose-600 hover:underline">
                  Google広告に関するポリシー
                </a>
                をご参照ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-800 mb-3">5. Amazon アソシエイト</h2>
              <p className="text-stone-600 leading-relaxed">
                当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を
                獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、
                Amazonアソシエイト・プログラムの参加者です。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-800 mb-3">6. 免責事項</h2>
              <p className="text-stone-600 leading-relaxed">
                当サイトに掲載されている書籍情報・価格等は、情報収集時点のものであり、
                最新の情報と異なる場合があります。正確な情報はリンク先のAmazon等で
                ご確認ください。当サイトの情報に基づいて行われた行為について、
                当サイト運営者は一切の責任を負いかねます。
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-stone-800 mb-3">7. ポリシーの変更</h2>
              <p className="text-stone-600 leading-relaxed">
                当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。
                変更後のポリシーは当ページに掲載した時点で効力を生じます。
              </p>
            </section>

            <p className="text-stone-400 text-xs mt-8">
              制定日: 2026年3月24日
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
