'use client';

import { useTheme } from '../../context/ThemeContext';

type MatrixLayoutProps = {
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

export default function MatrixLayout({
  mentorImage,
  mentorName,
  mentorTagline,
  isStarted,
  onToggle,
  onRemove,
  getFontFamily,
}: MatrixLayoutProps) {
  const { accentColor } = useTheme();

  return (
    <>
      <p
        className="text-center text-base font-black tracking-widest mb-3 uppercase"
        style={{ color: accentColor, textShadow: `0 0 20px ${accentColor}80` }}
      >
        THE GREAT SON OF NAS
      </p>

      {/* Small Circle */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div
            className="w-32 h-32 rounded-full overflow-hidden"
            style={{
              border: `2px solid ${accentColor}`,
              boxShadow: `0 0 25px ${accentColor}`,
            }}
          >
            {mentorImage ? (
              <img src={mentorImage} alt="AI" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full bg-black flex items-center justify-center text-3xl font-black"
                style={{ color: accentColor }}
              >
                AI
              </div>
            )}
          </div>
          <div className="absolute bottom-1 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
        </div>
      </div>

      <p className="text-center text-xs tracking-widest text-white mb-1">
        Your Trading With
      </p>
      <h1
        className="text-center text-2xl font-black tracking-wide mb-4"
        style={{
          fontFamily: getFontFamily(),
          color: accentColor,
          textShadow: `0 0 20px ${accentColor}`,
        }}
      >
        {mentorName.toUpperCase()}
      </h1>

      {/* 3 Buttons in Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={onRemove}
          className="py-3 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition active:scale-95"
          style={{
            border: `1.5px solid ${accentColor}60`,
            background: 'rgba(0,0,0,0.6)',
            color: accentColor,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="mt-1">REMOVE</span>
        </button>

        <button
          onClick={onToggle}
          className="py-3 rounded-xl flex flex-col items-center justify-center text-[10px] font-black pulse-glow transition active:scale-95"
          style={{
            background: isStarted ? 'rgba(255,0,0,0.9)' : accentColor,
            color: isStarted ? '#fff' : '#000',
            boxShadow: `0 0 20px ${accentColor}`,
          }}
        >
          {isStarted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4l14 8-14 8V4z" />
            </svg>
          )}
          <span className="mt-1">{isStarted ? 'STOP' : 'START'}</span>
        </button>

        <button
          className="py-3 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition active:scale-95"
          style={{
            border: `1.5px solid ${accentColor}60`,
            background: 'rgba(0,0,0,0.6)',
            color: accentColor,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
            <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 7h7v7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="mt-1">QUOTES</span>
        </button>
      </div>

      {/* Robot Info */}
      <div
        className="rounded-xl p-3 mb-4"
        style={{
          background: 'rgba(0,0,0,0.7)',
          border: `1px solid ${accentColor}40`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">{mentorName}</h2>
            <p className="text-[10px] text-white/70">{mentorTagline}</p>
          </div>
          <span
            className="text-[10px] px-2 py-1 rounded-full"
            style={{ background: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}
          >
            {isStarted ? 'CONNECTED' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Powered By */}
      <div className="flex justify-center mb-4">
        <div
          className="px-4 py-1.5 rounded-full text-[10px]"
          style={{ border: `1px solid ${accentColor}60`, background: `${accentColor}10` }}
        >
          <span className="text-white">Powered By</span>{' '}
          <span className="text-white">NOVA EA</span>
        </div>
      </div>

      {/* Balance / Equity */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${accentColor}30` }}>
          <p className="text-[10px] text-white tracking-widest">BALANCE</p>
          <p className="text-lg font-bold text-white">10133.10</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${accentColor}30` }}>
          <p className="text-[10px] text-white tracking-widest">EQUITY</p>
          <p className="text-lg font-bold text-white">10134.41</p>
        </div>
      </div>
    </>
  );
}