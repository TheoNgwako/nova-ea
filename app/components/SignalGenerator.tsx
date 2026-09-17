'use client';

import { useEffect } from 'react';

type Signal = {
  type: 'BUY' | 'SELL';
  symbol: string;
  volume: string;
  entry: string;
  tp: string;
  sl: string;
};

type SignalGeneratorProps = {
  isActive: boolean;
  onSignal: (signal: Signal) => void;
};

export default function SignalGenerator({ isActive, onSignal }: SignalGeneratorProps) {
  useEffect(() => {
    if (!isActive) return;

    const pairs = [
      { symbol: 'XAUUSD', basePrice: 4288.4, volatility: 5, decimals: 1 },
      { symbol: 'EURUSD', basePrice: 1.0842, volatility: 0.005, decimals: 4 },
      { symbol: 'GBPUSD', basePrice: 1.2648, volatility: 0.008, decimals: 4 },
      { symbol: 'BTCUSD', basePrice: 62500, volatility: 500, decimals: 1 },
      { symbol: 'NAS100', basePrice: 18450, volatility: 50, decimals: 1 },
      { symbol: 'US30', basePrice: 38200, volatility: 100, decimals: 1 },
    ];

    const generateSignal = () => {
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const type: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'BUY' : 'SELL';

      const fluctuation = (Math.random() - 0.5) * pair.volatility;
      const entry = pair.basePrice + fluctuation;

      const slDistance = pair.volatility * 2;
      const tpDistance = pair.volatility * 3;

      const sl = type === 'BUY' ? entry - slDistance : entry + slDistance;
      const tp = type === 'BUY' ? entry + tpDistance : entry - tpDistance;

      const signal: Signal = {
        type,
        symbol: pair.symbol,
        volume: '0.01',
        entry: entry.toFixed(pair.decimals),
        tp: tp.toFixed(pair.decimals),
        sl: sl.toFixed(pair.decimals),
      };

      onSignal(signal);
    };

    const initialTimeout = setTimeout(generateSignal, 5000);
    const interval = setInterval(generateSignal, 20000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isActive, onSignal]);

  return null;
}