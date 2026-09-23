'use client';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from 'firebase/auth';

import { auth } from '../lib/firebase';

declare global {
  interface Window {
    paypal?: any;
  }
}

type Step =
  | 'home'
  | 'payment'
  | 'key';

export default function StudentEntry() {
  const [step, setStep] =
    useState<Step>('home');

  const [email, setEmail] =
    useState('');

  const [
    paymentEmail,
    setPaymentEmail,
  ] = useState('');

  const [
    paymentEmailConfirmed,
    setPaymentEmailConfirmed,
  ] = useState(false);

  const [mentorId, setMentorId] =
    useState('');

  const [
    studentKey,
    setStudentKey,
  ] = useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const paypalContainerRef =
    useRef<HTMLDivElement>(null);

  const paypalRenderedRef =
    useRef(false);

  const paymentEmailRef =
    useRef('');

  // =========================
  // EXISTING FIREBASE SESSION
  // =========================
  useEffect(() => {
    let cancelled = false;

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (
            !user ||
            cancelled
          ) {
            return;
          }

          try {
            const tokenResult =
              await user.getIdTokenResult(
                true
              );

            if (cancelled) {
              return;
            }

            // =========================
            // IMPORTANT
            // =========================
            //
            // Student Entry must NEVER
            // sign out a mentor.
            //
            // A non-student Firebase
            // account belongs to another
            // part of the application.
            // Leave that session alone.
            // =========================

            if (
              tokenResult.claims.role !==
              'student'
            ) {
              return;
            }

            const idToken =
              await user.getIdToken();

            const res =
              await fetch(
                '/api/trading/state',
                {
                  method: 'GET',

                  headers: {
                    Authorization:
                      `Bearer ${idToken}`,
                  },

                  cache:
                    'no-store',
                }
              );

            if (cancelled) {
              return;
            }

            // Existing valid student.
            if (res.ok) {
              window.location.replace(
                '/student'
              );

              return;
            }

            // Existing STUDENT session
            // is invalid/expired/replaced.
            // Only student sessions are
            // allowed to be signed out
            // from this page.

            await signOut(auth);

            localStorage.removeItem(
              'student_demo'
            );

            localStorage.removeItem(
              'student_logged_in'
            );
          } catch (err) {
            console.error(
              'Student session check failed:',
              err
            );

            /*
             * Do NOT automatically call
             * signOut here.
             *
             * A network/token refresh
             * failure is not enough to
             * prove that another type of
             * Firebase account should be
             * destroyed.
             */
          }
        }
      );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);
  // =========================
  // START PAYMENT
  // =========================

  const startPayment = () => {
    setError('');

    setPaymentEmail('');

    setPaymentEmailConfirmed(
      false
    );

    paymentEmailRef.current = '';

    paypalRenderedRef.current =
      false;

    setStep('payment');
  };

  // =========================
  // CONFIRM PAYMENT EMAIL
  // =========================

  const handlePaymentEmailSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');

    const cleanEmail =
      paymentEmail
        .trim()
        .toLowerCase();

    if (!cleanEmail) {
      setError(
        'Please enter your email.'
      );

      return;
    }

    setPaymentEmail(cleanEmail);

    paymentEmailRef.current =
      cleanEmail;

    paypalRenderedRef.current =
      false;

    setPaymentEmailConfirmed(
      true
    );
  };

  // =========================
  // CHECK ALREADY PAID EMAIL
  // =========================

  const handlePaidEmailSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setError('');
      setLoading(true);

      try {
        const cleanEmail =
          email
            .trim()
            .toLowerCase();

        if (!cleanEmail) {
          setError(
            'Please enter your email.'
          );

          return;
        }

        setEmail(cleanEmail);

        const res = await fetch(
          '/api/students/check',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              email: cleanEmail,
            }),
          }
        );

        const data =
          await res.json();

        if (!res.ok) {
          setError(
            data.error ||
              'Could not check email'
          );

          return;
        }

        if (data.paid !== true) {
          setError(
            'Email not recognised as activated. Please pay the R600 activation fee first.'
          );

          return;
        }

        setStep('key');
      } catch (err) {
        console.error(err);

        setError(
          'Something went wrong while checking your email.'
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // PAYPAL
  // =========================

  useEffect(() => {
    if (
      step !== 'payment' ||
      !paymentEmailConfirmed
    ) {
      return;
    }

    let cancelled = false;

    const loadPayPal =
      async () => {
        try {
          setError('');

          // =========================
          // GET PAYPAL CONFIG
          // =========================

          const configRes =
            await fetch(
              '/api/paypal/config',
              {
                cache: 'no-store',
              }
            );

          const config =
            await configRes.json();

          if (
            !configRes.ok ||
            !config.clientId
          ) {
            throw new Error(
              config.error ||
                'Could not load PayPal configuration'
            );
          }

          // =========================
          // LOAD PAYPAL SDK ONCE
          // =========================

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
                  config.currency
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
                if (window.paypal) {
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

          // =========================
          // STOP IF PAGE CHANGED
          // =========================

          if (
            cancelled ||
            !window.paypal ||
            !paypalContainerRef.current ||
            paypalRenderedRef.current
          ) {
            return;
          }

          // =========================
          // CLEAR OLD BUTTONS
          // =========================

          paypalContainerRef.current.innerHTML =
            '';

          paypalRenderedRef.current =
            true;

          // =========================
          // PAYPAL BUTTONS
          // =========================

          const buttons =
            window.paypal.Buttons({
              style: {
                layout:
                  'vertical',
                shape: 'rect',
                label: 'paypal',
              },

              // =========================
              // CREATE ORDER
              // =========================

              createOrder:
                async () => {
                  const cleanEmail =
                    paymentEmailRef.current;

                  if (
                    !cleanEmail
                  ) {
                    setError(
                      'Payment email is required.'
                    );

                    throw new Error(
                      'Payment email is required'
                    );
                  }

                  setError('');

                  const res =
                    await fetch(
                      '/api/paypal/create-order',
                      {
                        method:
                          'POST',
                      }
                    );

                  const data =
                    await res.json();

                  if (
                    !res.ok ||
                    !data.orderId
                  ) {
                    throw new Error(
                      data.error ||
                        'Could not create PayPal order'
                    );
                  }

                  return data.orderId;
                },

              // =========================
              // PAYMENT APPROVED
              // =========================

              onApprove:
                async (
                  data: any,
                  actions: any
                ) => {
                  try {
                    setLoading(
                      true
                    );

                    setError('');

                    const cleanEmail =
                      paymentEmailRef.current;

                    if (
                      !cleanEmail
                    ) {
                      setError(
                        'Payment email is missing. Please enter your email again.'
                      );

                      return;
                    }

                    // =========================
                    // CAPTURE PAYMENT
                    // =========================

                    const res =
                      await fetch(
                        '/api/paypal/capture-order',
                        {
                          method:
                            'POST',

                          headers:
                            {
                              'Content-Type':
                                'application/json',
                            },

                          body:
                            JSON.stringify(
                              {
                                orderId:
                                  data.orderID,

                                email:
                                  cleanEmail,
                              }
                            ),
                        }
                      );

                    const result =
                      await res.json();

                    // =========================
                    // FUNDING SOURCE DECLINED
                    // =========================

                    if (
                      result.code ===
                      'INSTRUMENT_DECLINED'
                    ) {
                      setError(
                        'That payment method was declined. Please try another card or payment method.'
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

                    // =========================
                    // OTHER CAPTURE ERROR
                    // =========================

                    if (
                      !res.ok ||
                      !result.success
                    ) {
                      setError(
                        result.error ||
                          'Payment could not be verified. Please try again.'
                      );

                      return;
                    }

                    // =========================
                    // PAYMENT VERIFIED
                    // =========================

                    setEmail(
                      cleanEmail
                    );

                    setStep(
                      'key'
                    );
                  } catch (err) {
                    console.error(
                      'Payment verification error:',
                      err
                    );

                    setError(
                      'Something went wrong while verifying the payment. Please try again.'
                    );
                  } finally {
                    setLoading(
                      false
                    );
                  }
                },

              // =========================
              // PAYMENT CANCELLED
              // =========================

              onCancel: () => {
                setError(
                  'Payment was cancelled. You have not been charged.'
                );
              },

              // =========================
              // PAYPAL SDK ERROR
              // =========================

              onError:
                (err: any) => {
                  console.error(
                    'PayPal checkout error:',
                    err
                  );

                  setError(
                    'PayPal checkout could not be completed. Please try again.'
                  );
                },
            });

          // =========================
          // RENDER PAYPAL
          // =========================

          await buttons.render(
            paypalContainerRef.current
          );
        } catch (err) {
          console.error(
            'PayPal load error:',
            err
          );

          paypalRenderedRef.current =
            false;

          setError(
            err instanceof Error
              ? err.message
              : 'Could not load PayPal checkout'
          );
        }
      };

    loadPayPal();

    return () => {
      cancelled = true;
    };
  }, [
    step,
    paymentEmailConfirmed,
  ]);

  // =========================
  // VERIFY MENTOR KEY
  // =========================

  const handleKeySubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setError('');
      setLoading(true);

      try {
        const cleanEmail =
          email
            .trim()
            .toLowerCase();

        const res = await fetch(
          '/api/keys/verify',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              mentorId,
              key: studentKey,
              email: cleanEmail,
            }),
          }
        );

        const data =
          await res.json();

        if (
          !res.ok ||
          !data.success
        ) {
          setError(
            data.error ||
              'Invalid license key'
          );

          return;
        }

        // =========================
        // REQUIRE AUTH TOKEN
        // =========================

        if (!data.customToken) {
          setError(
            'Student authentication could not be created.'
          );

          return;
        }

        // =========================
        // REAL FIREBASE SIGN-IN
        // =========================

        const credential =
          await signInWithCustomToken(
            auth,
            data.customToken
          );

        // Force refresh so the
        // student role claim is
        // available immediately.

        await credential.user
          .getIdToken(true);

        // =========================
        // UI PROFILE DATA ONLY
        // =========================
        //
        // This object is NOT proof
        // of authentication.
        // Firebase Auth is now the
        // authority.
        // =========================

        localStorage.setItem(
          'student_demo',
          JSON.stringify({
            email:
              cleanEmail,

            mentorId,

            enteredAt:
              new Date()
                .toISOString(),
          })
        );

        // Remove the old fake
        // authentication flag.

        localStorage.removeItem(
          'student_logged_in'
        );

        window.location.href =
          '/student';
      } catch (err) {
        console.error(
          'Student activation error:',
          err
        );

        setError(
          'Something went wrong while activating your account.'
        );
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-red-500 text-glow-red mb-2">
            PIXEL FORGE
          </div>

          <p className="text-gray-400 text-sm">
            Student Access
          </p>
        </div>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-8 glow-red">

          {/* ========================= */}
          {/* HOME */}
          {/* ========================= */}

          {step ===
            'home' && (
            <div className="space-y-7">

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* NEW STUDENT */}

              <div className="text-center">
                <h2 className="text-xl font-bold">
                  New Student?
                </h2>

                <p className="text-gray-400 text-sm mt-2 mb-4">
                  Activate your
                  account with a
                  once-off payment.
                </p>

                <button
                  type="button"
                  onClick={
                    startPayment
                  }
                  className="w-full py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition"
                >
                  Pay R600
                  Activation
                </button>
              </div>

              {/* DIVIDER */}

              <div className="flex items-center gap-3">
                <div className="h-px bg-gray-800 flex-1" />

                <span className="text-gray-600 text-xs">
                  OR
                </span>

                <div className="h-px bg-gray-800 flex-1" />
              </div>

              {/* ALREADY PAID */}

              <form
                onSubmit={
                  handlePaidEmailSubmit
                }
                className="space-y-4"
              >
                <div className="text-center">
                  <h2 className="text-lg font-bold">
                    Already Paid?
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">
                    Enter the email
                    you used when
                    activating.
                  </p>
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target
                        .value
                    )
                  }
                  placeholder="student@email.com"
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
                />

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="w-full py-3 border border-red-500 text-red-500 rounded-lg font-bold hover:bg-red-500/10 transition disabled:opacity-50"
                >
                  {loading
                    ? 'Checking...'
                    : 'Continue'}
                </button>
              </form>
            </div>
          )}

          {/* ========================= */}
          {/* PAYMENT */}
          {/* ========================= */}

          {step ===
            'payment' && (
            <div className="space-y-5">

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="text-center">
                <h2 className="text-xl font-bold">
                  Activate Your
                  Account
                </h2>

                <p className="text-gray-400 text-sm mt-2">
                  Enter the email
                  that will be
                  activated.
                </p>
              </div>

              {/* EMAIL FIRST */}

              {!paymentEmailConfirmed && (
                <form
                  onSubmit={
                    handlePaymentEmailSubmit
                  }
                  className="space-y-4"
                >
                  <input
                    type="email"
                    value={
                      paymentEmail
                    }
                    onChange={(
                      e
                    ) =>
                      setPaymentEmail(
                        e.target
                          .value
                      )
                    }
                    placeholder="student@email.com"
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
                  />

                  <button
                    type="submit"
                    className="w-full py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition"
                  >
                    Continue to
                    Payment
                  </button>
                </form>
              )}

              {/* PAYMENT READY */}

              {paymentEmailConfirmed && (
                <>
                  <div className="bg-black/40 border border-red-500/20 rounded-lg p-3">
                    <p className="text-gray-500 text-xs">
                      Activating
                    </p>

                    <p className="text-white text-sm break-all">
                      {
                        paymentEmail
                      }
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setError(
                          ''
                        );

                        setPaymentEmailConfirmed(
                          false
                        );

                        paypalRenderedRef.current =
                          false;
                      }}
                      className="text-red-400 text-xs mt-2 hover:text-red-300"
                    >
                      Change email
                    </button>
                  </div>

                  {/* PRICE */}

                  <div className="border border-red-500/20 rounded-lg p-4 text-center">
                    <p className="text-gray-400 text-sm">
                      Once-Off
                      Activation
                    </p>

                    <p className="text-3xl font-bold text-red-500 mt-1">
                      R600
                    </p>

                    <p className="text-gray-500 text-xs mt-2">
                      Payment is
                      processed
                      securely through
                      PayPal in USD.
                    </p>
                  </div>

                  {/* PAYPAL */}

                  <div
                    ref={
                      paypalContainerRef
                    }
                  />

                  {loading && (
                    <p className="text-gray-400 text-sm text-center">
                      Verifying
                      payment...
                    </p>
                  )}
                </>
              )}

              {/* BACK */}

              <button
                type="button"
                onClick={() => {
                  setError('');

                  setPaymentEmail(
                    ''
                  );

                  setPaymentEmailConfirmed(
                    false
                  );

                  paymentEmailRef.current =
                    '';

                  paypalRenderedRef.current =
                    false;

                  setStep(
                    'home'
                  );
                }}
                className="w-full text-gray-400 text-sm hover:text-white transition"
              >
                ← Back
              </button>
            </div>
          )}

          {/* ========================= */}
          {/* MENTOR ACCESS */}
          {/* ========================= */}

          {step ===
            'key' && (
            <form
              onSubmit={
                handleKeySubmit
              }
              className="space-y-4"
            >

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="text-center mb-5">
                <h2 className="text-xl font-bold">
                  Mentor Access
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  {email}
                </p>
              </div>

              {/* MENTOR ID */}

              <div>
                <label className="text-gray-400 text-sm block mb-2">
                  Mentor ID
                </label>

                <input
                  type="text"
                  value={
                    mentorId
                  }
                  onChange={(
                    e
                  ) =>
                    setMentorId(
                      e.target
                        .value
                    )
                  }
                  placeholder="Enter mentor ID"
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition uppercase"
                />
              </div>

              {/* LICENSE KEY */}

              <div>
                <label className="text-gray-400 text-sm block mb-2">
                  License Key
                </label>

                <input
                  type="text"
                  value={
                    studentKey
                  }
                  onChange={(
                    e
                  ) =>
                    setStudentKey(
                      e.target
                        .value
                    )
                  }
                  placeholder="Enter 15-character key"
                  required
                  maxLength={15}
                  className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition uppercase tracking-wider"
                />
              </div>

              {/* ACTIVATE */}

              <button
                type="submit"
                disabled={
                  loading
                }
                className="w-full py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading
                  ? 'Verifying...'
                  : 'Activate Bot'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}