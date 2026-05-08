"use client";

import { useEffect, useRef, useState } from "react";
import { ComputerDesktopIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { ReadingSettingsState, DEFAULT_READING_SETTINGS } from "@/types/settings";

export default function ThemeToggle() {
  const [settings, setSettings] = useLocalStorage<ReadingSettingsState>(
    "readingSettings",
    DEFAULT_READING_SETTINGS
  );

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const normalizedTheme: Exclude<ReadingSettingsState["theme"], "sepia"> =
    settings.theme === "sepia" ? "dark" : settings.theme;

  const icon = normalizedTheme === "light" ? (
      <SunIcon className="h-5 w-5" aria-hidden />
    ) : normalizedTheme === "dark" ? (
      <MoonIcon className="h-5 w-5" aria-hidden />
    ) : (
      <ComputerDesktopIcon className="h-5 w-5" aria-hidden />
    );

  const themeOptions: Array<Exclude<ReadingSettingsState["theme"], "sepia">> = [
    "light",
    "dark",
    "system",
  ];

  const selectTheme = (theme: Exclude<ReadingSettingsState["theme"], "sepia">) => {
    setSettings({ ...settings, theme });
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 text-slate-100 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        aria-label={`Theme menu. Current theme: ${normalizedTheme}`}
        aria-expanded={isOpen}
      >
        {icon}
        <span className="hidden text-xs font-semibold uppercase tracking-wide sm:inline">
          {normalizedTheme}
        </span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 mt-2 w-36 rounded-md border border-slate-800 bg-slate-900 p-1 shadow-xl">
          {themeOptions.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => selectTheme(theme)}
              className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm transition-colors ${
                normalizedTheme === theme
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "text-slate-200 hover:bg-slate-800"
              }`}
            >
              {theme === "light" ? (
                <SunIcon className="h-4 w-4" aria-hidden />
              ) : theme === "dark" ? (
                <MoonIcon className="h-4 w-4" aria-hidden />
              ) : (
                <ComputerDesktopIcon className="h-4 w-4" aria-hidden />
              )}
              <span className="capitalize">{theme}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
