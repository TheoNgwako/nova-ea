'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-500/10 hover:border hover:border-red-500/30 text-gray-400 hover:text-red-400 transition mt-8"
    >
      Logout
    </button>
  );
}