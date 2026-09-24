'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  FileText,
  Filter,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';
import { CaseItem, IncidentPriority, IncidentStatus, RiskLevel } from '@/types';

export default function AnalystDashboardPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [onlyMyCases, setOnlyMyCases] = useState(false);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.set('status', filterStatus);
      if (filterPriority !== 'ALL') params.set('priority', filterPriority);
      if (onlyMyCases) params.set('myCases', 'true');

      const res = await fetch(`/api/analyst/cases?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
      }
    } catch (err) {
      console.error('Failed to load analyst cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [filterStatus, filterPriority, onlyMyCases]);

  const handleClaimCase = async (caseId: string) => {
    try {
      setUpdatingId(caseId);
      const res = await fetch('/api/analyst/cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          assignToMe: true,
          status: 'IN_PROGRESS',
        }),
      });

      if (res.ok) {
        fetchCases();
      }
    } catch (err) {
      console.error('Failed to claim case:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleQuickStatus = async (caseId: string, newStatus: IncidentStatus) => {
    try {
      setUpdatingId(caseId);
      const res = await fetch('/api/analyst/cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        fetchCases();
      }
    } catch (err) {
      console.error('Failed to update case status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredCases = cases.filter((c: any) => {
    const q = search.toLowerCase();
    return (
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.incidentTitle && c.incidentTitle.toLowerCase().includes(q)) ||
      (c.reporterName && c.reporterName.toLowerCase().includes(q)) ||
      (c.incidentType && c.incidentType.toLowerCase().includes(q)) ||
      c.id.toLowerCase().includes(q)
    );
  });

  const openCount = cases.filter((c) => c.status === 'OPEN').length;
  const inProgressCount = cases.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'UNDER_REVIEW').length;
  const resolvedCount = cases.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" /> Security Operations Center (SOC)
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Incident Investigation Queue</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review reported cybersecurity incidents, inspect evidence, assign risk ratings, and conduct forensic case investigations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCases}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            title="Refresh Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* SOC Triage Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Cases in Queue</p>
              <h3 className="text-2xl font-bold text-white mt-1">{cases.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FolderGit2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Unclaimed / Open</p>
              <h3 className="text-2xl font-bold text-rose-400 mt-1">{openCount}</h3>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Investigations</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">{inProgressCount}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Resolved / Closed</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">{resolvedCount}</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search case, reporter, type, or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>Priority:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <button
              onClick={() => setOnlyMyCases(!onlyMyCases)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                onlyMyCases
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              My Cases Only
            </button>
          </div>
        </div>
      </Card>

      {/* Incident & Case Triage Queue */}
      <Card
        title={
          <span className="flex items-center gap-2 text-slate-100 font-bold">
            <FileText className="w-5 h-5 text-purple-400" /> Active Incident Investigations ({filteredCases.length})
          </span>
        }
      >
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading investigation queue...</div>
        ) : filteredCases.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No cases match the selected filter criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 px-3">Case / Incident</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Reporter</th>
                  <th className="pb-3 px-3">Priority</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Assigned Analyst</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCases.map((c: any) => {
                  const isUpdating = updatingId === c.id;

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-3 max-w-xs">
                        <span className="font-mono text-[10px] text-purple-400 block">
                          CASE-{c.id.slice(0, 8)}
                        </span>
                        <span className="font-bold text-slate-100 block truncate">
                          {c.incidentTitle || c.title || 'Untitled Incident'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Filed {new Date(c.createdDate).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {c.incidentType || 'OTHER'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-slate-200 block font-medium">{c.reporterName}</span>
                        <span className="text-[10px] text-slate-500 truncate block max-w-[140px]">
                          {c.reporterEmail}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.priority === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : c.priority === 'HIGH'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          }`}
                        >
                          {c.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          disabled={isUpdating}
                          value={c.status}
                          onChange={(e) => handleQuickStatus(c.id, e.target.value as IncidentStatus)}
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] font-semibold text-slate-200 focus:outline-none focus:border-purple-500"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="UNDER_REVIEW">UNDER REVIEW</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300">
                        {c.analystName === 'Unassigned' ? (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleClaimCase(c.id)}
                            className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Claim Case
                          </button>
                        ) : (
                          <span className="font-medium text-slate-200">{c.analystName}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <Link
                          href={`/analyst/cases/${c.id}`}
                          className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>Investigate</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
