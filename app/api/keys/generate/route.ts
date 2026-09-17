import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBbDZlOIXKBXZeHZ8C4ncac5BL2FOmNT_0",
  authDomain: "nova-ea-a0049.firebaseapp.com",
  projectId: "nova-ea-a0049",
  storageBucket: "nova-ea-a0049.firebasestorage.app",
  messagingSenderId: "498383564796",
  appId: "1:498383564796:web:8991af256de05e2bd64c79",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 15; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export async function POST(req: NextRequest) {
  try {
    const { mentorEmail, studentEmail, studentName, plan, mentorId } = await req.json();

    console.log('📝 Generate request:', { mentorEmail, studentEmail, mentorId });

    if (!mentorEmail || !studentEmail || !mentorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const key = generateLicenseKey();

    // Save key
    await setDoc(doc(db, 'keys', key), {
      key,
      mentorId,
      mentorEmail,
      studentEmail,
      studentName: studentName || '',
      plan: plan || 'lifetime',
      used: false,
      createdAt: new Date().toISOString(),
    });

    // Save student record
    await setDoc(doc(db, 'students', studentEmail), {
      email: studentEmail,
      name: studentName || '',
      mentorId,
      plan: plan || 'lifetime',
      key,
      keyUsed: false,
      paid: true,
      connected: false,
      createdAt: new Date().toISOString(),
    }, { merge: true });

    console.log('✅ Key generated:', key);

    return NextResponse.json({
      success: true,
      key,
      mentorId,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}