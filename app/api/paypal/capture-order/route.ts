import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  adminDb,
} from '../../../lib/firebase-admin';

const PAYPAL_BASE_URL =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

const ACTIVATION_CURRENCY = 'USD';
const ACTIVATION_AMOUNT = '35.00';

// =========================
// PAYPAL ACCESS TOKEN
// =========================

async function getPayPalAccessToken() {
  const clientId =
    process.env.PAYPAL_CLIENT_ID;

  const clientSecret =
    process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'PayPal credentials are missing'
    );
  }

  const auth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString('base64');

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    {
      method: 'POST',

      headers: {
        Authorization:
          `Basic ${auth}`,

        'Content-Type':
          'application/x-www-form-urlencoded',
      },

      body:
        'grant_type=client_credentials',

      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(
      'Could not authenticate with PayPal'
    );
  }

  const data =
    await response.json();

  return data.access_token;
}

// =========================
// CAPTURE ORDER
// =========================

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const orderId =
      typeof body.orderId === 'string'
        ? body.orderId.trim()
        : '';

    const email =
      typeof body.email === 'string'
        ? body.email
            .trim()
            .toLowerCase()
        : '';

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Order ID is required',
        },
        {
          status: 400,
        }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Email is required',
        },
        {
          status: 400,
        }
      );
    }

    const accessToken =
      await getPayPalAccessToken();

    // =========================
    // ASK PAYPAL TO CAPTURE
    // =========================

    const response =
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
          },

          cache: 'no-store',
        }
      );

    const data =
      await response.json();

    // =========================
    // PAYPAL RETURNED ERROR
    // =========================

    if (!response.ok) {
      console.error(
        'PayPal capture error:',
        JSON.stringify(
          data,
          null,
          2
        )
      );

      const issue =
        data?.details?.[0]
          ?.issue;

      if (
        issue ===
        'INSTRUMENT_DECLINED'
      ) {
        return NextResponse.json(
          {
            success: false,

            code:
              'INSTRUMENT_DECLINED',

            error:
              'The selected card or payment method was declined. Please try another payment method.',
          },
          {
            status: 422,
          }
        );
      }

      return NextResponse.json(
        {
          success: false,

          code:
            issue ||
            data?.name ||
            'PAYPAL_CAPTURE_FAILED',

          error:
            data?.message ||
            'Could not capture PayPal payment',
        },
        {
          status:
            response.status >= 400 &&
            response.status < 600
              ? response.status
              : 500,
        }
      );
    }

    // =========================
    // VERIFY ORDER COMPLETED
    // =========================

    if (
      data.status !==
      'COMPLETED'
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            'Payment was not completed',
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // GET CAPTURE
    // =========================

    const capture =
      data.purchase_units?.[0]
        ?.payments
        ?.captures?.[0];

    if (!capture) {
      return NextResponse.json(
        {
          success: false,

          error:
            'PayPal capture information is missing',
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VERIFY CAPTURE STATUS
    // =========================

    if (
      capture.status !==
      'COMPLETED'
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            'PayPal payment capture is not completed',
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // VERIFY AMOUNT
    // =========================

    const currency =
      capture.amount
        ?.currency_code;

    const amount =
      capture.amount
        ?.value;

    if (
      currency !==
        ACTIVATION_CURRENCY ||
      amount !==
        ACTIVATION_AMOUNT
    ) {
      console.error(
        'Unexpected PayPal amount:',
        {
          currency,
          amount,
        }
      );

      return NextResponse.json(
        {
          success: false,

          error:
            'Payment amount could not be verified',
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // PAYMENT VERIFIED
    // =========================

    await adminDb
      .collection('students')
      .doc(email)
      .set(
        {
          email,

          paymentVerified: true,
          paid: true,

          paypalOrderId:
            data.id,

          paypalCaptureId:
            capture.id,

          paymentCurrency:
            currency,

          paymentAmount:
            amount,

          paidAt:
            new Date()
              .toISOString(),
        },
        {
          merge: true,
        }
      );

    // =========================
    // SUCCESS
    // =========================

    return NextResponse.json({
      success: true,
      status: 'COMPLETED',
      orderId: data.id,
      captureId: capture.id,
    });

  } catch (error) {
    console.error(
      'Capture PayPal order error:',
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      },
      {
        status: 500,
      }
    );
  }
}