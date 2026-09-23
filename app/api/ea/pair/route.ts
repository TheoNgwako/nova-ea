import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  createHash,
  randomBytes,
} from 'node:crypto';

import {
  FieldValue,
  Timestamp,
} from 'firebase-admin/firestore';

import {
  adminAuth,
  adminDb,
} from '../../../lib/firebase-admin';

export const runtime = 'nodejs';

export const dynamic =
  'force-dynamic';

const EA_SESSION_DAYS = 30;

// ========================================
// HELPERS
// ========================================

function hashPairingCode(
  value: string
) {
  return createHash('sha256')
    .update(value)
    .digest('hex');
}

function normalizeDate(
  value: unknown
): Date | null {
  if (!value) {
    return null;
  }

  if (
    value instanceof Timestamp
  ) {
    return value.toDate();
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === 'function'
  ) {
    return (
      value as {
        toDate: () => Date;
      }
    ).toDate();
  }

  if (
    value instanceof Date
  ) {
    return value;
  }

  if (
    typeof value === 'string'
  ) {
    const parsed =
      new Date(value);

    if (
      !Number.isNaN(
        parsed.getTime()
      )
    ) {
      return parsed;
    }
  }

  return null;
}

// ========================================
// AUTHENTICATED STUDENT
// ========================================

async function getStudent(
  req: NextRequest
) {
  const authorization =
    req.headers.get(
      'authorization'
    );

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

  const idToken =
    authorization.substring(7);

  const decoded =
    await adminAuth
      .verifyIdToken(idToken);

  if (
    decoded.role !==
    'student'
  ) {
    throw new Error(
      'STUDENT_REQUIRED'
    );
  }

  if (!decoded.email) {
    throw new Error(
      'EMAIL_REQUIRED'
    );
  }

  return {
    uid: decoded.uid,

    email:
      decoded.email
        .trim()
        .toLowerCase(),
  };
}

// ========================================
// CREATE MT5 PAIRING CODE
// ========================================

