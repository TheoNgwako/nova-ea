'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import MentorLayout from '../components/MentorLayout';

export default function GenerateKey() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [plan, setPlan] = useState('lifetime');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [mentorId, setMentorId] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      // Get or create mentor ID
      const mentorDoc = await getDoc(doc(db, 'mentors', user.uid));
      
      if (mentorDoc.exists()) {
        const data = mentorDoc.data();
        setMentorId(data.mentorId || '');
      } else {
        const newId = String(Math.floor(100000 + Math.random() * 900000));
        await setDoc(doc(db, 'mentors', user.uid), {
          mentorId: newId,
          email: user.email,
          name: user.displayName || 'Mentor',
          createdAt: new Date().toISOString(),
        });
        setMentorId(newId);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const generateLicenseKey = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 15; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setMessage('');
    setMessageType('');
    setGeneratedKey('');

    if (!studentEmail) {
      setMessage('Please enter student email');
      setMessageType('error');
      setGenerating(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      if (!mentorId) {
        throw new Error('Mentor ID not loaded yet. Please wait.');
      }

      // Call API to generate key
      const res = await fetch('/api/keys/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorEmail: user.email,
          studentEmail,
          studentName,
          plan,
          mentorId: mentorId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setGeneratedKey(data.key);
        setMessage('✅ Key generated successfully!');
        setMessageType('success');
        setStudentEmail('');
        setStudentName('');
      } else {
        setMessage('❌ ' + (data.error || 'Failed to generate key'));
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Failed: ' + (error as Error).message);
      setMessageType('error');
    } finally {
      setGenerating(false);
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
    <MentorLayout>
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Generate License</h1>
        <p className="text-gray-400 text-sm mb-6">Create a new license key for a student</p>

        {/* Mentor ID Display */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-gray-400 text-sm">Your Mentor ID:</p>
          <p className="text-white font-bold text-2xl tracking-wider">{mentorId || 'Loading...'}</p>
          <p className="text-gray-500 text-xs mt-1">Share this ID with your students</p>
        </div>

        {message && (
          <div className={`p-4 rounded-xl mb-4 ${
            messageType === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            {message}
          </div>
        )}

        {generatedKey && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
            <p className="text-green-400 text-sm">License Key:</p>
            <p className="text-white font-bold text-xl tracking-wider">{generatedKey}</p>
            <p className="text-gray-500 text-xs mt-2">Share this key with your student</p>
          </div>
        )}

        <form onSubmit={handleGenerateKey} className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Student Email</label>
            <input
              type="email"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@email.com"
              required
              className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Student Name (optional)</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student name"
              className="w-full px-4 py-3 bg-black/50 border border-red-500/20 rounded-lg text-white placeholder-gray-600 focus:border-red-500 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">Plan Duration</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {['lifetime', '1year', '6months', '1month', '1week'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={`px-3 py-2 rounded-lg text-sm transition ${
                    plan === p
                      ? 'bg-red-600 text-white'
                      : 'border border-red-500/20 text-gray-400 hover:border-red-500 hover:text-red-400'
                  }`}
                >
                  {p === 'lifetime' ? 'Lifetime' :
                   p === '1year' ? '1 Year' :
                   p === '6months' ? '6 Months' :
                   p === '1month' ? '1 Month' : '1 Week'}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={generating}
            className="w-full py-4 bg-red-600 rounded-xl text-white font-bold text-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Key'}
          </button>
        </form>
      </div>
    </MentorLayout>
  );
}