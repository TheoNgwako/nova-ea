'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Hero() {
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
    <section className="min-h-screen flex items-center justify-center text-center px-4 pt-24 bg-gradient-to-b from-black via-red-950/10 to-black">
      <div className="max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1 border border-red-500/30 rounded-full text-red-400 text-xs tracking-widest mb-6 glow-red">
          BUILD YOUR OWN EA
        </div>
        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
          <span className="text-white">Build Your Own</span>
          <br />
          <span className="text-red-500 text-glow-red">EA Easily</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl mt-6 max-w-2xl mx-auto">
          Create, customize and control your own Expert Advisors straight from your phone — no coding, no desktop, no downtime.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link
            href={getDownloadLink()}
            className="px-8 py-4 bg-red-600 rounded-xl text-white font-bold text-lg hover:bg-red-700 glow-red transition"
          >
            {getDownloadText()}
          </Link>
          {!isPWA && (
            <Link
              href="/download"
              className="px-8 py-4 border border-red-500/50 rounded-xl text-red-400 font-bold text-lg hover:bg-red-500/10 glow-red transition"
            >
              Get iOS App
            </Link>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full glow-red"></span> 99% Uptime
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full glow-red"></span> 24/7 Always Live
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full glow-red"></span> MT4 / MT5 Supported
          </span>
        </div>
      </div>
    </section>
  );
}