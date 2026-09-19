'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Notif = {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL';
  entry: string;
  tp: string;
  sl: string;
  confidence: number;
  rsi: number;
  timestamp: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth
    const isLoggedIn = localStorage.getItem('student_logged_in');
    if (isLoggedIn !== 'true') {
      window.location.href = '/student-entry';
      return;
    }

    // Load notifications
    try {
      const history = JSON.parse(localStorage.getItem('notif_history') || '[]');
      setNotifs(history);
    } catch (e) {
      setNotifs([]);
    }
    setLoading(false);
  }, []);

  const deleteNotif = (id: string) => {
    const updated = notifs.filter(n => n.id !== id);
    setNotifs(updated);
    localStorage.setItem('notif_history', JSON.stringify(updated));
  };

  const clearAll = () => {
    if (!confirm('Delete all notifications?')) return;
    setNotifs([]);
    localStorage.setItem('notif_history', '[]');
  };

  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleString();
    } catch {
      return ts;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-black/80 border-b border-red-500/20 px-4 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <Link href="/student/settings" className="text-red-400 text-sm hover:text-red-300 transition">
          ← Back
        </Link>
        <div className="text-lg font-bold text-red-500">NOVA EA</div>
        <button
          onClick={clearAll}
          disabled={notifs.length === 0}
          className="text-red-400 text-xs hover:text-red-300 transition disabled:opacity-30"
        >
          Clear All
        </button>
      </header>

      <div className="pt-20 px-4 max-w-md mx-auto pb-20">
        <h1 className="text-2xl font-bold text-white mb-6">Notifications</h1>

        {notifs.length === 0 ? (
          <div className="bg-black/50 border border-red-500/20 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">No notifications yet</p>
            <p className="text-gray-600 text-xs mt-2">Signals will appear here when they fire</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifs.map((notif) => (
              <div
                key={notif.id}
                className="bg-black/50 border rounded-xl p-4 relative"
                style={{
                  borderColor: notif.action === 'BUY' ? '#22c55e40' : '#ef444440',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span
                      className={`font-bold text-sm ${notif.action === 'BUY' ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {notif.action} {notif.symbol}
                    </span>
                    <p className="text-gray-500 text-[10px] mt-1">{formatTime(notif.timestamp)}</p>
                  </div>
                  <button
                    onClick={() => deleteNotif(notif.id)}
                    className="text-gray-500 hover:text-red-400 transition text-sm"
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] mt-3">
                  <div>
                    <p className="text-gray-500">ENTRY</p>
                    <p className="text-white font-mono">{notif.entry}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">TP</p>
                    <p className="text-green-500 font-mono">{notif.tp}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">SL</p>
                    <p className="text-red-500 font-mono">{notif.sl}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                  <span className="text-gray-500 text-[10px]">Confidence</span>
                  <span className="text-white text-xs font-bold">{notif.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}