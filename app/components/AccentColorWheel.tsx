'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const PRESET_COLORS = [
  { name: 'Crimson Red', color: '#ff1a1a' },
  { name: 'Electric Blue', color: '#0066ff' },
  { name: 'Royal Purple', color: '#8b00ff' },
  { name: 'Emerald Green', color: '#00cc44' },
  { name: 'Sunset Orange', color: '#ff6600' },
  { name: 'Cyan', color: '#00cccc' },
  { name: 'Golden Yellow', color: '#ffcc00' },
  { name: 'Lime Green', color: '#88ff00' },
  { name: 'Deep Violet', color: '#6600cc' },
  { name: 'Turquoise', color: '#00ffcc' },
  { name: 'Coral', color: '#ff6666' },
  { name: 'Sky Blue', color: '#66ccff' },
  { name: 'Forest Green', color: '#2d7a2d' },
  { name: 'Pure White', color: '#ffffff' },
  { name: 'Silver Gray', color: '#999999' },
];

export default function AccentColorWheel() {
  const { accentColor, setAccentColor } = useTheme();
  const wheelRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleColorPick = (e: React.MouseEvent | React.TouchEvent) => {
    const wheel = wheelRef.current;
    if (!wheel) return;

    const rect = wheel.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    // Calculate hue from angle
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = (angle + 360) % 360;
    const hue = angle;

    // Calculate lightness from distance (inner = dark, outer = bright)
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = rect.width / 2;
    const lightness = Math.min(70, (distance / radius) * 70);

    const color = hslToHex(hue, 100, lightness);
    setAccentColor(color);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    handleColorPick(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) handleColorPick(e);
  };

  const handleMouseUp = () => setDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragging(true);
    handleColorPick(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragging) handleColorPick(e);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="py-4">
      {/* Color Wheel */}
      <div className="flex justify-center mb-6">
        <div
          ref={wheelRef}
          className="relative w-48 h-48 rounded-full cursor-crosshair touch-none select-none"
          style={{
            background:
              'conic-gradient(from 90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.5)',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {/* Inner dark circle to create ring effect */}
          <div
            className="absolute inset-0 m-auto w-3/4 h-3/4 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,0,0,0.9) 30%, rgba(0,0,0,0.4) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          />

          {/* Center preview */}
          <div
            className="absolute inset-0 m-auto w-16 h-16 rounded-full border-4 border-white/20"
            style={{
              background: accentColor,
              boxShadow: `0 0 30px ${accentColor}`,
            }}
          />
        </div>
      </div>

      {/* Preset Colors */}
      <div className="space-y-2">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => setAccentColor(preset.color)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              accentColor === preset.color
                ? 'bg-white/10 border-2'
                : 'bg-white/5 border border-white/10'
            }`}
            style={{
              borderColor: accentColor === preset.color ? preset.color : undefined,
            }}
          >
            <div
              className="w-6 h-6 rounded-full flex-shrink-0"
              style={{
                background: preset.color,
                boxShadow: `0 0 10px ${preset.color}`,
              }}
            />
            <span className="text-white text-sm font-medium">{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper function
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}