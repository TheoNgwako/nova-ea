'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWA(isStandalone);
  }, []);

  const getDownloadLink = () => {
    if (isPWA) {
      return '/student-entry';
    }
    return '/download';
  };

  const getDownloadText = () => {
    if (isPWA) {
      return 'Open App';
    }
    return 'Download App';
  };

  return (
    <footer className="py-16 px-4 bg-black border-t border-red-500/20">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <Link href={isPWA ? '/student-entry' : '/'}>
            <span className="text-3xl font-bold text-red-500 text-glow-red mb-4 inline-block cursor-pointer">
              NOVA EA
            </span>
          </Link>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Put your EAs on autopilot. Install the app, link your MT account and let your strategies trade around the clock.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link
            href={getDownloadLink()}
            className="px-8 py-3 bg-red-600 rounded-xl text-white font-bold hover:bg-red-700 glow-red transition"
          >
            {getDownloadText()}
          </Link>
          {!isPWA && (
            <Link
              href="/download"
              className="px-8 py-3 border border-red-500/50 rounded-xl text-red-400 font-bold hover:bg-red-500/10 glow-red transition"
            >
              Get iOS App
            </Link>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 mb-8">
          <a href="#" className="hover:text-red-400 transition">Terms & Conditions</a>
          <a href="#" className="hover:text-red-400 transition">Refund Policy</a>
          <a href="#" className="hover:text-red-400 transition">Legal</a>
        </div>

        <div className="flex justify-center gap-6 mb-8">
          <a href="#" className="text-gray-500 hover:text-red-400 transition text-2xl">💬</a>
          <a href="#" className="text-gray-500 hover:text-red-400 transition text-2xl">📸</a>
          <a href="#" className="text-gray-500 hover:text-red-400 transition text-2xl">▶️</a>
        </div>

        <div className="text-gray-600 text-xs">
          <p>© NOVA EA 2025. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}