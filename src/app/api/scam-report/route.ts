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
    const reports = await db.scamReport.findMany({
      where: { userId: session.userId },
      orderBy: { createdDate: 'desc' },
      take: 50,
      include: {
        riskAssessments: true,
      },
    });

    const formatted = reports.map((r) => ({
      reportId: r.id,
      reportType: r.reportType,
      companyName: r.companyName,
      jobTitle: r.jobTitle,
      jobDescription: r.jobDescription,
      recruiterName: r.recruiterName,
      recruiterEmail: r.recruiterEmail,
      contactNumber: r.contactNumber,
      recruitmentMessage: r.recruitmentMessage,
      salaryOffer: r.salaryOffer,
      websiteUrl: r.websiteUrl,
      additionalDetails: r.additionalDetails,
      riskLevel: r.riskLevel,
      confidenceScore: r.confidenceScore,
      scamIndicators: JSON.parse(r.scamIndicators || '[]'),
      explanation: r.explanation,
      recommendation: r.recommendation,
      createdDate: r.createdDate.toISOString(),
    }));

    return NextResponse.json({ reports: formatted });
  } catch (error) {
    console.error('Fetch scam reports error:', error);
    return NextResponse.json({ error: 'Something went wrong while fetching scam reports.' }, { status: 500 });
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
      reportType = 'JOB_SCAM',
      companyName,
      jobTitle,
      jobDescription,
      recruiterName,
      recruiterEmail,
      contactNumber,
      recruitmentMessage,
      salaryOffer,
      websiteUrl,
      additionalDetails,
    } = body;

    let analysis;
    if (reportType === 'RECRUITMENT_MESSAGE') {
      analysis = await AIThreatAnalysisService.analyzeRecruitmentMessage(recruitmentMessage || jobDescription || '');
    } else {
      analysis = await AIThreatAnalysisService.analyzeJobScam({
        companyName,
        jobTitle,
        jobDescription,
        recruiterName,
        recruiterEmail,
        contactNumber,
        recruitmentMessage,
        salaryOffer,
        websiteUrl,
        additionalDetails,
      });
    }

    // Save ScamReport entity
    const reportRecord = await db.scamReport.create({
      data: {
        userId: session.userId,
        reportType,
        companyName: companyName ? companyName.trim() : null,
        jobTitle: jobTitle ? jobTitle.trim() : null,
        jobDescription: jobDescription ? jobDescription.trim() : null,
        recruiterName: recruiterName ? recruiterName.trim() : null,
        recruiterEmail: recruiterEmail ? recruiterEmail.trim() : null,
        contactNumber: contactNumber ? contactNumber.trim() : null,
        recruitmentMessage: recruitmentMessage ? recruitmentMessage.trim() : null,
        salaryOffer: salaryOffer ? salaryOffer.trim() : null,
        websiteUrl: websiteUrl ? websiteUrl.trim() : null,
        additionalDetails: additionalDetails ? additionalDetails.trim() : null,
        riskLevel: analysis.riskLevel,
        confidenceScore: analysis.confidenceScore,
        scamIndicators: JSON.stringify(analysis.indicators),
        explanation: analysis.explanation,
        recommendation: analysis.recommendation,
      },
    });

    // Save associated RiskAssessment entity
    await db.riskAssessment.create({
      data: {
        scamReportId: reportRecord.id,
        riskLevel: analysis.riskLevel,
        confidenceScore: analysis.confidenceScore,
        threatType: analysis.threatType,
        indicators: JSON.stringify(analysis.indicators),
        explanation: analysis.explanation,
        recommendation: analysis.recommendation,
      },
    });

    // Notify user
    const typeLabel = reportType === 'RECRUITMENT_MESSAGE' ? 'Recruitment Message' : 'Fake Job Scam';
    await db.notification.create({
      data: {
        userId: session.userId,
        message: `${typeLabel} Analysis Complete. Risk Rating: ${analysis.riskLevel} (${analysis.confidenceScore}% confidence)`,
        type: analysis.riskLevel === 'HIGH' || analysis.riskLevel === 'CRITICAL' ? 'HIGH_RISK_DETECTED' : 'ANALYSIS_COMPLETE',
      },
    });

    return NextResponse.json({
      reportId: reportRecord.id,
      reportType: reportRecord.reportType,
      createdDate: reportRecord.createdDate.toISOString(),
      ...analysis,
    });
  } catch (error: any) {
    console.error('Scam Report Error:', error);
    const userMessage = error?.message || 'Incomplete job details or analysis error. Please check your submission.';
    return NextResponse.json({ error: userMessage }, { status: 400 });
  }
}
