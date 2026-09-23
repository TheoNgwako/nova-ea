import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  FieldValue,
  Timestamp,
} from 'firebase-admin/firestore';

import {
  adminAuth,
  adminDb,
} from '../../../lib/firebase-admin';

// =========================
// HELPERS
// =========================

function normalizeExpiry(
  value: unknown
): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Timestamp) {
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

  if (typeof value === 'string') {
    const date = new Date(value);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date;
    }
  }

  return null;
}

// =========================
// GET / CREATE STUDENT USER
// =========================

async function getOrCreateStudentUser(
  email: string
) {
  try {
    const existingUser =
      await adminAuth
        .getUserByEmail(email);

    const mentorDoc =
      await adminDb
        .collection('mentors')
        .doc(existingUser.uid)
        .get();

    if (mentorDoc.exists) {
      throw new Error(
        'EMAIL_IS_MENTOR'
      );
    }

    const existingRole =
      existingUser.customClaims
        ?.role;

    if (
      existingRole &&
      existingRole !== 'student'
    ) {
      throw new Error(
        'ACCOUNT_ROLE_CONFLICT'
      );
    }

    return existingUser;
  } catch (error: any) {
    if (
      error?.message ===
        'EMAIL_IS_MENTOR' ||
      error?.message ===
        'ACCOUNT_ROLE_CONFLICT'
    ) {
      throw error;
    }

    if (
      error?.code !==
      'auth/user-not-found'
    ) {
      throw error;
    }

    return await adminAuth
      .createUser({
        email,
        emailVerified: false,
        disabled: false,
      });
  }
}

// =========================
// VERIFY LICENSE
// =========================

