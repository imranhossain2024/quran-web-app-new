"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DocumentTextIcon, XMarkIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PageJumperProps {
  currentPage: number;
  minPage?: number;
  maxPage?: number;
  sticky?: boolean;
}

export default function PageJumper({
  currentPage,
  minPage = 1,
  maxPage = 604,
  sticky = false,
}: PageJumperProps) {
  const router = useRouter();
  const [pageInput, setPageInput] = useState(String(currentPage));
  const [error, setError] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const placeholderText = useMemo(() => `${minPage}-${maxPage}`, [maxPage, minPage]);

  useEffect(() => {
    if (!sticky || !anchorRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPinned(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-80px 0px 0px 0px",
      }
    );

    observer.observe(anchorRef.current);

    return () => {
      observer.disconnect();
    };
  }, [sticky]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const page = Number(pageInput.trim());
    if (!Number.isInteger(page) || page < minPage || page > maxPage) {
      setError(`Page ${minPage}-${maxPage}`);
      return;
    }

    setError("");
    setIsOpen(false);
    router.push(`/page/${page}`);
  };

  return (
    <div ref={anchorRef} className={sticky ? "mt-2 mb-8 min-h-[48px]" : "mt-6"}>
      <div
        className={`transition-all duration-300 ${
          sticky && isPinned
            ? "fixed top-20 right-4 z-40 md:top-24 md:right-8"
            : "relative flex justify-end"
        }`}
      >
        <div className="relative">
          {/* Main Toggle Button */}
          {!isOpen && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className={`group flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/95 px-4 py-2.5 text-sm font-semibold text-slate-200 shadow-xl shadow-slate-950/50 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:border-emerald-500/50 ${
                isPinned ? "animate-in fade-in zoom-in duration-300" : ""
              }`}
              aria-label="Jump to page"
            >
              <DocumentTextIcon className="h-5 w-5 text-emerald-400" />
              <span className="hidden sm:inline">Jump to Page</span>
              <span className="sm:hidden">Jump</span>
            </button>
          )}

          {/* Expanded Form */}
          {isOpen && (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-slate-900/95 p-1.5 shadow-2xl shadow-emerald-950/20 backdrop-blur animate-in slide-in-from-right-4 fade-in duration-300"
            >
              <div className="relative ml-2">
                <input
                  ref={inputRef}
                  type="number"
                  min={minPage}
                  max={maxPage}
                  inputMode="numeric"
                  value={pageInput}
                  onChange={(e) => {
                    setPageInput(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder={placeholderText}
                  className="h-9 w-24 bg-transparent pl-2 pr-2 text-sm font-medium text-white placeholder:text-slate-500 focus:outline-none"
                />
                {error && (
                  <div className="absolute -bottom-8 left-0 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-rose-400 animate-in fade-in slide-in-from-top-1">
                    {error}
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white transition-all hover:bg-emerald-500 active:scale-95"
                aria-label="Go"
              >
                <ChevronRightIcon className="h-4 w-4" strokeWidth={3} />
              </button>
              
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                aria-label="Close"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
