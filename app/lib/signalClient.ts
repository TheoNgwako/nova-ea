import { auth } from './firebase';

// PIXEL FORGE - Secure Signal Client

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

let currentStudentId = '';
let shouldReconnect = false;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

export async function connectToSignalServer(studentId: string) {
  if (
    ws &&
    (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING
    )
  ) {
    console.log('⚠️ Already connected or connecting');
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    console.warn('WebSocket connection blocked: user not signed in');
    return;
  }

  if (user.uid !== studentId) {
    console.warn('WebSocket connection blocked: student mismatch');
    return;
  }

  currentStudentId = studentId;
  shouldReconnect = true;

  try {
    const idToken = await user.getIdToken();

    if (!idToken) {
      throw new Error('Could not obtain Firebase ID token');
    }

    console.log('🔌 Connecting securely to PIXEL FORGE VPS...');

    /*
     * Browser WebSockets cannot send a normal Authorization header.
     * We send the Firebase ID token as a WebSocket subprotocol instead.
     *
     * The VPS must verify this token with Firebase Admin and derive
     * the student UID from the verified token.
     */
    ws = new WebSocket(
      VPS_WS_URL,
      [
        'pixel-forge-v1',
        `firebase.${idToken}`
      ]
    );

    ws.onopen = () => {
      console.log('🟢 Secure PIXEL FORGE WebSocket connected');

      statusListeners.forEach(listener =>
        listener(true)
      );
    };

    ws.onmessage = event => {
      try {
        const msg = JSON.parse(event.data);

        if (msg.type !== 'SIGNAL') {
          return;
        }

        const signal = msg.data;

        if (
          !signal ||
          typeof signal !== 'object' ||
          !signal.symbol ||
          !signal.action ||
          (
            signal.action !== 'BUY' &&
            signal.action !== 'SELL'
          )
        ) {
          console.warn(
            'Ignored invalid signal payload:',
            msg
          );

          return;
        }

        console.log(
          '🚨 SIGNAL:',
          signal
        );

        listeners.forEach(listener =>
          listener(signal as SignalData)
        );
      } catch (error) {
        console.warn(
          'Ignored invalid WebSocket message:',
          error
        );
      }
    };

    ws.onclose = () => {
      console.log('🔴 WebSocket disconnected');

      statusListeners.forEach(listener =>
        listener(false)
      );

      ws = null;

      if (
        shouldReconnect &&
        currentStudentId
      ) {
        if (reconnectTimer) {
          clearTimeout(reconnectTimer);
        }

        reconnectTimer = setTimeout(() => {
          if (shouldReconnect) {
            console.log('🔄 Reconnecting securely...');

            void connectToSignalServer(
              currentStudentId
            );
          }
        }, 5000);
      }
    };

    ws.onerror = () => {
      // onclose handles reconnect logic
    };

  } catch (error) {
    console.error(
      'Secure WebSocket connection error:',
      error
    );

    if (
      shouldReconnect &&
      currentStudentId
    ) {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      reconnectTimer = setTimeout(() => {
        if (shouldReconnect) {
          void connectToSignalServer(
            currentStudentId
          );
        }
      }, 5000);
    }
  }
}

export function disconnectFromSignalServer() {
  console.log('🛑 Disconnecting WebSocket');

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

  statusListeners.forEach(listener =>
    listener(false)
  );
}

export function onSignal(
  callback: (signal: SignalData) => void
) {
  listeners.push(callback);

  return () => {
    listeners = listeners.filter(
      listener => listener !== callback
    );
  };
}

export function onConnectionChange(
  callback: (connected: boolean) => void
) {
  statusListeners.push(callback);

  return () => {
    statusListeners = statusListeners.filter(
      listener => listener !== callback
    );
  };
}