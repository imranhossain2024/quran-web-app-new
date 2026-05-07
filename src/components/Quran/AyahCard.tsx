"use client";

import { useState, useEffect, useRef } from 'react';
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import { Ayah } from '@/types/quran';
import { getAyahAudioUrl } from '@/lib/audio';

interface AyahCardProps {
  ayah: Ayah;
  /**
   * Optional callback when this ayah starts playing. Allows a parent to enforce
   * only‑one‑audio‑track at a time.
   */
  onPlay?: (ayahNumber: number) => void;
}

export default function AyahCard({ ayah, onPlay }: AyahCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(getAyahAudioUrl(ayah.number));
    const audio = audioRef.current;
    const handleEnd = () => setPlaying(false);
    audio.addEventListener('ended', handleEnd);
    return () => {
      audio.removeEventListener('ended', handleEnd);
      audio.pause();
    };
  }, [ayah.number]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      onPlay?.(ayah.number);
      audio.currentTime = 0;
      audio.play();
      setPlaying(true);
    }
  };

  useEffect(() => {
    if (!playing) return;
    const handler = (ev: CustomEvent<number>) => {
      if (ev.detail !== ayah.number) {
        audioRef.current?.pause();
        setPlaying(false);
      }
    };
    window.addEventListener('ayah-play', handler as EventListener);
    return () => window.removeEventListener('ayah-play', handler as EventListener);
  }, [playing, ayah.number]);

  useEffect(() => {
    if (playing) {
      const ev = new CustomEvent('ayah-play', { detail: ayah.number });
      window.dispatchEvent(ev);
    }
  }, [playing, ayah.number]);

  return (
    <article className="my-4 rounded-md border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-slate-950/30 transition-colors hover:border-slate-700 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 min-w-9 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-semibold text-emerald-400">
          Ayah {ayah.numberInSurah}
        </span>
        <button
          type="button"
          onClick={togglePlay}
          className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
            playing
              ? "bg-emerald-500 text-slate-950"
              : "bg-slate-800 text-slate-200 hover:bg-slate-700"
          }`}
          aria-label={playing ? 'Pause ayah audio' : 'Play ayah audio'}
        >
          {playing ? <PauseIcon className="h-5 w-5" aria-hidden /> : <PlayIcon className="h-5 w-5" aria-hidden />}
        </button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-12 md:items-start">
        <p
          className={`${ayah.translation ? "md:col-span-8" : "md:col-span-12"} arabic-text text-right leading-loose text-slate-50`}
          dir="rtl"
          lang="ar"
        >
          {ayah.text}
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
