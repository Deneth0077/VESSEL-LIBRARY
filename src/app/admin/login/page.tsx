'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppLogo } from '@/components/ui/AppLogo';
import { ShieldCheck, Lock, UserCheck, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter administrator credentials.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid administrator credentials');
        return;
      }

      window.location.href = '/admin';
    } catch (err) {
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-navy-900 text-white rounded-2xl shadow-2xl border border-navy-700 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-xl bg-ocean-500 text-white flex items-center justify-center mb-3 shadow-lg">
            <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-xl font-extrabold tracking-wide uppercase">Admin Portal Login</h2>
          <p className="text-xs text-ocean-200 font-medium mt-1">
            Restricted System Administration Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-900/50 border border-rose-700 rounded-xl text-xs font-semibold text-rose-200 text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-ocean-200 uppercase tracking-wider mb-1.5">
              Admin Email or Employee ID
            </label>
            <div className="relative">
              <UserCheck className="w-5 h-5 absolute left-3.5 top-3.5 text-navy-400" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@vessellibrary.com"
                required
                className="w-full pl-11 pr-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder:text-navy-400 font-sans focus:outline-none focus:ring-2 focus:ring-ocean-500 min-h-[48px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ocean-200 uppercase tracking-wider mb-1.5">
              Admin Password or PIN
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-navy-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-3 bg-navy-800 border border-navy-600 rounded-xl text-white placeholder:text-navy-400 font-sans focus:outline-none focus:ring-2 focus:ring-ocean-500 min-h-[48px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-ocean-500 hover:bg-ocean-600 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            <span>{loading ? 'Authenticating Admin...' : 'Sign In to Admin Dashboard'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-navy-800 text-center text-xs text-navy-300">
          <Link href="/login" className="hover:text-white transition-colors">
            ← Return to Standard User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
