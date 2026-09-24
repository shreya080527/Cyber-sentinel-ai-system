'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  AlertOctagon,
  Send,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { IncidentPriority, IncidentStatus, ReportedIncidentItem, RiskLevel } from '@/types';

export default function ReportIncidentPage() {
  const [title, setTitle] = useState('');
  const [incidentType, setIncidentType] = useState('PHISHING');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [priority, setPriority] = useState<IncidentPriority>('MEDIUM');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('MEDIUM');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [myIncidents, setMyIncidents] = useState<ReportedIncidentItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchMyIncidents = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setMyIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchMyIncidents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!title.trim() || title.trim().length < 3) {
      setError('Please provide an incident title (at least 3 characters).');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a detailed description of what occurred (at least 10 characters).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          incidentType,
          description,
          evidence,
          priority,
          riskLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit incident report.');
      } else {
        setMessage('Incident report successfully submitted! A cybersecurity analyst has been notified.');
        setTitle('');
        setDescription('');
        setEvidence('');
        fetchMyIncidents();
      }
    } catch (err) {
      setError('Connection failure while filing report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <AlertOctagon className="w-4 h-4" /> Incident Response Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Report a Cybersecurity Incident</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Submit suspicious activities, security breaches, unauthorized charges, or extortion threats directly to our cybersecurity analyst team.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Incident Form */}
      <Card
        title={
          <span className="flex items-center gap-2 text-rose-400 font-bold">
            <FileText className="w-5 h-5" /> File Incident Report
          </span>
        }
        subtitle="Provide all relevant details to assist analysts in forensic evaluation"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Incident Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unsolicited Wire Transfer Request from Fake Bank"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Incident Category</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
              >
                <option value="PHISHING">Phishing / Credential Harvesting</option>
                <option value="JOB_SCAM">Fake Job / Recruitment Fraud</option>
                <option value="PHONE_SCAM">Telephone Scam / Elder Fraud</option>
                <option value="IDENTITY_THEFT">Identity Theft / Account Takeover</option>
                <option value="MALWARE">Malware / Ransomware Infection</option>
                <option value="EXTORTION">Blackmail / Extortion Threat</option>
                <option value="OTHER">Other Security Incident</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Severity / Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IncidentPriority)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
              >
                <option value="LOW">LOW - Non-urgent informational report</option>
                <option value="MEDIUM">MEDIUM - Standard incident requiring review</option>
                <option value="HIGH">HIGH - Compromised credentials or money loss</option>
                <option value="CRITICAL">CRITICAL - Ongoing active fraud or extortion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Initial Risk Level Assessment</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-rose-500 transition-colors"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Incident Description</label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe in detail what happened, dates/times, how the attacker contacted you, and any actions you took..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Evidence / Links / Contact Information (Optional)
            </label>
            <textarea
              rows={3}
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              placeholder="Paste suspicious URLs, attacker email addresses, phone numbers, or wire transfer account details..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Filing Incident Report...' : 'Submit Incident Report to SOC Analysts'}
            {!loading && <Send className="w-4 h-4" />}
          </button>
        </form>
      </Card>

      {/* My Reported Incidents */}
      <Card
        title={
          <span className="flex items-center gap-2 text-slate-200">
            <Clock className="w-5 h-5 text-cyan-400" /> My Reported Incidents History ({myIncidents.length})
          </span>
        }
      >
        {loadingHistory ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading your incidents...</div>
        ) : myIncidents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            You haven't reported any cybersecurity incidents yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {myIncidents.map((inc) => (
              <div key={inc.id} className="py-4 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-white text-sm">{inc.title}</span>
                    <span className="text-[10px] text-slate-500 ml-2 font-mono">
                      Category: {inc.incidentType} | {new Date(inc.createdDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-800 text-cyan-400">
                      STATUS: {inc.status}
                    </span>
                    <Badge level={inc.riskLevel} />
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed">{inc.description}</p>

                {inc.resolution && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <strong className="block text-emerald-400 text-[11px] mb-0.5">Analyst Resolution Guidance:</strong>
                    {inc.resolution}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
