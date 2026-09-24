'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  History,
  FileCheck2,
  Briefcase,
  MessageSquareWarning,
  User,
  ShieldAlert,
  PhoneCall,
  Users,
  ShieldCheck,
  FileText,
  AlertOctagon,
  Activity,
  HeartHandshake,
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  role?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ role = 'registered_user' }) => {
  const pathname = usePathname();

  const registeredLinks = [
    { label: 'URL Analyzer', href: '/registered/dashboard', icon: Globe },
    { label: 'Analysis History', href: '/registered/history', icon: History },
    { label: 'Report Incident', href: '/report-incident', icon: AlertOctagon },
    { label: 'Security Profile', href: '/profile', icon: User },
  ];

  const studentLinks = [
    { label: 'Student Safety Hub', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Fake Job Detector', href: '/student/job-detector', icon: Briefcase },
    { label: 'Message Verifier', href: '/student/message-verifier', icon: MessageSquareWarning },
    { label: 'Scam Reports', href: '/student/reports', icon: FileCheck2 },
    { label: 'Report Incident', href: '/report-incident', icon: AlertOctagon },
    { label: 'Student Profile', href: '/profile', icon: User },
  ];

  const seniorLinks = [
    { label: 'Senior Safety Hub', href: '/senior/dashboard', icon: LayoutDashboard },
    { label: 'Phone Scam Scanner', href: '/senior/phone-check', icon: PhoneCall },
    { label: 'Family Contacts', href: '/senior/contacts', icon: HeartHandshake },
    { label: 'Report Incident', href: '/report-incident', icon: AlertOctagon },
    { label: 'My Profile', href: '/profile', icon: User },
  ];

  const analystLinks = [
    { label: 'Analyst Dashboard', href: '/analyst/dashboard', icon: ShieldAlert },
    { label: 'Report Incident', href: '/report-incident', icon: AlertOctagon },
    { label: 'My Profile', href: '/profile', icon: User },
  ];

  const adminLinks = [
    { label: 'Admin Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Incident Oversight', href: '/admin/incidents', icon: ShieldCheck },
    { label: 'Audit Activity Logs', href: '/admin/logs', icon: Activity },
    { label: 'Report Incident', href: '/report-incident', icon: AlertOctagon },
    { label: 'Admin Profile', href: '/profile', icon: User },
  ];

  let currentLinks = registeredLinks;
  let workspaceTitle = 'Registered Sentinel';

  switch (role) {
    case 'administrator':
      currentLinks = adminLinks;
      workspaceTitle = 'Administrator Console';
      break;
    case 'cybersecurity_analyst':
      currentLinks = analystLinks;
      workspaceTitle = 'Security Analyst SOC';
      break;
    case 'senior_citizen':
      currentLinks = seniorLinks;
      workspaceTitle = 'Senior Citizen Hub';
      break;
    case 'student_user':
      currentLinks = studentLinks;
      workspaceTitle = 'Student Workspace';
      break;
    case 'registered_user':
    default:
      currentLinks = registeredLinks;
      workspaceTitle = 'Registered Sentinel';
      break;
  }

  return (
    <aside className="w-64 bg-slate-950/60 border-r border-slate-800/80 p-4 min-h-[calc(100vh-4rem)] flex flex-col justify-between backdrop-blur-md">
      <div>
        <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-slate-500 uppercase flex items-center justify-between">
          <span>{workspaceTitle}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <nav className="mt-2 space-y-1">
          {currentLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 py-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-medium">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Sentinel Intelligence</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Role Access: <span className="text-emerald-400 font-bold uppercase">{role?.replace('_', ' ')}</span>
        </div>
      </div>
    </aside>
  );
};
