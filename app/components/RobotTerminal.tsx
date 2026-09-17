'use client';

import { useState, useEffect, useRef } from 'react';

type LogLine = {
  id: string;
  text: string;
  type: 'info' | 'success' | 'signal' | 'error';
};

type RobotTerminalProps = {
  logs: LogLine[];
  isActive: boolean;
};

export default function RobotTerminal({ logs, isActive }: RobotTerminalProps) {
  const [displayedLogs, setDisplayedLogs] = useState<LogLine[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [queue, setQueue] = useState<LogLine[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Queue new logs
  useEffect(() => {
    if (logs.length > 0) {
      setQueue(prev => [...prev, logs[0]]);
    }
  }, [logs]);

  // Typewriter effect
  useEffect(() => {
    if (queue.length === 0) return;

    const nextLog = queue[0];
    let i = 0;
    setCurrentText('');

    const interval = setInterval(() => {
      if (i <= nextLog.text.length) {
        setCurrentText(nextLog.text.substring(0, i));
        i++;
      } else {
        clearInterval(interval);
        setDisplayedLogs(prev => [...prev, nextLog].slice(-15));
        setCurrentText('');
        setQueue(prev => prev.slice(1));
      }
    }, 25);

    return () => clearInterval(interval);
  }, [queue]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [displayedLogs, currentText]);

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'signal': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-green-300';
    }
  };

  return (
    <div className="bg-black/90 border border-green-500/30 rounded-xl p-3 font-mono text-xs backdrop-blur-md">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-green-500/20">
        <span className="text-green-400 font-bold text-[10px]">TERMINAL</span>
        <span className={`text-[10px] ${isActive ? 'text-green-400' : 'text-gray-500'}`}>
          {isActive ? '● LIVE' : '○ IDLE'}
        </span>
      </div>

      <div ref={scrollRef} className="space-y-0.5 h-32 overflow-y-auto">
        {displayedLogs.length === 0 && !currentText && (
          <p className="text-gray-600 text-[10px]">Waiting for signals...</p>
        )}

        {displayedLogs.map((log) => (
          <div key={log.id} className={`${getColor(log.type)} text-[10px] leading-tight flex gap-1`}>
            <span className="text-green-600 flex-shrink-0">&gt;</span>
            <span>{log.text}</span>
          </div>
        ))}

        {currentText && (
          <div className="text-green-300 text-[10px] leading-tight flex gap-1">
            <span className="text-green-600 flex-shrink-0">&gt;</span>
            <span>
              {currentText}
              <span className="animate-pulse">█</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}