import type { Surah } from "@/types/quran";
import FavoriteButton from "./FavoriteButton";

interface SurahHeaderProps {
  surah: Surah;
}

export default function SurahHeader({ surah }: SurahHeaderProps) {
  return (
    <header className="relative min-w-0 overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-xl backdrop-blur-md sm:p-12 mb-8"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="absolute right-6 top-6">
        <FavoriteButton surahNumber={surah.number} />
      </div>
      
      <div className="flex flex-col items-center">
        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 border border-emerald-500/20">
          Surah {surah.number}
        </span>
        
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
          {surah.englishName}
        </h1>
        
        <p className="mt-8 font-arabic text-5xl leading-loose text-[var(--foreground)] sm:text-6xl lg:text-7xl opacity-90" dir="rtl" lang="ar">
          {surah.name}
        </p>
        
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-6 py-3 transition-colors hover:bg-[var(--surface)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-left leading-none">Revelation</p>
              <p className="mt-1.5 text-sm font-bold text-[var(--foreground)]">{surah.revelation}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--background)] px-6 py-3 transition-colors hover:bg-[var(--surface)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-left leading-none">Verses</p>
              <p className="mt-1.5 text-sm font-bold text-[var(--foreground)]">{surah.numberOfAyahs} Ayahs</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