export async function POST(
  req: NextRequest
) {
  try {
    const student =
      await getStudent(req);

    const studentRef =
      adminDb
        .collection(
          'students'
        )
        .doc(
          student.email
        );

    const studentSnapshot =
      await studentRef.get();

    if (
      !studentSnapshot.exists
    ) {
      throw new Error(
        'STUDENT_NOT_FOUND'
      );
    }

    const data =
      studentSnapshot.data() ||
      {};

    // ====================================
    // PAYMENT
    // ====================================

    if (
      data.paymentVerified !==
      true
    ) {
      throw new Error(
        'PAYMENT_REQUIRED'
      );
    }

    // ====================================
    // AUTH ACCOUNT
    // ====================================

    if (
      !data.authUid ||
      data.authUid !==
        student.uid
    ) {
      throw new Error(
        'ACCOUNT_MISMATCH'
      );
    }

    // ====================================
    // REPLACEMENT KEY / REACTIVATION
    // ====================================

    if (
      data.requiresReactivation ===
      true
    ) {
      throw new Error(
        'REACTIVATION_REQUIRED'
      );
    }

    // ====================================
    // ACTIVE MENTOR LICENSE
    // ====================================

    if (
      data.keyUsed !== true
    ) {
      throw new Error(
        'LICENSE_INACTIVE'
      );
    }

    // ====================================
    // LICENSE EXPIRY
    // ====================================

    const licenseExpiry =
      normalizeDate(
        data.licenseExpiresAt
      );

    if (
      licenseExpiry &&
      licenseExpiry.getTime() <=
        Date.now()
    ) {
      throw new Error(
        'LICENSE_EXPIRED'
      );
    }

    // ====================================
    // DISABLE PREVIOUS EA SESSIONS
    // ====================================

    const oldSessions =
      await adminDb
        .collection(
          'eaSessions'
        )
        .where(
          'studentUid',
          '==',
          student.uid
        )
        .limit(50)
        .get();

    if (!oldSessions.empty) {
      const batch =
        adminDb.batch();

      for (
        const document
        of oldSessions.docs
      ) {
        const oldData =
          document.data();

        if (
          oldData.active ===
          true
        ) {
          batch.set(
            document.ref,
            {
              active: false,

              connected:
                false,

              revokedAt:
                FieldValue
                  .serverTimestamp(),

              updatedAt:
                FieldValue
                  .serverTimestamp(),
            },
            {
              merge: true,
            }
          );
        }
      }

      await batch.commit();
    }

    // ====================================
    // GENERATE STRONG RANDOM EA KEY
    // ====================================

    const pairingCode =
      randomBytes(32)
        .toString('hex');

    const pairingHash =
      hashPairingCode(
        pairingCode
      );

    // Normal EA session:
    // maximum 30 days.
    let expiresAtMs =
      Date.now() +
      EA_SESSION_DAYS *
        24 *
        60 *
        60 *
        1000;

    // Never allow the EA session
    // to outlive the mentor licence.
    if (
      licenseExpiry &&
      licenseExpiry.getTime() <
        expiresAtMs
    ) {
      expiresAtMs =
        licenseExpiry.getTime();
    }

    const expiresAt =
      Timestamp.fromMillis(
        expiresAtMs
      );

    const sessionRef =
      adminDb
        .collection(
          'eaSessions'
        )
        .doc(
          pairingHash
        );

    // ====================================
    // STORE HASH ONLY
    //
    // The raw pairing code is returned
    // to the student once but is NEVER
    // stored in Firestore.
    // ====================================

    await sessionRef.set({
      studentUid:
        student.uid,

      studentEmail:
        student.email,

      active: true,

      connected: false,

      terminal: 'MT5',

      credentialVersion: 1,

      mt5Account: null,

      broker: null,

      createdAt:
        FieldValue
          .serverTimestamp(),

      updatedAt:
        FieldValue
          .serverTimestamp(),

      expiresAt,

      lastSeenAt: null,
    });

    return NextResponse.json({
      success: true,

      pairingCode,

      serverUrl:
        'https://signals.novamobiles.co.za',

      expiresAt:
        new Date(
          expiresAtMs
        ).toISOString(),
    });

  } catch (error: any) {
    console.error(
      'EA pairing error:',
      error?.message ||
        error
    );

    const message =
      error?.message;

    if (
      message ===
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
      message ===
      'STUDENT_REQUIRED'
    ) {
      return NextResponse.json(
        {
          error:
            'Student account required',
        },
        {
          status: 403,
        }
      );
    }

    if (
      message ===
      'EMAIL_REQUIRED'
    ) {
      return NextResponse.json(
        {
          error:
            'Student email unavailable',
        },
        {
          status: 400,
        }
      );
    }

    if (
      message ===
      'STUDENT_NOT_FOUND'
    ) {
      return NextResponse.json(
        {
          error:
            'Student account not found',
        },
        {
          status: 404,
        }
      );
    }

    if (
      message ===
      'PAYMENT_REQUIRED'
    ) {
      return NextResponse.json(
        {
          error:
            'Activation payment required',
        },
        {
          status: 403,
        }
      );
    }

    if (
      message ===
      'ACCOUNT_MISMATCH'
    ) {
      return NextResponse.json(
        {
          error:
            'Student authentication mismatch',
        },
        {
          status: 403,
        }
      );
    }

    if (
      message ===
      'REACTIVATION_REQUIRED'
    ) {
      return NextResponse.json(
        {
          error:
            'Student licence must be reactivated',
        },
        {
          status: 403,
        }
      );
    }

    if (
      message ===
      'LICENSE_INACTIVE'
    ) {
      return NextResponse.json(
        {
          error:
            'Student licence is inactive',
        },
        {
          status: 403,
        }
      );
    }

    if (
      message ===
      'LICENSE_EXPIRED'
    ) {
      return NextResponse.json(
        {
          error:
            'Student licence has expired',
        },
        {
          status: 403,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          'Could not create MT5 pairing code',
      },
      {
        status: 500,
      }
    );
  }
}