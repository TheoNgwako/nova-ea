// NOVA EA - Signal Client (FIXED VERSION)

const VPS_WS_URL = 'wss://signals.novamobiles.co.za';

export type SignalData = {
  id: string;
  action: 'BUY' | 'SELL';
  symbol: string;
  price: number;
  entry: string;
  tp: string;
  sl: string;
  confidence: number;
  reason: string;
  rsi: number;
  trend: string;
  timestamp: string;
};

let ws: WebSocket | null = null;
let listeners: ((signal: SignalData) => void)[] = [];
let statusListeners: ((connected: boolean) => void)[] = [];
let currentStudentId: string = '';
let shouldReconnect: boolean = false;
let reconnectTimer: NodeJS.Timeout | null = null;

export function connectToSignalServer(studentId: string) {
  // Prevent duplicate connections
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    console.log('⚠️ Already connected or connecting');
    return;
  }

  currentStudentId = studentId;
  shouldReconnect = true;

  try {
    console.log('🔌 Connecting to VPS...', studentId);
    ws = new WebSocket(`${VPS_WS_URL}?studentId=${encodeURIComponent(studentId)}`);

    ws.onopen = () => {
      console.log('🟢 Connected to NOVA EA signal server');
      statusListeners.forEach(l => l(true));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'SIGNAL') {
          console.log('🚨 SIGNAL:', msg.data);
          listeners.forEach(l => l(msg.data));
        }
      } catch (e) {}
    };

    ws.onclose = () => {
      console.log('🔴 Disconnected');
      statusListeners.forEach(l => l(false));
      ws = null;

      // Only reconnect if we should
      if (shouldReconnect && currentStudentId) {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
          if (shouldReconnect) {
            console.log('🔄 Reconnecting...');
            connectToSignalServer(currentStudentId);
          }
        }, 5000);
      }
    };

    ws.onerror = () => {
      // Silent error handling - close will fire
    };
  } catch (err) {
    console.error('Connection error:', err);
  }
}

export function disconnectFromSignalServer() {
  console.log('🛑 Disconnecting (manual)');
  shouldReconnect = false;
  currentStudentId = '';

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (ws) {
    ws.close();
    ws = null;
  }
}

export function onSignal(callback: (signal: SignalData) => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
}

export function onConnectionChange(callback: (connected: boolean) => void) {
  statusListeners.push(callback);
  return () => {
    statusListeners = statusListeners.filter(l => l !== callback);
  };
}