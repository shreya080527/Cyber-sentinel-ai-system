'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PhoneCall, AlertTriangle, ShieldCheck, Info, Sparkles, Send, CheckCircle2, History } from 'lucide-react';
import { AnalysisResult } from '@/types';

export default function SeniorPhoneCheckPage() {
  const [callerNumber, setCallerNumber] = useState('');
  const [callerName, setCallerName] = useState('');
  const [transcript, setTranscript] = useState('');
  const [callContext, setCallContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [alertSuccess, setAlertSuccess] = useState('');
  const [checkId, setCheckId] = useState<string | null>(null);

  const sampleScams = [
    {
      label: 'IRS Arrest Scam',
      number: '+1 (800) 477-0199',
      name: 'IRS Criminal Investigation Officer',
      text: 'You have a federal warrant for unpaid back taxes. A local sheriff is dispatched to your house to arrest you within 1 hour unless you immediately purchase $1000 in Target gift cards and read the redemption codes to me on the phone. Do not hang up.',
    },
    {
      label: 'Grandchild Bail Scam',
      number: '+1 (555) 018-9921',
      name: 'Public Defender / Grandson',
      text: 'Grandpa, I got into a bad car accident and the police put me in county jail. My public defender is on the other line and says I need $2,500 wire transfer or cash bail immediately. Please don\'t tell mom and dad, I am really scared.',
    },
    {
      label: 'Microsoft Tech Support Trap',
      number: '+1 (888) 234-5678',
      name: 'Windows Tech Support Center',
      text: 'Warning! Your Windows computer has been infected with 14 trojan viruses and your banking credentials are being stolen right now. Go to your PC, download AnyDesk or TeamViewer, and grant me remote access so I can purge your computer.',
    },
  ];

  const applySample = (sample: typeof sampleScams[0]) => {
    setCallerNumber(sample.number);
    setCallerName(sample.name);
    setTranscript(sample.text);
    setError('');
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAlertSuccess('');

    if (!callerNumber.trim() && !transcript.trim()) {
      setError('Please provide either a caller number or conversation details.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/phone-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber,
          callerName,
          transcript,
          callContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to analyze phone call.');
        setLoading(false);
        return;
      }

      setResult(data);
      setCheckId(data.checkId);
    } catch (err) {
      setError('Connection failure while reaching phone threat engine.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendAlert = async () => {
    try {
      const res = await fetch('/api/senior/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to dispatch family alert.');
        return;
      }
      setAlertSuccess(data.message);
    } catch (err) {
      setError('Connection failure sending alert.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <PhoneCall className="w-4 h-4" /> Phone Scam Analysis Tool
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Suspicious Phone Call Verifier</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Check any call you received for elder financial fraud red flags and urgent extortion patterns.
          </p>
        </div>
      </div>

      <Card
        title={
          <span className="flex items-center gap-2 text-amber-400 text-base font-bold">
            <Sparkles className="w-5 h-5" /> Enter Telephone Call Details
          </span>
        }
        subtitle="Type the telephone number and paste or summarize what the caller requested"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {alertSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{alertSuccess}</span>
          </div>
        )}

        {/* Quick Sample Presets */}
        <div className="mb-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
          <span className="font-semibold text-slate-300 block">Click a common scam pattern to test:</span>
          <div className="flex flex-wrap gap-2">
            {sampleScams.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applySample(s)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-medium transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Caller Phone Number</label>
              <input
                type="text"
                value={callerNumber}
                onChange={(e) => setCallerNumber(e.target.value)}
                placeholder="+1 (800) 000-0000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Caller Stated Identity / Company</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="e.g. Bank Manager, Sheriff Office"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Conversation Details / What Did They Tell You?</label>
            <textarea
              rows={5}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste or summarize the conversation here..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Analyzing Call for Scams...' : 'Evaluate Phone Scam Risk'}
          </button>
        </form>

        {result && (
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Scam Classification</span>
                <span className="text-base font-bold text-white">{result.threatType}</span>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block text-right">Confidence</span>
                  <span className="text-sm font-bold text-amber-400">{result.confidenceScore}%</span>
                </div>
                <Badge level={result.riskLevel} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" /> Explanation
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">{result.explanation}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Protective Action
                </h4>
                <p className="text-sm text-emerald-300 font-medium leading-relaxed">{result.recommendation}</p>
              </div>
            </div>

            {result.familyAlertRecommended && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs">
                  <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold text-rose-300 text-sm">Family Alert Available</span>
                    <p className="text-slate-300">Click below to send an immediate alert to your designated emergency contact(s).</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSendAlert}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg flex items-center gap-2 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Family Alert</span>
                </button>
              </div>
            )}

            {result.indicators && result.indicators.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">Detected Predatory Indicators</h4>
                <div className="grid grid-cols-1 gap-2">
                  {result.indicators.map((ind, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-start gap-2.5 text-xs"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200 text-sm">{ind.title}</span>
                        <p className="text-xs text-slate-400 mt-0.5">{ind.description}</p>
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
