'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Briefcase, MessageSquareWarning, FileCheck2, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { RiskLevel } from '@/types';

interface StudentScamReportItem {
  reportId: string;
  reportType: string;
  companyName?: string;
  jobTitle?: string;
  riskLevel: RiskLevel;
  confidenceScore: number;
  explanation: string;
  recommendation: string;
  createdDate: string;
}

export default function StudentDashboardPage() {
  const [reports, setReports] = useState<StudentScamReportItem[]>([]);
  const [stats, setStats] = useState({ total: 0, highRisk: 0, clean: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/scam-report')
      .then((res) => res.json())
      .then((data) => {
        const reps: StudentScamReportItem[] = data.reports || [];
        setReports(reps);

        const total = reps.length;
        const highRisk = reps.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length;
        const clean = reps.filter((r) => r.riskLevel === 'SAFE' || r.riskLevel === 'LOW').length;
        setStats({ total, highRisk, clean });
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch student reports error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" /> Student Cyber Safety Hub
          </div>
          <h1 className="text-2xl font-extrabold text-white">Career Scam & Offer Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Detect fake job listings, verify recruiter emails/messages, and protect yourself against recruitment fraud.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Offers & Messages Analyzed</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Fraudulent Scams Caught</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">{stats.highRisk}</h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Verified Legitimate Offers</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats.clean}</h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Launch Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/70 border-emerald-500/20 hover:border-emerald-500/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Fake Job & Internship Scam Detector</h3>
              <p className="text-xs text-slate-400">Scan full job postings, salary offers & recruiter details</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Evaluates job listings for fee demands, fake corporate domains, Telegram-only interviews, and unrealistic compensation promises.
          </p>
          <Link
            href="/student/job-detector"
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            Launch Fake Job Detector <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>

        <Card className="bg-slate-900/70 border-cyan-500/20 hover:border-cyan-500/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Recruitment Message Verifier</h3>
              <p className="text-xs text-slate-400">Paste SMS, WhatsApp, Telegram, or LinkedIn DMs</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Instantly analyzes unsolicited recruitment texts for phishing keywords, payment traps, and social engineering patterns.
          </p>
          <Link
            href="/student/message-verifier"
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            Verify Message Now <ArrowRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>

      {/* Recent Scam Reports */}
      <Card
        title={
          <span className="flex items-center gap-2 text-slate-200">
            <FileCheck2 className="w-4 h-4 text-emerald-400" /> Recent Student Scam Reports
          </span>
        }
      >
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-500">Loading student reports...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No scam reports generated yet. Use the Job Detector or Message Verifier above to analyze suspicious offers.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.slice(0, 5).map((r) => (
              <div
                key={r.reportId}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <span className="text-[10px] text-emerald-400 font-mono block">
                    {r.reportType === 'RECRUITMENT_MESSAGE' ? 'Message Analysis' : 'Job Scam Analysis'}
                  </span>
                  <span className="font-semibold text-slate-200">
                    {r.companyName || r.jobTitle || 'Recruitment Submission'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {new Date(r.createdDate).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge level={r.riskLevel} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
