import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { UserSession, UserRole, UserStatus } from '@/types';
import { db } from '@/lib/db';

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cyber-sentinel-super-secret-jwt-key-2026-secure-production-hash'
);

const TOKEN_COOKIE_NAME = 'cyber_sentinel_token';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET_KEY);
}

export async function verifyToken(token: string): Promise<UserSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET_KEY);
    return verified.payload as unknown as UserSession;
  } catch (error) {
    return null;
  }
}

export async function setAuthCookie(session: UserSession) {
  const token = await signToken(session);
  const cookieStore = cookies();
  cookieStore.set(TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookie() {
  const cookieStore = cookies();
  cookieStore.delete(TOKEN_COOKIE_NAME);
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  try {
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        account: true,
      },
    });

    if (!user || user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}
