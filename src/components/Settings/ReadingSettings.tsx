"use client";

import { useEffect } from "react";
import { 
  XMarkIcon, 
  SunIcon, 
  MoonIcon, 
  ComputerDesktopIcon,
  SparklesIcon,
  LanguageIcon,
  AdjustmentsHorizontalIcon,
  SpeakerWaveIcon,
  SwatchIcon
} from "@heroicons/react/24/outline";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { AUDIO_RECITERS } from "@/lib/audio";
import { useAudio } from "@/components/Audio/AudioProvider";
import { ReadingSettingsState, DEFAULT_READING_SETTINGS } from "@/types/settings";

interface ReadingSettingsProps {
  open: boolean;
  onClose: () => void;
}

const arabicFonts = [
  { name: "King Fahd (KFGQ)", value: "KFGQ PC Sans Bold" },
  { name: "Al Mushaf", value: "Al Mushaf" },
  { name: "Uthmanic Hafs", value: "Uthmanic Hafs" },
  { name: "Indo Pak", value: "Indo Pak" },
  { name: "Amiri", value: "Amiri" },
  { name: "Scheherazade New", value: "Scheherazade New" },
] as const;

export default function ReadingSettings({ open, onClose }: ReadingSettingsProps) {
  const { reciterId, autoPlayNext, setReciter, setAutoPlayNext } = useAudio();
  const [rawSettings, setSettings] = useLocalStorage<ReadingSettingsState>(
    "readingSettings",
    DEFAULT_READING_SETTINGS,
  );

  // Merge with defaults to handle missing keys from older versions of the app
  // This prevents the "controlled input changed to uncontrolled" warning
  const settings = { ...DEFAULT_READING_SETTINGS, ...rawSettings };

  useEffect(() => {
    const root = document.documentElement;

    // Font settings
    root.style.setProperty(
      "--font-arabic",
      `'${settings.arabicFont}', 'Amiri', 'Scheherazade', serif`,
    );
    root.style.setProperty("--size-arabic", `${settings.arabicSize}px`);
    root.style.setProperty("--size-translation", `${settings.translationSize}px`);
    root.style.setProperty("--arabic-line-height", `${settings.lineHeight}`);

    // Theme setting (system follows OS preference)
    if (settings.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const applySystemTheme = () => {
        root.setAttribute("data-theme", mediaQuery.matches ? "dark" : "light");
      };

      applySystemTheme();
      mediaQuery.addEventListener("change", applySystemTheme);
      return () => mediaQuery.removeEventListener("change", applySystemTheme);
    }

    root.setAttribute("data-theme", settings.theme);
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  const updateSetting = <Key extends keyof ReadingSettingsState>(
    key: Key,
    value: ReadingSettingsState[Key],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-500 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <div
        aria-label="Close settings"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-slate-800/50 bg-slate-950/95 shadow-2xl backdrop-blur-xl transition-transform duration-500 ease-out sm:w-[30rem] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Reading settings"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/50 p-6">
          <div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="h-4 w-4 text-emerald-400" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                Personalization
              </p>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-white tracking-tight">Reading Settings</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/50 text-slate-400 border border-slate-800 transition-all hover:bg-slate-800 hover:text-white hover:scale-105 active:scale-95"
            aria-label="Close settings"
          >
            <XMarkIcon className="h-6 w-6" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-9 overflow-y-auto p-6 scrollbar-hide pb-24">
          {/* Theme Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <SwatchIcon className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Appearance Theme</h3>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {(["light", "sepia", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => updateSetting("theme", t)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-300 ${
                    settings.theme === t
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
                      : "border-slate-800 bg-slate-900/40 text-slate-500 hover:border-slate-700 hover:text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    t === 'sepia' ? 'bg-[#f4ecd8] text-[#5b4636]' : 
                    t === 'light' ? 'bg-white text-slate-900' : 
                    t === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-slate-700 text-slate-200'
                  }`}>
                    {t === "light" && <SunIcon className="h-5 w-5" />}
                    {t === "dark" && <MoonIcon className="h-5 w-5" />}
                    {t === "system" && <ComputerDesktopIcon className="h-5 w-5" />}
                    {t === "sepia" && <span className="text-xs font-bold">S</span>}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Reading Style Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Mushaf Style & Qiraat</h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(["uthmani", "indopak", "tajweed"] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => updateSetting("mushafStyle", style)}
                  className={`px-4 py-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                    settings.mushafStyle === style
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-800 bg-slate-900/40 text-slate-500 hover:border-slate-700 hover:text-slate-300"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </section>

          {/* Display Toggles */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <SparklesIcon className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Display Controls</h3>
            </div>
            
            <div className="grid gap-3">
              {/* Reading Mode */}
              <label className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/60 hover:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 group-hover:text-emerald-400 transition-colors">
                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  </div>
                  <span>
                    <span className="block text-sm font-bold text-slate-200">Reading Mode</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Hide everything except Arabic text</span>
                  </span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.readingMode}
                    onChange={(e) => updateSetting("readingMode", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </div>
              </label>

              {/* Translation Toggle */}
              <label className={`group flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/60 hover:border-slate-700 cursor-pointer ${
                settings.readingMode ? "opacity-50 pointer-events-none" : ""
              }`}>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 group-hover:text-emerald-400 transition-colors">
                    <LanguageIcon className="h-5 w-5" />
                  </div>
                  <span>
                    <span className="block text-sm font-bold text-slate-200">Translations</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Show translation for each ayah</span>
                  </span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!settings.readingMode && settings.showTranslation}
                    onChange={(e) => updateSetting("showTranslation", e.target.checked)}
                    disabled={settings.readingMode}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </div>
              </label>

              {/* Ayah Numbers */}
              <label className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/60 hover:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 group-hover:text-emerald-400 transition-colors">
                    <span className="text-xs font-bold">123</span>
                  </div>
                  <span>
                    <span className="block text-sm font-bold text-slate-200">Ayah Numbers</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Show verse numbering in text</span>
                  </span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showAyahNumbers}
                    onChange={(e) => updateSetting("showAyahNumbers", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </div>
              </label>

              {/* Highlight Active Ayah */}
              <label className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/60 hover:border-slate-700 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 group-hover:text-emerald-400 transition-colors">
                    <SparklesIcon className="h-5 w-5" />
                  </div>
                  <span>
                    <span className="block text-sm font-bold text-slate-200">Highlight Ayah</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Emphasize currently playing ayah</span>
                  </span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.highlightCurrentAyah}
                    onChange={(e) => updateSetting("highlightCurrentAyah", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </div>
              </label>
            </div>
          </section>

          {/* Typography Settings */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <AdjustmentsHorizontalIcon className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Typography</h3>
            </div>
            
            <div className="space-y-6">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Arabic Font Family</span>
                <div className="relative mt-2">
                  <select
                    value={settings.arabicFont}
                    onChange={(e) => updateSetting("arabicFont", e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 px-4 pr-10 text-sm font-medium text-slate-100 outline-none transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    {arabicFonts.map((font) => (
                      <option key={font.value} value={font.value}>{font.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </label>

              {/* Sliders */}
              <div className="space-y-8 px-1">
                {/* Arabic Size */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Arabic Font Size</span>
                    <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">{settings.arabicSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="24"
                    max="64"
                    value={settings.arabicSize}
                    onChange={(e) => updateSetting("arabicSize", Number(e.target.value))}
                    className="slider-premium w-full"
                  />
                </div>

                {/* Line Spacing */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Line Spacing</span>
                    <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">{settings.lineHeight}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="3.0"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) => updateSetting("lineHeight", Number(e.target.value))}
                    className="slider-premium w-full"
                  />
                </div>

                {/* Translation Size */}
                {settings.showTranslation && !settings.readingMode && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Translation Size</span>
                      <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">{settings.translationSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="28"
                      value={settings.translationSize}
                      onChange={(e) => updateSetting("translationSize", Number(e.target.value))}
                      className="slider-premium w-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Audio Section */}
          <section className="space-y-6 pt-2 border-t border-slate-800/50">
            <div className="flex items-center gap-2 px-1">
              <SpeakerWaveIcon className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Audio Playback</h3>
            </div>
            
            <div className="space-y-6">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Default Reciter</span>
                <div className="relative mt-2">
                  <select
                    value={reciterId}
                    onChange={(e) => setReciter(e.target.value)}
                    className="h-12 w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 px-4 pr-10 text-sm font-medium text-slate-100 outline-none transition-all focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10"
                  >
                    {AUDIO_RECITERS.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </label>

              <label className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4 transition-all hover:bg-slate-900/60 hover:border-slate-700 cursor-pointer">
                <span className="text-sm font-bold text-slate-200">Auto-play next ayah</span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPlayNext}
                    onChange={(e) => setAutoPlayNext(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </div>
              </label>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-4 border-t border-slate-800/50 p-6 bg-slate-950/95 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSettings(DEFAULT_READING_SETTINGS)}
            className="h-12 flex-1 rounded-xl border border-slate-800 px-4 text-sm font-bold text-slate-400 transition-all hover:bg-slate-900 hover:text-white hover:border-slate-700 active:scale-95"
          >
            Reset to Default
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95"
          >
            Done
          </button>
        </div>
      </aside>
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
