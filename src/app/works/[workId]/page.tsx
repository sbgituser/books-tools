/**

 * /works/[workId]/page.tsx

 *

 * workId ã¯ djb2 ããã·ã¥ãã¼ã¹ã® fileIdã

 * public/data/works/{fileId}.json ãã WorkDetail ãèª­ã¿è¾¼ãã§è¡¨ç¤ºããã

 */



import { readFileSync, readdirSync, existsSync } from "fs";

import { join } from "path";

import { notFound } from "next/navigation";

import type { Metadata } from "next";

import Link from "next/link";

import Image from "next/image";

import Header from "@/components/Header";

import Footer from "@/components/Footer";

import SimilarWorksSection from "@/components/works/SimilarWorksSection";

import { SITE_NAME, SITE_URL, amazonProductUrl, amazonSearchUrl } from "@/lib/site";

import type { WorkDetail, Volume } from "@/types/work";

import type { SimilarWorks } from "@/types/similar-works";



// ââ ãã¼ã¿ã¢ã¯ã»ã¹ ââââââââââââââââââââââââââââââââââââââââââââââââ



function getWorksDir(): string {

  return join(process.cwd(), "public", "data", "works");

}



function getWork(fileId: string): WorkDetail | null {

  try {

    const path = join(getWorksDir(), `${fileId}.json`);

    return JSON.parse(readFileSync(path, "utf-8")) as WorkDetail;

  } catch {

    return null;

  }

}



function getSimilarWorks(fileId: string): SimilarWorks | null {

  try {

    const path = join(process.cwd(), "data", "similar-works", `${fileId}.json`);

    if (!existsSync(path)) return null;

    return JSON.parse(readFileSync(path, "utf-8")) as SimilarWorks;

  } catch {

    return null;

  }

}



// ââ éççæ âââââââââââââââââââââââââââââââââââââââââââââââââââââ



export async function generateStaticParams() {

  try {

    const dir = getWorksDir();

    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));

    return files.map((f) => ({ workId: f.replace(/\.json$/, "") }));

  } catch {

    return [];

  }

}



// ââ ã¡ã¿ãã¼ã¿ ââââââââââââââââââââââââââââââââââââââââââââââââââââ



export async function generateMetadata({

  params,

}: {

  params: Promise<{ workId: string }>;

}): Promise<Metadata> {

  const { workId: fileId } = await params;

  const work = getWork(fileId);

  if (!work) return {};



  const title = `${work.title}ï½${work.authorDisplay} | ${SITE_NAME}`;

  const typeLabel = work.type === "manga" ? "æ¼«ç»" : "å°èª¬";

  const desc = [

    work.summaryShort,

    `${work.title}ï¼${work.authorDisplay}ï¼ã®${typeLabel}ã`,

    work.discoveryTags.length > 0 ? work.discoveryTags.slice(0, 4).join("ã»") + "ãªã©ã" : "",

    work.volumeCount > 1 ? `å¨${work.volumeCount}å·»ã` : "",

    "æ°åã»é°å²æ°ããæ¬ãæ¢ããªã Books Discoverã",

  ]

    .filter(Boolean)

    .join(" ");



  return {

    title,

    description: desc,

    alternates: { canonical: `${SITE_URL}/works/${fileId}` },

    openGraph: {

      title: `${work.title}ï½${work.authorDisplay}`,

      description: desc,

      type: "book",

      images: work.coverImageUrl ? [work.coverImageUrl] : [],

      url: `${SITE_URL}/works/${fileId}`,

    },

  };

}



// ââ ãµãã³ã³ãã¼ãã³ã âââââââââââââââââââââââââââââââââââââââââââââ



function VolumeCard({ vol }: { vol: Volume }) {

  const amazonUrl = amazonProductUrl(vol.isbn13, vol.title);



  const imgSrc =

    vol.coverImageUrl ??

    (vol.googleBooksId

      ? `https://books.google.com/books/content?id=${vol.googleBooksId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`

      : null);



  return (

    <div className="flex gap-3 p-3 bg-white border border-stone-200 rounded-xl hover:border-rose-300 hover:shadow-sm transition-all">

      {/* ãµã ãã¤ã« */}

      <div className="relative w-12 flex-shrink-0 rounded overflow-hidden bg-stone-100" style={{ height: 72 }}>

        {imgSrc ? (

          <Image

            src={imgSrc}

            alt={vol.volumeLabel}

            fill

            sizes="48px"

            className="object-cover"

            unoptimized

          />

        ) : (

          <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-xs text-center p-1">

            ð

          </div>

        )}

      </div>



      {/* æå ± */}

      <div className="flex-1 min-w-0">

        <p className="text-sm font-bold text-stone-800 line-clamp-1">{vol.volumeLabel}</p>

        <p className="text-xs text-stone-400 line-clamp-1 mb-1">{vol.title}</p>

        <div className="flex items-center gap-2">

          {vol.publishedDate && (

            <span className="text-xs text-stone-400">{vol.publishedDate.slice(0, 7)}</span>

          )}

          {vol.pageCount && (

            <span className="text-xs text-stone-400">{vol.pageCount}p</span>

          )}

        </div>

      </div>



      {/* Amazon */}

      <a

        href={amazonUrl}

        target="_blank"

        rel="noopener noreferrer"

        className="self-center flex-shrink-0 text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold px-2 py-1 rounded-lg transition-colors"

      >

        Amazon â

      </a>

    </div>

  );

}



// ââ ãã¼ã¸ ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ



const TYPE_LABEL = { manga: "æ¼«ç»", novel: "å°èª¬", other: "æ¸ç±" } as const;

