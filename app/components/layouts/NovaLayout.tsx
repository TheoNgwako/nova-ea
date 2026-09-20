'use client';

import { useTheme } from '../../context/ThemeContext';

type NovaLayoutProps = {
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

export default function NovaLayout({
  mentorImage,
  mentorName,
  mentorTagline,
  isStarted,
  onToggle,
  onRemove,
  getFontFamily,
}: NovaLayoutProps) {
  const { accentColor } = useTheme();

  return (
    <>
      {/* Slogan - Accent Colour */}
      <p
        className="text-center text-base font-black tracking-widest mb-2 uppercase"
        style={{
          color: accentColor,
          WebkitTextFillColor: accentColor,
          textShadow: `0 0 20px ${accentColor}80`,
        }}
      >
        THE GREAT SON OF NAS
      </p>

      {/* Circle Portrait (smaller) */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div
            className="w-44 h-44 rounded-full overflow-hidden"
            style={{
              border: `3px solid ${accentColor}`,
              boxShadow: `0 0 25px ${accentColor}80`,
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
                className="w-full h-full bg-gradient-to-br from-red-900/40 to-black flex items-center justify-center text-5xl font-black"
                style={{
                  color: accentColor,
                  WebkitTextFillColor: accentColor,
                }}
              >
                AI
              </div>
            )}
          </div>

          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
        </div>
      </div>

      {/* Your Trading With - Always White */}
      <p
        className="text-center text-xs tracking-widest"
        style={{
          color: '#ffffff',
          WebkitTextFillColor: '#ffffff',
        }}
      >
        Your Trading With
      </p>

      {/* AI / Robot Name - Always White */}
      <h1
        className="text-center text-3xl font-black tracking-wider mb-6"
        style={{
          fontFamily: getFontFamily(),
          color: '#ffffff',
          WebkitTextFillColor: '#ffffff',
          textShadow: '0 0 18px rgba(255,255,255,0.35)',
        }}
      >
        {mentorName.toUpperCase()}
      </h1>

      {/* Nova Bar: PAIRS / START / LOGS */}
      <div
        className="rounded-2xl p-2 mb-4 flex items-center gap-2"
        style={{
          background: 'rgba(0,0,0,0.7)',
          border: `1px solid ${accentColor}40`,
          boxShadow: `0 0 20px ${accentColor}30`,
        }}
      >
        <button
          className="flex-1 py-3 rounded-xl font-bold text-sm transition"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: accentColor,
            border: `1px solid ${accentColor}40`,
          }}
        >
          PAIRS
        </button>

        <button
          onClick={onToggle}
          className="flex-1 py-3 rounded-xl font-black text-sm transition pulse-glow"
          style={{
            background: isStarted ? 'rgba(255,0,0,0.9)' : accentColor,
            color: isStarted ? '#fff' : '#000',
            boxShadow: `0 0 25px ${accentColor}`,
          }}
        >
          {isStarted ? 'STOP' : 'START'}
        </button>

        <button
          className="flex-1 py-3 rounded-xl font-bold text-sm transition"
          style={{
            background: 'rgba(255,255,255,0.05)',
            color: accentColor,
            border: `1px solid ${accentColor}40`,
          }}
        >
          LOGS
        </button>
      </div>

      {/* Remove button small below */}
      <div className="flex justify-center mb-4">
        <button
          onClick={onRemove}
          className="px-4 py-2 rounded-full text-xs font-bold"
          style={{
            border: `1px solid ${accentColor}60`,
            background: 'rgba(0,0,0,0.6)',
            color: accentColor,
          }}
        >
          🗑 REMOVE ROBOT
        </button>
      </div>

      {/* Robot Info */}
      <div
        className="rounded-2xl p-3 mb-4 flex items-center gap-3"
        style={{
          background: 'rgba(0,0,0,0.7)',
          border: `1px solid ${accentColor}30`,
        }}
      >
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
          <p className="text-xs font-bold text-white truncate">
            {mentorName}
          </p>
          <p className="text-[10px] text-white/70 truncate">
            {mentorTagline}
          </p>
        </div>
      </div>

      {/* Powered By */}
      <div className="flex justify-center mb-4">
        <div
          className="px-4 py-1.5 rounded-full text-xs"
          style={{
            border: `1px solid ${accentColor}60`,
            background: `${accentColor}10`,
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

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl p-3"
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: `1px solid ${accentColor}30`,
          }}
        >
          <p className="text-[10px] text-white tracking-widest">
            BALANCE
          </p>
          <p className="text-lg font-bold text-white">
            10133.10
          </p>
        </div>

        <div
          className="rounded-xl p-3"
          style={{
            background: 'rgba(0,0,0,0.7)',
            border: `1px solid ${accentColor}30`,
          }}
        >
          <p className="text-[10px] text-white tracking-widest">
            EQUITY
          </p>
          <p className="text-lg font-bold text-white">
            10134.41
          </p>
        </div>
      </div>
    </>
  );
}