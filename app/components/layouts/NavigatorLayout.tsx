'use client';

import { useTheme } from '../../context/ThemeContext';

type NavigatorLayoutProps = {
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

export default function NavigatorLayout({
  mentorImage,
  mentorName,
  mentorTagline,
  isStarted,
  onToggle,
  onRemove,
  getFontFamily,
}: NavigatorLayoutProps) {
  const { accentColor } = useTheme();

  return (
    <div
      className="rounded-3xl p-4"
      style={{
        background:
          'linear-gradient(180deg, rgba(10,20,50,0.95) 0%, rgba(0,5,20,0.98) 100%)',
        border: `1.5px solid ${accentColor}60`,
        boxShadow: `0 0 40px ${accentColor}50`,
      }}
    >
      {/* Slogan - Accent Colour */}
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

      {/* Header with avatar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full overflow-hidden"
            style={{
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 10px ${accentColor}`,
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
                className="w-full h-full bg-black flex items-center justify-center text-xs font-bold"
                style={{
                  color: accentColor,
                  WebkitTextFillColor: accentColor,
                }}
              >
                AI
              </div>
            )}
          </div>

          <div>
            {/* Trading With - Always White */}
            <p
              className="text-[9px] tracking-widest"
              style={{
                color: '#ffffff',
                WebkitTextFillColor: '#ffffff',
              }}
            >
              TRADING WITH
            </p>

            {/* AI / Robot Name - Always White */}
            <h1
              className="text-sm font-black tracking-wide"
              style={{
                fontFamily: getFontFamily(),
                color: '#ffffff',
                WebkitTextFillColor: '#ffffff',
                textShadow: '0 0 12px rgba(255,255,255,0.35)',
              }}
            >
              {mentorName.toUpperCase()}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${
              isStarted ? 'bg-green-500 animate-pulse' : 'bg-white/20'
            }`}
          />

          <span className="text-[9px] tracking-widest text-white">
            {isStarted ? 'LIVE' : 'IDLE'}
          </span>
        </div>
      </div>

      {/* Big Quote Display */}
      <div
        className="rounded-2xl p-4 mb-4 text-center"
        style={{
          background: 'rgba(0,0,0,0.5)',
          border: `1px solid ${accentColor}30`,
        }}
      >
        <p className="text-[9px] tracking-widest text-white mb-1">
          XAUUSD
        </p>

        <p
          className="text-3xl font-black tracking-tight"
          style={{
            color: accentColor,
            textShadow: `0 0 25px ${accentColor}80`,
          }}
        >
          4386.84
        </p>

        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-[10px] text-green-500 font-bold">
            ▲ +12.34
          </span>

          <span className="text-[10px] text-white">
            (+0.28%)
          </span>
        </div>
      </div>

      {/* Pill Action Bar */}
      <div
        className="rounded-full p-1.5 flex items-center gap-1.5 mb-4"
        style={{
          background: 'rgba(0,0,0,0.6)',
          border: `1px solid ${accentColor}40`,
        }}
      >
        <button
          onClick={onRemove}
          className="w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <svg
            width="16"
            height="16"
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
          className="flex-1 py-2.5 rounded-full font-black text-xs pulse-glow transition active:scale-95"
          style={{
            background: isStarted ? 'rgba(255,0,0,0.9)' : accentColor,
            color: isStarted ? '#fff' : '#000',
            boxShadow: `0 0 20px ${accentColor}`,
          }}
        >
          {isStarted ? 'STOP' : 'START'}
        </button>

        <button
          className="w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95"
          style={{
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          <svg
            width="16"
            height="16"
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



      {/* Powered By Footer */}
      <div className="flex justify-center mt-4">
        <div
          className="px-4 py-1 rounded-full text-[9px]"
          style={{
            border: `1px solid ${accentColor}40`,
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

          {/* NOVA EA - Follows Student Selected Colour */}
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
    </div>
  );
}