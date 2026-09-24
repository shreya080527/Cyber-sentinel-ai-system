import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { IncidentPriority, IncidentStatus, RiskLevel } from '@/types';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const isStaff = session.role === 'cybersecurity_analyst' || session.role === 'administrator';

    const whereClause: any = {};
    if (!isStaff) {
      // Normal users can only view their own reported incidents
      whereClause.userId = session.userId;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }
    if (priority && priority !== 'ALL') {
      whereClause.priority = priority;
    }
    if (type && type !== 'ALL') {
      whereClause.incidentType = type;
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const incidents = await db.reportedIncident.findMany({
      where: whereClause,
      orderBy: { createdDate: 'desc' },
      take: 100,
      include: {
        reporter: {
          select: { id: true, name: true, email: true, role: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        cases: {
          select: { id: true, status: true, priority: true, analystId: true },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            analyst: { select: { id: true, name: true } },
          },
        },
      },
    });

    const formatted = incidents.map((inc) => ({
      id: inc.id,
      userId: inc.userId,
      reporterName: inc.reporter.name,
      reporterEmail: inc.reporter.email,
      title: inc.title,
      description: inc.description,
      incidentType: inc.incidentType,
      evidence: inc.evidence,
      riskLevel: inc.riskLevel as RiskLevel,
      status: inc.status as IncidentStatus,
      priority: inc.priority as IncidentPriority,
      assignedToId: inc.assignedToId,
      assignedToName: inc.assignedTo?.name || null,
      resolution: inc.resolution,
      createdDate: inc.createdDate.toISOString(),
      updatedDate: inc.updatedDate.toISOString(),
      cases: inc.cases.map((c) => ({
        id: c.id,
        incidentId: inc.id,
        status: c.status as IncidentStatus,
        priority: c.priority as IncidentPriority,
        analystId: c.analystId,
      })),
      notes: inc.notes.map((n) => ({
        id: n.id,
        analystId: n.analystId,
        analystName: n.analyst.name,
        note: n.note,
        createdAt: n.createdAt.toISOString(),
      })),
    }));

    return NextResponse.json({ incidents: formatted });
  } catch (error) {
    console.error('Fetch incidents error:', error);
    return NextResponse.json({ error: 'Failed to retrieve incidents.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      incidentType = 'OTHER',
      evidence,
      priority = 'MEDIUM',
      riskLevel = 'MEDIUM',
    } = body;

    if (!title || title.trim().length < 3) {
      return NextResponse.json({ error: 'Please provide an incident title (at least 3 characters).' }, { status: 400 });
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: 'Please provide a detailed incident description (at least 10 characters).' }, { status: 400 });
    }

    // Create incident
    const incident = await db.reportedIncident.create({
      data: {
        userId: session.userId,
        title: title.trim(),
        description: description.trim(),
        incidentType: incidentType.trim(),
        evidence: evidence ? evidence.trim() : null,
        riskLevel: riskLevel.trim(),
        priority: priority.trim(),
        status: 'OPEN',
      },
    });

    // Auto-create associated investigation Case
    const incidentCase = await db.case.create({
      data: {
        incidentId: incident.id,
        title: `Investigation: ${incident.title}`,
        status: 'OPEN',
        priority: incident.priority,
        notes: 'Case opened automatically upon incident submission.',
      },
    });

    // Create confirmation notification for reporter
    await db.notification.create({
      data: {
        userId: session.userId,
        message: `Your incident report "${incident.title}" has been filed (Case #${incidentCase.id.slice(0, 8)}). A cybersecurity analyst will review it.`,
        type: 'SECURITY_ALERT',
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.userId,
        role: session.role,
        action: 'INCIDENT_REPORTED',
        details: `Incident "${incident.title}" (Type: ${incident.incidentType}, Priority: ${incident.priority}) reported by ${session.email}.`,
      },
    });

    return NextResponse.json({
      message: 'Incident reported successfully.',
      incidentId: incident.id,
      caseId: incidentCase.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Create incident error:', error);
    return NextResponse.json({ error: 'Failed to submit incident report.' }, { status: 500 });
  }
}
