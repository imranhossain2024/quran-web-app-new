"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bars3Icon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import IconSidebar from "@/components/Sidebar/IconSidebar";
import SurahList from "@/components/Sidebar/SurahList";
import FontSettings from "@/components/Settings/FontSettings";
import { AudioProvider } from "@/components/Audio/AudioProvider";
import AudioPlayer from "@/components/Audio/AudioPlayer";
import type { SurahSummary } from "@/types/quran";

interface AppShellProps {
  children: React.ReactNode;
  surahs: SurahSummary[];
}

export default function AppShell({ children, surahs }: AppShellProps) {
  const [isSurahMenuOpen, setIsSurahMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const shouldLock = isSurahMenuOpen || isSettingsOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSurahMenuOpen, isSettingsOpen]);

  return (
    <AudioProvider>
      <IconSidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      <SurahList
        surahs={surahs}
        mobileOpen={isSurahMenuOpen}
        onMobileClose={() => setIsSurahMenuOpen(false)}
      />

      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSurahMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-100 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Open surah menu"
          >
            <Bars3Icon className="h-5 w-5" aria-hidden />
          </button>

          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold text-white">
              Quran Reader
            </p>
            <p className="text-xs text-slate-400">Read, listen, reflect</p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Link
              href="/search"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-100 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Search surahs"
            >
              <MagnifyingGlassIcon className="h-5 w-5" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-100 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Open font settings"
            >
              <Cog6ToothIcon className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-screen max-w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:ml-96 lg:px-8">
        {children}
      </main>

      <FontSettings
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <AudioPlayer />
    </AudioProvider>
  );
}
