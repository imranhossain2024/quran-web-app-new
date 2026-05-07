export type AudioStatus = "idle" | "loading" | "playing" | "paused" | "error";

export interface AudioReciter {
  id: string;
  name: string;
  description: string;
  bitrate: 128 | 64;
}

export const AUDIO_RECITERS: AudioReciter[] = [
  {
    id: "ar.alafasy",
    name: "Mishary Rashid Alafasy",
    description: "Clear, melodic, and widely loved",
    bitrate: 128,
  },
  {
    id: "ar.abdurrahmaansudais",
    name: "Abdurrahman As-Sudais",
    description: "Haram recitation style, powerful and familiar",
    bitrate: 128,
  },
  {
    id: "ar.husary",
    name: "Mahmoud Khalil Al-Husary",
    description: "Precise tajweed, excellent for learning",
    bitrate: 128,
  },
  {
    id: "ar.ahmedajamy",
    name: "Ahmed Al-Ajamy",
    description: "Warm tone with steady pacing",
    bitrate: 128,
  },
];

export const DEFAULT_RECITER_ID = "ar.alafasy";

export function getReciterById(id: string): AudioReciter {
  return AUDIO_RECITERS.find((reciter) => reciter.id === id) ?? AUDIO_RECITERS[0];
}

export function getAyahAudioUrl(
  ayahNumber: number,
  reciterId = DEFAULT_RECITER_ID,
): string {
  const reciter = getReciterById(reciterId);

  return `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/${reciter.id}/${ayahNumber}.mp3`;
}
