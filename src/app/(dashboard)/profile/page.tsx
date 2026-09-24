'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { User, Mail, Phone, Lock, CheckCircle, AlertCircle, Shield, Building } from 'lucide-react';

export default function ProfileManagementPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [institution, setInstitution] = useState('');
  const [department, setDepartment] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setName(data.user.name || '');
          setEmail(data.user.email || '');
          setPhone(data.user.phone || '');
          setRole(data.user.role || '');
          if (data.user.account) {
            setBio(data.user.account.bio || '');
            setInstitution(data.user.account.institution || '');
            setDepartment(data.user.account.department || '');
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch profile error:', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          bio,
          institution,
          department,
          newPassword: newPassword ? newPassword : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile.');
        setSaving(false);
        return;
      }

      setMessage('Profile settings updated successfully!');
      setNewPassword('');
    } catch (err) {
      setError('Connection failure while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading user profile...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-cyan-400" /> Sentinel Security Profile
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage your identity, role permissions, and security credentials</p>
        </div>
        <span className="px-3 py-1 text-xs font-semibold bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/30 uppercase">
          {role}
        </span>
      </div>

      <Card>
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address (Read-only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Institution / Company</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="University / Organization"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department / Field of Study</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Computer Science, Cybersecurity, Business"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Bio / Security Notes</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Add personal notes or security preferences..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Change Password (Optional)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep existing password"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Settings'}
          </button>
        </form>
      </Card>
    </div>
  );
}
