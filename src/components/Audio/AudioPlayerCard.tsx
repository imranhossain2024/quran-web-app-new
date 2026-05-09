"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type MouseEvent,
} from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Download,
  Share2,
  Repeat,
  Repeat1,
  Settings,
  Loader2,
} from "lucide-react";

/**
 * AudioPlayerCard Props Interface
 * 
 * এই ইন্টারফেসটি AudioPlayerCard কম্পোনেন্টের জন্য প্রপস সংজ্ঞায়িত করে
 * এটি একটি Quranic audio player এর জন্য প্রয়োজনীয় সকল ডেটা ও কলব্যাক ফাংশন ধারণ করে
 */
export interface AudioPlayerCardProps {
  /** কুরআনের আয়াত নম্বর (গ্লোবাল ইনডেক্স) */
  ayahNumber: number;
  /** সূরাহর নাম (ইংরেজি) */
  surahName: string;
  /** সূরাহর আরবি নাম */
  arabicSurahName?: string;
  /** আরবি আয়াত টেক্সট */
  arabicText: string;
  /** আয়াতের অনুবাদ (ঐচ্ছিক) */
  translation?: string;
  /** তিলাওয়াতকারীর নাম */
  reciterName?: string;
  /** অডিওর স্থায়িত্বকাল (সেকেন্ডে) */
  duration?: number;
  /** অডিও ফাইলের URL */
  audioUrl: string;
  /** সূরাহর মোট আয়াত সংখ্যা */
  surahAyahCount?: number;
  /** সূরাহর মধ্যে আয়াতের ক্রম */
  numberInSurah?: number;
  /** সূরাহ নম্বর */
  surahNumber?: number;
  /** প্লে/পজ করার কলব্যাক */
  onPlay?: () => void;
  /** পজ করার কলব্যাক */
  onPause?: () => void;
  /** অডিও শেষ হওয়ার কলব্যাক */
  onComplete?: () => void;
  /** পরবর্তী আয়াতে যাওয়ার কলব্যাক */
  onNextAyah?: () => void;
  /** পূর্ববর্তী আয়াতে যাওয়ার কলব্যাক */
  onPreviousAyah?: () => void;
  /** এই আয়াতটি শেষ কিনা */
  isLastAyah?: boolean;
  /** এই আয়াতটি প্রথম কিনা */
  isFirstAyah?: boolean;
}

/**
 * সময় ফরম্যাটিং ফাংশন
 * সেকেন্ডকে MM:SS ফরম্যাটে রূপান্তর করে
 * 
 * @example
 * formatTime(75) // "1:15"
 * formatTime(5)  // "0:05"
 */
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

/**
 * AudioPlayerCard Component
 * 
 * একটি প্রফেশনাল, কমপ্যাক্ট অডিও প্লেয়ার কার্ড Quranic recitation এর জন্য।
 * এটি একটি সম্পূর্ণ ফিচারযুক্ত অডিও কন্ট্রোলার যা প্লে/পজ, প্রগ্রেস বার,
 * ভলিউম কন্ট্রোল, এবং নেভিগেশন বাটন সমর্থন করে।
 * 
 * বাংলায় বিস্তারিত:
 * এই কম্পোনেন্টটি মূলত একটি ছোট কার্ড আকৃতির অডিও প্লেয়ার যা
 * কুরআনের আয়াত তিলাওয়াত শোনার জন্য ডিজাইন করা হয়েছে। এতে নিচের ফিচারগুলো আছে:
 * 
 * ১. প্লে/পজ বাটন - অডিও চালু ও বিরতি দেওয়ার জন্য
 * ২. প্রগ্রেস বার - বর্তমান সময় ও মোট সময় দেখায়, ক্লিক করে সিক করা যায়
 * ৩. ভলিউম কন্ট্রোল - সাউন্ড লেভেল নিয়ন্ত্রণ
 * ৪. নেভিগেশন - আগের ও পরের আয়াতে যাওয়া
 * ৫. রিপিট মোড - একটি আয়াত বারবার শোনা
 * ৬. ফেভারিট/বুকমার্ক - পছন্দের আয়াত সংরক্ষণ
 * ৭. ডাউনলোড ও শেয়ার - অডিও ডাউনলোড ও শেয়ার করা
 */
