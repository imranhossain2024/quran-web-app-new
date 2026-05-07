import quranJson from "../../public/quran.json";
import type { QuranData, RawQuranData, RawSurah, Surah } from "@/types/quran";

const rawQuran = quranJson as RawQuranData;

function normalizeSurah(rawSurah: RawSurah, startingAyahNumber: number): Surah {
  return {
    number: rawSurah.id,
    name: rawSurah.name,
    englishName: rawSurah.transliteration,
    revelation: rawSurah.type === "meccan" ? "Meccan" : "Medinan",
    numberOfAyahs: rawSurah.total_verses,
    ayahs: rawSurah.verses.map((verse, index) => ({
      number: startingAyahNumber + index,
      numberInSurah: verse.id,
      text: verse.text,
      translation: "",
    })),
  };
}

export function loadQuran(): QuranData {
  let ayahCursor = 1;

  return rawQuran.map((rawSurah) => {
    const surah = normalizeSurah(rawSurah, ayahCursor);
    ayahCursor += rawSurah.total_verses;
    return surah;
  });
}

export function getSurahs(): QuranData {
  return loadQuran();
}

export function getSurah(id: number): Surah {
  const surah = loadQuran().find((item) => item.number === id);

  if (!surah) {
    throw new Error(`Surah with id ${id} not found`);
  }

  return surah;
}

export function getQuranStats() {
  const surahs = loadQuran();
  const ayahCount = surahs.reduce((total, surah) => total + surah.numberOfAyahs, 0);

  return {
    surahCount: surahs.length,
    ayahCount,
  };
}
