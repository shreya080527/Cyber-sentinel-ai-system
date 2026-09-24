import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { AIThreatAnalysisService } from '@/lib/services/aiThreatAnalysisService';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const checks = await db.phoneCallCheck.findMany({
      where: { userId: session.userId },
      orderBy: { createdDate: 'desc' },
      take: 50,
      include: {
        riskAssessments: true,
      },
    });

    const formatted = checks.map((c) => ({
      checkId: c.id,
      callerNumber: c.callerNumber,
      callerName: c.callerName,
      transcript: c.transcript,
      riskLevel: c.riskLevel,
      confidenceScore: c.confidenceScore,
      threatType: c.threatType,
      indicators: JSON.parse(c.indicators || '[]'),
      explanation: c.explanation,
      recommendation: c.recommendation,
      familyAlertSent: c.familyAlertSent,
      createdDate: c.createdDate.toISOString(),
    }));

    return NextResponse.json({ checks: formatted });
  } catch (error) {
    console.error('Fetch phone checks error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while fetching phone check history.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { callerNumber, callerName, transcript, callDuration, callContext } = body;

    // AI Phone Call Scam Analysis
    const analysis = await AIThreatAnalysisService.analyzePhoneCall({
      callerNumber,
      callerName,
      transcript,
      callDuration,
      callContext,
    });

    // Save PhoneCallCheck entity
    const checkRecord = await db.phoneCallCheck.create({
      data: {
        userId: session.userId,
        callerNumber: (callerNumber || 'Unknown Caller').trim(),
        callerName: callerName ? callerName.trim() : null,
        transcript: transcript ? transcript.trim() : null,
        riskLevel: analysis.riskLevel,
        confidenceScore: analysis.confidenceScore,
        threatType: analysis.threatType,
        indicators: JSON.stringify(analysis.indicators),
        explanation: analysis.explanation,
        recommendation: analysis.recommendation,
        familyAlertSent: false,
      },
    });

    // Save associated RiskAssessment entity
    await db.riskAssessment.create({
      data: {
        phoneCallCheckId: checkRecord.id,
        riskLevel: analysis.riskLevel,
        confidenceScore: analysis.confidenceScore,
        threatType: analysis.threatType,
        indicators: JSON.stringify(analysis.indicators),
        explanation: analysis.explanation,
        recommendation: analysis.recommendation,
      },
    });

    // Create system notification
    const isCritical = analysis.riskLevel === 'HIGH' || analysis.riskLevel === 'CRITICAL';
    await db.notification.create({
      data: {
        userId: session.userId,
        message: isCritical
          ? `⚠️ URGENT: Predatory scam call detected from "${callerNumber || 'Unknown'}". Threat: ${analysis.threatType}. Consider alerting your family contact.`
          : `Phone call check completed for "${callerNumber || 'Unknown'}". Risk Rating: ${analysis.riskLevel}.`,
        type: isCritical ? 'HIGH_RISK_DETECTED' : 'ANALYSIS_COMPLETE',
      },
    });

    return NextResponse.json({
      checkId: checkRecord.id,
      callerNumber: checkRecord.callerNumber,
      callerName: checkRecord.callerName,
      transcript: checkRecord.transcript,
      createdDate: checkRecord.createdDate.toISOString(),
      ...analysis,
    });
  } catch (error: any) {
    console.error('Phone Check Error:', error);
    const userMessage = error?.message || 'Phone analysis service is temporarily unavailable.';
    return NextResponse.json({ error: userMessage }, { status: 400 });
  }
}
