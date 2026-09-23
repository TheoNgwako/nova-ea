'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  onAuthStateChanged,
  User,
} from 'firebase/auth';

import { auth } from '../lib/firebase';
import { useTheme } from '../context/ThemeContext';

declare global {
  interface Window {
    paypal?: any;
  }
}

type SmartScreenProps = {
  isOpen: boolean;
  onClose: () => void;
};

type TokenBalance = {
  freeTokens: number;
  purchasedTokens: number;
  totalTokens: number;
};

type SmartResult = {
  success?: boolean;

  action?:
    | 'BUY'
    | 'SELL'
    | 'NO_TRADE';

  symbol?: string;
  timeframe?: string;

  entry?: number | string;
  sl?: number | string;
  tp?: number | string;

  confidence?: number;
  score?: number;
  trend?: string;
  rsi?: number;

  reason?: string;
  message?: string;
  timestamp?: string | number;

  chargeToken?: boolean;
  charged?: boolean;

  tokenCharged?:
    | 'free'
    | 'purchased';

  tokenBalance?: TokenBalance;

  error?: string;

  retryAfterMinutes?: number;
};

type Aggressiveness =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH';

const SYMBOLS = [
  'XAUUSD',
  'BTCUSD',
  'EURUSD',
  'GBPUSD',
  'USDJPY',
  'AUDUSD',
  'USDCAD',
  'NZDUSD',
];

const TIMEFRAMES = [
  'M5',
  'M15',
  'M30',
  'H1',
  'H4',
];

const STRATEGIES = [
  'ICT',
  'SMC',
  'Candlestick Patterns',
  'Trend Following',
  'Liquidity Sweeps',
  'Order Blocks',
  'Fair Value Gaps',
];

const WHITE_TEXT:
  React.CSSProperties = {
  color: '#ffffff',
  WebkitTextFillColor: '#ffffff',
};

