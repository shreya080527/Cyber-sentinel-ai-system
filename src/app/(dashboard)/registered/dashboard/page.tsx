'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Globe, Search, ShieldAlert, CheckCircle2, History, AlertTriangle, Cpu, Info, ArrowUpRight, Sparkles } from 'lucide-react';
import { AnalysisResult, RiskLevel } from '@/types';

interface URLCheckHistoryItem {
  checkId: string;
  url: string;
  checkedDate: string;
  riskLevel: RiskLevel;
  confidenceScore: number;
  threatType: string;
  indicators: any[];
  explanation: string;
  recommendation: string;
}

export default function RegisteredDashboardPage() {
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<URLCheckHistoryItem[]>([]);
  const [stats, setStats] = useState({ total: 0, safe: 0, highRisk: 0 });

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/url-check');
      if (res.ok) {
        const data = await res.json();
        const checks: URLCheckHistoryItem[] = data.checks || [];
        setHistory(checks);

        const total = checks.length;
        const safe = checks.filter((c) => c.riskLevel === 'SAFE' || c.riskLevel === 'LOW').length;
        const highRisk = checks.filter((c) => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length;
        setStats({ total, safe, highRisk });
      }
    } catch (err) {
      console.error('History fetch error:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const validateURL = (url: string): string | null => {
    const trimmed = url.trim();
    if (!trimmed) return 'Please enter a valid website URL.';
    if (trimmed.length < 4) return 'URL is too short.';
    return null;
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const valError = validateURL(urlInput);
    if (valError) {
      setError(valError);
      return;
    }

    setLoading(true);
    setCurrentResult(null);

    try {
      const res = await fetch('/api/url-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Analysis service is temporarily unavailable. Please try again later.');
        setLoading(false);
        return;
      }

      setCurrentResult(data);
      fetchHistory(); // Refresh history list
    } catch (err) {
      setError('Connection failure while reaching AI Threat Analysis Service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Globe className="w-4 h-4" /> Registered Sentinel Portal
          </div>
          <h1 className="text-2xl font-extrabold text-white">URL Threat Intelligence Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Scan suspicious links, verify domain legitimacy, and analyze phishing indicators in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Engine v1.0 Active
          </span>
        </div>
      </div>

      {/* Security Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Scans Executed</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Search className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Clean / Low Risk URLs</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats.safe}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">High / Critical Threats</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">{stats.highRisk}</h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main URL Threat Analyzer Input Form */}
      <Card
        title={
          <span className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-5 h-5" /> AI Threat Analysis Service — URL Scan
          </span>
        }
        subtitle="Paste any website URL or suspicious link to initiate deep multi-vector security analysis"
      >
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example-domain.com/login-verify"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                {loading ? 'Analyzing...' : 'Analyze URL'}
                {!loading && <Search className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> {error}
              </p>
            )}
          </div>
        </form>

        {/* Live Analysis Result Display */}
        {currentResult && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 font-mono uppercase block">Threat Classification</span>
                <span className="text-sm font-bold text-slate-200">{currentResult.threatType}</span>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase block text-right">Confidence</span>
                  <span className="text-sm font-bold text-cyan-400">{currentResult.confidenceScore}%</span>
                </div>
                <Badge level={currentResult.riskLevel} />
              </div>
            </div>

            {/* Explanation & Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" /> Explanation
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{currentResult.explanation}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Recommendation
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{currentResult.recommendation}</p>
              </div>
            </div>

            {/* Detected Indicators List */}
            {currentResult.indicators && currentResult.indicators.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">Detected Security Indicators</h4>
                <div className="grid grid-cols-1 gap-2">
                  {currentResult.indicators.map((ind, idx) => (
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

      {/* Recent Analysis History Table */}
      <Card
        title={
          <span className="flex items-center gap-2 text-slate-200">
            <History className="w-4 h-4 text-cyan-400" /> Recent URL Analyses
          </span>
        }
      >
        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No previous URL scans recorded. Enter a URL above to perform your first analysis.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 px-2">Target URL</th>
                  <th className="pb-3 px-2">Date / Time</th>
                  <th className="pb-3 px-2">Risk Rating</th>
                  <th className="pb-3 px-2 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.slice(0, 5).map((item) => (
                  <tr key={item.checkId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-2 max-w-xs truncate font-mono text-cyan-400/90">{item.url}</td>
                    <td className="py-3 px-2 text-slate-400 text-[11px]">
                      {new Date(item.checkedDate).toLocaleString()}
                    </td>
                    <td className="py-3 px-2">
                      <Badge level={item.riskLevel} showIcon={false} />
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-slate-300">{item.confidenceScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
