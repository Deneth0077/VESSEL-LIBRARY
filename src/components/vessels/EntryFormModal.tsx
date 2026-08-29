'use client';

import React, { useState, useEffect } from 'react';
import { SectionType, IPhotograph, IVesselEntry, IUser } from '@/types';
import { canEditOrDeleteEntry } from '@/lib/auth/rbac';
import { Camera, Upload, X, Loader2, Image as ImageIcon, Plus, Wrench, Lock } from 'lucide-react';

interface EntryFormModalProps {
  isOpen: boolean;
  section: SectionType;
  sectionTitle: string;
  initialEntry?: IVesselEntry | null;
  currentUser?: IUser | null;
  onClose: () => void;
  onSave: (data: { text: string; solution?: string; photographs: IPhotograph[] }) => Promise<void>;
}

export const EntryFormModal: React.FC<EntryFormModalProps> = ({
  isOpen,
  section,
  sectionTitle,
  initialEntry,
  currentUser,
  onClose,
  onSave,
}) => {
  const [text, setText] = useState('');
  const [solution, setSolution] = useState('');
  const [photos, setPhotos] = useState<IPhotograph[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canEditText = !initialEntry || canEditOrDeleteEntry(currentUser, initialEntry.createdBy);

  useEffect(() => {
    if (initialEntry) {
      setText(initialEntry.text || '');
      setSolution(initialEntry.solution || '');
      setPhotos(initialEntry.photographs || []);
    } else {
      setText('');
      setSolution('');
      setPhotos([]);
    }
    setError('');
  }, [initialEntry, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    let filesArray = Array.from(rawFiles);
    if (photos.length + filesArray.length > 5) {
      const allowedCount = Math.max(0, 5 - photos.length);
      if (allowedCount === 0) {
        setError('Maximum limit of 5 photographs reached for this entry.');
        if (e.target) e.target.value = '';
        return;
      }
      setError(`Maximum limit is 5 photographs per entry. Processing the first ${allowedCount} photos.`);
      filesArray = filesArray.slice(0, allowedCount);
    }

    try {
      setUploading(true);
      setError('');

      const uploadPromises = filesArray.map(async (file, i) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('caption', `${sectionTitle} Photo ${photos.length + i + 1}`);

        const res = await fetch('/api/photos', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.photo) {
          return data.photo as IPhotograph;
        } else {
          throw new Error(data.message || 'Failed to upload photograph');
        }
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      setPhotos((prev) => [...prev, ...uploadedPhotos]);
    } catch (err: any) {
      setError(err.message || 'Error uploading photos. Please try again.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (canEditText && !text.trim()) {
      setError('Description text is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (canEditText) {
        await onSave({ text: text.trim(), solution: solution.trim(), photographs: photos });
      } else {
        await onSave({ text: initialEntry?.text || text.trim(), photographs: photos });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy-950/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4 font-sans">
      <div className="bg-white w-full sm:max-w-xl rounded-t-2xl sm:rounded-2xl shadow-modal border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Modal Handle Header */}
        <div className="sm:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2" />

        <div className="px-5 py-4 bg-navy-900 text-white flex items-center justify-between shrink-0">
          <h3 className="font-bold text-base tracking-wide flex items-center gap-2">
            <span>{initialEntry ? (canEditText ? 'Edit Entry & Photos' : 'Manage Entry Photos') : 'Add New Entry'}</span>
            <span className="text-xs bg-navy-700 text-ocean-200 px-2 py-0.5 rounded uppercase font-semibold">
              {sectionTitle}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Description Text <span className="text-rose-500">*</span></span>
              {!canEditText && (
                <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Text Locked (Creator Only)
                </span>
              )}
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              disabled={!canEditText}
              placeholder="Enter detailed observation notes, maintenance actions taken, or inspection findings..."
              required={canEditText}
              className={`w-full p-3.5 border rounded-xl text-slate-900 text-sm focus:outline-none font-sans ${
                !canEditText
                  ? 'bg-slate-100 border-slate-300 text-slate-600 cursor-not-allowed opacity-90'
                  : 'bg-slate-50 border-slate-300 focus:ring-2 focus:ring-navy-600 focus:border-navy-600'
              }`}
            />
            {!canEditText && (
              <p className="text-[11px] text-slate-500 mt-1 italic">
                Filed by <strong>{initialEntry?.createdByName || 'another user'}</strong>. Only the creator can edit description text, but you can add/manage photographs below.
              </p>
            )}
          </div>

          {section === 'OPERATIONAL_CHALLENGE' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-teal-600" />
                <span>Solutions / Recommended Actions (Optional)</span>
              </label>
              <textarea
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                rows={3}
                disabled={!canEditText}
                placeholder="Enter resolution, corrective action taken, or recommended solution..."
                className={`w-full p-3.5 border rounded-xl text-slate-900 text-sm focus:outline-none font-sans ${
                  !canEditText
                    ? 'bg-slate-100 border-slate-300 text-slate-600 cursor-not-allowed opacity-90'
                    : 'bg-teal-50/40 border-teal-200 focus:ring-2 focus:ring-teal-600 focus:border-teal-600'
                }`}
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Attach / Manage Photographs (Open for all users)
              </label>
              <span className="text-xs text-slate-400 font-medium">{photos.length} photo(s) selected</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Camera Take Photo Button */}
              <label className="flex items-center justify-center gap-2 p-3 bg-ocean-50 border border-ocean-200 hover:bg-ocean-100 rounded-xl text-ocean-800 text-xs font-bold cursor-pointer transition-colors min-h-[48px]">
                <Camera className="w-4 h-4 text-ocean-600" />
                <span>Take Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Upload Existing Photo Button */}
              <label className="flex items-center justify-center gap-2 p-3 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-xl text-slate-800 text-xs font-bold cursor-pointer transition-colors min-h-[48px]">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {uploading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-ocean-700 p-2 bg-ocean-50 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-ocean-600" />
                <span>Processing photo upload...</span>
              </div>
            )}

            {/* Attached Photo Previews */}
            {photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                {photos.map((photo, idx) => (
                  <div key={photo._id || idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-300 group">
                    <img src={photo.url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md transition-transform cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors min-h-[44px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-navy-700 hover:bg-navy-800 transition-colors shadow-sm min-h-[44px] cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : initialEntry ? 'Save Changes' : 'Save Entry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryFormModal;
