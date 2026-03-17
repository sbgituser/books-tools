"use client";

/**
 * SelectedFiltersSummary.tsx
 * 選択中フィルタのサマリー表示バー
 */

interface Props {
  labels: string[];
  resultCount: number;
  onClear: () => void;
}

export default function SelectedFiltersSummary({ labels, resultCount, onClear }: Props) {
  if (labels.length === 0) return null;

  return (
    <div className="flex items-start gap-3 flex-wrap p-3 bg-rose-50 border border-rose-200 rounded-xl">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-rose-600 font-semibold mb-1">絞り込み中</p>
        <div className="flex flex-wrap gap-1.5">
          {labels.map((label, i) => (
            <span
              key={i}
              className="inline-block text-xs font-medium bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-rose-700 font-bold whitespace-nowrap">
          {resultCount}件
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-rose-500 hover:text-rose-700 underline whitespace-nowrap transition-colors"
        >
          条件をクリア
        </button>
      </div>
    </div>
  );
}
