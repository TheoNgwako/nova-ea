'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsPWA(isStandalone);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

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
    <>
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href={isPWA ? '/student-entry' : '/'}
            className="text-2xl font-bold text-red-500 tracking-wider text-glow-red"
          >
            NOVA EA
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-8 text-sm text-gray-300">
            {!isPWA && (
              <>
                <a href="#features" className="hover:text-red-400 transition">Features</a>
                <a href="#how-it-works" className="hover:text-red-400 transition">How it works</a>
                <a href="#faq" className="hover:text-red-400 transition">FAQ</a>
                <Link href="/login" className="text-red-400 hover:text-red-300 transition">Mentor Sign In</Link>
              </>
            )}
          </nav>

          <div className="hidden md:flex gap-3">
            {!isPWA && (
              <Link
                href="/signup"
                className="px-4 py-2 border border-red-500/50 rounded-lg text-red-400 text-sm hover:bg-red-500/10 glow-red transition"
              >
                Sign Up
              </Link>
            )}
            <Link
              href={getDownloadLink()}
              className="px-4 py-2 bg-red-600 rounded-lg text-white text-sm font-semibold hover:bg-red-700 glow-red transition"
            >
              {getDownloadText()}
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-red-500 text-3xl z-[60] relative"
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay - Full Screen */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/90 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 right-0 h-full w-64 bg-black border-l border-red-500/30 z-50 md:hidden pt-20 px-6">
            <div className="flex flex-col space-y-5">
              {!isPWA && (
                <>
                  <a
                    href="#features"
                    className="text-gray-300 hover:text-red-400 transition text-base py-2 border-b border-red-500/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-gray-300 hover:text-red-400 transition text-base py-2 border-b border-red-500/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    How it works
                  </a>
                  <a
                    href="#faq"
                    className="text-gray-300 hover:text-red-400 transition text-base py-2 border-b border-red-500/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    FAQ
                  </a>
                  <Link
                    href="/login"
                    className="text-red-400 hover:text-red-300 transition text-base py-2 border-b border-red-500/10"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mentor Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-3 border border-red-500/50 rounded-lg text-red-400 text-center hover:bg-red-500/10 glow-red transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <Link
                href={getDownloadLink()}
                className="px-4 py-3 bg-red-600 rounded-lg text-white text-base font-semibold text-center hover:bg-red-700 glow-red transition"
                onClick={() => setMenuOpen(false)}
              >
                {getDownloadText()}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}