const TYPE_COLOR = {

  manga: "bg-rose-100 text-rose-700 border-rose-200",

  novel: "bg-sky-100 text-sky-700 border-sky-200",

  other: "bg-stone-100 text-stone-600 border-stone-200",

} as const;

const STATUS_LABEL = { completed: "å®çµ", ongoing: "é£è¼ä¸­", unknown: "" } as const;



export default async function WorkDetailPage({

  params,

}: {

  params: Promise<{ workId: string }>;

}) {

  const { workId: fileId } = await params;

  const work = getWork(fileId);

  if (!work) notFound();



  const similar = getSimilarWorks(fileId);



  const typeLabel = TYPE_LABEL[work.type] ?? "æ¸ç±";

  const typeColor = TYPE_COLOR[work.type] ?? TYPE_COLOR.other;

  const statusLabel = STATUS_LABEL[work.status];

  const workAmazonUrl = amazonSearchUrl(work.title);



  const jsonLd = {

    "@context": "https://schema.org",

    "@type": "Book",

    name: work.title,

    author: work.authors.map((a) => ({ "@type": "Person", name: a })),

    ...(work.publisherMain

      ? { publisher: { "@type": "Organization", name: work.publisherMain } }

      : {}),

    url: `${SITE_URL}/works/${fileId}`,

  };



  return (

    <>

      <script

        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}

      />

      <Header />

      <main className="min-h-screen bg-stone-50">

        <div className="max-w-4xl mx-auto px-4 py-8">



          {/* ãã³ãã */}

          <nav aria-label="ãã³ãã" className="text-xs text-stone-400 mb-6">

            <ol className="flex items-center gap-1.5 flex-wrap">

              <li><Link href="/" className="hover:text-rose-600">ãã¼ã </Link></li>

              <li>/</li>

              <li><Link href="/discover" className="hover:text-rose-600">çºè¦ãã</Link></li>

              <li>/</li>

              <li className="text-stone-600 font-medium truncate max-w-[200px]">{work.title}</li>

            </ol>

          </nav>



          {/* ä½åã¡ã¤ã³ã«ã¼ã */}

          <section className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-8 mb-8 shadow-sm">

            <div className="flex gap-5 sm:gap-8">



              {/* æ¸å½± */}

              <div className="relative w-28 sm:w-40 flex-shrink-0">

                <div className="aspect-[2/3] relative rounded-xl overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 shadow-md">

                  {work.coverImageUrl ? (

                    <Image

                      src={work.coverImageUrl}

                      alt={`${work.title} ã®è¡¨ç´`}

                      fill

                      sizes="160px"

                      className="object-cover"

                      unoptimized

                    />

                  ) : (

                    <div className="absolute inset-0 flex items-center justify-center">

                      <span className="text-4xl">{work.type === "manga" ? "ð" : "ð"}</span>

                    </div>

                  )}

                </div>

              </div>



              {/* æå ± */}

              <div className="flex-1 min-w-0">

                <div className="flex flex-wrap gap-2 mb-3">

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${typeColor}`}>

                    {typeLabel}

                  </span>

                  {statusLabel && (

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${

                      work.status === "completed"

                        ? "bg-emerald-100 text-emerald-700"

                        : "bg-amber-100 text-amber-700"

                    }`}>

                      {statusLabel}

                    </span>

                  )}

                  {work.volumeCount > 1 && (

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">

                      å¨{work.volumeCount}å·»

                    </span>

                  )}

                </div>



                <h1 className="text-xl sm:text-3xl font-bold text-stone-900 leading-tight mb-2">

                  {work.title}

                </h1>

                <p className="text-stone-600 font-medium text-sm sm:text-base mb-1">

                  {work.authorDisplay}

                </p>

                {work.publisherMain && (

                  <p className="text-stone-400 text-xs mb-4">{work.publisherMain}</p>

                )}



                {work.summaryShort && (

                  <p className="text-stone-600 text-sm leading-relaxed bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-4">

                    {work.summaryShort}

                  </p>

                )}



                {work.discoveryTags.length > 0 && (

                  <div className="flex flex-wrap gap-1.5 mb-5">

                    {work.discoveryTags.map((tag) => (

                      <Link

                        key={tag}

                        href={`/discover?tag=${encodeURIComponent(tag)}`}

                        className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"

                      >

                        {tag}

                      </Link>

                    ))}

                  </div>

                )}



                <div className="flex flex-wrap gap-2">

                  <a

                    href={workAmazonUrl}

                    target="_blank"

                    rel="noopener noreferrer"

                    className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl transition-colors"

                  >

                    Amazonã§æ¢ã â

                  </a>

                </div>

              </div>

            </div>

          </section>



          {/* å·»ä¸è¦§ */}

          {work.volumes.length > 0 && (

            <section className="mb-8">

              <h2 className="text-lg font-bold text-stone-800 mb-4">

                å·»ä¸è¦§

                <span className="ml-2 text-sm font-normal text-stone-400">({work.volumes.length}ä»¶)</span>

              </h2>

              <div className="grid gap-2 sm:grid-cols-2">

                {work.volumes.map((vol) => (

                  <VolumeCard key={vol.volumeId} vol={vol} />

                ))}

              </div>

            </section>

          )}



          {/* ä¼¼ãä½åã»ã¯ã·ã§ã³ */}

          {similar && similar.groups.length > 0 && (

            <SimilarWorksSection similar={similar} />

          )}



          {/* ããã²ã¼ã·ã§ã³ */}

          <div className="text-center">

            <Link

              href="/discover"

              className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-rose-600 transition-colors"

            >

              â çºè¦ãã¼ã¸ã«æ»ã

            </Link>

          </div>



        </div>

      </main>

      <Footer />

    </>

  );

}

