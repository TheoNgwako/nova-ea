'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import Link from 'next/link';

export default function StudentSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Check localStorage first (student session)
    const isLoggedIn = localStorage.getItem('student_logged_in');
    const studentData = JSON.parse(localStorage.getItem('student_demo') || '{}');

    if (isLoggedIn === 'true' && studentData.email) {
      setEmail(studentData.email);
      setLoading(false);
      return;
    }

    // Fallback to Firebase auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEmail(user.email || '');
        setLoading(false);
      } else {
        window.location.href = '/student-entry';
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setLoading(true);

    // Clear student session
    localStorage.removeItem('student_logged_in');
    localStorage.removeItem('student_demo');
    localStorage.removeItem('fcm_token');

    // Also sign out from Firebase if logged in
    try {
      await signOut(auth);
    } catch (e) {}

    // Hard redirect to entry page
    window.location.href = '/student-entry';
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
        <Link href="/student" className="text-red-400 text-sm hover:text-red-300 transition">
          ← Back
        </Link>
        <div className="text-lg font-bold text-red-500">NOVA EA</div>
        <div className="w-8 h-8"></div>
      </header>

      <div className="pt-20 px-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-4 mb-4 glow-red">
          <h3 className="text-white font-bold mb-4">Account</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-red-500/10">
              <span className="text-gray-400">Email</span>
              <span className="text-white text-sm">{email || 'student@email.com'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-red-500/10">
              <span className="text-gray-400">Plan</span>
              <span className="text-green-500 text-sm">Active</span>
            </div>
          </div>
        </div>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-4 mb-4 glow-red">
          <h3 className="text-white font-bold mb-4">Appearance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Theme</span>
              <select className="px-3 py-1 bg-black border border-red-500/20 rounded-lg text-white text-sm">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Font</span>
              <select className="px-3 py-1 bg-black border border-red-500/20 rounded-lg text-white text-sm">
                <option value="inter">Inter</option>
                <option value="montserrat">Montserrat</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loading}
          className="w-full py-4 border border-red-500/50 rounded-xl text-red-400 font-bold hover:bg-red-500/10 transition disabled:opacity-50"
        >
          {loading ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
}