export default function SmartScreen({
  isOpen,
  onClose,
}: SmartScreenProps) {
  const { accentColor } =
    useTheme();

  // ========================================
  // AUTH
  // ========================================

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  const [
    authLoading,
    setAuthLoading,
  ] =
    useState(true);

  // ========================================
  // TOKEN STATE
  // ========================================

  const [
    tokenLoading,
    setTokenLoading,
  ] =
    useState(false);

  const [
    tokenBalance,
    setTokenBalance,
  ] =
    useState<TokenBalance>({
      freeTokens: 0,
      purchasedTokens: 0,
      totalTokens: 0,
    });

  // ========================================
  // SMART STATE
  // ========================================

  const [
    analyzing,
    setAnalyzing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    result,
    setResult,
  ] =
    useState<SmartResult | null>(
      null
    );

  // ========================================
  // SMART SETTINGS
  // ========================================

  const [
    platform,
    setPlatform,
  ] =
    useState<
      'MT4' | 'MT5'
    >('MT5');

  const [
    selectedSymbol,
    setSelectedSymbol,
  ] =
    useState('XAUUSD');

  const [
    lotSize,
    setLotSize,
  ] =
    useState('0.01');

  const [
    timeframe,
    setTimeframe,
  ] =
    useState('M15');

  const [
    maxDailyLoss,
    setMaxDailyLoss,
  ] =
    useState('100');

  const [
    profitTarget,
    setProfitTarget,
  ] =
    useState('200');

  /*
   * 0 = no automatic execution.
   * 1 - 10 = maximum number of
   * trades AUTO may eventually
   * execute when the MT5 EA bridge
   * is connected.
   */
  const [
    maxTrades,
    setMaxTrades,
  ] =
    useState(0);

  const [
    strategies,
    setStrategies,
  ] =
    useState([
      'ICT',
      'SMC',
    ]);

  /*
   * This is a user preference.
   *
   * It does NOT alter/fake the
   * confidence returned by Smart.
   */
  const [
    confidence,
    setConfidence,
  ] =
    useState(75);

  /*
   * AUTO execution profile.
   *
   * We save the user's preference
   * now. The MT5 execution engine
   * will use it later.
   */
  const [
    aggressiveness,
    setAggressiveness,
  ] =
    useState<Aggressiveness>(
      'MEDIUM'
    );

  // ========================================
  // FIREBASE AUTH
  // ========================================

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        currentUser => {
          setUser(
            currentUser
          );

          setAuthLoading(
            false
          );
        }
      );

    return unsubscribe;
  }, []);

  // ========================================
  // RESTORE SMART UI SETTINGS
  // ========================================

  useEffect(() => {
    if (
      typeof window ===
      'undefined'
    ) {
      return;
    }

    try {
      const savedAutoTrades =
        Number(
          localStorage.getItem(
            'pixel_forge_auto_trades'
          )
        );

      if (
        Number.isInteger(
          savedAutoTrades
        ) &&
        savedAutoTrades >= 0 &&
        savedAutoTrades <= 10
      ) {
        setMaxTrades(
          savedAutoTrades
        );
      }

      const savedConfidence =
        Number(
          localStorage.getItem(
            'pixel_forge_preferred_confidence'
          )
        );

      if (
        Number.isFinite(
          savedConfidence
        ) &&
        savedConfidence >= 50 &&
        savedConfidence <= 90
      ) {
        setConfidence(
          savedConfidence
        );
      }

      const savedProfile =
        localStorage.getItem(
          'pixel_forge_execution_profile'
        );

      if (
        savedProfile ===
          'LOW' ||
        savedProfile ===
          'MEDIUM' ||
        savedProfile ===
          'HIGH'
      ) {
        setAggressiveness(
          savedProfile
        );
      }
    } catch (err) {
      console.error(
        'Could not restore Smart settings:',
        err
      );
    }
  }, []);

  // ========================================
  // SAVE AUTO TRADE COUNT
  // ========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        'pixel_forge_auto_trades',
        String(maxTrades)
      );
    } catch {
      // UI preference only.
    }
  }, [maxTrades]);

  // ========================================
  // SAVE CONFIDENCE PREFERENCE
  // ========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        'pixel_forge_preferred_confidence',
        String(confidence)
      );
    } catch {
      // UI preference only.
    }
  }, [confidence]);

  // ========================================
  // SAVE EXECUTION PROFILE
  // ========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        'pixel_forge_execution_profile',
        aggressiveness
      );
    } catch {
      // UI preference only.
    }
  }, [aggressiveness]);

  // ========================================
  // LOAD REAL TOKEN BALANCE
  // ========================================

  const loadTokenBalance =
    useCallback(
      async (
        currentUser: User
      ) => {
        setTokenLoading(
          true
        );

        try {
          const idToken =
            await currentUser.getIdToken();

          const response =
            await fetch(
              '/api/tokens/balance',
              {
                method:
                  'GET',

                headers: {
                  Authorization:
                    `Bearer ${idToken}`,
                },

                cache:
                  'no-store',
              }
            );

          const data =
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              data?.error ||
                'Unable to load tokens'
            );
          }

          setTokenBalance({
            freeTokens:
              Number(
                data
                  ?.freeTokens
              ) || 0,

            purchasedTokens:
              Number(
                data
                  ?.purchasedTokens
              ) || 0,

            totalTokens:
              Number(
                data
                  ?.totalTokens
              ) || 0,
          });
        } catch (
          err: any
        ) {
          console.error(
            'Token balance error:',
            err?.message ||
              err
          );

          setError(
            err?.message ||
              'Unable to load Smart tokens'
          );
        } finally {
          setTokenLoading(
            false
          );
        }
      },
      []
    );

  // ========================================
  // LOAD BALANCE WHEN SMART OPENS
  // ========================================

  useEffect(() => {
    if (
      !isOpen ||
      !user
    ) {
      return;
    }

    setError('');

    loadTokenBalance(
      user
    );
  }, [
    isOpen,
    user,
    loadTokenBalance,
  ]);

  // ========================================
  // STRATEGY TOGGLE
  // ========================================

  const toggleStrategy = (
    strategy: string
  ) => {
    setStrategies(
      previous => {
        if (
          previous.includes(
            strategy
          )
        ) {
          return previous.filter(
            item =>
              item !==
              strategy
          );
        }

        return [
          ...previous,
          strategy,
        ];
      }
    );
  };

  // ========================================
  // REQUEST SMART SIGNAL
  // ========================================

  const analyzeMarket =
    async () => {
      if (!user) {
        setError(
          'Student authentication required'
        );

        return;
      }

      if (analyzing) {
        return;
      }

      if (
        tokenBalance
          .totalTokens < 1
      ) {
        setError(
          'No Smart tokens available'
        );

        return;
      }

      setAnalyzing(true);
      setError('');
      setResult(null);

      try {
        const idToken =
          await user.getIdToken();

        /*
         * Smart signal generation
         * remains server-controlled.
         *
         * The server returns the real
         * calculated confidence.
         */
        const response =
          await fetch(
            '/api/smart/signal',
            {
              method:
                'POST',

              headers: {
                'Content-Type':
                  'application/json',

                Authorization:
                  `Bearer ${idToken}`,
              },

              body:
                JSON.stringify({
                  symbol:
                    selectedSymbol,

                  timeframe,
                }),

              cache:
                'no-store',
            }
          );

        const data:
          SmartResult =
            await response.json();

        if (
          !response.ok
        ) {
          if (
            response.status ===
              402 ||
            data?.error ===
              'No Smart tokens available'
          ) {
            setTokenBalance(
              previous => ({
                ...previous,
                totalTokens:
                  0,
              })
            );
          }

          let message =
            data?.error ||
            'Smart analysis failed';

          if (
            data
              ?.retryAfterMinutes
          ) {
            message +=
              ` — try again in about ${data.retryAfterMinutes} minute${data.retryAfterMinutes === 1 ? '' : 's'}`;
          }

          throw new Error(
            message
          );
        }

        setResult(data);

        /*
         * Use the authoritative
         * balance returned by the
         * backend after analysis.
         */
        if (
          data.tokenBalance
        ) {
          setTokenBalance({
            freeTokens:
              Number(
                data
                  .tokenBalance
                  .freeTokens
              ) || 0,

            purchasedTokens:
              Number(
                data
                  .tokenBalance
                  .purchasedTokens
              ) || 0,

            totalTokens:
              Number(
                data
                  .tokenBalance
                  .totalTokens
              ) || 0,
          });
        }
      } catch (
        err: any
      ) {
        console.error(
          'Smart analysis error:',
          err?.message ||
            err
        );

        setError(
          err?.message ||
            'Unable to generate Smart signal'
        );
      } finally {
        setAnalyzing(
          false
        );
      }
    };

    // ========================================
// SMART TOKEN PURCHASE
// ========================================

const [
  tokenPurchaseOpen,
  setTokenPurchaseOpen,
] = useState(false);

const [
  tokenQuantity,
  setTokenQuantity,
] = useState(5);

const [
  paymentLoading,
  setPaymentLoading,
] = useState(false);

const [
  paymentSuccess,
  setPaymentSuccess,
] = useState('');

const paypalContainerRef =
  useRef<HTMLDivElement | null>(
    null
  );

const paypalRenderedRef =
  useRef(false);

// ========================================
// OPEN TOKEN SHOP
// ========================================

