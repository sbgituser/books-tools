"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { READING_SPEEDS, POPULAR_BOOKS_PRESETS } from "@/constants/readingTimeConfig";
import type { BookType, ReadingSpeed } from "@/types/reading-time";

// ── ヘルパー ────────────────────────────────────────────────

function formatTime(totalMinutes: number): string {
  if (totalMinutes < 1) return "1分未満";
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  if (hours === 0) return `${mins}分`;
  if (mins === 0) return `${hours}時間`;
  return `${hours}時間${mins}分`;
}

function formatDays(totalMinutes: number, dailyMinutes: number): string {
  const days = Math.ceil(totalMinutes / dailyMinutes);
  if (days <= 1) return "1日";
  if (days < 30) return `${days}日`;
  const months = Math.floor(days / 30);
  const remDays = days % 30;
  if (remDays === 0) return `${months}ヶ月`;
  return `${months}ヶ月${remDays}日`;
}

// ── シーン推薦 ───────────────────────────────────────────────

function getSceneRecommendation(totalMinutes: number): { href: string; label: string; desc: string } {
  if (totalMinutes < 60) {
    return { href: "/scene/commute", label: "通勤・通学のすきま時間", desc: "短時間で読み切れる本にぴったり" };
  }
  if (totalMinutes < 180) {
    return { href: "/scene/before-sleep", label: "就寝前のリラックスタイム", desc: "数日かけてゆっくり楽しめる長さ" };
  }
  return { href: "/scene/holiday", label: "休日に一気読み", desc: "まとまった時間でじっくり読める本" };
}

// ── メインコンポーネント ─────────────────────────────────────

