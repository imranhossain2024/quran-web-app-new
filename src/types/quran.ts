export type RevelationType = "Meccan" | "Medinan";
export type RawRevelationType = "meccan" | "medinan";

export interface RawVerse {
  id: number;
  text: string;
}

export interface RawSurah {
  id: number;
  name: string;
  transliteration: string;
  type: RawRevelationType;
  total_verses: number;
  verses: RawVerse[];
}

export type RawQuranData = RawSurah[];

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translation: string;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  revelation: RevelationType;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export type QuranData = Surah[];
