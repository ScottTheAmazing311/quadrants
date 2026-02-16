'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function HomeButton() {
  const pathname = usePathname();
  
  // Don't show on home page
  if (pathname === '/') return null;

  return (
    <Link
      href="/"
      className="fixed top-6 left-6 z-50 px-6 py-3 bg-[#1a1b2e] border-2 border-[#00f0ff] text-[#00f0ff] rounded-none font-bold uppercase text-sm tracking-wider hover:bg-[#00f0ff] hover:text-black transition-all neon-glow-cyan group"
    >
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Home</span>
      </div>
    </Link>
  );
}
