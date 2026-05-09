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
  HeartIcon as HeartOutlineIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import type { Ayah } from "@/types/quran";
import { useAudio } from "@/components/Audio/AudioProvider";
import TafsirModal from "@/components/Quran/TafsirModal";
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
  const [rawSettings] = useLocalStorage<ReadingSettingsState>(
    "readingSettings",
    DEFAULT_READING_SETTINGS,
  );
  const settings = { ...DEFAULT_READING_SETTINGS, ...rawSettings };
  const [bookmarks, setBookmarks] = useLocalStorage<number[]>("bookmarks", []);
  const [favoriteAyahs, setFavoriteAyahs] = useLocalStorage<number[]>("favoriteAyahs", []);
  const [copyStatus, setCopyStatus] = useState<"idle" | "arabic" | "translation">("idle");
  const [isTafsirOpen, setIsTafsirOpen] = useState(false);

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

  const toggleTafsir = () => setIsTafsirOpen((prev) => !prev);

  return (
    <article
      id={`ayah-${ayah.numberInSurah}`}
      className={`scroll-mt-24 my-6 min-w-0 overflow-hidden rounded-2xl border transition-all duration-500 ${
        isActive && settings.highlightCurrentAyah
          ? "border-emerald-500/50 bg-emerald-500/5 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20"
          : "border-[var(--border)] bg-[var(--surface)] opacity-95 hover:opacity-100 hover:border-slate-700/50"
      } p-5 sm:p-6`}
      style={{ 
        backgroundColor: isActive && settings.highlightCurrentAyah ? undefined : 'var(--surface)',
        borderColor: isActive && settings.highlightCurrentAyah ? undefined : 'var(--border)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex h-10 min-w-10 items-center justify-center rounded-xl font-bold transition-colors ${
            isActive ? "bg-emerald-500 text-slate-950" : "bg-[var(--background)] text-emerald-400 border border-[var(--border)]"
          } text-sm`}>
            {ayah.numberInSurah}
          </span>
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Ayah</p>
            <p className="text-xs font-bold opacity-70">{surahName} {surahNumber}:{ayah.numberInSurah}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={togglePlay}
          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 active:scale-95 ${
            isPlaying
              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30"
              : "bg-[var(--border)] text-[var(--foreground)] hover:bg-slate-700 hover:text-white"
          }`}
          aria-label={isPlaying ? "Pause ayah audio" : "Play ayah audio"}
        >
          {isPlaying || isLoading ? (
            <PauseIcon className="h-6 w-6" aria-hidden />
          ) : (
            <PlayIcon className="h-6 w-6" aria-hidden />
          )}
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <p
          className="arabic-text min-w-0 transition-colors duration-500"
          style={{ 
            color: isActive ? 'var(--accent)' : 'var(--foreground)',
          }}
          dir="rtl"
          lang="ar"
        >
          {ayah.text}
          {settings.showAyahNumbers && (
            <span className="mr-4 inline-flex h-10 min-w-10 items-center justify-center rounded-full border align-middle text-sm transition-all duration-500"
              style={{
                borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                backgroundColor: isActive ? 'var(--accent-muted)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--foreground)'
              }}
            >
              {ayah.numberInSurah}
            </span>
          )}
        </p>

        {ayah.translation && !settings.readingMode && settings.showTranslation && (
          <p className="translation-text text-left leading-relaxed transition-all duration-500"
             style={{ 
               color: 'var(--foreground)',
               opacity: isActive ? 1 : 0.7
             }}
          >
            {ayah.translation}
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-6 opacity-80">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => copyToClipboard(ayah.text, "arabic")}
            className="group flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold opacity-60 transition-all hover:bg-[var(--border)] hover:opacity-100"
            title="Copy Arabic"
          >
            {copyStatus === "arabic" ? (
              <CheckIcon className="h-4 w-4 text-emerald-400" />
            ) : (
              <DocumentDuplicateIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            )}
            <span className="hidden md:inline uppercase tracking-widest">Arabic</span>
          </button>
          
          {ayah.translation && (
            <button
              onClick={() => copyToClipboard(ayah.translation, "translation")}
              className="group flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold opacity-60 transition-all hover:bg-[var(--border)] hover:opacity-100"
              title="Copy Translation"
            >
              {copyStatus === "translation" ? (
                <CheckIcon className="h-4 w-4 text-emerald-400" />
              ) : (
                <DocumentDuplicateIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
              )}
              <span className="hidden md:inline uppercase tracking-widest">Translation</span>
            </button>
          )}

          <button
            onClick={shareAyah}
            className="group flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold opacity-60 transition-all hover:bg-[var(--border)] hover:opacity-100"
            title="Share"
          >
            <ShareIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
            <span className="hidden md:inline uppercase tracking-widest">Share</span>
          </button>

          <button
            onClick={toggleTafsir}
            className={`group flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-bold transition-all ${
              isTafsirOpen
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "opacity-60 hover:bg-[var(--border)] hover:opacity-100"
            }`}
            title="Tafsir"
            aria-label={isTafsirOpen ? "Hide tafsir" : "Show tafsir"}
            aria-expanded={isTafsirOpen}
          >
            <BookOpenIcon className={`h-4 w-4 transition-transform ${isTafsirOpen ? 'scale-110' : 'group-hover:scale-110'}`} />
            <span className="hidden md:inline uppercase tracking-widest">Tafsir</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFavoriteAyah}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 active:scale-95 ${
              isAyahFavorite
                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                : "bg-[var(--background)] opacity-60 border border-[var(--border)] hover:border-rose-500/30 hover:text-rose-400 hover:opacity-100"
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
            className={`group flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all duration-300 active:scale-95 ${
              isBookmarked
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-[var(--background)] opacity-60 border border-[var(--border)] hover:border-emerald-500/30 hover:text-emerald-400 hover:opacity-100"
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"}
          >
            {isBookmarked ? (
              <BookmarkSolidIcon className="h-5 w-5" />
            ) : (
              <BookmarkOutlineIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
            )}
            <span className="hidden sm:inline uppercase tracking-widest">{isBookmarked ? "Saved" : "Save"}</span>
          </button>
        </div>
      </div>

      <TafsirModal
        isOpen={isTafsirOpen}
        onClose={() => setIsTafsirOpen(false)}
        surahNumber={surahNumber}
        ayahNumberInSurah={ayah.numberInSurah}
        surahName={surahName}
      />
    </article>
  );
}
