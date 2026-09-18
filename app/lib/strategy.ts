// Trading Strategy Engine
// Uses RSI + EMA + MACD to generate real signals

import { calculateRSI, calculateEMA, calculateMACD, Candle } from './indicators';

export type Signal = {
  action: 'BUY' | 'SELL' | 'WAIT';
  symbol: string;
  label: string;
  price: number;
  entry: string;
  tp: string;
  sl: string;
  confidence: number;
  reason: string;
  indicators: {
    rsi: number;
    ema50: number;
    ema200: number;
    macd: number;
    macdSignal: number;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
};

/**
 * Smart Money RSI Strategy
 *
 * BUY when:
 * - RSI < 35 (oversold)
 * - Price above EMA 200 (uptrend)
 * - MACD crosses above signal
 *
 * SELL when:
 * - RSI > 65 (overbought)
 * - Price below EMA 200 (downtrend)
 * - MACD crosses below signal
 *
 * Otherwise: WAIT
 */
export function generateSignal(
  candles: Candle[],
  symbol: string,
  label: string,
  decimals: number = 2
): Signal | null {
  if (candles.length < 200) {
    console.log(`Not enough candles for ${label}: ${candles.length}/200`);
    return null;
  }

  const closes = candles.map(c => c.close);
  const currentPrice = closes[closes.length - 1];

  // Calculate indicators
  const rsiValues = calculateRSI(closes, 14);
  const ema50Values = calculateEMA(closes, 50);
  const ema200Values = calculateEMA(closes, 200);
  const macdData = calculateMACD(closes);

  if (rsiValues.length === 0 || ema50Values.length === 0 || ema200Values.length === 0) {
    return null;
  }

  const rsi = rsiValues[rsiValues.length - 1];
  const ema50 = ema50Values[ema50Values.length - 1];
  const ema200 = ema200Values[ema200Values.length - 1];
  const macd = macdData.macd[macdData.macd.length - 1];
  const macdSignal = macdData.signal[macdData.signal.length - 1];
  const macdPrev = macdData.macd[macdData.macd.length - 2];
  const macdSignalPrev = macdData.signal[macdData.signal.length - 2];

  // Determine trend
  let trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL';
  if (currentPrice > ema200 && ema50 > ema200) trend = 'BULLISH';
  else if (currentPrice < ema200 && ema50 < ema200) trend = 'BEARISH';

  // MACD crossover
  const macdCrossedUp = macdPrev < macdSignalPrev && macd > macdSignal;
  const macdCrossedDown = macdPrev > macdSignalPrev && macd < macdSignal;

  // Signal logic
  let action: 'BUY' | 'SELL' | 'WAIT' = 'WAIT';
  let confidence = 0;
  let reason = '';

  // BUY conditions
  if (rsi < 35 && trend === 'BULLISH' && macdCrossedUp) {
    action = 'BUY';
    confidence = Math.min(95, 70 + (35 - rsi) * 2);
    reason = 'RSI oversold + bullish trend + MACD cross up';
  }
  // SELL conditions
  else if (rsi > 65 && trend === 'BEARISH' && macdCrossedDown) {
    action = 'SELL';
    confidence = Math.min(95, 70 + (rsi - 65) * 2);
    reason = 'RSI overbought + bearish trend + MACD cross down';
  }
  // Strong BUY (partial conditions)
  else if (rsi < 30 && trend === 'BULLISH') {
    action = 'BUY';
    confidence = 65;
    reason = 'Strong oversold + bullish trend';
  }
  // Strong SELL (partial conditions)
  else if (rsi > 70 && trend === 'BEARISH') {
    action = 'SELL';
    confidence = 65;
    reason = 'Strong overbought + bearish trend';
  }

  if (action === 'WAIT') {
    return {
      action: 'WAIT',
      symbol,
      label,
      price: currentPrice,
      entry: '—',
      tp: '—',
      sl: '—',
      confidence: 0,
      reason: 'No clear setup',
      indicators: {
        rsi,
        ema50,
        ema200,
        macd,
        macdSignal,
        trend,
      },
    };
  }

  // Calculate TP/SL based on volatility
  const atr = currentPrice * 0.003; // ~0.3% of price

  const entry = currentPrice;
  const tp = action === 'BUY' ? entry + atr * 3 : entry - atr * 3;
  const sl = action === 'BUY' ? entry - atr * 1.5 : entry + atr * 1.5;

  return {
    action,
    symbol,
    label,
    price: currentPrice,
    entry: entry.toFixed(decimals),
    tp: tp.toFixed(decimals),
    sl: sl.toFixed(decimals),
    confidence: Math.round(confidence),
    reason,
    indicators: {
      rsi: Math.round(rsi * 100) / 100,
      ema50: Math.round(ema50 * 100) / 100,
      ema200: Math.round(ema200 * 100) / 100,
      macd: Math.round(macd * 10000) / 10000,
      macdSignal: Math.round(macdSignal * 10000) / 10000,
      trend,
    },
  };
}

/**
 * Quick helper - check if a symbol has a valid signal
 */
export function hasSignal(signal: Signal | null): boolean {
  return signal !== null && signal.action !== 'WAIT';
}