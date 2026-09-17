'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Already logged in:', user.email);
        router.push('/mentor');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Login attempt:', email);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login success:', userCredential.user.email);
      router.push('/mentor');
    } catch (err: any) {
      console.error('Login error:', err.code, err.message);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError('Login failed: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-red-500">NOVA EA</h1>
          <p className="text-gray-400 text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-gray-400 text-sm block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mentor@nova-ea.com"
                required
                className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
              />
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-red-400 text-sm hover:text-red-300 transition">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-red-400 hover:text-red-300 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}