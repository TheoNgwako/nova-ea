'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  onAuthStateChanged,
  User,
} from 'firebase/auth';

import {
  auth,
} from '../../lib/firebase';

export default function StudentMetatrader() {
  const [
    user,
    setUser,
  ] = useState<User | null>(
    null
  );

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  const [
    generating,
    setGenerating,
  ] = useState(false);

  const [
    pairingCode,
    setPairingCode,
  ] = useState('');

  const [
    serverUrl,
    setServerUrl,
  ] = useState(
    'https://signals.novamobiles.co.za'
  );

  const [
    expiresAt,
    setExpiresAt,
  ] = useState('');

  const [
    error,
    setError,
  ] = useState('');

  const [
    copied,
    setCopied,
  ] = useState(false);

  // ========================================
  // AUTH
  // ========================================

  useEffect(() => {
    // Remove the OLD insecure browser
    // credential storage if it exists.
    localStorage.removeItem(
      'mt5_credentials'
    );

    const unsubscribe =
      onAuthStateChanged(
        auth,
        currentUser => {
          if (!currentUser) {
            window.location.href =
              '/student-entry';

            return;
          }

          setUser(
            currentUser
          );

          setAuthLoading(
            false
          );
        }
      );

    return () =>
      unsubscribe();
  }, []);

  // ========================================
  // GENERATE PAIRING CODE
  // ========================================

  const generatePairingCode =
    async () => {
      if (!user) {
        setError(
          'Student authentication required.'
        );

        return;
      }

      setGenerating(true);
      setError('');
      setCopied(false);

      try {
        const idToken =
          await user.getIdToken(
            true
          );

        const response =
          await fetch(
            '/api/ea/pair',
            {
              method:
                'POST',

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

        if (!response.ok) {
          throw new Error(
            data?.error ||
              'Could not generate MT5 pairing code'
          );
        }

        if (
          !data?.pairingCode
        ) {
          throw new Error(
            'Server did not return a pairing code'
          );
        }

        setPairingCode(
          data.pairingCode
        );

        setServerUrl(
          data.serverUrl ||
            'https://signals.novamobiles.co.za'
        );

        setExpiresAt(
          data.expiresAt || ''
        );
      } catch (err) {
        console.error(
          'MT5 pairing error:',
          err
        );

        setPairingCode('');

        setError(
          err instanceof Error
            ? err.message
            : 'Could not generate MT5 pairing code'
        );
      } finally {
        setGenerating(false);
      }
    };

  // ========================================
  // COPY PAIRING CODE
  // ========================================

  const copyPairingCode =
    async () => {
      if (!pairingCode) {
        return;
      }

      try {
        await navigator.clipboard
          .writeText(
            pairingCode
          );

        setCopied(true);

        setTimeout(
          () =>
            setCopied(false),
          2000
        );
      } catch {
        const textarea =
          document.createElement(
            'textarea'
          );

        textarea.value =
          pairingCode;

        document.body
          .appendChild(
            textarea
          );

        textarea.select();

        document.execCommand(
          'copy'
        );

        textarea.remove();

        setCopied(true);

        setTimeout(
          () =>
            setCopied(false),
          2000
        );
      }
    };

  // ========================================
  // LOADING
  // ========================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400">
          Checking student account...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* =================================
          HEADER
      ================================= */}

      <header className="bg-black/90 border-b border-red-500/20 px-4 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <Link
          href="/student"
          className="text-red-400 text-sm hover:text-red-300 transition"
        >
          ← Back
        </Link>

        <div className="text-lg font-bold text-red-500">
          PIXEL FORGE
        </div>

        <div className="w-16" />
      </header>

      {/* =================================
          PAGE
      ================================= */}

      <main className="pt-20 pb-28 px-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">
          Connect MT5
        </h1>

        <p className="text-gray-400 text-sm mb-6">
          Securely pair your PIXEL FORGE Expert Advisor with your student account.
        </p>

        {/* =================================
            SECURITY NOTICE
        ================================= */}

        <div className="mb-6 p-4 rounded-xl border border-green-500/20 bg-green-500/5">
          <p className="text-green-400 font-bold text-sm mb-2">
            Secure connection
          </p>

          <p className="text-gray-400 text-xs leading-5">
            PIXEL FORGE does not need your MT5 password.
            Your broker account stays logged into the
            official MetaTrader 5 terminal on your computer.
          </p>
        </div>

        {/* =================================
            MT5 PLATFORM
        ================================= */}

        <div className="mb-6">
          <div className="w-full py-3 rounded-xl bg-red-600 text-white text-center font-bold">
            MetaTrader 5
          </div>

          <p className="text-gray-600 text-xs text-center mt-2">
            MT4 support will be added separately.
          </p>
        </div>

        {/* =================================
            GENERATE
        ================================= */}

        {!pairingCode && (
          <div className="border border-red-500/20 bg-black/50 rounded-xl p-5">
            <h2 className="font-bold text-lg mb-2">
              Pair your EA
            </h2>

            <p className="text-gray-400 text-sm mb-5 leading-6">
              Generate a private pairing code and enter it
              inside the PixelForgeEA settings in MT5.
            </p>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={
                generatePairingCode
              }
              disabled={
                generating ||
                !user
              }
              className="w-full py-4 bg-red-600 rounded-xl font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              {generating
                ? 'Generating...'
                : 'Generate MT5 Pairing Code'}
            </button>
          </div>
        )}

        {/* =================================
            PAIRING CODE
        ================================= */}

        {pairingCode && (
          <div className="border border-red-500/30 bg-black/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg">
                  MT5 Pairing Code
                </h2>

                <p className="text-gray-500 text-xs mt-1">
                  Keep this code private.
                </p>
              </div>

              <span className="w-3 h-3 rounded-full bg-green-500" />
            </div>

            <div className="bg-white rounded-xl p-4 mb-3">
              <p className="text-black font-mono text-xs break-all select-all">
                {pairingCode}
              </p>
            </div>

            <button
              type="button"
              onClick={
                copyPairingCode
              }
              className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition"
            >
              {copied
                ? 'Copied ✓'
                : 'Copy Pairing Code'}
            </button>

            {expiresAt && (
              <p className="text-gray-500 text-xs mt-3 text-center">
                Pairing expires:{' '}
                {new Date(
                  expiresAt
                ).toLocaleString()}
              </p>
            )}

            <div className="mt-6 border-t border-red-500/20 pt-5">
              <h3 className="font-bold mb-4">
                MT5 setup
              </h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-red-400 font-bold mb-1">
                    1. Open MetaTrader 5
                  </p>

                  <p className="text-gray-400">
                    Open the chart where you want to attach
                    PixelForgeEA.
                  </p>
                </div>

                <div>
                  <p className="text-red-400 font-bold mb-1">
                    2. Attach PixelForgeEA
                  </p>

                  <p className="text-gray-400">
                    Navigator → Expert Advisors →
                    PixelForgeEA.
                  </p>
                </div>

                <div>
                  <p className="text-red-400 font-bold mb-1">
                    3. Enter PairingCode
                  </p>

                  <p className="text-gray-400">
                    Paste the code above into the EA&apos;s
                    PairingCode input.
                  </p>
                </div>

                <div>
                  <p className="text-red-400 font-bold mb-1">
                    4. Server URL
                  </p>

                  <div className="mt-2 bg-white rounded-lg p-3">
                    <p className="text-black font-mono text-xs break-all select-all">
                      {serverUrl}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={
                generatePairingCode
              }
              disabled={
                generating
              }
              className="w-full mt-6 py-3 border border-red-500/40 rounded-xl text-red-400 font-bold hover:bg-red-500/10 transition disabled:opacity-50"
            >
              {generating
                ? 'Generating...'
                : 'Generate New Code'}
            </button>

            <p className="text-gray-600 text-xs text-center mt-3">
              Generating a new code disables your previous
              PIXEL FORGE EA pairing.
            </p>
          </div>
        )}

        {/* =================================
            IMPORTANT
        ================================= */}

        <div className="mt-6 p-4 bg-black/50 border border-red-500/20 rounded-xl">
          <p className="text-gray-400 text-xs leading-5">
            Never enter your broker password on the PIXEL
            FORGE website. The EA communicates with PIXEL
            FORGE while your MT5 terminal remains logged into
            your broker normally.
          </p>
        </div>
      </main>

      {/* =================================
          BOTTOM NAV
      ================================= */}

      <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-red-500/20 flex justify-around py-3">
        <Link
          href="/student/metatrader"
          className="text-red-500 text-xs flex flex-col items-center"
        >
          <span className="text-xl">
            ●
          </span>

          <span>
            MT5
          </span>
        </Link>

        <Link
          href="/student"
          className="text-gray-500 text-xs flex flex-col items-center hover:text-red-400 transition"
        >
          <span className="text-xl">
            ○
          </span>

          <span>
            Home
          </span>
        </Link>

        <Link
          href="/student/settings"
          className="text-gray-500 text-xs flex flex-col items-center hover:text-red-400 transition"
        >
          <span className="text-xl">
            ⚙
          </span>

          <span>
            Settings
          </span>
        </Link>
      </div>
    </div>
  );
}