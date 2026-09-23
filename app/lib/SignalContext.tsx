'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';

import {
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';

import { auth } from './firebase';

import {
  connectToSignalServer,
  disconnectFromSignalServer,
  onSignal,
  onConnectionChange,
  SignalData,
} from './signalClient';

type TradingMode = 'MANUAL' | 'AUTO';

type LogLine = {
  id: string;
  text: string;
  type: 'info' | 'success' | 'signal' | 'error';
};

type SignalContextType = {
  isStarted: boolean;
  isConnected: boolean;
  tradingMode: TradingMode;
  maxAutoTrades: number;
  terminalLogs: LogLine[];
  tradeCount: number;
  stateLoading: boolean;

  startRobot: () => Promise<void>;
  stopRobot: () => Promise<void>;

  setTradingMode: (
    mode: TradingMode
  ) => Promise<void>;

  setMaxAutoTrades: (
    value: number
  ) => Promise<void>;

  clearLogs: () => void;

  addLog: (
    text: string,
    type?: LogLine['type']
  ) => void;
};

type TradingStateResponse = {
  tradingEnabled?: boolean;
  tradingMode?: TradingMode;
  maxAutoTrades?: number;
  error?: string;
  code?: string;
};
const SignalContext =
  createContext<
    SignalContextType | undefined
  >(undefined);

export function SignalProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    isStarted,
    setIsStarted,
  ] = useState(false);

  const [
    isConnected,
    setIsConnected,
  ] = useState(false);

  const [
    tradingMode,
    setTradingModeState,
  ] = useState<TradingMode>(
    'MANUAL'
  );

  const [
    maxAutoTrades,
    setMaxAutoTradesState,
  ] = useState(1);

  const [
    terminalLogs,
    setTerminalLogs,
  ] = useState<LogLine[]>(
    []
  );

  const [
    tradeCount,
    setTradeCount,
  ] = useState(0);

  const [
    stateLoading,
    setStateLoading,
  ] = useState(true);

  /*
   * Keep the verified Firebase user
   * in memory.
   *
   * We do NOT trust an email stored
   * in localStorage for authorization.
   */
  const authenticatedUser =
    useRef<User | null>(
      null
    );

  /*
   * Prevent WebSocket reconnects
   * from filling the terminal with
   * repeated CONNECTED messages.
   */
  const hasShownConnected =
    useRef(false);

  /*
   * Used so async requests do not
   * update React after this provider
   * has unmounted.
   */
  const mounted =
    useRef(true);

  const addLog = useCallback(
    (
      text: string,
      type: LogLine['type'] =
        'info'
    ) => {
      const newLog: LogLine = {
        id:
          `${Date.now()}-` +
          Math.random()
            .toString(36)
            .substring(7) +
          '-' +
          Math.random()
            .toString(36)
            .substring(7),

        text,
        type,
      };

      setTerminalLogs(
        prev =>
          [
            newLog,
            ...prev,
          ].slice(0, 30)
      );
    },
    []
  );

  /*
   * Get a fresh Firebase ID token.
   *
   * This token proves the identity
   * of the signed-in Firebase user
   * to our Next.js backend.
   */
  const getAuthToken =
    useCallback(
      async () => {
        const user =
          authenticatedUser.current ||
          auth.currentUser;

        if (!user) {
          throw new Error(
            'You must be signed in.'
          );
        }

        return await user.getIdToken();
      },
      []
    );

  /*
   * Load the authoritative trading
   * state from Firestore through our
   * protected server endpoint.
   */

    // =========================
  // INVALID STUDENT SESSION
  // =========================

  const invalidateStudentSession =
    useCallback(
      async () => {
        authenticatedUser.current =
          null;

        setIsStarted(false);
        setIsConnected(false);

        setTradingModeState(
          'MANUAL'
        );

        setMaxAutoTradesState(
          1
        );

        disconnectFromSignalServer();

        try {
          localStorage.removeItem(
            'student_demo'
          );

          localStorage.removeItem(
            'student_logged_in'
          );
        } catch {
          // Ignore storage cleanup errors.
        }

        try {
          await signOut(auth);
        } catch (error) {
          console.error(
            'Student sign-out failed:',
            error
          );
        }

        if (
          typeof window !==
          'undefined'
        ) {
          window.location.replace(
            '/student-entry'
          );
        }
      },
      []
    );
  const loadTradingState =
    useCallback(
      async () => {
        const token =
          await getAuthToken();

        const response =
          await fetch(
            '/api/trading/state',
            {
              method: 'GET',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              cache:
                'no-store',
            }
          );

        const data:
          TradingStateResponse =
          await response.json();

        if (!response.ok) {
          const invalidSessionCodes = [
            'REACTIVATION_REQUIRED',
            'LICENSE_INACTIVE',
            'LICENSE_EXPIRED',
            'SESSION_INVALID',
          ];

          if (
            response.status === 401 ||
            (
              data.code &&
              invalidSessionCodes.includes(
                data.code
              )
            )
          ) {
            await invalidateStudentSession();
            return;
          }

          throw new Error(
            data.error ||
              'Could not load trading state.'
          );
        }

        if (!mounted.current) {
          return;
        }

        setIsStarted(
          data.tradingEnabled ===
            true
        );

        setTradingModeState(
          data.tradingMode ===
            'AUTO'
            ? 'AUTO'
            : 'MANUAL'
        );

        const loadedMaxAutoTrades =
          typeof data.maxAutoTrades ===
            'number'
            ? Math.max(
                0,
                Math.min(
                  10,
                  Math.trunc(
                    data.maxAutoTrades
                  )
                )
              )
            : 1;

        setMaxAutoTradesState(
          loadedMaxAutoTrades
        );
      },
      [
        getAuthToken,
        invalidateStudentSession,
      ]
    );
  /*
   * Send START / STOP / mode changes
   * to the protected server.
   *
   * The server verifies the Firebase
   * ID token and decides whether the
   * change is allowed.
   */
  const saveTradingState =
    useCallback(
      async (
        enabled: boolean,
        mode: TradingMode,
        maxTrades: number
      ) => {
        const token =
          await getAuthToken();

        const response =
          await fetch(
            '/api/trading/state',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  tradingEnabled:
                    enabled,

                  tradingMode:
                    mode,

                  maxAutoTrades:
                    Math.max(
                      0,
                      Math.min(
                        10,
                        Math.trunc(
                          maxTrades
                        )
                      )
                    ),
                }),
            }
          );

        const data:
          TradingStateResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              'Could not update trading state.'
          );
        }

        return data;
      },
      [getAuthToken]
    );

  /*
   * Listen for Firebase authentication.
   *
   * Once Firebase confirms the user,
   * retrieve START + mode from the
   * server.
   *
   * localStorage is NOT used as the
   * authority anymore.
   */
  useEffect(() => {
    mounted.current = true;

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async user => {
          authenticatedUser.current =
            user;

          if (!user) {
            setIsStarted(
              false
            );

            setIsConnected(
              false
            );

            setTradingModeState(
              'MANUAL'
            );

            setMaxAutoTradesState(
              1
            );

            disconnectFromSignalServer();

            setStateLoading(
              false
            );

            return;
          }

          setStateLoading(
            true
          );

          try {
            await loadTradingState();
          } catch (error) {
            console.error(
              'Could not load secure trading state:',
              error
            );

            /*
             * Fail closed.
             *
             * If we cannot verify the
             * server state, AUTO/START
             * must NOT become enabled.
             */
            if (
              mounted.current
            ) {
              setIsStarted(
                false
              );

              setTradingModeState(
                'MANUAL'
              );

              setMaxAutoTradesState(
                1
              );
            }
          } finally {
            if (
              mounted.current
            ) {
              setStateLoading(
                false
              );
            }
          }
        }
      );

    return () => {
      mounted.current =
        false;

      unsubscribe();
    };
  }, [loadTradingState]);

  /*
   * Handle a genuine signal received
   * from the VPS.
   */
