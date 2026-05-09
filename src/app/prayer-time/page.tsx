"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  ClockIcon, 
  MapPinIcon, 
  ArrowPathIcon,
  SunIcon,
  MoonIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { getPrayerTimes, type PrayerTimeData, getNextPrayer } from "@/lib/prayer-times";

export default function PrayerTimePage() {
  const [data, setData] = useState<PrayerTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchTimes = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    const result = await getPrayerTimes(lat, lon);
    if (result) {
      setData(result);
      setError(null);
    } else {
      setError("Failed to fetch prayer times. Please try again.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation({ lat, lon });
          fetchTimes(lat, lon);
        },
        (err) => {
          console.error("Geolocation error:", err);
          // Fallback to Dhaka if denied
          const defaultLat = 23.8103;
          const defaultLon = 90.4125;
          setLocation({ lat: defaultLat, lon: defaultLon });
          fetchTimes(defaultLat, defaultLon);
          setError("Location access denied. Showing times for Dhaka.");
        }
      );
    } else {
      // Fallback to Dhaka
      fetchTimes(23.8103, 90.4125);
      setError("Geolocation not supported. Showing times for Dhaka.");
    }
  }, [fetchTimes]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <ArrowPathIcon className="h-12 w-12 animate-spin text-emerald-400" />
          <p className="text-slate-400 font-medium">Fetching prayer times...</p>
        </div>
      </div>
    );
  }

  const nextPrayer = data ? getNextPrayer(data.timings) : null;

  const prayerItems = data ? [
    { name: "Fajr", time: data.timings.Fajr, icon: <MoonIcon className="h-6 w-6" /> },
    { name: "Sunrise", time: data.timings.Sunrise, icon: <SunIcon className="h-6 w-6" /> },
    { name: "Dhuhr", time: data.timings.Dhuhr, icon: <SunIcon className="h-6 w-6" /> },
    { name: "Asr", time: data.timings.Asr, icon: <SunIcon className="h-6 w-6" /> },
    { name: "Maghrib", time: data.timings.Maghrib, icon: <SunIcon className="h-6 w-6" /> },
    { name: "Isha", time: data.timings.Isha, icon: <MoonIcon className="h-6 w-6" /> },
  ] : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Header Section */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Prayer Times
          </h1>
          <div className="mt-4 flex items-center gap-2 text-slate-400">
            <MapPinIcon className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-medium">
              {data?.meta.timezone || "Detecting location..."}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className="text-3xl font-mono font-bold text-emerald-400">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-sm text-slate-500 font-medium">
            {data?.date.readable} • {data?.date.hijri.day} {data?.date.hijri.month.en} {data?.date.hijri.year} AH
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-lg bg-amber-500/10 p-4 border border-amber-500/20 text-amber-400 text-sm flex items-center gap-3">
          <ClockIcon className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Main Highlights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-10">
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl"></div>
          
          <div className="relative z-10">
            <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-400/20">
              Next Prayer
            </span>
            <h2 className="mt-4 text-6xl font-black text-white">{nextPrayer?.name}</h2>
            <div className="mt-2 flex items-center gap-3 text-2xl font-semibold text-slate-400">
              <ClockIcon className="h-8 w-8 text-emerald-400/60" />
              {nextPrayer?.time}
            </div>
            
            <button 
              onClick={() => location && fetchTimes(location.lat, location.lon)}
              className="mt-8 flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Refresh Times
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-emerald-600 p-8 text-white shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold opacity-90">Hijri Date</h3>
            <p className="mt-2 text-3xl font-black">{data?.date.hijri.date}</p>
            <p className="mt-1 text-lg font-medium opacity-80">{data?.date.hijri.month.ar}</p>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <SunIcon className="h-6 w-6" />
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Method</p>
              <p className="text-sm font-bold">{data?.meta.method.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Prayer Schedule Grid */}
      <h3 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
        Daily Schedule
        <div className="h-px flex-1 bg-slate-800"></div>
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prayerItems.map((prayer) => {
          const isNext = nextPrayer?.name === prayer.name;
          return (
            <div 
              key={prayer.name}
              className={`group relative flex items-center justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                isNext 
                  ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                  isNext ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400 group-hover:bg-slate-700"
                }`}>
                  {prayer.icon}
                </div>
                <div>
                  <p className={`text-sm font-bold ${isNext ? "text-emerald-400" : "text-slate-500"}`}>
                    {prayer.name}
                  </p>
                  <p className="text-xl font-bold text-white">
                    {prayer.time}
                  </p>
                </div>
              </div>
              <ChevronRightIcon className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                isNext ? "text-emerald-400" : "text-slate-700"
              }`} />
              
              {isNext && (
                <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-950/50 p-6 text-center">
        <p className="text-sm text-slate-500">
          * Prayer times are calculated based on your current location and the Islamic Society of North America (ISNA) method.
        </p>
      </div>
    </div>
  );
}
