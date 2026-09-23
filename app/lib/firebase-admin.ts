import 'server-only';

import {
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';

import {
  getFirestore,
} from 'firebase-admin/firestore';

import {
  getAuth,
} from 'firebase-admin/auth';

// ==========================================
// FIREBASE ADMIN - SERVER ONLY
// ==========================================
//
// NEVER import this file into a client
// component.
//
// NEVER use NEXT_PUBLIC_* for Admin secrets.
//
// The credentials below come ONLY from
// server environment variables.
// ==========================================

const projectId =
  process.env.FIREBASE_ADMIN_PROJECT_ID;

const clientEmail =
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

const privateKey =
  process.env.FIREBASE_ADMIN_PRIVATE_KEY
    ?.replace(/\\n/g, '\n');

if (
  !projectId ||
  !clientEmail ||
  !privateKey
) {
  throw new Error(
    'Firebase Admin credentials are missing'
  );
}

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

export const adminDb =
  getFirestore(adminApp);

export const adminAuth =
  getAuth(adminApp);