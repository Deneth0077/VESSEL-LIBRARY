'use client';

import React, { useState } from 'react';
import { IPhotograph } from '@/types';
import { Maximize2, X, Camera, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface PhotoGalleryProps {
  photos: IPhotograph[];
  title?: string;
  onDeletePhoto?: (photoIdOrIndex: string | number) => void;
  canDelete?: boolean;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  title = 'Photographs',
  onDeletePhoto,
  canDelete = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!photos || photos.length === 0) {
    return (
      <div className="py-3 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <Camera className="w-4 h-4 text-slate-300" />
        <span>No photographs attached.</span>
      </div>
    );
  }

  const activePhoto = selectedIndex !== null ? photos[selectedIndex] : null;

  const handleDelete = (photoIdOrIndex: string | number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onDeletePhoto) {
      onDeletePhoto(photoIdOrIndex);
      if (selectedIndex !== null) {
        setSelectedIndex(null);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2.5">
        {photos.map((photo, idx) => (
          <div
            key={photo._id || idx}
            onClick={() => setSelectedIndex(idx)}
            className="group relative w-32 h-24 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer shadow-xs hover:shadow-md transition-all flex-shrink-0"
          >
            <img
              src={photo.url}
              alt={photo.caption || photo.filename || 'Vessel photograph'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
              <Maximize2 className="w-4 h-4" />
            </div>

            {(canDelete || onDeletePhoto) && (
              <button
                type="button"
                onClick={(e) => handleDelete(photo._id || idx, e)}
                className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full transition-all z-10 shadow-md active:scale-95"
                title="Delete photograph"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {photo.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-navy-900/80 text-white text-[9px] px-1 py-0.5 truncate text-center font-medium">
                {photo.caption}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activePhoto && selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-navy-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            {(canDelete || onDeletePhoto) && (
              <button
                onClick={(e) => handleDelete(activePhoto._id || selectedIndex, e)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer min-h-[38px]"
                title="Delete this photograph"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Photo</span>
              </button>
            )}

            <button
              onClick={() => setSelectedIndex(null)}
              className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {photos.length > 1 && (
            <>
              <button
                onClick={() => setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length)}
                className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => setSelectedIndex((selectedIndex + 1) % photos.length)}
                className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center">
            <img
              src={activePhoto.url}
              alt={activePhoto.filename}
              className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-3 text-center text-white text-xs space-y-1">
              {activePhoto.caption && <p className="font-semibold text-sm">{activePhoto.caption}</p>}
              <p className="text-slate-300 text-[11px]">
                Uploaded by {activePhoto.uploadedByName || activePhoto.uploadedBy} •{' '}
                {activePhoto.uploadedAt ? new Date(activePhoto.uploadedAt).toLocaleString() : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
