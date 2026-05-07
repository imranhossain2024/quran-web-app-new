"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { AUDIO_RECITERS } from "@/lib/audio";
import { useAudio } from "@/components/Audio/AudioProvider";

interface FontSettingsProps {
  open: boolean;
  onClose: () => void;
}

interface FontSettingsState {
  arabicFont: string;
  arabicSize: number;
  translationSize: number;
}

const defaultSettings: FontSettingsState = {
  arabicFont: "KFGQ PC Sans Bold",
  arabicSize: 32,
  translationSize: 16,
};

const arabicFonts = [
  "KFGQ PC Sans Bold",
  "Amiri",
  "Scheherazade",
] as const;

export default function FontSettings({ open, onClose }: FontSettingsProps) {
  const { reciterId, autoPlayNext, setReciter, setAutoPlayNext } = useAudio();
  const [settings, setSettings] = useLocalStorage<FontSettingsState>(
    "fontSettings",
    defaultSettings,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--font-arabic",
      `'${settings.arabicFont}', 'Amiri', 'Scheherazade', serif`,
    );
    root.style.setProperty("--size-arabic", `${settings.arabicSize}px`);
    root.style.setProperty("--size-translation", `${settings.translationSize}px`);
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

  const updateSetting = <Key extends keyof FontSettingsState>(
    key: Key,
    value: FontSettingsState[Key],
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
        aria-label="Font settings"
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Settings
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">Reading style</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Close font settings"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto p-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-200">Arabic font</span>
            <select
              value={settings.arabicFont}
              onChange={(event) => updateSetting("arabicFont", event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
            >
              {arabicFonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="flex items-center justify-between text-sm font-medium text-slate-200">
              Arabic size
              <span className="text-slate-400">{settings.arabicSize}px</span>
            </span>
            <input
              type="range"
              min="24"
              max="48"
              value={settings.arabicSize}
              onChange={(event) => updateSetting("arabicSize", Number(event.target.value))}
              className="mt-3 w-full accent-emerald-500"
            />
          </label>

          <label className="block">
            <span className="flex items-center justify-between text-sm font-medium text-slate-200">
              Translation size
              <span className="text-slate-400">{settings.translationSize}px</span>
            </span>
            <input
              type="range"
              min="12"
              max="24"
              value={settings.translationSize}
              onChange={(event) =>
                updateSetting("translationSize", Number(event.target.value))
              }
              className="mt-3 w-full accent-emerald-500"
            />
          </label>

          <div className="rounded-md border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Preview
            </p>
            <p className="arabic-text mt-4 leading-loose text-white" dir="rtl" lang="ar">
              بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
            </p>
            <p className="translation-text mt-3 leading-7 text-slate-300">
              In the name of Allah, the Entirely Merciful, the Especially Merciful.
            </p>
          </div>

          <div className="space-y-4 border-t border-slate-800 pt-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Audio
              </p>
              <h3 className="mt-1 text-lg font-semibold text-white">Recitation</h3>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-slate-200">Preferred reciter</span>
              <select
                value={reciterId}
                onChange={(event) => setReciter(event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition-colors focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              >
                {AUDIO_RECITERS.map((reciter) => (
                  <option key={reciter.id} value={reciter.id}>
                    {reciter.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                Mishary Rashid Alafasy is the default because his clear, melodic
                recitation is familiar to many listeners.
              </p>
            </label>

            <label className="flex items-center justify-between gap-4 rounded-md border border-slate-800 bg-slate-900/70 p-4">
              <span>
                <span className="block text-sm font-medium text-slate-200">
                  Auto-play next ayah
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  Continue within the current Surah.
                </span>
              </span>
              <input
                type="checkbox"
                checked={autoPlayNext}
                onChange={(event) => setAutoPlayNext(event.target.checked)}
                className="h-5 w-5 accent-emerald-500"
              />
            </label>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-800 p-5">
          <button
            type="button"
            onClick={() => setSettings(defaultSettings)}
            className="h-11 flex-1 rounded-md border border-slate-700 px-4 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-md bg-emerald-500 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Done
          </button>
        </div>
      </aside>
    </div>
  );
}
