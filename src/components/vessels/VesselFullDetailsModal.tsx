'use client';

import React, { useState, useEffect } from 'react';
import { IVessel, IVesselEntry, IUser, SectionType } from '@/types';
import { PhotoGallery } from './PhotoGallery';
import { X, Printer, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface VesselFullDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessel: IVessel;
  currentUser: IUser | null;
}

export const VesselFullDetailsModal: React.FC<VesselFullDetailsModalProps> = ({
  isOpen,
  onClose,
  vessel,
  currentUser,
}) => {
  const [entries, setEntries] = useState<Record<SectionType, IVesselEntry[]>>({
    STRUCTURE: [],
    STRUCTURAL_DAMAGE: [],
    OPERATIONAL_CHALLENGE: [],
    SPECIAL_NOTE: [],
    REMARK: [],
  });
  const [loading, setLoading] = useState(false);
  // Prevent background body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sectionConfigs: { key: SectionType; code: string; title: string }[] = [
    { key: 'STRUCTURE', code: 'SECTION 2.0', title: 'VESSEL STRUCTURE' },
    { key: 'STRUCTURAL_DAMAGE', code: 'SECTION 3.0', title: 'VESSEL STRUCTURAL DAMAGES' },
    { key: 'OPERATIONAL_CHALLENGE', code: 'SECTION 4.0', title: 'OPERATIONAL CHALLENGES' },
    { key: 'SPECIAL_NOTE', code: 'SECTION 5.0', title: 'SPECIAL NOTES' },
    { key: 'REMARK', code: 'SECTION 6.0', title: 'REMARKS' },
  ];

  const fetchAllSectionEntries = async () => {
    try {
      setLoading(true);
      const newEntries: Record<SectionType, IVesselEntry[]> = {
        STRUCTURE: [],
        STRUCTURAL_DAMAGE: [],
        OPERATIONAL_CHALLENGE: [],
        SPECIAL_NOTE: [],
        REMARK: [],
      };

      for (const config of sectionConfigs) {
        const res = await fetch(`/api/vessels/${vessel._id}/entries?section=${config.key}`);
        if (res.ok) {
          const data = await res.json();
          newEntries[config.key] = data.entries || [];
        }
      }

      setEntries(newEntries);
    } catch (err) {
      console.error('Error loading full vessel dossier entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && vessel._id) {
      fetchAllSectionEntries();
    }
  }, [isOpen, vessel._id]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalEntriesCount = Object.values(entries).reduce((acc, list) => acc + list.length, 0);
  const totalPhotosCount = (vessel.mainPhotographs?.length || 0) +
    Object.values(entries).reduce((acc, list) => acc + list.reduce((sum, item) => sum + (item.photographs?.length || 0), 0), 0);

  const currentDateFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 md:p-8 animate-in fade-in duration-150">
      {/* Executive Report Modal Box */}
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[94vh] font-sans my-auto">
        
        {/* Standard Executive Document Header */}
        <div className="bg-navy-900 text-white p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-ocean-500/20 text-ocean-300 border border-ocean-400/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                OFFICIAL TECHNICAL DOSSIER
              </span>
              <span className="text-slate-400 text-xs font-mono">• Generated {currentDateFormatted}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white font-sans">
              {vessel.vesselName}
            </h1>
            <p className="text-xs text-slate-300 font-medium mt-1 font-mono">
              IMO: <strong className="text-white">{vessel.imoNumber}</strong> | TYPE: <strong className="text-white">{vessel.vesselType}</strong> | FLAG: <strong className="text-white">{vessel.flag}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs transition-all border border-white/20 cursor-pointer min-h-[42px]"
              title="Print or Save PDF Report"
            >
              <Printer className="w-4 h-4 text-slate-200" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white transition-all border border-white/20 cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
              aria-label="Close dossier modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Executive Metadata Sub-Header */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 font-medium shrink-0">
          <div className="flex items-center gap-4">
            <span>Total Technical Entries: <strong className="text-navy-900 font-bold">{totalEntriesCount}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Total Photographs: <strong className="text-navy-900 font-bold">{totalPhotosCount}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Call Sign: <strong className="text-navy-900 font-mono font-bold">{vessel.callSign}</strong></span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded border border-emerald-300/60">
            <CheckCircle className="w-3.5 h-3.5" />
            Verified Profile Record
          </span>
        </div>

        {/* Dossier Report Main Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-8 flex-1 bg-slate-50">
          
          {/* SECTION 1.0: BASIC INFORMATION & SPECIFICATIONS */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
            <div className="bg-navy-800 text-white px-5 py-3 flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-widest font-mono">
                SECTION 1.0 - BASIC INFORMATION & TECHNICAL SPECIFICATIONS
              </h2>
              <span className="text-[10px] font-mono text-slate-300">VESSEL SPEC SHEET</span>
            </div>

            {/* Structured Specifications Grid */}
            <div className="divide-y divide-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50/50">
                <div className="p-4 border-r border-b sm:border-b-0 border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">VESSEL NAME</span>
                  <span className="font-extrabold text-navy-900 text-base uppercase block mt-1">{vessel.vesselName}</span>
                </div>

                <div className="p-4 border-r border-b sm:border-b-0 border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">IMO NUMBER</span>
                  <span className="font-mono font-bold text-navy-900 text-base block mt-1">{vessel.imoNumber}</span>
                </div>

                <div className="p-4 border-r border-b sm:border-b-0 border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">VESSEL TYPE</span>
                  <span className="font-semibold text-slate-900 text-sm block mt-1">{vessel.vesselType}</span>
                </div>

                <div className="p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">FLAG STATE</span>
                  <span className="font-semibold text-slate-900 text-sm block mt-1">{vessel.flag}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 bg-white">
                <div className="p-4 border-r border-b sm:border-b-0 border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">SHIPPING LINE</span>
                  <span className="font-medium text-slate-800 text-xs block mt-1">{vessel.ownerOperator}</span>
                </div>

                <div className="p-4 border-r border-b sm:border-b-0 border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">CALL SIGN</span>
                  <span className="font-mono font-semibold text-slate-800 text-xs block mt-1">{vessel.callSign}</span>
                </div>

                <div className="p-4 border-r border-b sm:border-b-0 border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">YEAR BUILT</span>
                  <span className="font-semibold text-slate-800 text-xs block mt-1">{vessel.yearBuilt}</span>
                </div>

                <div className="p-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">STATUS</span>
                  <span className="inline-flex items-center text-xs font-bold text-teal-700 mt-1">
                    Active Registered Profile
                  </span>
                </div>
              </div>

              {/* Technical Dimensions Sub-Grid */}
              {(vessel.loa || vessel.beam || vessel.keelToDeck || vessel.numberOfBays || vessel.numberOfRows || vessel.lashingBridges) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50/70 p-4 gap-3 border-t border-slate-200">
                  {vessel.loa && (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">LOA (LENGTH OVER ALL)</span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block">{vessel.loa}</span>
                    </div>
                  )}
                  {vessel.beam && (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">BEAM</span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block">{vessel.beam}</span>
                    </div>
                  )}
                  {vessel.keelToDeck && (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">KEEL TO DECK LENGTH</span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block">{vessel.keelToDeck}</span>
                    </div>
                  )}
                  {vessel.numberOfBays && (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">NUMBER OF BAYS</span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block">{vessel.numberOfBays}</span>
                    </div>
                  )}
                  {vessel.numberOfRows && (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">NUMBER OF ROWS</span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block">{vessel.numberOfRows}</span>
                    </div>
                  )}
                  {vessel.lashingBridges && (
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">LASHING BRIDGES</span>
                      <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                        {vessel.lashingBridges} {vessel.lashingBridgeHeight ? `(${vessel.lashingBridgeHeight})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Specs & Notes */}
            {vessel.basicInformation && (
              <div className="p-5 bg-red-50/90 border-t border-red-200 border-l-4 border-l-red-600 space-y-1">
                <span className="text-[10px] font-extrabold text-red-700 uppercase tracking-widest block font-mono flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  <span>ADDITIONAL SPECIFICATIONS & NOTES</span>
                </span>
                <p className="text-xs sm:text-sm text-red-900 font-bold whitespace-pre-wrap leading-relaxed">{vessel.basicInformation}</p>
              </div>
            )}

            {/* Main Vessel Photographs */}
            {vessel.mainPhotographs && vessel.mainPhotographs.length > 0 && (
              <div className="p-5 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 font-mono">
                  MAIN VESSEL PHOTOGRAPHS ({vessel.mainPhotographs.length})
                </span>
                <PhotoGallery photos={vessel.mainPhotographs} title="Main Vessel Photographs" />
              </div>
            )}
          </div>

          {/* SECTIONS 2.0 TO 6.0 */}
          {loading ? (
            <div className="py-12 bg-white rounded-xl border border-slate-300 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-navy-800" />
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                Compiling technical dossier sections...
              </span>
            </div>
          ) : (
            sectionConfigs.map((config) => {
              const sectionEntriesList = entries[config.key] || [];

              return (
                <div
                  key={config.key}
                  className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden"
                >
                  <div className="bg-slate-100 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-navy-800 uppercase tracking-widest block">
                        {config.code}
                      </span>
                      <h3 className="font-extrabold text-navy-900 text-sm uppercase tracking-tight font-sans">
                        {config.title}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200">
                      {sectionEntriesList.length} {sectionEntriesList.length === 1 ? 'RECORD' : 'RECORDS'}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    {sectionEntriesList.length === 0 ? (
                      <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center">
                        <p className="text-xs text-slate-400 font-mono">No records filed under {config.title.toLowerCase()}.</p>
                      </div>
                    ) : (
                      sectionEntriesList.map((entry, idx) => {
                        const createdDate = entry.createdAt
                          ? new Date(entry.createdAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : '';

                        return (
                          <div
                            key={entry._id}
                            className="bg-slate-50/80 rounded-lg border border-slate-200 p-4 space-y-3"
                          >
                            <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200 pb-2">
                              <span className="font-mono font-bold text-navy-900 uppercase">
                                RECORD LOG #{idx + 1}
                              </span>
                              <span>
                                Filed by <strong className="text-navy-900">{entry.createdByName || 'Unknown'}</strong> ({createdDate})
                              </span>
                            </div>

                            <p className="text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans">
                              {entry.text}
                            </p>

                            {entry.solution && (
                              <div className="p-3 bg-teal-50 border-l-4 border-l-teal-600 rounded-r-lg text-xs space-y-1">
                                <span className="font-mono font-extrabold text-teal-900 uppercase tracking-widest text-[10px] block">
                                  SOLUTION / CORRECTIVE ACTION TAKEN
                                </span>
                                <p className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                                  {entry.solution}
                                </p>
                              </div>
                            )}

                            {entry.photographs && entry.photographs.length > 0 && (
                              <div className="pt-2 border-t border-slate-200">
                                <PhotoGallery photos={entry.photographs} />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dossier Document Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 sm:px-7 py-3 flex items-center justify-between gap-4 shrink-0">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            VESSEL LIBRARY System • Official Technical Dossier
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 active:scale-95 text-white font-bold text-xs transition-all shadow-xs min-h-[42px] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF Dossier</span>
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs transition-all border border-slate-300 min-h-[42px] cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VesselFullDetailsModal;
