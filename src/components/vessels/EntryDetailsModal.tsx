'use client';

import React, { useEffect } from 'react';
import { IVesselEntry, IUser } from '@/types';
import { PhotoGallery } from './PhotoGallery';
import { canEditOrDeleteEntry } from '@/lib/auth/rbac';
import { X, Wrench, Edit2, Trash2, Clock, User as UserIcon, Eye, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

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
  REMARK: '6. On Board Safety',
  VESSEL_COORDINATION: '7. Vessel Coordination',
};

export const EntryDetailsModal: React.FC<EntryDetailsModalProps> = ({
  isOpen,
  entry,
  currentUser,
  onClose,
  onEdit,
  onDelete,
}) => {
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

  if (!isOpen || !entry) return null;

  const canModify = canEditOrDeleteEntry(currentUser, entry.createdBy, entry.createdByName);
  const canManagePhotos = !!currentUser && currentUser.status === 'APPROVED';

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
        {/* Clean Responsive Header Bar (No Overlapping) */}
        <div className="bg-navy-900 text-white p-4 sm:px-5 sm:py-4 border-b border-navy-800 shrink-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] bg-navy-700 text-ocean-200 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider inline-block mb-1">
                {sectionName}
              </span>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-white truncate flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-ocean-300 shrink-0" />
                <span>Inspection Record Details</span>
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {canManagePhotos && onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(entry);
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-ocean-600 text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
                  title="Edit Record"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}

              {canModify && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this inspection record?')) {
                      onClose();
                      onDelete(entry._id);
                    }
                  }}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
                  title="Delete Record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
                title="Close Details Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 bg-slate-50">
          {/* SAFETY STATUS BADGES & CATEGORY HIGHLIGHT */}
          {(entry.safetyStatus || entry.category) && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">
                  Category: {entry.category || 'Gangway Safety'}
                </span>
              </div>

              {entry.safetyStatus === 'SAFE' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 text-white font-extrabold text-xs shadow-xs border border-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>STATUS: SAFE</span>
                </span>
              )}
              {entry.safetyStatus === 'UNSAFE' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-600 text-white font-extrabold text-xs shadow-xs border border-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                  <span>STATUS: UNSAFE</span>
                </span>
              )}
            </div>
          )}

          {/* Main Description Card */}
          <div className={`p-4 sm:p-5 rounded-xl border shadow-xs space-y-2 ${
            entry.section === 'SPECIAL_NOTE'
              ? 'bg-red-50/90 border-red-300 border-l-4 border-l-red-600'
              : 'bg-white border-slate-200'
          }`}>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest block font-mono ${
              entry.section === 'SPECIAL_NOTE' ? 'text-red-700' : 'text-slate-400'
            }`}>
              {entry.section === 'REMARK' ? 'SAFETY COMMENTS & REMARKS' : 'OBSERVATION & DESCRIPTION TEXT'}
            </span>
            <div className={`text-sm sm:text-base whitespace-pre-wrap leading-relaxed font-sans ${
              entry.section === 'SPECIAL_NOTE' ? 'text-red-900 font-bold' : 'text-slate-900 font-medium'
            }`}>
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
            <PhotoGallery photos={entry.photographs || []} canDelete={canManagePhotos} />
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
          <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px] sm:max-w-none">
            VESSEL LIBRARY • Inspection Record #{entry._id.substring(0, 8)}
          </span>
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
