'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import SignalGenerator from '../components/SignalGenerator';
import RobotTerminal from '../components/RobotTerminal';

type LogLine = {
  id: string;
  text: string;
  type: 'info' | 'success' | 'signal' | 'error';
};

export default function StudentDashboard() {
  const [balance, setBalance] = useState('1000.00');
  const [equity, setEquity] = useState('1000.00');
  const [profit, setProfit] = useState('+0.00');
  const [isStarted, setIsStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<LogLine[]>([]);
  const [tradeCount, setTradeCount] = useState(0);
  const [mentorImage, setMentorImage] = useState<string | null>(null);
  const [mentorVideo, setMentorVideo] = useState<string | null>(null);
  const [mentorName, setMentorName] = useState('ROBOT');
  const [mentorTagline, setMentorTagline] = useState('Intelligent trading AI');

  // Fetch mentor data
  useEffect(() => {
    const fetchMentorMedia = async () => {
      try {
        const studentData = JSON.parse(localStorage.getItem('student_demo') || '{}');
        const mentorId = studentData.mentorId;
        if (!mentorId) return;

        const mediaDoc = await getDoc(doc(db, 'mentor_media', mentorId));

        if (mediaDoc.exists()) {
          const data = mediaDoc.data();
          if (data.imageUrl) setMentorImage(data.imageUrl);
          if (data.videoUrl) setMentorVideo(data.videoUrl);
          if (data.robotName) setMentorName(data.robotName);
          if (data.robotTagline) setMentorTagline(data.robotTagline);
        }
      } catch (error) {
        console.error('Error fetching mentor media:', error);
      }
    };

    fetchMentorMedia();
  }, []);

  // Balance updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 15;
      setBalance(prev => (parseFloat(prev) + change).toFixed(2));
      setEquity(prev => (parseFloat(prev) + change * 0.95).toFixed(2));

      const profitVal = (Math.random() * 30 - 10).toFixed(2);
      setProfit((parseFloat(profitVal) >= 0 ? '+' : '') + profitVal);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Log helper
  const addLog = (text: string, type: LogLine['type'] = 'info') => {
    const newLog: LogLine = {
      id: Math.random().toString(36).substring(7) + Date.now(),
      text,
      type,
    };
    setTerminalLogs(prev => [newLog, ...prev].slice(0, 30));
  };

  // Handle incoming signal from generator
  const handleSignal = (signal: any) => {
    addLog(`NEW SIGNAL: ${signal.symbol} ${signal.type}`, 'signal');

    setTimeout(() => {
      addLog(`OPEN ${signal.type}: ${signal.symbol} ${signal.volume}`, 'info');
    }, 800);

    setTimeout(() => {
      addLog(`TP: ${signal.tp} | SL: ${signal.sl}`, 'info');
    }, 1600);

    setTimeout(() => {
      addLog(`SENDING 4 TRADES TO MT5...`, 'info');
    }, 2400);

    setTimeout(() => {
      addLog(`4/4 TRADES EXECUTED ON MT5`, 'success');
      setTradeCount(prev => prev + 1);
    }, 3200);
  };

  // Handle START/STOP
  const handleToggle = () => {
    if (!isStarted) {
      setIsStarted(true);
      addLog('SERVER CONNECTED', 'success');
      setTimeout(() => addLog('SCANNING MARKETS...', 'info'), 500);
      setTimeout(() => addLog('READY TO TRADE', 'info'), 1200);
    } else {
      setIsStarted(false);
      addLog('ROBOT STOPPED', 'error');
    }
  };

  return (
    <div className="min-h-screen text-white relative">
      {/* Background */}
      {mentorVideo ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-0"
          src={mentorVideo}
        />
      ) : mentorImage ? (
        <div
          className="fixed inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mentorImage})` }}
        />
      ) : (
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-red-900/40 via-black to-black" />
      )}

      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/70 z-0" />

      {/* Signal Generator (hidden) */}
      <SignalGenerator isActive={isStarted} onSignal={handleSignal} />

      {/* Content wrapper */}
      <div className="relative z-10">
        <header className="bg-black/60 backdrop-blur-md border-b border-red-500/20 px-4 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
          <div className="text-lg font-bold text-red-500">NOVA EA</div>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? '🟢 Online' : '🔴 Offline'}
            </span>
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
          </div>
        </header>

        <div className="pt-20 pb-28 px-4 max-w-md mx-auto">
          <div className={`p-2 rounded-lg text-center text-xs mb-3 backdrop-blur-md ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {isConnected ? '✅ Connected to trading server' : '❌ Disconnected - Reconnecting...'}
          </div>

          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-gray-400">Trades today: {tradeCount}</span>
            <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
          </div>

          {/* Robot Card */}
          <div className="relative bg-black/60 backdrop-blur-md border border-red-500/20 rounded-xl mb-4 glow-red overflow-hidden h-20">
            {mentorImage && (
              <img
                src={mentorImage}
                alt="Card Background"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 flex items-center gap-4 h-full px-4">
              <div className="w-14 h-14 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                {mentorImage ? (
                  <img src={mentorImage} alt="Robot" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-red-500">AI</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-white truncate drop-shadow-lg">{mentorName}</h2>
                <p className="text-xs text-gray-100 truncate drop-shadow-lg">{mentorTagline}</p>
              </div>
            </div>
          </div>

          {/* Balance/Equity/Profit */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-black/60 backdrop-blur-md border border-red-500/20 rounded-xl p-3 text-center glow-red">
              <p className="text-xs text-gray-400">BALANCE</p>
              <p className="text-lg font-bold text-white">R{balance}</p>
            </div>
            <div className="bg-black/60 backdrop-blur-md border border-red-500/20 rounded-xl p-3 text-center glow-red">
              <p className="text-xs text-gray-400">EQUITY</p>
              <p className="text-lg font-bold text-white">R{equity}</p>
            </div>
            <div className="bg-black/60 backdrop-blur-md border border-red-500/20 rounded-xl p-3 text-center glow-red">
              <p className="text-xs text-gray-400">PROFIT</p>
              <p className={`text-lg font-bold ${profit.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                R{profit}
              </p>
            </div>
          </div>

          {/* Robot Terminal */}
          <div className="mb-4">
            <RobotTerminal logs={terminalLogs} isActive={isStarted} />
          </div>

          {/* Status */}
          <div className={`rounded-xl p-3 mb-4 backdrop-blur-md ${isStarted ? 'bg-green-500/20 border border-green-500/30' : 'bg-yellow-500/20 border border-yellow-500/30'}`}>
            {isStarted ? (
              <p className="text-green-400 text-sm">✅ Robot is active - Receiving trades</p>
            ) : (
              <p className="text-yellow-400 text-sm">⚠️ Press START to begin receiving trades</p>
            )}
          </div>

          {/* START/STOP */}
          <div className="mb-4">
            <button
              onClick={handleToggle}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg transition ${
                isStarted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isStarted ? 'STOP' : 'START'}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mb-4">Powered by NOVA EA</p>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-red-500/20 flex justify-around items-center py-3 z-50">
          <Link href="/student" className="text-gray-500 text-xs flex flex-col items-center hover:text-red-400 transition">
            <span className="text-xl">⚡</span>
            <span>SMART</span>
          </Link>
          <Link href="/student/metatrader" className="text-gray-500 text-xs flex flex-col items-center hover:text-red-400 transition">
            <span className="text-xl">📈</span>
            <span>MT5</span>
          </Link>
          <Link href="/student" className="text-red-500 text-xs flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center border-4 border-black -mt-6">
              <span className="text-2xl">🏠</span>
            </div>
            <span className="mt-1">HOME</span>
          </Link>
          <Link href="/student" className="text-gray-500 text-xs flex flex-col items-center hover:text-red-400 transition">
            <span className="text-xl">📊</span>
            <span>SCANNER</span>
          </Link>
          <Link href="/student/settings" className="text-gray-500 text-xs flex flex-col items-center hover:text-red-400 transition">
            <span className="text-xl">⚙️</span>
            <span>SETTINGS</span>
          </Link>
        </div>
      </div>
    </div>
  );
}