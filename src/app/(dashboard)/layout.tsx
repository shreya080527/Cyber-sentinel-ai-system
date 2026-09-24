import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserRole } from '@/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const sessionUser = {
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role as UserRole,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={sessionUser} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar role={sessionUser.role} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
