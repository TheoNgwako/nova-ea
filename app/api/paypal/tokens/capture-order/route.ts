import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  adminAuth,
  adminDb,
} from '../../../../lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PAYPAL_CLIENT_ID =
  process.env.PAYPAL_CLIENT_ID || '';

const PAYPAL_CLIENT_SECRET =
  process.env.PAYPAL_CLIENT_SECRET || '';

const PAYPAL_ENV =
  process.env.PAYPAL_ENV || 'sandbox';

const PAYPAL_BASE_URL =
  PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

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
    authorization.slice(7);

  const decoded =
    await adminAuth.verifyIdToken(
      idToken
    );

  if (
    decoded.role !== 'student'
  ) {
    throw new Error(
      'STUDENT_REQUIRED'
    );
  }

  const email =
    String(
      decoded.email || ''
    )
      .trim()
      .toLowerCase();

  if (!email) {
    throw new Error(
      'EMAIL_REQUIRED'
    );
  }

  const studentRef =
    adminDb
      .collection('students')
      .doc(email);

  const snapshot =
    await studentRef.get();

  if (!snapshot.exists) {
    throw new Error(
      'STUDENT_NOT_FOUND'
    );
  }

  const data =
    snapshot.data() || {};

  if (
    data.paymentVerified !==
    true
  ) {
    throw new Error(
      'PAYMENT_REQUIRED'
    );
  }

  if (
    data.authUid &&
    data.authUid !== decoded.uid
  ) {
    throw new Error(
      'ACCOUNT_MISMATCH'
    );
  }

  if (
    data.requiresReactivation ===
    true
  ) {
    throw new Error(
      'REACTIVATION_REQUIRED'
    );
  }

  return {
    uid: decoded.uid,
    email,
    studentRef,
  };
}

// ========================================
// PAYPAL ACCESS TOKEN
// ========================================

async function getPayPalAccessToken() {
  if (
    !PAYPAL_CLIENT_ID ||
    !PAYPAL_CLIENT_SECRET
  ) {
    throw new Error(
      'PAYPAL_NOT_CONFIGURED'
    );
  }

  const credentials =
    Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

  const response =
    await fetch(
      `${PAYPAL_BASE_URL}/v1/oauth2/token`,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Basic ${credentials}`,

          'Content-Type':
            'application/x-www-form-urlencoded',
        },

        body:
          'grant_type=client_credentials',

        cache: 'no-store',
      }
    );

  const data =
    await response.json();

  if (
    !response.ok ||
    !data.access_token
  ) {
    console.error(
      'PayPal auth error:',
      data
    );

    throw new Error(
      'PAYPAL_AUTH_FAILED'
    );
  }

  return String(
    data.access_token
  );
}

// ========================================
// GET PAYPAL ORDER
// ========================================

async function getPayPalOrder(
  orderId: string,
  accessToken: string
) {
  const response =
    await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(
        orderId
      )}`,
      {
        method: 'GET',

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },

        cache: 'no-store',
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    console.error(
      'PayPal order lookup error:',
      data
    );

    throw new Error(
      'PAYPAL_ORDER_LOOKUP_FAILED'
    );
  }

  return data;
}

// ========================================
// CAPTURE
// ========================================

