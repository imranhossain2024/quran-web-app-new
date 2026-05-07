"use client";

import { useState, useEffect, useRef } from 'react';
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

  // Initialise audio element only once
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
      // If a parent supplied onPlay, inform it so it can pause other tracks
      onPlay?.(ayah.number);
      audio.currentTime = 0;
      audio.play();
      setPlaying(true);
    }
  };

  // Pause if another card signals it should stop
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

  // Emit a global custom event when this card starts playing (for singleton behavior)
  useEffect(() => {
    if (playing) {
      const ev = new CustomEvent('ayah-play', { detail: ayah.number });
      window.dispatchEvent(ev);
    }
  }, [playing, ayah.number]);

  return (
    <article className="my-4 p-4 rounded-lg bg-gray-800/30 backdrop-blur-sm border border-gray-700 transition-shadow hover:shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-400">
          Ayah {ayah.numberInSurah}
        </span>
        <button
          onClick={togglePlay}
          className="p-2 rounded-full bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-colors"
          aria-label={playing ? 'Pause ayah audio' : 'Play ayah audio'}
        >
          {playing ? (
            // Pause icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 4a2 2 0 00-2 2v8a2 2 0 002 2h1a2 2 0 002-2V6a2 2 0 00-2-2H6zm7 0a2 2 0 00-2 2v8a2 2 0 002 2h1a2 2 0 002-2V6a2 2 0 00-2-2h-1z" clipRule="evenodd" />
            </svg>
          ) : (
            // Play icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.5 3.5l11 6.5-11 6.5v-13z" />
            </svg>
          )}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-12 gap-2 items-start">
        {/* Arabic text, spanning most columns on the right side */}
        <p className="col-span-8 arabic-text text-right" dir="rtl">
          {ayah.text}
        </p>
        {/* Translation on the left side */}
        {ayah.translation ? (
          <p className="col-span-4 translation-text text-left text-gray-200">
            {ayah.translation}
          </p>
        ) : null}
      </div>
    </article>
  );
}
