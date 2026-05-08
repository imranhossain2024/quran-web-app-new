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
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <span className="relative block">
        <MagnifyingGlassIcon
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
        />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder ?? "Search..."}
          className="h-11 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white/10 dark:bg-black/40 pl-10 pr-10 text-sm text-inherit outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-black/10 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </span>
    </label>
  );
}
