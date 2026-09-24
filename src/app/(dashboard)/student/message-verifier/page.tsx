'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MessageSquareWarning, Search, AlertTriangle, ShieldCheck, Info, Sparkles, Send } from 'lucide-react';
import { AnalysisResult } from '@/types';

export default function MessageVerifierPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!message || message.trim().length < 5) {
      setError('Please paste a recruitment message (at least 5 characters long).');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/scam-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'RECRUITMENT_MESSAGE',
          recruitmentMessage: message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Message verification failed. Please try again.');
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Connection failure while reaching verification engine.');
    } finally {
      setLoading(false);
    }
  };

  const sampleMessages = [
    'Congratulations! You have been selected for a Remote Data Analyst job paying $120/hr. No interview needed. Contact Sarah on Telegram t.me/recruiter_sarah and send $150 equipment deposit.',
    'Dear Student, We saw your profile on LinkedIn. Our company is hiring interns for $45/hr. Visit https://careers-verify-job.xyz to confirm your spot today!',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <MessageSquareWarning className="w-4 h-4" /> Message Verification Tool
          </div>
          <h1 className="text-2xl font-extrabold text-white">Recruitment Message Verifier</h1>
          <p className="text-xs text-slate-400 mt-1">
            Verify unsolicited WhatsApp, Telegram, SMS, or LinkedIn recruitment text messages for scam patterns.
          </p>
        </div>
      </div>

      <Card
        title={
          <span className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-5 h-5" /> Paste Recruitment Message
          </span>
        }
        subtitle="Paste the exact text of any suspicious job notification or offer text"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste message text here (e.g. 'You have been selected for a remote job...')"
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Try sample:</span>
              <button
                type="button"
                onClick={() => setMessage(sampleMessages[0])}
                className="text-cyan-400 hover:underline"
              >
                Sample Scam 1
              </button>
              <span>|</span>
              <button
                type="button"
                onClick={() => setMessage(sampleMessages[1])}
                className="text-cyan-400 hover:underline"
              >
                Sample Scam 2
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Verifying Text...' : 'Verify Recruitment Message'}
              {!loading && <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Threat Type</span>
                <span className="text-sm font-bold text-slate-200">{result.threatType}</span>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block text-right">Confidence</span>
                  <span className="text-sm font-bold text-cyan-400">{result.confidenceScore}%</span>
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
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Recommendation
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{result.recommendation}</p>
              </div>
            </div>

            {result.indicators && result.indicators.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">Detected Wording & Scam Indicators</h4>
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
