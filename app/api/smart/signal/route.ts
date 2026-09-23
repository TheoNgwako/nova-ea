import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  FieldValue,
} from 'firebase-admin/firestore';

import {
  adminAuth,
  adminDb,
} from '../../../lib/firebase-admin';

const DAILY_FREE_TOKENS = 10;

const SMART_SERVER_URL =
  process.env.SMART_SERVER_URL;

const SMART_API_SECRET =
  process.env.SMART_API_SECRET;

// ========================================
// AUTHENTICATED STUDENT
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

  if (decoded.role !== 'student') {
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
// DAILY FREE TOKEN KEY
// ========================================

function getTodayKey() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

// ========================================
// NORMALIZE TOKEN STATE
// ========================================

function getTokenState(
  data: Record<string, any>
) {
  const today = getTodayKey();

  let freeTokens =
    typeof data.freeTokens === 'number'
      ? Math.max(
          0,
          Math.floor(data.freeTokens)
        )
      : DAILY_FREE_TOKENS;

  const purchasedTokens =
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

  if (previousReset !== today) {
    freeTokens =
      DAILY_FREE_TOKENS;
  }

  return {
    today,
    freeTokens,
    purchasedTokens,
    totalTokens:
      freeTokens + purchasedTokens,
  };
}

// ========================================
// SMART SIGNAL
// ========================================

export async function POST(
  req: NextRequest
) {
  try {
    if (
      !SMART_SERVER_URL ||
      !SMART_API_SECRET
    ) {
      console.error(
        'Smart server environment variables are missing'
      );

      return NextResponse.json(
        {
          success: false,
          error:
            'Smart service unavailable',
        },
        {
          status: 503,
        }
      );
    }

    const student =
      await getAuthenticatedStudent(
        req
      );

    const body = await req.json();

    const symbol =
      String(body?.symbol || '')
        .trim()
        .toUpperCase();

    const timeframe =
      String(
        body?.timeframe || 'M15'
      )
        .trim()
        .toUpperCase();

    const allowedSymbols =
      new Set([
        'XAUUSD',
        'EURUSD',
        'GBPUSD',
        'BTCUSD',
        'USDJPY',
        'AUDUSD',
        'USDCAD',
        'NZDUSD',
      ]);

    const allowedTimeframes =
      new Set([
        'M5',
        'M15',
        'M30',
        'H1',
        'H4',
      ]);

    if (!allowedSymbols.has(symbol)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Unsupported symbol',
        },
        {
          status: 400,
        }
      );
    }

    if (
      !allowedTimeframes.has(
        timeframe
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Unsupported timeframe',
        },
        {
          status: 400,
        }
      );
    }

    const studentRef =
      adminDb
        .collection('students')
        .doc(student.email);

    // ====================================
    // PRE-CHECK ACCOUNT + TOKEN BALANCE
    //
    // Nothing is deducted yet.
    // ====================================

    const balance =
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

          const tokenState =
            getTokenState(data);

          // Persist today's refill if
          // the document still has an
          // older reset date.
          if (
            data.freeTokensDate !==
            tokenState.today
          ) {
            transaction.set(
              studentRef,
              {
                freeTokens:
                  tokenState.freeTokens,

                freeTokensDate:
                  tokenState.today,

                tokenUpdatedAt:
                  FieldValue
                    .serverTimestamp(),
              },
              {
                merge: true,
              }
            );
          }

          if (
            tokenState.totalTokens < 1
          ) {
            throw new Error(
              'NO_TOKENS'
            );
          }

          return tokenState;
        }
      );

    // ====================================
    // CALL PRIVATE VPS SMART ENGINE
    //
    // Secret remains server-side.
    // ====================================

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        20000
      );

    let smartResponse: Response;

    try {
      smartResponse =
        await fetch(
          `${SMART_SERVER_URL}/smart-signal`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${SMART_API_SECRET}`,
            },

            body:
              JSON.stringify({
                symbol,
                timeframe,
              }),

            signal:
              controller.signal,

            cache: 'no-store',
          }
        );
    } finally {
      clearTimeout(timeout);
    }

    let smartData: any;

    try {
      smartData =
        await smartResponse.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid response from Smart service',
        },
        {
          status: 502,
        }
      );
    }

    if (!smartResponse.ok) {
      console.error(
        'Smart VPS error:',
        smartResponse.status,
        smartData?.error ||
          'Unknown error'
      );

      return NextResponse.json(
        {
          success: false,
          error:
            smartData?.error ||
            'Smart service unavailable',

          retryAfterMinutes:
            smartData
              ?.retryAfterMinutes,
        },
        {
          status:
            smartResponse.status >=
              400 &&
            smartResponse.status < 600
              ? smartResponse.status
              : 502,
        }
      );
    }

    // ====================================
    // NO TRADE = NO CHARGE
    // ====================================

    if (
      smartData?.action ===
        'NO_TRADE' ||
      smartData?.chargeToken !== true
    ) {
      return NextResponse.json({
        ...smartData,

        charged: false,

        tokenBalance: {
          freeTokens:
            balance.freeTokens,

          purchasedTokens:
            balance.purchasedTokens,

          totalTokens:
            balance.totalTokens,
        },
      });
    }

    // Only BUY / SELL responses may
    // consume a token.
    if (
      smartData?.action !== 'BUY' &&
      smartData?.action !== 'SELL'
    ) {
      console.error(
        'Unexpected Smart action:',
        smartData?.action
      );

      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid Smart signal response',
        },
        {
          status: 502,
        }
      );
    }

    // ====================================
    // ATOMIC TOKEN DEDUCTION
    //
    // Re-read the document because another
    // request may have spent a token while
    // the VPS was analysing the market.
    // ====================================

    const remaining =
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

          const tokenState =
            getTokenState(data);

          if (
            tokenState.totalTokens < 1
          ) {
            throw new Error(
              'NO_TOKENS'
            );
          }

          let newFreeTokens =
            tokenState.freeTokens;

          let newPurchasedTokens =
            tokenState.purchasedTokens;

          let tokenType:
            | 'free'
            | 'purchased';

          // FREE TOKENS ALWAYS FIRST.
          if (newFreeTokens > 0) {
            newFreeTokens -= 1;
            tokenType = 'free';
          } else {
            newPurchasedTokens -= 1;
            tokenType = 'purchased';
          }

          transaction.set(
            studentRef,
            {
              freeTokens:
                newFreeTokens,

              purchasedTokens:
                newPurchasedTokens,

              freeTokensDate:
                tokenState.today,

              tokenUpdatedAt:
                FieldValue
                  .serverTimestamp(),

              smartSignalsUsed:
                FieldValue
                  .increment(1),

              lastSmartSignalAt:
                FieldValue
                  .serverTimestamp(),
            },
            {
              merge: true,
            }
          );

          return {
            tokenType,

            freeTokens:
              newFreeTokens,

            purchasedTokens:
              newPurchasedTokens,

            totalTokens:
              newFreeTokens +
              newPurchasedTokens,
          };
        }
      );

    // ====================================
    // RETURN SIGNAL
    // ====================================

    return NextResponse.json({
      ...smartData,

      charged: true,

      tokenCharged:
        remaining.tokenType,

      tokenBalance: {
        freeTokens:
          remaining.freeTokens,

        purchasedTokens:
          remaining
            .purchasedTokens,

        totalTokens:
          remaining.totalTokens,
      },
    });
  } catch (error: any) {
    console.error(
      'Smart signal route error:',
      error?.message || error
    );

    const message =
      error?.message;

    if (message === 'UNAUTHORIZED') {
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
            'Student activation payment required',
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

    if (message === 'NO_TOKENS') {
      return NextResponse.json(
        {
          success: false,
          error:
            'No Smart tokens available',
        },
        {
          status: 402,
        }
      );
    }

    if (
      error?.name === 'AbortError'
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Smart analysis timed out',
        },
        {
          status: 504,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          'Unable to generate Smart signal',
      },
      {
        status: 500,
      }
    );
  }
}