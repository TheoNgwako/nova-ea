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

export async function POST(req: NextRequest) {
  try {
    const { email, amount } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    await setDoc(doc(db, 'students', email), {
      paid: true,
      amount: amount || 600,
      paidAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}