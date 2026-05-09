"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AudioStatus } from "@/lib/audio";
import {
  DEFAULT_RECITER_ID,
  getAyahAudioUrl,
  getReciterById,
} from "@/lib/audio";
import { useLocalStorage } from "@/lib/useLocalStorage";

interface PlayAyahInput {
  ayahNumber: number;
  numberInSurah: number;
  surahAyahCount: number;
  surahNumber: number;
  surahName: string;
  arabicText?: string;
}

interface CurrentAyah extends PlayAyahInput {
  reciterId: string;
}

interface AudioSettings {
  reciterId: string;
  autoPlayNext: boolean;
}

interface AudioContextValue {
  currentAyah: CurrentAyah | null;
  status: AudioStatus;
  errorMessage: string | null;
  reciterId: string;
  autoPlayNext: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  canPlayNext: boolean;
  canPlayPrevious: boolean;
  playAyah: (input: PlayAyahInput) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  rewind: (seconds: number) => void;
  fastForward: (seconds: number) => void;
  playNextAyah: () => void;
  playPreviousAyah: () => void;
  setReciter: (reciterId: string) => void;
  setAutoPlayNext: (enabled: boolean) => void;
  increaseVolume: (step?: number) => void;
  decreaseVolume: (step?: number) => void;
}

const defaultSettings: AudioSettings = {
  reciterId: DEFAULT_RECITER_ID,
  autoPlayNext: false,
};

