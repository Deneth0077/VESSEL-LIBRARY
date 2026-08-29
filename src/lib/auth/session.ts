import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db/connect';
import User from '@/models/User';
import { JWTPayload, IUser } from '@/types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'vessel_library_super_secret_jwt_key_32bytes_minimum_length_required!'
);
const TOKEN_NAME = 'vessel_lib_token';
const TOKEN_EXPIRY = '7d';

/**
 * Hash plain PIN / password using bcrypt
 */
export async function hashPin(pin: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(pin, salt);
}

/**
 * Verify plain PIN / password against hash
 */
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Sign JWT session token
 */
export async function createSessionToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET_KEY);
}

/**
 * Verify JWT session token and check active DB status for account suspension / denial
 */
export async function verifySession(token?: string): Promise<IUser | null> {
  try {
    let tokenStr = token;
    if (!tokenStr) {
      const cookieStore = cookies();
      tokenStr = cookieStore.get(TOKEN_NAME)?.value;
    }

    if (!tokenStr) {
      return null;
    }

    const verified = await jwtVerify(tokenStr, SECRET_KEY);
    const payload = verified.payload as unknown as JWTPayload;

    if (!payload?.userId) {
      return null;
    }

    // Verify DB user status on every request!
    await dbConnect();
    const user = await User.findById(payload.userId).select('-pinHash');

    if (!user) {
      return null;
    }

    // Mandatory status check: User MUST be APPROVED
    if (user.status !== 'APPROVED') {
      return null;
    }

    const userObj = user.toObject();
    return {
      ...userObj,
      _id: userObj._id.toString(),
    } as unknown as IUser;
  } catch (error) {
    return null;
  }
}

/**
 * Set HTTP-only session cookie
 */
export function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

/**
 * Clear session cookie
 */
export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
