'use client';

import { useState, useEffect, useRef } from 'react';

type LogLine = {
  id: string;
  text: string;
  type: 'info' | 'success' | 'signal' | 'error';
};

type FloatingTerminalProps = {
  isOpen: boolean;
  onClose: () => void;
  logs: LogLine[];
  mentorName: string;
  accentColor: string;
};

export default function FloatingTerminal({
  isOpen,
  onClose,
  logs,
  mentorName,
  accentColor,
}: FloatingTerminalProps) {
  const [displayedLogs, setDisplayedLogs] = useState<LogLine[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [queue, setQueue] = useState<LogLine[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Queue new logs
  useEffect(() => {
    if (logs.length > 0) {
      const latestLog = logs[0];
      setQueue(prev => {
        const exists = prev.some(l => l.id === latestLog.id);
        const alreadyDisplayed = displayedLogs.some(l => l.id === latestLog.id);
        if (exists || alreadyDisplayed) return prev;
        return [...prev, latestLog];
      });
    }
  }, [logs, displayedLogs]);

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
        setDisplayedLogs(prev => [...prev, nextLog].slice(-20));
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

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = {
      x: clientX,
      y: clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    setPosition({
      x: dragStart.current.posX + dx,
      y: dragStart.current.posY + dy,
    });
  };

  const handleDragEnd = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [dragging]);

  const getColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'signal': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-green-300';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed z-[80] w-[320px] max-w-[90vw] select-none"
      style={{
        top: '100px',
        left: '50%',
        transform: `translate(calc(-50% + ${position.x}px), ${position.y}px)`,
        touchAction: 'none',
      }}
    >
      <div
        className="rounded-2xl overflow-hidden backdrop-blur-md"
        style={{
          background: 'rgba(0,0,0,0.95)',
          border: `1.5px solid ${accentColor}`,
          boxShadow: `0 0 40px ${accentColor}80, 0 0 80px ${accentColor}40`,
        }}
      >
        {/* Header - Draggable */}
        <div
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing"
          style={{
            background: `linear-gradient(90deg, ${accentColor}30, transparent)`,
            borderBottom: `1px solid ${accentColor}40`,
          }}
        >
          <div className="flex items-center gap-2">
            {/* Drag handle dots */}
            <div className="flex flex-col gap-0.5 opacity-50">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-0.5 rounded-full bg-white" />
                <div className="w-0.5 h-0.5 rounded-full bg-white" />
              </div>
              <div className="flex gap-0.5">
                <div className="w-0.5 h-0.5 rounded-full bg-white" />
                <div className="w-0.5 h-0.5 rounded-full bg-white" />
              </div>
              <div className="flex gap-0.5">
                <div className="w-0.5 h-0.5 rounded-full bg-white" />
                <div className="w-0.5 h-0.5 rounded-full bg-white" />
              </div>
            </div>
            <span
              className="text-xs font-bold tracking-wider"
              style={{ color: accentColor }}
            >
              {mentorName.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Green dot - Connected */}
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] text-green-400">CONNECTED</span>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
              style={{
                background: `${accentColor}30`,
                color: accentColor,
                border: `1px solid ${accentColor}60`,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Terminal Content */}
        <div
          ref={scrollRef}
          className="p-3 h-44 overflow-y-auto font-mono"
          style={{ background: 'rgba(0,10,30,0.95)' }}
        >
          {displayedLogs.length === 0 && !currentText && (
            <p className="text-gray-500 text-[10px]">Initializing...</p>
          )}

          {displayedLogs.map((log) => (
            <div
              key={log.id}
              className={`${getColor(log.type)} text-[10px] leading-tight flex gap-1 mb-0.5`}
            >
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
    </div>
  );
}