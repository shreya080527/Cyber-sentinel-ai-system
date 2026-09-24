'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { History, Search, ExternalLink, ShieldAlert, AlertTriangle, Info, X } from 'lucide-react';
import { RiskLevel } from '@/types';

interface HistoryItem {
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

export default function AnalysisHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    fetch('/api/url-check')
      .then((res) => res.json())
      .then((data) => {
        setHistory(data.checks || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('History fetch error:', err);
        setLoading(false);
      });
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesFilter = filter === 'ALL' || item.riskLevel === filter;
    const matchesSearch = item.url.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" /> URL Threat Analysis History
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review, filter, and inspect past website scan reports</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search URL domain..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === lvl
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Table List */}
      <Card>
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading history records...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No matching threat analyses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 px-3">Analyzed URL</th>
                  <th className="pb-3 px-3">Date / Time</th>
                  <th className="pb-3 px-3">Classification</th>
                  <th className="pb-3 px-3">Risk Level</th>
                  <th className="pb-3 px-3 text-right">Confidence</th>
                  <th className="pb-3 px-3 text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHistory.map((item) => (
                  <tr key={item.checkId} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3 max-w-xs truncate font-mono text-cyan-400/90">{item.url}</td>
                    <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                      {new Date(item.checkedDate).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 font-medium">{item.threatType}</td>
                    <td className="py-3.5 px-3">
                      <Badge level={item.riskLevel} showIcon={false} />
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-200">{item.confidenceScore}%</td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors flex items-center gap-1 mx-auto"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-400" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Inspect Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono truncate max-w-md">{selectedItem.url}</h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Risk Rating</span>
                <Badge level={selectedItem.riskLevel} />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-mono block uppercase text-right">Confidence</span>
                <span className="text-sm font-bold text-cyan-400">{selectedItem.confidenceScore}%</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-slate-300">Explanation:</span>
              <p className="text-slate-400 leading-relaxed">{selectedItem.explanation}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <span className="font-semibold text-emerald-400">Recommendation:</span>
              <p className="text-slate-400 leading-relaxed">{selectedItem.recommendation}</p>
            </div>

            {selectedItem.indicators && selectedItem.indicators.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Indicators:</span>
                {selectedItem.indicators.map((ind: any, idx: number) => (
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
