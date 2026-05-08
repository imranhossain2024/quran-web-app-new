"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const [pinnedLeft, setPinnedLeft] = useState<number | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const placeholderText = useMemo(() => `${minPage}-${maxPage}`, [maxPage, minPage]);

  useEffect(() => {
    if (!sticky || !anchorRef.current) return;

    const updatePinnedLeft = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setPinnedLeft(rect.left + rect.width / 2);
    };

    updatePinnedLeft();

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPinned(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "-80px 0px 0px 0px",
      },
    );

    observer.observe(anchorRef.current);

    window.addEventListener("resize", updatePinnedLeft);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePinnedLeft);
    };
  }, [sticky]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const page = Number(pageInput.trim());
    if (!Number.isInteger(page) || page < minPage || page > maxPage) {
      setError(`Please enter a valid page between ${minPage} and ${maxPage}.`);
      return;
    }

    setError("");
    router.push(`/page/${page}`);
  };

  return (
    <div ref={anchorRef} className={sticky ? "mt-2 mb-5 min-h-[88px]" : "mt-6"}>
      <div
        className={
          sticky && isPinned
            ? "fixed top-[4.5rem] z-20 w-full max-w-xs -translate-x-1/2 md:top-[4.75rem] lg:top-[5rem]"
            : ""
        }
        style={sticky && isPinned && pinnedLeft !== null ? { left: `${pinnedLeft}px` } : undefined}
      >
      <form
        onSubmit={handleSubmit}
        className={`mx-auto w-full max-w-xs rounded-xl border border-slate-800 p-3 ${
          sticky ? "bg-slate-950/90 shadow-lg shadow-slate-950/30 backdrop-blur" : "bg-slate-900/60"
        }`}
        aria-label="Page jump form"
      >
        <label
          htmlFor="page-jumper-input"
          className="mb-2 block text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
        >
          Jump to Page
        </label>
        <div className="flex items-center gap-2">
          <input
            id="page-jumper-input"
            type="number"
            min={minPage}
            max={maxPage}
            inputMode="numeric"
            value={pageInput}
            onChange={(event) => setPageInput(event.target.value)}
            placeholder={placeholderText}
            className="h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "page-jumper-error" : undefined}
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Go
          </button>
        </div>
        {error ? (
          <p id="page-jumper-error" className="mt-2 text-left text-xs text-rose-400">
            {error}
          </p>
        ) : null}
      </form>
      </div>
    </div>
  );
}
