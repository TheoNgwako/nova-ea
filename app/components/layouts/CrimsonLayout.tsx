'use client';

import { useTheme } from '../../context/ThemeContext';

type CrimsonLayoutProps = {
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

export default function CrimsonLayout({
  mentorImage,
  mentorName,
  mentorTagline,
  isStarted,
  onToggle,
  onRemove,
  getFontFamily,
}: CrimsonLayoutProps) {
  const { accentColor } = useTheme();

  return (
    <>
      <p
        className="text-center text-base font-black tracking-widest mb-4 uppercase"
        style={{
          color: accentColor,
          WebkitTextFillColor: accentColor,
          textShadow: `0 0 20px ${accentColor}80`,
        }}
      >
        THE GREAT SON OF NAS
      </p>

      {/* Double Outline Circle */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div
            className="w-52 h-52 rounded-full"
            style={{
              border: `2px solid ${accentColor}40`,
              boxShadow: `0 0 40px ${accentColor}30`,
            }}
          />

          <div
            className="absolute inset-2 rounded-full"
            style={{
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 30px ${accentColor}80, inset 0 0 30px ${accentColor}40`,
            }}
          />

          <div className="absolute inset-4 rounded-full overflow-hidden">
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
          </div>

          <div className="absolute bottom-2 right-4 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
        </div>
      </div>

      {/* Trading With */}
      <p
        className="text-center text-xs tracking-widest mb-1"
        style={{
          color: '#ffffff',
          WebkitTextFillColor: '#ffffff',
        }}
      >
        Your Trading With
      </p>

      {/* AI / Robot Name */}
      <h1
        className="text-center text-3xl font-black tracking-wide mb-5"
        style={{
          fontFamily: getFontFamily(),
          color: '#ffffff',
          WebkitTextFillColor: '#ffffff',
          textShadow: '0 0 18px rgba(255,255,255,0.35)',
        }}
      >
        {mentorName.toUpperCase()}
      </h1>

      {/* Circular Controls Row */}
      <div className="flex items-center justify-center gap-5 mb-5">
        <button
          onClick={onRemove}
          className="w-14 h-14 rounded-full flex items-center justify-center transition active:scale-95"
          style={{
            border: `2px solid ${accentColor}60`,
            background: 'rgba(0,0,0,0.6)',
            boxShadow: `0 0 15px ${accentColor}40`,
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
        </button>

        <button
          onClick={onToggle}
          className="w-24 h-24 rounded-full flex flex-col items-center justify-center pulse-glow transition active:scale-95"
          style={{
            border: `2px solid ${accentColor}`,
            background: 'rgba(0,0,0,0.8)',
            boxShadow: `0 0 30px ${accentColor}, inset 0 0 20px ${accentColor}30`,
          }}
        >
          {isStarted ? (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill={accentColor}
            >
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill={accentColor}
            >
              <path d="M6 4l14 8-14 8V4z" />
            </svg>
          )}

          <span
            className="text-[10px] mt-1 font-bold"
            style={{ color: accentColor }}
          >
            {isStarted ? 'STOP' : 'START'}
          </span>
        </button>

        <button
          className="w-14 h-14 rounded-full flex items-center justify-center transition active:scale-95"
          style={{
            border: `2px solid ${accentColor}60`,
            background: 'rgba(0,0,0,0.6)',
            boxShadow: `0 0 15px ${accentColor}40`,
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
              d="M3 17l6-6 4 4 8-8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 7h7v7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
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
          {/* Always white */}
          <span
            style={{
              color: '#ffffff',
              WebkitTextFillColor: '#ffffff',
            }}
          >
            Powered By
          </span>{' '}

          {/* Follows student's selected app colour */}
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

      {/* Robot Card */}
      <div
        className="rounded-xl p-3 mb-4"
        style={{
          background: 'rgba(0,0,0,0.7)',
          border: `1px solid ${accentColor}40`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: `2px solid ${accentColor}` }}
          >
            {mentorImage ? (
              <img
                src={mentorImage}
                alt="Robot"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-black" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-bold text-white truncate">
              {mentorName}
            </h2>

            <p className="text-[10px] text-white/70 truncate">
              {mentorTagline}
            </p>
          </div>

          <span
            className="text-[9px] px-2 py-1 rounded-full"
            style={{
              background: `${accentColor}20`,
              color: accentColor,
              border: `1px solid ${accentColor}40`,
            }}
          >
            {isStarted ? 'LIVE' : 'IDLE'}
          </span>
        </div>
      </div>
    </>
  );
}