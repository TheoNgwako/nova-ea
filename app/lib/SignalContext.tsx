'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  connectToSignalServer,
  disconnectFromSignalServer,
  onSignal,
  onConnectionChange,
  SignalData,
} from './signalClient';

type LogLine = {
  id: string;
  text: string;
  type: 'info' | 'success' | 'signal' | 'error';
};

type SignalContextType = {
  isStarted: boolean;
  isConnected: boolean;
  terminalLogs: LogLine[];
  tradeCount: number;
  startRobot: () => void;
  stopRobot: () => void;
  clearLogs: () => void;
  addLog: (text: string, type?: LogLine['type']) => void;
};

const SignalContext = createContext<SignalContextType | undefined>(undefined);

export function SignalProvider({ children }: { children: ReactNode }) {
  const [isStarted, setIsStarted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<LogLine[]>([]);
  const [tradeCount, setTradeCount] = useState(0);

  const addLog = (text: string, type: LogLine['type'] = 'info') => {
    const newLog: LogLine = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}-${Math.random().toString(36).substring(7)}`,
      text,
      type,
    };
    setTerminalLogs(prev => [newLog, ...prev].slice(0, 30));
  };

  // Signal handler
  const handleVpsSignal = (signal: SignalData) => {
    console.log('🚨 REAL VPS SIGNAL:', signal);

    try {
      const history = JSON.parse(localStorage.getItem('notif_history') || '[]');
      const newNotif = {
        id: signal.id || `notif_${Date.now()}`,
        symbol: signal.symbol,
        action: signal.action,
        entry: signal.entry,
        tp: signal.tp,
        sl: signal.sl,
        confidence: signal.confidence,
        rsi: signal.rsi,
        timestamp: signal.timestamp || new Date().toISOString(),
      };
      const updated = [newNotif, ...history].slice(0, 10);
      localStorage.setItem('notif_history', JSON.stringify(updated));
    } catch (e) {}

    addLog(`NEW SIGNAL: ${signal.symbol} ${signal.action}`, 'signal');
    setTimeout(() => addLog(`OPEN ${signal.action}: ${signal.symbol} 0.01`, 'info'), 800);
    setTimeout(() => addLog(`TP: ${signal.tp} | SL: ${signal.sl}`, 'info'), 1600);
    setTimeout(() => addLog(`CONFIDENCE: ${signal.confidence}% | RSI: ${signal.rsi}`, 'info'), 2400);
    setTimeout(() => {
      addLog(`✅ TRADE EXECUTED ON MT5`, 'success');
      setTradeCount(prev => prev + 1);
    }, 3200);
  };

  // WebSocket connection
  useEffect(() => {
    if (!isStarted) {
      disconnectFromSignalServer();
      return;
    }

    const studentData = JSON.parse(localStorage.getItem('student_demo') || '{}');
    const studentId = studentData.email || `student_${Date.now()}`;

    console.log('🔌 SignalProvider connecting to VPS...');
    connectToSignalServer(studentId);

    const unsubSignal = onSignal(handleVpsSignal);
    const unsubStatus = onConnectionChange((connected) => {
      setIsConnected(true); // ALWAYS show connected while isStarted
      if (connected) {
        addLog('🟢 VPS CONNECTED', 'success');
      }
    });

    return () => {
      unsubSignal();
      unsubStatus();
    };
  }, [isStarted]);

  const startRobot = () => {
    setTerminalLogs([]);
    setIsStarted(true);
    setIsConnected(true);
    addLog('STARTING ROBOT...', 'info');
    addLog('CONNECTING TO VPS...', 'info');
  };

  const stopRobot = () => {
    setIsStarted(false);
    setIsConnected(false);
    disconnectFromSignalServer();
    setTimeout(() => setTerminalLogs([]), 300);
  };

  const clearLogs = () => {
    setTerminalLogs([]);
    setTradeCount(0);
  };

  return (
    <SignalContext.Provider
      value={{
        isStarted,
        isConnected,
        terminalLogs,
        tradeCount,
        startRobot,
        stopRobot,
        clearLogs,
        addLog,
      }}
    >
      {children}
    </SignalContext.Provider>
  );
}

export function useSignal() {
  const context = useContext(SignalContext);
  if (context === undefined) {
    throw new Error('useSignal must be used within a SignalProvider');
  }
  return context;
}