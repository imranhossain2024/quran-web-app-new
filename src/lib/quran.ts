import quranJson from "../../public/quran.json";
import translationJson from "../../public/translations/en-sahih.json";
import quranMetadata from "./quran-metadata.json";
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
export function getAyahWithMetadata(globalNumber: number) {
  const surahs = loadQuran();
  for (const surah of surahs) {
    const ayah = surah.ayahs.find((a) => a.number === globalNumber);
    if (ayah) {
      return {
        ayah,
        surahNumber: surah.number,
        surahName: surah.englishName,
        surahAyahCount: surah.numberOfAyahs,
      };
    }
  }
  return null;
}

export function getGlobalAyahNumber(surahNumber: number, numberInSurah: number): number {
  const surahs = loadQuran();
  let global = 0;
  for (let i = 0; i < surahNumber - 1; i++) {
    global += surahs[i].numberOfAyahs;
  }
  return global + numberInSurah;
}

export function getAyahsByPage(pageNumber: number) {
  if (pageNumber < 1 || pageNumber > 604) return [];
  const startRef = quranMetadata.pages[pageNumber - 1];
  const endRef = pageNumber < 604 ? quranMetadata.pages[pageNumber] : null;

  const startGlobal = getGlobalAyahNumber(startRef.surah, startRef.ayah);
  const endGlobal = endRef ? getGlobalAyahNumber(endRef.surah, endRef.ayah) : 6236 + 1;

  const surahs = loadQuran();
  const ayahs = [];
  for (const surah of surahs) {
    for (const ayah of surah.ayahs) {
      if (ayah.number >= startGlobal && ayah.number < endGlobal) {
        ayahs.push({
          ayah,
          surahNumber: surah.number,
          surahName: surah.englishName,
          surahAyahCount: surah.numberOfAyahs,
        });
      }
    }
  }
  return ayahs;
}

export function getAyahsByJuz(juzNumber: number) {
  if (juzNumber < 1 || juzNumber > 30) return [];
  const startRef = quranMetadata.juzs[juzNumber - 1];
  const endRef = juzNumber < 30 ? quranMetadata.juzs[juzNumber] : null;

  const startGlobal = getGlobalAyahNumber(startRef.surah, startRef.ayah);
  const endGlobal = endRef ? getGlobalAyahNumber(endRef.surah, endRef.ayah) : 6236 + 1;

  const surahs = loadQuran();
  const ayahs = [];
  for (const surah of surahs) {
    for (const ayah of surah.ayahs) {
      if (ayah.number >= startGlobal && ayah.number < endGlobal) {
        ayahs.push({
          ayah,
          surahNumber: surah.number,
          surahName: surah.englishName,
          surahAyahCount: surah.numberOfAyahs,
        });
      }
    }
  }
  return ayahs;
}
