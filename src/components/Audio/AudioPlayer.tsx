"use client";

import { useMemo } from "react";
import { useEffect } from "react";
import {
  Loader2,
  Pause,
  Play,
  Rewind,
  FastForward,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useAudio } from "@/components/Audio/AudioProvider";


function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export default function AudioPlayer() {
  const {
    currentAyah,
    status,
    errorMessage,
    reciterId,
    autoPlayNext,
    currentTime,
    duration,
    volume,
    isMuted,
    canPlayNext,
    canPlayPrevious,
    pause,
    resume,
    playNextAyah,
    playPreviousAyah,
    seek,
    setVolume,
    toggleMute,
    stop,
    setAutoPlayNext,
    rewind,
    fastForward,
    increaseVolume,
    decreaseVolume,
    audioRef,
  } = useAudio();

  const isPlaying = status === "playing";
  const isLoading = status === "loading";

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.code) {
        case "Space":
          event.preventDefault();
          if (isPlaying) {
            pause();
          } else {
            resume();
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          playNextAyah();
          break;
        case "ArrowLeft":
          event.preventDefault();
          playPreviousAyah();
          break;
        case "ArrowUp":
          event.preventDefault();
          increaseVolume(0.1);
          break;
        case "ArrowDown":
          event.preventDefault();
          decreaseVolume(0.1);
          break;
        case "KeyM":
          event.preventDefault();
          toggleMute();
          break;
        case "KeyN":
          event.preventDefault();
          setAutoPlayNext(!autoPlayNext);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isPlaying,
    pause,
    resume,
    playNextAyah,
    playPreviousAyah,
    increaseVolume,
    decreaseVolume,
    toggleMute,
    setAutoPlayNext,
    autoPlayNext,
  ]);

  const progressPercent = useMemo(() => {
    if (!duration || !Number.isFinite(currentTime)) {
      return 0;
    }

    return Math.min(Math.max((currentTime / duration) * 100, 0), 100);
  }, [currentTime, duration]);

  if (!currentAyah) {
    return null;
  }

  return (
    <section className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-5 lg:left-96 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-t-3xl border border-[#c9a84c]/20 bg-[#08151d]/95 text-slate-100 shadow-[0_0_80px_rgba(20,37,56,0.35)] backdrop-blur-xl">
        <button
          type="button"
          onClick={stop}
          className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          aria-label="Close audio player"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="relative rounded-full bg-slate-900/80 ring-1 ring-slate-800">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 opacity-90"
                style={{ width: `${progressPercent}%` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={(event) => seek(Number(event.target.value))}
                className="relative h-3 w-full cursor-pointer appearance-none bg-transparent p-0 focus:outline-none"
                aria-label="Seek within audio"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-slate-100 sm:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="order-2 flex items-center justify-between gap-2 sm:order-1 sm:justify-start">
              <button
                type="button"
                onClick={playPreviousAyah}
                disabled={!canPlayPrevious}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/90 text-slate-100 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Play previous ayah"
              >
                <SkipBack className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => rewind(10)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/90 text-slate-100 transition hover:border-amber-400"
                aria-label="Rewind 10 seconds"
              >
                <Rewind className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={isPlaying ? pause : resume}
                className="flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-400 text-slate-950 shadow-[0_16px_40px_rgba(249,208,79,0.18)] transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
                aria-label={isPlaying ? "Pause recitation" : "Play recitation"}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
                ) : isPlaying ? (
                  <Pause className="h-6 w-6" aria-hidden />
                ) : (
                  <Play className="h-6 w-6" aria-hidden />
                )}
              </button>
              <button
                type="button"
                onClick={() => fastForward(10)}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/90 text-slate-100 transition hover:border-amber-400"
                aria-label="Fast forward 10 seconds"
              >
                <FastForward className="h-5 w-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={playNextAyah}
                disabled={!canPlayNext}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/90 text-slate-100 transition hover:border-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Play next ayah"
              >
                <SkipForward className="h-5 w-5" aria-hidden />
              </button>
            </div>

            <div className="order-1 sm:order-2 lg:order-3 lg:max-w-md">
              <div className="flex items-center gap-3 rounded-3xl bg-slate-950/90 p-2 pl-4 ring-1 ring-slate-800">
                <div className="hidden min-w-0 flex-1 md:block">
                  <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/60">
                    {currentAyah.surahName} • Ayah {currentAyah.numberInSurah}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {isLoading
                      ? "Loading..."
                      : status === "error"
                        ? errorMessage
                        : isPlaying
                          ? "Playing"
                          : "Paused"}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-slate-900/50 p-1.5 pr-4">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900 text-slate-100 transition hover:border-amber-400"
                    aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                    aria-pressed={isMuted}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-4 w-4" aria-hidden />
                    ) : (
                      <Volume2 className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                  <div className="w-24 space-y-1 sm:w-32">
                    <label className="sr-only" htmlFor="volume-range">
                      Audio volume
                    </label>
                    <input
                      id="volume-range"
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={(event) =>
                        setVolume(Number(event.target.value))
                      }
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-amber-400"
                      aria-valuemin={0}
                      aria-valuemax={1}
                      aria-valuenow={isMuted ? 0 : volume}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
