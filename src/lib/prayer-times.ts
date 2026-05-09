export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface PrayerTimeData {
  timings: PrayerTimings;
  date: {
    readable: string;
    timestamp: string;
    hijri: {
      date: string;
      day: string;
      month: {
        number: number;
        en: string;
        ar: string;
      };
      year: string;
      designation: {
        abbreviated: string;
        expanded: string;
      };
    };
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      id: number;
      name: string;
    };
  };
}

export async function getPrayerTimes(lat: number, lon: number): Promise<PrayerTimeData | null> {
  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`
    );
    const data = await response.json();
    if (data.code === 200) {
      return data.data;
    }
    return null;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return null;
  }
}

export function getNextPrayer(timings: PrayerTimings): { name: string; time: string } | null {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
  
  for (const name of prayerNames) {
    const [hours, minutes] = timings[name].split(":").map(Number);
    const prayerTimeInMinutes = hours * 60 + minutes;
    
    if (prayerTimeInMinutes > currentTimeInMinutes) {
      return { name, time: timings[name] };
    }
  }

  // If all prayers passed, next is Fajr tomorrow
  return { name: "Fajr", time: timings.Fajr };
}
