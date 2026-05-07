import SurahHeader from "@/components/Quran/SurahHeader";
import AyahCard from "@/components/Quran/AyahCard";
import { getSurah } from "@/lib/quran";
import type { Surah } from "@/types/quran";

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ id: String(i + 1) }));
}

interface SurahPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SurahPageProps) {
  const { id } = await params;
  const surah: Surah = getSurah(Number(id));

  return { title: `${surah.englishName} (${surah.name}) - Quran Reader` };
}

export default async function SurahPage({ params }: SurahPageProps) {
  const { id } = await params;
  const surah: Surah = getSurah(Number(id));

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
    </section>
  );
}
