import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'administrator') {
    return NextResponse.json({ error: 'Access denied. Administrator privileges required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const search = searchParams.get('search');

    const whereClause: any = {};
    if (action && action !== 'ALL') {
      whereClause.action = action;
    }
    if (search) {
      whereClause.OR = [
        { details: { contains: search } },
        { action: { contains: search } },
      ];
    }

    const logs = await db.auditLog.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const formatted = logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      userName: l.user?.name || 'System',
      role: l.role || 'system',
      action: l.action,
      details: l.details,
      ipAddress: l.ipAddress,
      timestamp: l.timestamp.toISOString(),
    }));

    return NextResponse.json({ logs: formatted });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit logs.' }, { status: 500 });
  }
}
