import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  FieldValue,
  Timestamp,
} from 'firebase-admin/firestore';

import { randomBytes } from 'crypto';

import {
  adminAuth,
  adminDb,
} from '../../../lib/firebase-admin';

const VALID_PLANS = [
  'lifetime',
  '1year',
  '6months',
  '1month',
  '1week',
] as const;

type Plan =
  (typeof VALID_PLANS)[number];

// =========================
// GENERATE SECURE KEY
// =========================

function generateLicenseKey(): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  const bytes = randomBytes(15);

  let key = '';

  for (let i = 0; i < 15; i++) {
    key +=
      chars[
        bytes[i] % chars.length
      ];
  }

  return key;
}

// =========================
// CALCULATE EXPIRY
// =========================

function calculateExpiry(
  plan: Plan
): Timestamp | null {
  if (plan === 'lifetime') {
    return null;
  }

  const expiry = new Date();

  switch (plan) {
    case '1week':
      expiry.setDate(
        expiry.getDate() + 7
      );
      break;

    case '1month':
      expiry.setMonth(
        expiry.getMonth() + 1
      );
      break;

    case '6months':
      expiry.setMonth(
        expiry.getMonth() + 6
      );
      break;

    case '1year':
      expiry.setFullYear(
        expiry.getFullYear() + 1
      );
      break;
  }

  return Timestamp.fromDate(expiry);
}

// =========================
// AUTHENTICATE MENTOR
// =========================

async function getAuthenticatedMentor(
  req: NextRequest
) {
  const authorization =
    req.headers.get('authorization');

  if (
    !authorization ||
    !authorization.startsWith(
      'Bearer '
    )
  ) {
    throw new Error(
      'UNAUTHORIZED'
    );
  }

  const token =
    authorization.substring(7);

  if (!token) {
    throw new Error(
      'UNAUTHORIZED'
    );
  }

  let decodedToken;

  try {
    decodedToken =
      await adminAuth.verifyIdToken(
        token
      );
  } catch {
    throw new Error(
      'UNAUTHORIZED'
    );
  }

  const mentorRef =
    adminDb
      .collection('mentors')
      .doc(decodedToken.uid);

  const mentorDoc =
    await mentorRef.get();

  if (!mentorDoc.exists) {
    throw new Error(
      'MENTOR_NOT_FOUND'
    );
  }

  const mentor =
    mentorDoc.data() || {};

  const mentorId =
    typeof mentor.mentorId ===
    'string'
      ? mentor.mentorId.trim()
      : '';

  if (!mentorId) {
    throw new Error(
      'MENTOR_ID_MISSING'
    );
  }

  return {
    uid: decodedToken.uid,

    email:
      decodedToken.email
        ?.trim()
        .toLowerCase() || '',

    mentorId,
  };
}

// =========================
// GENERATE LICENSE
// =========================

export async function POST(
  req: NextRequest
) {
  try {
    const mentor =
      await getAuthenticatedMentor(
        req
      );

    const body =
      await req.json();

    const studentEmail =
      typeof body.studentEmail ===
      'string'
        ? body.studentEmail
            .trim()
            .toLowerCase()
        : '';

    const studentName =
      typeof body.studentName ===
      'string'
        ? body.studentName.trim()
        : '';

    const requestedPlan =
      typeof body.plan === 'string'
        ? body.plan
        : 'lifetime';

    if (!studentEmail) {
      return NextResponse.json(
        {
          error:
            'Student email is required',
        },
        {
          status: 400,
        }
      );
    }

    if (
      !VALID_PLANS.includes(
        requestedPlan as Plan
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid license plan',
        },
        {
          status: 400,
        }
      );
    }

    const plan =
      requestedPlan as Plan;

    const expiresAt =
      calculateExpiry(plan);

    const studentRef =
      adminDb
        .collection('students')
        .doc(studentEmail);

    // =========================
    // GENERATE UNIQUE KEY
    // =========================

    let key = '';

    for (
      let attempt = 0;
      attempt < 5;
      attempt++
    ) {
      const candidate =
        generateLicenseKey();

      const candidateDoc =
        await adminDb
          .collection('keys')
          .doc(candidate)
          .get();

      if (!candidateDoc.exists) {
        key = candidate;
        break;
      }
    }

    if (!key) {
      throw new Error(
        'KEY_GENERATION_FAILED'
      );
    }

    // =========================
    // SAVE NEW KEY
    // =========================
    //
    // The key exists, but it is
    // NOT the student's active
    // licence until they enter it.
    // =========================

    await adminDb
      .collection('keys')
      .doc(key)
      .set({
        key,

        mentorId:
          mentor.mentorId,

        mentorUid:
          mentor.uid,

        mentorEmail:
          mentor.email,

        studentEmail,

        studentName,

        plan,

        used: false,

        createdAt:
          FieldValue.serverTimestamp(),

        expiresAt:
          expiresAt ?? null,
      });

    // =========================
    // PENDING REPLACEMENT
    // =========================
    //
    // IMPORTANT:
    //
    // Do NOT overwrite:
    //   key
    //   mentorId
    //   mentorUid
    //   plan
    //
    // Those represent the last
    // successfully activated
    // licence.
    //
    // paymentVerified is also
    // deliberately untouched.
    //
    // The newly generated licence
    // remains pending until the
    // student enters Mentor ID +
    // key at Student Entry.
    // =========================

    await studentRef.set(
      {
        email:
          studentEmail,

        name:
          studentName,

        pendingKey:
          key,

        pendingMentorId:
          mentor.mentorId,

        pendingMentorUid:
          mentor.uid,

        pendingPlan:
          plan,

        pendingLicenseExpiresAt:
          expiresAt ?? null,

        requiresReactivation:
          true,

        connected:
          false,

        updatedAt:
          FieldValue.serverTimestamp(),
      },
      {
        merge: true,
      }
    );

    return NextResponse.json({
      success: true,

      key,

      mentorId:
        mentor.mentorId,

      plan,

      expiresAt:
        expiresAt
          ? expiresAt
              .toDate()
              .toISOString()
          : null,
    });

  } catch (error) {
    if (
      error instanceof Error
    ) {
      if (
        error.message ===
        'UNAUTHORIZED'
      ) {
        return NextResponse.json(
          {
            error:
              'Authentication required',
          },
          {
            status: 401,
          }
        );
      }

      if (
        error.message ===
        'MENTOR_NOT_FOUND'
      ) {
        return NextResponse.json(
          {
            error:
              'Mentor account not found',
          },
          {
            status: 403,
          }
        );
      }

      if (
        error.message ===
        'MENTOR_ID_MISSING'
      ) {
        return NextResponse.json(
          {
            error:
              'Mentor ID is missing',
          },
          {
            status: 403,
          }
        );
      }

      if (
        error.message ===
        'KEY_GENERATION_FAILED'
      ) {
        return NextResponse.json(
          {
            error:
              'Could not generate a unique license key',
          },
          {
            status: 500,
          }
        );
      }
    }

    console.error(
      'Key generation error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}