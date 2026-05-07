// src/app/surah/[id]/page.tsx
import SurahHeader from '@/components/Quran/SurahHeader';
import AyahCard from '@/components/Quran/AyahCard';
import { getSurah } from '@/lib/quran';
import type { Surah } from '@/types/quran';

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
    <section className="max-w-4xl mx-auto p-4">
      <SurahHeader surah={surah} />
      {surah.number !== 1 && surah.number !== 9 && (
        <p className="text-center text-xl my-4">بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ</p>
      )}
      {surah.ayahs.map((ayah) => (
        <AyahCard key={ayah.number} ayah={ayah} />
      ))}
    </section>
  );
}
