'use client';

import React from 'react';
import { IAuditLog } from '@/types';
import { Shield, Clock, User, Tag } from 'lucide-react';

interface AuditLogTableProps {
  logs: IAuditLog[];
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ logs }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
        <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-ocean-300" />
          <span>System Audit Trail</span>
        </h3>
        <span className="text-xs text-slate-300 font-mono">{logs.length} events logged</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Action</th>
              <th className="p-3">Target</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                  No audit logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-slate-500 font-mono text-[11px]">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : ''}
                  </td>
                  <td className="p-3 font-semibold text-navy-900">{log.userName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.userRole === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {log.userRole}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-ocean-700 font-semibold">{log.action}</td>
                  <td className="p-3 text-slate-700">{log.target || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogTable;
