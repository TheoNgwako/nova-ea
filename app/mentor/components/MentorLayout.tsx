'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import LogoutButton from './LogoutButton';
import UserAvatar from './UserAvatar';
import ThemeToggle from './ThemeToggle';

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const navItems = [
    { name: 'Dashboard', path: '/mentor', icon: '📊' },
    { name: 'Generate Key', path: '/mentor/generate-key', icon: '🔑' },
    { name: 'Manage EAs', path: '/mentor/manage-eas', icon: '📋' },
    { name: 'Upload Media', path: '/mentor/upload-media', icon: '📤' },
    { name: 'Key Stats', path: '/mentor/key-stats', icon: '📈' },
    { name: 'Copy Trading', path: '/mentor/copy-trading', icon: '🔄' },
    { name: 'Wallet', path: '/mentor/wallet', icon: '💰' },
    { name: 'Website', path: '/mentor/website', icon: '🌐' },
  ];

  const isActive = (path: string) => {
    if (path === '/mentor') {
      return pathname === '/mentor';
    }
    return pathname?.startsWith(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="spinner-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-black/90 border-r border-red-500/20 min-h-screen p-4 transition-all duration-300`}>
        <div className="text-2xl font-bold text-red-500 text-glow-red mb-8 text-center">
          {sidebarOpen ? 'NOVA EA' : 'NE'}
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <a
                key={item.path}
                href={item.path}
                className={`block w-full text-left px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                    : 'text-gray-400 hover:bg-red-500/10 hover:border hover:border-red-500/30 hover:text-red-400'
                }`}
                style={
                  active
                    ? {
                        boxShadow: '0 8px 25px -5px rgba(255, 0, 0, 0.4), inset 0 -2px 0 rgba(255, 0, 0, 0.6)',
                        borderBottom: '2px solid rgba(255, 0, 0, 0.6)',
                        borderRadius: '8px 8px 12px 12px',
                      }
                    : {}
                }
              >
                {item.icon} {sidebarOpen && item.name}
              </a>
            );
          })}
          <ThemeToggle />
          <LogoutButton />
        </nav>
      </aside>

      <main className="flex-1">
        <header className="bg-black/80 backdrop-blur-md border-b border-red-500/20 px-6 py-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-red-400 text-xl">
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Mentor</span>
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