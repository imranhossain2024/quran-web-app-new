export interface ReadingSettingsState {
  arabicFont: string;
  arabicSize: number;
  translationSize: number;
  showTranslation: boolean;
  showAyahNumbers: boolean;
  theme: "dark" | "light" | "system" | "sepia";
  lineHeight: number;
  readingMode: boolean;
  mushafStyle: "uthmani" | "indopak" | "tajweed";
  highlightCurrentAyah: boolean;
}

export const DEFAULT_READING_SETTINGS: ReadingSettingsState = {
  arabicFont: "KFGQ PC Sans Bold",
  arabicSize: 32,
  translationSize: 16,
  showTranslation: true,
  showAyahNumbers: true,
  theme: "system",
  lineHeight: 1.8,
  readingMode: false,
  mushafStyle: "uthmani",
  highlightCurrentAyah: true,
};
