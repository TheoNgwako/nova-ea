import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: 'PayPal Client ID is missing' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    clientId,
    currency: 'USD',
  });
}