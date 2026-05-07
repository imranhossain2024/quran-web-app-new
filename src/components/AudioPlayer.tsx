"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

interface AudioPlayerSurah {
  number: number;
  nameArabic: string;
  nameEnglish: string;
  totalVerses: number;
  audioUrl: string;
  reciter: string;
}

interface AudioPlayerProps {
  surah: AudioPlayerSurah;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const speedOptions = [0.75, 1, 1.25, 1.5] as const;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

export default function AudioPlayer({
  surah,
  onClose,
  onNext,
  onPrevious,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastVolumeRef = useRef(0.8);
  const shouldAutoPlayNextRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const progressPercent = useMemo(() => {
    if (!duration) {
      return 0;
    }

    return Math.min((currentTime / duration) * 100, 100);
  }, [currentTime, duration]);

  useEffect(() => {
    const amiriLink = document.createElement("link");
    amiriLink.rel = "stylesheet";
    amiriLink.href =
      "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cormorant+Garamond:wght@500;600;700&display=swap";
    document.head.appendChild(amiriLink);

    return () => {
      document.head.removeChild(amiriLink);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setHasError(false);
      setIsLoading(false);
    };
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        void audio.play();
        return;
      }

      shouldAutoPlayNextRef.current = true;
      setIsPlaying(false);
      onNext();
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [isRepeat, onNext]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    setIsLoading(true);
    audio.load();

    if (shouldAutoPlayNextRef.current) {
      shouldAutoPlayNextRef.current = false;
      void audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch(() => {
          setHasError(true);
          setIsPlaying(false);
        });
    }
  }, [surah.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;
  }, [isMuted, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    const audio = audioRef.current;

    if (!audio || hasError) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    void audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setHasError(false);
      })
      .catch(() => {
        setHasError(true);
        setIsPlaying(false);
      })
      .finally(() => setIsLoading(false));
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const nextTime = Number(event.target.value);

    setCurrentTime(nextTime);

    if (audio) {
      audio.currentTime = nextTime;
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.target.value);

    setVolume(nextVolume);
    lastVolumeRef.current = nextVolume || lastVolumeRef.current;
    setIsMuted(nextVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(lastVolumeRef.current || 0.8);
      setIsMuted(false);
      return;
    }

    if (volume > 0) {
      lastVolumeRef.current = volume;
    }

    setIsMuted(true);
  };

  const toggleRepeat = () => setIsRepeat((current) => !current);

  const changeSpeed = (rate: number) => setPlaybackRate(rate);

  return (
    <section className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-5 lg:left-96 lg:px-8">
      <audio ref={audioRef} preload="metadata">
        <source src={surah.audioUrl} type="audio/mpeg" />
      </audio>

      <div
        className="mx-auto max-w-5xl overflow-hidden rounded-t-2xl border border-[#c9a84c]/30 bg-[#0d1f2d]/95 text-slate-100 shadow-[0_0_48px_rgba(201,168,76,0.22)] backdrop-blur-xl lg:rounded-2xl"
        style={{
          fontFamily:
            "'Cormorant Garamond', ui-serif, Georgia, Cambria, 'Times New Roman', serif",
        }}
      >
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-[#c9a84c]/50 lg:hidden" />

        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1.15fr_1.85fr_auto] lg:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#c9a84c]/50 bg-[#0f172a] text-[#e2c47a] shadow-inner">
              <span className="absolute inset-2 rounded-xl border border-[#c9a84c]/20" />
              <span className="relative text-lg font-bold">{surah.number}</span>
            </div>

            <div className="min-w-0">
              <p
                className="truncate text-3xl font-bold leading-tight text-[#f6e7b0]"
                dir="rtl"
                lang="ar"
                style={{ fontFamily: "'Amiri', serif" }}
              >
                {surah.nameArabic}
              </p>
              <p className="truncate text-lg font-semibold text-white">
                {surah.nameEnglish}
              </p>
              <p className="truncate text-sm text-slate-300">
                {surah.reciter} • {surah.totalVerses} verses
              </p>
            </div>
          </div>

          <div className="min-w-0">
            {hasError ? (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                This recitation could not be loaded. Please try another Surah or check
                your connection.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                  <span className="w-12 tabular-nums">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    aria-label="Seek recitation"
                    className="h-2 flex-1 cursor-pointer appearance-none rounded-full accent-[#c9a84c]"
                    style={{
                      background: `linear-gradient(to right, #c9a84c ${progressPercent}%, rgba(148,163,184,0.24) ${progressPercent}%)`,
                    }}
                  />
                  <span className="w-12 text-right tabular-nums">
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onPrevious}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-200 transition hover:border-[#c9a84c]/60 hover:text-[#e2c47a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                      aria-label="Previous Surah"
                    >
                      <SkipBack className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a84c] text-[#0f172a] shadow-[0_0_24px_rgba(201,168,76,0.38)] transition hover:bg-[#e2c47a] focus:outline-none focus:ring-2 focus:ring-[#e2c47a]"
                      aria-label={isPlaying ? "Pause recitation" : "Play recitation"}
                    >
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : isPlaying ? (
                        <Pause className="h-7 w-7 fill-current" />
                      ) : (
                        <Play className="ml-0.5 h-7 w-7 fill-current" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onNext}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-200 transition hover:border-[#c9a84c]/60 hover:text-[#e2c47a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                      aria-label="Next Surah"
                    >
                      <SkipForward className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleRepeat}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition focus:outline-none focus:ring-2 focus:ring-[#c9a84c] ${
                        isRepeat
                          ? "border-[#c9a84c] bg-[#c9a84c]/15 text-[#e2c47a]"
                          : "border-white/10 text-slate-300 hover:border-[#c9a84c]/60"
                      }`}
                      aria-label={isRepeat ? "Disable repeat one" : "Repeat this Surah"}
                    >
                      <Repeat className="h-5 w-5" />
                    </button>

                    <select
                      value={playbackRate}
                      onChange={(event) => changeSpeed(Number(event.target.value))}
                      className="h-10 rounded-full border border-white/10 bg-[#0f172a] px-3 text-sm font-semibold text-slate-100 outline-none transition focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/40"
                      aria-label="Playback speed"
                    >
                      {speedOptions.map((rate) => (
                        <option key={rate} value={rate}>
                          {rate}x
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0f172a] px-3 py-2">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-slate-200 transition hover:text-[#e2c47a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]"
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="h-2 w-24 cursor-pointer appearance-none rounded-full accent-[#c9a84c]"
                        style={{
                          background: `linear-gradient(to right, #c9a84c ${
                            (isMuted ? 0 : volume) * 100
                          }%, rgba(148,163,184,0.24) ${
                            (isMuted ? 0 : volume) * 100
                          }%)`,
                        }}
                        aria-label="Volume"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-[#c9a84c]/60 hover:text-[#e2c47a] focus:outline-none focus:ring-2 focus:ring-[#c9a84c] lg:static"
            aria-label="Close audio player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
