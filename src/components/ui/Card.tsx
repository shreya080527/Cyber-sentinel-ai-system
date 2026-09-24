import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle, action }) => {
  return (
    <div className={`bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md transition-all duration-200 hover:border-slate-700/80 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div>
            {title && <div className="text-lg font-bold text-slate-100 flex items-center gap-2">{title}</div>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
