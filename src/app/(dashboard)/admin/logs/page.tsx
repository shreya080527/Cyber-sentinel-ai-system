'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Activity, Search, RefreshCw, Filter, ShieldCheck, Clock, Terminal } from 'lucide-react';
import { AuditLogItem } from '@/types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionFilter !== 'ALL') params.set('action', actionFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN') || action.includes('REGISTER')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{action}</span>;
    }
    if (action.includes('INCIDENT') || action.includes('CASE')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">{action}</span>;
    }
    if (action.includes('ALERT')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">{action}</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">{action}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" /> System Audit & Compliance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Platform Activity Audit Trail</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Immutable log trail of authentications, administrative actions, incident status modifications, and alerts.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Refresh Logs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit details..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors font-mono"
            />
          </form>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Event Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
            >
              <option value="ALL">All Event Actions</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="USER_REGISTERED">USER_REGISTERED</option>
              <option value="INCIDENT_REPORTED">INCIDENT_REPORTED</option>
              <option value="CASE_UPDATED">CASE_UPDATED</option>
              <option value="FAMILY_ALERT_DISPATCHED">FAMILY_ALERT_DISPATCHED</option>
              <option value="ADMIN_USER_CREATED">ADMIN_USER_CREATED</option>
              <option value="ADMIN_USER_UPDATED">ADMIN_USER_UPDATED</option>
              <option value="ADMIN_USER_DELETED">ADMIN_USER_DELETED</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Audit Log Stream Table */}
      <Card
        title={
          <span className="flex items-center gap-2 text-slate-200 font-bold">
            <Terminal className="w-4 h-4 text-cyan-400" /> Audit Log Stream ({logs.length})
          </span>
        }
      >
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading system audit stream...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No audit logs matching this search filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 px-3">Timestamp</th>
                  <th className="pb-3 px-3">Event Action</th>
                  <th className="pb-3 px-3">Actor / User</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Audit Details</th>
                  <th className="pb-3 px-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-3 text-slate-200 font-sans font-medium">{log.userName}</td>
                    <td className="py-3 px-3 text-slate-400 text-[10px] uppercase">{log.role}</td>
                    <td className="py-3 px-3 text-slate-300 font-sans text-xs max-w-md truncate">
                      {log.details}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 text-[11px]">{log.ipAddress || '127.0.0.1'}</td>
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
