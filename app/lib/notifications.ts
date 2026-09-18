// NOVA EA - Push Notifications Client
'use client';

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBbDZlOIXKBXZeHZ8C4ncac5BL2FOmNT_0",
  authDomain: "nova-ea-a0049.firebaseapp.com",
  projectId: "nova-ea-a0049",
  storageBucket: "nova-ea-a0049.firebasestorage.app",
  messagingSenderId: "498383564796",
  appId: "1:498383564796:web:8991af256de05e2bd64c79"
};

// VAPID key from Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
const VAPID_KEY = 'BKRXUe-HOURAOBPsdpcyBe8rdRaCQJ7zo7MwxgVg1pcmh6EKU7BdVdwg46vAKB1N27eLpS4pP9-fymg12T-AM3Q';

let messaging: any = null;

function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null;
  if (messaging) return messaging;

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    messaging = getMessaging(app);
    return messaging;
  } catch (err) {
    console.error('Messaging init error:', err);
    return null;
  }
}

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  try {
    // Check browser support
    if (!('Notification' in window)) {
      console.log('❌ Notifications not supported');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    console.log('🔔 Permission:', permission);

    if (permission !== 'granted') {
      console.log('❌ Permission denied');
      return null;
    }

    // Get FCM token
    const msg = getFirebaseMessaging();
    if (!msg) return null;

 // Register service worker FIRST
const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
console.log('✅ Service Worker registered:', registration);

// Wait for it to be ready
await navigator.serviceWorker.ready;
console.log('✅ Service Worker ready');

// Now get the token
const token = await getToken(msg, {
  vapidKey: VAPID_KEY,
  serviceWorkerRegistration: registration,
});
    console.log('✅ FCM Token:', token);

// Save token locally
localStorage.setItem('fcm_token', token);

// Get student ID from localStorage
const studentData = JSON.parse(localStorage.getItem('student_demo') || '{}');
const studentId = studentData.email || 'unknown';

// Send token to VPS
try {
  const res = await fetch('http://139.84.247.129:8080/register-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, token }),
  });
  const data = await res.json();
  console.log('📱 Token registered with VPS:', data);
} catch (err) {
  console.error('❌ Failed to send token to VPS:', err);
}

return token;
  } catch (err) {
    console.error('❌ Notification error:', err);
    return null;
  }
}

/**
 * Listen for messages when app is in foreground
 */
export function onForegroundMessage(callback: (payload: any) => void) {
  const msg = getFirebaseMessaging();
  if (!msg) return () => {};

  return onMessage(msg, (payload) => {
    console.log('📩 Foreground message:', payload);
    callback(payload);
  });
}

/**
 * Check current permission status
 */
export function getNotificationStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (typeof window === 'undefined') return 'unsupported';
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}