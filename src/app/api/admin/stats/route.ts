import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'administrator') {
    return NextResponse.json({ error: 'Access denied. Administrator privileges required.' }, { status: 403 });
  }

  try {
    const [
      totalUsers,
      registeredUsers,
      studentUsers,
      seniorUsers,
      analysts,
      admins,
      totalUrlChecks,
      totalScamReports,
      totalPhoneChecks,
      totalIncidents,
      openIncidents,
      resolvedIncidents,
      totalAuditLogs,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: 'registered_user' } }),
      db.user.count({ where: { role: 'student_user' } }),
      db.user.count({ where: { role: 'senior_citizen' } }),
      db.user.count({ where: { role: 'cybersecurity_analyst' } }),
      db.user.count({ where: { role: 'administrator' } }),
      db.uRLCheck.count(),
      db.scamReport.count(),
      db.phoneCallCheck.count(),
      db.reportedIncident.count(),
      db.reportedIncident.count({ where: { status: { in: ['OPEN', 'UNDER_REVIEW', 'IN_PROGRESS'] } } }),
      db.reportedIncident.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
      db.auditLog.count(),
    ]);

    const totalScans = totalUrlChecks + totalScamReports + totalPhoneChecks;
    const resolutionRate = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 100;

    return NextResponse.json({
      users: {
        total: totalUsers,
        registered: registeredUsers,
        student: studentUsers,
        senior: seniorUsers,
        analyst: analysts,
        admin: admins,
      },
      scans: {
        total: totalScans,
        urlChecks: totalUrlChecks,
        scamReports: totalScamReports,
        phoneChecks: totalPhoneChecks,
      },
      incidents: {
        total: totalIncidents,
        open: openIncidents,
        resolved: resolvedIncidents,
        resolutionRate,
      },
      auditLogs: {
        total: totalAuditLogs,
      },
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    return NextResponse.json({ error: 'Failed to retrieve system statistics.' }, { status: 500 });
  }
}
