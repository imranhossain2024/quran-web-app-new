// src/components/Quran/SurahHeader.tsx
import { Surah } from '@/types/quran';

interface SurahHeaderProps {
  surah: Surah;
}

export default function SurahHeader({ surah }: SurahHeaderProps) {
  return (
    <header className="bg-slate-800/30 backdrop-blur-sm border-b border-gray-700 p-4 rounded-t-lg text-center">
      <h1 className="text-2xl font-bold text-primary-500 mb-1">
        {surah.englishName} ({surah.name})
      </h1>
      <p className="text-sm text-gray-300">
        Surah {surah.number} • {surah.revelation} • {surah.numberOfAyahs} Ayahs
      </p>
    </header>
  );
}
