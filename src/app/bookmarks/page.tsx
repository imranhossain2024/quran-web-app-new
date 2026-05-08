"use client";

import { useEffect, useState, useMemo } from "react";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { getAyahWithMetadata } from "@/lib/quran";
import AyahCard from "@/components/Quran/AyahCard";

export default function BookmarksPage() {
  const [bookmarks] = useLocalStorage<number[]>("bookmarks", []);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const bookmarkedAyahs = useMemo(() => {
    if (!isMounted) return [];
    return bookmarks
      .map((id) => getAyahWithMetadata(id))
      .filter((item) => item !== null);
  }, [bookmarks, isMounted]);

  if (!isMounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Your Bookmarks</h1>
        <p className="mt-2 text-slate-400">Manage and read your saved ayahs</p>
      </header>

      {bookmarkedAyahs.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-slate-500">
            <BookmarkIcon className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-semibold text-slate-300">No bookmarks yet</h2>
          <p className="mt-2 max-w-xs text-sm text-slate-500">
            Click the bookmark icon on any ayah to save it here for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-medium text-slate-400">
              Showing {bookmarkedAyahs.length} saved {bookmarkedAyahs.length === 1 ? "ayah" : "ayahs"}
            </span>
          </div>
          <div className="pb-12">
            {bookmarkedAyahs.map((item: any) => (
              <AyahCard
                key={item.ayah.number}
                ayah={item.ayah}
                surahNumber={item.surahNumber}
                surahName={item.surahName}
                surahAyahCount={item.surahAyahCount}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
