import Link from "next/link";
import { getQuranStats } from "@/lib/quran";

export default function Home() {
  const stats = getQuranStats();

  return (
    <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col justify-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
        Quran Reader
      </p>
      <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl">
        Read the Quran with a clean, focused interface.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
        Browse all {stats.surahCount} surahs and {stats.ayahCount} ayahs from local JSON data.
        Use the sidebar to jump directly into any surah.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/surah/1"
          className="rounded-md bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          Start Reading
        </Link>
        <Link
          href="/surah/36"
          className="rounded-md border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-500 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          Open Yasin
        </Link>
      </div>
    </section>
  );
}
