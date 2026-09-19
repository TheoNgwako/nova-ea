'use client';

import { useTheme } from '../../context/ThemeContext';

type PhantomLayoutProps = {
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

export default function PhantomLayout({
  mentorImage,
  mentorName,
  mentorTagline,
  isStarted,
  onToggle,
  onRemove,
  getFontFamily,
}: PhantomLayoutProps) {
  const { accentColor } = useTheme();

  return (
    <>
      <p
        className="text-center text-base font-black tracking-widest mb-6 uppercase"
        style={{ color: accentColor, textShadow: `0 0 20px ${accentColor}80` }}
      >
        THE GREAT SON OF NAS
      </p>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full overflow-hidden opacity-80"
            style={{ border: `1px solid ${accentColor}60` }}
          >
            {mentorImage ? (
              <img src={mentorImage} alt="AI" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center text-2xl font-black opacity-60" style={{ color: accentColor }}>
                AI
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black" />
        </div>
      </div>

      <p className="text-center text-xs tracking-widest text-white mb-1">
        Your Trading With
      </p>
      <h1
        className="text-center text-xl font-light tracking-[0.2em] mb-6"
        style={{
          fontFamily: getFontFamily(),
          color: accentColor,
        }}
      >
        {mentorName.toUpperCase()}
      </h1>

      <div className="flex items-center justify-center gap-6 mb-8">
        <button
          onClick={onRemove}
          className="text-[10px] tracking-widest text-white hover:text-white/70 transition"
        >
          REMOVE
        </button>

        <button
          onClick={onToggle}
          className="w-16 h-16 rounded-full flex items-center justify-center transition active:scale-95"
          style={{
            border: `1px solid ${accentColor}`,
            background: 'transparent',
            boxShadow: isStarted ? `0 0 20px ${accentColor}60` : 'none',
          }}
        >
          {isStarted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill={accentColor}>
              <rect x="7" y="5" width="3" height="14" />
              <rect x="14" y="5" width="3" height="14" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill={accentColor}>
              <path d="M7 5l12 7-12 7V5z" />
            </svg>
          )}
        </button>

        <button className="text-[10px] tracking-widest text-white hover:text-white/70 transition">
          QUOTES
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-white/5">
          <span className="text-[10px] tracking-widest text-white">BALANCE</span>
          <span className="text-sm font-light text-white">10133.10</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/5">
          <span className="text-[10px] tracking-widest text-white">EQUITY</span>
          <span className="text-sm font-light text-white">10134.41</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-white/5">
          <span className="text-[10px] tracking-widest text-white">PROFIT</span>
          <span className="text-sm font-light text-green-500">+1.31</span>
        </div>
      </div>

      {/* Powered By */}
      <div className="flex justify-center mb-6">
        <div
          className="px-4 py-1.5 rounded-full text-[10px]"
          style={{ border: `1px solid ${accentColor}60`, background: `${accentColor}10` }}
        >
          <span className="text-white">Powered By</span>{' '}
          <span className="text-white">NOVA EA</span>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-[10px] tracking-widest text-white">
          <div
            className={`w-1.5 h-1.5 rounded-full ${isStarted ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`}
          />
          <span>{isStarted ? 'ACTIVE' : 'IDLE'}</span>
        </div>
      </div>
    </>
  );
}