const openTokenShop = () => {
  setError('');
  setPaymentSuccess('');
  paypalRenderedRef.current =
    false;

  setTokenPurchaseOpen(true);
};

// ========================================
// CLOSE TOKEN SHOP
// ========================================

const closeTokenShop = () => {
  if (paymentLoading) {
    return;
  }

  setTokenPurchaseOpen(false);

  paypalRenderedRef.current =
    false;

  if (
    paypalContainerRef.current
  ) {
    paypalContainerRef.current.innerHTML =
      '';
  }
};

// ========================================
// LOAD PAYPAL TOKEN CHECKOUT
// ========================================

useEffect(() => {
  if (
    !tokenPurchaseOpen ||
    !user
  ) {
    return;
  }

  let cancelled = false;

  paypalRenderedRef.current =
    false;

  const loadTokenPayPal =
    async () => {
      try {
        setError('');
        setPaymentSuccess('');

        // ==============================
        // GET PUBLIC PAYPAL CONFIG
        // ==============================

        const configResponse =
          await fetch(
            '/api/paypal/config',
            {
              cache:
                'no-store',
            }
          );

        const config =
          await configResponse.json();

        if (
          !configResponse.ok ||
          !config.clientId
        ) {
          throw new Error(
            config.error ||
              'Could not load PayPal checkout'
          );
        }

        // ==============================
        // LOAD PAYPAL SDK ONCE
        // ==============================

        if (!window.paypal) {
          let script =
            document.querySelector(
              'script[data-pixel-forge-paypal="true"]'
            ) as
              | HTMLScriptElement
              | null;

          if (!script) {
            script =
              document.createElement(
                'script'
              );

            script.src =
              `https://www.paypal.com/sdk/js?client-id=` +
              `${encodeURIComponent(
                config.clientId
              )}` +
              `&currency=${encodeURIComponent(
                config.currency ||
                  'USD'
              )}` +
              `&intent=capture`;

            script.async = true;

            script.dataset.pixelForgePaypal =
              'true';

            document.body.appendChild(
              script
            );
          }

          await new Promise<void>(
            (
              resolve,
              reject
            ) => {
              if (
                window.paypal
              ) {
                resolve();
                return;
              }

              script!.addEventListener(
                'load',
                () =>
                  resolve(),
                {
                  once: true,
                }
              );

              script!.addEventListener(
                'error',
                () =>
                  reject(
                    new Error(
                      'Could not load PayPal'
                    )
                  ),
                {
                  once: true,
                }
              );
            }
          );
        }

        if (
          cancelled ||
          !window.paypal ||
          !paypalContainerRef.current
        ) {
          return;
        }

        // ==============================
        // CLEAR OLD BUTTON
        // ==============================

        paypalContainerRef.current.innerHTML =
          '';

        paypalRenderedRef.current =
          false;

        // ==============================
        // CREATE PAYPAL BUTTON
        // ==============================

        const buttons =
          window.paypal.Buttons({
            style: {
              layout:
                'vertical',

              shape:
                'rect',

              label:
                'paypal',

              height: 45,
            },

            // ==========================
            // CREATE SERVER ORDER
            // ==========================

            createOrder:
              async () => {
                if (!user) {
                  throw new Error(
                    'Student authentication required'
                  );
                }

                setError('');
                setPaymentSuccess('');

                const idToken =
                  await user.getIdToken();

                const response =
                  await fetch(
                    '/api/paypal/tokens/create-order',
                    {
                      method:
                        'POST',

                      headers: {
                        'Content-Type':
                          'application/json',

                        Authorization:
                          `Bearer ${idToken}`,
                      },

                      body:
                        JSON.stringify(
                          {
                            quantity:
                              tokenQuantity,
                          }
                        ),

                      cache:
                        'no-store',
                    }
                  );

                const data =
                  await response.json();

                if (
                  !response.ok ||
                  !data.orderId
                ) {
                  throw new Error(
                    data.error ||
                      'Could not create token purchase'
                  );
                }

                return data.orderId;
              },

            // ==========================
            // PAYMENT APPROVED
            // ==========================

            onApprove:
              async (
                data: any,
                actions: any
              ) => {
                try {
                  if (!user) {
                    throw new Error(
                      'Student authentication required'
                    );
                  }

                  setPaymentLoading(
                    true
                  );

                  setError('');
                  setPaymentSuccess('');

                  const idToken =
                    await user.getIdToken(
                      true
                    );

                  const response =
                    await fetch(
                      '/api/paypal/tokens/capture-order',
                      {
                        method:
                          'POST',

                        headers: {
                          'Content-Type':
                            'application/json',

                          Authorization:
                            `Bearer ${idToken}`,
                        },

                        body:
                          JSON.stringify(
                            {
                              orderId:
                                data.orderID,
                            }
                          ),

                        cache:
                          'no-store',
                      }
                    );

                  const result =
                    await response.json();

                  // ======================
                  // FUNDING SOURCE
                  // DECLINED
                  // ======================

                  if (
                    result.code ===
                    'INSTRUMENT_DECLINED'
                  ) {
                    setError(
                      'That payment method was declined. Please choose another payment method.'
                    );

                    if (
                      actions &&
                      typeof actions.restart ===
                        'function'
                    ) {
                      return actions.restart();
                    }

                    return;
                  }

                  // ======================
                  // PAYMENT NOT VERIFIED
                  // ======================

                  if (
                    !response.ok ||
                    !result.success
                  ) {
                    throw new Error(
                      result.error ||
                        'Payment could not be verified'
                    );
                  }

                  // ======================
                  // REFRESH REAL BALANCE
                  // ======================

                  await loadTokenBalance(
                    user
                  );

                  setPaymentSuccess(
                    `${result.quantity || tokenQuantity} Smart token${
                      (result.quantity ||
                        tokenQuantity) ===
                      1
                        ? ''
                        : 's'
                    } added successfully.`
                  );
                } catch (
                  err: any
                ) {
                  console.error(
                    'Token purchase error:',
                    err?.message ||
                      err
                  );

                  setError(
                    err?.message ||
                      'Token payment could not be completed'
                  );
                } finally {
                  setPaymentLoading(
                    false
                  );
                }
              },

            // ==========================
            // PAYMENT CANCELLED
            // ==========================

            onCancel:
              () => {
                setError(
                  'Payment cancelled. You were not charged.'
                );
              },

            // ==========================
            // PAYPAL ERROR
            // ==========================

            onError:
              (
                err: any
              ) => {
                console.error(
                  'PayPal token checkout error:',
                  err
                );

                setError(
                  'PayPal checkout could not be completed.'
                );
              },
          });

        if (
          cancelled ||
          !paypalContainerRef.current
        ) {
          return;
        }

        paypalRenderedRef.current =
          true;

        await buttons.render(
          paypalContainerRef.current
        );
      } catch (
        err: any
      ) {
        console.error(
          'Token PayPal load error:',
          err?.message ||
            err
        );

        paypalRenderedRef.current =
          false;

        setError(
          err?.message ||
            'Could not load token checkout'
        );
      }
    };

  loadTokenPayPal();

  return () => {
    cancelled = true;

    paypalRenderedRef.current =
      false;
  };
}, [
  tokenPurchaseOpen,
  tokenQuantity,
  user,
  loadTokenBalance,
]);

  // ========================================
  // CLOSED
  // ========================================

  if (!isOpen) {
    return null;
  }

  const action =
    result?.action;

  const isTradeSignal =
    action === 'BUY' ||
    action === 'SELL';

  const resultColor =
    action === 'BUY'
      ? '#22c55e'
      : action ===
          'SELL'
        ? '#ef4444'
        : accentColor;

  // ========================================
  // UI
  // ========================================

  return (
    <>
 <style jsx global>{`
  .pixel-forge-smart {
    background: #000000 !important;
    background-color: #000000 !important;
    color: #ffffff;
  }

  .pixel-forge-smart .light-button {
    background: #f2f2f2 !important;
    background-color: #f2f2f2 !important;
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }

  .pixel-forge-smart .light-card {
    background: #f2f2f2 !important;
    background-color: #f2f2f2 !important;
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }

  .pixel-forge-smart .light-card p,
  .pixel-forge-smart .light-card span,
  .pixel-forge-smart .light-card label {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
  }

  .pixel-forge-smart input:not([type='range']) {
    background: #070707 !important;
    background-color: #070707 !important;
    color: #ffffff !important;
    -webkit-text-fill-color: #ffffff !important;
  }

  .pixel-forge-smart input::placeholder {
    color: #aaaaaa !important;
    -webkit-text-fill-color: #aaaaaa !important;
  }
`}</style>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/90 z-[100]"
        onClick={
          onClose
        }
      />

      {/* SMART SCREEN */}
<div
  className="pixel-forge-smart fixed top-0 left-0 right-0 bottom-0 z-[101] overflow-y-auto !bg-black !text-white"
  style={{
    backgroundColor: '#000000',
    backgroundImage: 'none',
    color: '#ffffff',
  }}
>
        {/* HEADER */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 backdrop-blur-md"
          style={{
            background:
              'rgba(0,0,0,0.95)',

            borderBottom:
              `1px solid ${accentColor}30`,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={
                onClose
              }
              className="text-2xl"
              style={
                WHITE_TEXT
              }
              aria-label="Close Smart"
            >
              ←
            </button>

            <h1
              className="text-2xl font-black tracking-wider"
              style={{
                color:
                  accentColor,

                WebkitTextFillColor:
                  accentColor,

                textShadow:
                  `0 0 15px ${accentColor}`,
              }}
            >
              SMART
            </h1>
          </div>

          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              border:
                `1px solid ${accentColor}`,

              color:
                '#ffffff',

              WebkitTextFillColor:
                '#ffffff',
            }}
          >
            {tokenLoading
              ? '⚡ ...'
              : `⚡ ${tokenBalance.totalTokens}`}
          </div>
        </div>

        <div className="p-4 space-y-5 max-w-md mx-auto pb-32">

          {/* SMART STATUS */}
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                'rgba(0,0,0,0.6)',

              border:
                `1px solid ${accentColor}40`,

              boxShadow:
                `0 0 20px ${accentColor}30`,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="text-xl"
                  style={
                    WHITE_TEXT
                  }
                >
                  ⚡
                </span>

                <div>
                  <p
                    className="text-xs tracking-widest"
                    style={
                      WHITE_TEXT
                    }
                  >
                    SMART SIGNAL
                  </p>

                  <p
                    className="text-base font-bold"
                    style={
                      WHITE_TEXT
                    }
                  >
                    {platform}
                  </p>
                </div>
              </div>

              <span
                className="text-xs font-bold"
                style={
                  WHITE_TEXT
                }
              >
                {analyzing
                  ? '● ANALYZING'
                  : '● READY'}
              </span>
            </div>
          </div>

          {/* PLATFORM */}
          <div>
            <p
              className="text-xs tracking-widest mb-2"
              style={
                WHITE_TEXT
              }
            >
              PLATFORM
            </p>

            <div className="flex gap-2">
              {(
                [
                  'MT4',
                  'MT5',
                ] as const
              ).map(
                item => (
                  <button
                    key={
                      item
                    }
                    onClick={() =>
                      setPlatform(
                        item
                      )
                    }
                    className="flex-1 py-3 rounded-2xl text-sm font-bold transition"
                    style={{
                      background:
                        platform ===
                        item
                          ? `${accentColor}25`
                          : 'rgba(255,255,255,0.05)',

                      border:
                        platform ===
                        item
                          ? `1px solid ${accentColor}`
                          : '1px solid rgba(255,255,255,0.15)',

                      color:
                        '#ffffff',

                      WebkitTextFillColor:
                        '#ffffff',
                    }}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          {/* SYMBOL */}
          <div>
            <p
              className="text-xs tracking-widest mb-2"
              style={
                WHITE_TEXT
              }
            >
              SYMBOL
            </p>

            <div className="flex flex-wrap gap-2">
              {SYMBOLS.map(
                symbol => (
                  <button
                    key={
                      symbol
                    }
                    disabled={
                      analyzing
                    }
                    onClick={() => {
                      setSelectedSymbol(
                        symbol
                      );

                      setResult(
                        null
                      );

                      setError(
                        ''
                      );
                    }}
                    className="px-4 py-2 rounded-full text-xs font-bold transition disabled:opacity-50"
                    style={{
                      background:
                        selectedSymbol ===
                        symbol
                          ? `${accentColor}30`
                          : 'rgba(255,255,255,0.05)',

                      border:
                        selectedSymbol ===
                        symbol
                          ? `1px solid ${accentColor}`
                          : '1px solid rgba(255,255,255,0.15)',

                      color:
                        '#ffffff',

                      WebkitTextFillColor:
                        '#ffffff',
                    }}
                  >
                    {symbol}
                  </button>
                )
              )}
            </div>
          </div>

          {/* TIMEFRAME */}
          <div>
            <p
              className="text-xs tracking-widest mb-2"
              style={
                WHITE_TEXT
              }
            >
              TIMEFRAME
            </p>

            <div className="grid grid-cols-5 gap-2">
              {TIMEFRAMES.map(
                item => (
                  <button
                    key={
                      item
                    }
                    disabled={
                      analyzing
                    }
                    onClick={() => {
                      setTimeframe(
                        item
                      );

                      setResult(
                        null
                      );

                      setError(
                        ''
                      );
                    }}
className="light-button py-2 rounded-xl text-xs font-bold disabled:opacity-50"                    style={{
                      background:
                        timeframe ===
                        item
                          ? `${accentColor}30`
                          : 'rgba(255,255,255,0.05)',

                      border:
                        timeframe ===
                        item
                          ? `1px solid ${accentColor}`
                          : '1px solid rgba(255,255,255,0.15)',

                      color:
                        '#ffffff',

                      WebkitTextFillColor:
                        '#ffffff',
                    }}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          {/* LOT SIZE */}
          <div>
            <p
              className="text-xs tracking-widest mb-2"
              style={
                WHITE_TEXT
              }
            >
              LOT SIZE
            </p>

            <input
              type="text"
              inputMode="decimal"
              value={
                lotSize
              }
              onChange={
                event =>
                  setLotSize(
                    event
                      .target
                      .value
                  )
              }
              className="w-full px-4 py-3 rounded-xl bg-black/50 text-sm"
              style={{
                ...WHITE_TEXT,

                border:
                  '1px solid rgba(255,255,255,0.2)',
              }}
            />

            <p
              className="text-[10px] mt-2"
              style={
                WHITE_TEXT
              }
            >
              Used by AUTO
              execution when the
              PIXEL FORGE MT5
              bridge is connected.
            </p>
          </div>

          {/* RISK SETTINGS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p
                className="text-xs tracking-widest mb-2"
                style={
                  WHITE_TEXT
                }
              >
                MAX DAILY LOSS
              </p>

              <input
                type="text"
                inputMode="decimal"
                value={
                  maxDailyLoss
                }
                onChange={
                  event =>
                    setMaxDailyLoss(
                      event
                        .target
                        .value
                    )
                }
                className="w-full px-4 py-3 rounded-xl bg-black/50 text-sm"
                style={{
                  ...WHITE_TEXT,

                  border:
                    '1px solid rgba(255,255,255,0.2)',
                }}
              />
            </div>

            <div>
              <p
                className="text-xs tracking-widest mb-2"
                style={
                  WHITE_TEXT
                }
              >
                PROFIT TARGET
              </p>

              <input
                type="text"
                inputMode="decimal"
                value={
                  profitTarget
                }
                onChange={
                  event =>
                    setProfitTarget(
                      event
                        .target
                        .value
                    )
                }
                className="w-full px-4 py-3 rounded-xl bg-black/50 text-sm"
                style={{
                  ...WHITE_TEXT,

                  border:
                    '1px solid rgba(255,255,255,0.2)',
                }}
              />
            </div>
          </div>

          {/* AUTO TRADES */}
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                'rgba(255,255,255,0.04)',

              border:
                '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <p
                className="text-xs tracking-widest"
                style={
                  WHITE_TEXT
                }
              >
                AUTO TRADES
              </p>

              <span
                className="text-xl font-black"
                style={
                  WHITE_TEXT
                }
              >
                {maxTrades}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={
                maxTrades
              }
              onChange={
                event =>
                  setMaxTrades(
                    Number(
                      event
                        .target
                        .value
                    )
                  )
              }
              className="w-full"
              style={{
                accentColor,
              }}
            />

            <div
              className="flex justify-between text-[10px] mt-1"
              style={
                WHITE_TEXT
              }
            >
              <span>0</span>
              <span>10</span>
            </div>

            <p
              className="text-[11px] mt-3"
              style={
                WHITE_TEXT
              }
            >
              {maxTrades ===
              0
                ? 'AUTO execution is disabled.'
                : `AUTO may open up to ${maxTrades} trade${maxTrades === 1 ? '' : 's'} when execution is connected.`}
            </p>
          </div>

          {/* STRATEGIES */}
          <div>
            <p
              className="text-xs tracking-widest mb-2"
              style={
                WHITE_TEXT
              }
            >
              STRATEGIES
            </p>

            <div className="flex flex-wrap gap-2">
              {STRATEGIES.map(
                strategy => {
                  const selected =
                    strategies.includes(
                      strategy
                    );

                  return (
                    <button
                      key={
                        strategy
                      }
                      onClick={() =>
                        toggleStrategy(
                          strategy
                        )
                      }
                      className="px-4 py-2 rounded-full text-xs font-bold transition"
                      style={{
                        background:
                          selected
                            ? `${accentColor}35`
                            : 'rgba(255,255,255,0.05)',

                        border:
                          selected
                            ? `1px solid ${accentColor}`
                            : '1px solid rgba(255,255,255,0.15)',

                        color:
                          '#ffffff',

                        WebkitTextFillColor:
                          '#ffffff',
                      }}
                    >
                      {strategy}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* PREFERRED CONFIDENCE */}
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                'rgba(255,255,255,0.04)',

              border:
                '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <p
                className="text-xs tracking-widest"
                style={
                  WHITE_TEXT
                }
              >
                PREFERRED CONFIDENCE
              </p>

              <span
                className="text-lg font-black"
                style={
                  WHITE_TEXT
                }
              >
                {confidence}%
              </span>
            </div>

            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={
                confidence
              }
              onChange={
                event =>
                  setConfidence(
                    Number(
                      event
                        .target
                        .value
                    )
                  )
              }
              className="w-full"
              style={{
                accentColor,
              }}
            />

            <div
              className="flex justify-between text-[10px] mt-1"
              style={
                WHITE_TEXT
              }
            >
              <span>50%</span>
              <span>90%</span>
            </div>

            <p
              className="text-[10px] mt-3"
              style={
                WHITE_TEXT
              }
            >
              Smart always
              displays the actual
              confidence calculated
              for the signal.
            </p>
          </div>

          {/* EXECUTION PROFILE */}
          <div
            className="rounded-2xl p-4"
            style={{
              background:
                'rgba(255,255,255,0.04)',

              border:
                '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <p
              className="text-xs tracking-widest mb-3"
              style={
                WHITE_TEXT
              }
            >
              AGGRESSIVENESS
            </p>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  'LOW',
                  'MEDIUM',
                  'HIGH',
                ] as const
              ).map(
                level => {
                  const selected =
                    aggressiveness ===
                    level;

                  return (
                    <button
                      key={
                        level
                      }
                      onClick={() =>
                        setAggressiveness(
                          level
                        )
                      }
className="light-button py-3 rounded-xl text-xs font-black transition"                      style={{
                        background:
                          selected
                            ? `${accentColor}35`
                            : 'rgba(255,255,255,0.05)',

                        border:
                          selected
                            ? `1px solid ${accentColor}`
                            : '1px solid rgba(255,255,255,0.15)',

                        color:
                          '#ffffff',

                        WebkitTextFillColor:
                          '#ffffff',

                        boxShadow:
                          selected
                            ? `0 0 15px ${accentColor}30`
                            : undefined,
                      }}
                    >
                      {level}
                    </button>
                  );
                }
              )}
            </div>

            <p
              className="text-[10px] mt-3"
              style={
                WHITE_TEXT
              }
            >
              {aggressiveness ===
              'LOW'
                ? 'LOW — conservative AUTO execution profile.'
                : aggressiveness ===
                    'HIGH'
                  ? 'HIGH — more active AUTO execution profile.'
                  : 'MEDIUM — balanced AUTO execution profile.'}
            </p>

            <p
              className="text-[10px] mt-1"
              style={
                WHITE_TEXT
              }
            >
              This does not change
              the confidence number
              calculated by Smart.
            </p>
          </div>

 {/* TOKENS */}
<div
  className="rounded-2xl p-4"
  style={{
    background:
      `linear-gradient(135deg, ${accentColor}20, rgba(0,40,120,0.4))`,

    border:
      `1px solid ${accentColor}40`,
  }}
>
  <div className="flex items-start justify-between gap-3">
    <div>
      <p
        className="text-xs tracking-widest"
        style={
          WHITE_TEXT
        }
      >
        SMART SIGNAL TOKENS
      </p>

      <p
        className="text-3xl font-black mt-2"
        style={
          WHITE_TEXT
        }
      >
        ⚡{' '}
        {tokenLoading
          ? '...'
          : tokenBalance.totalTokens}
      </p>
    </div>

    <button
      type="button"
      onClick={
        openTokenShop
      }
className="light-button px-4 py-2 rounded-xl text-xs font-black"      style={{
        background:
          accentColor,

        color:
          '#ffffff',

        WebkitTextFillColor:
          '#ffffff',

        boxShadow:
          `0 0 18px ${accentColor}50`,
      }}
    >
      BUY TOKENS
    </button>
  </div>

  <div
    className="flex gap-4 mt-3 text-xs"
    style={
      WHITE_TEXT
    }
  >
    <span>
      Free:{' '}
      {
        tokenBalance.freeTokens
      }
    </span>

    <span>
      Purchased:{' '}
      {
        tokenBalance.purchasedTokens
      }
    </span>
  </div>

  <p
    className="text-[10px] mt-3"
    style={
      WHITE_TEXT
    }
  >
    10 free Smart tokens
    refresh daily.
    Purchased tokens do not
    disappear during the daily
    refresh.
  </p>

  <p
    className="text-[10px] mt-1"
    style={
      WHITE_TEXT
    }
  >
    1 token is charged only
    when Smart returns a BUY
    or SELL signal.
  </p>
</div>

{/* TOKEN SHOP */}
{tokenPurchaseOpen && (
  <div
    className="rounded-2xl p-5"
    style={{
      background:
        'rgba(5,10,20,0.98)',

      border:
        `1px solid ${accentColor}60`,

      boxShadow:
        `0 0 30px ${accentColor}20`,
    }}
  >
    <div className="flex justify-between items-start gap-3">
      <div>
        <p
          className="text-xs tracking-widest"
          style={
            WHITE_TEXT
          }
        >
          BUY SMART TOKENS
        </p>

        <p
          className="text-lg font-black mt-1"
          style={
            WHITE_TEXT
          }
        >
          R10 per token
        </p>
      </div>

      <button
        type="button"
        onClick={
          closeTokenShop
        }
        disabled={
          paymentLoading
        }
        className="w-9 h-9 rounded-full font-bold disabled:opacity-40"
        style={{
          border:
            '1px solid rgba(255,255,255,0.25)',

          color:
            '#ffffff',

          WebkitTextFillColor:
            '#ffffff',
        }}
      >
        ✕
      </button>
    </div>

    <p
      className="text-xs mt-4"
      style={
        WHITE_TEXT
      }
    >
      Choose how many Smart
      tokens you want.
    </p>

    {/* TOKEN PACKAGES */}
    <div className="grid grid-cols-4 gap-2 mt-3">
      {[
        1,
        5,
        10,
        20,
      ].map(
        quantity => {
          const selected =
            tokenQuantity ===
            quantity;

          return (
            <button
              type="button"
              key={
                quantity
              }
              disabled={
                paymentLoading
              }
              onClick={() => {
                setTokenQuantity(
                  quantity
                );

                setError('');
                setPaymentSuccess('');
              }}
className="light-button py-3 rounded-xl font-black text-sm transition disabled:opacity-40"              style={{
                background:
                  selected
                    ? `${accentColor}35`
                    : 'rgba(255,255,255,0.05)',

                border:
                  selected
                    ? `1px solid ${accentColor}`
                    : '1px solid rgba(255,255,255,0.15)',

                color:
                  '#ffffff',

                WebkitTextFillColor:
                  '#ffffff',
              }}
            >
              ⚡ {quantity}
            </button>
          );
        }
      )}
    </div>

    {/* PRICE */}
    <div
className="light-card rounded-xl p-4 mt-4 flex justify-between items-center"      style={{
        background:
          'rgba(255,255,255,0.05)',

        border:
          '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <div>
        <p
          className="text-[10px] tracking-widest"
          style={
            WHITE_TEXT
          }
        >
          SELECTED
        </p>

        <p
          className="font-black mt-1"
          style={
            WHITE_TEXT
          }
        >
          {tokenQuantity}{' '}
          TOKEN
          {tokenQuantity ===
          1
            ? ''
            : 'S'}
        </p>
      </div>

      <div className="text-right">
        <p
          className="text-[10px] tracking-widest"
          style={
            WHITE_TEXT
          }
        >
          PRICE
        </p>

        <p
          className="text-xl font-black mt-1"
          style={
            WHITE_TEXT
          }
        >
          R
          {tokenQuantity *
            10}
        </p>
      </div>
    </div>

    <p
      className="text-[10px] mt-3"
      style={
        WHITE_TEXT
      }
    >
      PayPal will show the
      checkout currency and final
      amount before you approve
      payment.
    </p>

    {/* PAYMENT SUCCESS */}
    {paymentSuccess && (
      <div
        className="rounded-xl p-3 mt-4"
        style={{
          background:
            'rgba(34,197,94,0.12)',

          border:
            '1px solid rgba(34,197,94,0.45)',
        }}
      >
        <p
          className="text-sm font-bold"
          style={{
            color:
              '#22c55e',

            WebkitTextFillColor:
              '#22c55e',
          }}
        >
          ✓ {paymentSuccess}
        </p>

        <p
          className="text-xs mt-2"
          style={
            WHITE_TEXT
          }
        >
          New balance: ⚡{' '}
          {
            tokenBalance.totalTokens
          }
        </p>
      </div>
    )}

    {/* PAYMENT LOADING */}
    {paymentLoading && (
      <div
        className="rounded-xl p-3 mt-4 text-center"
        style={{
          background:
            'rgba(255,255,255,0.05)',
        }}
      >
        <p
          className="text-xs font-bold"
          style={
            WHITE_TEXT
          }
        >
          VERIFYING PAYMENT...
        </p>
      </div>
    )}

    {/* PAYPAL */}
    {!paymentSuccess && (
      <div className="mt-5">
        <div
          ref={
            paypalContainerRef
          }
        />
      </div>
    )}
  </div>
)}
          {/* ERROR */}
          {error && (
            <div
              className="rounded-2xl p-4"
              style={{
                background:
                  'rgba(239,68,68,0.10)',

                border:
                  '1px solid rgba(239,68,68,0.4)',
              }}
            >
              <p
                className="text-xs tracking-widest font-bold"
                style={{
                  color:
                    '#ef4444',

                  WebkitTextFillColor:
                    '#ef4444',
                }}
              >
                SMART ERROR
              </p>

              <p
                className="text-sm mt-2"
                style={
                  WHITE_TEXT
                }
              >
                {error}
              </p>
            </div>
          )}

          {/* RESULT */}
          {result && (
            <div
              className="rounded-2xl p-5"
              style={{
                background:
                  `${resultColor}10`,

                border:
                  `1px solid ${resultColor}60`,

                boxShadow:
                  `0 0 25px ${resultColor}20`,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-xs tracking-widest"
                    style={
                      WHITE_TEXT
                    }
                  >
                    SMART RESULT
                  </p>

                  <p
                    className="text-3xl font-black mt-1"
                    style={{
                      color:
                        resultColor,

                      WebkitTextFillColor:
                        resultColor,
                    }}
                  >
                    {action}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className="font-bold"
                    style={
                      WHITE_TEXT
                    }
                  >
                    {
                      result.symbol
                    }
                  </p>

                  <p
                    className="text-xs"
                    style={
                      WHITE_TEXT
                    }
                  >
                    {
                      result.timeframe
                    }
                  </p>
                </div>
              </div>

           {isTradeSignal ? (
  <>
    {/* ENTRY / SL / TP */}
    <div className="grid grid-cols-3 gap-2 mt-5">
      <div
        className="rounded-xl p-3"
        style={{
          background: '#f2f2f2',
          color: '#000000',
        }}
      >
        <p
          className="text-[10px]"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          ENTRY
        </p>

        <p
          className="text-sm font-bold mt-1"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          {String(
            result.entry ?? '-'
          )}
        </p>
      </div>

      <div
        className="rounded-xl p-3"
        style={{
          background: '#f2f2f2',
          color: '#000000',
        }}
      >
        <p
          className="text-[10px]"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          STOP LOSS
        </p>

        <p
          className="text-sm font-bold mt-1"
          style={{
            color: '#dc2626',
            WebkitTextFillColor:
              '#dc2626',
          }}
        >
          {String(
            result.sl ?? '-'
          )}
        </p>
      </div>

      <div
        className="rounded-xl p-3"
        style={{
          background: '#f2f2f2',
          color: '#000000',
        }}
      >
        <p
          className="text-[10px]"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          TAKE PROFIT
        </p>

        <p
          className="text-sm font-bold mt-1"
          style={{
            color: '#16a34a',
            WebkitTextFillColor:
              '#16a34a',
          }}
        >
          {String(
            result.tp ?? '-'
          )}
        </p>
      </div>
    </div>

    {/* CONFIDENCE / TREND / RSI */}
    <div className="grid grid-cols-3 gap-2 mt-2">
      <div
        className="rounded-xl p-3"
        style={{
          background: '#f2f2f2',
          color: '#000000',
        }}
      >
        <p
          className="text-[10px]"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          CONFIDENCE
        </p>

        <p
          className="text-sm font-bold mt-1"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          {result.confidence ?? '-'}

          {typeof result.confidence ===
          'number'
            ? '%'
            : ''}
        </p>
      </div>

      <div
        className="rounded-xl p-3"
        style={{
          background: '#f2f2f2',
          color: '#000000',
        }}
      >
        <p
          className="text-[10px]"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          TREND
        </p>

        <p
          className="text-sm font-bold mt-1"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          {result.trend ?? '-'}
        </p>
      </div>

      <div
        className="rounded-xl p-3"
        style={{
          background: '#f2f2f2',
          color: '#000000',
        }}
      >
        <p
          className="text-[10px]"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          RSI
        </p>

        <p
          className="text-sm font-bold mt-1"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          {result.rsi ?? '-'}
        </p>
      </div>
    </div>

    {/* ANALYSIS */}
    {result.reason && (
      <div
        className="mt-4 rounded-xl p-3"
        style={{
          background: '#f2f2f2',
          color: '#000000',
        }}
      >
        <p
          className="text-[10px] tracking-widest"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          ANALYSIS
        </p>

        <p
          className="text-sm mt-2"
          style={{
            color: '#000000',
            WebkitTextFillColor:
              '#000000',
          }}
        >
          {result.reason}
        </p>
      </div>
    )}

    <p
      className="text-xs mt-4"
      style={{
        color: '#ffffff',
        WebkitTextFillColor:
          '#ffffff',
      }}
    >
      {result.charged
        ? `1 ${result.tokenCharged ?? ''} token charged.`
        : 'No token charged.'}
    </p>
  </>
) : (
<div className="light-card mt-4 rounded-xl p-4">                  <p
                    className="text-sm"
                    style={
                      WHITE_TEXT
                    }
                  >
                    {result.message ||
                      'No valid setup right now.'}
                  </p>

                  <p
                    className="text-xs mt-2"
                    style={{
                      color:
                        '#22c55e',

                      WebkitTextFillColor:
                        '#22c55e',
                    }}
                  >
                    No token charged.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ANALYZE */}
          <button
            onClick={
              analyzeMarket
            }
            disabled={
              analyzing ||
              authLoading ||
              tokenLoading ||
              !user ||
              tokenBalance
                .totalTokens <
                1
            }
            className="w-full py-5 rounded-2xl font-black text-lg tracking-wider transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background:
                accentColor,

              color:
                '#ffffff',

              WebkitTextFillColor:
                '#ffffff',

              boxShadow:
                analyzing
                  ? undefined
                  : `0 0 30px ${accentColor}80`,
            }}
          >
            {authLoading
              ? 'CHECKING ACCOUNT...'
              : analyzing
                ? `⚡ ANALYZING ${selectedSymbol}...`
                : tokenBalance.totalTokens <
                    1
                  ? 'NO SMART TOKENS'
                  : `⚡ ANALYZE ${selectedSymbol}`}
          </button>

          <p
            className="text-center text-[10px]"
            style={
              WHITE_TEXT
            }
          >
            Smart analysis can
            return NO TRADE when
            no valid setup is
            available.
          </p>
        </div>
      </div>
    </>
  );
}