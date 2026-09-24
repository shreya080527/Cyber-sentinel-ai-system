'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { HeartHandshake, UserPlus, Phone, Mail, Trash2, Send, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { EmergencyContactItem } from '@/types';

export default function SeniorContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('CHILD');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [testSending, setTestSending] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/senior/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!name.trim() || !phone.trim()) {
      setError('Please provide a name and telephone number.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/senior/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          relationship,
          notifyOnCritical: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add emergency contact.');
        setSaving(false);
        return;
      }

      setMessage(`Emergency contact "${name}" successfully registered!`);
      setName('');
      setPhone('');
      setEmail('');
      fetchContacts();
    } catch (err) {
      setError('Connection failure while saving contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (id: string, contactName: string) => {
    if (!confirm(`Are you sure you want to remove ${contactName} from your emergency contacts?`)) return;

    try {
      const res = await fetch(`/api/senior/contacts?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessage(`Contact "${contactName}" removed.`);
        fetchContacts();
      }
    } catch (err) {
      setError('Failed to remove contact.');
    }
  };

  const handleTestAlert = async () => {
    if (contacts.length === 0) {
      setError('Please add at least one emergency contact before sending a test alert.');
      return;
    }

    setTestSending(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/senior/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customMessage: '🔔 TEST ALERT: This is a verified test of your Cyber Sentinel Emergency Family Alert system. All configured contacts received this notification.',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to dispatch test alert.');
      } else {
        setMessage('Test family alert successfully dispatched!');
      }
    } catch (err) {
      setError('Connection failure sending test alert.');
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" /> Family Protection Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Emergency & Family Contacts</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure trusted family members or caregivers to receive instant alerts if you encounter a high-risk telephone scam.
          </p>
        </div>

        {contacts.length > 0 && (
          <button
            type="button"
            onClick={handleTestAlert}
            disabled={testSending}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{testSending ? 'Testing...' : 'Send Test Alert'}</span>
          </button>
        )}
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

      {/* Add New Contact Form */}
      <Card
        title={
          <span className="flex items-center gap-2 text-amber-400 font-bold">
            <UserPlus className="w-5 h-5" /> Add New Family / Emergency Contact
          </span>
        }
        subtitle="Trusted people who should be notified when a dangerous call or scam is detected"
      >
        <form onSubmit={handleAddContact} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Michael (Son), Emily (Daughter), Dr. Smith"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="CHILD">Child / Adult Son or Daughter</option>
                <option value="SPOUSE">Spouse / Partner</option>
                <option value="CAREGIVER">Caregiver / Nurse</option>
                <option value="FRIEND">Trusted Friend / Neighbor</option>
                <option value="LAWYER">Attorney / Legal Guardian</option>
                <option value="OTHER">Other Family Member</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Telephone Number (Mobile / SMS)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address (Optional)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@family.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? 'Registering Contact...' : 'Save Emergency Family Contact'}
          </button>
        </form>
      </Card>

      {/* Existing Contacts List */}
      <Card
        title={
          <span className="flex items-center gap-2 text-slate-200">
            <HeartHandshake className="w-5 h-5 text-amber-400" /> Active Emergency Contacts ({contacts.length})
          </span>
        }
      >
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No contacts added yet. Use the form above to add your children, spouse, or caregivers.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {contacts.map((c) => (
              <div key={c.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{c.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                      {c.relationship}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-4 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {c.phone}
                    </span>
                    {c.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-500" /> {c.email}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteContact(c.id, c.name)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Remove contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
