import Link from "next/link";
import type { ReactNode } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getSurahs } from "@/lib/quran";
import { normalizeText } from "@/lib/search";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

function highlightText(text: string, query: string) {
  if (!query) {
    return text;
  }

  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  if (!normalizedQuery || !normalizedText.includes(normalizedQuery)) {
    return text;
  }

  // For highlighting, we need to be more careful. 
  // If the query is "Al Baqarah" and text is "Al-Baqarah", 
  // simple split/join won't work well with normalization.
  // We'll stick to a simple case-insensitive match for now, 
  // but use the normalized query to decide *if* to highlight.
  
  const regex = new RegExp(`(${query.replace(/[-\s]/g, "[- ]")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) => 
    regex.test(part) ? (
      <mark key={i} className="rounded bg-emerald-400/25 px-1 text-emerald-100">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const rawQuery = q ?? "";
  const query = normalizeText(rawQuery);

  const results = query
    ? getSurahs()
        .flatMap((surah) =>
          surah.ayahs.map((ayah) => ({
            surah,
            ayah,
          })),
        )
        .filter(({ surah, ayah }) => {
          const normalizedSurahName = normalizeText(surah.englishName);
          const normalizedAyahText = ayah.text; // Arabic text
          const normalizedTranslation = normalizeText(ayah.translation);
          
          return (
            normalizedSurahName.includes(query) ||
            surah.name.includes(query) ||
            normalizedAyahText.includes(query) ||
            normalizedTranslation.includes(query)
          );
        })
        .slice(0, 80)
    : [];

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="rounded-md border border-slate-800 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/30 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Search
        </p>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
          Find Quran ayahs
        </h1>
        <form action="/search" className="mt-5">
          <label className="block">
            <span className="sr-only">Search Quran</span>
            <span className="relative block">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                aria-hidden
              />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search Arabic text, surah name, or translation"
                className="h-12 w-full rounded-md border border-slate-700 bg-slate-950 pl-10 pr-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              />
            </span>
          </label>
        </form>
      </div>

      <div className="mt-5 space-y-3 pb-12">
        {query ? (
          <p className="text-sm text-slate-400">
            Showing {results.length} result{results.length === 1 ? "" : "s"} for{" "}
            <span className="font-semibold text-slate-200">{query}</span>
          </p>
        ) : (
          <p className="rounded-md border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-400">
            Type a word, ayah text, or surah name to begin searching.
          </p>
        )}

        {results.map(({ surah, ayah }) => (
          <Link
            key={`${surah.number}-${ayah.numberInSurah}`}
            href={`/surah/${surah.number}#ayah-${ayah.numberInSurah}`}
            className="block rounded-md border border-slate-800 bg-slate-900/70 p-4 transition-colors hover:border-slate-700 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-emerald-400">
                {surah.englishName} • Ayah {ayah.numberInSurah}
              </p>
              <p className="font-arabic text-lg text-slate-300" dir="rtl" lang="ar">
                {surah.name}
              </p>
            </div>
            <p className="arabic-text mt-4 leading-loose text-white" dir="rtl" lang="ar">
              {highlightText(ayah.text, query)}
            </p>
            {ayah.translation ? (
              <p className="translation-text mt-3 leading-7 text-slate-300">
                {highlightText(ayah.translation, query)}
              </p>
            ) : null}
          </Link>
        ))}

        {query && results.length === 0 ? (
          <p className="rounded-md border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-400">
            No ayahs found for this search.
          </p>
        ) : null}
      </div>
    </section>
  );
}
