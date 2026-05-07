"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import SearchBox from "@/components/Search/SearchBox";
import type { SurahSummary } from "@/types/quran";

interface SurahListProps {
  surahs: SurahSummary[];
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function SurahList({
  surahs,
  mobileOpen = false,
  onMobileClose,
}: SurahListProps) {
  const [search, setSearch] = useState("");
  const pathname = usePathname();

  const filteredSurahs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return surahs;
    }

    return surahs.filter((surah) => {
      return (
        surah.number.toString().includes(query) ||
        surah.englishName.toLowerCase().includes(query) ||
        surah.name.includes(query) ||
        surah.revelation.toLowerCase().includes(query)
      );
    });
  }, [search, surahs]);

  const panel = (
    <>
      <div className="border-b border-slate-800 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Quran Reader
        </p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">Surahs</h2>
          <button
            type="button"
            onClick={onMobileClose}
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 lg:hidden"
            aria-label="Close surah menu"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="mt-4">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search by name or number"
            label="Search surahs"
          />
        </div>
      </div>

      <nav aria-label="Surah list" className="min-h-0 flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {filteredSurahs.map((surah) => {
            const href = `/surah/${surah.number}`;
            const isActive = pathname === href;

            return (
              <li key={surah.number}>
                <Link
                  href={href}
                  onClick={onMobileClose}
                  className={`grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 rounded-md border p-3 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                    isActive
                      ? "border-emerald-500/70 bg-emerald-500/15 text-white"
                      : "border-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/80 hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold ${
                      isActive
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-300"
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
        </ul>

        {filteredSurahs.length === 0 ? (
          <p className="px-3 py-6 text-sm text-slate-400">No surah found.</p>
        ) : null}
      </nav>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-16 z-30 hidden w-80 border-r border-slate-800 bg-slate-900 text-slate-100 lg:flex lg:flex-col">
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
          className={`absolute inset-y-0 left-0 flex w-full max-w-sm flex-col border-r border-slate-800 bg-slate-900 text-slate-100 shadow-2xl shadow-black transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label="Mobile surah list"
        >
          {panel}
        </aside>
      </div>
    </>
  );
}
