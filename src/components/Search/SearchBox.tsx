"use client";

import {
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export default function SearchBox({
  value,
  onChange,
  placeholder,
  label = "Search",
}: SearchBoxProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onChange("");
    }
  };

  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <div className="relative group">
        <MagnifyingGlassIcon
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-400"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Search..."}
          className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white/5 dark:bg-black/20 pl-10 pr-10 text-sm text-inherit outline-none transition-all placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white/10 dark:focus:bg-white/5"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 opacity-40 group-focus-within:hidden">
            <kbd className="text-[10px] font-sans border border-slate-500 rounded px-1">ESC</kbd>
          </div>
        )}
      </div>
    </label>
  );
}
