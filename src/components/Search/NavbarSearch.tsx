"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { normalizeText } from "@/lib/search";
import type { SurahSummary } from "@/types/quran";

interface NavbarSearchProps {
  surahs: SurahSummary[];
}

export default function NavbarSearch({ surahs }: NavbarSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = normalizeText(query);
  const results = normalizedQuery
    ? surahs
        .filter((s) => {
          const normName = normalizeText(s.englishName);
          return (
            s.number.toString().includes(normalizedQuery) ||
            normName.includes(normalizedQuery)
          );
        })
        .slice(0, 5)
    : [];

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (surahNumber: number) => {
    router.push(`/surah/${surahNumber}`);
    setQuery("");
    setIsOpen(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (activeIndex >= 0 && results[activeIndex]) {
      handleSelect(results[activeIndex].number);
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) => (prev > -1 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          handleSubmit();
          break;
        case "Escape":
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, activeIndex, query]);

  // Fix the listener registration
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <div className="relative flex-1 max-w-md mx-4 hidden md:block" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-400"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
            }
          }}
          placeholder="Search surah or ayah..."
          className="h-10 w-full rounded-full border border-slate-800 bg-slate-900/50 pl-10 pr-12 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-slate-900 shadow-inner"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-sans text-[10px] font-medium text-slate-400 opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-full hover:bg-slate-800 text-slate-500"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          )}
        </div>
      </form>

      {isOpen && normalizedQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Surah Results
              </p>
              {results.length > 0 && (
                <span className="text-[10px] text-slate-600">
                  Use arrows to navigate
                </span>
              )}
            </div>
            {results.length > 0 ? (
              <div className="mt-1 space-y-1">
                {results.map((surah, index) => (
                  <button
                    key={surah.number}
                    onClick={() => handleSelect(surah.number)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all group ${
                      activeIndex === index
                        ? "bg-emerald-500/15 ring-1 ring-emerald-500/30"
                        : "hover:bg-slate-900"
                    }`}
                  >
                    <span className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition-colors ${
                      activeIndex === index
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                    }`}>
                      {surah.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`truncate text-sm font-medium transition-colors ${
                        activeIndex === index ? "text-emerald-400" : "text-slate-200"
                      }`}>
                        {surah.englishName}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {surah.revelation} • {surah.numberOfAyahs} ayahs
                      </p>
                    </div>
                    <span className={`font-arabic transition-colors ${
                      activeIndex === index ? "text-emerald-400" : "text-slate-400"
                    }`} dir="rtl">
                      {surah.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-3 py-4 text-center text-sm text-slate-500">
                No surahs found. Press Enter to search all ayahs.
              </p>
            )}
            
            <div className="mt-2 border-t border-slate-800/50 p-1">
              <button
                onClick={() => handleSubmit()}
                className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium transition-all ${
                  activeIndex === -1
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/5"
                }`}
              >
                <MagnifyingGlassIcon className="h-3 w-3" />
                See all results for "{query}"
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
