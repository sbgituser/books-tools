"use client";

import { useRef } from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBox({
  value,
  onChange,
  placeholder = "本のタイトルやキーワードを入力（例：嫌われる勇気、投資 初心者）",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-lg pointer-events-none">
        🔍
      </span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-4 rounded-xl text-stone-900 text-base bg-white shadow-lg border-0 outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-400"
        autoComplete="off"
        aria-label="本を検索"
      />
      {value && (
        <button
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-lg"
          aria-label="クリア"
        >
          ✕
        </button>
      )}
    </div>
  );
}
