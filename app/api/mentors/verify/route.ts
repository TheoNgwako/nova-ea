import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  adminAuth,
  adminDb,
} from '../../../lib/firebase-admin';

export async function POST(
  request: NextRequest
) {
  try {
    const authorization =
      request.headers.get(
        'authorization'
      ) || '';

    if (
      !authorization.startsWith(
        'Bearer '
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          code: 'UNAUTHORIZED',
        },
        {
          status: 401,
        }
      );
    }

    const idToken =
      authorization.substring(7);

    const decoded =
      await adminAuth.verifyIdToken(
        idToken,
        true
      );

    const uid =
      decoded.uid;

    const email =
      String(
        decoded.email || ''
      )
        .trim()
        .toLowerCase();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          code: 'EMAIL_REQUIRED',
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------
    // Mentor record must ALREADY exist.
    // Login cannot create mentor access.
    // --------------------------------

    const mentorRef =
      adminDb
        .collection('mentors')
        .doc(uid);

    const mentorDoc =
      await mentorRef.get();

    if (!mentorDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          code: 'MENTOR_NOT_FOUND',
        },
        {
          status: 403,
        }
      );
    }

    const mentor =
      mentorDoc.data() || {};

    const mentorEmail =
      String(
        mentor.email || ''
      )
        .trim()
        .toLowerCase();

    if (
      mentorEmail &&
      mentorEmail !== email
    ) {
      return NextResponse.json(
        {
          success: false,
          code:
            'MENTOR_EMAIL_MISMATCH',
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------
    // Prevent student account from
    // being promoted into mentor role.
    // --------------------------------

    const studentDoc =
      await adminDb
        .collection('students')
        .doc(email)
        .get();

    if (
      studentDoc.exists &&
      studentDoc.data()?.role ===
        'student'
    ) {
      return NextResponse.json(
        {
          success: false,
          code:
            'ACCOUNT_IS_STUDENT',
        },
        {
          status: 403,
        }
      );
    }

    // --------------------------------
    // Repair / assign mentor claim
    // while preserving other claims.
    // --------------------------------

    const userRecord =
      await adminAuth.getUser(uid);

    const claims =
      userRecord.customClaims || {};

    await adminAuth
      .setCustomUserClaims(
        uid,
        {
          ...claims,
          role: 'mentor',
        }
      );

    return NextResponse.json({
      success: true,
      role: 'mentor',
    });

  } catch (error) {
    console.error(
      'Mentor verification error:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        code:
          'MENTOR_VERIFY_FAILED',
      },
      {
        status: 500,
      }
    );
  }
}