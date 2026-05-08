"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bars3Icon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import IconSidebar from "@/components/Sidebar/IconSidebar";
import SurahList from "@/components/Sidebar/SurahList";
import OthersDropdown from "@/components/Layout/OthersDropdown";
import QuranLogo from "@/components/Layout/QuranLogo";
import ReadingSettings from "@/components/Settings/ReadingSettings";
import ThemeToggle from "@/components/ThemeToggle";
import { AudioProvider } from "@/components/Audio/AudioProvider";
import AudioPlayer from "@/components/Audio/AudioPlayer";
import { useLocalStorage } from "@/lib/useLocalStorage";
import type { SurahSummary } from "@/types/quran";

interface AppShellProps {
  children: React.ReactNode;
  surahs: SurahSummary[];
}

export default function AppShell({ children, surahs }: AppShellProps) {
  const router = useRouter();
  const [isSurahMenuOpen, setIsSurahMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage("sidebarCollapsed", false);
  const [isMounted, setIsMounted] = useState(false);

  const handleReadQuranClick = () => {
    // Expand the left sidebar on desktop
    setIsSidebarCollapsed(false);
    // Open the mobile sidebar menu on small screens
    setIsSurahMenuOpen(true);
    // Navigate to first surah
    router.push("/surah/1");
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const shouldLock = isSurahMenuOpen || isSettingsOpen;
    document.body.style.overflow = shouldLock ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isSurahMenuOpen, isSettingsOpen, isMounted]);

  return (
    <AudioProvider>
      <IconSidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      <SurahList
        surahs={surahs}
        mobileOpen={isSurahMenuOpen}
        onMobileClose={() => setIsSurahMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <header className={`sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur transition-all duration-300 ${
        isSidebarCollapsed ? "lg:pl-16" : "lg:pl-96"
      }`}>
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsSurahMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-100 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 lg:hidden"
            aria-label="Open surah menu"
          >
            <Bars3Icon className="h-5 w-5" aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex h-10 w-10 items-center justify-center rounded-md border border-slate-800 bg-slate-900 text-slate-100 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRightIcon className="h-5 w-5" aria-hidden />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" aria-hidden />
            )}
          </button>

          <Link href="/" className="flex items-center gap-3 mr-auto lg:mr-0 lg:w-48 xl:w-64 transition-opacity hover:opacity-80">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
              <QuranLogo className="h-6 w-6" />
            </div>
            <div className="hidden sm:block min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white tracking-wide">
                Quran Reader
              </p>
              <p className="text-[10px] uppercase tracking-wider text-emerald-400/80 truncate">
                Read, listen, reflect
              </p>
            </div>
          </Link>

          <nav className="hidden flex-1 lg:flex items-center justify-center gap-2 xl:gap-6">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={handleReadQuranClick}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Read Quran
            </button>
            <Link
              href="/prayer-time"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              Prayer Time
            </Link>
            <Link
              href="/ramadan"
              className="rounded-md px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              Ramadan 2026
            </Link>
            <OthersDropdown />
          </nav>

          <div className="ml-auto flex shrink-0 gap-2">
            <ThemeToggle />
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

      <main className={`min-h-screen max-w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 transition-all duration-300 ${
        isSidebarCollapsed ? "lg:ml-16" : "lg:ml-96"
      }`}>
        {children}
      </main>

      <ReadingSettings
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <AudioPlayer />
    </AudioProvider>
  );
}
