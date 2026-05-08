"use client";

import { 
  PauseIcon, 
  PlayIcon, 
  BookmarkIcon as BookmarkSolidIcon,
  HeartIcon as HeartSolidIcon
} from "@heroicons/react/24/solid";
import { 
  BookmarkIcon as BookmarkOutlineIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  CheckIcon,
  HeartIcon as HeartOutlineIcon
} from "@heroicons/react/24/outline";
import type { Ayah } from "@/types/quran";
import { useAudio } from "@/components/Audio/AudioProvider";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { ReadingSettingsState, DEFAULT_READING_SETTINGS } from "@/types/settings";
import { useState } from "react";

interface AyahCardProps {
  ayah: Ayah;
  surahNumber: number;
  surahName: string;
  surahAyahCount: number;
}

export default function AyahCard({
  ayah,
  surahNumber,
  surahName,
  surahAyahCount,
}: AyahCardProps) {
  const { currentAyah, status, playAyah, pause, resume } = useAudio();
  const [settings] = useLocalStorage<ReadingSettingsState>(
    "readingSettings",
    DEFAULT_READING_SETTINGS,
  );
  const [bookmarks, setBookmarks] = useLocalStorage<number[]>("bookmarks", []);
  const [favoriteAyahs, setFavoriteAyahs] = useLocalStorage<number[]>("favoriteAyahs", []);
  const [copyStatus, setCopyStatus] = useState<"idle" | "arabic" | "translation">("idle");

  const isBookmarked = bookmarks.includes(ayah.number);
  const isAyahFavorite = favoriteAyahs.includes(ayah.number);
  const isActive = currentAyah?.ayahNumber === ayah.number;
  const isPlaying = isActive && status === "playing";
  const isLoading = isActive && status === "loading";

  const toggleBookmark = () => {
    setBookmarks((prev) =>
      isBookmarked
        ? prev.filter((id) => id !== ayah.number)
        : [...prev, ayah.number]
    );
  };

  const toggleFavoriteAyah = () => {
    setFavoriteAyahs((prev) =>
      isAyahFavorite
        ? prev.filter((id) => id !== ayah.number)
        : [...prev, ayah.number]
    );
  };

  const copyToClipboard = async (text: string, type: "arabic" | "translation") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(type);
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareAyah = async () => {
    const shareData = {
      title: `Quran - ${surahName} (${ayah.numberInSurah})`,
      text: `${ayah.text}\n\n${ayah.translation}\n\nRead more at:`,
      url: window.location.href.split("#")[0] + `#ayah-${ayah.numberInSurah}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
      return;
    }

    if (isActive) {
      resume();
      return;
    }

    playAyah({
      ayahNumber: ayah.number,
      numberInSurah: ayah.numberInSurah,
      surahAyahCount,
      surahNumber,
      surahName,
      arabicText: ayah.text,
    });
  };

  return (
    <article
      id={`ayah-${ayah.numberInSurah}`}
      className="scroll-mt-24 my-4 min-w-0 overflow-hidden rounded-md border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-slate-950/30 transition-colors hover:border-slate-700 sm:p-5"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-9 min-w-9 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-semibold text-emerald-400">
          Ayah {ayah.numberInSurah}
        </span>
        <button
          type="button"
          onClick={togglePlay}
          className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
            isPlaying
              ? "bg-emerald-500 text-slate-950"
              : "bg-slate-800 text-slate-200 hover:bg-slate-700"
          }`}
          aria-label={isPlaying ? "Pause ayah audio" : "Play ayah audio"}
        >
          {isPlaying || isLoading ? (
            <PauseIcon className="h-5 w-5" aria-hidden />
          ) : (
            <PlayIcon className="h-5 w-5" aria-hidden />
          )}
        </button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-12 md:items-start">
        <p
          className={`${ayah.translation ? "md:col-span-8" : "md:col-span-12"} arabic-text min-w-0 text-right leading-loose text-slate-50`}
          dir="rtl"
          lang="ar"
        >
          {ayah.text}
          <span className="mr-3 inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-emerald-500/40 px-2 align-middle text-sm leading-none text-emerald-300">
            {ayah.numberInSurah}
          </span>
        </p>
        {ayah.translation && settings.showTranslation ? (
          <p className="translation-text text-left leading-7 text-slate-300 md:col-span-4">
            {ayah.translation}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-800/50 pt-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => copyToClipboard(ayah.text, "arabic")}
            className="flex h-9 items-center gap-2 rounded-md px-3 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            title="Copy Arabic"
          >
            {copyStatus === "arabic" ? (
              <CheckIcon className="h-4 w-4 text-emerald-400" />
            ) : (
              <DocumentDuplicateIcon className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Arabic</span>
          </button>
          
          {ayah.translation && (
            <button
              onClick={() => copyToClipboard(ayah.translation, "translation")}
              className="flex h-9 items-center gap-2 rounded-md px-3 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              title="Copy Translation"
            >
              {copyStatus === "translation" ? (
                <CheckIcon className="h-4 w-4 text-emerald-400" />
              ) : (
                <DocumentDuplicateIcon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Translation</span>
            </button>
          )}

          <button
            onClick={shareAyah}
            className="flex h-9 items-center gap-2 rounded-md px-3 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            title="Share"
          >
            <ShareIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFavoriteAyah}
            className={`flex h-9 w-9 items-center justify-center rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              isAyahFavorite
                ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-rose-400"
            }`}
            title={isAyahFavorite ? "Remove Favorite" : "Favorite"}
            aria-label={isAyahFavorite ? "Remove Favorite" : "Favorite"}
          >
            {isAyahFavorite ? (
              <HeartSolidIcon className="h-5 w-5" />
            ) : (
              <HeartOutlineIcon className="h-5 w-5" />
            )}
          </button>

          <button
            onClick={toggleBookmark}
            className={`flex h-9 items-center gap-2 rounded-md px-4 text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
              isBookmarked
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
          >
            {isBookmarked ? (
              <BookmarkSolidIcon className="h-5 w-5" />
            ) : (
              <BookmarkOutlineIcon className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">{isBookmarked ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