export default function ReadingTimeClient() {
  const [bookType, setBookType] = useState<BookType>("novel");
  const [pages, setPages] = useState<string>("");
  const [speed, setSpeed] = useState<ReadingSpeed>("average");
  const [volumes, setVolumes] = useState<string>("");

  const config = useMemo(
    () => READING_SPEEDS.find((s) => s.type === bookType)!,
    [bookType],
  );

  const result = useMemo(() => {
    const p = parseInt(pages, 10);
    if (!p || p <= 0) return null;

    const speedData = config.speeds[speed];
    const singleMinutes = p / speedData.pagesPerMinute;

    const vol = parseInt(volumes, 10);
    const totalVolumes = vol > 0 ? vol : 1;
    const totalMinutes = singleMinutes * totalVolumes;

    return { singleMinutes, totalMinutes, totalVolumes };
  }, [pages, speed, config, volumes]);

  const scene = useMemo(
    () => (result ? getSceneRecommendation(result.singleMinutes) : null),
    [result],
  );

  function applyPreset(preset: (typeof POPULAR_BOOKS_PRESETS)[number]) {
    setBookType(preset.type);
    setPages(String(preset.pages));
    setVolumes("");
  }

  const speedConfig = config.speeds[speed];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

      {/* プリセット */}
      <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <h2 className="text-sm font-bold text-stone-700 mb-3">人気書籍で試す</h2>
        <div className="flex flex-wrap gap-2">
          {POPULAR_BOOKS_PRESETS.map((preset) => (
            <button
              key={preset.title}
              onClick={() => applyPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-full border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </section>

      {/* 入力セクション */}
      <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-5">
        <h2 className="text-sm font-bold text-stone-700">本の情報を入力</h2>

        {/* 本の種類 */}
        <div>
          <p className="text-xs text-stone-500 mb-2">本の種類</p>
          <div className="flex flex-wrap gap-2">
            {READING_SPEEDS.map((cfg) => (
              <button
                key={cfg.type}
                onClick={() => setBookType(cfg.type)}
                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${
                  bookType === cfg.type
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-300"
                }`}
              >
                <span aria-hidden="true">{cfg.icon}</span>
                {cfg.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-stone-400 mt-1.5">{config.description}</p>
        </div>

        {/* ページ数 */}
        <div>
          <label htmlFor="pages-input" className="text-xs text-stone-500 mb-2 block">
            ページ数
          </label>
          <div className="flex items-center gap-2">
            <input
              id="pages-input"
              type="number"
              min="1"
              max="9999"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="例: 300"
              className="w-32 text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
            <span className="text-xs text-stone-500">ページ</span>
          </div>
        </div>

        {/* 読書スピード */}
        <div>
          <p className="text-xs text-stone-500 mb-2">読書スピード</p>
          <div className="flex gap-2">
            {(["slow", "average", "fast"] as ReadingSpeed[]).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`flex-1 text-xs py-2 rounded-xl border transition-all ${
                  speed === s
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:border-emerald-300"
                }`}
              >
                {config.speeds[s].label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-stone-400 mt-1.5">
            {speedConfig.charsPerMinute.toLocaleString()}文字/分 ·{" "}
            {speedConfig.pagesPerMinute}ページ/分
          </p>
        </div>

        {/* シリーズ巻数（オプション） */}
        <div>
          <label htmlFor="volumes-input" className="text-xs text-stone-500 mb-2 block">
            シリーズ全巻（オプション）
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">全</span>
            <input
              id="volumes-input"
              type="number"
              min="1"
              max="999"
              value={volumes}
              onChange={(e) => setVolumes(e.target.value)}
              placeholder="—"
              className="w-20 text-sm border border-stone-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
            <span className="text-xs text-stone-500">巻を読む場合</span>
          </div>
        </div>
      </section>

      {/* 計算結果 */}
      {result && (
        <section className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-emerald-800">推定読書時間</h2>

          {/* メイン結果 */}
          <div className="text-center py-3">
            <p className="text-4xl sm:text-5xl font-bold text-emerald-700 tracking-tight">
              {formatTime(result.singleMinutes)}
            </p>
            {result.totalVolumes > 1 && (
              <p className="text-sm text-stone-500 mt-1">
                全{result.totalVolumes}巻合計:{" "}
                <span className="font-semibold text-emerald-600">
                  {formatTime(result.totalMinutes)}
                </span>
              </p>
            )}
          </div>

          {/* 日数換算 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "1日30分", minutes: 30, icon: "🌙" },
              { label: "1日1時間", minutes: 60, icon: "📅" },
              { label: "通勤15分×2", minutes: 30, icon: "🚃" },
            ].map(({ label, minutes, icon }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-emerald-100 p-3 text-center"
              >
                <p className="text-lg" aria-hidden="true">{icon}</p>
                <p className="text-[10px] text-stone-500 mt-1">{label}</p>
                <p className="text-sm font-bold text-stone-800 mt-0.5">
                  {formatDays(result.singleMinutes, minutes)}
                </p>
              </div>
            ))}
          </div>

          {/* シリーズ全巻 */}
          {result.totalVolumes > 1 && (
            <div className="bg-white rounded-xl border border-emerald-100 p-3">
              <p className="text-xs font-bold text-stone-700 mb-2">
                全{result.totalVolumes}巻を読破するには
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-500">1日30分で</span>
                  <span className="font-bold text-emerald-700 ml-1.5">
                    {formatDays(result.totalMinutes, 30)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">1日1時間で</span>
                  <span className="font-bold text-emerald-700 ml-1.5">
                    {formatDays(result.totalMinutes, 60)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* わかりやすい換算 */}
          <div className="bg-white rounded-xl border border-emerald-100 p-3">
            <p className="text-xs font-bold text-stone-700 mb-2">わかりやすく言うと…</p>
            <div className="flex flex-wrap gap-3 text-xs text-stone-600">
              <span>
                🎬 映画{" "}
                <span className="font-semibold">
                  {(result.singleMinutes / 120).toFixed(1)}本分
                </span>
              </span>
              <span>
                📺 ドラマ{" "}
                <span className="font-semibold">
                  {Math.round(result.singleMinutes / 45)}話分
                </span>
              </span>
              <span>
                ☕ コーヒー{" "}
                <span className="font-semibold">
                  {Math.ceil(result.singleMinutes / 15)}杯分
                </span>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 回遊導線 */}
      {result && scene && (
        <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-stone-700">この本に合う読み方</h2>

          <Link
            href={scene.href}
            className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 hover:bg-emerald-100 transition-colors group"
          >
            <div>
              <p className="text-sm font-semibold text-emerald-800">{scene.label}</p>
              <p className="text-xs text-emerald-600 mt-0.5">{scene.desc}</p>
            </div>
            <span className="text-stone-400 group-hover:text-emerald-600 transition-colors text-sm">→</span>
          </Link>

          <div className="flex gap-2 pt-1">
            <Link
              href="/scene"
              className="flex-1 text-center text-xs text-stone-600 border border-stone-200 rounded-xl py-2 hover:bg-stone-50 transition-colors"
            >
              シーンで本を探す
            </Link>
            <Link
              href="/tools/book-quiz"
              className="flex-1 text-center text-xs text-stone-600 border border-stone-200 rounded-xl py-2 hover:bg-stone-50 transition-colors"
            >
              おすすめ本診断
            </Link>
          </div>
        </section>
      )}

      {/* 読書速度の説明 */}
      <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
        <h2 className="text-sm font-bold text-stone-700 mb-3">全ジャンルの読書速度</h2>
        <div className="space-y-2">
          {READING_SPEEDS.map((cfg) => (
            <div
              key={cfg.type}
              className="flex items-center justify-between text-xs py-1.5 border-b border-stone-100 last:border-0"
            >
              <span className="flex items-center gap-1.5 text-stone-700">
                <span aria-hidden="true">{cfg.icon}</span>
                {cfg.label}
              </span>
              <span className="text-stone-500">
                {cfg.speeds.average.charsPerMinute}文字/分（ふつう）
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
