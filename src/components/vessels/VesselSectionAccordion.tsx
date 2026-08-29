'use client';

import React, { useState, useEffect } from 'react';
import { SectionType, IVesselEntry, IUser } from '@/types';
import { ChevronDown, ChevronRight, Plus, Wrench, ShieldAlert, AlertTriangle, FileText, MessageSquare, Loader2 } from 'lucide-react';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IVesselEntry | null>(null);

  const icons: Record<SectionType, React.ReactNode> = {
    STRUCTURE: <Wrench className="w-5 h-5 text-ocean-600" />,
    STRUCTURAL_DAMAGE: <ShieldAlert className="w-5 h-5 text-rose-600" />,
    OPERATIONAL_CHALLENGE: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    SPECIAL_NOTE: <FileText className="w-5 h-5 text-teal-600" />,
    REMARK: <MessageSquare className="w-5 h-5 text-navy-600" />,
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

  const handleSaveEntry = async (data: { text: string; solution?: string; photographs: any[] }) => {
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
        className={`w-full px-5 py-4 flex items-center justify-between transition-colors text-left focus:outline-none min-h-[56px] ${
          isOpen ? 'bg-slate-50 border-b border-slate-200' : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-lg bg-slate-100 border border-slate-200">{icons[section]}</span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <h3 className="font-bold text-navy-800 text-base uppercase tracking-tight font-sans">{title}</h3>
            {entries.length > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-ocean-50 text-ocean-700 border border-ocean-200">
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-navy-800" />
          ) : (
            <ChevronRight className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {/* Accordion Content Area */}
      {isOpen && (
        <div className="p-5 space-y-4 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider min-w-0">
              {title} Records & Documentation
            </span>
            <button
              onClick={() => {
                setEditingEntry(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 active:scale-95 text-white font-bold text-xs transition-all shadow-xs shrink-0 whitespace-nowrap cursor-pointer min-h-[42px] w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Entry</span>
            </button>
          </div>

          {loading ? (
            <div className="py-8 flex items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-navy-600" />
              <span className="text-sm font-medium">Loading entries...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-600">No {title.toLowerCase()} records yet.</p>
              <p className="text-xs text-slate-400">Click &quot;+ Add New Entry&quot; above to log inspection findings or notes with photographs.</p>
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
        onClose={() => {
          setModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
      />
    </div>
  );
};

export default VesselSectionAccordion;
