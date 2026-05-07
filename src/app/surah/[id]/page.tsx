import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import SurahHeader from "@/components/Quran/SurahHeader";
import AyahCard from "@/components/Quran/AyahCard";
import { getAdjacentSurahs, getSurah } from "@/lib/quran";
import type { Surah } from "@/types/quran";

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ id: String(i + 1) }));
}

interface SurahPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SurahPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1 || numericId > 114) {
    return { title: "Surah not found - Quran Reader" };
  }

  const surah: Surah = getSurah(numericId);

  return { title: `${surah.englishName} (${surah.name}) - Quran Reader` };
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1 || numericId > 114) {
    notFound();
  }

  const surah: Surah = getSurah(numericId);
  const adjacentSurahs = getAdjacentSurahs(surah.number);

  return (
    <section className="mx-auto w-full min-w-0 max-w-4xl">
      <SurahHeader surah={surah} />
      {surah.number !== 1 && surah.number !== 9 && (
        <div className="my-5 rounded-md border border-slate-800 bg-slate-900/50 px-5 py-6 text-center">
          <p className="font-arabic text-3xl leading-loose text-emerald-100 sm:text-4xl" dir="rtl" lang="ar">
            بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
          </p>
        </div>
      )}
      <div className="pb-12">
        {surah.ayahs.map((ayah) => (
          <AyahCard key={ayah.number} ayah={ayah} />
        ))}
      </div>
      <nav
        aria-label="Surah navigation"
        className="grid gap-3 border-t border-slate-800 pt-5 pb-12 sm:grid-cols-2"
      >
        {adjacentSurahs.previous ? (
          <Link
            href={`/surah/${adjacentSurahs.previous.number}`}
            className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900/70 p-4 text-slate-100 transition-colors hover:border-slate-700 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <ChevronLeftIcon className="h-5 w-5 text-emerald-400" aria-hidden />
            <span>
              <span className="block text-xs text-slate-400">Previous Surah</span>
              <span className="font-semibold">{adjacentSurahs.previous.englishName}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {adjacentSurahs.next ? (
          <Link
            href={`/surah/${adjacentSurahs.next.number}`}
            className="flex items-center justify-end gap-3 rounded-md border border-slate-800 bg-slate-900/70 p-4 text-right text-slate-100 transition-colors hover:border-slate-700 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <span>
              <span className="block text-xs text-slate-400">Next Surah</span>
              <span className="font-semibold">{adjacentSurahs.next.englishName}</span>
            </span>
            <ChevronRightIcon className="h-5 w-5 text-emerald-400" aria-hidden />
          </Link>
        ) : null}
      </nav>
    </section>
  );
}
