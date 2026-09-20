'use client';

import { useTheme } from '../../context/ThemeContext';

type PhoenixLayoutProps = {
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

export default function PhoenixLayout({
  mentorImage,
  mentorName,
  mentorTagline,
  isStarted,
  onToggle,
  onRemove,
  getFontFamily,
}: PhoenixLayoutProps) {
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

      {/* Big Circle */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div
            className="w-56 h-56 rounded-full overflow-hidden"
            style={{
              border: `3px solid ${accentColor}`,
              boxShadow: `0 0 30px ${accentColor}80, 0 0 60px ${accentColor}40, inset 0 0 30px ${accentColor}30`,
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
                className="w-full h-full bg-gradient-to-br from-red-900/40 to-black flex items-center justify-center text-6xl font-black"
                style={{
                  color: accentColor,
                  WebkitTextFillColor: accentColor,
                }}
              >
                AI
              </div>
            )}
          </div>

          <div
            className="absolute -bottom-2 -left-2 w-16 h-16 rounded-full overflow-hidden"
            style={{
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 15px ${accentColor}`,
            }}
          >
            {mentorImage ? (
              <img
                src={mentorImage}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-black" />
            )}
          </div>

          <div className="absolute bottom-2 left-14 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
        </div>
      </div>

      {/* Your Trading With - Always White */}
      <p
        className="text-center text-xs tracking-widest mt-4"
        style={{
          color: '#ffffff',
          WebkitTextFillColor: '#ffffff',
        }}
      >
        Your Trading With
      </p>

      {/* AI / Robot Name - Always White */}
      <h1
        className="text-center text-4xl font-black tracking-wider mb-4"
        style={{
          fontFamily: getFontFamily(),
          color: '#ffffff',
          WebkitTextFillColor: '#ffffff',
          textShadow: '0 0 18px rgba(255,255,255,0.35)',
        }}
      >
        {mentorName.toUpperCase()}
      </h1>

      {/* Powered By */}
      <div className="flex justify-center mb-6">
        <div
          className="px-5 py-2 rounded-full text-xs"
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

      {/* 3 Buttons */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={onRemove}
          className="w-16 h-16 rounded-full flex flex-col items-center justify-center text-xs font-bold transition active:scale-95"
          style={{
            border: `1.5px solid ${accentColor}60`,
            background: 'rgba(0,0,0,0.6)',
            color: accentColor,
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
          <span className="text-[9px] mt-0.5">REMOVE</span>
        </button>

        <button
          onClick={onToggle}
          className="w-24 h-24 rounded-full flex flex-col items-center justify-center pulse-glow transition active:scale-95"
          style={{
            border: `2px solid ${accentColor}`,
            background: 'rgba(0,0,0,0.8)',
            color: accentColor,
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

          <span className="text-[10px] mt-1 font-bold">
            {isStarted ? 'STOP' : 'START'}
          </span>
        </button>

        <button
          className="w-16 h-16 rounded-full flex flex-col items-center justify-center text-xs font-bold transition active:scale-95"
          style={{
            border: `1.5px solid ${accentColor}60`,
            background: 'rgba(0,0,0,0.6)',
            color: accentColor,
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
          <span className="text-[9px] mt-0.5">QUOTES</span>
        </button>
      </div>

      {/* Robot Card */}
      <div
        className="rounded-2xl p-3 mb-4"
        style={{
          background: 'rgba(0,0,0,0.7)',
          border: `1px solid ${accentColor}40`,
          boxShadow: `0 0 20px ${accentColor}30`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
            style={{
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 10px ${accentColor}`,
            }}
          >
            {mentorImage ? (
              <img
                src={mentorImage}
                alt="Robot"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full bg-black flex items-center justify-center text-sm font-bold"
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
            <h2
              className="text-sm font-bold truncate"
              style={{
                color: '#ffffff',
                WebkitTextFillColor: '#ffffff',
              }}
            >
              {mentorName}
            </h2>

            <p
              className="text-[10px] truncate"
              style={{
                color: '#ffffff',
                WebkitTextFillColor: '#ffffff',
              }}
            >
              {mentorTagline}
            </p>
          </div>

          <span
            className="text-[10px] px-2 py-1 rounded-full"
            style={{
              background: `${accentColor}20`,
              color: accentColor,
              border: `1px solid ${accentColor}40`,
            }}
          >
            {isStarted ? 'CONNECTED' : 'DISCONNECTED'}
          </span>
        </div>
      </div>
    </>
  );
}