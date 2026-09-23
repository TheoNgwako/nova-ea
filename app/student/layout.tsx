'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import { auth } from '../lib/firebase';
import { SignalProvider } from '../lib/SignalContext';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] =
    useState(true);

  const [allowed, setAllowed] =
    useState(false);

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async user => {
          if (!user) {
            setAllowed(false);
            setLoading(false);

            window.location.replace(
              '/student-entry'
            );

            return;
          }

          try {
            const tokenResult =
              await user.getIdTokenResult(
                true
              );

            if (
              tokenResult.claims.role !==
              'student'
            ) {
              await signOut(auth);

              setAllowed(false);
              setLoading(false);

              window.location.replace(
                '/student-entry'
              );

              return;
            }

            setAllowed(true);
            setLoading(false);
          } catch (error) {
            console.error(
              'Student layout authentication failed:',
              error
            );

            try {
              await signOut(auth);
            } catch {
              // Ignore sign-out failure.
            }

            setAllowed(false);
            setLoading(false);

            window.location.replace(
              '/student-entry'
            );
          }
        }
      );

    return () => unsubscribe();
  }, []);

  if (loading || !allowed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner-red" />
      </div>
    );
  }

  return (
    <SignalProvider>
      {children}
    </SignalProvider>
  );
}