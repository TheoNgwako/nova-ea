'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeContextType = {
  darkMode: boolean;
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  layout: string;
  setLayout: (layout: string) => void;
  font: string;
  setFont: (font: string) => void;
  shape: string;
  setShape: (shape: string) => void;
  colorMix: string;
  setColorMix: (mix: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Convert hex to RGB for glow effects
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 26, b: 26 };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);
  const [accentColor, setAccentColorState] = useState('#ff1a1a');
  const [layout, setLayoutState] = useState('phoenix');
  const [font, setFontState] = useState('default');
  const [shape, setShapeState] = useState('halo');
  const [colorMix, setColorMixState] = useState('off');

  // Load saved preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedAccent = localStorage.getItem('accentColor');
    const savedLayout = localStorage.getItem('layout');
    const savedFont = localStorage.getItem('font');
    const savedShape = localStorage.getItem('shape');
    const savedMix = localStorage.getItem('colorMix');

    if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    if (savedAccent) setAccentColorState(savedAccent);
    if (savedLayout) setLayoutState(savedLayout);
    if (savedFont) setFontState(savedFont);
    if (savedShape) setShapeState(savedShape);
    if (savedMix) setColorMixState(savedMix);
  }, []);

  // Apply accent color as CSS variables
  useEffect(() => {
    const rgb = hexToRgb(accentColor);
    const root = document.documentElement;

    root.style.setProperty('--accent', accentColor);
    root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    root.style.setProperty('--glow-color', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`);
    root.style.setProperty('--glow-strong', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`);
    root.style.setProperty('--accent-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
    root.style.setProperty('--accent-border', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
  }, [accentColor]);

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem('accentColor', color);
  };

  const setLayout = (l: string) => {
    setLayoutState(l);
    localStorage.setItem('layout', l);
  };

  const setFont = (f: string) => {
    setFontState(f);
    localStorage.setItem('font', f);
  };

  const setShape = (s: string) => {
    setShapeState(s);
    localStorage.setItem('shape', s);
  };

  const setColorMix = (m: string) => {
    setColorMixState(m);
    localStorage.setItem('colorMix', m);
  };

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
        accentColor,
        setAccentColor,
        layout,
        setLayout,
        font,
        setFont,
        shape,
        setShape,
        colorMix,
        setColorMix,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}