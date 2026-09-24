'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get('from');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      const role = data.user?.role;
      if (fromPath) {
        router.push(fromPath);
      } else {
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
      }
      router.refresh();
    } catch (err) {
      setError('An unexpected connection error occurred.');
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to Cyber Sentinel</h2>
        <p className="text-xs text-slate-400">Access your role-specific cybersecurity dashboard</p>
      </div>

      {/* Card Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <span className="text-[11px] text-cyan-400 hover:underline cursor-pointer" onClick={() => alert('Password reset is simulated for demo mode. Simply register a new account or sign in with password123.')}>
                Forgot Password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Demo Accounts Quick-Select */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Click to autofill demo account:
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => fillDemoAccount('user@sentinel.com')}
              className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-left hover:border-cyan-500 transition-colors"
            >
              <span className="text-cyan-400 font-bold">Registered</span>
              <div className="text-slate-400 truncate">user@sentinel.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('student@sentinel.com')}
              className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-left hover:border-emerald-500 transition-colors"
            >
              <span className="text-emerald-400 font-bold">Student</span>
              <div className="text-slate-400 truncate">student@sentinel.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('senior@sentinel.com')}
              className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-left hover:border-amber-500 transition-colors"
            >
              <span className="text-amber-400 font-bold">Senior Citizen</span>
              <div className="text-slate-400 truncate">senior@sentinel.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('analyst@sentinel.com')}
              className="p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-left hover:border-purple-500 transition-colors"
            >
              <span className="text-purple-400 font-bold">Analyst (SOC)</span>
              <div className="text-slate-400 truncate">analyst@sentinel.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@sentinel.com')}
              className="col-span-2 p-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-left hover:border-rose-500 transition-colors"
            >
              <span className="text-rose-400 font-bold">Administrator</span>
              <div className="text-slate-400">admin@sentinel.com / password123</div>
            </button>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-cyan-400 hover:underline">
          Register here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-slate-500">Loading Sentinel Sign In...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
