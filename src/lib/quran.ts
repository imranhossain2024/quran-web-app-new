import quranJson from "../../public/quran.json";
import translationJson from "../../public/translations/en-sahih.json";
import type {
  QuranData,
  RawQuranData,
  RawSurah,
  Surah,
  SurahSummary,
  TranslationData,
} from "@/types/quran";

const rawQuran = quranJson as RawQuranData;
const translationData = translationJson as TranslationData;
const translationsByNumber = new Map(
  translationData.ayahs.map((ayah) => [ayah.number, ayah.text]),
);

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
      translation: translationsByNumber.get(startingAyahNumber + index) ?? "",
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

export function getSurahSummaries(): SurahSummary[] {
  return loadQuran().map((surah) => ({
    number: surah.number,
    name: surah.name,
    englishName: surah.englishName,
    revelation: surah.revelation,
    numberOfAyahs: surah.numberOfAyahs,
  }));
}

export function getSurah(id: number): Surah {
  const surah = loadQuran().find((item) => item.number === id);

  if (!surah) {
    throw new Error(`Surah with id ${id} not found`);
  }

  return surah;
}

export function getAdjacentSurahs(id: number) {
  return {
    previous: id > 1 ? getSurahSummaries().find((surah) => surah.number === id - 1) : null,
    next: id < 114 ? getSurahSummaries().find((surah) => surah.number === id + 1) : null,
  };
}

export function getTranslationEdition() {
  return translationData.edition;
}

export function getQuranStats() {
  const surahs = loadQuran();
  const ayahCount = surahs.reduce((total, surah) => total + surah.numberOfAyahs, 0);

  return {
    surahCount: surahs.length,
    ayahCount,
  };
}
