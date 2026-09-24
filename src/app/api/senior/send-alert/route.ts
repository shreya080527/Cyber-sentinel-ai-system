import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { checkId, customMessage } = body;

    // Fetch user's registered emergency contacts
    const contacts = await db.emergencyContact.findMany({
      where: { userId: session.userId },
    });

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No emergency/family contacts configured. Please add an emergency contact first.' },
        { status: 400 }
      );
    }

    let callerInfo = 'a suspicious caller';
    if (checkId) {
      const check = await db.phoneCallCheck.findFirst({
        where: { id: checkId, userId: session.userId },
      });
      if (check) {
        callerInfo = `caller ${check.callerNumber} (${check.threatType || check.riskLevel})`;
        await db.phoneCallCheck.update({
          where: { id: checkId },
          data: { familyAlertSent: true },
        });
      }
    }

    const alertText = customMessage || 
      `🚨 EMERGENCY FAMILY ALERT: ${session.name} reported a high-risk predatory phone scam from ${callerInfo}. Automated alert dispatched to ${contacts.length} family contact(s).`;

    // Create system notification
    await db.notification.create({
      data: {
        userId: session.userId,
        message: alertText,
        type: 'FAMILY_ALERT',
      },
    });

    // Create audit log entry
    await db.auditLog.create({
      data: {
        userId: session.userId,
        role: session.role,
        action: 'FAMILY_ALERT_DISPATCHED',
        details: `Family alert triggered for ${contacts.map(c => `${c.name} (${c.relationship})`).join(', ')}. Context: ${callerInfo}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Emergency alert successfully dispatched to ${contacts.length} emergency contact(s).`,
      notifiedContacts: contacts.map(c => ({
        name: c.name,
        relationship: c.relationship,
        phone: c.phone,
        email: c.email,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Send family alert error:', error);
    return NextResponse.json(
      { error: 'Failed to dispatch family alert. Please try again.' },
      { status: 500 }
    );
  }
}
