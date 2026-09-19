'use client';

import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import AccentColorWheel from './AccentColorWheel';

const LAYOUTS = [
  { id: 'default', name: 'Default', desc: 'Default 2-column layout' },
  { id: 'matrix', name: 'Matrix', desc: '3 buttons in row layout' },
  { id: 'phoenix', name: 'Phoenix', desc: '3 pill image cards with overlay' },
  { id: 'crimson', name: 'Crimson', desc: 'Double outline with circle controls' },
  { id: 'newschool', name: 'New School', desc: 'Full mentor portrait with action pills' },
  { id: 'inferno', name: 'Inferno', desc: 'Curved card with split image pills' },
  { id: 'phantom', name: 'Phantom', desc: 'Stealth minimal interface' },
  { id: 'navigator', name: 'Navigator', desc: 'Deep blue glow with pill action bar' },
  { id: 'nova', name: 'Nova', desc: 'Circle portrait with PAIRS / START / LOGS bar' },
  { id: 'sniper', name: 'Sniper', desc: 'Minimal trade-focused layout' },
];

const SHAPES = [
  { id: 'classic', name: 'The Classic', desc: 'Circle Shape Interface' },
  { id: 'halo', name: 'The Halo', desc: 'Large Circle With Glow' },
  { id: 'widescreen', name: 'The Widescreen', desc: 'Stretched Rectangle' },
];

const FONTS = [
  { id: 'default', name: 'Default', family: 'system-ui' },
  { id: 'orbitron', name: 'Orbitron', family: 'Orbitron, sans-serif' },
  { id: 'audiowide', name: 'Audiowide', family: 'Audiowide, cursive' },
  { id: 'russo', name: 'Russo One', family: '"Russo One", sans-serif' },
  { id: 'bungee', name: 'Bungee', family: 'Bungee, cursive' },
  { id: 'blackops', name: 'Black Ops One', family: '"Black Ops One", cursive' },
  { id: 'righteous', name: 'Righteous', family: 'Righteous, cursive' },
  { id: 'bebas', name: 'Bebas Neue', family: '"Bebas Neue", sans-serif' },
  { id: 'teko', name: 'Teko', family: 'Teko, sans-serif' },
  { id: 'saira', name: 'Saira Stencil', family: '"Saira Stencil One", cursive' },
  { id: 'michroma', name: 'Michroma', family: 'Michroma, sans-serif' },
  { id: 'bruno', name: 'Bruno Ace', family: '"Bruno Ace", cursive' },
  { id: 'syncopate', name: 'Syncopate', family: 'Syncopate, sans-serif' },
  { id: 'rubikglitch', name: 'Rubik Glitch', family: '"Rubik Glitch", cursive' },
  { id: 'alexbrush', name: 'Alex Brush', family: '"Alex Brush", cursive' },
  { id: 'iceberg', name: 'Iceberg', family: 'Iceberg, cursive' },
  { id: 'wallpoet', name: 'Wallpoet', family: 'Wallpoet, cursive' },
  { id: 'megrim', name: 'Megrim', family: 'Megrim, cursive' },
  { id: 'monoton', name: 'Monoton', family: 'Monoton, cursive' },
];

type SettingsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const {
    accentColor,
    layout,
    setLayout,
    font,
    setFont,
    shape,
    setShape,
  } = useTheme();

  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-[100]" onClick={onClose} />

      <div
        className="fixed top-0 right-0 h-full w-full max-w-md z-[101] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)',
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 bg-black/95 backdrop-blur-md border-b z-10 flex items-center justify-between px-5 py-4"
          style={{ borderColor: `${accentColor}30` }}
        >
          <h1
            className="text-2xl font-black tracking-wider"
            style={{
              color: accentColor,
              textShadow: `0 0 20px ${accentColor}80`,
            }}
          >
            SETTINGS
          </h1>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xl transition"
            style={{
              borderColor: accentColor,
              color: accentColor,
              boxShadow: `0 0 15px ${accentColor}80`,
            }}
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Select Main Interface */}
          <Section
            title="Select Main Interface"
            icon="▦"
            isOpen={openSection === 'interface'}
            onToggle={() => toggleSection('interface')}
            accentColor={accentColor}
          >
            <div className="space-y-2 pt-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLayout(l.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                    layout === l.id ? 'bg-white/10' : 'bg-white/5'
                  }`}
                  style={{
                    border: layout === l.id ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.05)',
                    boxShadow: layout === l.id ? `0 0 20px ${accentColor}40` : undefined,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="font-bold text-sm"
                        style={{
                          color: layout === l.id ? accentColor : 'white',
                        }}
                      >
                        {l.name}
                      </p>
                      <p className="text-white/60 text-xs mt-0.5">{l.desc}</p>
                    </div>
                    {layout === l.id && (
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: accentColor }}
                      >
                        <span className="text-black text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* Select Shape */}
          <Section
            title="Select Shape"
            icon="◯"
            isOpen={openSection === 'shape'}
            onToggle={() => toggleSection('shape')}
            accentColor={accentColor}
          >
            <div className="space-y-2 pt-2">
              {SHAPES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setShape(s.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                    shape === s.id ? 'bg-white/10' : 'bg-white/5'
                  }`}
                  style={{
                    border: shape === s.id ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.05)',
                    boxShadow: shape === s.id ? `0 0 20px ${accentColor}40` : undefined,
                  }}
                >
                  <p
                    className="font-bold text-sm"
                    style={{ color: shape === s.id ? accentColor : 'white' }}
                  >
                    {s.name}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </Section>

          {/* Select Colour */}
          <Section
            title="Select Colour"
            icon="◐"
            isOpen={openSection === 'colour'}
            onToggle={() => toggleSection('colour')}
            accentColor={accentColor}
          >
            <AccentColorWheel />
          </Section>

          {/* Select Font */}
          <Section
            title="Select Font"
            icon="T"
            isOpen={openSection === 'font'}
            onToggle={() => toggleSection('font')}
            accentColor={accentColor}
          >
            <div className="space-y-2 pt-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFont(f.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                    font === f.id ? 'bg-white/10' : 'bg-white/5'
                  }`}
                  style={{
                    border: font === f.id ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.05)',
                    boxShadow: font === f.id ? `0 0 20px ${accentColor}40` : undefined,
                  }}
                >
                  <p
                    className="text-lg font-bold"
                    style={{
                      fontFamily: f.family,
                      color: font === f.id ? accentColor : 'white',
                    }}
                  >
                    {f.name}
                  </p>
                  <p className="text-white/60 text-xs mt-0.5">EA Name Font Style</p>
                </button>
              ))}
            </div>
          </Section>

          {/* Chart Scanner */}
          <button
            className="w-full flex items-center justify-between px-5 py-4 rounded-3xl bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              <span style={{ color: accentColor }} className="text-lg">▤</span>
              <span className="text-white font-semibold text-sm">Chart Scanner</span>
            </div>
            <span className="text-white/60">›</span>
          </button>

          {/* Back Animation */}
          <Section
            title="Back Animation"
            icon="◨"
            isOpen={openSection === 'back'}
            onToggle={() => toggleSection('back')}
            accentColor={accentColor}
          >
            <div className="pt-3 text-white/60 text-sm">
              Background animations coming soon.
            </div>
          </Section>

          {/* Music */}
          <Section
            title="Music"
            icon="♫"
            isOpen={openSection === 'music'}
            onToggle={() => toggleSection('music')}
            accentColor={accentColor}
          >
            <div className="pt-3 text-white/60 text-sm">
              Music coming soon.
            </div>
          </Section>

          {/* Push Notifications */}
          <div
            className="w-full flex items-center justify-between px-5 py-4 rounded-3xl bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg" style={{ color: accentColor }}>◉</span>
              <div>
                <p className="text-white font-semibold text-sm">Push Notifications</p>
                <p className="text-white/60 text-xs">Alerts on for signals & execution</p>
              </div>
            </div>
            <div
              className="w-12 h-6 rounded-full relative transition"
              style={{ background: accentColor }}
            >
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5" />
            </div>
          </div>

          {/* Tokens */}
          <div
            className="w-full flex items-center justify-between px-5 py-4 rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(0,80,200,0.3), rgba(0,40,120,0.5))',
              border: '1px solid rgba(100,150,255,0.3)',
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⬢</span>
              <div>
                <p className="text-white/60 text-xs tracking-wider">TOKENS</p>
                <p className="text-white font-bold text-lg">34 available</p>
              </div>
            </div>
            <span className="text-white/60">›</span>
          </div>

          {/* Live Chart */}
          <button
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-3xl bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span style={{ color: accentColor }} className="text-lg">📈</span>
            <span className="text-white font-semibold text-sm">Live Chart</span>
          </button>
        </div>

        <div className="h-20" />
      </div>
    </>
  );
}

function Section({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  accentColor,
}: {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-3xl bg-white/5 overflow-hidden transition-all"
      style={{
        border: isOpen ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isOpen ? `0 0 20px ${accentColor}30` : undefined,
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <span style={{ color: accentColor }} className="text-lg">{icon}</span>
          <span className="text-white font-semibold text-sm">{title}</span>
        </div>
        <span
          className="text-white/60 transition-transform"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}