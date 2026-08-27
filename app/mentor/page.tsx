'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import MentorLayout from './components/MentorLayout';

export default function MentorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner-red"></div>
      </div>
    );
  }

  return (
    <MentorLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white dark:text-black mb-2">Dashboard</h1>
        <p className="text-gray-400 dark:text-gray-600 text-sm mb-6">Welcome to your mentor control panel</p>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 dark:bg-white/80 glow-red hover:glow-red transition">
            <p className="text-gray-400 dark:text-gray-600 text-sm">Total Licences</p>
            <p className="text-3xl font-bold text-white dark:text-black mt-1">0</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time EA users</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 dark:bg-white/80 glow-red hover:glow-red transition">
            <p className="text-gray-400 dark:text-gray-600 text-sm">Active Subscriptions</p>
            <p className="text-3xl font-bold text-green-500 mt-1">0</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">App users subscribed</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 dark:bg-white/80 glow-red hover:glow-red transition">
            <p className="text-gray-400 dark:text-gray-600 text-sm">Total EAs</p>
            <p className="text-3xl font-bold text-white dark:text-black mt-1">0</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">EAs you are licensing</p>
          </div>

          <div className="p-6 rounded-xl border border-red-500/20 bg-black/50 dark:bg-white/80 glow-red hover:glow-red transition">
            <p className="text-gray-400 dark:text-gray-600 text-sm">Max Licences</p>
            <p className="text-3xl font-bold text-white dark:text-black mt-1">2,000</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total you can generate</p>
          </div>
        </div>
      </div>
    </MentorLayout>
  );
}