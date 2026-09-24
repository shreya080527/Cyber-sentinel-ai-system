'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, User, Mail, Phone, Lock, AlertCircle, ArrowRight, Briefcase, Globe, PhoneCall, ShieldAlert } from 'lucide-react';
import { UserRole } from '@/types';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRoleParam = searchParams.get('role');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('registered_user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      initialRoleParam === 'student_user' ||
      initialRoleParam === 'registered_user' ||
      initialRoleParam === 'senior_citizen' ||
      initialRoleParam === 'cybersecurity_analyst'
    ) {
      setRole(initialRoleParam as UserRole);
    }
  }, [initialRoleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        setLoading(false);
        return;
      }

      switch (role) {
        case 'student_user':
          router.push('/student/dashboard');
          break;
        case 'senior_citizen':
          router.push('/senior/dashboard');
          break;
        case 'cybersecurity_analyst':
          router.push('/analyst/dashboard');
          break;
        case 'administrator':
          router.push('/admin/dashboard');
          break;
        case 'registered_user':
        default:
          router.push('/registered/dashboard');
          break;
      }
      router.refresh();
    } catch (err) {
      setError('An unexpected connection error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Create Sentinel Account</h2>
        <p className="text-xs text-slate-400">Select your cybersecurity role and access specialized protection</p>
      </div>

      {/* Card Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selection Grid */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">Choose Your Role</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setRole('registered_user')}
              className={`p-3 rounded-xl border text-left transition-all ${
                role === 'registered_user'
                  ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Globe className="w-4 h-4 mb-1 text-cyan-400" />
              <div className="text-xs font-bold">Registered User</div>
              <div className="text-[10px] text-slate-400">URL Threat Analysis</div>
            </button>

            <button
              type="button"
              onClick={() => setRole('student_user')}
              className={`p-3 rounded-xl border text-left transition-all ${
                role === 'student_user'
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Briefcase className="w-4 h-4 mb-1 text-emerald-400" />
              <div className="text-xs font-bold">Student User</div>
              <div className="text-[10px] text-slate-400">Job & Internship Scams</div>
            </button>

            <button
              type="button"
              onClick={() => setRole('senior_citizen')}
              className={`p-3 rounded-xl border text-left transition-all ${
                role === 'senior_citizen'
                  ? 'bg-amber-500/15 border-amber-500 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <PhoneCall className="w-4 h-4 mb-1 text-amber-400" />
              <div className="text-xs font-bold">Senior Citizen</div>
              <div className="text-[10px] text-slate-400">Phone Fraud & Family Alert</div>
            </button>

            <button
              type="button"
              onClick={() => setRole('cybersecurity_analyst')}
              className={`p-3 rounded-xl border text-left transition-all ${
                role === 'cybersecurity_analyst'
                  ? 'bg-purple-500/15 border-purple-500 text-purple-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <ShieldAlert className="w-4 h-4 mb-1 text-purple-400" />
              <div className="text-xs font-bold">Analyst (SOC)</div>
              <div className="text-[10px] text-slate-400">Incident Investigation</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Sentinel Account...' : `Register Account`}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>

      <div className="text-center text-xs text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-cyan-400 hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-slate-500">Loading Sentinel Registration...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
