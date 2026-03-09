"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tools = [
  { href: "/similar-books", label: "書籍ブラウザ" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-stone-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link
          href="/"
          className="flex items-center gap-2 text-white no-underline hover:opacity-90 transition-opacity"
        >
          <span className="text-xl">📚</span>
          <span className="font-bold text-base tracking-tight">
            Books Tools
            <span className="hidden sm:inline text-stone-400 font-normal text-xs ml-1">
              kuras-plus
            </span>
          </span>
        </Link>

        <nav className="flex gap-1" aria-label="メインナビゲーション">
          {tools.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm px-3 py-1.5 rounded transition-colors ${
                pathname === href
                  ? "bg-white/15 text-white"
                  : "text-stone-300 hover:text-white hover:bg-white/10"
              }`}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
