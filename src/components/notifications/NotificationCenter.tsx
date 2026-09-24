'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { NotificationItem } from '@/types';

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Notification error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-300 hover:text-cyan-400 rounded-lg hover:bg-slate-800/80 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-semibold text-slate-200">Security Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading alerts...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500/40" />
                No security notifications yet
              </div>
            ) : (
              notifications.map((item) => {
                const isHighRisk = item.type === 'HIGH_RISK_DETECTED';
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 text-xs transition-colors flex items-start gap-3 ${
                      !item.read ? 'bg-slate-800/40' : 'bg-transparent'
                    }`}
                  >
                    <div className="mt-0.5">
                      {isHighRisk ? (
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-slate-300 ${!item.read ? 'font-medium text-slate-100' : ''}`}>
                        {item.message}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        {new Date(item.createdDate).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
