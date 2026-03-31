"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { QUIZ_QUESTIONS, QUIZ_RESULT_TYPES, calcQuizResult } from "@/constants/bookQuiz";
import { buildAmazonUrl } from "@/data/products";
import type { QuizResultType } from "@/types/quiz";

const ACCENT_CLASSES: Record<string, { bg: string; text: string; border: string; button: string }> = {
  rose:   { bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200",   button: "bg-rose-600 hover:bg-rose-700" },
  blue:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   button: "bg-blue-600 hover:bg-blue-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", button: "bg-violet-600 hover:bg-violet-700" },
  green:  { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  button: "bg-green-600 hover:bg-green-700" },
  gray:   { bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-200",   button: "bg-gray-700 hover:bg-gray-800" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200",  button: "bg-amber-600 hover:bg-amber-700" },
  pink:   { bg: "bg-pink-50",   text: "text-pink-700",   border: "border-pink-200",   button: "bg-pink-600 hover:bg-pink-700" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200",   button: "bg-teal-600 hover:bg-teal-700" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", button: "bg-orange-600 hover:bg-orange-700" },
  yellow: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", button: "bg-yellow-600 hover:bg-yellow-700" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", button: "bg-indigo-600 hover:bg-indigo-700" },
  stone:  { bg: "bg-stone-50",  text: "text-stone-700",  border: "border-stone-200",  button: "bg-stone-700 hover:bg-stone-800" },
};

type Phase = "start" | "question" | "result";

