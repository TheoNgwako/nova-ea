'use client';

import { useTheme } from '../../context/ThemeContext';

type DefaultLayoutProps = {
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

export default function DefaultLayout({
  mentorImage,
  mentorName,
  mentorTagline,
  isStarted,
  onToggle,
  onRemove,
  getFontFamily,
}: DefaultLayoutProps) {
  const { accentColor } = useTheme();

  return (
    <>
      <p
        className="text-center text-base font-black tracking-widest mb-3 uppercase"
        style={{
          color: accentColor,
          WebkitTextFillColor: accentColor,
          textShadow: `0 0 20px ${accentColor}80`,
        }}
      >
        THE GREAT SON OF NAS
      </p>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Left: Image */}
        <div
          className="aspect-square rounded-2xl overflow-hidden relative"
          style={{
            border: `2px solid ${accentColor}`,
            boxShadow: `0 0 25px ${accentColor}60`,
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
              className="w-full h-full bg-gradient-to-br from-red-900/40 to-black flex items-center justify-center text-4xl font-black"
              style={{
                color: accentColor,
                WebkitTextFillColor: accentColor,
              }}
            >
              AI
            </div>
          )}

          <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
        </div>

        {/* Right: Info + Stats */}
        <div className="flex flex-col gap-3">
          <div
            className="rounded-2xl p-3 flex-1"
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: `1px solid ${accentColor}40`,
            }}
          >
            {/* Always White */}
            <p
              className="text-[9px] tracking-widest mb-1"
              style={{
                color: '#ffffff',
                WebkitTextFillColor: '#ffffff',
              }}
            >
              YOUR TRADING WITH
            </p>

            {/* AI / Robot Name - Always White */}
            <h1
              className="text-lg font-black tracking-wide"
              style={{
                fontFamily: getFontFamily(),
                color: '#ffffff',
                WebkitTextFillColor: '#ffffff',
                textShadow: '0 0 15px rgba(255,255,255,0.35)',
              }}
            >
              {mentorName.toUpperCase()}
            </h1>

            <p className="text-[10px] text-white/70 mt-1 line-clamp-2">
              {mentorTagline}
            </p>
          </div>

          <div
            className="rounded-2xl p-3"
            style={{
              background: 'rgba(0,0,0,0.7)',
              border: `1px solid ${accentColor}40`,
            }}
          >
            <p className="text-[9px] tracking-widest text-white">
              {isStarted ? 'CONNECTED' : 'DISCONNECTED'}
            </p>

            <div
              className="w-full h-1.5 rounded-full mt-2"
              style={{
                background: isStarted
                  ? accentColor
                  : 'rgba(255,255,255,0.1)',
                boxShadow: isStarted
                  ? `0 0 10px ${accentColor}`
                  : 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* Powered By */}
      <div className="flex justify-center mb-4">
        <div
          className="px-4 py-1.5 rounded-full text-[10px]"
          style={{
            border: `1px solid ${accentColor}60`,
            background: `${accentColor}10`,
          }}
        >
          {/* Always White */}
          <span
            style={{
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
            }}
          >
            Powered By
          </span>{' '}

          {/* Follows Student Selected Colour */}
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

      {/* Control Buttons - 2 Columns */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={onRemove}
          className="py-4 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition active:scale-95"
          style={{
            border: `1.5px solid ${accentColor}60`,
            background: 'rgba(0,0,0,0.6)',
            color: accentColor,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke={accentColor}
            strokeWidth="2"
          >
            <path
              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span className="mt-1">REMOVE</span>
        </button>

        <button
          onClick={onToggle}
          className="py-4 rounded-xl flex flex-col items-center justify-center text-xs font-black pulse-glow transition active:scale-95"
          style={{
            background: isStarted ? 'rgba(255,0,0,0.9)' : accentColor,
            color: isStarted ? '#fff' : '#000',
            boxShadow: `0 0 25px ${accentColor}`,
          }}
        >
          {isStarted ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 4l14 8-14 8V4z" />
            </svg>
          )}

          <span className="mt-1">
            {isStarted ? 'STOP' : 'START'}
          </span>
        </button>
      </div>


    </>
  );
}