'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  Search,
  Filter,
  ExternalLink,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { AdminUserItem, IncidentPriority, IncidentStatus, ReportedIncidentItem } from '@/types';

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<ReportedIncidentItem[]>([]);
  const [analysts, setAnalysts] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchIncidentsAndAnalysts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'ALL') params.set('status', filterStatus);
      if (filterPriority !== 'ALL') params.set('priority', filterPriority);
      if (search.trim()) params.set('search', search.trim());

      const [incRes, analystsRes] = await Promise.all([
        fetch(`/api/incidents?${params.toString()}`),
        fetch(`/api/admin/users?role=cybersecurity_analyst`),
      ]);

      if (incRes.ok) {
        const data = await incRes.json();
        setIncidents(data.incidents || []);
      }
      if (analystsRes.ok) {
        const aData = await analystsRes.json();
        setAnalysts(aData.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentsAndAnalysts();
  }, [filterStatus, filterPriority]);

  const handleAssignAnalyst = async (incidentId: string, caseId: string, analystId: string) => {
    try {
      setUpdatingId(incidentId);
      const res = await fetch('/api/analyst/cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          analystId: analystId || null,
        }),
      });

      if (res.ok) {
        fetchIncidentsAndAnalysts();
      }
    } catch (err) {
      console.error('Failed to assign analyst:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" /> Incident & Case Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Incident Oversight</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supervise all reported cybersecurity incidents and allocate cases to qualified cybersecurity analysts.
          </p>
        </div>

        <button
          onClick={fetchIncidentsAndAnalysts}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
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
              placeholder="Search incidents by title or description..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs text-slate-400">
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>

            <span>Priority:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Incidents Table */}
      <Card
        title={
          <span className="flex items-center gap-2 text-slate-200 font-bold">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> Platform Incidents ({incidents.length})
          </span>
        }
      >
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading incident records...</div>
        ) : incidents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No incident reports recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 px-3">Title / Type</th>
                  <th className="pb-3 px-3">Reporter</th>
                  <th className="pb-3 px-3">Risk / Priority</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Assign to Analyst</th>
                  <th className="pb-3 px-3 text-right">Case Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {incidents.map((inc) => {
                  const activeCase = inc.cases && inc.cases.length > 0 ? inc.cases[0] : null;

                  return (
                    <tr key={inc.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-3 max-w-xs">
                        <span className="font-bold text-white block truncate">{inc.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Category: {inc.incidentType} | {new Date(inc.createdDate).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-slate-200 block">{inc.reporterName}</span>
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[130px] block">
                          {inc.reporterEmail}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Badge level={inc.riskLevel} showIcon={false} />
                          <span className="text-[10px] text-slate-400 font-mono">({inc.priority})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-slate-300">
                          {inc.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {activeCase ? (
                          <select
                            disabled={updatingId === inc.id}
                            value={inc.assignedToId || ''}
                            onChange={(e) => handleAssignAnalyst(inc.id, activeCase.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-rose-500"
                          >
                            <option value="">Unassigned</option>
                            {analysts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name} ({a.email})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-500 text-[10px]">No active case</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        {activeCase ? (
                          <Link
                            href={`/analyst/cases/${activeCase.id}`}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          '-'
                        )}
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
