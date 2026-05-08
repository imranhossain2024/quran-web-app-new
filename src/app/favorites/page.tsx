"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { getSurahSummaries, getAyahWithMetadata } from "@/lib/quran";
import FavoriteButton from "@/components/Quran/FavoriteButton";
import AyahCard from "@/components/Quran/AyahCard";

export default function FavoritesPage() {
  const [favoriteSurahs] = useLocalStorage<number[]>("favoriteSurahs", []);
  const [favoriteAyahs] = useLocalStorage<number[]>("favoriteAyahs", []);
  const [activeTab, setActiveTab] = useState<"surahs" | "ayahs">("surahs");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const favoriteSurahsList = useMemo(() => {
    if (!isMounted) return [];
    const allSurahs = getSurahSummaries();
    return favoriteSurahs
      .map((id) => allSurahs.find((s) => s.number === id))
      .filter((s) => s !== undefined);
  }, [favoriteSurahs, isMounted]);

  const favoriteAyahsList = useMemo(() => {
    if (!isMounted) return [];
    return favoriteAyahs
      .map((id) => getAyahWithMetadata(id))
      .filter((item) => item !== null);
  }, [favoriteAyahs, isMounted]);

  if (!isMounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Your Favorites</h1>
        <p className="mt-2 text-slate-400">Quick access to your most loved Surahs and Ayahs</p>
        
        <div className="mt-8 flex justify-center">
          <div className="flex rounded-lg bg-slate-900/60 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab("surahs")}
              className={`rounded-md px-6 py-2 text-sm font-semibold transition-all ${
                activeTab === "surahs"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Surahs
            </button>
            <button
              onClick={() => setActiveTab("ayahs")}
              className={`rounded-md px-6 py-2 text-sm font-semibold transition-all ${
                activeTab === "ayahs"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Ayahs
            </button>
          </div>
        </div>
      </header>

      {activeTab === "surahs" ? (
        <>
          {favoriteSurahsList.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-500">
            <HeartIcon className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-slate-300">No favorites yet</h2>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            Click the heart icon on any Surah page to save it here for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-slate-400">
              Showing {favoriteSurahsList.length} saved {favoriteSurahsList.length === 1 ? "Surah" : "Surahs"}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteSurahsList.map((surah: any) => (
              <div
                key={surah.number}
                className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition-all hover:border-emerald-500/50 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div className="absolute right-4 top-4 z-10">
                  <FavoriteButton surahNumber={surah.number} />
                </div>
                <Link 
                  href={`/surah/${surah.number}`} 
                  className="absolute inset-0 z-0" 
                  aria-label={`Read ${surah.englishName}`} 
                />
                <div className="pointer-events-none relative z-0">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-sm font-bold text-emerald-400">
                      {surah.number}
                    </div>
                    <span className="font-arabic text-2xl text-slate-200" dir="rtl" lang="ar">
                      {surah.name}
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-white transition-colors group-hover:text-emerald-400">
                      {surah.englishName}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <span className="uppercase tracking-wider">{surah.revelation}</span>
                      <span>•</span>
                      <span>{surah.numberOfAyahs} Ayahs</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
        </>
      ) : (
        <>
          {favoriteAyahsList.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-500">
              <HeartIcon className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold text-slate-300">No favorite ayahs yet</h2>
            <p className="mt-2 max-w-xs text-sm text-slate-500">
              Click the heart icon on any Ayah card to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-slate-400">
                Showing {favoriteAyahsList.length} favorite {favoriteAyahsList.length === 1 ? "Ayah" : "Ayahs"}
              </span>
            </div>
            <div className="pb-12">
              {favoriteAyahsList.map((item: any) => (
                <AyahCard
                  key={`fav-ayah-${item.ayah.number}`}
                  ayah={item.ayah}
                  surahNumber={item.surahNumber}
                  surahName={item.surahName}
                  surahAyahCount={item.surahAyahCount}
                />
              ))}
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}
