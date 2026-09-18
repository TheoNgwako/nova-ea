'use client';

import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

type SmartScreenProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SYMBOLS = ['XAUUSD', 'BTCUSD', 'EURUSD', 'GBPUSD', 'US30', 'NAS100'];
const STRATEGIES = ['ICT', 'SMC', 'Candlestick Patterns', 'Trend Following', 'Liquidity Sweeps', 'Order Blocks', 'Fair Value Gaps'];

export default function SmartScreen({ isOpen, onClose }: SmartScreenProps) {
  const { accentColor } = useTheme();
  const [platform, setPlatform] = useState<'MT4' | 'MT5'>('MT5');
  const [selectedSymbols, setSelectedSymbols] = useState(['XAUUSD']);
  const [lotSize, setLotSize] = useState('0.01');
  const [timeframe, setTimeframe] = useState('M15');
  const [maxDailyLoss, setMaxDailyLoss] = useState('100');
  const [profitTarget, setProfitTarget] = useState('200');
  const [maxTrades, setMaxTrades] = useState(3);
  const [strategies, setStrategies] = useState(['ICT', 'SMC']);
  const [confidence, setConfidence] = useState(75);

  const toggleSymbol = (sym: string) => {
    setSelectedSymbols(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const toggleStrategy = (strat: string) => {
    setStrategies(prev =>
      prev.includes(strat) ? prev.filter(s => s !== strat) : [...prev, strat]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/90 z-[100]" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-[101] overflow-y-auto"
        style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #000 100%)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,0.95)', borderBottom: `1px solid ${accentColor}30` }}
        >
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-2xl" style={{ color: accentColor }}>
              ←
            </button>
            <h1
              className="text-2xl font-black tracking-wider"
              style={{ color: accentColor, textShadow: `0 0 15px ${accentColor}` }}
            >
              SMART
            </h1>
          </div>
          <button
            className="px-3 py-1 rounded-full text-xs"
            style={{ border: `1px solid ${accentColor}`, color: accentColor }}
          >
            ⚡ 34
          </button>
        </div>

        <div className="p-4 space-y-4 max-w-md mx-auto pb-32">
          {/* Account Stats */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid ${accentColor}40`,
              boxShadow: `0 0 20px ${accentColor}30`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl" style={{ color: accentColor }}>⚡</span>
                <div>
                  <p className="text-xs text-white/50 tracking-widest">LIVE ACCOUNT</p>
                  <p className="text-base font-bold text-white">{platform} CONNECTED</p>
                </div>
              </div>
              <span className="text-xs text-green-400">● IDLE</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <p className="text-[10px] text-white/50 tracking-widest">BALANCE</p>
                <p className="text-lg font-bold text-white">10133.10</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <p className="text-[10px] text-white/50 tracking-widest">EQUITY</p>
                <p className="text-lg font-bold text-white">10134.41</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <p className="text-[10px] text-white/50 tracking-widest">FLOATING P/L</p>
                <p className="text-lg font-bold text-green-400">+5.49</p>
              </div>
              <div className="rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <p className="text-[10px] text-white/50 tracking-widest">OPEN POSITIONS</p>
                <p className="text-lg font-bold text-white">0</p>
              </div>
            </div>
          </div>

          {/* Platform Toggle */}
          <div className="flex gap-2">
            {(['MT4', 'MT5'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className="flex-1 py-3 rounded-2xl text-sm font-bold transition"
                style={{
                  background: platform === p ? `${accentColor}20` : 'rgba(255,255,255,0.05)',
                  border: platform === p ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.1)',
                  color: platform === p ? accentColor : 'rgba(255,255,255,0.6)',
                  boxShadow: platform === p ? `0 0 20px ${accentColor}40` : undefined,
                }}
              >
                {p}
              </button>
            ))}
            <div className="flex items-center px-3 text-xs text-white/40">6/6</div>
          </div>

          {/* Symbols */}
          <div>
            <p className="text-xs text-white/50 tracking-widest mb-2">SYMBOLS</p>
            <div className="flex flex-wrap gap-2">
              {SYMBOLS.map((sym) => (
                <button
                  key={sym}
                  onClick={() => toggleSymbol(sym)}
                  className="px-4 py-2 rounded-full text-xs font-bold transition"
                  style={{
                    background: selectedSymbols.includes(sym) ? `${accentColor}30` : 'rgba(255,255,255,0.05)',
                    border: selectedSymbols.includes(sym) ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.1)',
                    color: selectedSymbols.includes(sym) ? accentColor : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          {/* Lot Size + Timeframe */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-white/50 tracking-widest mb-2">LOT SIZE</p>
              <input
                type="text"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/50 text-white text-sm"
                style={{ border: `1px solid rgba(255,255,255,0.1)` }}
              />
            </div>
            <div>
              <p className="text-xs text-white/50 tracking-widest mb-2">TIMEFRAME</p>
              <input
                type="text"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/50 text-white text-sm"
                style={{ border: `1px solid rgba(255,255,255,0.1)` }}
              />
            </div>
          </div>

          {/* Max Loss + Profit Target */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-white/50 tracking-widest mb-2">MAX DAILY LOSS</p>
              <input
                type="text"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/50 text-white text-sm"
                style={{ border: `1px solid rgba(255,255,255,0.1)` }}
              />
            </div>
            <div>
              <p className="text-xs text-white/50 tracking-widest mb-2">PROFIT TARGET</p>
              <input
                type="text"
                value={profitTarget}
                onChange={(e) => setProfitTarget(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/50 text-white text-sm"
                style={{ border: `1px solid rgba(255,255,255,0.1)` }}
              />
            </div>
          </div>

          {/* Max Trades Slider */}
          <div>
            <p className="text-xs text-white/50 tracking-widest mb-2">
              MAX CONCURRENT TRADES — {maxTrades}
            </p>
            <input
              type="range"
              min="1"
              max="10"
              value={maxTrades}
              onChange={(e) => setMaxTrades(Number(e.target.value))}
              className="w-full"
              style={{ accentColor: accentColor }}
            />
          </div>

          {/* Strategies */}
          <div>
            <p className="text-xs text-white/50 tracking-widest mb-2">STRATEGIES</p>
            <div className="flex flex-wrap gap-2">
              {STRATEGIES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStrategy(s)}
                  className="px-4 py-2 rounded-full text-xs font-bold transition"
                  style={{
                    background: strategies.includes(s) ? accentColor : 'rgba(255,255,255,0.05)',
                    color: strategies.includes(s) ? '#000' : 'rgba(255,255,255,0.7)',
                    border: strategies.includes(s) ? `1px solid ${accentColor}` : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Slider */}
          <div>
            <p className="text-xs text-white/50 tracking-widest mb-2">
              MIN CONFIDENCE — {confidence}%
            </p>
            <input
              type="range"
              min="50"
              max="100"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Tokens */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: `linear-gradient(135deg, ${accentColor}20, rgba(0,40,120,0.4))`,
              border: `1px solid ${accentColor}40`,
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60 tracking-widest">SMART TRADE TOKENS</p>
                <p className="text-sm text-white mt-1">34 tokens available</p>
              </div>
              <button
                className="px-4 py-2 rounded-full text-xs font-bold"
                style={{ background: accentColor, color: '#000' }}
              >
                UPGRADE
              </button>
            </div>
          </div>

          {/* START ENGINE */}
          <button
            className="w-full py-5 rounded-2xl font-black text-lg tracking-wider"
            style={{
              background: accentColor,
              color: '#000',
              boxShadow: `0 0 30px ${accentColor}80`,
            }}
          >
            ▶ START ENGINE
          </button>

          {/* Open Positions */}
          <div>
            <p className="text-xs text-white/50 tracking-widest mb-2">OPEN POSITIONS</p>
            <div
              className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <p className="text-white/40 text-sm">No open positions</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}