import React from 'react';
import { UserStatus } from '@/types';

interface StatusBadgeProps {
  status: UserStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase();

  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
    APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
    DENIED: 'bg-rose-100 text-rose-800 border-rose-300',
    SUSPENDED: 'bg-slate-200 text-slate-700 border-slate-300',
  };

  const labels: Record<string, string> = {
    PENDING: 'Pending Approval',
    APPROVED: 'Approved',
    DENIED: 'Denied',
    SUSPENDED: 'Suspended',
  };

  const styleClass = styles[normalized] || 'bg-gray-100 text-gray-800 border-gray-300';
  const label = labels[normalized] || status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
