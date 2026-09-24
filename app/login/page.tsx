'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import Link from 'next/link';

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';



import {
  auth,
} from '../lib/firebase';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [
    checkingSession,
    setCheckingSession,
  ] = useState(true);

  // =========================
  // VERIFY MENTOR
  // =========================
const isMentor =
  async (uid: string) => {
    const user =
      auth.currentUser;

    if (
      !user ||
      user.uid !== uid
    ) {
      return false;
    }

    const idToken =
      await user.getIdToken();

    const response =
      await fetch(
        '/api/mentors/verify',
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${idToken}`,
          },
          cache: 'no-store',
        }
      );

    const data =
      await response
        .json()
        .catch(() => ({}));

    if (!response.ok) {
      if (response.status === 403) {
        return false;
      }

      throw new Error(
        data.code ||
          'MENTOR_VERIFY_FAILED'
      );
    }

    if (data.success !== true) {
      return false;
    }

    // Refresh Firebase token so
    // role: mentor becomes active.
    await user.getIdToken(true);

    return true;
  };

  // =========================
  // EXISTING SESSION
  // =========================

  useEffect(() => {
    let active = true;

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!active) {
            return;
          }

          if (!user) {
            setCheckingSession(
              false
            );

            return;
          }

          try {
            const mentor =
              await isMentor(
                user.uid
              );

            if (!active) {
              return;
            }

            if (mentor) {
              router.replace(
                '/mentor'
              );

              return;
            }

            // Firebase account exists,
            // but there is no mentor
            // record for this UID.
            await signOut(auth);

            if (active) {
              setCheckingSession(
                false
              );
            }
          } catch (err) {
            console.error(
              'Mentor session verification failed:',
              err
            );

            /*
             * IMPORTANT:
             *
             * A temporary Firestore/read
             * failure is NOT proof that
             * the user is unauthorized.
             *
             * Do not destroy the Firebase
             * session here.
             */
            if (active) {
              setCheckingSession(
                false
              );
            }
          }
        }
      );

    return () => {
      active = false;
      unsubscribe();
    };
  }, [router]);

  // =========================
  // LOGIN
  // =========================

  const handleLogin =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setError('');
      setLoading(true);

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      try {
        // =========================
        // FIREBASE LOGIN
        // =========================

        const userCredential =
          await signInWithEmailAndPassword(
            auth,
            cleanEmail,
            password
          );

        // =========================
        // VERIFY MENTOR RECORD
        // =========================

        const mentor =
          await isMentor(
            userCredential
              .user.uid
          );

        if (!mentor) {
          await signOut(auth);

          setError(
            'This account does not have mentor access.'
          );

          return;
        }

        // =========================
        // MENTOR VERIFIED
        // =========================

        router.replace(
          '/mentor'
        );
      } catch (err: any) {
        console.error(
          'Mentor login error:',
          err?.code ||
            err?.message
        );

        if (
          err?.code ===
          'auth/invalid-email'
        ) {
          setError(
            'Invalid email address'
          );
        } else if (
          err?.code ===
          'auth/invalid-credential' ||
          err?.code ===
          'auth/user-not-found' ||
          err?.code ===
          'auth/wrong-password'
        ) {
          // Keep this intentionally
          // generic so the login page
          // does not reveal whether a
          // particular account exists.
          setError(
            'Invalid email or password'
          );
        } else if (
          err?.code ===
          'auth/too-many-requests'
        ) {
          setError(
            'Too many login attempts. Please wait and try again.'
          );
        } else {
          setError(
            'Login failed. Please try again.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // SESSION CHECK SCREEN
  // =========================

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 font-black tracking-wider text-xl">
            PIXEL FORGE
          </div>

          <p className="text-gray-500 text-xs mt-3">
            Checking secure session...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // LOGIN UI
  // =========================

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-500">
            PIXEL FORGE
          </h1>

          <p className="text-gray-400 text-sm mt-2">
            Mentor Sign In
          </p>
        </div>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-8">

          <form
            onSubmit={
              handleLogin
            }
            className="space-y-4"
          >

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* EMAIL */}

            <div>
              <label className="text-gray-400 text-sm block mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                placeholder="mentor@email.com"
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label className="text-gray-400 text-sm block mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
              />
            </div>

            {/* FORGOT PASSWORD */}

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-red-400 text-sm hover:text-red-300 transition"
              >
                Forgot Password?
              </Link>
            </div>

            {/* LOGIN */}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading
                ? 'Signing in...'
                : 'Sign In'}
            </button>
          </form>

          {/* SIGN UP */}

          <div className="mt-6 text-center text-gray-400 text-sm">
            Don't have a mentor
            account?{' '}

            <Link
              href="/signup"
              className="text-red-400 hover:text-red-300 transition"
            >
              Sign Up
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}