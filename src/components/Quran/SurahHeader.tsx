import type { Surah } from "@/types/quran";

interface SurahHeaderProps {
  surah: Surah;
}

export default function SurahHeader({ surah }: SurahHeaderProps) {
  return (
    <header className="rounded-md border border-slate-800 bg-slate-900/80 px-5 py-6 text-center shadow-lg shadow-slate-950/30 sm:px-8">
      <p className="text-sm font-medium text-emerald-400">Surah {surah.number}</p>
      <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
        {surah.englishName}
      </h1>
      <p className="mt-3 font-arabic text-4xl leading-relaxed text-slate-100" dir="rtl" lang="ar">
        {surah.name}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:mx-auto sm:max-w-md">
        <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Revelation</dt>
          <dd className="mt-1 font-semibold text-slate-100">{surah.revelation}</dd>
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950/60 p-3">
          <dt className="text-xs uppercase tracking-wide text-slate-500">Ayahs</dt>
          <dd className="mt-1 font-semibold text-slate-100">{surah.numberOfAyahs}</dd>
        </div>
      </dl>
    </header>
  );
}
