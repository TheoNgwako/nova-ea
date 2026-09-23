import { NextResponse } from 'next/server';

const PAYPAL_BASE_URL =
  process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are missing');
  }

  const auth = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString('base64');

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('PayPal authentication error:', error);
    throw new Error('Could not authenticate with PayPal');
  }

  const data = await response.json();

  return data.access_token;
}

export async function POST() {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',

          purchase_units: [
            {
              description: 'PIXEL FORGE Activation',

              amount: {
                     currency_code: 'USD',
                     value: '35.00',
              },
            },
          ],
        }),
        cache: 'no-store',
      }
    );

    const order = await response.json();

    if (!response.ok) {
      console.error('PayPal create order error:', order);

      return NextResponse.json(
        {
          error: 'Could not create PayPal order',
          details: order,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Create PayPal order error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}