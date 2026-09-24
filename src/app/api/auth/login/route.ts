import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, setAuthCookie } from '@/lib/auth';
import { UserRole } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please enter both email and password.' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (user.status === 'INACTIVE' || user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact an administrator.' },
        { status: 403 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as UserRole,
    };

    await setAuthCookie(sessionPayload);

    // Record audit log for login
    try {
      await db.auditLog.create({
        data: {
          userId: user.id,
          role: user.role,
          action: 'USER_LOGIN',
          details: `User ${user.email} (${user.role}) logged in successfully.`,
        },
      });
    } catch (auditErr) {
      console.warn('Audit log write skipped:', auditErr);
    }

    return NextResponse.json({
      message: 'Login successful.',
      user: sessionPayload,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong during authentication. Please try again.' },
      { status: 500 }
    );
  }
}
