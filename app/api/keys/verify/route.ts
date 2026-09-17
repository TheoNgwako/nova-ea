import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

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
    const { mentorId, key, email } = await req.json();

    console.log('🔑 Verify:', { mentorId, key, email });

    if (!mentorId || !key || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Look up key in Firestore
    const keyDoc = await getDoc(doc(db, 'keys', key.toUpperCase()));

    if (!keyDoc.exists()) {
      console.log('❌ Key not found');
      return NextResponse.json(
        { error: 'Invalid license key' },
        { status: 404 }
      );
    }

    const keyData = keyDoc.data();

    if (keyData.mentorId !== mentorId) {
      return NextResponse.json(
        { error: 'Key does not match Mentor ID' },
        { status: 400 }
      );
    }

    if (keyData.used === true) {
      return NextResponse.json(
        { error: 'Key already used' },
        { status: 400 }
      );
    }

    if (keyData.studentEmail !== email) {
      return NextResponse.json(
        { error: 'Key not assigned to your email' },
        { status: 400 }
      );
    }

    // Mark as used
    await setDoc(doc(db, 'keys', key.toUpperCase()), { used: true }, { merge: true });

    // Update student
    await setDoc(doc(db, 'students', email), {
      keyUsed: true,
      mentorId,
      paid: true,
    }, { merge: true });

    console.log('✅ Verified');

    return NextResponse.json({
      success: true,
      message: 'Key verified',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}