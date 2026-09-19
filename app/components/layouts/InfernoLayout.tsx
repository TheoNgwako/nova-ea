'use client';

import { useTheme } from '../../context/ThemeContext';

type InfernoLayoutProps = {
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

export default function InfernoLayout({
  mentorImage,
  mentorName,
  mentorTagline,
  isStarted,
  onToggle,
  onRemove,
  getFontFamily,
}: InfernoLayoutProps) {
  const { accentColor } = useTheme();

  return (
    <>
      <p
        className="text-center text-base font-black tracking-widest mb-3 uppercase"
        style={{ color: accentColor, textShadow: `0 0 20px ${accentColor}80` }}
      >
        THE GREAT SON OF NAS
      </p>

      {/* Curved Card - Split Layout */}
      <div
        className="relative rounded-[40px] overflow-hidden mb-4"
        style={{
          background: 'rgba(0,0,0,0.8)',
          border: `2px solid ${accentColor}60`,
          boxShadow: `0 0 40px ${accentColor}60, inset 0 0 40px ${accentColor}20`,
          minHeight: '420px',
        }}
      >
        {/* Big Image Top Half */}
        <div className="relative h-64 overflow-hidden">
          {mentorImage ? (
            <img src={mentorImage} alt="AI" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-900/40 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90" />

          <div
            className="absolute bottom-0 left-0 right-0 h-12"
            style={{
              background: 'rgba(0,0,0,0.8)',
              borderTopLeftRadius: '50% 100%',
              borderTopRightRadius: '50% 100%',
            }}
          />
        </div>

        {/* Bottom Half - Text + Buttons */}
        <div className="relative -mt-8 px-6 pb-6">
          <p className="text-center text-xs tracking-widest text-white">Your Trading With</p>
          <h1
            className="text-center text-3xl font-black tracking-wider mb-4"
            style={{
              fontFamily: getFontFamily(),
              color: accentColor,
              textShadow: `0 0 20px ${accentColor}`,
            }}
          >
            {mentorName.toUpperCase()}
          </h1>

          <div className="flex gap-2 justify-center">
            <button
              onClick={onRemove}
              className="flex-1 py-3 rounded-full text-xs font-bold transition active:scale-95"
              style={{
                border: `1.5px solid ${accentColor}60`,
                background: 'rgba(0,0,0,0.6)',
                color: accentColor,
              }}
            >
              🗑
            </button>

            <button
              onClick={onToggle}
              className="flex-[2] py-3 rounded-full text-sm font-black pulse-glow transition active:scale-95"
              style={{
                background: accentColor,
                color: '#000',
                boxShadow: `0 0 25px ${accentColor}`,
              }}
            >
              {isStarted ? '■ STOP' : '▶ START'}
            </button>

            <button
              className="flex-1 py-3 rounded-full text-xs font-bold transition active:scale-95"
              style={{
                border: `1.5px solid ${accentColor}60`,
                background: 'rgba(0,0,0,0.6)',
                color: accentColor,
              }}
            >
              📈
            </button>
          </div>
        </div>
      </div>

      {/* Powered By */}
      <div className="flex justify-center mb-4">
        <div
          className="px-4 py-1.5 rounded-full text-xs"
          style={{ border: `1px solid ${accentColor}60`, background: `${accentColor}10` }}
        >
          <span className="text-white">Powered By</span>{' '}
          <span className="text-white">NOVA EA</span>
        </div>
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
            <img src={mentorImage} alt="Robot" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-black" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">{mentorName}</p>
          <p className="text-[10px] text-white/70 truncate">{mentorTagline}</p>
        </div>
      </div>

      {/* Balance Cards */}
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