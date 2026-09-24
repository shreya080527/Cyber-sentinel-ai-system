import { NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole, UserStatus } from '@/types';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'administrator') {
    return NextResponse.json({ error: 'Access denied. Administrator privileges required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (role && role !== 'ALL') {
      whereClause.role = role;
    }
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await db.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            urlChecks: true,
            scamReports: true,
            phoneCallChecks: true,
            reportedIncidents: true,
            assignedCases: true,
          },
        },
      },
    });

    const formatted = users.map((u) => ({
      ...u,
      role: u.role as UserRole,
      status: u.status as UserStatus,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    return NextResponse.json({ users: formatted });
  } catch (error) {
    console.error('Fetch admin users error:', error);
    return NextResponse.json({ error: 'Failed to retrieve users.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'administrator') {
    return NextResponse.json({ error: 'Access denied. Administrator privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, email, phone, password, role = 'registered_user', status = 'ACTIVE' } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const existing = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await db.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: role.trim(),
        status: status.trim(),
        account: { create: {} },
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        role: session.role,
        action: 'ADMIN_USER_CREATED',
        details: `Administrator ${session.name} created user ${newUser.email} with role ${newUser.role}.`,
      },
    });

    return NextResponse.json({
      message: 'User created successfully.',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create admin user error:', error);
    return NextResponse.json({ error: 'Failed to create user.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'administrator') {
    return NextResponse.json({ error: 'Access denied. Administrator privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, name, phone, role, status, newPassword } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (role) updateData.role = role.trim();
    if (status) updateData.status = status.trim();
    if (newPassword && newPassword.length >= 6) {
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
    });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        role: session.role,
        action: 'ADMIN_USER_UPDATED',
        details: `Administrator ${session.name} modified user ${updatedUser.email}. Status: ${updatedUser.status}, Role: ${updatedUser.role}.`,
      },
    });

    return NextResponse.json({
      message: 'User updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update admin user error:', error);
    return NextResponse.json({ error: 'Failed to update user.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'administrator') {
    return NextResponse.json({ error: 'Access denied. Administrator privileges required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID required.' }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (id === session.userId) {
      return NextResponse.json({ error: 'You cannot delete your own administrative account.' }, { status: 400 });
    }

    const userToDelete = await db.user.findUnique({ where: { id } });
    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    await db.user.delete({ where: { id } });

    await db.auditLog.create({
      data: {
        userId: session.userId,
        role: session.role,
        action: 'ADMIN_USER_DELETED',
        details: `Administrator ${session.name} deleted user ${userToDelete.email} (${userToDelete.role}).`,
      },
    });

    return NextResponse.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Delete admin user error:', error);
    return NextResponse.json({ error: 'Failed to delete user.' }, { status: 500 });
  }
}