export default function AudioPlayerCard({
  ayahNumber,
  surahName,
  arabicSurahName,
  arabicText,
  translation,
  reciterName,
  duration: propDuration,
  audioUrl,
  surahAyahCount,
  numberInSurah,
  onPlay,
  onPause,
  onComplete,
  onNextAyah,
  onPreviousAyah,
  isLastAyah = false,
  isFirstAyah = false,
}: AudioPlayerCardProps) {
  // ==================== STATE MANAGEMENT ====================
   
   /** অডিও এলিমেন্ট রেফারেন্স - HTML5 Audio API ব্যবহারের জন্য */
   const audioRef = useRef<HTMLAudioElement>(null);
   
   /** প্লে হচ্ছে কিনা */
   const [isPlaying, setIsPlaying] = useState(false);
   
   /** লোড হচ্ছে কিনা */
   const [isLoading, setIsLoading] = useState(false);
   
   /** বর্তমান প্লেব্যাক সময় (সেকেন্ডে) */
   const [currentTime, setCurrentTime] = useState(0);
   
   /** অডিওর মোট স্থায়িত্বকাল (সেকেন্ডে) */
   const [duration, setDuration] = useState(propDuration || 0);
   
   /** ভলিউম লেভেল (0-1) */
   const [volume, setVolume] = useState(1);
   
   /** মিউট অবস্থা */
   const [isMuted, setIsMuted] = useState(false);
   
   /** রিপিট মোড: 'off' | 'single' | 'all' */
   const [repeatMode, setRepeatMode] = useState<"off" | "single" | "all">("off");
   
   /** ফেভারিট/বুকমার্ক অবস্থা */
   const [isFavorite, setIsFavorite] = useState(false);
   
   /** এরর মেসেজ */
   const [errorMessage, setErrorMessage] = useState<string | null>(null);
   
   /** ভলিউম স্লাইডার दिखানো হচ্ছে কিনা */
   const [showVolumeSlider, setShowVolumeSlider] = useState(false);

// ==================== MEMOIZED VALUES ====================
   
   /** প্রগ্রেস পার্সেন্টেজ গণনা */
   const progressPercent = useMemo(() => {
     if (!duration || !Number.isFinite(currentTime) || duration === 0) {
       return 0;
     }
     return Math.min(Math.max((currentTime / duration) * 100, 0), 100);
   }, [currentTime, duration]);

  // ==================== AUDIO EVENT HANDLERS ====================

  /**
   * অডিও মেটাডেটা লোড হওয়ার পর কল হয়
   * মোট স্থায়িত্বকাল সেট করে
   */
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
      setErrorMessage(null);
    }
  }, []);

  /**
   * সময় আপডেট হলে কল হয়
   * বর্তমান প্লেব্যাক সময় আপডেট করে
   */
  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  /**
   * অডিও শেষ হলে কল হয়
   * রিপিট মোড বা পরবর্তী আয়াত প্লে করে
   * 
   * বাংলায় ব্যাখ্যা:
   * যখন একটি আয়াতের তিলাওয়াত শেষ হয়ে যায়, তখন এই ফাংশনটি কল হয়।
   * এটি তিনটি কাজ করতে পারে:
   * ১. Single repeat মোডে - একই আয়াত আবার শুরু করে
   * ২. All repeat মোডে - পরবর্তী আয়াত প্লে করে (শেষ আয়াত হলে প্রথমে ফিরে যায়)
   * ৩. Off মোডে - শুধু onComplete কলব্যাক কল করে
   */
  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    
    if (repeatMode === "single") {
      // একই আয়াত আবার প্লে করুন
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          setErrorMessage("Playback failed. Please try again.");
        });
      }
    } else if (repeatMode === "all" && onNextAyah && !isLastAyah) {
      // পরবর্তী আয়াত প্লে করুন
      onNextAyah();
    } else {
      // onComplete কলব্যাক কল করুন
      onComplete?.();
    }
  }, [repeatMode, isLastAyah, onNextAyah, onComplete]);

  /**
   * অডিও প্লে শুরু হলে কল হয়
   */
  const handlePlaying = useCallback(() => {
    setIsPlaying(true);
    setIsLoading(false);
    setErrorMessage(null);
    onPlay?.();
  }, [onPlay]);

  /**
   * অডিও পজ হলে কল হয়
   */
  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  /**
   * অডিও লোড হওয়ার সময় অপেক্ষা করছে
   */
  const handleWaiting = useCallback(() => {
    setIsLoading(true);
  }, []);

  /**
   * অডিও এরর হলে কল হয়
   */
  const handleError = useCallback(() => {
    setIsLoading(false);
    setIsPlaying(false);
    setErrorMessage("Audio could not be loaded. Please check the URL.");
  }, []);

  // ==================== EFFECT: AUDIO ELEMENT SETUP ====================
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // ইভেন্ট লিসেনার যুক্ত করুন
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("error", handleError);

    // ক্লিনআপ ফাংশন
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("error", handleError);
    };
  }, [handleLoadedMetadata, handleTimeUpdate, handleEnded, handlePlaying, handlePause, handleWaiting, handleError]);

  // ==================== EFFECT: AUDIO SOURCE UPDATE ====================
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // নতুন অডিও URL সেট করুন
    audio.src = audioUrl;
    
    // স্টেট রিসেট
    setCurrentTime(0);
    setDuration(propDuration || 0);
    setIsPlaying(false);
    setIsLoading(false);
    setErrorMessage(null);
  }, [audioUrl, propDuration]);

  // ==================== EFFECT: PLAYBACK PROPERTIES ====================
   
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // ==================== CONTROL HANDLERS ====================

  /**
   * প্লে/পজ টগল ফাংশন
   * 
   * বাংলায় ব্যাখ্যা:
   * এই ফাংশনটি প্লে এবং পজের মধ্যে টগল করে।
   * যদি অডিও প্লে না হয়, তাহলে প্লে করে, আর যদি প্লে হয় তাহলে পজ করে।
   * এটি একটি লাইট সুইচের মতো কাজ করে - এক ক্লিকে অন/অফ হয়।
   */
  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      setIsLoading(true);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Playback failed:", error);
          setIsLoading(false);
          if (error.name === "NotAllowedError") {
            setErrorMessage("Browser blocked playback. Please try again.");
          } else {
            setErrorMessage(`Playback error: ${error.message || "Unknown error"}. Please try again.`);
          }
        });
      }
    }
  }, [isPlaying]);

  /**
   * প্রগ্রেস বারে ক্লিক করে সিক করার ফাংশন
   * 
   * @param e - মাউস ইভেন্ট
   */
  const handleProgressClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  /**
   * ভলিউম পরিবর্তন ফাংশন
   */
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  /**
   * মিউট/আনমিউট টগল ফাংশন
   */
  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  /**
   * রিপিট মোড টগল ফাংশন
   * off -> single -> all -> off
   */
  const handleRepeatToggle = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "single";
      if (prev === "single") return "all";
      return "off";
    });
  }, []);

  /**
   * ফেভারিট টগল ফাংশন
   */
  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite((prev) => !prev);
  }, []);

  /**
   * ডাউনলোড ফাংশন
   */
  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${surahName}_${ayahNumber}.mp3`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [audioUrl, surahName, ayahNumber]);

  /**
   * শেয়ার ফাংশন
   */
  const handleShare = useCallback(async () => {
    const shareData = {
      title: `Surah ${surahName} - Ayah ${numberInSurah || ayahNumber}`,
      text: `Listen to Surah ${surahName}, Ayah ${numberInSurah || ayahNumber}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: ক্লিপবোর্ডে কপি
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  }, [surahName, numberInSurah, ayahNumber]);

  /**
   * পূর্ববর্তী আয়াতে যাওয়া
   */
  const handlePrevious = useCallback(() => {
    if (!isFirstAyah) {
      onPreviousAyah?.();
    }
  }, [isFirstAyah, onPreviousAyah]);

  /**
   * পরবর্তী আয়াতে যাওয়া
   */
  const handleNext = useCallback(() => {
    if (!isLastAyah) {
      onNextAyah?.();
    }
  }, [isLastAyah, onNextAyah]);

  // ==================== KEYBOARD SHORTCUTS ====================
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space = play/pause
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        handlePlayPause();
      }
      // Arrow Right = next ayah
      if (e.code === "ArrowRight" && !isLastAyah) {
        handleNext();
      }
      // Arrow Left = previous ayah
      if (e.code === "ArrowLeft" && !isFirstAyah) {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause, handleNext, handlePrevious, isLastAyah, isFirstAyah]);

  // ==================== RENDER ====================
  
  return (
    <div
      className="relative w-full max-w-[150px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl"
      role="region"
      aria-label="Audio player"
    >
      {/* Hidden Audio Element */}
      <audio ref={audioRef} preload="metadata" />

      {/* ==================== HEADER SECTION ==================== */}
      <div className="border-b border-slate-800 px-4 py-3">
        {/* Top info row */}
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                Ayah {numberInSurah || ayahNumber}
              </span>
              <span className="text-slate-600">•</span>
              <span className="truncate text-sm font-semibold text-white">
                {surahName}
              </span>
            </div>
            {reciterName && (
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {reciterName}
              </p>
            )}
          </div>
          
          {/* Favorite button */}
          <button
            type="button"
            onClick={handleFavoriteToggle}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 ${
              isFavorite
                ? "bg-emerald-500/20 text-emerald-400"
                : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
            }`}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={isFavorite}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
            />
          </button>
        </div>

        {/* Arabic text */}
        <p
          className="mt-2 text-right font-serif text-lg leading-relaxed text-slate-200"
          dir="rtl"
          lang="ar"
        >
          {arabicText}
        </p>

        {/* Translation (optional) */}
        {translation && (
          <p className="mt-1 text-xs text-slate-500">{translation}</p>
        )}
      </div>

      {/* ==================== ERROR MESSAGE ==================== */}
      {errorMessage && (
        <div className="mx-4 mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 border border-red-500/20">
          {errorMessage}
        </div>
      )}

      {/* ==================== MAIN PLAY BUTTON ==================== */}
      <div className="flex items-center justify-center py-4">
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={isLoading}
          className={`group relative flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300 ${
            isLoading
              ? "bg-slate-700 cursor-wait"
              : isPlaying
              ? "bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              : "bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)]"
          }`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          ) : isPlaying ? (
            <Pause className="h-7 w-7 text-white" />
          ) : (
            <Play className="ml-1 h-7 w-7 text-white" />
          )}
          
          {/* Pulse effect when playing */}
          {isPlaying && (
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
          )}
        </button>
      </div>

      {/* ==================== PROGRESS BAR ==================== */}
      <div className="px-4 pb-2">
        <div
          className="relative h-1.5 cursor-pointer rounded-full bg-slate-700 transition-colors hover:bg-slate-600"
          onClick={handleProgressClick}
          role="slider"
          aria-label="Audio progress"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
        >
          {/* Progress fill with gradient */}
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 transition-all duration-100 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
          
          {/* Progress thumb */}
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-lg transition-all duration-100 ease-linear"
            style={{ left: `calc(${progressPercent}% - 6px)` }}
          />
        </div>

        {/* Time display */}
        <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* ==================== CONTROLS BAR ==================== */}
      <div className="flex items-center justify-between border-t border-slate-800 px-3 py-3">
        {/* Previous button */}
        <button
          type="button"
          onClick={handlePrevious}
          disabled={isFirstAyah}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
            isFirstAyah
              ? "cursor-not-allowed opacity-30"
              : "text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
          }`}
          aria-label="Previous ayah"
          title="Previous ayah (←)"
        >
          <SkipBack className="h-5 w-5" />
        </button>

        {/* Rewind 10s */}
        <button
          type="button"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = Math.max(0, currentTime - 10);
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-emerald-400"
          aria-label="Rewind 10 seconds"
          title="Rewind 10s"
        >
          <span className="text-xs font-medium">-10</span>
        </button>

        {/* Repeat button */}
        <button
          type="button"
          onClick={handleRepeatToggle}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
            repeatMode !== "off"
              ? "bg-emerald-500/20 text-emerald-400"
              : "text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
          }`}
          aria-label={`Repeat mode: ${repeatMode}`}
          aria-pressed={repeatMode !== "off"}
          title={`Repeat: ${repeatMode}`}
        >
          {repeatMode === "single" ? (
            <Repeat1 className="h-4 w-4" />
          ) : (
            <Repeat className="h-4 w-4" />
          )}
        </button>

        {/* Volume control */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowVolumeSlider(!showVolumeSlider);
              // Speed control removed
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-emerald-400"
            aria-label={isMuted ? "Unmute" : "Mute"}
            title="Volume"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : volume < 0.33 ? (
              <Volume1 className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>

          {/* Volume slider popup */}
          {showVolumeSlider && (
            <div className="absolute bottom-full left-1/2 mb-2 w-32 -translate-x-1/2 rounded-xl bg-slate-800 p-3 shadow-xl border border-slate-700">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-600 accent-emerald-500"
                aria-label="Volume"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleMuteToggle}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  {isMuted ? "Unmute" : "Mute"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Forward 10s */}
        <button
          type="button"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = Math.min(duration, currentTime + 10);
            }
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-emerald-400"
          aria-label="Forward 10 seconds"
          title="Forward 10s"
        >
          <span className="text-xs font-medium">+10</span>
        </button>

        {/* Next button */}
        <button
          type="button"
          onClick={handleNext}
          disabled={isLastAyah}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
            isLastAyah
              ? "cursor-not-allowed opacity-30"
              : "text-slate-400 hover:bg-slate-800 hover:text-emerald-400"
          }`}
          aria-label="Next ayah"
          title="Next ayah (→)"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      {/* ==================== BOTTOM ACTION BAR ==================== */}
      <div className="flex items-center justify-center gap-2 border-t border-slate-800 px-3 py-2">
        {/* Download button */}
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-emerald-400"
          aria-label="Download audio"
          title="Download"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download</span>
        </button>

        {/* Share button */}
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-emerald-400"
          aria-label="Share"
          title="Share"
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Share</span>
        </button>

        {/* Settings button (placeholder) */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-all duration-200 hover:bg-slate-800 hover:text-emerald-400"
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}