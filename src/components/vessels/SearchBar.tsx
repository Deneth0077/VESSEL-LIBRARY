'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IVessel } from '@/types';
import { Search, X, Ship, ArrowRight, Flag, Radio } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  vessels?: IVessel[];
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  vessels = [],
  placeholder = 'Search vessel name, IMO number, call sign...',
  className = '',
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter matching vessels based on input value
  const queryLower = value.trim().toLowerCase();
  const matchingVessels = queryLower
    ? vessels.filter(
        (v) =>
          v.vesselName.toLowerCase().includes(queryLower) ||
          (v.imoNumber && v.imoNumber.toLowerCase().includes(queryLower)) ||
          (v.callSign && v.callSign.toLowerCase().includes(queryLower)) ||
          (v.vesselType && v.vesselType.toLowerCase().includes(queryLower)) ||
          (v.flag && v.flag.toLowerCase().includes(queryLower))
      ).slice(0, 6) // Show top 6 instant matches
    : [];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || matchingVessels.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < matchingVessels.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : matchingVessels.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < matchingVessels.length) {
        e.preventDefault();
        const selectedVessel = matchingVessels[selectedIndex];
        router.push(`/vessels/${selectedVessel._id}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectVessel = (vesselId: string) => {
    setIsOpen(false);
    router.push(`/vessels/${vesselId}`);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5 text-ocean-600" />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-10 py-3.5 bg-white text-navy-900 border border-slate-300 rounded-2xl shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-navy-600 focus:border-navy-600 font-sans text-base transition-all min-h-[52px]"
        />

        {value && (
          <button
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Instant Autocomplete Suggestions Dropdown */}
      {isOpen && queryLower && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150 text-left font-sans">
          {matchingVessels.length > 0 ? (
            <div>
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  MATCHING VESSEL PROFILES ({matchingVessels.length})
                </span>
                <span className="text-[10px] text-ocean-600 font-semibold">Press Enter to select</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                {matchingVessels.map((vessel, idx) => {
                  const isSelected = idx === selectedIndex;
                  const firstPhoto = vessel.mainPhotographs && vessel.mainPhotographs.length > 0 ? vessel.mainPhotographs[0].url : null;

                  return (
                    <div
                      key={vessel._id}
                      onClick={() => handleSelectVessel(vessel._id)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3.5 flex items-center gap-3.5 cursor-pointer transition-colors ${
                        isSelected ? 'bg-ocean-50/80 border-l-4 border-l-ocean-600' : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Vessel Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-navy-800">
                        {firstPhoto ? (
                          <img src={firstPhoto} alt={vessel.vesselName} className="w-full h-full object-cover" />
                        ) : (
                          <Ship className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      {/* Vessel Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-navy-900 text-sm uppercase tracking-tight truncate">
                            {vessel.vesselName}
                          </h4>
                          {vessel.imoNumber && (
                            <span className="bg-ocean-100 text-ocean-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-ocean-200">
                              #{vessel.imoNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-0.5 truncate">
                          <span>{vessel.vesselType}</span>
                          {vessel.flag && (
                            <span className="flex items-center gap-1">
                              <Flag className="w-3 h-3 text-slate-400" />
                              <span>{vessel.flag}</span>
                            </span>
                          )}
                          {vessel.callSign && (
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Radio className="w-3 h-3 text-slate-400" />
                              <span>{vessel.callSign}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <ArrowRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-ocean-600 translate-x-1' : 'text-slate-300'}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 space-y-1">
              <Ship className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No vessels matching &quot;{value}&quot;</p>
              <p className="text-[11px] text-slate-400">Check spelling or create a new vessel profile.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
