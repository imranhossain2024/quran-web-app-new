"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import type { Ayah } from "@/types/quran";
import { useAudio } from "@/components/Audio/AudioProvider";

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
  const isActive = currentAyah?.ayahNumber === ayah.number;
  const isPlaying = isActive && status === "playing";
  const isLoading = isActive && status === "loading";

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
        {ayah.translation ? (
          <p className="translation-text text-left leading-7 text-slate-300 md:col-span-4">
            {ayah.translation}
          </p>
        ) : null}
      </div>
    </article>
  );
}
