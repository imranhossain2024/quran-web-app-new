// src/lib/audio.ts
/**
 * Helper to construct the audio URL for a given ayah number.
 * Uses the Alafasy recitation (128kbps) from cdn.islamic.network.
 */
export function getAyahAudioUrl(ayahNumber: number): string {
  // Ensure the ayahNumber is zero‑padded to 5 digits as required by the CDN.
  const padded = String(ayahNumber).padStart(5, '0');
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${padded}.mp3`;
}
