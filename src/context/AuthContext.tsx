'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { IUser } from '@/types';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => { },
  refreshUser: async () => { },
});

const PUBLIC_ROUTES = ['/login', '/register', '/pending', '/admin/login', '/install'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  // Initialize with null to match SSR exactly and eliminate Hydration errors
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUser = useCallback(async () => {
    if (PUBLIC_ROUTES.includes(pathname)) {
      setUser(null);
      setLoading(false);
      try {
        sessionStorage.removeItem('vessel_auth_user');
      } catch (e) { }
      return;
    }

    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data?.authenticated && data?.user) {
          setUser(data.user);
          try {
            sessionStorage.setItem('vessel_auth_user', JSON.stringify(data.user));
          } catch (e) { }
        } else {
          setUser(null);
          try {
            sessionStorage.removeItem('vessel_auth_user');
          } catch (e) { }
          if (!PUBLIC_ROUTES.includes(pathname)) {
            router.push('/login');
          }
        }
      } else {
        setUser(null);
        try {
          sessionStorage.removeItem('vessel_auth_user');
        } catch (e) { }
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push('/login');
        }
      }
    } catch (err) {
      console.error('Error verifying user session:', err);
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    // Safely hydrate cached user on client mount without triggering SSR mismatch
    try {
      const stored = sessionStorage.getItem('vessel_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
        setLoading(false);
      }
    } catch (e) {}

    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Error during logout:', e);
    } finally {
      setUser(null);
      try {
        sessionStorage.removeItem('vessel_auth_user');
      } catch (e) { }
      window.location.href = '/login';
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

