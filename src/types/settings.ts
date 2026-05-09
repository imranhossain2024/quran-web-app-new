export interface ReadingSettingsState {
  arabicFont: string;
  arabicSize: number;
  translationSize: number;
  showTranslation: boolean;
  theme: "dark" | "light" | "system" | "sepia";
  lineHeight: number;
  readingMode: boolean;
}

export const DEFAULT_READING_SETTINGS: ReadingSettingsState = {
  arabicFont: "KFGQ PC Sans Bold",
  arabicSize: 32,
  translationSize: 16,
  showTranslation: true,
  theme: "system",
  lineHeight: 1.8,
  readingMode: false,
};
