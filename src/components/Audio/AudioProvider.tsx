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
  playAyah: (input: PlayAyahInput) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setReciter: (reciterId: string) => void;
  setAutoPlayNext: (enabled: boolean) => void;
}

const defaultSettings: AudioSettings = {
  reciterId: DEFAULT_RECITER_ID,
  autoPlayNext: false,
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAyahRef = useRef<CurrentAyah | null>(null);
  const autoPlayNextRef = useRef(defaultSettings.autoPlayNext);
  const [settings, setSettings] = useLocalStorage<AudioSettings>(
    "audioSettings",
    defaultSettings,
  );
  const [currentAyah, setCurrentAyah] = useState<CurrentAyah | null>(null);
  const [status, setStatus] = useState<AudioStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    currentAyahRef.current = currentAyah;
  }, [currentAyah]);

  useEffect(() => {
    autoPlayNextRef.current = settings.autoPlayNext;
  }, [settings.autoPlayNext]);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const handleWaiting = () => setStatus("loading");
    const handlePlaying = () => {
      setStatus("playing");
      setErrorMessage(null);
    };
    const handlePause = () => {
      if (!audio.ended) {
        setStatus("paused");
      }
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
        const nextAyahNumber = activeAyah.ayahNumber + 1;
        const nextAyah: CurrentAyah = {
          ...activeAyah,
          ayahNumber: nextAyahNumber,
          numberInSurah: activeAyah.numberInSurah + 1,
        };
        currentAyahRef.current = nextAyah;
        setCurrentAyah(nextAyah);
        setStatus("loading");
        audio.src = getAyahAudioUrl(nextAyahNumber, activeAyah.reciterId);
        void audio.play().catch(() => {
          setStatus("error");
          setErrorMessage("Auto-play stopped because the next audio failed.");
        });
        return;
      }

      setStatus("idle");
    };

    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const playAyah = useCallback(
    (input: PlayAyahInput) => {
      const audio = audioRef.current;
      const reciter = getReciterById(settings.reciterId);

      if (!audio) {
        return;
      }

      const nextAyah: CurrentAyah = {
        ...input,
        reciterId: reciter.id,
      };

      currentAyahRef.current = nextAyah;
      setCurrentAyah(nextAyah);
      setStatus("loading");
      setErrorMessage(null);
      audio.src = getAyahAudioUrl(input.ayahNumber, reciter.id);
      audio.currentTime = 0;
      void audio.play().catch(() => {
        setStatus("error");
        setErrorMessage("Browser blocked playback. Tap play again.");
      });
    },
    [settings.reciterId],
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;

    if (!audio || !currentAyahRef.current) {
      return;
    }

    setStatus("loading");
    void audio.play().catch(() => {
      setStatus("error");
      setErrorMessage("Browser blocked playback. Tap play again.");
    });
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    currentAyahRef.current = null;
    setCurrentAyah(null);
    setStatus("idle");
    setErrorMessage(null);
  }, []);

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

  const value = useMemo<AudioContextValue>(
    () => ({
      currentAyah,
      status,
      errorMessage,
      reciterId: settings.reciterId,
      autoPlayNext: settings.autoPlayNext,
      playAyah,
      pause,
      resume,
      stop,
      setReciter,
      setAutoPlayNext,
    }),
    [
      currentAyah,
      errorMessage,
      pause,
      playAyah,
      resume,
      setAutoPlayNext,
      setReciter,
      settings.autoPlayNext,
      settings.reciterId,
      status,
      stop,
    ],
  );

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const context = useContext(AudioContext);

  if (!context) {
    throw new Error("useAudio must be used inside AudioProvider");
  }

  return context;
}
