import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '../../../lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    const cleanEmail =
      email.trim().toLowerCase();

    const studentDoc =
      await adminDb
        .collection('students')
        .doc(cleanEmail)
        .get();

    if (!studentDoc.exists) {
      return NextResponse.json({
        exists: false,
        paid: false,
      });
    }

    const data =
      studentDoc.data() || {};

    const paymentVerified =
      data.paymentVerified === true;

    return NextResponse.json({
      exists: true,
      paid: paymentVerified,
      keyUsed: data.keyUsed === true,
      mentorId: data.mentorId || null,
    });

  } catch (error) {
    console.error(
      'Student check error:',
      error
    );

    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}