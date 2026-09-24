'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import {
  Users,
  ShieldAlert,
  Activity,
  FileCheck2,
  Globe,
  Briefcase,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  Lock,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/40 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Lock className="w-4 h-4" /> Central Administrative Command
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">System Administration & Telemetry</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Platform governance, user accounts lifecycle, incident management oversight, and compliance audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
          <Link
            href="/admin/logs"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Audit Logs</span>
          </Link>
        </div>
      </div>

      {/* Global Telemetry Metrics */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading system metrics...</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Registered Users</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stats.users.total}</h3>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Total Threat Scans</p>
                  <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats.scans.total}</h3>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Shield className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Reported Incidents</p>
                  <h3 className="text-2xl font-bold text-amber-400 mt-1">{stats.incidents.total}</h3>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Incident Resolution Rate</p>
                  <h3 className="text-2xl font-bold text-rose-400 mt-1">{stats.incidents.resolutionRate}%</h3>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>

          {/* Breakdown Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Roles Breakdown */}
            <Card
              title={
                <span className="flex items-center gap-2 text-slate-200">
                  <Users className="w-4 h-4 text-cyan-400" /> User Population by Role
                </span>
              }
            >
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="flex items-center gap-2 text-cyan-400 font-medium">
                    <Globe className="w-4 h-4" /> Registered Users
                  </span>
                  <span className="font-bold text-white text-sm">{stats.users.registered}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="flex items-center gap-2 text-emerald-400 font-medium">
                    <Briefcase className="w-4 h-4" /> Student Users
                  </span>
                  <span className="font-bold text-white text-sm">{stats.users.student}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="flex items-center gap-2 text-amber-400 font-medium">
                    <PhoneCall className="w-4 h-4" /> Senior Citizens
                  </span>
                  <span className="font-bold text-white text-sm">{stats.users.senior}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="flex items-center gap-2 text-purple-400 font-medium">
                    <ShieldAlert className="w-4 h-4" /> Cybersecurity Analysts
                  </span>
                  <span className="font-bold text-white text-sm">{stats.users.analyst}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="flex items-center gap-2 text-rose-400 font-medium">
                    <Lock className="w-4 h-4" /> System Administrators
                  </span>
                  <span className="font-bold text-white text-sm">{stats.users.admin}</span>
                </div>
              </div>
            </Card>

            {/* AI Scans & Activity Breakdown */}
            <Card
              title={
                <span className="flex items-center gap-2 text-slate-200">
                  <Layers className="w-4 h-4 text-emerald-400" /> AI Threat Engine Scans Breakdown
                </span>
              }
            >
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300">URL Phishing Checks</span>
                  <span className="font-bold text-white font-mono">{stats.scans.urlChecks}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300">Fake Job & Recruitment Scams</span>
                  <span className="font-bold text-white font-mono">{stats.scans.scamReports}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300">Phone Fraud & Robocall Scans</span>
                  <span className="font-bold text-white font-mono">{stats.scans.phoneChecks}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300">Active Incidents Under Investigation</span>
                  <span className="font-bold text-amber-400 font-mono">{stats.incidents.open}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-300">Total System Audit Events</span>
                  <span className="font-bold text-cyan-400 font-mono">{stats.auditLogs.total}</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
