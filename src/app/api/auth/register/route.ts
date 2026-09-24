import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, setAuthCookie } from '@/lib/auth';
import { UserRole } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password, role } = body;

    // Server-side validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please enter a valid name (at least 2 characters).' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Role validation
    const allowedRoles: UserRole[] = [
      'registered_user',
      'student_user',
      'senior_citizen',
      'cybersecurity_analyst',
      'administrator',
    ];
    const userRole: UserRole = allowedRoles.includes(role) ? role : 'registered_user';

    // Check existing email
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please login instead.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user and associated profile account
    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: userRole,
        status: 'ACTIVE',
        account: {
          create: {},
        },
      },
    });

    const roleName = userRole.replace('_', ' ').toUpperCase();

    // Create welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        message: `Welcome to Cyber Sentinel AI System! Your ${roleName} account is active.`,
        type: 'SECURITY_ALERT',
      },
    });

    // Record audit log
    try {
      await db.auditLog.create({
        data: {
          userId: user.id,
          role: userRole,
          action: 'USER_REGISTERED',
          details: `New account created: ${user.email} with role ${userRole}.`,
        },
      });
    } catch (auditErr) {
      console.warn('Audit log write skipped:', auditErr);
    }

    const sessionPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role as UserRole,
      status: 'ACTIVE' as const,
    };

    await setAuthCookie(sessionPayload);

    return NextResponse.json(
      {
        message: 'Registration successful.',
        user: sessionPayload,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while processing your registration. Please try again.' },
      { status: 500 }
    );
  }
}
