'use client';

import React from 'react';
import { IVesselEntry, IUser } from '@/types';
import { PhotoGallery } from './PhotoGallery';
import { canEditOrDeleteEntry } from '@/lib/auth/rbac';
import { X, Wrench, Edit2, Trash2, Clock, User as UserIcon, FileText, Eye } from 'lucide-react';

interface EntryDetailsModalProps {
  isOpen: boolean;
  entry: IVesselEntry | null;
  currentUser: IUser | null;
  onClose: () => void;
  onEdit?: (entry: IVesselEntry) => void;
  onDelete?: (entryId: string) => void;
}

const sectionTitles: Record<string, string> = {
  STRUCTURE: '2. Vessel Structure',
  STRUCTURAL_DAMAGE: '3. Vessel Structural Damages',
  OPERATIONAL_CHALLENGE: '4. Operational Challenges',
  SPECIAL_NOTE: '5. Special Notes',
  REMARK: '6. Remarks',
};

export const EntryDetailsModal: React.FC<EntryDetailsModalProps> = ({
  isOpen,
  entry,
  currentUser,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !entry) return null;

  const canModify = canEditOrDeleteEntry(currentUser, entry.createdBy);

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

  const updatedDate = entry.updatedAt
    ? new Date(entry.updatedAt).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : '';

  const isEdited =
    entry.createdAt &&
    entry.updatedAt &&
    new Date(entry.updatedAt).getTime() - new Date(entry.createdAt).getTime() > 1000;

  const sectionName = sectionTitles[entry.section] || entry.section;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 font-sans">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Modal Header Bar */}
        <div className="bg-navy-900 text-white px-5 py-4 flex items-center justify-between border-b border-navy-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="w-5 h-5 text-ocean-300 shrink-0" />
            <div>
              <span className="text-[10px] font-mono font-bold text-ocean-300 uppercase tracking-widest block">
                {sectionName}
              </span>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight truncate">
                Record Entry Inspection Details
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canModify && onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(entry);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all min-h-[38px] cursor-pointer"
                title="Edit entry details"
              >
                <Edit2 className="w-4 h-4 text-ocean-300" />
                <span>Edit</span>
              </button>
            )}

            {canModify && onDelete && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this entry?')) {
                    onClose();
                    onDelete(entry._id);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all min-h-[38px] cursor-pointer"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white transition-all cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Close Details Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
          {/* Main Description Card */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
              OBSERVATION & DESCRIPTION TEXT
            </span>
            <div className="text-slate-900 text-sm sm:text-base whitespace-pre-wrap leading-relaxed font-sans font-medium">
              {entry.text}
            </div>
          </div>

          {/* Solution / Corrective Action Card (If available) */}
          {entry.solution && (
            <div className="bg-teal-50/80 p-4 sm:p-5 rounded-xl border-l-4 border-l-teal-600 border border-teal-200/80 shadow-xs space-y-2">
              <span className="text-[10px] font-extrabold text-teal-900 uppercase tracking-widest block flex items-center gap-1.5 font-mono">
                <Wrench className="w-4 h-4 text-teal-600" />
                <span>💡 SOLUTION / CORRECTIVE ACTION TAKEN</span>
              </span>
              <p className="text-slate-800 text-xs sm:text-sm font-semibold whitespace-pre-wrap leading-relaxed">
                {entry.solution}
              </p>
            </div>
          )}

          {/* Attached Photographs Gallery */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
              ATTACHED PHOTOGRAPHS ({entry.photographs?.length || 0})
            </span>
            <PhotoGallery photos={entry.photographs || []} canDelete={canModify} />
          </div>

          {/* User Metadata & Time Stamp */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span>
                Filed by <strong className="font-bold text-slate-900">{entry.createdByName || 'Unknown'}</strong> • {createdDate}
              </span>
            </div>

            {isEdited && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                <span>Updated by {entry.updatedByName || entry.createdByName} • {updatedDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-slate-500">VESSEL LIBRARY • Inspection Record #{entry._id.substring(0, 8)}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer min-h-[38px]"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryDetailsModal;
