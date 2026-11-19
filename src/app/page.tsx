'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { IVessel } from '@/types';
import { SearchBar } from '@/components/vessels/SearchBar';
import { VesselCard } from '@/components/vessels/VesselCard';
import { Plus, Ship, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getCachedVessels, setCachedVessels, isCacheFresh } from '@/lib/cache/vesselCache';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize state with clean defaults matching SSR
  const [vessels, setVessels] = useState<IVessel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchVessels = useCallback(async (queryStr: string = '') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/vessels?q=${encodeURIComponent(queryStr)}`);
      if (res.ok) {
        const data = await res.json();
        const list: IVessel[] = data.vessels || [];
        setVessels(list);
        if (!queryStr.trim()) {
          setCachedVessels(list);
        }
      }
    } catch (err) {
      console.error('Error loading vessels:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: safely hydrate from cache on mount without SSR mismatch
  useEffect(() => {
    const cached = getCachedVessels();
    if (cached && cached.length > 0) {
      setVessels(cached);
      setLoading(false);
    }
    if (!isCacheFresh()) {
      fetchVessels('');
    }
  }, [fetchVessels]);

  // Fast search handling: instantaneous client-side filter + debounced server query
  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      const cached = getCachedVessels();
      if (cached) {
        setVessels(cached);
        setLoading(false);
      } else {
        fetchVessels('');
      }
      return;
    }

    // Debounce server query for active search typing
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchVessels(trimmed);
    }, 200);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, fetchVessels]);

  // Coordinated Initial Load: Wait until data is ready so the entire page renders all at once
  if (authLoading || (loading && vessels.length === 0)) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center space-y-4 font-sans animate-in fade-in duration-150">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white flex items-center justify-center shadow-lg">
            <Ship className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="absolute -bottom-1 -right-1">
            <Loader2 className="w-5 h-5 text-ocean-600 animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-extrabold text-navy-900 tracking-wider uppercase">VESSEL LIBRARY</h2>
          <p className="text-xs text-slate-500 font-medium">Loading Maritime Fleet System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans animate-in fade-in duration-200">
      {/* Primary Uncluttered Hero Search Section */}
      <div className="max-w-3xl mx-auto text-center space-y-5">
        <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-navy-900 text-white shadow-md">
          <Ship className="w-10 h-10 stroke-[2]" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-navy-900 tracking-tight uppercase">
            VESSEL LIBRARY
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Search by vessel name or IMO number to access technical documentation.
          </p>
        </div>

        {/* Prominent Search Bar */}
        <div className="pt-2">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            vessels={vessels}
            placeholder="Search vessel name, IMO number, call sign..."
          />
        </div>

        {/* Action Button: New Vessel Profile */}
        <div className="pt-2 flex items-center justify-center gap-4">
          <Link
            href="/vessels/new"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-navy-800 hover:bg-navy-900 active:scale-98 text-white font-bold text-sm shadow-md transition-all min-h-[48px] w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            <span>New Vessel Profile</span>
          </Link>
        </div>
      </div>

      {/* Vessel Search Results Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {searchQuery ? `Search Results (${vessels.length})` : `Fleet Directory (${vessels.length})`}
          </h2>
          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-ocean-600 font-semibold animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating fleet...</span>
            </div>
          )}
        </div>

        {vessels.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <Ship className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-navy-800">No vessels found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No vessel matched "${searchQuery}". Try searching by IMO number or create a new vessel profile.`
                : 'No vessel profiles registered in the system yet.'}
            </p>
            <div className="pt-2">
              <Link
                href="/vessels/new"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-800 text-white font-bold text-xs shadow-sm hover:bg-navy-900 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Vessel Profile</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vessels.map((vessel) => (
              <VesselCard key={vessel._id} vessel={vessel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
