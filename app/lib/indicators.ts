// Technical Indicators - RSI, EMA, MACD, ATR
// All calculations happen in the browser

export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

/**
 * EMA - Exponential Moving Average
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  
  const multiplier = 2 / (period + 1);
  const ema: number[] = [];
  
  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  ema.push(sum / period);
  
  // Calculate rest
  for (let i = period; i < prices.length; i++) {
    const value = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
    ema.push(value);
  }
  
  return ema;
}

/**
 * SMA - Simple Moving Average
 */
export function calculateSMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  
  const sma: number[] = [];
  for (let i = period - 1; i < prices.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += prices[j];
    }
    sma.push(sum / period);
  }
  return sma;
}

/**
 * RSI - Relative Strength Index
 * Returns values between 0-100
 * > 70 = overbought (SELL signal)
 * < 30 = oversold (BUY signal)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length < period + 1) return [];
  
  const rsi: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // First average gain/loss (SMA)
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;
  
  // First RSI value
  const rs = avgGain / (avgLoss || 0.0001);
  rsi.push(100 - (100 / (1 + rs)));
  
  // Calculate rest using smoothed averages
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs2 = avgGain / (avgLoss || 0.0001);
    rsi.push(100 - (100 / (1 + rs2)));
  }
  
  return rsi;
}

/**
 * MACD - Moving Average Convergence Divergence
 * MACD line = EMA12 - EMA26
 * Signal line = EMA9 of MACD
 * Histogram = MACD - Signal
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const emaFast = calculateEMA(prices, fastPeriod);
  const emaSlow = calculateEMA(prices, slowPeriod);
  
  // Align arrays (EMA slow starts later)
  const offset = slowPeriod - fastPeriod;
  const macdLine: number[] = [];
  
  for (let i = 0; i < emaSlow.length; i++) {
    macdLine.push(emaFast[i + offset] - emaSlow[i]);
  }
  
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histOffset = signalPeriod - 1;
  const histogram: number[] = [];
  
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push(macdLine[i + histOffset] - signalLine[i]);
  }
  
  return { macd: macdLine, signal: signalLine, histogram };
}

/**
 * ATR - Average True Range
 * Measures market volatility
 */
export function calculateATR(candles: Candle[], period: number = 14): number[] {
  if (candles.length < period + 1) return [];
  
  const trueRanges: number[] = [];
  
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }
  
  const atr: number[] = [];
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += trueRanges[i];
  }
  atr.push(sum / period);
  
  for (let i = period; i < trueRanges.length; i++) {
    atr.push((atr[atr.length - 1] * (period - 1) + trueRanges[i]) / period);
  }
  
  return atr;
}

/**
 * Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  multiplier: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const sma = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < sma.length; i++) {
    const slice = prices.slice(i, i + period);
    const mean = sma[i];
    const variance = slice.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    upper.push(mean + multiplier * stdDev);
    lower.push(mean - multiplier * stdDev);
  }
  
  return { upper, middle: sma, lower };
}