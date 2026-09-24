import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'cybersecurity_analyst' && session.role !== 'administrator')) {
    return NextResponse.json({ error: 'Access denied. Analyst or administrator privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { caseId, incidentId, note } = body;

    if (!note || note.trim().length < 3) {
      return NextResponse.json({ error: 'Please enter a valid investigation note.' }, { status: 400 });
    }

    if (!caseId && !incidentId) {
      return NextResponse.json({ error: 'Case ID or Incident ID required.' }, { status: 400 });
    }

    const createdNote = await db.investigationNote.create({
      data: {
        caseId: caseId || null,
        incidentId: incidentId || null,
        analystId: session.userId,
        note: note.trim(),
      },
      include: {
        analyst: { select: { id: true, name: true, email: true } },
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.userId,
        role: session.role,
        action: 'INVESTIGATION_NOTE_ADDED',
        details: `Note added to Case #${caseId?.slice(0, 8) || 'N/A'}: "${note.slice(0, 50)}..."`,
      },
    });

    return NextResponse.json({
      message: 'Investigation note added.',
      note: {
        id: createdNote.id,
        caseId: createdNote.caseId,
        incidentId: createdNote.incidentId,
        analystId: createdNote.analystId,
        analystName: createdNote.analyst.name,
        note: createdNote.note,
        createdAt: createdNote.createdAt.toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Add investigation note error:', error);
    return NextResponse.json({ error: 'Failed to add investigation note.' }, { status: 500 });
  }
}
