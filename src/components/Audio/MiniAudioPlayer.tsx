"use client";

import {
  PauseIcon,
  PlayIcon,
  StopIcon,
} from "@heroicons/react/24/solid";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";
import { AUDIO_RECITERS, getReciterById } from "@/lib/audio";
import { useAudio } from "@/components/Audio/AudioProvider";

export default function MiniAudioPlayer() {
  const {
    currentAyah,
    status,
    errorMessage,
    reciterId,
    autoPlayNext,
    pause,
    resume,
    stop,
    setReciter,
    setAutoPlayNext,
  } = useAudio();
  const activeReciter = getReciterById(reciterId);
  const isPlaying = status === "playing";
  const isLoading = status === "loading";

  if (!currentAyah && status === "idle") {
    return null;
  }

  return (
    <section className="fixed inset-x-3 bottom-3 z-40 rounded-md border border-slate-700 bg-slate-950/95 p-3 shadow-2xl shadow-black/50 backdrop-blur lg:left-[25rem] lg:right-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-slate-950">
            <SpeakerWaveIcon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {currentAyah
                ? `${currentAyah.surahName} • Ayah ${currentAyah.numberInSurah}`
                : "Quran audio"}
            </p>
            <p className="truncate text-xs text-slate-400">
              {isLoading ? "Loading recitation..." : activeReciter.name}
              {errorMessage ? ` • ${errorMessage}` : ""}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:flex lg:items-center">
          <label className="sr-only" htmlFor="reciter-select">
            Reciter
          </label>
          <select
            id="reciter-select"
            value={reciterId}
            onChange={(event) => setReciter(event.target.value)}
            className="h-10 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
          >
            {AUDIO_RECITERS.map((reciter) => (
              <option key={reciter.id} value={reciter.id}>
                {reciter.name}
              </option>
            ))}
          </select>

          <div className="flex items-center justify-between gap-2">
            <label className="flex h-10 items-center gap-2 rounded-md border border-slate-700 px-3 text-xs font-medium text-slate-300">
              <input
                type="checkbox"
                checked={autoPlayNext}
                onChange={(event) => setAutoPlayNext(event.target.checked)}
                className="accent-emerald-500"
              />
              Auto-next
            </label>
            <button
              type="button"
              onClick={isPlaying ? pause : resume}
              className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500 text-slate-950 transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              aria-label={isPlaying ? "Pause recitation" : "Play recitation"}
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5" aria-hidden />
              ) : (
                <PlayIcon className="h-5 w-5" aria-hidden />
              )}
            </button>
            <button
              type="button"
              onClick={stop}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 text-slate-200 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Stop recitation"
            >
              <StopIcon className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
