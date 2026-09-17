import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// For now, use a simple config without service account
// This works for development with environment variables

const apps = getApps();

if (!apps.length) {
  initializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    // We'll add service account later
  });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();