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

type TradingMode =
  | 'MANUAL'
  | 'AUTO';


// =========================
// DEFAULTS
// =========================

const DEFAULT_MAX_AUTO_TRADES =
  1;

const MIN_AUTO_TRADES =
  0;

const MAX_AUTO_TRADES =
  10;


// =========================
// AUTHENTICATE USER
// =========================

async function getAuthenticatedUser(
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

  const token =
    authorization.substring(7);

  if (!token) {
    throw new Error(
      'UNAUTHORIZED'
    );
  }

  try {
    return await adminAuth
      .verifyIdToken(token);
  } catch {
    throw new Error(
      'UNAUTHORIZED'
    );
  }
}


// =========================
// NORMALIZE EXPIRY
// =========================

function getExpiryDate(
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
    const date =
      new Date(value);

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
// NORMALIZE MAX AUTO TRADES
// =========================

function normalizeMaxAutoTrades(
  value: unknown
) {
  if (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >=
      MIN_AUTO_TRADES &&
    value <=
      MAX_AUTO_TRADES
  ) {
    return value;
  }

  return DEFAULT_MAX_AUTO_TRADES;
}


// =========================
// VALIDATE STUDENT LICENSE
// =========================

async function getValidStudent(
  decodedToken: Awaited<
    ReturnType<
      typeof adminAuth.verifyIdToken
    >
  >
) {
  const email =
    decodedToken.email
      ?.trim()
      .toLowerCase();

  if (!email) {
    throw new Error(
      'EMAIL_MISSING'
    );
  }

  if (
    decodedToken.role !==
    'student'
  ) {
    throw new Error(
      'NOT_STUDENT'
    );
  }

  const studentRef =
    adminDb
      .collection('students')
      .doc(email);

  const studentDoc =
    await studentRef.get();

  if (!studentDoc.exists) {
    throw new Error(
      'STUDENT_NOT_FOUND'
    );
  }

  const student =
    studentDoc.data() || {};


  // =========================
  // PAYMENT
  // =========================

  if (
    student.paymentVerified !==
    true
  ) {
    throw new Error(
      'PAYMENT_REQUIRED'
    );
  }


  // =========================
  // REPLACEMENT KEY PENDING
  // =========================

  if (
    student.requiresReactivation ===
    true
  ) {
    throw new Error(
      'REACTIVATION_REQUIRED'
    );
  }


  // =========================
  // FIREBASE UID OWNERSHIP
  // =========================

  const authUid =
    typeof student.authUid ===
    'string'
      ? student.authUid.trim()
      : '';

  if (
    !authUid ||
    authUid !== decodedToken.uid
  ) {
    throw new Error(
      'AUTH_UID_MISMATCH'
    );
  }


  // =========================
  // ACTIVE KEY
  // =========================

  if (
    student.keyUsed !== true
  ) {
    throw new Error(
      'LICENSE_INACTIVE'
    );
  }

  const activeKey =
    typeof student.key ===
    'string'
      ? student.key.trim()
      : '';

  if (!activeKey) {
    throw new Error(
      'LICENSE_INACTIVE'
    );
  }


  // =========================
  // EXPIRY
  // =========================

  const expiry =
    getExpiryDate(
      student.licenseExpiresAt
    );

  if (
    expiry &&
    expiry.getTime() <=
      Date.now()
  ) {
    throw new Error(
      'LICENSE_EXPIRED'
    );
  }

  return {
    studentRef,
    student,
  };
}


// =========================
// ERROR RESPONSE
// =========================

function studentErrorResponse(
  error: unknown
) {
  if (!(error instanceof Error)) {
    return null;
  }

  switch (error.message) {
    case 'UNAUTHORIZED':
      return NextResponse.json(
        {
          error:
            'Authentication required',
        },
        {
          status: 401,
        }
      );

    case 'EMAIL_MISSING':
      return NextResponse.json(
        {
          error:
            'Authenticated account has no email',
        },
        {
          status: 400,
        }
      );

    case 'NOT_STUDENT':
      return NextResponse.json(
        {
          error:
            'Student access required',
        },
        {
          status: 403,
        }
      );

    case 'STUDENT_NOT_FOUND':
      return NextResponse.json(
        {
          error:
            'Student account not found',
        },
        {
          status: 404,
        }
      );

    case 'PAYMENT_REQUIRED':
      return NextResponse.json(
        {
          error:
            'Student payment is not verified',
        },
        {
          status: 403,
        }
      );

    case 'REACTIVATION_REQUIRED':
      return NextResponse.json(
        {
          error:
            'A new mentor license has been issued. Please activate the latest Mentor ID and license key.',
          code:
            'REACTIVATION_REQUIRED',
        },
        {
          status: 403,
        }
      );

    case 'AUTH_UID_MISMATCH':
      return NextResponse.json(
        {
          error:
            'This student session is no longer valid.',
          code:
            'SESSION_INVALID',
        },
        {
          status: 403,
        }
      );

    case 'LICENSE_INACTIVE':
      return NextResponse.json(
        {
          error:
            'Student license is not active.',
          code:
            'LICENSE_INACTIVE',
        },
        {
          status: 403,
        }
      );

    case 'LICENSE_EXPIRED':
      return NextResponse.json(
        {
          error:
            'Student license has expired. Please request a new key from your mentor.',
          code:
            'LICENSE_EXPIRED',
        },
        {
          status: 403,
        }
      );

    default:
      return null;
  }
}


// =========================
// GET TRADING STATE
// =========================

export async function GET(
  req: NextRequest
) {
  try {
    const decodedToken =
      await getAuthenticatedUser(
        req
      );

    const {
      student,
    } =
      await getValidStudent(
        decodedToken
      );

    const tradingEnabled =
      student.tradingEnabled ===
      true;

    const tradingMode:
      TradingMode =
      student.tradingMode ===
      'AUTO'
        ? 'AUTO'
        : 'MANUAL';

    const maxAutoTrades =
      normalizeMaxAutoTrades(
        student.maxAutoTrades
      );

    return NextResponse.json({
      success: true,

      tradingEnabled,

      tradingMode,

      maxAutoTrades,
    });
  } catch (error) {
    const response =
      studentErrorResponse(
        error
      );

    if (response) {
      return response;
    }

    console.error(
      'Trading state GET error:',
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


// =========================
// UPDATE TRADING STATE
// =========================

export async function POST(
  req: NextRequest
) {
  try {
    const decodedToken =
      await getAuthenticatedUser(
        req
      );

    const body =
      await req.json();

    const tradingEnabled =
      body.tradingEnabled;

    const tradingMode =
      body.tradingMode;

    const maxAutoTrades =
      body.maxAutoTrades;


    // =========================
    // VALIDATE ENABLED
    // =========================

    if (
      typeof tradingEnabled !==
      'boolean'
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid tradingEnabled value',
        },
        {
          status: 400,
        }
      );
    }


    // =========================
    // VALIDATE MODE
    // =========================

    if (
      tradingMode !==
        'MANUAL' &&
      tradingMode !==
        'AUTO'
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid trading mode',
        },
        {
          status: 400,
        }
      );
    }


    // =========================
    // VALIDATE MAX AUTO TRADES
    // =========================

    if (
      typeof maxAutoTrades !==
        'number' ||
      !Number.isInteger(
        maxAutoTrades
      ) ||
      maxAutoTrades <
        MIN_AUTO_TRADES ||
      maxAutoTrades >
        MAX_AUTO_TRADES
    ) {
      return NextResponse.json(
        {
          error:
            'maxAutoTrades must be an integer between 0 and 10',
        },
        {
          status: 400,
        }
      );
    }


    const {
      studentRef,
    } =
      await getValidStudent(
        decodedToken
      );


    // =========================
    // UPDATE AUTHORITATIVE STATE
    // =========================

    await studentRef.update({
      tradingEnabled,

      tradingMode,

      maxAutoTrades,

      tradingStateUpdatedAt:
        FieldValue.serverTimestamp(),

      tradingStateUpdatedBy:
        decodedToken.uid,
    });


    return NextResponse.json({
      success: true,

      tradingEnabled,

      tradingMode,

      maxAutoTrades,
    });
  } catch (error) {
    const response =
      studentErrorResponse(
        error
      );

    if (response) {
      return response;
    }

    console.error(
      'Trading state POST error:',
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
