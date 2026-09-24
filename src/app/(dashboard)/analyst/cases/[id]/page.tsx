'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  ArrowLeft,
  User,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  MessageSquare,
  Lock,
} from 'lucide-react';
import { IncidentPriority, IncidentStatus } from '@/types';

export default function CaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<IncidentStatus>('OPEN');
  const [priority, setPriority] = useState<IncidentPriority>('MEDIUM');
  const [resolution, setResolution] = useState('');
  const [newNote, setNewNote] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/analyst/cases`);
      if (res.ok) {
        const data = await res.json();
        const found = (data.cases || []).find((c: any) => c.id === caseId);
        if (found) {
          setCaseData(found);
          setStatus(found.status);
          setPriority(found.priority);
          setResolution(found.resolution || '');
        } else {
          setError('Investigation case not found.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load case details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) fetchCaseDetails();
  }, [caseId]);

  const handleUpdateStatusAndResolution = async () => {
    setSavingStatus(true);
    setMessage('');
    try {
      const res = await fetch('/api/analyst/cases', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          status,
          priority,
          resolution,
        }),
      });

      if (res.ok) {
        setMessage('Case updated successfully!');
        fetchCaseDetails();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update case.');
      }
    } catch (err) {
      setError('Connection failure updating case.');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const res = await fetch('/api/analyst/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          incidentId: caseData.incidentId,
          note: newNote,
        }),
      });

      if (res.ok) {
        setNewNote('');
        fetchCaseDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading forensic case workspace...</div>;
  }

  if (error || !caseData) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error || 'Case not found'}</p>
        <Link href="/analyst/dashboard" className="text-xs text-purple-400 hover:underline">
          Return to Analyst Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/analyst/dashboard"
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Incident Queue
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/30">
            CASE #{caseData.id.slice(0, 8)}
          </span>
          <Badge level={caseData.incidentRiskLevel || 'MEDIUM'} />
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Case Header Card */}
      <div className="p-6 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              Incident Category: {caseData.incidentType}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {caseData.incidentTitle}
            </h1>
          </div>
          <div className="text-xs text-slate-400">
            <span>Reported on {new Date(caseData.createdDate).toLocaleString()}</span>
          </div>
        </div>

        {/* Reporter Info Bar */}
        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block text-[10px]">Reporter</span>
            <span className="font-semibold text-slate-200">{caseData.reporterName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Reporter Email</span>
            <span className="font-mono text-cyan-400">{caseData.reporterEmail}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Investigating Analyst</span>
            <span className="font-semibold text-purple-400">{caseData.analystName}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Incident Description & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title={
              <span className="flex items-center gap-2 text-slate-200">
                <FileText className="w-4 h-4 text-purple-400" /> Incident Description & Evidence
              </span>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 leading-relaxed text-slate-300 whitespace-pre-wrap">
                {caseData.incidentDescription}
              </div>

              {caseData.incidentEvidence && (
                <div>
                  <h4 className="font-bold text-slate-300 mb-1.5">Submitted Evidence / Links:</h4>
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-cyan-400/90 whitespace-pre-wrap break-all">
                    {caseData.incidentEvidence}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Investigation Notes & Timeline */}
          <Card
            title={
              <span className="flex items-center gap-2 text-slate-200">
                <MessageSquare className="w-4 h-4 text-purple-400" /> Investigation Notes Timeline
              </span>
            }
            subtitle="Document your findings, forensics observations, and communication records"
          >
            <form onSubmit={handleAddNote} className="space-y-3 mb-6">
              <textarea
                rows={3}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add timestamped forensic note, IP lookup result, or recommendation..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{addingNote ? 'Adding...' : 'Post Investigation Note'}</span>
              </button>
            </form>

            <div className="space-y-3">
              {(!caseData.caseNotes || caseData.caseNotes.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No investigation notes recorded yet. Add the first note above.
                </div>
              ) : (
                caseData.caseNotes.map((note: any) => (
                  <div key={note.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="font-semibold text-purple-300">{note.analystName}</span>
                      <span className="text-[10px] text-slate-500">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{note.note}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Col: Status Management & Case Resolution */}
        <div className="space-y-6">
          <Card
            title={
              <span className="flex items-center gap-2 text-slate-200">
                <Lock className="w-4 h-4 text-purple-400" /> Case Management
              </span>
            }
          >
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Investigation Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as IncidentStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="OPEN">OPEN (Unassigned / Pending)</option>
                  <option value="UNDER_REVIEW">UNDER REVIEW (Triage)</option>
                  <option value="IN_PROGRESS">IN PROGRESS (Active Forensics)</option>
                  <option value="RESOLVED">RESOLVED (Mitigated)</option>
                  <option value="CLOSED">CLOSED (Archived)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Threat Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IncidentPriority)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Resolution Summary / Advice</label>
                <textarea
                  rows={4}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Document the resolution summary and guidance provided to the reporter..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                type="button"
                onClick={handleUpdateStatusAndResolution}
                disabled={savingStatus}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingStatus ? 'Saving...' : 'Update Case Status & Resolution'}</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
