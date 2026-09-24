'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Briefcase, Building, Mail, Phone, DollarSign, Globe, FileText, AlertTriangle, ShieldCheck, Info, Sparkles, CheckCircle2 } from 'lucide-react';
import { AnalysisResult } from '@/types';

export default function FakeJobDetectorPage() {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [salaryOffer, setSalaryOffer] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Flexible validation: check at least some details are provided
    if (!companyName && !jobTitle && !jobDescription && !recruiterEmail && !salaryOffer && !additionalDetails) {
      setError('Please fill in at least a few recruitment details (e.g. company name, recruiter email, or offer description).');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/scam-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'JOB_SCAM',
          companyName,
          jobTitle,
          jobDescription,
          recruiterName,
          recruiterEmail,
          contactNumber,
          salaryOffer,
          websiteUrl,
          additionalDetails,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Scam analysis service error. Please check your submission.');
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Connection error while communicating with AI Threat Analysis Service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" /> AI Scam Intelligence
          </div>
          <h1 className="text-2xl font-extrabold text-white">Fake Job & Internship Scam Detector</h1>
          <p className="text-xs text-slate-400 mt-1">
            Paste details from job offers, recruiter emails, or internships to detect scam indicators.
          </p>
        </div>
      </div>

      <Card
        title={
          <span className="flex items-center gap-2 text-emerald-400">
            <Sparkles className="w-5 h-5" /> Submit Recruitment Information
          </span>
        }
        subtitle="Provide available details. Not all fields are mandatory."
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Corp Inc."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job Title</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Remote Data Entry / Software Intern"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Recruiter Name</label>
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Recruiter Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={recruiterEmail}
                  onChange={(e) => setRecruiterEmail(e.target.value)}
                  placeholder="e.g. sarah.careers@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+1-555-0192 / WhatsApp"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Salary / Compensation Offer</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={salaryOffer}
                  onChange={(e) => setSalaryOffer(e.target.value)}
                  placeholder="e.g. $80/hr or $5,000/month no experience"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Company Website / Link</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://company-jobs-apply.xyz"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Job Description & Communication Details</label>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste email text, job description, payment requirements (e.g. equipment deposit, wire transfer), or Telegram interview details..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Executing AI Scam Intelligence Analysis...' : 'Analyze Job Offer for Scams'}
          </button>
        </form>

        {/* Render Results Card */}
        {result && (
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Scam Classification</span>
                <span className="text-sm font-bold text-slate-200">{result.threatType}</span>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block text-right">Confidence</span>
                  <span className="text-sm font-bold text-emerald-400">{result.confidenceScore}%</span>
                </div>
                <Badge level={result.riskLevel} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" /> Explanation
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{result.explanation}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Student Recommendation
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{result.recommendation}</p>
              </div>
            </div>

            {/* Red Flags / Indicators List */}
            {result.indicators && result.indicators.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">Detected Red Flag Indicators</h4>
                <div className="grid grid-cols-1 gap-2">
                  {result.indicators.map((ind, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-start gap-2 text-xs"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200">{ind.title}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{ind.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
