"use client";
// src/components/Sidebar/SurahList.tsx
import { useState } from 'react';
import SearchBox from '../Search/SearchBox';

// Simple placeholder: displays a static list of surah numbers (1‑114)
export default function SurahList() {
  const [search, setSearch] = useState('');

  const filtered = Array.from({ length: 114 }, (_, i) => i + 1).filter((num) =>
    num.toString().includes(search),
  );

  return (
    <aside className="hidden lg:block w-80 bg-slate-800 text-gray-100 p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Surah List</h2>
      <SearchBox value={search} onChange={setSearch} placeholder="Search Surah..." />
      <ul className="mt-2 space-y-1">
        {filtered.map((num) => (
          <li key={num} className="p-2 rounded hover:bg-slate-700 cursor-pointer">
            {num}. Surah {num}
          </li>
        ))}
      </ul>
    </aside>
  );
}
