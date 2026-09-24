'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import {
  Users,
  Search,
  UserPlus,
  Trash2,
  Edit,
  Shield,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { AdminUserItem, UserRole, UserStatus } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('registered_user');
  const [newStatus, setNewStatus] = useState<UserStatus>('ACTIVE');
  const [newPhone, setNewPhone] = useState('');
  const [savingNew, setSavingNew] = useState(false);

  // Edit user form state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('registered_user');
  const [editStatus, setEditStatus] = useState<UserStatus>('ACTIVE');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNew(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          status: newStatus,
          phone: newPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create user.');
      } else {
        setMessage(`User "${newName}" successfully created.`);
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        setNewPassword('');
        setNewPhone('');
        fetchUsers();
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setSavingNew(false);
    }
  };

  const openEditModal = (u: AdminUserItem) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditRole(u.role);
    setEditStatus(u.status);
    setEditPhone(u.phone || '');
    setEditPassword('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSavingEdit(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          name: editName,
          role: editRole,
          status: editStatus,
          phone: editPhone,
          newPassword: editPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update user.');
      } else {
        setMessage(`User "${editName}" updated successfully.`);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteUser = async (u: AdminUserItem) => {
    if (!confirm(`Are you sure you want to permanently delete user "${u.name}" (${u.email})?`)) return;

    try {
      const res = await fetch(`/api/admin/users?id=${u.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to delete user.');
      } else {
        setMessage(`User "${u.name}" deleted.`);
        fetchUsers();
      }
    } catch (err) {
      setError('Connection failure.');
    }
  };

  const getRoleTag = (role: string) => {
    switch (role) {
      case 'administrator':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">ADMIN</span>;
      case 'cybersecurity_analyst':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">ANALYST</span>;
      case 'senior_citizen':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">SENIOR</span>;
      case 'student_user':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">STUDENT</span>;
      case 'registered_user':
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">REGISTERED</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" /> User Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">User Accounts & Roles Management</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create, modify, activate/deactivate, and assign role privileges across all system users.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/20 flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">All Roles</option>
                <option value="registered_user">Registered User</option>
                <option value="student_user">Student User</option>
                <option value="senior_citizen">Senior Citizen</option>
                <option value="cybersecurity_analyst">Cybersecurity Analyst</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <button
              onClick={fetchUsers}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card
        title={
          <span className="flex items-center gap-2 text-slate-200 font-bold">
            <Users className="w-5 h-5 text-rose-400" /> Platform Users Directory ({users.length})
          </span>
        }
      >
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading user accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No users match your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3 px-3">User</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Activity Volume</th>
                  <th className="pb-3 px-3">Joined Date</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>

                    <td className="py-3 px-3">{getRoleTag(u.role)}</td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {u._count ? (
                        <span>
                          {u._count.urlChecks + u._count.scamReports + u._count.phoneCallChecks} Scans / {u._count.reportedIncidents} Incidents
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Edit User & Permissions"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-rose-400" /> Create New Platform User
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Dana Scully"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Initial Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Assign Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="registered_user">Registered User</option>
                    <option value="student_user">Student User</option>
                    <option value="senior_citizen">Senior Citizen</option>
                    <option value="cybersecurity_analyst">Cybersecurity Analyst</option>
                    <option value="administrator">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Account Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as UserStatus)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-rose-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingNew}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50 mt-4"
              >
                <span>{savingNew ? 'Creating...' : 'Create Account'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-cyan-400" /> Modify User: {editingUser.name}
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Role Privilege</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="registered_user">Registered User</option>
                    <option value="student_user">Student User</option>
                    <option value="senior_citizen">Senior Citizen</option>
                    <option value="cybersecurity_analyst">Cybersecurity Analyst</option>
                    <option value="administrator">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Status (Access Toggle)</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                    className="w-full px-2.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ACTIVE">ACTIVE (Granted)</option>
                    <option value="INACTIVE">INACTIVE (Disabled)</option>
                    <option value="SUSPENDED">SUSPENDED (Locked)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Telephone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-slate-300 mb-1 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-cyan-400" /> Reset Password (Optional)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave empty to retain existing password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingEdit}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50 mt-4"
              >
                <span>{savingEdit ? 'Saving Changes...' : 'Save User Updates'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
