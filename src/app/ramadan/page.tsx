"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  MoonIcon, 
  SunIcon, 
  ClockIcon, 
  MapPinIcon,
  ArrowPathIcon,
  BookmarkIcon,
  BookOpenIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { getRamadanCalendar, type RamadanDay } from "@/lib/ramadan";

const SahriDua = {
  arabic: "وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ",
  transliteration: "Wa bi-sawmi ghadin nawaytu min shahri ramadan",
  translation: "I intend to keep the fast for tomorrow in the month of Ramadan."
};

const IftarDua = {
  arabic: "اللَّهُمَّ اِنِّى لَكَ صُمْتُ وَبِكَ اَمَنْتُ وَعَلَيْكَ تَوَكَّلْتُ وَعَلَى رِزْقِكَ اَفْطَرْتُ",
  transliteration: "Allahumma inni laka sumtu, wa bika aamantu, wa 'alayka tawakkaltu, wa 'ala rizqika aftartu",
  translation: "O Allah! I fasted for You and I believe in You and I put my trust in You and I break my fast with Your sustenance."
};

export default function RamadanPage() {
  const [calendar, setCalendar] = useState<RamadanDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  const fetchCalendar = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    const data = await getRamadanCalendar(lat, lon);
    if (data && data.length > 0) {
      setCalendar(data);
      setError(null);
    } else {
      setError("Failed to load Ramadan calendar. Please try again.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ lat: latitude, lon: longitude });
          fetchCalendar(latitude, longitude);
        },
        () => {
          // Fallback to Dhaka
          const lat = 23.8103, lon = 90.4125;
          setLocation({ lat, lon });
          fetchCalendar(lat, lon);
          setError("Showing timings for Dhaka (Default).");
        }
      );
    } else {
      fetchCalendar(23.8103, 90.4125);
    }
  }, [fetchCalendar]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <ArrowPathIcon className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Hero Section */}
      <header className="relative mb-16 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 text-center border border-emerald-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div className="relative z-10">
          <MoonIcon className="mx-auto h-16 w-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
          <h1 className="mt-6 text-4xl font-black text-white sm:text-6xl">Ramadan 2026</h1>
          <p className="mt-4 text-emerald-200/70 font-medium">Spiritual Journey, Fasting & Reflection</p>
          
          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-emerald-400/80">
            <MapPinIcon className="h-4 w-4" />
            <span>Detected Location: {location ? `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}` : "Dhaka"}</span>
          </div>
        </div>
      </header>

      {/* Daily Highlights & Duas */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-16">
        {/* Sahri & Iftar Card */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ClockIcon className="h-6 w-6 text-emerald-400" />
            Today's Timings
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-6 text-center transition-transform hover:scale-[1.02]">
              <SunIcon className="mx-auto h-8 w-8 text-amber-400 mb-3" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Sahri Ends</p>
              <p className="text-3xl font-black text-white mt-1">{calendar[0]?.timings.Fajr || "--:--"}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-6 text-center transition-transform hover:scale-[1.02]">
              <MoonIcon className="mx-auto h-8 w-8 text-emerald-400 mb-3" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Iftar Starts</p>
              <p className="text-3xl font-black text-white mt-1">{calendar[0]?.timings.Maghrib || "--:--"}</p>
            </div>
          </div>
          
          {/* Quick Info */}
          <div className="rounded-3xl bg-emerald-600 p-6 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-20">
               <BookOpenIcon className="h-20 w-20" />
             </div>
             <h3 className="text-lg font-bold opacity-90">Ramadan Reminder</h3>
             <p className="mt-2 text-xl font-medium leading-relaxed italic">
               "Fasting is a shield with which a servant protects himself from the Fire."
             </p>
             <p className="mt-4 text-sm font-bold opacity-70">— Prophet Muhammad (PBUH)</p>
          </div>
        </div>

        {/* Duas Section */}
        <div className="flex flex-col gap-6">
           <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <BookmarkIcon className="h-6 w-6 text-emerald-400" />
            Essential Duas
          </h2>
          
          <div className="space-y-4">
            {/* Sahri Dua */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Dua for Sahri</span>
              <p className="mt-4 text-right text-2xl font-arabic text-white leading-loose" dir="rtl">{SahriDua.arabic}</p>
              <p className="mt-4 text-sm text-slate-400 italic">{SahriDua.transliteration}</p>
              <p className="mt-2 text-sm text-slate-300 font-medium">{SahriDua.translation}</p>
            </div>

            {/* Iftar Dua */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-lg">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Dua for Iftar</span>
              <p className="mt-4 text-right text-2xl font-arabic text-white leading-loose" dir="rtl">{IftarDua.arabic}</p>
              <p className="mt-4 text-sm text-slate-400 italic">{IftarDua.transliteration}</p>
              <p className="mt-2 text-sm text-slate-300 font-medium">{IftarDua.translation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Section */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Ramadan Calendar</h2>
          <div className="h-px flex-1 mx-6 bg-slate-800"></div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/30 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800">
                  <th className="px-6 py-5">Ramadan</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Day</th>
                  <th className="px-6 py-5">Sahri Ends</th>
                  <th className="px-6 py-5">Iftar Starts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {calendar.map((day, idx) => (
                  <tr key={idx} className="group hover:bg-emerald-500/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold">
                        {day.date.hijri.day}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{day.date.readable}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{day.date.gregorian.day}</td>
                    <td className="px-6 py-4 text-white font-mono font-bold text-lg">{day.timings.Fajr}</td>
                    <td className="px-6 py-4 text-emerald-400 font-mono font-bold text-lg">{day.timings.Maghrib}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <footer className="mt-12 text-center text-slate-500 text-sm">
        <p>* Timings are based on the ISNA method and your detected location. Please allow ±1-2 minutes for safety.</p>
      </footer>
    </div>
  );
}
