// src/components/Sidebar/IconSidebar.tsx
import Link from 'next/link';
import {
  HomeIcon,
  HeartIcon,
  BookmarkIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

interface NavItem {
  href: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/favorites', label: 'Favorites', Icon: HeartIcon },
  { href: '/bookmarks', label: 'Bookmarks', Icon: BookmarkIcon },
  { href: '/settings', label: 'Settings', Icon: CogIcon },
];

export default function IconSidebar() {
  return (
    <nav className="fixed inset-y-0 left-0 flex flex-col items-center w-16 bg-slate-900 text-gray-200 hover:text-white transition-colors">
      {navItems.map(({ href, label, Icon }) => (
        <Link key={href} href={href} className="my-4 p-2 rounded hover:bg-slate-800">
          <Icon className="h-6 w-6" aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
