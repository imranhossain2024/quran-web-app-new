"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  HeartIcon,
  BookmarkIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

interface NavItem {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface IconSidebarProps {
  onOpenSettings: () => void;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/favorites", label: "Favorites", Icon: HeartIcon },
  { href: "/bookmarks", label: "Bookmarks", Icon: BookmarkIcon },
];

export default function IconSidebar({ onOpenSettings }: IconSidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-50 hidden w-16 flex-col items-center border-r border-slate-200 dark:border-slate-800 px-2 py-4 shadow-xl lg:flex"
      style={{ backgroundColor: "var(--sidebar-bg)", color: "var(--sidebar-text)" }}
    >
      {navItems.map(({ href, label, Icon }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          title={label}
          className={`mb-3 flex h-11 w-11 items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
            pathname === href
              ? "bg-emerald-500 text-white"
              : "text-inherit opacity-70 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
          }`}
        >
          <Icon className="h-6 w-6" aria-hidden />
          <span className="sr-only">{label}</span>
        </Link>
      ))}
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="Settings"
        title="Settings"
        className="mt-auto flex h-11 w-11 items-center justify-center rounded-md text-inherit opacity-70 transition-colors hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      >
        <Cog6ToothIcon className="h-6 w-6" aria-hidden />
      </button>
    </nav>
  );
}
