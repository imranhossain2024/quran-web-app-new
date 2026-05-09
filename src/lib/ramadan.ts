export interface RamadanDay {
  date: {
    readable: string;
    timestamp: string;
    gregorian: {
      day: string;
      month: { en: string };
      year: string;
    };
    hijri: {
      day: string;
      month: { en: string; ar: string };
      year: string;
    };
  };
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
  };
}

export async function getRamadanCalendar(
  lat: number,
  lon: number,
  year: number = 2026
): Promise<RamadanDay[]> {
  try {
    // Ramadan 2026 is roughly in Feb/March. 
    // We'll fetch February and March to be sure.
    const months = [2, 3]; 
    const calendars = await Promise.all(
      months.map(async (month) => {
        const res = await fetch(
          `https://api.aladhan.com/v1/calendarByCity?city=Dhaka&country=Bangladesh&method=2&month=${month}&year=${year}`
        );
        const data = await res.json();
        return data.code === 200 ? data.data : [];
      })
    );

    const allDays = calendars.flat();
    // Filter days where hijri month is Ramadan
    // In 2026, Ramadan is month 9 in Hijri
    const ramadanDays = allDays.filter((day: any) => day.date.hijri.month.number === 9);
    
    return ramadanDays;
  } catch (error) {
    console.error("Error fetching Ramadan calendar:", error);
    return [];
  }
}
