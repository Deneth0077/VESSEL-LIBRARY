'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

  const activePhoto = selectedIndex !== null && photos ? photos[selectedIndex] : null;

  const handleCloseLightbox = () => {
    setSelectedIndex(null);

    // Smoothly navigate back to the exact field / container location
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  // Keyboard navigation & ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowLeft' && photos.length > 1) {
        setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
      } else if (e.key === 'ArrowRight' && photos.length > 1) {
        setSelectedIndex((selectedIndex + 1) % photos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, photos]);

  if (!photos || photos.length === 0) {
    return (
      <div className="py-3 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 text-xs flex items-center justify-center gap-2 font-sans">
        <Camera className="w-4 h-4 text-slate-300" />
        <span>No photographs attached.</span>
      </div>
    );
  }

  const handleDelete = (photoIdOrIndex: string | number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onDeletePhoto) {
      onDeletePhoto(photoIdOrIndex);
      if (selectedIndex !== null) {
        handleCloseLightbox();
      }
    }
  };

  return (
    <div ref={containerRef} className="space-y-2 font-sans">
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
                className="absolute top-1 right-1 p-1 bg-rose-600/90 hover:bg-rose-700 text-white rounded-full transition-all z-10 shadow-md active:scale-95 cursor-pointer"
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

      {/* Prominent & Highly Visible Lightbox Modal */}
      {activePhoto && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-navy-950/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 font-sans animate-in fade-in duration-150 select-none"
          onClick={handleCloseLightbox}
        >
          {/* Top Control Header Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between gap-3 z-30 pt-2 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
              Photo {selectedIndex + 1} of {photos.length}
            </div>

            <div className="flex items-center gap-2">
              {(canDelete || onDeletePhoto) && (
                <button
                  onClick={(e) => handleDelete(activePhoto._id || selectedIndex, e)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold transition-all shadow-lg cursor-pointer min-h-[42px]"
                  title="Delete this photograph"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Photo</span>
                </button>
              )}

              {/* DEDICATED HIGH-VISIBILITY CLOSE BUTTON */}
              <button
                onClick={handleCloseLightbox}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 active:scale-95 text-slate-900 text-xs font-extrabold shadow-2xl border-2 border-slate-300 transition-all cursor-pointer min-h-[42px]"
                title="Close Image Preview (Esc)"
              >
                <X className="w-5 h-5 text-rose-600 font-bold" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
                }}
                className="fixed left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/20 hover:bg-white/40 active:scale-90 text-white shadow-xl backdrop-blur-md transition-all z-30 cursor-pointer"
                title="Previous Photo"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex + 1) % photos.length);
                }}
                className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3.5 rounded-full bg-white/20 hover:bg-white/40 active:scale-90 text-white shadow-xl backdrop-blur-md transition-all z-30 cursor-pointer"
                title="Next Photo"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            </>
          )}

          {/* Main Image Display Container */}
          <div
            className="relative my-auto max-w-4xl max-h-[75vh] flex flex-col items-center justify-center z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePhoto.url}
              alt={activePhoto.filename || 'Vessel Photograph'}
              className="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border border-white/10"
            />

            {/* Corner Quick-Close Button on Image Card */}
            <button
              onClick={handleCloseLightbox}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-xl border-2 border-white transition-all cursor-pointer active:scale-90 z-30"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mt-3 text-center text-white text-xs space-y-1 bg-navy-900/80 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm max-w-lg">
              {activePhoto.caption && <p className="font-extrabold text-sm text-ocean-300">{activePhoto.caption}</p>}
              <p className="text-slate-300 text-[11px] font-medium">
                Uploaded by {activePhoto.uploadedByName || activePhoto.uploadedBy} •{' '}
                {activePhoto.uploadedAt ? new Date(activePhoto.uploadedAt).toLocaleString() : ''}
              </p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-medium pb-1">
            Click outside image or press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-slate-200 font-mono text-[10px]">Esc</kbd> to close.
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
