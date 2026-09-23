import { NextResponse } from 'next/server';

// ==========================================
// LEGACY PAYMENT CONFIRMATION ROUTE
// ==========================================
//
// DISABLED.
//
// Student activation must only happen after
// payment has been verified through the
// PayPal capture flow.
//
// This endpoint must NEVER update:
// - paid
// - paymentVerified
// - paidAt
// - paymentAmount
//
// Verified payment data is handled by:
// /api/paypal/capture-order
// ==========================================

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error:
        'This payment confirmation endpoint has been disabled.',
    },
    {
      status: 410,
    }
  );
}