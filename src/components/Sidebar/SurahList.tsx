"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { 
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import SearchBox from "@/components/Search/SearchBox";
import { normalizeText } from "@/lib/search";
import type { SurahSummary } from "@/types/quran";

interface SurahListProps {
  surahs: SurahSummary[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

type SidebarTab = "surah" | "juz" | "page";

export default function SurahList({
  surahs,
  mobileOpen = false,
  onMobileClose,
  isCollapsed = false,
  onToggleCollapse,
}: SurahListProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("surah");
  const [search, setSearch] = useState("");
  const pathname = usePathname();

  // Generate Juz data (1-30)
  const juzs = useMemo(() => Array.from({ length: 30 }, (_, i) => i + 1), []);
  // Generate Page data (1-604)
  const pages = useMemo(() => Array.from({ length: 604 }, (_, i) => i + 1), []);

  const filteredItems = useMemo(() => {
    const query = normalizeText(search);

    if (activeTab === "surah") {
      if (!query) return surahs;
      return surahs.filter((surah) => {
        const normalizedEnglishName = normalizeText(surah.englishName);
        const normalizedArabicName = surah.name; // Keep Arabic as is for matching
        
        return (
          surah.number.toString().includes(query) ||
          normalizedEnglishName.includes(query) ||
          normalizedArabicName.includes(query)
        );
      });
    }

    if (activeTab === "juz") {
      if (!query) return juzs;
      return juzs.filter((j) => j.toString().includes(query));
    }

    if (activeTab === "page") {
      if (!query) return pages;
      return pages.filter((p) => p.toString().includes(query));
    }

    return [];
  }, [activeTab, search, surahs, juzs, pages]);

  const panel = (
    <>
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Quran Reader
          </p>
        </div>

        <nav className="mt-4 flex flex-wrap gap-2 lg:hidden">
          <Link href="/" onClick={onMobileClose} className="rounded-md bg-black/10 dark:bg-black/30 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Home</Link>
          <Link href="/surah/1" onClick={onMobileClose} className="rounded-md bg-black/10 dark:bg-black/30 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Read Quran</Link>
          <Link href="/prayer-time" onClick={onMobileClose} className="rounded-md bg-black/10 dark:bg-black/30 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">Prayer Time</Link>
          <Link href="/ramadan" onClick={onMobileClose} className="rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500 dark:text-emerald-400">Ramadan 2026</Link>
        </nav>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-1 rounded-lg bg-black/10 dark:bg-black/40 p-1">
            {(["surah", "juz", "page"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 rounded-md py-1.5 text-xs font-bold capitalize transition-all ${
                  activeTab === tab
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="mt-4">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder={
              activeTab === "surah"
                ? "Search surah name or number"
                : `Search ${activeTab} number`
            }
            label={`Search ${activeTab}`}
          />
        </div>
      </div>

      <nav aria-label="Surah list" className="min-h-0 flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {activeTab === "surah" && (filteredItems as SurahSummary[]).map((surah) => {
            const href = `/surah/${surah.number}`;
            const isActive = pathname === href;

            return (
              <li key={surah.number}>
                <Link
                  href={href}
                  onClick={onMobileClose}
                  className={`grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 rounded-md border p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                    isActive
                      ? "border-emerald-500/70 bg-emerald-500/15 text-emerald-500 dark:text-emerald-300"
                      : "border-transparent text-inherit opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold ${
                      isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {surah.number}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {surah.englishName}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      {surah.revelation} • {surah.numberOfAyahs} ayahs
                    </span>
                  </span>
                  <span className="font-arabic text-lg leading-none" dir="rtl" lang="ar">
                    {surah.name}
                  </span>
                </Link>
              </li>
            );
          })}

          {activeTab !== "surah" && (filteredItems as number[]).map((num) => {
            // Simplified link for Juz and Page
            const href = activeTab === "juz" ? `/juz/${num}` : `/page/${num}`;
            const isActive = pathname === href;

            return (
              <li key={num}>
                <Link
                  href={href}
                  onClick={onMobileClose}
                  className={`flex items-center gap-4 rounded-md border p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                    isActive
                      ? "border-emerald-500/70 bg-emerald-500/15 text-emerald-500 dark:text-emerald-300"
                      : "border-transparent text-inherit opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-200 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {num}
                  </span>
                  <div>
                    <span className="block text-sm font-semibold capitalize">
                      {activeTab} {num}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-400">
                      Jump to {activeTab} {num}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50 text-slate-500 mb-4">
              <MagnifyingGlassIcon className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">No results found</p>
            <p className="mt-1 text-xs text-slate-500">
              Try searching for a different surah name, number, or {activeTab}.
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Clear search
            </button>
          </div>
        ) : null}
      </nav>
    </>
  );

  return (
    <>
      <aside 
        className={`fixed inset-y-0 left-16 z-40 hidden w-80 border-r border-slate-200 dark:border-slate-800 lg:flex lg:flex-col transition-all duration-300 ${
          isCollapsed ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 opacity-100"
        }`}
        style={{ backgroundColor: "var(--sidebar-bg)", color: "var(--sidebar-text)" }}
      >
        {panel}
      </aside>

      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Close surah menu"
          onClick={onMobileClose}
          className={`absolute inset-0 bg-slate-950/70 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-full max-w-sm flex-col border-r border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ backgroundColor: "var(--sidebar-bg)", color: "var(--sidebar-text)" }}
          aria-label="Mobile surah list"
        >
          {panel}
        </aside>
      </div>
    </>
  );
}
