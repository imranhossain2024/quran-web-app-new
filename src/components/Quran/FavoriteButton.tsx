"use client";

import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useLocalStorage } from "@/lib/useLocalStorage";

interface FavoriteButtonProps {
  surahNumber: number;
}

export default function FavoriteButton({ surahNumber }: FavoriteButtonProps) {
  const [favorites, setFavorites] = useLocalStorage<number[]>("favoriteSurahs", []);
  
  const isFavorite = favorites.includes(surahNumber);

  const toggleFavorite = () => {
    setFavorites((prev) =>
      isFavorite
        ? prev.filter((id) => id !== surahNumber)
        : [...prev, surahNumber]
    );
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
        isFavorite
          ? "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-rose-400"
      }`}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorite ? (
        <HeartSolid className="h-5 w-5" />
      ) : (
        <HeartOutline className="h-5 w-5" />
      )}
    </button>
  );
}
