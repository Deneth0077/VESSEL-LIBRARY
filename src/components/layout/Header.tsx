'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { AppLogo } from '@/components/ui/AppLogo';
import { ExportButton } from '@/components/ui/ExportButton';
import { Plus, Shield, LogOut, LogIn, User, Menu, X, ChevronDown, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { IUser } from '@/types';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<IUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (['/login', '/register', '/pending', '/admin/login'].includes(pathname)) {
      setUser(null);
      return;
    }

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/login';
  };

  const isAuthPage = ['/login', '/register', '/admin/login'].includes(pathname);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <AppLogo />

        {/* Desktop Navigation */}
        {!isAuthPage && (
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link
                  href="/vessels/new"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-900 active:scale-95 text-white font-bold text-xs shadow-xs transition-all min-h-[40px] whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>New Vessel</span>
                </Link>

                <ExportButton variant="outline" />

                {user.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-ocean-50 text-ocean-700 hover:bg-ocean-100 active:scale-95 font-bold text-xs transition-all border border-ocean-200 min-h-[40px] whitespace-nowrap"
                  >
                    <Shield className="w-4 h-4 text-ocean-600" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <div className="h-5 w-px bg-slate-200 mx-1" />

                {/* Interactive Logged-in User Profile Dropdown Pill */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer min-h-[40px]"
                  >
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-navy-800 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-extrabold text-navy-900 leading-tight flex items-center gap-1">
                        {user.fullName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">
                        {user.employeeId} • <span className="font-bold text-ocean-700">{user.role}</span>
                      </span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu Card */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-navy-900 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-extrabold text-navy-900 text-sm truncate">{user.fullName}</h4>
                            <p className="text-xs text-slate-500 font-mono truncate">{user.email || user.employeeId}</p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Active Approved Account
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Options */}
                      <div className="p-2 space-y-1">
                        <Link
                          href="/vessels/new"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-navy-900 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-navy-700" />
                          <span>Create Vessel Profile</span>
                        </Link>

                        {user.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-ocean-700 hover:bg-ocean-50 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-ocean-600" />
                            <span>System Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      {/* Logout Action */}
                      <div className="p-2 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" />
                          <span>Log Out ({user.employeeId})</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Direct 1-Click Logout Button on Header */}
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-bold text-xs border border-rose-200 transition-all cursor-pointer min-h-[40px] whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-900 active:scale-95 text-white font-bold text-xs shadow-xs transition-all min-h-[40px] whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        )}

        {/* Mobile Menu Toggle */}
        {!isAuthPage && (
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:text-navy-900 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200 active:scale-95 transition-all"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && !isAuthPage && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {user ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 mb-3">
                <div className="w-10 h-10 rounded-full bg-navy-900 text-white font-extrabold flex items-center justify-center text-sm shadow-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="font-extrabold text-navy-900 text-sm">{user.fullName}</div>
                  <div className="text-xs text-slate-500 font-mono">{user.employeeId} • {user.role}</div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-0.5">
                    ● Active Approved Account
                  </span>
                </div>
              </div>

              <Link
                href="/vessels/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-navy-800 active:scale-98 text-white font-bold text-sm min-h-[46px] shadow-sm"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>New Vessel Profile</span>
              </Link>

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-ocean-50 active:scale-98 text-ocean-700 border border-ocean-200 font-bold text-sm min-h-[46px]"
                >
                  <Shield className="w-5 h-5 text-ocean-600" />
                  <span>Admin Dashboard</span>
                </Link>
              )}

              <div className="pt-1">
                <ExportButton variant="outline" className="w-full justify-center min-h-[46px]" />
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-rose-700 bg-rose-50 active:scale-98 border border-rose-200 font-bold text-sm min-h-[46px] cursor-pointer"
              >
                <LogOut className="w-5 h-5 text-rose-600" />
                <span>Log Out ({user.employeeId})</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-navy-800 text-white font-bold text-sm min-h-[46px]"
            >
              <LogIn className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
