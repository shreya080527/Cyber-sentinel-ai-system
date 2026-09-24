import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Globe,
  Briefcase,
  PhoneCall,
  ShieldAlert,
  Lock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { getSession } from '@/lib/auth';

export default async function HomePage() {
  const session = await getSession();

  const getDashboardLink = () => {
    if (!session) return '/login';
    switch (session.role) {
      case 'student_user':
        return '/student/dashboard';
      case 'senior_citizen':
        return '/senior/dashboard';
      case 'cybersecurity_analyst':
        return '/analyst/dashboard';
      case 'administrator':
        return '/admin/dashboard';
      case 'registered_user':
      default:
        return '/registered/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      <Navbar user={session} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold backdrop-blur-md">
            <Shield className="w-4 h-4" />
            <span>AI-POWERED MULTI-USER CYBERSECURITY PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            CYBER SENTINEL{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              AI SYSTEM
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 font-normal max-w-2xl mx-auto">
            Comprehensive threat detection, URL phishing scanner, student job scam detector, senior phone fraud guardian, and security analyst SOC investigation suite.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {session ? (
              <Link
                href={getDashboardLink()}
                className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
              >
                Go to Your Dashboard ({session.role.replace('_', ' ')})
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2"
                >
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-sm transition-all flex items-center gap-2"
                >
                  Create New Account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 5 User Roles Interactive Showcase */}
        <div className="mt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Five Specialized Cybersecurity Roles</h2>
            <p className="text-xs text-slate-400 mt-1">Each user role receives tailored security intelligence and tools</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* 1. Registered User */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/30">
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Registered User</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Multi-vector web link scanning, phishing domain detection, and risk assessment history.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>AI URL Threat Analyzer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>5-Tier Risk Assessment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Searchable Scan History</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-800/80">
                <Link href="/register?role=registered_user" className="text-xs font-bold text-cyan-400 flex items-center gap-1 hover:underline">
                  Launch Registered Portal <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 2. Student User */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Student User</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Protection against fraudulent internships, upfront fee scams, and fake recruiters.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Fake Job & Internship Detector</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Recruitment Message Verifier</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Scam Reports & Advisories</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-800/80">
                <Link href="/register?role=student_user" className="text-xs font-bold text-emerald-400 flex items-center gap-1 hover:underline">
                  Launch Student Hub <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 3. Senior Citizen User */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/30">
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Senior Citizen User</h3>
                <p className="text-xs text-slate-400 mb-4">
                  High-contrast elder guardian detecting IRS threats, tech traps, and family emergency scams.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Phone Call Scam Scanner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Emergency Family Contact Network</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>One-Click Family Alert System</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-800/80">
                <Link href="/register?role=senior_citizen" className="text-xs font-bold text-amber-400 flex items-center gap-1 hover:underline">
                  Launch Senior Portal <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 4. Cybersecurity Analyst */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-purple-500/40 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/30">
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">Cybersecurity Analyst</h3>
                <p className="text-xs text-slate-400 mb-4">
                  SOC incident triage, digital evidence inspection, timeline forensic notes, and case status management.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Incident Triage Queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Evidence & Forensic Case Notes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Status: OPEN → RESOLVED</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-800/80">
                <Link href="/register?role=cybersecurity_analyst" className="text-xs font-bold text-purple-400 flex items-center gap-1 hover:underline">
                  Launch SOC Workspace <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* 5. Administrator */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 hover:border-rose-500/40 transition-all flex flex-col justify-between md:col-span-2 lg:col-span-2">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/30">
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">System Administrator</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Full user lifecycle management, role privileges, analyst case allocation, and system audit trail monitoring.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>User CRUD & Role Governance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Case Allocation Console</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Platform Telemetry & Metrics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>Full Security Audit Stream</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-800/80">
                <Link href="/login" className="text-xs font-bold text-rose-400 flex items-center gap-1 hover:underline">
                  Sign In to Admin Console <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Cyber Sentinel AI System. All 5 Roles Fully Implemented & Integrated.</p>
      </footer>
    </div>
  );
}
