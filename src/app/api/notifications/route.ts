import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdDate: 'desc' },
      take: 20,
    });

    const unreadCount = await db.notification.count({
      where: { userId: session.userId, read: false },
    });

    const formatted = notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      message: n.message,
      type: n.type,
      read: n.read,
      createdDate: n.createdDate.toISOString(),
    }));

    return NextResponse.json({ notifications: formatted, unreadCount });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Failed to retrieve notifications.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await db.notification.updateMany({
        where: { userId: session.userId, read: false },
        data: { read: true },
      });
      return NextResponse.json({ message: 'All notifications marked as read.' });
    }

    if (notificationId) {
      await db.notification.updateMany({
        where: { id: notificationId, userId: session.userId },
        data: { read: true },
      });
      return NextResponse.json({ message: 'Notification marked as read.' });
    }

    return NextResponse.json({ error: 'Invalid notification parameters.' }, { status: 400 });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: 'Failed to update notification.' }, { status: 500 });
  }
}