export async function POST(
  req: NextRequest
) {
  try {
    const student =
      await getStudent(req);

    const body =
      await req.json();

    const orderId =
      String(
        body?.orderId || ''
      ).trim();

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'PayPal order ID is required',
        },
        {
          status: 400,
        }
      );
    }

    const paymentRef =
      adminDb
        .collection(
          'tokenPayments'
        )
        .doc(orderId);

    const paymentSnapshot =
      await paymentRef.get();

    if (
      !paymentSnapshot.exists
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Token purchase order not found',
        },
        {
          status: 404,
        }
      );
    }

    const payment =
      paymentSnapshot.data() ||
      {};

    // ====================================
    // ORDER MUST BELONG TO THIS STUDENT
    // ====================================

    if (
      payment.studentUid !==
        student.uid ||
      payment.studentEmail !==
        student.email
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'This purchase does not belong to this student',
        },
        {
          status: 403,
        }
      );
    }

    const quantity =
      Number(
        payment.quantity
      );

    const expectedAmount =
      String(
        payment.expectedAmount ||
          ''
      );

    const expectedCurrency =
      String(
        payment.currency ||
          'USD'
      ).toUpperCase();

    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity < 1 ||
      quantity > 100
    ) {
      throw new Error(
        'INVALID_PAYMENT_RECORD'
      );
    }

    if (!expectedAmount) {
      throw new Error(
        'INVALID_PAYMENT_RECORD'
      );
    }

    // ====================================
    // ALREADY CREDITED
    //
    // Important:
    // pressing/calling capture twice must
    // NEVER give extra tokens.
    // ====================================

    if (
      payment.credited === true
    ) {
      const studentSnapshot =
        await student.studentRef.get();

      const studentData =
        studentSnapshot.data() ||
        {};

      const purchasedTokens =
        Number.isFinite(
          studentData.purchasedTokens
        )
          ? Math.max(
              0,
              Math.floor(
                studentData.purchasedTokens
              )
            )
          : 0;

      return NextResponse.json({
        success: true,
        alreadyCredited: true,
        quantity,
        purchasedTokens,
      });
    }

    const accessToken =
      await getPayPalAccessToken();

    // ====================================
    // ATTEMPT CAPTURE
    // ====================================

    const captureResponse =
      await fetch(
        `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(
          orderId
        )}/capture`,
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${accessToken}`,

            'Content-Type':
              'application/json',

            'PayPal-Request-Id':
              `pixel-forge-token-capture-${orderId}`,
          },

          body:
            JSON.stringify({}),

          cache: 'no-store',
        }
      );

    let captureResult: any =
      null;

    try {
      captureResult =
        await captureResponse.json();
    } catch {
      captureResult = null;
    }

    /*
     * Even if PayPal says the order was
     * already captured, we do NOT guess.
     *
     * We fetch the official order state
     * from PayPal below.
     */
    if (
      !captureResponse.ok
    ) {
      console.warn(
        'PayPal capture response:',
        captureResult
      );
    }

    // ====================================
    // VERIFY OFFICIAL PAYPAL ORDER STATE
    // ====================================

    const paypalOrder =
      await getPayPalOrder(
        orderId,
        accessToken
      );

    if (
      paypalOrder.id !==
      orderId
    ) {
      throw new Error(
        'PAYPAL_ORDER_MISMATCH'
      );
    }

    if (
      paypalOrder.status !==
      'COMPLETED'
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Payment has not completed',
        },
        {
          status: 409,
        }
      );
    }

    const purchaseUnit =
      paypalOrder
        ?.purchase_units?.[0];

    if (!purchaseUnit) {
      throw new Error(
        'PAYPAL_PURCHASE_UNIT_MISSING'
      );
    }

    // ====================================
    // VERIFY STUDENT BINDING
    // ====================================

    if (
      String(
        purchaseUnit.custom_id ||
          ''
      ) !== student.uid
    ) {
      throw new Error(
        'PAYPAL_STUDENT_MISMATCH'
      );
    }

    if (
      String(
        purchaseUnit.reference_id ||
          ''
      ) !==
      'PIXEL_FORGE_SMART_TOKENS'
    ) {
      throw new Error(
        'PAYPAL_REFERENCE_MISMATCH'
      );
    }

    const captures =
      purchaseUnit
        ?.payments?.captures;

    if (
      !Array.isArray(captures) ||
      captures.length < 1
    ) {
      throw new Error(
        'PAYPAL_CAPTURE_MISSING'
      );
    }

    const completedCapture =
      captures.find(
        (capture: any) =>
          capture?.status ===
          'COMPLETED'
      );

    if (!completedCapture) {
      throw new Error(
        'PAYPAL_CAPTURE_NOT_COMPLETED'
      );
    }

    const paidAmount =
      String(
        completedCapture
          ?.amount?.value ||
          ''
      );

    const paidCurrency =
      String(
        completedCapture
          ?.amount
          ?.currency_code ||
          ''
      ).toUpperCase();

    // ====================================
    // VERIFY EXACT MONEY
    // ====================================

    if (
      paidAmount !==
      expectedAmount
    ) {
      console.error(
        'Token payment amount mismatch:',
        {
          expectedAmount,
          paidAmount,
        }
      );

      throw new Error(
        'PAYPAL_AMOUNT_MISMATCH'
      );
    }

    if (
      paidCurrency !==
      expectedCurrency
    ) {
      throw new Error(
        'PAYPAL_CURRENCY_MISMATCH'
      );
    }

    const captureId =
      String(
        completedCapture.id ||
          ''
      );

    // ====================================
    // ATOMIC TOKEN CREDIT
    //
    // Firestore transaction prevents
    // duplicate credits during retries.
    // ====================================

    const result =
      await adminDb.runTransaction(
        async transaction => {
          const [
            freshPaymentSnapshot,
            freshStudentSnapshot,
          ] =
            await Promise.all([
              transaction.get(
                paymentRef
              ),

              transaction.get(
                student.studentRef
              ),
            ]);

          if (
            !freshPaymentSnapshot.exists
          ) {
            throw new Error(
              'PAYMENT_RECORD_MISSING'
            );
          }

          if (
            !freshStudentSnapshot.exists
          ) {
            throw new Error(
              'STUDENT_NOT_FOUND'
            );
          }

          const freshPayment =
            freshPaymentSnapshot.data() ||
            {};

          const freshStudent =
            freshStudentSnapshot.data() ||
            {};

          // Another request already
          // credited this order.
          if (
            freshPayment.credited ===
            true
          ) {
            const currentPurchased =
              Number.isFinite(
                freshStudent.purchasedTokens
              )
                ? Math.max(
                    0,
                    Math.floor(
                      freshStudent.purchasedTokens
                    )
                  )
                : 0;

            return {
              alreadyCredited:
                true,

              purchasedTokens:
                currentPurchased,
            };
          }

          if (
            freshPayment.studentUid !==
              student.uid ||
            freshPayment.studentEmail !==
              student.email
          ) {
            throw new Error(
              'PAYMENT_OWNER_MISMATCH'
            );
          }

          if (
            freshStudent.paymentVerified !==
            true
          ) {
            throw new Error(
              'PAYMENT_REQUIRED'
            );
          }

          if (
            freshStudent.authUid &&
            freshStudent.authUid !==
              student.uid
          ) {
            throw new Error(
              'ACCOUNT_MISMATCH'
            );
          }

          if (
            freshStudent.requiresReactivation ===
            true
          ) {
            throw new Error(
              'REACTIVATION_REQUIRED'
            );
          }

          const existingPurchased =
            Number.isFinite(
              freshStudent.purchasedTokens
            )
              ? Math.max(
                  0,
                  Math.floor(
                    freshStudent.purchasedTokens
                  )
                )
              : 0;

          const newPurchasedTokens =
            existingPurchased +
            quantity;

          transaction.set(
            student.studentRef,
            {
              purchasedTokens:
                newPurchasedTokens,

              tokensUpdatedAt:
                new Date(),
            },
            {
              merge: true,
            }
          );

          transaction.set(
            paymentRef,
            {
              status:
                'COMPLETED',

              credited:
                true,

              captureId,

              capturedAmount:
                paidAmount,

              capturedCurrency:
                paidCurrency,

              creditedAt:
                new Date(),

              updatedAt:
                new Date(),
            },
            {
              merge: true,
            }
          );

          return {
            alreadyCredited:
              false,

            purchasedTokens:
              newPurchasedTokens,
          };
        }
      );

    return NextResponse.json({
      success: true,

      orderId,

      quantity,

      captureId,

      alreadyCredited:
        result.alreadyCredited,

      purchasedTokens:
        result.purchasedTokens,
    });
  } catch (error: any) {
    const message =
      error?.message || '';

    console.error(
      'Token capture error:',
      message
    );

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
        'STUDENT_NOT_FOUND' ||
      message ===
        'EMAIL_REQUIRED'
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
        'PAYMENT_REQUIRED' ||
      message ===
        'ACCOUNT_MISMATCH' ||
      message ===
        'REACTIVATION_REQUIRED' ||
      message ===
        'PAYMENT_OWNER_MISMATCH' ||
      message ===
        'PAYPAL_STUDENT_MISMATCH'
    ) {
      return NextResponse.json(
        {
          error:
            'Student licence is not active',
        },
        {
          status: 403,
        }
      );
    }

    if (
      message ===
        'PAYPAL_AMOUNT_MISMATCH' ||
      message ===
        'PAYPAL_CURRENCY_MISMATCH' ||
      message ===
        'PAYPAL_REFERENCE_MISMATCH'
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Payment verification failed',
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          'Could not verify token purchase',
      },
      {
        status: 500,
      }
    );
  }
}