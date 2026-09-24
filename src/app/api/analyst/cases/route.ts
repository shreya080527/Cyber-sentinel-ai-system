import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'cybersecurity_analyst' && session.role !== 'administrator')) {
    return NextResponse.json({ error: 'Access denied. Analyst or administrator privileges required.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const myCases = searchParams.get('myCases') === 'true';

    const whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (priority && priority !== 'ALL') {
      whereClause.priority = priority;
    }
    if (myCases) {
      whereClause.analystId = session.userId;
    }

    const cases = await db.case.findMany({
      where: whereClause,
      orderBy: { updatedDate: 'desc' },
      include: {
        incident: {
          include: {
            reporter: { select: { id: true, name: true, email: true } },
          },
        },
        analyst: {
          select: { id: true, name: true, email: true },
        },
        caseNotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            analyst: { select: { id: true, name: true } },
          },
        },
      },
    });

    const formatted = cases.map((c) => ({
      id: c.id,
      incidentId: c.incidentId,
      incidentTitle: c.incident.title,
      incidentType: c.incident.incidentType,
      incidentDescription: c.incident.description,
      incidentEvidence: c.incident.evidence,
      incidentRiskLevel: c.incident.riskLevel,
      reporterName: c.incident.reporter.name,
      reporterEmail: c.incident.reporter.email,
      analystId: c.analystId,
      analystName: c.analyst?.name || 'Unassigned',
      title: c.title,
      status: c.status,
      priority: c.priority,
      notes: c.notes,
      resolution: c.incident.resolution,
      createdDate: c.createdDate.toISOString(),
      updatedDate: c.updatedDate.toISOString(),
      caseNotes: c.caseNotes.map((n) => ({
        id: n.id,
        analystId: n.analystId,
        analystName: n.analyst.name,
        note: n.note,
        createdAt: n.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ cases: formatted });
  } catch (error) {
    console.error('Fetch cases error:', error);
    return NextResponse.json({ error: 'Failed to retrieve investigation cases.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'cybersecurity_analyst' && session.role !== 'administrator')) {
    return NextResponse.json({ error: 'Access denied. Analyst or administrator privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { caseId, status, priority, analystId, resolution, assignToMe } = body;

    if (!caseId) {
      return NextResponse.json({ error: 'Case ID is required.' }, { status: 400 });
    }

    const targetCase = await db.case.findUnique({
      where: { id: caseId },
      include: { incident: true },
    });

    if (!targetCase) {
      return NextResponse.json({ error: 'Case not found.' }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignToMe) updateData.analystId = session.userId;
    else if (analystId !== undefined) updateData.analystId = analystId || null;

    const updatedCase = await db.case.update({
      where: { id: caseId },
      data: updateData,
    });

    // Also keep incident status & resolution in sync
    const incidentUpdate: any = {};
    if (status) incidentUpdate.status = status;
    if (priority) incidentUpdate.priority = priority;
    if (resolution !== undefined) incidentUpdate.resolution = resolution;
    if (updateData.analystId !== undefined) incidentUpdate.assignedToId = updateData.analystId;

    if (Object.keys(incidentUpdate).length > 0) {
      await db.reportedIncident.update({
        where: { id: targetCase.incidentId },
        data: incidentUpdate,
      });
    }

    // Notify the reporter if status changed
    if (status && status !== targetCase.status) {
      await db.notification.create({
        data: {
          userId: targetCase.incident.userId,
          message: `Case #${caseId.slice(0, 8)} ("${targetCase.incident.title}") status updated to: ${status.replace('_', ' ')}.`,
          type: 'CASE_UPDATE',
        },
      });
    }

    // Record audit log
    await db.auditLog.create({
      data: {
        userId: session.userId,
        role: session.role,
        action: 'CASE_UPDATED',
        details: `Case #${caseId.slice(0, 8)} updated by ${session.name}. Status: ${status || targetCase.status}, Priority: ${priority || targetCase.priority}.`,
      },
    });

    return NextResponse.json({
      message: 'Case updated successfully.',
      case: updatedCase,
    });
  } catch (error) {
    console.error('Update case error:', error);
    return NextResponse.json({ error: 'Failed to update case.' }, { status: 500 });
  }
}
