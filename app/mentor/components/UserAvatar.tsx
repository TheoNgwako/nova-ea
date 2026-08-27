'use client';

import { useState, useEffect } from 'react';
import { auth } from '../../lib/firebase';

export default function UserAvatar() {
  const [initials, setInitials] = useState('U');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const name = user.displayName || '';
      const email = user.email || '';
      
      if (name) {
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
          setInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
        } else {
          setInitials(parts[0][0].toUpperCase());
        }
      } else if (email) {
        setInitials(email[0].toUpperCase());
      }
    }
  }, []);

  return (
    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm">
      {initials}
    </div>
  );
}