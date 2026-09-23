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

const DAILY_FREE_TOKENS = 10;

// ========================================
// GET AUTHENTICATED STUDENT
// ========================================

async function getAuthenticatedStudent(
  req: NextRequest
) {
  const authorization =
    req.headers.get('authorization');

  if (
    !authorization ||
    !authorization.startsWith('Bearer ')
  ) {
    throw new Error('UNAUTHORIZED');
  }

  const idToken =
    authorization.substring(7);

  const decoded =
    await adminAuth.verifyIdToken(
      idToken
    );

  if (
    decoded.role !== 'student'
  ) {
    throw new Error('STUDENT_REQUIRED');
  }

  if (!decoded.email) {
    throw new Error('EMAIL_REQUIRED');
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
// UTC DAILY RESET KEY
// ========================================

function getTodayKey() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

// ========================================
// GET TOKEN BALANCE
// ========================================

export async function GET(
  req: NextRequest
) {
  try {
    const student =
      await getAuthenticatedStudent(
        req
      );

    const studentRef =
      adminDb
        .collection('students')
        .doc(student.email);

    const result =
      await adminDb.runTransaction(
        async transaction => {
          const snapshot =
            await transaction.get(
              studentRef
            );

          if (!snapshot.exists) {
            throw new Error(
              'STUDENT_NOT_FOUND'
            );
          }

          const data =
            snapshot.data() || {};

          if (
            data.paymentVerified !== true
          ) {
            throw new Error(
              'PAYMENT_REQUIRED'
            );
          }

          if (
            data.authUid &&
            data.authUid !== student.uid
          ) {
            throw new Error(
              'ACCOUNT_MISMATCH'
            );
          }

          const today =
            getTodayKey();

          let freeTokens =
            typeof data.freeTokens ===
            'number'
              ? Math.max(
                  0,
                  Math.floor(
                    data.freeTokens
                  )
                )
              : DAILY_FREE_TOKENS;

          let purchasedTokens =
            typeof data.purchasedTokens ===
            'number'
              ? Math.max(
                  0,
                  Math.floor(
                    data.purchasedTokens
                  )
                )
              : 0;

          const previousReset =
            typeof data.freeTokensDate ===
            'string'
              ? data.freeTokensDate
              : null;

          // Every new UTC day,
          // refill the FREE allowance
          // back to exactly 10.
          //
          // Purchased tokens are NEVER
          // removed by the daily reset.

          if (
            previousReset !== today
          ) {
            freeTokens =
              DAILY_FREE_TOKENS;

            transaction.set(
              studentRef,
              {
                freeTokens:
                  DAILY_FREE_TOKENS,

                freeTokensDate:
                  today,

                tokenUpdatedAt:
                  FieldValue
                    .serverTimestamp(),
              },
              {
                merge: true,
              }
            );
          }

          return {
            freeTokens,
            purchasedTokens,

            totalTokens:
              freeTokens +
              purchasedTokens,

            dailyAllowance:
              DAILY_FREE_TOKENS,

            freeTokensDate:
              today,
          };
        }
      );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error(
      'Token balance error:',
      error?.message || error
    );

    if (
      error?.message ===
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
      error?.message ===
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
      error?.message ===
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
      error?.message ===
      'PAYMENT_REQUIRED'
    ) {
      return NextResponse.json(
        {
          error:
            'Student activation payment required',
        },
        {
          status: 403,
        }
      );
    }

    if (
      error?.message ===
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

    return NextResponse.json(
      {
        error:
          'Unable to load token balance',
      },
      {
        status: 500,
      }
    );
  }
}