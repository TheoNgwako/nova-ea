'use client';

import { useTheme } from '../../context/ThemeContext';

type NewSchoolLayoutProps = {
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

export default function NewSchoolLayout({
  mentorImage,
  mentorName,
  mentorTagline,
  isStarted,
  onToggle,
  onRemove,
  getFontFamily,
}: NewSchoolLayoutProps) {
  const { accentColor } = useTheme();

  return (
    <>
      <p
        className="text-center text-base font-black tracking-widest mb-3 uppercase"
        style={{ color: accentColor, textShadow: `0 0 20px ${accentColor}80` }}
      >
        THE GREAT SON OF NAS
      </p>

      {/* Full Portrait Hero */}
      <div
        className="relative w-full rounded-3xl overflow-hidden mb-4"
        style={{
          border: `2px solid ${accentColor}60`,
          boxShadow: `0 0 40px ${accentColor}60`,
          minHeight: '420px',
        }}
      >
        {mentorImage ? (
          <img src={mentorImage} alt="AI" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 to-black" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        <div className="absolute top-3 right-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-white font-bold">
            {isStarted ? 'LIVE' : 'IDLE'}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-[10px] tracking-widest text-white mb-1 uppercase">
            YOUR TRADING WITH
          </p>
          <h1
            className="text-3xl font-black tracking-wide mb-2"
            style={{
              fontFamily: getFontFamily(),
              color: accentColor,
              textShadow: `0 0 25px ${accentColor}`,
            }}
          >
            {mentorName.toUpperCase()}
          </h1>
          <p className="text-[11px] text-white/80 mb-4 line-clamp-2">{mentorTagline}</p>

          <div className="flex gap-2">
            <button
              onClick={onRemove}
              className="w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95"
              style={{
                border: `2px solid ${accentColor}80`,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(10px)',
                boxShadow: `0 0 15px ${accentColor}40`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              onClick={onToggle}
              className="flex-1 py-3 rounded-full font-black text-sm pulse-glow transition active:scale-95"
              style={{
                background: isStarted ? 'rgba(255,0,0,0.9)' : accentColor,
                color: isStarted ? '#fff' : '#000',
                boxShadow: `0 0 25px ${accentColor}`,
              }}
            >
              {isStarted ? '■ STOP' : '▶ START'}
            </button>

            <button
              className="w-12 h-12 rounded-full flex items-center justify-center transition active:scale-95"
              style={{
                border: `2px solid ${accentColor}80`,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(10px)',
                boxShadow: `0 0 15px ${accentColor}40`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                <path d="M3 17l6-6 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 7h7v7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Balance Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${accentColor}30` }}>
          <p className="text-[9px] text-white tracking-widest">BALANCE</p>
          <p className="text-base font-bold text-white">10133</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${accentColor}30` }}>
          <p className="text-[9px] text-white tracking-widest">EQUITY</p>
          <p className="text-base font-bold text-white">10134</p>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${accentColor}30` }}>
          <p className="text-[9px] text-white tracking-widest">PROFIT</p>
          <p className="text-base font-bold text-green-500">+1.31</p>
        </div>
      </div>

      {/* Powered By */}
      <div className="flex justify-center">
        <div
          className="px-4 py-1.5 rounded-full text-[10px]"
          style={{ border: `1px solid ${accentColor}60`, background: `${accentColor}10` }}
        >
          <span className="text-white">Powered By</span>{' '}
          <span className="text-white">NOVA EA</span>
        </div>
      </div>
    </>
  );
}