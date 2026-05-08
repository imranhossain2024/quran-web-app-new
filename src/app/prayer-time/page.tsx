import { ClockIcon } from "@heroicons/react/24/outline";

export default function PrayerTimePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900/80 shadow-inner">
        <ClockIcon className="h-12 w-12 text-emerald-400" />
      </div>
      <h1 className="text-3xl font-bold text-white sm:text-5xl">Prayer Time</h1>
      <p className="mt-4 max-w-lg text-base text-slate-400 sm:text-lg">
        This page is under construction. Soon you will be able to see accurate prayer times based on your location.
      </p>
      <div className="mt-8">
        <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-400/20">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
