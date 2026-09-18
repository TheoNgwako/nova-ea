// Twelve Data API - Live market prices
// Free tier: 800 calls/day, 8 calls/minute

const API_KEY = process.env.NEXT_PUBLIC_TWELVE_DATA_KEY || '';
const BASE_URL = 'https://api.twelvedata.com';

// Supported pairs
export const PAIRS = [
  { symbol: 'XAU/USD', label: 'XAUUSD', decimals: 2 },
  { symbol: 'EUR/USD', label: 'EURUSD', decimals: 5 },
  { symbol: 'GBP/USD', label: 'GBPUSD', decimals: 5 },
  { symbol: 'BTC/USD', label: 'BTCUSD', decimals: 2 },
  { symbol: 'US30', label: 'US30', decimals: 2 },
  { symbol: 'NDX', label: 'NAS100', decimals: 2 },
];

// Cache to save API calls
type CacheEntry = {
  price: number;
  timestamp: number;
};

const priceCache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 60 * 1000; // 60 seconds

export type PriceData = {
  symbol: string;
  label: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: number;
};

/**
 * Get live price for a symbol
 */
export async function getLivePrice(pairSymbol: string): Promise<number | null> {
  const now = Date.now();

  // Return cached if fresh
  if (priceCache[pairSymbol] && now - priceCache[pairSymbol].timestamp < CACHE_DURATION) {
    return priceCache[pairSymbol].price;
  }

  try {
    const url = `${BASE_URL}/price?symbol=${pairSymbol}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.price) {
      const price = parseFloat(data.price);
      priceCache[pairSymbol] = { price, timestamp: now };
      return price;
    }

    console.error('Twelve Data error:', data);
    return null;
  } catch (error) {
    console.error('Price fetch error:', error);
    return null;
  }
}

/**
 * Get full quote (open, high, low, close, change)
 */
export async function getFullQuote(pairSymbol: string): Promise<PriceData | null> {
  try {
    const url = `${BASE_URL}/quote?symbol=${pairSymbol}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data && data.close) {
      return {
        symbol: pairSymbol,
        label: pairSymbol.replace('/', ''),
        price: parseFloat(data.close),
        change: parseFloat(data.change || '0'),
        changePercent: parseFloat(data.percent_change || '0'),
        high: parseFloat(data.high || '0'),
        low: parseFloat(data.low || '0'),
        open: parseFloat(data.open || '0'),
        previousClose: parseFloat(data.previous_close || '0'),
        timestamp: Date.now(),
      };
    }

    console.error('Quote error:', data);
    return null;
  } catch (error) {
    console.error('Quote fetch error:', error);
    return null;
  }
}

/**
 * Get historical candles for indicators
 * Returns last N candles for a timeframe
 */
export async function getCandles(
  pairSymbol: string,
  interval: string = '5min',
  outputsize: number = 100
): Promise<{ time: string; open: number; high: number; low: number; close: number; volume: number }[]> {
  try {
    const url = `${BASE_URL}/time_series?symbol=${pairSymbol}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.values && Array.isArray(data.values)) {
      return data.values.map((v: any) => ({
        time: v.datetime,
        open: parseFloat(v.open),
        high: parseFloat(v.high),
        low: parseFloat(v.low),
        close: parseFloat(v.close),
        volume: parseFloat(v.volume || '0'),
      })).reverse(); // Oldest first
    }

    console.error('Candles error:', data);
    return [];
  } catch (error) {
    console.error('Candles fetch error:', error);
    return [];
  }
}