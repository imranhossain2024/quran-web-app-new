"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function OthersDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Donate", href: "/donate" },
    { label: "Settings", href: "#settings" }, // Placeholder for triggering settings
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        Others
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-400" : "text-slate-500"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md border border-slate-800 bg-slate-900 py-1 shadow-lg shadow-black/50 ring-1 ring-black ring-opacity-5 focus:outline-none">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
