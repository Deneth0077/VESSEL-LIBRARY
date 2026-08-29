'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLogo } from '@/components/ui/AppLogo';
import { Shield, KeyRound, User, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !pin) {
      setError('Please enter your Employee ID and 4-digit PIN.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: employeeId.trim(), pin: pin.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.message.includes('pending')) {
          router.push('/pending');
          return;
        }
        setError(data.message || 'Invalid Employee ID or PIN');
        return;
      }

      window.location.href = '/';
    } catch (err: any) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-modal border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center">
          <AppLogo className="mb-2" />
          <p className="text-xs text-slate-500 font-medium">Fleet Vessel Technical Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Employee ID
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                placeholder="e.g. EMP001"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 font-mono font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[48px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              4-Digit PIN
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 font-mono font-bold tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[48px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            <span>{loading ? 'Authenticating...' : 'Sign In to Vessel Library'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex flex-col items-center gap-3 text-xs text-slate-600">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-ocean-600 hover:underline">
              Register New Account
            </Link>
          </p>
          <p className="text-[11px] text-slate-400">
            Administrator login?{' '}
            <Link href="/admin/login" className="font-semibold text-slate-600 hover:underline">
              Admin Login Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
