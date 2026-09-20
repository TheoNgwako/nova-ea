'use client';

import { useTheme } from '../../context/ThemeContext';

type SniperLayoutProps = {
  mentorImage: string | null;
  mentorName: string;
  mentorTagline: string;
  isStarted: boolean;
  isConnected: boolean;
  terminalLogs: any[];
  onToggle: () => void;
  onRemove: () => void;
  getFontFamily: () => string;
};

export default function SniperLayout({
  mentorImage,
  mentorName,
  mentorTagline,
  isStarted,
  onToggle,
  onRemove,
  getFontFamily,
}: SniperLayoutProps) {
  const { accentColor } = useTheme();

  return (
    <>
      {/* Status Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] tracking-widest text-white">
            {isStarted ? 'ONLINE' : 'STANDBY'}
          </span>
        </div>

        <span className="text-[9px] tracking-widest text-white">
          SNIPER MODE
        </span>
      </div>

      {/* Big Header - Accent Colour */}
      <p
        className="text-center text-base font-black tracking-widest mb-5 uppercase"
        style={{
          color: accentColor,
          WebkitTextFillColor: accentColor,
          textShadow: `0 0 20px ${accentColor}80`,
        }}
      >
        THE GREAT SON OF NAS
      </p>

      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
          style={{
            border: `1.5px solid ${accentColor}`,
            boxShadow: `0 0 15px ${accentColor}60`,
          }}
        >
          {mentorImage ? (
            <img
              src={mentorImage}
              alt="AI"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full bg-black flex items-center justify-center text-lg font-black"
              style={{
                color: accentColor,
                WebkitTextFillColor: accentColor,
              }}
            >
              AI
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* AI / Robot Name - Always White */}
          <h1
            className="text-xl font-black tracking-wide truncate"
            style={{
              fontFamily: getFontFamily(),
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
              textShadow: '0 0 15px rgba(255,255,255,0.35)',
            }}
          >
            {mentorName.toUpperCase()}
          </h1>

          <p className="text-[10px] text-white/70 truncate">
            {mentorTagline}
          </p>
        </div>
      </div>

      {/* Main Control - Large Vertical */}
      <button
        onClick={onToggle}
        className="w-full py-6 rounded-2xl flex items-center justify-center gap-3 mb-3 transition active:scale-[0.98]"
        style={{
          background: isStarted ? 'rgba(255,0,0,0.85)' : accentColor,
          color: isStarted ? '#fff' : '#000',
          boxShadow: isStarted
            ? '0 0 40px rgba(255,0,0,0.6)'
            : `0 0 40px ${accentColor}80, 0 0 80px ${accentColor}40`,
        }}
      >
        {isStarted ? (
          <>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>

            <span className="text-2xl font-black tracking-widest">
              STOP
            </span>
          </>
        ) : (
          <>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 4l14 8-14 8V4z" />
            </svg>

            <span className="text-2xl font-black tracking-widest">
              START
            </span>
          </>
        )}
      </button>

      {/* Two small buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={onRemove}
          className="py-3 rounded-xl text-xs font-bold transition active:scale-95"
          style={{
            border: `1px solid ${accentColor}40`,
            background: 'rgba(0,0,0,0.6)',
            color: accentColor,
          }}
        >
          🗑 REMOVE
        </button>

        <button
          className="py-3 rounded-xl text-xs font-bold transition active:scale-95"
          style={{
            border: `1px solid ${accentColor}40`,
            background: 'rgba(0,0,0,0.6)',
            color: accentColor,
          }}
        >
          📊 QUOTES
        </button>
      </div>

     
      {/* Powered By */}
      <div className="flex justify-center">
        <div
          className="px-3 py-1 rounded text-[9px]"
          style={{
            border: `1px solid ${accentColor}30`,
          }}
        >
          {/* Powered By - Always White */}
          <span
            style={{
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
            }}
          >
            Powered By
          </span>{' '}

          {/* NOVA EA - Dynamic Accent Colour */}
          <span
            className="font-bold"
            style={{
              color: accentColor,
              WebkitTextFillColor: accentColor,
              textShadow: `0 0 10px ${accentColor}80`,
            }}
          >
            NOVA EA
          </span>
        </div>
      </div>
    </>
  );
}