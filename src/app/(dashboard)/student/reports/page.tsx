'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FileCheck2, Search, ExternalLink, ShieldAlert, AlertTriangle, X, Briefcase, MessageSquareWarning } from 'lucide-react';
import { RiskLevel } from '@/types';

interface StudentReportItem {
  reportId: string;
  reportType: string;
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  contactNumber?: string;
  recruitmentMessage?: string;
  salaryOffer?: string;
  websiteUrl?: string;
  additionalDetails?: string;
  riskLevel: RiskLevel;
  confidenceScore: number;
  scamIndicators: any[];
  explanation: string;
  recommendation: string;
  createdDate: string;
}

export default function StudentReportsPage() {
  const [reports, setReports] = useState<StudentReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState<StudentReportItem | null>(null);

  useEffect(() => {
    fetch('/api/scam-report')
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch reports error:', err);
        setLoading(false);
      });
  }, []);

  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    return (
      (r.companyName && r.companyName.toLowerCase().includes(q)) ||
      (r.jobTitle && r.jobTitle.toLowerCase().includes(q)) ||
      (r.recruiterEmail && r.recruiterEmail.toLowerCase().includes(q)) ||
      (r.explanation && r.explanation.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-emerald-400" /> Student Scam Reports & History
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review saved scam evaluations, red flag breakdowns, and safety advisories</p>
        </div>
      </div>

      <Card className="bg-slate-900/60">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, job title, or email..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading student reports...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No matching scam reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Entity / Details</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Risk Level</th>
                  <th className="pb-3 px-3 text-right">Confidence</th>
                  <th className="pb-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((item) => (
                  <tr key={item.reportId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3">
                      {item.reportType === 'RECRUITMENT_MESSAGE' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                          <MessageSquareWarning className="w-3.5 h-3.5" /> Message
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <Briefcase className="w-3.5 h-3.5" /> Job Offer
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 max-w-xs truncate font-medium text-slate-200">
                      {item.companyName ? `${item.companyName} - ${item.jobTitle || 'Listing'}` : item.jobTitle || item.recruitmentMessage?.slice(0, 40) || 'Recruitment Text'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                      {new Date(item.createdDate).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <Badge level={item.riskLevel} showIcon={false} />
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-200">{item.confidenceScore}%</td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedReport(item)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors flex items-center gap-1 mx-auto"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" /> View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Inspect Scam Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase">OFFICIAL SCAM REPORT</span>
                <h3 className="text-base font-bold text-white">
                  {selectedReport.companyName || 'Recruitment Offer Analysis'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Assessed Risk Level</span>
                <Badge level={selectedReport.riskLevel} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block uppercase text-right">Confidence Score</span>
                <span className="text-sm font-bold text-emerald-400">{selectedReport.confidenceScore}%</span>
              </div>
            </div>

            {/* Submitted Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div><span className="text-slate-500">Recruiter Email:</span> <span className="text-slate-300 font-mono">{selectedReport.recruiterEmail || 'N/A'}</span></div>
              <div><span className="text-slate-500">Salary Offer:</span> <span className="text-slate-300">{selectedReport.salaryOffer || 'N/A'}</span></div>
              <div><span className="text-slate-500">Website URL:</span> <span className="text-slate-300 font-mono">{selectedReport.websiteUrl || 'N/A'}</span></div>
              <div><span className="text-slate-500">Contact Number:</span> <span className="text-slate-300">{selectedReport.contactNumber || 'N/A'}</span></div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-300">Detailed Explanation:</span>
              <p className="text-slate-400 leading-relaxed">{selectedReport.explanation}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-emerald-400">Protective Recommendation:</span>
              <p className="text-slate-400 leading-relaxed">{selectedReport.recommendation}</p>
            </div>

            {selectedReport.scamIndicators && selectedReport.scamIndicators.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Detected Red Flag Indicators:</span>
                {selectedReport.scamIndicators.map((ind: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-200">{ind.title}</div>
                      <div className="text-[11px] text-slate-400">{ind.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
