'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  const [balance, setBalance] = useState('0.00');
  const [equity, setEquity] = useState('0.00');
  const [profit, setProfit] = useState('+0.00');

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-black/80 border-b border-red-500/20 px-4 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <div className="text-lg font-bold text-red-500">NOVA EA</div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">Student</span>
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
        </div>
      </header>

      <div className="pt-20 pb-24 px-4 max-w-md mx-auto">
        <div className="bg-black/50 border border-red-500/20 rounded-xl p-4 mb-4 glow-red">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center text-2xl font-bold text-red-500">
              AI
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">ZETAVIA AI</h2>
              <p className="text-xs text-gray-400">Intelligent, disciplined, and precise forex trading AI</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-black/50 border border-red-500/20 rounded-xl p-3 text-center glow-red">
            <p className="text-xs text-gray-400">BALANCE</p>
            <p className="text-lg font-bold text-white">R{balance}</p>
          </div>
          <div className="bg-black/50 border border-red-500/20 rounded-xl p-3 text-center glow-red">
            <p className="text-xs text-gray-400">EQUITY</p>
            <p className="text-lg font-bold text-white">R{equity}</p>
          </div>
          <div className="bg-black/50 border border-red-500/20 rounded-xl p-3 text-center glow-red">
            <p className="text-xs text-gray-400">PROFIT</p>
            <p className={`text-lg font-bold ${profit.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
              R{profit}
            </p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
          <p className="text-yellow-400 text-sm">Please add trading pairs to receive trades</p>
          <p className="text-yellow-400 text-sm">Copy trading is not started. Press START to begin receiving trades</p>
        </div>

        <div className="flex gap-3 mb-4">
          <button className="flex-1 px-4 py-3 border border-red-500/50 rounded-lg text-red-400 text-sm font-semibold hover:bg-red-500/10 transition">
            PAIRS
          </button>
          <button className="flex-1 px-4 py-3 bg-red-600 rounded-lg text-white text-sm font-semibold hover:bg-red-700 transition">
            START
          </button>
          <button className="flex-1 px-4 py-3 border border-red-500/50 rounded-lg text-red-400 text-sm font-semibold hover:bg-red-500/10 transition">
            LOGS
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mb-4">Powered by EAConnect</p>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-4 mb-4 hover:border-red-500/50 transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold">AI Scanner</h3>
              <p className="text-xs text-gray-400">Snap a chart, get an instant signal</p>
            </div>
            <div className="text-red-500 text-xl">+</div>
          </div>
        </div>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold">Robot List</h3>
              <p className="text-xs text-gray-400">ZETAVIA AI</p>
            </div>
            <button className="px-3 py-1 border border-red-500/50 rounded-lg text-red-400 text-xs hover:bg-red-500/10 transition">
              Add New
            </button>
          </div>
        </div>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-4 hover:border-red-500/50 transition cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold">AI Voice Assistant</h3>
              <p className="text-xs text-gray-400">Tap to ask about your bot</p>
            </div>
            <div className="text-red-500 text-xl">+</div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-red-500/20 flex justify-around py-3">
        <Link href="/student/metatrader" className="text-gray-500 text-xs flex flex-col items-center hover:text-red-400 transition">
          <span className="text-xl">●</span>
          <span>Metatrader</span>
        </Link>
        <Link href="/student" className="text-red-500 text-xs flex flex-col items-center">
          <span className="text-xl">○</span>
          <span>Home</span>
        </Link>
        <Link href="/student/settings" className="text-gray-500 text-xs flex flex-col items-center hover:text-red-400 transition">
          <span className="text-xl">⚙</span>
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}