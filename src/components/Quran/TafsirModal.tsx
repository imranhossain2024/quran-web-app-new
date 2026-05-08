"use client";

import { useEffect, useMemo, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  ayahNumberInSurah: number;
  surahName: string;
}

type TafsirState =
  | { status: "idle" | "loading" }
  | { status: "ready"; html: string }
  | { status: "error"; message: string };

const RESOURCE_NAME = "Ibn Kathir (Abridged)";
const tafsirCache = new Map<string, string>();

function sanitizeTafsirHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

export default function TafsirModal({
  isOpen,
  onClose,
  surahNumber,
  ayahNumberInSurah,
  surahName,
}: TafsirModalProps) {
  const [state, setState] = useState<TafsirState>({ status: "idle" });
  const verseKey = useMemo(() => `${surahNumber}:${ayahNumberInSurah}`, [ayahNumberInSurah, surahNumber]);
  const cachedHtml = useMemo(() => tafsirCache.get(verseKey) ?? null, [verseKey]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    if (cachedHtml) {
      return;
    }

    let isCancelled = false;
    const loadTafsir = async () => {
      setState({ status: "loading" });
      try {
        const response = await fetch(
          `https://api.quran.com/api/v4/tafsirs/169/by_ayah/${verseKey}`,
        );
        const payload = await response.json();
        const html = payload?.tafsir?.text as string | undefined;

        if (!response.ok || !html) {
          throw new Error("Unable to fetch tafsir.");
        }

        const sanitizedHtml = sanitizeTafsirHtml(html);
        tafsirCache.set(verseKey, sanitizedHtml);
        if (!isCancelled) {
          setState({ status: "ready", html: sanitizedHtml });
        }
      } catch {
        if (!isCancelled) {
          setState({
            status: "error",
            message: "Tafsir could not be loaded right now. Please try again.",
          });
        }
      }
    };

    loadTafsir();
    return () => {
      isCancelled = true;
    };
  }, [cachedHtml, isOpen, verseKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close tafsir modal"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Tafsir modal"
        className="absolute left-1/2 top-1/2 max-h-[88vh] w-[min(960px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-800 bg-slate-950/70 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-emerald-300">English: Ibn Kathir</p>
            <h3 className="mt-1 text-lg font-bold text-white">
              Tafsir &quot;Ibn Kathir&quot; (English)
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {surahName} • Ayah {ayahNumberInSurah} ({verseKey})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Close tafsir modal"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="max-h-[calc(88vh-92px)] overflow-y-auto px-5 py-5">
          {state.status === "loading" || state.status === "idle" ? (
            <p className="text-sm text-slate-300">Loading {RESOURCE_NAME} tafsir...</p>
          ) : null}

          {state.status === "error" ? (
            <p className="text-sm text-rose-300">{state.message}</p>
          ) : null}

          {cachedHtml || state.status === "ready" ? (
            <article
              className="prose prose-invert prose-p:text-slate-200 prose-headings:text-white prose-strong:text-slate-100 max-w-none text-base leading-8"
              dangerouslySetInnerHTML={{
                __html: cachedHtml ?? (state.status === "ready" ? state.html : ""),
              }}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
