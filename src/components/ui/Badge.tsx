import React from 'react';
import { RiskLevel } from '@/types';
import { ShieldCheck, AlertTriangle, ShieldAlert, AlertOctagon, Info } from 'lucide-react';

interface BadgeProps {
  level: RiskLevel | string;
  showIcon?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ level, showIcon = true, className = '' }) => {
  const normalized = (level || 'SAFE').toUpperCase();

  let colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let Icon = ShieldCheck;
  let label = 'SAFE';

  switch (normalized) {
    case 'CRITICAL':
      colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/40 animate-pulse';
      Icon = AlertOctagon;
      label = 'CRITICAL THREAT';
      break;
    case 'HIGH':
      colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      Icon = ShieldAlert;
      label = 'HIGH RISK';
      break;
    case 'MEDIUM':
      colorClasses = 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40';
      Icon = AlertTriangle;
      label = 'MEDIUM RISK';
      break;
    case 'LOW':
      colorClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      Icon = Info;
      label = 'LOW RISK';
      break;
    case 'SAFE':
    default:
      colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      Icon = ShieldCheck;
      label = 'SAFE / VERIFIED';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${colorClasses} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
};
