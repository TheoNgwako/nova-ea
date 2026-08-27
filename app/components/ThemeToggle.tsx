'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 bg-black/80 backdrop-blur-md border border-red-500/30 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg hover:glow-red transition"
    >
      <span className="text-xs">🌙</span>
      <div
        className={`w-10 h-5 rounded-full transition-all duration-300 ${
          darkMode ? 'bg-red-600' : 'bg-gray-300'
        } relative`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all duration-300 ${
            darkMode ? 'left-5' : 'left-0.5'
          }`}
        />
      </div>
      <span className="text-xs">☀️</span>
    </button>
  );
}