export default function BookQuizClient() {
  const [phase, setPhase] = useState<Phase>("start");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<QuizResultType | null>(null);
  const [copied, setCopied] = useState(false);

  const handleStart = useCallback(() => {
    setPhase("question");
    setCurrentQ(0);
    setScores({});
    setAnswers([]);
    setResult(null);
  }, []);

  const handleSelect = useCallback(
    (optionId: string, optionScores: Record<string, number>) => {
      const newScores = { ...scores };
      for (const [tag, val] of Object.entries(optionScores)) {
        newScores[tag] = (newScores[tag] ?? 0) + val;
      }
      const newAnswers = [...answers, optionId];

      if (currentQ + 1 >= QUIZ_QUESTIONS.length) {
        const r = calcQuizResult(newScores);
        setResult(r);
        setPhase("result");
      } else {
        setScores(newScores);
        setAnswers(newAnswers);
        setCurrentQ((q) => q + 1);
      }
    },
    [scores, answers, currentQ],
  );

  const handleBack = useCallback(() => {
    if (currentQ === 0) {
      setPhase("start");
    } else {
      // Remove last answer's scores
      const prevOption = QUIZ_QUESTIONS[currentQ - 1].options.find(
        (o) => o.id === answers[currentQ - 1],
      );
      if (prevOption) {
        const newScores = { ...scores };
        for (const [tag, val] of Object.entries(prevOption.scores)) {
          newScores[tag] = (newScores[tag] ?? 0) - val;
        }
        setScores(newScores);
      }
      setAnswers((a) => a.slice(0, -1));
      setCurrentQ((q) => q - 1);
    }
  }, [currentQ, answers, scores]);

  const handleRetry = useCallback(() => {
    setPhase("start");
    setCurrentQ(0);
    setScores({});
    setAnswers([]);
    setResult(null);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    const text = `${result.shareText}\nhttps://books-tools.vercel.app/tools/book-quiz/`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  }, [result]);

  if (phase === "start") {
    return (
      <section className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 text-center">
          <div className="text-6xl mb-4" aria-hidden="true">🔮</div>
          <h2 className="text-xl font-bold text-stone-900 mb-3">
            5つの質問に答えて<br />あなたにぴったりの本を見つけよう！
          </h2>
          <p className="text-sm text-stone-500 mb-8 leading-relaxed">
            気分・読める時間・好みの雰囲気など5つの質問に答えると、
            あなたの読書タイプと、おすすめ本5冊を診断します。
          </p>
          <div className="flex justify-center gap-6 mb-8 text-xs text-stone-400">
            <span>⏱️ 約1分</span>
            <span>❓ 5問</span>
            <span>📚 12タイプ</span>
          </div>
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-10 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl transition-colors text-base"
          >
            診断スタート →
          </button>
        </div>
      </section>
    );
  }

  if (phase === "question") {
    const q = QUIZ_QUESTIONS[currentQ];
    const progress = ((currentQ + 1) / QUIZ_QUESTIONS.length) * 100;

    return (
      <section className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span>質問 {currentQ + 1} / {QUIZ_QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8">
          <p className="text-lg sm:text-xl font-bold text-stone-900 mb-6 text-center leading-snug">
            {q.question}
          </p>

          <div className="grid gap-3">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(opt.id, opt.scores)}
                className="flex items-center gap-4 w-full text-left px-5 py-4 rounded-2xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50 transition-all group"
              >
                <span className="text-2xl shrink-0" aria-hidden="true">{opt.icon}</span>
                <span className="text-sm font-medium text-stone-800 group-hover:text-rose-700 transition-colors">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleBack}
            className="mt-6 text-xs text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-1"
          >
            ← 戻る
          </button>
        </div>
      </section>
    );
  }

  // Result phase
  if (!result) return null;

  const accent = ACCENT_CLASSES[result.accentColor] ?? ACCENT_CLASSES.stone;
  const tweetText = encodeURIComponent(
    `${result.shareText}\nhttps://books-tools.vercel.app/tools/book-quiz/`,
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;

  return (
    <section className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Result header */}
      <div className={`rounded-3xl border ${accent.border} ${accent.bg} p-6 sm:p-8 text-center`}>
        <div className="text-5xl mb-3" aria-hidden="true">{result.icon}</div>
        <p className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-1">あなたの読書タイプ</p>
        <h2 className={`text-2xl font-bold ${accent.text} mb-4`}>{result.title}</h2>
        <p className="text-sm text-stone-600 leading-relaxed max-w-md mx-auto">
          {result.description}
        </p>
      </div>

      {/* Recommended works */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8">
        <h3 className="text-base font-bold text-stone-900 mb-4">あなたへのおすすめ本</h3>
        <div className="space-y-4">
          {result.recommendedWorks.map((work, i) => (
            <div key={i} className="flex gap-4 items-start border-b border-stone-100 last:border-0 pb-4 last:pb-0">
              <span className={`shrink-0 w-7 h-7 rounded-full ${accent.bg} ${accent.text} text-xs font-bold flex items-center justify-center border ${accent.border}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 truncate">{work.title}</p>
                <p className="text-xs text-stone-400 mb-1">{work.author}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{work.reason}</p>
                <a
                  href={
                    work.workId
                      ? `/works/${work.workId}`
                      : buildAmazonUrl(work.amazonKeyword ?? work.title)
                  }
                  target={work.workId ? undefined : "_blank"}
                  rel={work.workId ? undefined : "noopener noreferrer"}
                  className={`inline-block mt-2 text-xs font-semibold ${accent.text} hover:underline`}
                >
                  {work.workId ? "詳細を見る →" : "Amazonで見る →"}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related links */}
      {(result.recommendedMoods.length > 0 || result.recommendedScenes.length > 0) && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-stone-900 mb-3">さらに探す</h3>
          <div className="flex flex-wrap gap-2">
            {result.recommendedMoods.map((slug) => (
              <Link
                key={slug}
                href={`/discover?mood=${slug}`}
                className="text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
              >
                気分で探す
              </Link>
            ))}
            {result.recommendedScenes.map((slug) => (
              <Link
                key={slug}
                href={`/scene/${slug}`}
                className="text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
              >
                シーンで探す
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Share */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 text-center">
        <p className="text-sm font-bold text-stone-900 mb-4">結果をシェアする</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-black hover:bg-stone-800 text-white text-sm font-semibold rounded-2xl transition-colors"
          >
            <span aria-hidden="true">𝕏</span> Xでシェア
          </a>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-semibold rounded-2xl transition-colors"
          >
            {copied ? "✅ コピー完了！" : "📋 テキストをコピー"}
          </button>
        </div>
      </div>

      {/* Retry */}
      <div className="text-center">
        <button
          onClick={handleRetry}
          className="text-sm text-stone-400 hover:text-stone-600 underline underline-offset-2 transition-colors"
        >
          もう一度診断する
        </button>
      </div>
    </section>
  );
}