const handleVpsSignal =
  useCallback(
    (
      signal?: SignalData
    ) => {

      if (
        !signal ||
        !signal.symbol ||
        !signal.action
      ) {
        return;
      }
        console.log(
          '🚨 REAL VPS SIGNAL:',
          signal
        );

        /*
         * Notification history is still
         * local for now.
         *
         * This is display/history data,
         * NOT authorization.
         *
         * Later we'll persist signal
         * history in Firebase.
         */
        try {
          const history =
            JSON.parse(
              localStorage.getItem(
                'notif_history'
              ) || '[]'
            );

          const newNotif = {
            id:
              signal.id ||
              `notif_${Date.now()}`,

            symbol:
              signal.symbol,

            action:
              signal.action,

            entry:
              signal.entry,

            tp:
              signal.tp,

            sl:
              signal.sl,

            confidence:
              signal.confidence,

            rsi:
              signal.rsi,

            timestamp:
              signal.timestamp ||
              new Date()
                .toISOString(),
          };

          const updated = [
            newNotif,
            ...history,
          ].slice(0, 10);

          localStorage.setItem(
            'notif_history',
            JSON.stringify(
              updated
            )
          );
        } catch (error) {
          console.error(
            'Could not save notification:',
            error
          );
        }

        addLog(
          `NEW SIGNAL: ${signal.symbol} ${signal.action}`,
          'signal'
        );

        addLog(
          `ENTRY: ${signal.entry}`,
          'info'
        );

        addLog(
          `TP: ${signal.tp} | SL: ${signal.sl}`,
          'info'
        );

        addLog(
          `CONFIDENCE: ${signal.confidence}% | RSI: ${signal.rsi}`,
          'info'
        );

        /*
         * IMPORTANT:
         *
         * AUTO still does NOT claim a
         * trade was executed.
         *
         * Real execution comes later
         * through the authenticated
         * PIXEL FORGE MT5 EA bridge.
         */
        if (
          tradingMode ===
          'AUTO'
        ) {
          addLog(
            'AUTO: SIGNAL RECEIVED — WAITING FOR MT5 EXECUTION SERVICE',
            'info'
          );
        } else {
          addLog(
            'MANUAL: SIGNAL READY FOR REVIEW',
            'success'
          );
        }
      },
      [
        addLog,
        tradingMode,
      ]
    );

  /*
   * WebSocket connection for the UI.
   *
   * Important:
   * This socket is NOT what will keep
   * AUTO trading alive later.
   *
   * Firestore tradingEnabled will be
   * the persistent server-side state.
   */
  useEffect(() => {
    if (
      stateLoading ||
      !isStarted
    ) {
      disconnectFromSignalServer();

      setIsConnected(
        false
      );

      hasShownConnected.current =
        false;

      return;
    }

    const user =
      authenticatedUser.current ||
      auth.currentUser;

    if (!user) {
      setIsConnected(
        false
      );

      return;
    }

    /*
     * Use Firebase UID for the current
     * socket identity instead of an
     * email read from localStorage.
     *
     * The VPS will later verify a
     * signed token too. UID alone is
     * NOT treated as authorization.
     */
    const studentId =
      user.uid;

    console.log(
      '🔌 SignalProvider connecting to VPS...'
    );

    const unsubSignal =
      onSignal(
        handleVpsSignal
      );

    const unsubStatus =
      onConnectionChange(
        connected => {
          setIsConnected(
            connected
          );

          if (
            connected &&
            !hasShownConnected.current
          ) {
            hasShownConnected.current =
              true;

            addLog(
              '🟢 VPS CONNECTED',
              'success'
            );
          }
        }
      );

    connectToSignalServer(
      studentId
    );

    return () => {
      unsubSignal();
      unsubStatus();
    };
  }, [
    isStarted,
    stateLoading,
    handleVpsSignal,
    addLog,
  ]);

  /*
   * START
   *
   * Do not show STARTED until the
   * protected backend accepts it.
   */
  const startRobot =
    useCallback(
      async () => {
        if (
          isStarted ||
          stateLoading
        ) {
          return;
        }

        setTerminalLogs(
          []
        );

        hasShownConnected.current =
          false;

        addLog(
          'STARTING ROBOT...',
          'info'
        );

        addLog(
          `MODE: ${tradingMode}`,
          'info'
        );

        addLog(
          'VERIFYING AUTHORIZATION...',
          'info'
        );

        try {
          const data =
            await saveTradingState(
              true,
              tradingMode,
              maxAutoTrades
            );

          if (
            data.tradingEnabled !==
            true
          ) {
            throw new Error(
              'Server did not enable trading.'
            );
          }

          setIsStarted(
            true
          );

          addLog(
            'TRADING ENABLED ON SERVER',
            'success'
          );

          addLog(
            'CONNECTING TO VPS...',
            'info'
          );
        } catch (error) {
          console.error(
            'Could not start trading:',
            error
          );

          setIsStarted(
            false
          );

          setIsConnected(
            false
          );

          const message =
            error instanceof Error
              ? error.message
              : 'Authorization failed';

          addLog(
            `START FAILED: ${message}`,
            'error'
          );
        }
      },
      [
        isStarted,
        stateLoading,
        tradingMode,
        maxAutoTrades,
        saveTradingState,
        addLog,
      ]
    );

  /*
   * STOP
   *
   * STOP prevents new automated
   * activity.
   *
   * It does NOT mean "close every
   * existing MT5 position".
   */
  const stopRobot =
    useCallback(
      async () => {
        if (
          stateLoading
        ) {
          return;
        }

        addLog(
          'STOPPING NEW TRADING ACTIVITY...',
          'info'
        );

        try {
          const data =
            await saveTradingState(
              false,
              tradingMode,
              maxAutoTrades
            );

          if (
            data.tradingEnabled ===
            true
          ) {
            throw new Error(
              'Server did not disable trading.'
            );
          }

          setIsStarted(
            false
          );

          setIsConnected(
            false
          );

          hasShownConnected.current =
            false;

          disconnectFromSignalServer();

          addLog(
            'TRADING DISABLED ON SERVER',
            'success'
          );
        } catch (error) {
          console.error(
            'Could not stop trading:',
            error
          );

          const message =
            error instanceof Error
              ? error.message
              : 'Could not stop trading';

          /*
           * Important:
           *
           * Do NOT pretend trading is
           * disabled if the server did
           * not confirm it.
           */
          addLog(
            `STOP FAILED: ${message}`,
            'error'
          );
        }
      },
      [
        stateLoading,
        tradingMode,
        maxAutoTrades,
        saveTradingState,
        addLog,
      ]
    );

  /*
   * Change MANUAL / AUTO.
   *
   * The server must accept the new
   * mode before the UI considers it
   * authoritative.
   */
  const setTradingMode =
    useCallback(
      async (
        mode: TradingMode
      ) => {
        if (
          mode ===
          tradingMode
        ) {
          return;
        }

        if (
          stateLoading
        ) {
          return;
        }

        addLog(
          `CHANGING MODE TO ${mode}...`,
          'info'
        );

        try {
          const data =
            await saveTradingState(
              isStarted,
              mode,
              maxAutoTrades
            );

          const confirmedMode =
            data.tradingMode ===
            'AUTO'
              ? 'AUTO'
              : 'MANUAL';

          setTradingModeState(
            confirmedMode
          );

          addLog(
            `TRADING MODE: ${confirmedMode}`,
            'success'
          );
        } catch (error) {
          console.error(
            'Could not change trading mode:',
            error
          );

          const message =
            error instanceof Error
              ? error.message
              : 'Mode change failed';

          addLog(
            `MODE CHANGE FAILED: ${message}`,
            'error'
          );
        }
      },
      [
        tradingMode,
        stateLoading,
        isStarted,
        maxAutoTrades,
        saveTradingState,
        addLog,
      ]
    );

  /*
   * Change maximum simultaneous AUTO trades.
   *
   * 0 disables new AUTO entries while keeping
   * the selected AUTO mode available.
   *
   * The protected server remains authoritative.
   */
  const setMaxAutoTrades =
    useCallback(
      async (
        value: number
      ) => {
        if (stateLoading) {
          return;
        }

        const safeValue =
          Math.max(
            0,
            Math.min(
              10,
              Math.trunc(value)
            )
          );

        addLog(
          `SETTING MAX AUTO TRADES TO ${safeValue}...`,
          'info'
        );

        try {
          const data =
            await saveTradingState(
              isStarted,
              tradingMode,
              safeValue
            );

          const confirmedValue =
            typeof data.maxAutoTrades ===
              'number'
              ? Math.max(
                  0,
                  Math.min(
                    10,
                    Math.trunc(
                      data.maxAutoTrades
                    )
                  )
                )
              : safeValue;

          setMaxAutoTradesState(
            confirmedValue
          );

          addLog(
            `MAX AUTO TRADES: ${confirmedValue}`,
            'success'
          );
        } catch (error) {
          console.error(
            'Could not change max auto trades:',
            error
          );

          const message =
            error instanceof Error
              ? error.message
              : 'Max auto trades change failed';

          addLog(
            `MAX AUTO TRADES FAILED: ${message}`,
            'error'
          );
        }
      },
      [
        stateLoading,
        isStarted,
        tradingMode,
        saveTradingState,
        addLog,
      ]
    );

  const clearLogs =
    useCallback(
      () => {
        setTerminalLogs(
          []
        );

        setTradeCount(
          0
        );
      },
      []
    );

  return (
    <SignalContext.Provider
      value={{
        isStarted,
        isConnected,
        tradingMode,
        maxAutoTrades,
        terminalLogs,
        tradeCount,
        stateLoading,
        startRobot,
        stopRobot,
        setTradingMode,
        setMaxAutoTrades,
        clearLogs,
        addLog,
      }}
    >
      {children}
    </SignalContext.Provider>
  );
}

export function useSignal() {
  const context =
    useContext(
      SignalContext
    );

  if (
    context ===
    undefined
  ) {
    throw new Error(
      'useSignal must be used within a SignalProvider'
    );
  }

  return context;
}