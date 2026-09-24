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
    const checks = await db.uRLCheck.findMany({
      where: { userId: session.userId },
      orderBy: { checkedDate: 'desc' },
      take: 50,
      include: {
        riskAssessments: true,
      },
    });

    const formatted = checks.map((c) => ({
      checkId: c.id,
      url: c.url,
      checkedDate: c.checkedDate.toISOString(),
      riskLevel: c.riskLevel,
      confidenceScore: c.confidenceScore,
      threatType: c.threatType,
      indicators: JSON.parse(c.indicators || '[]'),
      explanation: c.explanation,
      recommendation: c.recommendation,
    }));

    return NextResponse.json({ checks: formatted });
  } catch (error) {
    console.error('Fetch URL checks error:', error);
    return NextResponse.json({ error: 'Something went wrong while fetching URL check history.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized access.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Please enter a valid website URL.' }, { status: 400 });
    }

    // Run AI Threat Analysis Service
    const analysis = await AIThreatAnalysisService.analyzeUrl(url);

    // Save URLCheck entity
    const checkRecord = await db.uRLCheck.create({
      data: {
        userId: session.userId,
        url: url.trim(),
        riskLevel: analysis.riskLevel,
        confidenceScore: analysis.confidenceScore,
        threatType: analysis.threatType,
        indicators: JSON.stringify(analysis.indicators),
        explanation: analysis.explanation,
        recommendation: analysis.recommendation,
      },
    });

    // Save associated RiskAssessment entity
    await db.riskAssessment.create({
      data: {
        urlCheckId: checkRecord.id,
        riskLevel: analysis.riskLevel,
        confidenceScore: analysis.confidenceScore,
        threatType: analysis.threatType,
        indicators: JSON.stringify(analysis.indicators),
        explanation: analysis.explanation,
        recommendation: analysis.recommendation,
      },
    });

    // Send Notification if High or Critical Risk
    if (analysis.riskLevel === 'HIGH' || analysis.riskLevel === 'CRITICAL') {
      await db.notification.create({
        data: {
          userId: session.userId,
          message: `High-risk URL detected: "${url.trim()}". Threat Type: ${analysis.threatType}`,
          type: 'HIGH_RISK_DETECTED',
        },
      });
    } else {
      await db.notification.create({
        data: {
          userId: session.userId,
          message: `URL security analysis completed for "${url.trim()}". Result: ${analysis.riskLevel}`,
          type: 'ANALYSIS_COMPLETE',
        },
      });
    }

    return NextResponse.json({
      checkId: checkRecord.id,
      url: checkRecord.url,
      checkedDate: checkRecord.checkedDate.toISOString(),
      ...analysis,
    });
  } catch (error: any) {
    console.error('URL Check Error:', error);
    const userMessage = error?.message || 'Analysis service is temporarily unavailable. Please try again later.';
    return NextResponse.json({ error: userMessage }, { status: 400 });
  }
}
