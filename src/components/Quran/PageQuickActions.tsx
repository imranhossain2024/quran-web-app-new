"use client";

import Link from "next/link";
import { ChevronUpIcon, HomeIcon } from "@heroicons/react/24/outline";

interface PageQuickActionsProps {
  currentPage: number;
}

export default function PageQuickActions({ currentPage }: PageQuickActionsProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="fixed right-5 z-40 flex flex-col gap-2 transition-[bottom] duration-300"
      style={{ bottom: "calc(1.25rem + var(--audio-player-offset, 0px))" }}
    >
      <button
        type="button"
        onClick={scrollToTop}
        className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/95 px-4 py-3 text-sm font-semibold text-slate-200 shadow-lg shadow-slate-900/40 transition-all hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        aria-label="Back to top"
      >
        <ChevronUpIcon className="h-5 w-5" aria-hidden />
        <span>Top</span>
      </button>

      {currentPage > 1 ? (
        <Link
          href="/page/1"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-slate-900/95 px-4 py-3 text-sm font-semibold text-emerald-300 shadow-lg shadow-emerald-900/30 transition-all hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Go to first Quran page"
        >
          <HomeIcon className="h-5 w-5" aria-hidden />
          <span>Page 1</span>
        </Link>
      ) : null}
    </div>
  );
}
