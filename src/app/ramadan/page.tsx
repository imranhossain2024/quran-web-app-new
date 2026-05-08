import { MoonIcon } from "@heroicons/react/24/outline";

export default function RamadanPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-900/80 shadow-inner">
        <MoonIcon className="h-12 w-12 text-emerald-400" />
      </div>
      <h1 className="text-3xl font-bold text-white sm:text-5xl">Ramadan 2026</h1>
      <p className="mt-4 max-w-lg text-base text-slate-400 sm:text-lg">
        This page is under construction. We are preparing special features for Ramadan 2026, including a Quran reading planner and fasting schedules.
      </p>
      <div className="mt-8">
        <span className="inline-flex items-center rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-400/20">
          Coming Soon
        </span>
      </div>
    </div>
  );
}
