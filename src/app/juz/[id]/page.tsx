import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import AyahCard from "@/components/Quran/AyahCard";
import { getAyahsByJuz } from "@/lib/quran";

interface JuzPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JuzPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId) || numericId < 1 || numericId > 30) {
    return { title: "Juz not found" };
  }

  return { title: `Juz ${numericId} - Quran Reader` };
}

export default async function JuzPage({ params }: JuzPageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId) || numericId < 1 || numericId > 30) {
    notFound();
  }

  const juzAyahs = getAyahsByJuz(numericId);

  if (!juzAyahs || juzAyahs.length === 0) {
    notFound();
  }

  // Group surahs to show in header
  const uniqueSurahs = Array.from(
    new Map(juzAyahs.map((a) => [a.surahNumber, { number: a.surahNumber, englishName: a.surahName }])).values()
  ) as any[];

  return (
    <section className="mx-auto w-full min-w-0 max-w-4xl px-4 py-6">
      <header className="mb-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-400">
          Reading Mode
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-5xl">
          Juz {numericId}
        </h1>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {uniqueSurahs.map((surah) => (
            <Link
              key={surah.number}
              href={`/surah/${surah.number}`}
              className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"
            >
              {surah.englishName}
            </Link>
          ))}
        </div>
      </header>

      <div className="pb-12">
        {juzAyahs.map((item: any) => (
          <AyahCard
            key={`juz-ayah-${item.ayah.number}`}
            ayah={item.ayah}
            surahNumber={item.surahNumber}
            surahName={item.surahName}
            surahAyahCount={item.surahAyahCount}
          />
        ))}
      </div>

      <nav
        aria-label="Juz navigation"
        className="grid gap-3 border-t border-slate-800 pt-8 pb-12 sm:grid-cols-2"
      >
        {numericId > 1 ? (
          <Link
            href={`/juz/${numericId - 1}`}
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-slate-100 transition-all hover:border-slate-700 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 group"
          >
            <ChevronLeftIcon className="h-5 w-5 text-emerald-400 transition-transform group-hover:-translate-x-1" aria-hidden />
            <span>
              <span className="block text-xs text-slate-400 uppercase tracking-wider font-semibold">Previous Juz</span>
              <span className="text-lg font-bold">Juz {numericId - 1}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {numericId < 30 ? (
          <Link
            href={`/juz/${numericId + 1}`}
            className="flex items-center justify-end gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-5 text-right text-slate-100 transition-all hover:border-slate-700 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 group"
          >
            <span>
              <span className="block text-xs text-slate-400 uppercase tracking-wider font-semibold">Next Juz</span>
              <span className="text-lg font-bold">Juz {numericId + 1}</span>
            </span>
            <ChevronRightIcon className="h-5 w-5 text-emerald-400 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        ) : null}
      </nav>
    </section>
  );
}
