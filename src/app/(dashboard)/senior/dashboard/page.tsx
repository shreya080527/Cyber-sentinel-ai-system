'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  HeartHandshake,
  AlertTriangle,
  Send,
  PhoneForwarded,
  CheckCircle2,
  ExternalLink,
  Info,
  Sparkles,
} from 'lucide-react';
import { AnalysisResult, EmergencyContactItem, RiskLevel } from '@/types';

interface PhoneCheckItem {
  checkId: string;
  callerNumber: string;
  callerName?: string;
  transcript?: string;
  riskLevel: RiskLevel;
  confidenceScore: number;
  threatType: string;
  indicators: any[];
  explanation: string;
  recommendation: string;
  familyAlertSent: boolean;
  createdDate: string;
}

export default function SeniorDashboardPage() {
  const [callerNumber, setCallerNumber] = useState('');
  const [callerName, setCallerName] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentCheckId, setCurrentCheckId] = useState<string | null>(null);

  const [history, setHistory] = useState<PhoneCheckItem[]>([]);
  const [contacts, setContacts] = useState<EmergencyContactItem[]>([]);
  const [alertSuccess, setAlertSuccess] = useState('');
  const [alertLoading, setAlertLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [historyRes, contactsRes] = await Promise.all([
        fetch('/api/phone-check'),
        fetch('/api/senior/contacts'),
      ]);

      if (historyRes.ok) {
        const histData = await historyRes.json();
        setHistory(histData.checks || []);
      }
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData.contacts || []);
      }
    } catch (err) {
      console.error('Failed to load senior dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAnalyzeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAlertSuccess('');

    if (!callerNumber.trim() && !transcript.trim()) {
      setError('Please provide a telephone number or describe what the caller said.');
      return;
    }

    setLoading(true);
    setResult(null);
    setCurrentCheckId(null);

    try {
      const res = await fetch('/api/phone-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber,
          callerName,
          transcript,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to analyze phone call.');
        setLoading(false);
        return;
      }

      setResult(data);
      setCurrentCheckId(data.checkId);
      fetchDashboardData();
    } catch (err) {
      setError('Connection failure reaching AI Threat Analysis Service.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFamilyAlert = async (checkId?: string) => {
    setAlertLoading(true);
    setAlertSuccess('');
    setError('');

    try {
      const res = await fetch('/api/senior/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkId: checkId || currentCheckId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to dispatch family alert.');
        setAlertLoading(false);
        return;
      }

      setAlertSuccess(data.message);
      fetchDashboardData();
    } catch (err) {
      setError('Connection failure while dispatching family alert.');
    } finally {
      setAlertLoading(false);
    }
  };

  const highRiskCount = history.filter((h) => h.riskLevel === 'HIGH' || h.riskLevel === 'CRITICAL').length;

  return (
    <div className="space-y-6">
      {/* Top Accessible Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" /> Senior Citizen Safety Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Elder Scam & Phone Fraud Guardian</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Protect yourself against predatory phone calls, fake government arrest threats, and banking scams. Check any suspicious call in seconds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/senior/contacts"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Manage Family Contacts ({contacts.length})</span>
          </Link>
        </div>
      </div>

      {/* Emergency Contacts Status Banner */}
      {contacts.length === 0 ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">No Family / Emergency Contacts Configured</p>
              <p className="text-slate-300 mt-0.5">
                Add a trusted child, spouse, or caregiver so you can instantly send an alert if a predator calls you.
              </p>
            </div>
          </div>
          <Link
            href="/senior/contacts"
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs whitespace-nowrap hover:bg-amber-400 transition-colors"
          >
            Add Contact Now
          </Link>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-300">
              <strong className="text-white">{contacts.length}</strong> Family emergency contact(s) ready for automatic safety alerts:
              <span className="text-cyan-400 ml-1.5 font-medium">
                {contacts.map((c) => `${c.name} (${c.relationship})`).join(', ')}
              </span>
            </span>
          </div>
          <Link href="/senior/contacts" className="text-amber-400 hover:underline flex items-center gap-1">
            Edit <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Suspicious Calls Analyzed</p>
              <h3 className="text-2xl font-bold text-white mt-1">{history.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <PhoneCall className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Predatory Scams Blocked</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">{highRiskCount}</h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Family Contacts</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{contacts.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Suspicious Phone Call Scam Scanner Form */}
      <Card
        title={
          <span className="flex items-center gap-2 text-amber-400 text-base font-bold">
            <Sparkles className="w-5 h-5" /> Analyze Suspicious Telephone Call
          </span>
        }
        subtitle="Did someone call claiming you owe money, will be arrested, or need to buy gift cards? Check it below."
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

        <form onSubmit={handleAnalyzeCall} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Caller Telephone Number</label>
              <div className="relative">
                <PhoneCall className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={callerNumber}
                  onChange={(e) => setCallerNumber(e.target.value)}
                  placeholder="+1 (800) 555-0199 or private number"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Caller Claimed Name / Agency</label>
              <input
                type="text"
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="e.g. Officer Davis, IRS Agent, Bank Fraud Dept"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">What did the caller say? (Transcript / Conversation)</label>
            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Example: The caller said they are from the IRS and I have an arrest warrant. They told me not to hang up and instructed me to go to Target to buy $500 gift cards to pay the fine..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'AI Scam Engine Analyzing Call Details...' : 'Analyze Phone Call for Scams'}
            {!loading && <PhoneForwarded className="w-4 h-4" />}
          </button>
        </form>

        {/* Live Analysis Result */}
        {result && (
          <div className="mt-8 pt-6 border-t border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Threat Classification</span>
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

            {/* Explanation & Actionable Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" /> Plain-Language Explanation
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed">{result.explanation}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> What You Should Do Now
                </h4>
                <p className="text-sm text-emerald-300 font-medium leading-relaxed">{result.recommendation}</p>
              </div>
            </div>

            {/* One-Click Family Alert Trigger Button */}
            {result.familyAlertRecommended && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-xs">
                  <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold text-rose-300 text-sm">Dangerous Scam Alert Detected</span>
                    <p className="text-slate-300 mt-0.5">
                      Send an immediate alert with this call report to your emergency family contact(s).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSendFamilyAlert()}
                  disabled={alertLoading}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{alertLoading ? 'Dispatching Alert...' : 'Send Family Alert Now'}</span>
                </button>
              </div>
            )}

            {/* Detected Indicators */}
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

      {/* Recent Phone Check History */}
      <Card
        title={
          <span className="flex items-center gap-2 text-slate-200">
            <PhoneCall className="w-4 h-4 text-amber-400" /> Recent Phone Scam Checks
          </span>
        }
      >
        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No phone calls analyzed yet. Use the form above whenever you receive a suspicious call.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {history.slice(0, 5).map((item) => (
              <div key={item.checkId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm font-mono">{item.callerNumber}</span>
                    {item.callerName && <span className="text-slate-400">({item.callerName})</span>}
                    <Badge level={item.riskLevel} />
                  </div>
                  <p className="text-slate-400 mt-1 max-w-xl truncate">{item.explanation}</p>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {new Date(item.createdDate).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {(item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL') && !item.familyAlertSent && (
                    <button
                      onClick={() => handleSendFamilyAlert(item.checkId)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Alert Family
                    </button>
                  )}
                  {item.familyAlertSent && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Alert Dispatched
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
