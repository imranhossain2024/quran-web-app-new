"use client";

import AudioPlayerCard, {
  type AudioPlayerCardProps,
} from "@/components/Audio/AudioPlayerCard";
import { getAyahAudioUrl, AUDIO_RECITERS } from "@/lib/audio";

/**
 * Demo Audio Player Page
 * 
 * এই পেজটি AudioPlayerCard কম্পোনেন্টের একটি ডেমো/উদাহরণ দেখায়।
 * এখানে Surah Al-Fatihah এর কয়েকটি আয়াতের জন্য অডিও প্লেয়ার দেখানো হয়েছে।
 * 
 * বাংলায় ব্যাখ্যা:
 * এই ডেমো পেজটিতে আমরা Surah Al-Fatihah (সূরাহ আল-ফাতিহাহ) এর 
 * প্রথম কয়েকটি আয়াতের জন্য অডিও প্লেয়ার কার্ড দেখাচ্ছি।
 * প্রতিটি কার্ড স্বাধীনভাবে কাজ করে এবং নিজস্ব অডিও প্লে করে。
 */

// Surah Al-Fatihah data with Arabic text and translations
const surahAlFatihah = {
  number: 1,
  name: "Al-Fatihah",
  arabicName: "الفاتحة",
  englishName: "The Opening",
  totalAyahs: 7,
  ayahs: [
    {
      numberInSurah: 1,
      arabicText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    },
    {
      numberInSurah: 2,
      arabicText: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
      translation: "[All] praise is [due] to Allah, Lord of the worlds -",
    },
    {
      numberInSurah: 3,
      arabicText: "الرَّحْمَٰنِ الرَّحِيمِ",
      translation: "The Entirely Merciful, the Especially Merciful,",
    },
    {
      numberInSurah: 4,
      arabicText: "مَالِكِ يَوْمِ الدِّينِ",
      translation: "Sovereign of the Day of Recompense.",
    },
    {
      numberInSurah: 5,
      arabicText: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      translation: "It is You we worship and You we ask for help.",
    },
    {
      numberInSurah: 6,
      arabicText: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
      translation: "Guide us to the straight path -",
    },
    {
      numberInSurah: 7,
      arabicText: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
      translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
    },
  ],
};

// Generate global ayah numbers (Al-Fatihah starts at ayah 1)
const getGlobalAyahNumber = (numberInSurah: number) => numberInSurah;

