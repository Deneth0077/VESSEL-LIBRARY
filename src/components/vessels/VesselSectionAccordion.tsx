'use client';

import React, { useState, useEffect } from 'react';
import { SectionType, IVesselEntry, IUser } from '@/types';
import {
  Layers,
  ShieldAlert,
  ShieldCheck,
  Compass,
  AlertCircle,
  ClipboardList,
  Users,
  ChevronDown,
  ChevronRight,
  Plus,
  Wrench,
  Loader2,
} from 'lucide-react';
import { EntryCard } from './EntryCard';
import { EntryFormModal } from './EntryFormModal';

interface VesselSectionAccordionProps {
  vesselId: string;
  section: SectionType;
  title: string;
  currentUser: IUser | null;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const VesselSectionAccordion: React.FC<VesselSectionAccordionProps> = ({
  vesselId,
  section,
  title,
  currentUser,
  isOpen: externalIsOpen,
  onToggle,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const [entries, setEntries] = useState<IVesselEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialCategoryForModal, setInitialCategoryForModal] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IVesselEntry | null>(null);

  const iconBadges: Record<SectionType, React.ReactNode> = {
    STRUCTURE: (
      <span className="p-2.5 rounded-xl bg-ocean-50 border border-ocean-200 text-ocean-600 shadow-xs flex items-center justify-center shrink-0">
        <Layers className="w-5 h-5 stroke-[2.2]" />
      </span>
    ),
    STRUCTURAL_DAMAGE: (
      <span className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 shadow-xs flex items-center justify-center shrink-0">
        <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
      </span>
    ),
    OPERATIONAL_CHALLENGE: (
      <span className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shadow-xs flex items-center justify-center shrink-0">
        <Compass className="w-5 h-5 stroke-[2.2]" />
      </span>
    ),
    SPECIAL_NOTE: (
      <span className="p-2.5 rounded-xl bg-red-100 border border-red-300 text-red-600 shadow-xs flex items-center justify-center shrink-0">
        <AlertCircle className="w-5 h-5 stroke-[2.5] animate-pulse" />
      </span>
    ),
    REMARK: (
      <span className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 shadow-xs flex items-center justify-center shrink-0">
        <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
      </span>
    ),
    VESSEL_COORDINATION: (
      <span className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 shadow-xs flex items-center justify-center shrink-0">
        <Users className="w-5 h-5 stroke-[2.2]" />
      </span>
    ),
  };

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/vessels/${vesselId}/entries?section=${section}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error(`Failed to fetch entries for ${section}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEntries();
    }
  }, [isOpen, vesselId, section]);

  const handleSaveEntry = async (data: { 
    text: string; 
    solution?: string; 
    safetyStatus?: 'SAFE' | 'UNSAFE' | ''; 
    category?: string; 
    photographs: any[] 
  }) => {
    if (editingEntry) {
      const res = await fetch(`/api/entries/${editingEntry._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update entry');
    } else {
      const res = await fetch(`/api/vessels/${vesselId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          text: data.text,
          solution: data.solution || '',
          safetyStatus: data.safetyStatus || '',
          category: data.category || '',
          photographs: data.photographs,
        }),
      });
      if (!res.ok) throw new Error('Failed to save entry');
    }

    await fetchEntries();
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const res = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEntries(entries.filter((e) => e._id !== entryId));
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  return (
    <div id={`section-${section}`} className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden transition-all scroll-mt-20">
      {/* Accordion Header */}
      <button
        onClick={handleToggle}
        className={`w-full px-4 sm:px-5 py-4 flex items-center justify-between transition-colors text-left focus:outline-none min-h-[60px] ${
          isOpen ? 'bg-slate-50 border-b border-slate-200' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {iconBadges[section]}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
            <h3
              className={`font-extrabold text-sm sm:text-base uppercase tracking-tight font-sans truncate ${
                section === 'SPECIAL_NOTE' ? 'text-red-600' : 'text-navy-900'
              }`}
            >
              {title}
            </h3>
            {entries.length > 0 && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shrink-0 w-fit ${
                  section === 'SPECIAL_NOTE'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : section === 'REMARK'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-ocean-50 text-ocean-700 border-ocean-200'
                }`}
              >
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-navy-800" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Accordion Content Area */}
      {isOpen && (
        <div className="p-4 sm:p-5 space-y-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className={`text-xs font-bold uppercase tracking-wider min-w-0 ${
              section === 'SPECIAL_NOTE' ? 'text-red-700' : 'text-slate-600'
            }`}>
              {title} Records & Documentation
            </span>
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {section === 'REMARK' && (
                <button
                  onClick={() => {
                    setEditingEntry(null);
                    setInitialCategoryForModal('Gangway Safety');
                    setModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer min-h-[44px] w-full sm:w-auto"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Gangway Safety Check</span>
                </button>
              )}
              {section === 'VESSEL_COORDINATION' && (
                <button
                  onClick={() => {
                    setEditingEntry(null);
                    setInitialCategoryForModal('Damage Report');
                    setModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer min-h-[44px] w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Damage Report</span>
                </button>
              )}
              <button
                onClick={() => {
                  setEditingEntry(null);
                  setInitialCategoryForModal('');
                  setModalOpen(true);
                }}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer min-h-[44px] w-full sm:w-auto ${
                  section === 'SPECIAL_NOTE'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-navy-800 hover:bg-navy-900 text-white'
                }`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add New Record</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-8 flex items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-navy-600" />
              <span className="text-sm font-medium">Loading records...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-600">No {title.toLowerCase()} records yet.</p>
              <p className="text-xs text-slate-400">Click &quot;+ Add New Record&quot; above to log inspection findings, notes, or photographs.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <EntryCard
                  key={entry._id}
                  entry={entry}
                  currentUser={currentUser}
                  onEdit={(item) => {
                    setEditingEntry(item);
                    setInitialCategoryForModal('');
                    setModalOpen(true);
                  }}
                  onDelete={handleDeleteEntry}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <EntryFormModal
        isOpen={modalOpen}
        section={section}
        sectionTitle={title}
        initialEntry={editingEntry}
        initialCategory={initialCategoryForModal}
        currentUser={currentUser}
        onClose={() => {
          setModalOpen(false);
          setEditingEntry(null);
          setInitialCategoryForModal('');
        }}
        onSave={handleSaveEntry}
      />
    </div>
  );
};

export default VesselSectionAccordion;
