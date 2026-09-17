'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function StudentEntry() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email');
  const [mentorId, setMentorId] = useState('');
  const [studentKey, setStudentKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/student');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // FOR DEMO: Skip payment check, go straight to key step
    setTimeout(() => {
      setLoading(false);
      setStep('key');
    }, 500);
  };

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/keys/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId,
          key: studentKey,
          email,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Invalid key. Please check with your mentor.');
        setLoading(false);
        return;
      }

      localStorage.setItem('student_demo', JSON.stringify({
        email,
        mentorId,
        studentKey,
        enteredAt: new Date().toISOString()
      }));
      
      localStorage.setItem('student_logged_in', 'true');
      
      setLoading(false);
      router.push('/student');
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-red-500 text-glow-red mb-2">NOVA EA</div>
          <p className="text-gray-400 text-sm">
            {step === 'email' && 'Enter your email to get started'}
            {step === 'key' && 'Enter your mentor details'}
          </p>
        </div>

        <div className="bg-black/50 border border-red-500/20 rounded-xl p-8 glow-red">
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                  placeholder="student@email.com"
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'key' && (
            <form onSubmit={handleKeySubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="text-gray-400 text-sm block mb-2">Mentor ID</label>
                <input
                  type="text"
                  value={mentorId}
                  onChange={(e) => setMentorId(e.target.value)}
                  placeholder="Enter mentor ID (e.g. 123456)"
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition uppercase"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">License Key</label>
                <input
                  type="text"
                  value={studentKey}
                  onChange={(e) => setStudentKey(e.target.value)}
                  placeholder="Enter 15-character key"
                  required
                  maxLength={15}
                  className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition uppercase tracking-wider"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Activate Bot'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}