const AudioContext = createContext<AudioContextValue | null>(null);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAyahRef = useRef<CurrentAyah | null>(null);
  const autoPlayNextRef = useRef(defaultSettings.autoPlayNext);
  const lastVolumeRef = useRef(0.8);
  const [rawSettings, setSettings] = useLocalStorage<AudioSettings>(
    "audioSettings",
    defaultSettings,
  );
  const settings = { ...defaultSettings, ...rawSettings };
  const [currentAyah, setCurrentAyah] = useState<CurrentAyah | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Sync refs with state via effects
  useEffect(() => {
    currentAyahRef.current = currentAyah;
  }, [currentAyah]);

  useEffect(() => {
    autoPlayNextRef.current = settings.autoPlayNext;
  }, [settings.autoPlayNext]);

  // Set up audio event listeners once on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleWaiting = () => setStatus("loading");
    const handlePlaying = () => {
      setStatus("playing");
      setErrorMessage(null);
    };
    const handlePause = () => {
      if (!audio.ended) setStatus("paused");
    };
    const handleError = () => {
      setStatus("error");
      setErrorMessage("Audio could not be loaded. Please try again.");
    };
    const handleEnded = () => {
      const activeAyah = currentAyahRef.current;
      if (
        autoPlayNextRef.current &&
        activeAyah &&
        activeAyah.numberInSurah < activeAyah.surahAyahCount
      ) {
        const nextNum = activeAyah.ayahNumber + 1;
        setCurrentAyah({
          ...activeAyah,
          ayahNumber: nextNum,
          numberInSurah: activeAyah.numberInSurah + 1,
        });
        setStatus("loading");
        audio.src = getAyahAudioUrl(nextNum, activeAyah.reciterId);
        audio.currentTime = 0;
        void audio.play().catch(() => {
          setStatus("error");
          setErrorMessage("Auto-play blocked by browser.");
        });
        return;
      }
      setStatus("idle");
    };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setErrorMessage(null);
    };

    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  // Sync volume/muted to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const playAyah = useCallback(
    (input: PlayAyahInput) => {
      const audio = audioRef.current;
      if (!audio) return;

      const reciter = getReciterById(settings.reciterId);
      const audioUrl = getAyahAudioUrl(input.ayahNumber, reciter.id);

      const nextAyah: CurrentAyah = {
        ...input,
        reciterId: reciter.id,
      };
      currentAyahRef.current = nextAyah;
      setCurrentAyah(nextAyah);
      setCurrentTime(0);
      setDuration(0);
      setStatus("loading");
      setErrorMessage(null);

      // Bypass autoplay policy: browsers allow muted audio to play
      // Save user's mute state, force mute, set source, then unmute after play starts
      const userMuted = audio.muted;
      const userVolume = audio.volume;
      audio.muted = true;
      audio.volume = 1;

      audio.src = audioUrl;
      audio.currentTime = 0;

      // play() will succeed because audio is muted
      audio.play().then(() => {
        // Now restore user's audio preferences
        audio.muted = userMuted;
        audio.volume = userVolume;
      }).catch((err) => {
        console.error("Playback error:", err);
        audio.muted = userMuted;
        audio.volume = userVolume;
        setStatus("error");
        if (err.name === "NotAllowedError") {
          setErrorMessage("Browser blocked playback. Please click/tap again.");
        } else {
          setErrorMessage("Audio could not be loaded. The source may be unavailable.");
        }
      });
    },
    [settings.reciterId],
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentAyahRef.current) return;
    setStatus("loading");

    // Resume also may need muted bypass if called without user gesture
    const userMuted = audio.muted;
    const userVolume = audio.volume;
    audio.muted = true;

    audio.play().then(() => {
      audio.muted = userMuted;
      audio.volume = userVolume;
    }).catch(() => {
      audio.muted = userMuted;
      audio.volume = userVolume;
      setStatus("error");
      setErrorMessage("Browser blocked playback. Tap play again.");
    });
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    currentAyahRef.current = null;
    setCurrentAyah(null);
    setCurrentTime(0);
    setDuration(0);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const nextTime = clamp(time, 0, duration || Number.POSITIVE_INFINITY);
      audio.currentTime = nextTime;
      setCurrentTime(nextTime);
    },
    [duration],
  );

  const setVolume = useCallback((nextVolume: number) => {
    const adjusted = clamp(nextVolume, 0, 1);
    setVolumeState(adjusted);
    setIsMuted(adjusted === 0);
    if (adjusted > 0) lastVolumeRef.current = adjusted;
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setVolumeState(lastVolumeRef.current || 0.8);
    } else {
      lastVolumeRef.current = volume || lastVolumeRef.current;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const rewind = useCallback(
    (seconds: number) => seek((currentTime || 0) - seconds),
    [currentTime, seek],
  );

  const fastForward = useCallback(
    (seconds: number) => seek((currentTime || 0) + seconds),
    [currentTime, seek],
  );

  const playNextAyah = useCallback(() => {
    const activeAyah = currentAyahRef.current;
    if (!activeAyah || activeAyah.numberInSurah >= activeAyah.surahAyahCount) return;
    playAyah({
      ayahNumber: activeAyah.ayahNumber + 1,
      numberInSurah: activeAyah.numberInSurah + 1,
      surahAyahCount: activeAyah.surahAyahCount,
      surahNumber: activeAyah.surahNumber,
      surahName: activeAyah.surahName,
    });
  }, [playAyah]);

  const playPreviousAyah = useCallback(() => {
    const activeAyah = currentAyahRef.current;
    if (!activeAyah || activeAyah.numberInSurah <= 1) return;
    playAyah({
      ayahNumber: activeAyah.ayahNumber - 1,
      numberInSurah: activeAyah.numberInSurah - 1,
      surahAyahCount: activeAyah.surahAyahCount,
      surahNumber: activeAyah.surahNumber,
      surahName: activeAyah.surahName,
    });
  }, [playAyah]);

  const setReciter = useCallback(
    (reciterId: string) => {
      const reciter = getReciterById(reciterId);
      setSettings((current) => ({ ...current, reciterId: reciter.id }));
    },
    [setSettings],
  );

  const setAutoPlayNext = useCallback(
    (enabled: boolean) => {
      setSettings((current) => ({ ...current, autoPlayNext: enabled }));
    },
    [setSettings],
  );

  const increaseVolume = useCallback((step: number = 0.1) => {
    setVolumeState((c) => {
      const nv = clamp(c + step, 0, 1);
      setIsMuted(nv === 0);
      if (nv > 0) lastVolumeRef.current = nv;
      return nv;
    });
  }, []);

  const decreaseVolume = useCallback((step: number = 0.1) => {
    setVolumeState((c) => {
      const nv = clamp(c - step, 0, 1);
      setIsMuted(nv === 0);
      if (nv > 0) lastVolumeRef.current = nv;
      return nv;
    });
  }, []);

  const canPlayNext = useMemo(
    () => Boolean(currentAyah && currentAyah.numberInSurah < currentAyah.surahAyahCount),
    [currentAyah],
  );

  const canPlayPrevious = useMemo(
    () => Boolean(currentAyah && currentAyah.numberInSurah > 1),
    [currentAyah],
  );

  const value = useMemo<AudioContextValue>(
    () => ({
      currentAyah,
      status,
      errorMessage,
      reciterId: settings.reciterId,
      autoPlayNext: settings.autoPlayNext,
      currentTime,
      duration,
      volume,
      isMuted,
      canPlayNext,
      canPlayPrevious,
      playAyah,
      pause,
      resume,
      stop,
      seek,
      setVolume,
      toggleMute,
      rewind,
      fastForward,
      playNextAyah,
      playPreviousAyah,
      setReciter,
      setAutoPlayNext,
      increaseVolume,
      decreaseVolume,
    }),
    [
      canPlayNext, canPlayPrevious, currentAyah, currentTime, duration,
      errorMessage, increaseVolume, decreaseVolume, isMuted,
      playAyah, pause, playNextAyah, playPreviousAyah, resume, seek,
      setAutoPlayNext, setReciter, setVolume, settings.autoPlayNext,
      settings.reciterId, status, stop, toggleMute, volume,
    ],
  );

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="auto"
        muted
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used inside AudioProvider");
  }
  return context;
}