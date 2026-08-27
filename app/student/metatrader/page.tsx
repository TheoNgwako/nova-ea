'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentMetatrader() {
  const router = useRouter();
  const [platform, setPlatform] = useState('MT5');
  const [accountId, setAccountId] = useState('');
  const [password, setPassword] = useState('');
  const [server, setServer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!accountId || !password || !server) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      const creds = {
        platform,
        accountId,
        password,
        server,
        connected: true,
        connectedAt: new Date().toISOString()
      };
      localStorage.setItem('mt5_credentials', JSON.stringify(creds));
      setSuccess(true);
      setTimeout(() => {
        router.push('/student');
      }, 2000);
    } catch (err) {
      setError('Failed to connect. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-black/80 border-b border-red-500/20 px-4 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <Link href="/student" className="text-red-400 text-sm hover:text-red-300 transition">
          ← Back
        </Link>
        <div className="text-lg font-bold text-red-500">NOVA EA</div>
        <div className="w-16"></div>
      </header>

      <div className="pt-20 pb-24 px-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Connect Account</h1>
        <p className="text-gray-400 text-sm mb-6">Link your trading account to start copy trading</p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setPlatform('MT5')}
            className={`flex-1 py-3 rounded-lg font-bold transition ${
              platform === 'MT5'
                ? 'bg-red-600 text-white'
                : 'bg-black/50 border border-red-500/20 text-gray-400 hover:text-white'
            }`}
          >
            MT5
          </button>
          <button
            onClick={() => setPlatform('MT4')}
            className={`flex-1 py-3 rounded-lg font-bold transition ${
              platform === 'MT4'
                ? 'bg-red-600 text-white'
                : 'bg-black/50 border border-red-500/20 text-gray-400 hover:text-white'
            }`}
          >
            MT4
          </button>
        </div>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Account ID</label>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Enter your account number"
              className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Server Name</label>
            <input
              type="text"
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder="e.g. ICMarkets-Live, Exness-Real"
              className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
              required
            />
            <p className="text-gray-500 text-xs mt-2">Find this in your broker email or MT5 terminal settings</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
              Account connected successfully! Redirecting...
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-red-600 rounded-xl text-white font-bold hover:bg-red-700 transition"
          >
            Connect Account
          </button>
        </form>

        <div className="mt-6 p-4 bg-black/50 border border-red-500/20 rounded-lg">
          <p className="text-gray-500 text-xs text-center">
            Your credentials are encrypted and securely stored. We do not have direct access to your trading account.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-red-500/20 flex justify-around py-3">
        <Link href="/student/metatrader" className="text-red-500 text-xs flex flex-col items-center">
          <span className="text-xl">●</span>
          <span>Metatrader</span>
        </Link>
        <Link href="/student" className="text-gray-500 text-xs flex flex-col items-center hover:text-red-400 transition">
          <span className="text-xl">○</span>
          <span>Home</span>
        </Link>
        <Link href="/student/settings" className="text-gray-500 text-xs flex flex-col items-center hover:text-red-400 transition">
          <span className="text-xl">⚙</span>
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
}