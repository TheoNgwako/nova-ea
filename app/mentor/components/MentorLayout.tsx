'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  onAuthStateChanged,
} from 'firebase/auth';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../../lib/firebase';

import LogoutButton from './LogoutButton';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    mentorVerified,
    setMentorVerified,
  ] = useState(false);

  const [
    accessError,
    setAccessError,
  ] = useState('');

  // ========================================
  // VERIFY REAL MENTOR
  // ========================================

  useEffect(() => {
    let cancelled = false;

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async user => {
          setLoading(true);
          setMentorVerified(false);
          setAccessError('');

          // =========================
          // NOT LOGGED IN
          // =========================

          if (!user) {
            if (!cancelled) {
              router.replace(
                '/login'
              );
            }

            return;
          }

          try {
            // =========================
            // MENTOR DOCUMENT MUST
            // ALREADY EXIST
            // =========================
            //
            // IMPORTANT:
            // We NEVER create mentor
            // accounts here.
            // =========================

            const mentorSnapshot =
              await getDoc(
                doc(
                  db,
                  'mentors',
                  user.uid
                )
              );

            if (cancelled) {
              return;
            }

            // =========================
            // AUTHENTICATED BUT
            // NOT A MENTOR
            // =========================

            if (
              !mentorSnapshot.exists()
            ) {
              console.warn(
                'Non-mentor attempted to access mentor area:',
                user.uid
              );

              router.replace(
                '/student-entry'
              );

              return;
            }

            const mentorData =
              mentorSnapshot.data();

            const mentorId =
              typeof mentorData
                .mentorId ===
              'string'
                ? mentorData
                    .mentorId
                    .trim()
                : '';

            // =========================
            // INVALID MENTOR RECORD
            // =========================

            if (!mentorId) {
              console.error(
                'Mentor record missing mentorId:',
                user.uid
              );

              setAccessError(
                'Your mentor account is missing a Mentor ID.'
              );

              setLoading(false);

              return;
            }

            // =========================
            // VERIFIED
            // =========================

            setMentorVerified(
              true
            );

            setLoading(false);
          } catch (error) {
            console.error(
              'Mentor verification error:',
              error
            );

            if (!cancelled) {
              setAccessError(
                'Unable to verify mentor access. Please refresh and try again.'
              );

              setLoading(false);
            }
          }
        }
      );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [router]);

  // ========================================
  // NAVIGATION
  // ========================================

  const navItems = [
    {
      name: 'Dashboard',
      path: '/mentor',
      icon: '📊',
    },
    {
      name: 'Generate Key',
      path: '/mentor/generate-key',
      icon: '🔑',
    },
    {
      name: 'Manage EAs',
      path: '/mentor/manage-eas',
      icon: '📋',
    },
    {
      name: 'Upload Media',
      path: '/mentor/upload-media',
      icon: '📤',
    },
    {
      name: 'Key Stats',
      path: '/mentor/key-stats',
      icon: '📈',
    },
    {
      name: 'Copy Trading',
      path: '/mentor/copy-trading',
      icon: '🔄',
    },
    {
      name: 'Wallet',
      path: '/mentor/wallet',
      icon: '💰',
    },
    {
      name: 'Website',
      path: '/mentor/website',
      icon: '🌐',
    },
  ];

  const isActive = (
    path: string
  ) => {
    if (path === '/mentor') {
      return (
        pathname === '/mentor'
      );
    }

    return pathname?.startsWith(
      path
    );
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner-red" />
      </div>
    );
  }

  // ========================================
  // VERIFICATION FAILED
  // ========================================

  if (
    accessError ||
    !mentorVerified
  ) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-black/70 border border-red-500/30 rounded-xl p-6 text-center">
          <h2 className="text-red-400 text-xl font-bold mb-3">
            Mentor Access
          </h2>

          <p className="text-gray-400 text-sm">
            {accessError ||
              'Verifying mentor access...'}
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // VERIFIED MENTOR UI
  // ========================================

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside
        className={`${
          sidebarOpen
            ? 'w-64'
            : 'w-20'
        } bg-black/90 border-r border-red-500/20 min-h-screen p-4 transition-all duration-300`}
      >
        <div className="text-2xl font-bold text-red-500 text-glow-red mb-8 text-center">
          {sidebarOpen
            ? 'PIXEL FORGE'
            : 'PF'}
        </div>

        <nav className="space-y-2">
          {navItems.map(item => {
            const active =
              isActive(
                item.path
              );

            return (
              <a
                key={
                  item.path
                }
                href={
                  item.path
                }
                className={`block w-full text-left px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                    : 'text-gray-400 hover:bg-red-500/10 hover:border hover:border-red-500/30 hover:text-red-400'
                }`}
                style={
                  active
                    ? {
                        boxShadow:
                          '0 8px 25px -5px rgba(255, 0, 0, 0.4), inset 0 -2px 0 rgba(255, 0, 0, 0.6)',

                        borderBottom:
                          '2px solid rgba(255, 0, 0, 0.6)',

                        borderRadius:
                          '8px 8px 12px 12px',
                      }
                    : {}
                }
              >
                {item.icon}{' '}

                {sidebarOpen &&
                  item.name}
              </a>
            );
          })}

          <ThemeToggle />

          <LogoutButton />
        </nav>
      </aside>

      <main className="flex-1">
        <header className="bg-black/80 backdrop-blur-md border-b border-red-500/20 px-6 py-4 flex justify-between items-center">
          <button
            onClick={() =>
              setSidebarOpen(
                previous =>
                  !previous
              )
            }
            className="text-red-400 text-xl"
          >
            {sidebarOpen
              ? '◀'
              : '▶'}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Mentor
            </span>

            <UserAvatar />
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}