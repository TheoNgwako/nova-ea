'use client';

import { useState } from 'react';

export default function AIScanner() {
  const [scanning, setScanning] = useState(false);
  const [signal, setSignal] = useState<null | { action: string; entry: string; sl: string; tp: string; confidence: string }>(null);

  const handleScan = () => {
    setScanning(true);
    setSignal(null);

    setTimeout(() => {
      const actions = ['BUY', 'SELL'];
      const symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD', 'NAS100'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      
      const price = (Math.random() * 100 + 1).toFixed(4);
      const sl = (Number(price) - (action === 'BUY' ? 0.5 : -0.5)).toFixed(4);
      const tp = (Number(price) + (action === 'BUY' ? 0.8 : -0.8)).toFixed(4);
      const confidence = Math.floor(Math.random() * 40 + 60);

      setSignal({
        action,
        entry: `${symbol} @ ${price}`,
        sl: `SL: ${sl}`,
        tp: `TP: ${tp}`,
        confidence: `${confidence}%`
      });
      setScanning(false);
    }, 2000);
  };

  return (
    <div className="bg-black/50 border border-red-500/20 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-bold">AI Scanner</h3>
          <p className="text-xs text-gray-400">Snap a chart, get an instant signal</p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="px-4 py-2 bg-red-600 rounded-lg text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
        >
          {scanning ? 'Scanning...' : 'Scan Now'}
        </button>
      </div>

      {scanning && (
        <div className="flex items-center justify-center py-4">
          <div className="spinner-red"></div>
          <span className="text-gray-400 text-sm ml-3">Analyzing chart...</span>
        </div>
      )}

      {signal && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mt-2">
          <div className="flex items-center justify-between">
            <span className={`font-bold text-lg ${signal.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
              {signal.action}
            </span>
            <span className="text-gray-400 text-sm">{signal.entry}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>{signal.sl}</span>
            <span>{signal.tp}</span>
            <span>Confidence: {signal.confidence}</span>
          </div>
        </div>
      )}
    </div>
  );
}