'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IUser, IAuditLog, ILoginHistory } from '@/types';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { AuditLogTable } from '@/components/admin/AuditLogTable';
import { LoginHistoryTable } from '@/components/admin/LoginHistoryTable';
import { ExportButton } from '@/components/ui/ExportButton';
import { Users, Ship, ShieldAlert, CheckCircle, Clock, Shield, Monitor, FileSpreadsheet, Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [vesselsCount, setVesselsCount] = useState<number>(0);
  const [auditLogs, setAuditLogs] = useState<IAuditLog[]>([]);
  const [loginHistory, setLoginHistory] = useState<ILoginHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'loginHistory'>('users');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Verify current user admin role
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/admin/login');
        return;
      }
      const meData = await meRes.json();
      if (meData?.user?.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      setCurrentUser(meData.user);

      // Fetch users
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      // Fetch vessels count
      const vesselsRes = await fetch('/api/vessels');
      if (vesselsRes.ok) {
        const vesselsData = await vesselsRes.json();
        setVesselsCount(vesselsData.count || 0);
      }

      // Fetch audit logs & login history
      const auditRes = await fetch('/api/audit?type=audit');
      if (auditRes.ok) {
        const auditData = await auditRes.json();
        setAuditLogs(auditData.auditLogs || []);
      }

      const loginRes = await fetch('/api/audit?type=login');
      if (loginRes.ok) {
        const loginData = await loginRes.json();
        setLoginHistory(loginData.logins || []);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (id: string) => {
    await fetch(`/api/users/${id}/approve`, { method: 'PATCH' });
    await fetchDashboardData();
  };

  const handleDeny = async (id: string) => {
    await fetch(`/api/users/${id}/deny`, { method: 'PATCH' });
    await fetchDashboardData();
  };

  const handleSuspend = async (id: string) => {
    await fetch(`/api/users/${id}/suspend`, { method: 'PATCH' });
    await fetchDashboardData();
  };

  const handleReactivate = async (id: string) => {
    await fetch(`/api/users/${id}/reactivate`, { method: 'PATCH' });
    await fetchDashboardData();
  };

  const pendingCount = users.filter((u) => u.status === 'PENDING').length;
  const approvedCount = users.filter((u) => u.status === 'APPROVED').length;
  const suspendedCount = users.filter((u) => u.status === 'SUSPENDED').length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-navy-700" />
        <span className="text-sm font-semibold text-slate-600">Loading System Administration...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-navy-900 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-ocean-300" />
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight font-sans">
              System Admin Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Logged in as <strong className="text-white">{currentUser?.fullName}</strong> ({currentUser?.employeeId})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton variant="secondary" />
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-ocean-50 text-ocean-600">
            <Ship className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-navy-900 block leading-none">{vesselsCount}</span>
            <span className="text-xs font-medium text-slate-500 mt-1 block">Total Vessels</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-amber-700 block leading-none">{pendingCount}</span>
            <span className="text-xs font-medium text-slate-500 mt-1 block">Pending Approvals</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-teal-50 text-teal-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-teal-700 block leading-none">{approvedCount}</span>
            <span className="text-xs font-medium text-slate-500 mt-1 block">Active Users</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-extrabold text-slate-700 block leading-none">{suspendedCount}</span>
            <span className="text-xs font-medium text-slate-500 mt-1 block">Suspended Users</span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 min-h-[44px] ${
            activeTab === 'users'
              ? 'border-navy-800 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-navy-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Approvals & Control</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 min-h-[44px] ${
            activeTab === 'audit'
              ? 'border-navy-800 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-navy-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>System Audit Log</span>
        </button>

        <button
          onClick={() => setActiveTab('loginHistory')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 min-h-[44px] ${
            activeTab === 'loginHistory'
              ? 'border-navy-800 text-navy-900'
              : 'border-transparent text-slate-500 hover:text-navy-800'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Sign-In Audit History</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'users' && (
          <UserManagementTable
            users={users}
            onApprove={handleApprove}
            onDeny={handleDeny}
            onSuspend={handleSuspend}
            onReactivate={handleReactivate}
          />
        )}

        {activeTab === 'audit' && <AuditLogTable logs={auditLogs} />}

        {activeTab === 'loginHistory' && <LoginHistoryTable logins={loginHistory} />}
      </div>
    </div>
  );
}
