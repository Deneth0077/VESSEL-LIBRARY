'use client';

import React from 'react';
import { ILoginHistory } from '@/types';
import { CheckCircle2, XCircle, Globe, Monitor } from 'lucide-react';

interface LoginHistoryTableProps {
  logins: ILoginHistory[];
}

export const LoginHistoryTable: React.FC<LoginHistoryTableProps> = ({ logins }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
          <Monitor className="w-4 h-4 text-teal-300" />
          <span>User Sign-In History</span>
        </h3>
        <span className="text-xs text-slate-300 font-mono">{logins.length} sessions logged</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">Login Time</th>
              <th className="p-3">Employee ID</th>
              <th className="p-3">Status</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Device / Failure Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logins.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                  No login history recorded yet.
                </td>
              </tr>
            ) : (
              logins.map((login) => (
                <tr key={login._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-slate-500 font-mono text-[11px]">
                    {login.loginAt ? new Date(login.loginAt).toLocaleString() : ''}
                  </td>
                  <td className="p-3 font-mono font-bold text-navy-900">{login.employeeId}</td>
                  <td className="p-3">
                    {login.success ? (
                      <span className="inline-flex items-center gap-1 text-teal-700 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" /> Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-bold">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" /> Failed
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-600">{login.ipAddress || '127.0.0.1'}</td>
                  <td className="p-3 text-slate-600 truncate max-w-xs">
                    {login.success ? (
                      <span className="text-slate-500 text-[11px] truncate block">{login.userAgent || 'Web Browser'}</span>
                    ) : (
                      <span className="text-rose-600 font-semibold">{login.failureReason || 'Auth failed'}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoginHistoryTable;
