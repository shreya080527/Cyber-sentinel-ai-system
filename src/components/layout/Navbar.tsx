'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, AlertOctagon } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { UserSession } from '@/types';

interface NavbarProps {
  user?: UserSession | null;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'administrator':
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-md">
            System Administrator
          </span>
        );
      case 'cybersecurity_analyst':
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 rounded-md">
            Security Analyst
          </span>
        );
      case 'senior_citizen':
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-md">
            Senior Guardian
          </span>
        );
      case 'student_user':
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-md">
            Student Cyber Safety
          </span>
        );
      case 'registered_user':
      default:
        return (
          <span className="px-2.5 py-0.5 text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded-md">
            Registered Sentinel
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400 transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent tracking-wide">
                CYBER SENTINEL
              </span>
              <span className="text-[10px] text-cyan-400/70 block -mt-1 font-mono tracking-widest uppercase">
                AI Threat Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* User Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                {getRoleBadge(user.role)}
              </div>

              {/* Quick Report Incident link */}
              <Link
                href="/report-incident"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
                title="Report Cybersecurity Incident"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span>Report Incident</span>
              </Link>

              <NotificationCenter />

              <div className="h-4 w-px bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:text-cyan-400 transition-colors py-1 px-2 rounded-lg hover:bg-slate-900"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-cyan-400">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline text-xs font-medium text-slate-200">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-900 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 px-3.5 py-2 rounded-lg transition-colors font-medium shadow-md shadow-cyan-500/20"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