export default function DemoAudioPlayerPage() {
  // Calculate current ayah index for navigation
  const handleNextAyah = (index: number) => {
    console.log(`Navigate to next ayah: ${index + 2}`);
    // In a real app, this would scroll to or highlight the next ayah
  };

  const handlePreviousAyah = (index: number) => {
    console.log(`Navigate to previous ayah: ${index}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Audio Player Card Demo
          </h1>
          <p className="text-slate-400 mb-4">
            Professional, compact audio player for Quranic recitation
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 bg-slate-900 rounded">
              ✅ Play/Pause
            </span>
            <span className="px-2 py-1 bg-slate-900 rounded">
              ✅ Progress Bar
            </span>
            <span className="px-2 py-1 bg-slate-900 rounded">
              ✅ Volume Control
            </span>
            <span className="px-2 py-1 bg-slate-900 rounded">
              ✅ Speed Control
            </span>
            <span className="px-2 py-1 bg-slate-900 rounded">
              ✅ Repeat Mode
            </span>
            <span className="px-2 py-1 bg-slate-900 rounded">
              ✅ Keyboard Shortcuts
            </span>
          </div>
        </header>

        {/* Audio Player Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
          {surahAlFatihah.ayahs.map((ayah, index) => {
            const ayahNumber = getGlobalAyahNumber(ayah.numberInSurah);
            const isFirst = index === 0;
            const isLast = index === surahAlFatihah.ayahs.length - 1;

            return (
              <AudioPlayerCard
                key={ayahNumber}
                ayahNumber={ayahNumber}
                surahName={surahAlFatihah.name}
                arabicSurahName={surahAlFatihah.arabicName}
                arabicText={ayah.arabicText}
                translation={ayah.translation}
                reciterName={AUDIO_RECITERS[0].name}
                audioUrl={getAyahAudioUrl(ayahNumber)}
                numberInSurah={ayah.numberInSurah}
                surahNumber={surahAlFatihah.number}
                surahAyahCount={surahAlFatihah.totalAyahs}
                isFirstAyah={isFirst}
                isLastAyah={isLast}
                onNextAyah={() => !isLast && handleNextAyah(index)}
                onPreviousAyah={() => !isFirst && handlePreviousAyah(index)}
                onPlay={() => console.log(`Playing Ayah ${ayahNumber}`)}
                onPause={() => console.log(`Paused Ayah ${ayahNumber}`)}
                onComplete={() => console.log(`Completed Ayah ${ayahNumber}`)}
              />
            );
          })}
        </div>

        {/* Features Section */}
        <section className="mt-16 p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-semibold text-white mb-4">
            Features (বাংলায় বৈশিষ্ট্য)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">▸</span>
              <div>
                <strong className="text-white">Play/Pause Control:</strong>
                <p className="text-slate-400 mt-1">
                  বড় প্লে বাটনে ক্লিক করে অডিও চালু বা বিরতি দিন।
                  স্পেস বার শর্টকাটও ব্যবহার করতে পারেন。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">▸</span>
              <div>
                <strong className="text-white">Progress Bar:</strong>
                <p className="text-slate-400 mt-1">
                  প্রগ্রেস বারে ক্লিক করে যেকোনো স্থানে সিক করুন।
                  বর্তমান এবং মোট সময় দেখুন。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">▸</span>
              <div>
                <strong className="text-white">Volume Control:</strong>
                <p className="text-slate-400 mt-1">
                  ভলিউম বাটনে ক্লিক করে স্লাইডার খুলুন এবং সাউন্ড লেভেল
                  সামঞ্জস্য করুন。মিউট/আনমিউট টগল করুন。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">▸</span>
              <div>
                <strong className="text-white">Speed Control:</strong>
                <p className="text-slate-400 mt-1">
                  0.75x, 1x, 1.25x, 1.5x - চারটি ভিন্ন স্পিডে তিলাওয়াত শুনুন。
                  দ্রুত বা ধীরে শোনার জন্য উপযুক্ত。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">▸</span>
              <div>
                <strong className="text-white">Repeat Mode:</strong>
                <p className="text-slate-400 mt-1">
                  off → single → all - তিনটি মোডের মধ্যে টগল করুন。
                  Single মোডে একটি আয়াত বারবার শুনুন。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">▸</span>
              <div>
                <strong className="text-white">Keyboard Shortcuts:</strong>
                <p className="text-slate-400 mt-1">
                  Space = Play/Pause, ← = Previous Ayah, → = Next Ayah。
                  কীবোর্ড ব্যবহার করে সহজে নিয়ন্ত্রণ করুন。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">▸</span>
              <div>
                <strong className="text-white">Favorite/Bookmark:</strong>
                <p className="text-slate-400 mt-1">
                  হার্ট আইকনে ক্লিক করে প্রিয় আয়াত সংরক্ষণ করুন।
                  পরে সহজে খুঁজে পেতে বুকমার্ক করুন。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400">▸</span>
              <div>
                <strong className="text-white">Download & Share:</strong>
                <p className="text-slate-400 mt-1">
                  অডিও ডাউনলোড করুন বা লিঙ্ক শেয়ার করুন।
                  অফলাইনে শোনার জন্য ডাউনলোড করুন。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Usage Example */}
        <section className="mt-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
          <h2 className="text-xl font-semibold text-white mb-4">
            Usage Example (ব্যবহারের উদাহরণ)
          </h2>
          <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm text-slate-300 border border-slate-800">
{`import AudioPlayerCard from "@/components/Audio/AudioPlayerCard";

export default function MyComponent() {
  return (
    <AudioPlayerCard
      ayahNumber={1}
      surahName="Al-Fatihah"
      arabicText="بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
      translation="In the name of Allah, the Entirely Merciful, the Especially Merciful."
      reciterName="Mishary Rashid Alafasy"
      audioUrl="https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3"
      numberInSurah={1}
      surahNumber={1}
      surahAyahCount={7}
      isFirstAyah={true}
      isLastAyah={false}
      onNextAyah={() => console.log("Next")}
      onPreviousAyah={() => console.log("Previous")}
    />
  );
}`}
          </pre>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 text-sm">
          <p>Built with React, TypeScript & Tailwind CSS</p>
          <p className="mt-1">AudioPlayerCard Component v1.0</p>
        </footer>
      </div>
    </div>
  );
}