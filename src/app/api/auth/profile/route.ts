import { NextResponse } from 'next/server';
import { getSession, hashPassword } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, bio, institution, department, newPassword } = body;

    const updateData: any = {};
    if (name && typeof name === 'string' && name.trim().length >= 2) {
      updateData.name = name.trim();
    }
    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }
    if (newPassword && typeof newPassword === 'string' && newPassword.length >= 6) {
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updatedUser = await db.user.update({
      where: { id: session.userId },
      data: {
        ...updateData,
        account: {
          upsert: {
            create: {
              bio: bio || null,
              institution: institution || null,
              department: department || null,
            },
            update: {
              bio: bio !== undefined ? bio : undefined,
              institution: institution !== undefined ? institution : undefined,
              department: department !== undefined ? department : undefined,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        account: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile details.' },
      { status: 500 }
    );
  }
}
