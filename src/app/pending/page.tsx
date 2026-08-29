'use client';

import React from 'react';
import Link from 'next/link';
import { AppLogo } from '@/components/ui/AppLogo';
import { Clock, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';

export default function PendingPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal border border-slate-200 p-6 sm:p-8 space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
          <Clock className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-navy-900">Registration Pending Approval</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Your account registration has been submitted successfully. For security compliance, an administrator must review and approve your Employee account before access to vessel documentation is granted.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1.5 font-sans">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Account Status:</span>
            <span className="font-bold text-amber-700 uppercase bg-amber-100 px-2 py-0.5 rounded">PENDING</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Approval Policy:</span>
            <span className="font-semibold text-slate-800">Administrator Verification Required</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Approval Status</span>
          </button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-navy-900 py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login Screen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
