'use client';

import { useEffect, useRef } from 'react';
import { PAIRS, getCandles, getLivePrice } from '../lib/marketData';
import { generateSignal, Signal } from '../lib/strategy';

type SignalGeneratorProps = {
  isActive: boolean;
  onSignal: (signal: {
    type: 'BUY' | 'SELL';
    symbol: string;
    volume: string;
    entry: string;
    tp: string;
    sl: string;
  }) => void;
};

export default function SignalGenerator({ isActive, onSignal }: SignalGeneratorProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSignalsRef = useRef<Record<string, number>>({});
  const activePairsRef = useRef<string[]>(['XAU/USD', 'EUR/USD', 'GBP/USD', 'BTC/USD']);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log('🚀 Signal Generator started');

    const scanMarkets = async () => {
      console.log('🔍 Scanning markets...');

      // Only scan selected pairs
      const pairsToScan = PAIRS.filter(p => activePairsRef.current.includes(p.symbol));

      for (const pair of pairsToScan) {
        try {
          // Get candles for analysis
          const candles = await getCandles(pair.symbol, '5min', 200);

          if (candles.length < 200) {
            console.log(`⏳ ${pair.label}: Not enough data (${candles.length}/200)`);
            continue;
          }

          // Generate signal
          const signal: Signal | null = generateSignal(
            candles,
            pair.symbol,
            pair.label,
            pair.decimals
          );

          if (!signal) continue;

          console.log(`📊 ${pair.label}: ${signal.action} (RSI: ${signal.indicators.rsi}, Confidence: ${signal.confidence}%)`);

          // Only send BUY/SELL signals
          if (signal.action !== 'WAIT' && signal.confidence >= 60) {
            // Cooldown - 5 minutes per pair
            const now = Date.now();
            const lastSignalTime = lastSignalsRef.current[pair.symbol] || 0;
            const cooldownMs = 5 * 60 * 1000;

            if (now - lastSignalTime < cooldownMs) {
              console.log(`⏸️ ${pair.label}: Cooldown active`);
              continue;
            }

            lastSignalsRef.current[pair.symbol] = now;

            // Send signal
            onSignal({
              type: signal.action as 'BUY' | 'SELL',
              symbol: signal.label,
              volume: '0.01',
              entry: signal.entry,
              tp: signal.tp,
              sl: signal.sl,
            });

            console.log(`✅ SIGNAL SENT: ${signal.action} ${pair.label} @ ${signal.entry}`);
          }
        } catch (error) {
          console.error(`Error scanning ${pair.label}:`, error);
        }

        // Small delay between pairs to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    };

    // First scan after 5 seconds
    const initialTimeout = setTimeout(scanMarkets, 5000);

    // Then scan every 60 seconds
    intervalRef.current = setInterval(scanMarkets, 60000);

    return () => {
      if (initialTimeout) clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, onSignal]);

  return null;
}