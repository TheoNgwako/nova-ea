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

/*
 * PayPal does not currently accept ZAR
 * in the checkout configuration we are
 * using.
 *
 * We therefore keep the checkout amount
 * configurable server-side.
 *
 * Later we can change this without
 * changing frontend code.
 */
const TOKEN_PRICE_USD =
  Number(
    process.env.TOKEN_PRICE_USD ||
      '0.60'
  );

const PAYPAL_BASE_URL =
  PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// ========================================
// FIREBASE STUDENT AUTH
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

  const studentData =
    snapshot.data() || {};

  if (
    studentData.paymentVerified !==
    true
  ) {
    throw new Error(
      'PAYMENT_REQUIRED'
    );
  }

  if (
    studentData.authUid &&
    studentData.authUid !==
      decoded.uid
  ) {
    throw new Error(
      'ACCOUNT_MISMATCH'
    );
  }

  if (
    studentData.requiresReactivation ===
    true
  ) {
    throw new Error(
      'REACTIVATION_REQUIRED'
    );
  }

  return {
    uid: decoded.uid,
    email,
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
      'PayPal token error:',
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
// CREATE TOKEN ORDER
// ========================================

export async function POST(
  req: NextRequest
) {
  try {
    const student =
      await getStudent(req);

    const body =
      await req.json();

    const quantity =
      Number(
        body?.quantity
      );

    // Allow sensible purchases only.
    if (
      !Number.isInteger(
        quantity
      ) ||
      quantity < 1 ||
      quantity > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Token quantity must be between 1 and 100',
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        TOKEN_PRICE_USD
      ) ||
      TOKEN_PRICE_USD <= 0
    ) {
      throw new Error(
        'INVALID_TOKEN_PRICE'
      );
    }

    const total =
      (
        TOKEN_PRICE_USD *
        quantity
      ).toFixed(2);

    const accessToken =
      await getPayPalAccessToken();

    // ====================================
    // CREATE PAYPAL ORDER
    // ====================================

    const paypalResponse =
      await fetch(
        `${PAYPAL_BASE_URL}/v2/checkout/orders`,
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${accessToken}`,

            'Content-Type':
              'application/json',

            'PayPal-Request-Id':
              `pixel-forge-token-${student.uid}-${Date.now()}`,
          },

          body: JSON.stringify({
            intent: 'CAPTURE',

            purchase_units: [
              {
                reference_id:
                  'PIXEL_FORGE_SMART_TOKENS',

                /*
                 * This binds the PayPal
                 * order to the authenticated
                 * Firebase account.
                 */
                custom_id:
                  student.uid,

                description:
                  `PIXEL FORGE Smart Tokens x${quantity}`,

                amount: {
                  currency_code:
                    'USD',

                  value: total,

                  breakdown: {
                    item_total: {
                      currency_code:
                        'USD',

                      value: total,
                    },
                  },
                },

                items: [
                  {
                    name:
                      'PIXEL FORGE Smart Token',

                    description:
                      'Smart market analysis token',

                    quantity:
                      String(
                        quantity
                      ),

                    unit_amount: {
                      currency_code:
                        'USD',

                      value:
                        TOKEN_PRICE_USD.toFixed(
                          2
                        ),
                    },
                  },
                ],
              },
            ],
          }),

          cache: 'no-store',
        }
      );

    const paypalOrder =
      await paypalResponse.json();

    if (
      !paypalResponse.ok ||
      !paypalOrder.id
    ) {
      console.error(
        'PayPal create token order error:',
        paypalOrder
      );

      throw new Error(
        'PAYPAL_ORDER_FAILED'
      );
    }

    const orderId =
      String(
        paypalOrder.id
      );

    // ====================================
    // STORE SERVER-SIDE ORDER RECORD
    //
    // Never trust the browser later to
    // tell us how many tokens it bought.
    // ====================================

    await adminDb
      .collection(
        'tokenPayments'
      )
      .doc(orderId)
      .set({
        orderId,

        studentUid:
          student.uid,

        studentEmail:
          student.email,

        quantity,

        tokenPriceUsd:
          TOKEN_PRICE_USD,

        expectedAmount:
          total,

        currency:
          'USD',

        status:
          'CREATED',

        credited:
          false,

        createdAt:
          new Date(),
      });

    return NextResponse.json({
      success: true,

      orderId,

      quantity,

      amount: total,

      currency: 'USD',
    });
  } catch (error: any) {
    const message =
      error?.message || '';

    console.error(
      'Create token order error:',
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
        'REACTIVATION_REQUIRED'
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

    return NextResponse.json(
      {
        success: false,
        error:
          'Could not create token purchase',
      },
      {
        status: 500,
      }
    );
  }
}