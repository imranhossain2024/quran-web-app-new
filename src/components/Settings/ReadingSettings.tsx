"use client";

import { useEffect } from "react";
import { XMarkIcon, SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { AUDIO_RECITERS } from "@/lib/audio";
import { useAudio } from "@/components/Audio/AudioProvider";
import { ReadingSettingsState, DEFAULT_READING_SETTINGS } from "@/types/settings";

interface ReadingSettingsProps {
  open: boolean;
  onClose: () => void;
}


const arabicFonts = [
  "KFGQ PC Sans Bold",
  "Amiri",
  "Scheherazade",
] as const;

export default function ReadingSettings({ open, onClose }: ReadingSettingsProps) {
  const { reciterId, autoPlayNext, setReciter, setAutoPlayNext } = useAudio();
  const [settings, setSettings] = useLocalStorage<ReadingSettingsState>(
    "readingSettings",
    DEFAULT_READING_SETTINGS,
  );

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

    if (settings.theme === "sepia") {
      root.setAttribute("data-theme", "sepia");
      return;
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
      className={`fixed inset-0 z-50 transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/70 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-950 shadow-2xl shadow-black transition-transform duration-300 sm:w-[28rem] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Reading settings"
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-slate-900/50">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Settings
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">Reading Experience</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Close settings"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto p-6 scrollbar-hide">
          {/* Theme Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Appearance</h3>
            <div className="grid grid-cols-3 gap-3">
              {(["light", "dark", "system"] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateSetting("theme", theme)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 transition-all ${
                    settings.theme === theme
                      ? "border-emerald-500 bg-emerald-500/10 text-white"
                      : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {theme === "light" && <SunIcon className="h-5 w-5" />}
                  {theme === "dark" && <MoonIcon className="h-5 w-5" />}
                  {theme === "system" && <ComputerDesktopIcon className="h-5 w-5" />}
                  <span className="text-xs font-medium capitalize">{theme}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Display Toggles */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Display Options</h3>
            
            {/* Reading Mode Toggle */}
            <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:bg-slate-900">
              <span>
                <span className="block text-sm font-medium text-slate-200">Reading</span>
                <span className="mt-0.5 block text-xs text-slate-400">Arabic-only mode for focused reading</span>
              </span>
              <input
                type="checkbox"
                checked={settings.readingMode}
                onChange={(e) => updateSetting("readingMode", e.target.checked)}
                className="h-5 w-5 accent-emerald-500 rounded border-slate-700 bg-slate-800"
              />
            </label>

            {/* Translation Toggle */}
            <label className={`flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4 transition-colors ${
              settings.readingMode ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-900"
            }`}>
              <span>
                <span className="block text-sm font-medium text-slate-200">Translation</span>
                <span className="mt-0.5 block text-xs text-slate-400">Show or hide ayah translations</span>
              </span>
              <input
                type="checkbox"
                checked={!settings.readingMode && settings.showTranslation}
                onChange={(e) => !settings.readingMode && updateSetting("showTranslation", e.target.checked)}
                disabled={settings.readingMode}
                className="h-5 w-5 accent-emerald-500 rounded border-slate-700 bg-slate-800"
              />
            </label>
          </section>

          {/* Font Settings */}
          <section className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Typography</h3>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Arabic Font</span>
                <select
                  value={settings.arabicFont}
                  onChange={(e) => updateSetting("arabicFont", e.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {arabicFonts.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </label>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Arabic Size</span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{settings.arabicSize}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="64"
                  value={settings.arabicSize}
                  onChange={(e) => updateSetting("arabicSize", Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Line Spacing</span>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{settings.lineHeight}x</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="3.0"
                  step="0.1"
                  value={settings.lineHeight}
                  onChange={(e) => updateSetting("lineHeight", Number(e.target.value))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {settings.showTranslation && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Translation Size</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{settings.translationSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="28"
                    value={settings.translationSize}
                    onChange={(e) => updateSetting("translationSize", Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Audio Section */}
          <section className="space-y-6 pt-2 border-t border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Audio & Playback</h3>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-300">Reciter</span>
                <select
                  value={reciterId}
                  onChange={(e) => setReciter(e.target.value)}
                  className="mt-2 h-11 w-full rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  {AUDIO_RECITERS.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:bg-slate-900">
                <span className="text-sm font-medium text-slate-200">Auto-play next ayah</span>
                <input
                  type="checkbox"
                  checked={autoPlayNext}
                  onChange={(e) => setAutoPlayNext(e.target.checked)}
                  className="h-5 w-5 accent-emerald-500"
                />
              </label>
            </div>
          </section>
        </div>

        <div className="flex gap-4 border-t border-slate-800 p-6 bg-slate-950">
          <button
            type="button"
            onClick={() => setSettings(DEFAULT_READING_SETTINGS)}
            className="h-12 flex-1 rounded-lg border border-slate-800 px-4 text-sm font-bold text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-lg bg-emerald-500 px-4 text-sm font-bold text-slate-950 transition-all hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            Save Changes
          </button>
        </div>
      </aside>
    </div>
  );
}
