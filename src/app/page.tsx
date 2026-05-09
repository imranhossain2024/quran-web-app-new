import Link from "next/link";
import { getQuranStats } from "@/lib/quran";

export default function Home() {
  const stats = getQuranStats();

  return (
    <section className="relative flex min-h-screen flex-col justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="/digital-art-ramadan-celebration.jpg"
          alt=""
          className="h-full w-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-slate-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 py-16 sm:px-12 lg:px-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Quran Reader
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Read the Quran with a clean, focused interface.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
          Browse all {stats.surahCount} surahs and {stats.ayahCount} ayahs from local JSON data.
          Use the sidebar to jump directly into any surah.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/surah/1"
            className="rounded-md bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-400/30 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          >
            Start Reading
          </Link>
          <Link
            href="/surah/36"
            className="rounded-md border border-slate-600/60 bg-slate-900/50 px-6 py-3 text-sm font-semibold text-slate-100 backdrop-blur-sm transition-all hover:border-slate-400/60 hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            Open Yasin
          </Link>
        </div>
      </div>
    </section>
  );
}