export async function POST(
  req: NextRequest
) {
  try {
    const body =
      await req.json();

    const mentorId =
      typeof body.mentorId ===
      'string'
        ? body.mentorId.trim()
        : '';

    const key =
      typeof body.key ===
      'string'
        ? body.key
            .trim()
            .toUpperCase()
        : '';

    const email =
      typeof body.email ===
      'string'
        ? body.email
            .trim()
            .toLowerCase()
        : '';

    if (
      !mentorId ||
      !key ||
      !email
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields',
        },
        {
          status: 400,
        }
      );
    }

    const studentRef =
      adminDb
        .collection('students')
        .doc(email);

    const keyRef =
      adminDb
        .collection('keys')
        .doc(key);

    // =========================
    // PRE-CHECK STUDENT
    // =========================

    const studentSnapshot =
      await studentRef.get();

    if (!studentSnapshot.exists) {
      throw new Error(
        'PAYMENT_REQUIRED'
      );
    }

    const existingStudent =
      studentSnapshot.data() || {};

    if (
      existingStudent
        .paymentVerified !== true
    ) {
      throw new Error(
        'PAYMENT_REQUIRED'
      );
    }

    // =========================
    // PRE-CHECK KEY
    // =========================

    const keySnapshot =
      await keyRef.get();

    if (!keySnapshot.exists) {
      throw new Error(
        'INVALID_KEY'
      );
    }

    const existingKey =
      keySnapshot.data() || {};

    const existingKeyMentorId =
      typeof existingKey.mentorId ===
      'string'
        ? existingKey.mentorId.trim()
        : '';

    if (
      existingKeyMentorId !==
      mentorId
    ) {
      throw new Error(
        'MENTOR_MISMATCH'
      );
    }

    const existingAssignedEmail =
      typeof existingKey.studentEmail ===
      'string'
        ? existingKey.studentEmail
            .trim()
            .toLowerCase()
        : '';

    if (
      existingAssignedEmail !==
      email
    ) {
      throw new Error(
        'EMAIL_MISMATCH'
      );
    }

    if (
      existingKey.used === true
    ) {
      throw new Error(
        'KEY_USED'
      );
    }

    const existingExpiry =
      normalizeExpiry(
        existingKey.expiresAt
      );

    if (
      existingExpiry &&
      existingExpiry.getTime() <=
        Date.now()
    ) {
      throw new Error(
        'KEY_EXPIRED'
      );
    }

    // =========================
    // CHECK PENDING LICENSE
    // =========================
    //
    // New-generation records have
    // pendingKey/pendingMentorId.
    //
    // Older records are still
    // accepted during migration
    // because the key collection
    // remains authoritative.
    // =========================

    const pendingKey =
      typeof existingStudent
        .pendingKey === 'string'
        ? existingStudent
            .pendingKey
            .trim()
            .toUpperCase()
        : '';

    const pendingMentorId =
      typeof existingStudent
        .pendingMentorId === 'string'
        ? existingStudent
            .pendingMentorId
            .trim()
        : '';

    if (
      pendingKey &&
      pendingKey !== key
    ) {
      throw new Error(
        'NOT_CURRENT_PENDING_KEY'
      );
    }

    if (
      pendingMentorId &&
      pendingMentorId !== mentorId
    ) {
      throw new Error(
        'NOT_CURRENT_PENDING_KEY'
      );
    }

    // =========================
    // PREPARE FIREBASE IDENTITY
    // =========================

    const studentUser =
      await getOrCreateStudentUser(
        email
      );

    await adminAuth
      .setCustomUserClaims(
        studentUser.uid,
        {
          role: 'student',
        }
      );

    // =========================
    // ATOMIC ACTIVATION
    // =========================

    const result =
      await adminDb.runTransaction(
        async (transaction) => {
          const studentDoc =
            await transaction.get(
              studentRef
            );

          if (!studentDoc.exists) {
            throw new Error(
              'PAYMENT_REQUIRED'
            );
          }

          const student =
            studentDoc.data() || {};

          if (
            student.paymentVerified !==
            true
          ) {
            throw new Error(
              'PAYMENT_REQUIRED'
            );
          }

          const keyDoc =
            await transaction.get(
              keyRef
            );

          if (!keyDoc.exists) {
            throw new Error(
              'INVALID_KEY'
            );
          }

          const keyData =
            keyDoc.data() || {};

          // =========================
          // MENTOR
          // =========================

          const keyMentorId =
            typeof keyData.mentorId ===
            'string'
              ? keyData.mentorId.trim()
              : '';

          if (
            keyMentorId !== mentorId
          ) {
            throw new Error(
              'MENTOR_MISMATCH'
            );
          }

          // =========================
          // EMAIL
          // =========================

          const assignedEmail =
            typeof keyData.studentEmail ===
            'string'
              ? keyData.studentEmail
                  .trim()
                  .toLowerCase()
              : '';

          if (
            assignedEmail !== email
          ) {
            throw new Error(
              'EMAIL_MISMATCH'
            );
          }

          // =========================
          // USED
          // =========================

          if (
            keyData.used === true
          ) {
            throw new Error(
              'KEY_USED'
            );
          }

          // =========================
          // EXPIRY
          // =========================

          const expiresAt =
            normalizeExpiry(
              keyData.expiresAt
            );

          if (
            expiresAt &&
            expiresAt.getTime() <=
              Date.now()
          ) {
            throw new Error(
              'KEY_EXPIRED'
            );
          }

          // =========================
          // PENDING LICENSE
          // =========================

          const transactionPendingKey =
            typeof student.pendingKey ===
            'string'
              ? student.pendingKey
                  .trim()
                  .toUpperCase()
              : '';

          const transactionPendingMentorId =
            typeof student.pendingMentorId ===
            'string'
              ? student.pendingMentorId
                  .trim()
              : '';

          if (
            transactionPendingKey &&
            transactionPendingKey !== key
          ) {
            throw new Error(
              'NOT_CURRENT_PENDING_KEY'
            );
          }

          if (
            transactionPendingMentorId &&
            transactionPendingMentorId !==
              mentorId
          ) {
            throw new Error(
              'NOT_CURRENT_PENDING_KEY'
            );
          }

          // =========================
          // CONSUME KEY
          // =========================

          transaction.update(
            keyRef,
            {
              used: true,

              usedAt:
                FieldValue
                  .serverTimestamp(),

              activatedByEmail:
                email,

              activatedByUid:
                studentUser.uid,
            }
          );

          // =========================
          // PROMOTE PENDING → ACTIVE
          // =========================
          //
          // paymentVerified is NEVER
          // changed here.
          // =========================

          transaction.set(
            studentRef,
            {
              authUid:
                studentUser.uid,

              role:
                'student',

              key,

              keyUsed:
                true,

              mentorId,

              mentorUid:
                keyData.mentorUid ||
                null,

              plan:
                keyData.plan ||
                'lifetime',

              licenseExpiresAt:
                keyData.expiresAt ??
                null,

              licenseActivatedAt:
                FieldValue
                  .serverTimestamp(),

              requiresReactivation:
                false,

              connected:
                false,

              updatedAt:
                FieldValue
                  .serverTimestamp(),

              // Remove pending state
              // after successful
              // activation.

              pendingKey:
                FieldValue.delete(),

              pendingMentorId:
                FieldValue.delete(),

              pendingMentorUid:
                FieldValue.delete(),

              pendingPlan:
                FieldValue.delete(),

              pendingLicenseExpiresAt:
                FieldValue.delete(),
            },
            {
              merge: true,
            }
          );

          return {
            plan:
              keyData.plan ||
              'lifetime',

            expiresAt:
              expiresAt
                ? expiresAt
                    .toISOString()
                : null,
          };
        }
      );

    // =========================
    // CREATE SIGN-IN TOKEN
    // =========================

    const customToken =
      await adminAuth
        .createCustomToken(
          studentUser.uid,
          {
            role: 'student',
          }
        );

    return NextResponse.json({
      success: true,

      message:
        'License activated',

      customToken,

      plan:
        result.plan,

      expiresAt:
        result.expiresAt,
    });

  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case 'PAYMENT_REQUIRED':
          return NextResponse.json(
            {
              error:
                'This email has not completed a verified R600 activation payment.',
            },
            {
              status: 403,
            }
          );

        case 'INVALID_KEY':
          return NextResponse.json(
            {
              error:
                'Invalid license key.',
            },
            {
              status: 404,
            }
          );

        case 'MENTOR_MISMATCH':
          return NextResponse.json(
            {
              error:
                'Key does not match Mentor ID.',
            },
            {
              status: 400,
            }
          );

        case 'EMAIL_MISMATCH':
          return NextResponse.json(
            {
              error:
                'Key is not assigned to this email.',
            },
            {
              status: 400,
            }
          );

        case 'KEY_USED':
          return NextResponse.json(
            {
              error:
                'This license key has already been used. Request a new key from your mentor.',
            },
            {
              status: 409,
            }
          );

        case 'KEY_EXPIRED':
          return NextResponse.json(
            {
              error:
                'This license key has expired. Please request a new key from your mentor.',
            },
            {
              status: 403,
            }
          );

        case 'NOT_CURRENT_PENDING_KEY':
          return NextResponse.json(
            {
              error:
                'This is not your current replacement key. Please use the latest key provided by your mentor.',
            },
            {
              status: 409,
            }
          );

        case 'EMAIL_IS_MENTOR':
          return NextResponse.json(
            {
              error:
                'This email belongs to a mentor account. Please use a different email for student access.',
            },
            {
              status: 409,
            }
          );

        case 'ACCOUNT_ROLE_CONFLICT':
          return NextResponse.json(
            {
              error:
                'This account cannot be converted into a student account.',
            },
            {
              status: 409,
            }
          );
      }
    }

    console.error(
      'Key verification error:',
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