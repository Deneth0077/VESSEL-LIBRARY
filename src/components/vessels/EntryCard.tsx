'use client';

import React, { useState } from 'react';
import { IVesselEntry, IUser } from '@/types';
import { PhotoGallery } from './PhotoGallery';
import { canEditOrDeleteEntry } from '@/lib/auth/rbac';
import { Edit2, Trash2, Clock, User as UserIcon } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface EntryCardProps {
  entry: IVesselEntry;
  currentUser: IUser | null;
  onEdit: (entry: IVesselEntry) => void;
  onDelete: (entryId: string) => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry, currentUser, onEdit, onDelete }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const canModify = canEditOrDeleteEntry(currentUser, entry.createdBy);

  const createdDate = entry.createdAt ? new Date(entry.createdAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) : '';

  const updatedDate = entry.updatedAt ? new Date(entry.updatedAt).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) : '';

  const isEdited = entry.createdAt && entry.updatedAt && new Date(entry.updatedAt).getTime() - new Date(entry.createdAt).getTime() > 1000;

  const handleDeleteEntryPhoto = async (photoIdOrIndex: string | number) => {
    if (!confirm('Are you sure you want to delete this photograph from this entry?')) return;

    try {
      const currentList = entry.photographs || [];
      const updatedPhotos = currentList.filter((p, idx) => {
        if (typeof photoIdOrIndex === 'number') return idx !== photoIdOrIndex;
        return p._id !== photoIdOrIndex && idx !== Number(photoIdOrIndex);
      });

      const patchRes = await fetch(`/api/entries/${entry._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: entry.text,
          photographs: updatedPhotos,
        }),
      });

      if (!patchRes.ok) {
        alert('Failed to delete photograph.');
        return;
      }

      onEdit({ ...entry, photographs: updatedPhotos });
    } catch (err) {
      console.error('Failed to delete entry photo:', err);
      alert('Error deleting photo.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* TEXT ENTERED BY USER ALWAYS APPEARS FIRST */}
        <div className="text-slate-800 text-sm sm:text-base whitespace-pre-wrap leading-relaxed flex-1 font-sans">
          {entry.text}
        </div>

        {canModify && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onEdit(entry)}
              title="Edit entry"
              className="p-1.5 rounded-lg text-slate-400 hover:text-ocean-600 hover:bg-ocean-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              title="Delete entry"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* RELATED PHOTOGRAPHS (IF ANY) */}
      {entry.photographs && entry.photographs.length > 0 && (
        <div className="pt-2">
          <PhotoGallery
            photos={entry.photographs}
            canDelete={canModify}
            onDeletePhoto={handleDeleteEntryPhoto}
          />
        </div>
      )}

      {/* METADATA LINE: Added by / Updated by */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 font-sans gap-2">
        <div className="flex items-center gap-1.5">
          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Added by <strong className="font-semibold text-slate-700">{entry.createdByName || 'Unknown'}</strong>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{createdDate}</span>
        </div>

        {isEdited && (
          <div className="flex items-center gap-1 text-[11px] text-slate-400 italic">
            <Clock className="w-3 h-3 text-slate-300" />
            <span>Updated by {entry.updatedByName || entry.createdByName} • {updatedDate}</span>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry and all attached photographs? This action cannot be undone."
        confirmLabel="Delete Entry"
        onConfirm={() => {
          setShowConfirmDelete(false);
          onDelete(entry._id);
        }}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </div>
  );
};

export default EntryCard;
