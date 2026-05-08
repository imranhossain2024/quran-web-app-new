"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Interface for each letter's timing data
 */
interface LetterTiming {
  letter: string;
  startTime: number;
  endTime: number;
  position: number;
}

interface LetterMarkerProps {
  ayahNumber: number;
  arabicText: string;
  audioUrl: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isActive?: boolean;
}

/**
 * LetterMarker Component (Upgraded Professional Version)
 */
const LetterMarker: React.FC<LetterMarkerProps> = ({
  ayahNumber,
  arabicText,
  audioUrl,
  audioRef,
  isActive = false,
}) => {
  const [timings, setTimings] = useState<LetterTiming[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLetterRef = useRef<HTMLSpanElement>(null);

  /**
   * Fallback মেকানিজম: যদি এপিআই কাজ না করে তবে আমরা অডিওর ডিউরেশন অনুযায়ী অক্ষরগুলোকে ভাগ করে নেব।
   */
  const generateFallbackTimings = React.useCallback(() => {
    const letters = arabicText.split("");
    const audio = audioRef.current;
    const duration = (audio && audio.duration > 0) ? audio.duration : 10;
    
    // Calculate only "vocal" characters (ignore spaces and small Quranic marks)
    const vocalChars = letters.filter(char => char.trim() !== "" && !/[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/.test(char));
    const charDuration = duration / (vocalChars.length || 1);
    
    let currentStartTime = 0;
    const generated: LetterTiming[] = letters.map((letter, index) => {
      const isVocal = letter.trim() !== "" && !/[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/.test(letter);
      const start = currentStartTime;
      const end = isVocal ? currentStartTime + charDuration : currentStartTime + 0.01;
      
      if (isVocal) {
        currentStartTime += charDuration;
      } else {
        currentStartTime += 0.01; // Tiny gap for non-vocal marks
      }

      return {
        letter,
        startTime: start,
        endTime: end,
        position: index,
      };
    });
    setTimings(generated);
  }, [arabicText, audioRef]);
  useEffect(() => {
    if (!isActive) {
      setTimings([]);
      setCurrentIndex(-1);
      return;
    }

    const fetchTimings = async () => {
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/ayahs/${ayahNumber}/timings/ar.alafasy`);
        if (!response.ok) throw new Error("API failed");
        
        const data = await response.json();
        if (data.data && data.data.timings) {
          setTimings(data.data.timings);
        } else {
          generateFallbackTimings();
        }
      } catch (err) {
        generateFallbackTimings();
      }
    };

    fetchTimings();
  }, [ayahNumber, arabicText, isActive, generateFallbackTimings]);

  // ২. অডিওর মেটাডেটা লোড হলে টাইমিং আপডেট করা (Update timings when metadata is ready)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isActive) return;

    const handleLoadedMetadata = () => {
      // Re-generate fallback timings with correct duration
      generateFallbackTimings();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    // Also check if duration is already available
    if (audio.duration > 0) {
      handleLoadedMetadata();
    }

    return () => audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
  }, [isActive, audioRef, ayahNumber, generateFallbackTimings]); // Depend on ayahNumber to reset for next ayah

  // ২. রিয়েল-টাইম ট্র্যাকিং (Sync with audio timeupdate)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isActive) return;

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime - 0.15; // Added 150ms delay for visual comfort
      const index = timings.findIndex(
        (t) => currentTime >= t.startTime && currentTime < t.endTime
      );
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, [audioRef, timings, currentIndex, isActive]);

  // ৩. অটো-স্ক্রলিং (Smooth centered scrolling)
  useEffect(() => {
    if (activeLetterRef.current && isActive) {
      activeLetterRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentIndex, isActive]);

  // ৪. ক্লিক-টু-সিক লজিক (Seek audio on click)
  const handleSeek = (startTime: number) => {
    if (audioRef.current && isActive) {
      audioRef.current.currentTime = startTime;
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // ৫. লেটার রেন্ডারিং (Animated with Framer Motion)
  const renderedLetters = useMemo(() => {
    return arabicText.split("").map((char, index) => {
      const isCurrent = index === currentIndex && isActive;
      const isPrevious = index < currentIndex && isActive;
      
      return (
        <motion.span
          key={`${index}-${char}`}
          initial={false}
          animate={{
            scale: isCurrent ? 1.15 : 1,
            color: isCurrent ? "#fff" : isPrevious ? "#64748b" : "#f1f5f9",
            opacity: isPrevious ? 0.5 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={() => isActive && handleSeek(timings[index]?.startTime || 0)}
          ref={isCurrent ? activeLetterRef : null}
          className={`relative inline-block cursor-pointer px-[1px] font-arabic transition-all
            ${isCurrent ? "z-10" : "z-0 hover:text-amber-400"}
          `}
        >
          {/* Highlight Background Layer */}
          <AnimatePresence>
            {isCurrent && (
              <motion.span
                layoutId="letter-highlight"
                className="absolute inset-0 -z-10 rounded-md bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
          {char}
        </motion.span>
      );
    });
  }, [arabicText, currentIndex, isActive, timings]);

  return (
    <div className="relative w-full overflow-hidden">
      <div 
        ref={containerRef}
        className="font-arabic leading-[2.5] text-right dir-rtl select-none"
        style={{ direction: "rtl" }}
      >
        <div className="flex flex-wrap justify-end gap-x-0.5 gap-y-4 text-3xl sm:text-4xl md:text-5xl">
          {renderedLetters}
        </div>
      </div>
      
      {error && isActive && (
        <div className="mt-2 text-xs text-red-400 text-center animate-pulse">
          {error}
        </div>
      )}
    </div>
  );
};

export default React.memo(LetterMarker);
