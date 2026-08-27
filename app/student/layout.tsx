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

  useEffect(() => {
    // Check if student is in demo mode
    const isLoggedIn = localStorage.getItem('student_logged_in');
    
    console.log('Student logged in:', isLoggedIn); // Debug log
    
    if (!isLoggedIn) {
      router.push('/student-entry');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner-red"></div>
      </div>
    );
  }

  return <>{children}</>;
}