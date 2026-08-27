'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function DownloadPage() {
  const [platform, setPlatform] = useState('android');

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="text-2xl font-bold text-red-500 text-glow-red cursor-pointer">
              NOVA EA
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Get the App</h1>
          <p className="text-gray-400 text-sm">Install NOVA EA on your device</p>
        </div>

        <div className="flex bg-black/50 border border-red-500/20 rounded-xl p-1 mb-6">
          <button
            onClick={() => setPlatform('android')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              platform === 'android'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Android
          </button>
          <button
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              platform === 'ios'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            iOS
          </button>
        </div>

        {platform === 'android' && (
          <div className="bg-black/50 border border-red-500/20 rounded-xl p-6 glow-red">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">📱</div>
              <h2 className="text-xl font-bold text-white">Android</h2>
              <p className="text-gray-400 text-sm">Add to home screen from Chrome</p>
            </div>

            <ol className="text-gray-400 text-sm space-y-3 text-left list-decimal list-inside mb-4">
              <li>Open <span className="text-red-400">nova-ea.com</span> in Chrome</li>
              <li>Tap the three dots <span className="text-white">⋮</span> in the top right</li>
              <li>Tap <span className="text-red-400">Add to Home Screen</span></li>
              <li>Tap <span className="text-red-400">Add</span></li>
              <li>Launch the icon — it opens full screen</li>
            </ol>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-xs text-center">
                💡 The app works offline and looks like a native app
              </p>
            </div>
          </div>
        )}

        {platform === 'ios' && (
          <div className="bg-black/50 border border-red-500/20 rounded-xl p-6 glow-red">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🍎</div>
              <h2 className="text-xl font-bold text-white">iOS</h2>
              <p className="text-gray-400 text-sm">Add to home screen from Safari</p>
            </div>

            <ol className="text-gray-400 text-sm space-y-3 text-left list-decimal list-inside mb-4">
              <li>Open <span className="text-red-400">nova-ea.com</span> in Safari</li>
              <li>Tap the Share button <span className="text-white">⎔</span> at the bottom</li>
              <li>Scroll and tap <span className="text-red-400">Add to Home Screen</span></li>
              <li>Tap <span className="text-red-400">Add</span> in the top right</li>
              <li>Launch the icon — it opens full screen</li>
            </ol>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-400 text-xs text-center">
                💡 The app works offline and looks like a native app
              </p>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-500 hover:text-red-400 text-sm transition">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}