'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Check if student is logged in (demo mode)
    const isLoggedIn = localStorage.getItem('student_logged_in');
    const studentDemo = localStorage.getItem('student_demo');

    console.log('🔒 Layout check:');
    console.log('  logged_in:', isLoggedIn);
    console.log('  demo:', studentDemo);

    if (isLoggedIn === 'true' && studentDemo) {
      setAllowed(true);
    } else {
      console.log('❌ Not logged in — redirecting');
      // Use window.location for hard redirect
      window.location.href = '/student-entry';
      return;
    }
    setLoading(false);
  }, []);

  if (loading || !allowed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner-red"></div>
      </div>
    );
  }

  return <>{children}</>;
}