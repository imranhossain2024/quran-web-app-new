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

  useEffect(() => {
    currentAyahRef.current = currentAyah;
  }, [currentAyah]);

  useEffect(() => {
    autoPlayNextRef.current = settings.autoPlayNext;
  }, [settings.autoPlayNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // STEP 1: Prime the audio element with base64-encoded silence
    // This gives the element a valid src immediately so it can be "unlocked"
    // by user interaction. On HTTPS, browsers need the audio element to have
    // been "activated" by a gesture at least once before any play() call
    // with a real URL will succeed.
    const SILENCE_BASE64 =
      "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAWGluZwAAAAAA" +
      "AAAAP/9j/4AAABhZGRvdkRFRkwAAACDxMDAwP//4QoA5ABpbmRleC5odG1sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" +
      "AAAAAAAAAAAAAAAAAAAAAP/zAAABkAABpAAAk2gAAAAAABAAAAAAAAAAAAAAAAAAAABIEFkb2JlIFBob3Rvc2hvcCA1LjAgV2luZG93cwAA" +
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAD/AAAA/wAAAP//AAAAAP//AAD//wAA//8AAP//AAD//xEBEgAAAABQYXltZW50AAAAAAAAAAAAAAAAAAAA";
    audio.src = SILENCE_BASE64;
    audio.load();

    // STEP 2: Persistent unlock mechanism for strict browser autoplay policy.
    // Unlike the previous implementation which removed itself after one click,
    // this uses a flag to only unlock once, but listens for ANY user gesture
    // on the document to prime the audio element.
    let isUnlocked = false;

    const unlock = () => {
      if (isUnlocked || !audio) return;
      isUnlocked = true;

      // Resume any suspended AudioContext (global unlock for audio)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        ctx.resume().catch(() => {});
        // Create a silent buffer and play it to unlock audio
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (_e) {
        // AudioContext not available, fall back to HTMLAudioElement unlock
      }

      // Play the audio element (which now has silence loaded) to activate it
      // This is the critical step - it marks this audio element as "user-activated"
      audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {
          // If silence fails, the element still may have been primed partially
          // Try alternative: load a small actual audio fragment
        });

      // Keep the listeners in place - remove only the unlock logic
      // but DON'T remove the listeners themselves - they provide resilience
    };

    // Use capture phase to catch events before React's synthetic events
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

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
      // Don't set error for silence base64 - it's expected to fail
      if (audio && audio.src && audio.src.startsWith("data:audio")) {
        return;
      }
      setStatus("error");
      setErrorMessage("Audio could not be loaded. Please try again.");
    };
    const handleEnded = () => {
      const activeAyah = currentAyahRef.current;

      // Handle auto-play next
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

        setCurrentAyah(nextAyah);
        setStatus("loading");
        audio.src = getAyahAudioUrl(nextAyahNumber, activeAyah.reciterId);
        audio.currentTime = 0;
        // Don't call load() here as it might break the auto-play chain
        void audio.play().catch((error) => {
          console.warn("Auto-play blocked:", error);
          setStatus("error");
          setErrorMessage("Auto-play blocked by browser. Tap play to continue.");
        });
        return;
      }

      setStatus("idle");
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
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
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
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

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  const playAyah = useCallback(
    (input: PlayAyahInput) => {
      const audio = audioRef.current;
      if (!audio) return;

      const reciter = getReciterById(settings.reciterId);
      const audioUrl = getAyahAudioUrl(input.ayahNumber, reciter.id);
      
      // CRITICAL FIX for NotAllowedError on HTTPS:
      // 1. Do NOT call audio.load() after setting src - it invalidates the
      //    browser's transient activation (user gesture token).
      // 2. Setting audio.src automatically schedules loading; calling load()
      //    explicitly resets readyState to HAVE_NOTHING and drops gesture context.
      // 3. Call audio.play() synchronously within this user gesture context.
      //
      // The order is: set src → immediately call play() → update React state later
      audio.src = audioUrl;
      
      // Update refs BEFORE play (these are synchronous and don't trigger re-renders)
      const nextAyah: CurrentAyah = {
        ...input,
        reciterId: reciter.id,
      };
      currentAyahRef.current = nextAyah;
      
      // Call play() IMMEDIATELY - before any React state updates.
      // State updates (setState) schedule a re-render which could, in theory,
      // interrupt the gesture context in some edge cases.
      const playPromise = audio.play();
      
      // Now update React state (these are batched in React 18+)
      setCurrentAyah(nextAyah);
      setCurrentTime(0);
      setDuration(0);
      setStatus("loading");
      setErrorMessage(null);
      
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Playback failed details:", error);
          setStatus("error");
          if (error.name === "NotAllowedError") {
            setErrorMessage("Browser blocked playback. Please click/tap again to allow.");
          } else {
            setErrorMessage(`Playback error: ${error.name} - ${error.message || "Unknown error"}. Tap play again.`);
          }
        });
      }
    },
    [settings.reciterId],
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.pause();
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentAyahRef.current) return;

    setStatus("loading");
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Resume failed:", error);
        setStatus("error");
        setErrorMessage("Browser blocked playback. Tap play again.");
      });
    }
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

      if (!audio) {
        return;
      }

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

    if (adjusted > 0) {
      lastVolumeRef.current = adjusted;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      setVolumeState(lastVolumeRef.current || 0.8);
      return;
    }

    lastVolumeRef.current = volume || lastVolumeRef.current;
    setIsMuted(true);
  }, [isMuted, volume]);

  const rewind = useCallback(
    (seconds: number) => {
      seek((currentTime || 0) - seconds);
    },
    [currentTime, seek],
  );

  const fastForward = useCallback(
    (seconds: number) => {
      seek((currentTime || 0) + seconds);
    },
    [currentTime, seek],
  );

  const playNextAyah = useCallback(() => {
    const activeAyah = currentAyahRef.current;

    if (!activeAyah || activeAyah.numberInSurah >= activeAyah.surahAyahCount) {
      return;
    }

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

    if (!activeAyah || activeAyah.numberInSurah <= 1) {
      return;
    }

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
    setVolumeState((current) => {
      const newVolume = clamp(current + step, 0, 1);
      setIsMuted(newVolume === 0);
      if (newVolume > 0) {
        lastVolumeRef.current = newVolume;
      }
      return newVolume;
    });
  }, []);

  const decreaseVolume = useCallback((step: number = 0.1) => {
    setVolumeState((current) => {
      const newVolume = clamp(current - step, 0, 1);
      setIsMuted(newVolume === 0);
      if (newVolume > 0) {
        lastVolumeRef.current = newVolume;
      }
      return newVolume;
    });
  }, []);

  const canPlayNext = useMemo(
    () =>
      Boolean(
        currentAyah && currentAyah.numberInSurah < currentAyah.surahAyahCount,
      ),
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
      canPlayNext,
      canPlayPrevious,
      currentAyah,
      currentTime,
      duration,
      errorMessage,
      increaseVolume,
      decreaseVolume,
      isMuted,
      playAyah,
      pause,
      playNextAyah,
      playPreviousAyah,
      resume,
      seek,
      setAutoPlayNext,
      setReciter,
      setVolume,
      settings.autoPlayNext,
      settings.reciterId,
      status,
      stop,
      toggleMute,
      volume,
    ],
  );


  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
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
