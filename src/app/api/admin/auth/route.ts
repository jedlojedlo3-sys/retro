import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const ADMIN_SECRET_CODE = process.env.ADMIN_SECRET_CODE || 'Retro2003Admin';
const AUTH_SECRET = process.env.AUTH_SECRET || 'retro-boutique-secret-key-2003-prilep';
const COOKIE_NAME = 'retro_admin_session';

function createToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`admin:${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`admin:${timestamp}`)
    .digest('hex');

  if (signature !== expectedSig) return false;

  // Token valid for 7 days
  const time = parseInt(timestamp, 10);
  if (isNaN(time) || Date.now() - time > 7 * 24 * 60 * 60 * 1000) {
    return false;
  }

  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Access code required' }, { status: 400 });
    }

    if (code.trim() !== ADMIN_SECRET_CODE) {
      return NextResponse.json({ success: false, error: 'Invalid access code' }, { status: 401 });
    }

    const token = createToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isValid = verifyToken(token);

  if (!isValid) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
