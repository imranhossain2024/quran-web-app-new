"use client";

import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { ReadingSettingsState, DEFAULT_READING_SETTINGS } from "@/types/settings";

export default function ThemeToggle() {
  const [settings, setSettings] = useLocalStorage<ReadingSettingsState>(
    "readingSettings",
    DEFAULT_READING_SETTINGS
  );

  const toggleTheme = () => {
    const nextTheme = settings.theme === "light" ? "dark" : "light";
    setSettings({ ...settings, theme: nextTheme });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-100 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      aria-label="Toggle theme"
    >
      {settings.theme === "light" ? (
        <MoonIcon className="h-5 w-5" aria-hidden />
      ) : (
        <SunIcon className="h-5 w-5" aria-hidden />
      )}
    </button>
  );
}
