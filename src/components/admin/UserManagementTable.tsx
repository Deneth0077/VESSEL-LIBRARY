'use client';

import React, { useState } from 'react';
import { IUser } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckCircle, XCircle, Ban, RefreshCw, UserCheck, Search } from 'lucide-react';

interface UserManagementTableProps {
  users: IUser[];
  onApprove: (userId: string) => Promise<void>;
  onDeny: (userId: string) => Promise<void>;
  onSuspend: (userId: string) => Promise<void>;
  onReactivate: (userId: string) => Promise<void>;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  onApprove,
  onDeny,
  onSuspend,
  onReactivate,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAction = async (userId: string, actionFn: (id: string) => Promise<void>) => {
    try {
      setActionLoading(userId);
      await actionFn(userId);
    } catch (err) {
      console.error('Error executing user action:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'APPROVED', 'DENIED', 'SUSPENDED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap min-h-[36px] ${
                filterStatus === status
                  ? 'bg-navy-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'All Users' : status}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-sans text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-600"
          />
        </div>
      </div>

      {/* Responsive Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900 text-white uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="p-3.5">User Info</th>
                <th className="p-3.5">Employee ID</th>
                <th className="p-3.5">Registration Date</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Last Login</th>
                <th className="p-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                    No matching users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-navy-900 text-sm">{user.fullName}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{user.email}</div>
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-ocean-700">{user.employeeId}</td>
                    <td className="p-3.5 text-slate-600">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={user.status} />
                      {user.approvedBy && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          By {user.approvedBy} on {user.approvedAt ? new Date(user.approvedAt).toLocaleDateString() : ''}
                        </div>
                      )}
                      {user.deniedBy && (
                        <div className="text-[10px] text-rose-500 mt-1">
                          Denied by {user.deniedBy}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {user.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAction(user._id, onApprove)}
                            disabled={actionLoading === user._id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-teal-500 hover:bg-teal-600 text-white font-bold transition-colors min-h-[36px]"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleAction(user._id, onDeny)}
                            disabled={actionLoading === user._id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors min-h-[36px]"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Deny</span>
                          </button>
                        </>
                      )}

                      {user.status === 'APPROVED' && user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleAction(user._id, onSuspend)}
                          disabled={actionLoading === user._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-700 hover:bg-slate-800 text-white font-bold transition-colors min-h-[36px]"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      )}

                      {(user.status === 'SUSPENDED' || user.status === 'DENIED') && (
                        <button
                          onClick={() => handleAction(user._id, onReactivate)}
                          disabled={actionLoading === user._id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-ocean-600 hover:bg-ocean-700 text-white font-bold transition-colors min-h-[36px]"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reactivate</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementTable;
