'use client';

import React, { useState } from 'react';
import { IVessel, IPhotograph } from '@/types';
import { PhotoGallery } from './PhotoGallery';
import { EditVesselModal } from './EditVesselModal';
import { Camera, Loader2, Info, Edit, Ruler, Layers } from 'lucide-react';

interface BasicInformationProps {
  vessel: IVessel;
  onUpdateVessel?: () => void;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({ vessel, onUpdateVessel }) => {
  const [uploading, setUploading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const newPhotos: IPhotograph[] = [...(vessel.mainPhotographs || [])];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('caption', 'Main Vessel Photograph');

        const res = await fetch('/api/photos', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          alert(errData.message || 'Failed to upload photo. Only approved users can upload photos.');
          return;
        }

        const data = await res.json();
        newPhotos.push(data.photo);
      }

      const patchRes = await fetch(`/api/vessels/${vessel._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainPhotographs: newPhotos }),
      });

      if (!patchRes.ok) {
        const errData = await patchRes.json().catch(() => ({}));
        alert(errData.message || 'Failed to update vessel photographs.');
        return;
      }

      if (onUpdateVessel) onUpdateVessel();
    } catch (err) {
      console.error('Failed uploading photo:', err);
      alert('Error uploading photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMainPhoto = async (photoIdOrIndex: string | number) => {
    if (!confirm('Are you sure you want to delete this photograph?')) return;

    try {
      const currentList = vessel.mainPhotographs || [];
      const updatedPhotos = currentList.filter((p, idx) => {
        if (typeof photoIdOrIndex === 'number') return idx !== photoIdOrIndex;
        return p._id !== photoIdOrIndex && idx !== Number(photoIdOrIndex);
      });

      const patchRes = await fetch(`/api/vessels/${vessel._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainPhotographs: updatedPhotos }),
      });

      if (!patchRes.ok) {
        const errData = await patchRes.json().catch(() => ({}));
        alert(errData.message || 'Failed to delete photograph.');
        return;
      }

      if (onUpdateVessel) onUpdateVessel();
    } catch (err) {
      console.error('Error deleting photograph:', err);
      alert('Error deleting photograph. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="bg-navy-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Info className="w-4 h-4 text-ocean-300 shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-sans truncate">1. Basic Information & Specs</h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold transition-all min-h-[36px] cursor-pointer"
            title="Edit & Update Vessel Specifications"
          >
            <Edit className="w-3.5 h-3.5 text-ocean-300" />
            <span>Edit Specs</span>
          </button>

          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ocean-600 hover:bg-ocean-700 active:scale-95 text-white text-xs font-bold transition-all min-h-[36px] shrink-0 whitespace-nowrap">
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5" />
            )}
            <span>Add Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Primary Technical Spec Grid */}
      <div className="divide-y divide-slate-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-50/50">
          <div className="p-3 border-r border-b sm:border-b-0 border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">VESSEL NAME</span>
            <span className="font-extrabold text-navy-900 text-sm uppercase block mt-0.5">{vessel.vesselName}</span>
          </div>

          <div className="p-3 border-r border-b sm:border-b-0 border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">IMO NUMBER</span>
            <span className="font-mono font-bold text-ocean-700 text-sm block mt-0.5">{vessel.imoNumber}</span>
          </div>

          <div className="p-3 border-r border-b sm:border-b-0 border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">VESSEL TYPE</span>
            <span className="font-semibold text-navy-800 text-xs block mt-0.5">{vessel.vesselType}</span>
          </div>

          <div className="p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">FLAG STATE</span>
            <span className="font-semibold text-navy-800 text-xs block mt-0.5">{vessel.flag}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 bg-white">
          <div className="p-3 border-r border-b sm:border-b-0 border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">OWNER / OPERATOR</span>
            <span className="font-medium text-slate-800 text-xs block mt-0.5 truncate">{vessel.ownerOperator}</span>
          </div>

          <div className="p-3 border-r border-b sm:border-b-0 border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">CALL SIGN</span>
            <span className="font-mono font-semibold text-navy-800 text-xs block mt-0.5">{vessel.callSign}</span>
          </div>

          <div className="p-3 border-r border-b sm:border-b-0 border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">YEAR BUILT</span>
            <span className="font-semibold text-navy-800 text-xs block mt-0.5">{vessel.yearBuilt}</span>
          </div>

          <div className="p-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">PROFILE STATUS</span>
            <span className="inline-flex items-center text-[11px] font-bold text-teal-600 mt-0.5">
              ● Active Profile
            </span>
          </div>
        </div>

        {/* Technical Dimensions & Cargo Specs Sub-Grid */}
        {(vessel.loa || vessel.beam || vessel.keelToDeck || vessel.numberOfBays || vessel.numberOfRows || vessel.lashingBridges) && (
          <div className="p-3.5 bg-slate-50/80 border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-navy-900 uppercase tracking-widest">
              <Ruler className="w-3.5 h-3.5 text-ocean-600" />
              <span>Technical Dimensions & Cargo Specs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {vessel.loa && (
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">LOA (Length Over All)</span>
                  <span className="font-bold text-slate-800">{vessel.loa}</span>
                </div>
              )}
              {vessel.beam && (
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Beam</span>
                  <span className="font-bold text-slate-800">{vessel.beam}</span>
                </div>
              )}
              {vessel.keelToDeck && (
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Length Keel to Deck</span>
                  <span className="font-bold text-slate-800">{vessel.keelToDeck}</span>
                </div>
              )}
              {vessel.numberOfBays && (
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Number of Bays</span>
                  <span className="font-bold text-slate-800">{vessel.numberOfBays}</span>
                </div>
              )}
              {vessel.numberOfRows && (
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Number of Rows</span>
                  <span className="font-bold text-slate-800">{vessel.numberOfRows}</span>
                </div>
              )}
              {vessel.lashingBridges && (
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Lashing Bridges</span>
                  <span className="font-bold text-slate-800">
                    {vessel.lashingBridges} {vessel.lashingBridgeHeight ? `(${vessel.lashingBridgeHeight})` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Streamlined Additional Specifications & Notes */}
      {vessel.basicInformation && (
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 border-l-4 border-l-ocean-500">
          <span className="text-[10px] font-bold text-ocean-800 uppercase tracking-widest block mb-0.5">
            ADDITIONAL SPECIFICATIONS & NOTES
          </span>
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{vessel.basicInformation}</p>
        </div>
      )}

      {/* Main Vessel Photographs Gallery */}
      <div className="p-3.5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            MAIN VESSEL PHOTOGRAPHS ({vessel.mainPhotographs?.length || 0})
          </span>
        </div>
        <PhotoGallery
          photos={vessel.mainPhotographs || []}
          title="Main Vessel Photographs"
          canDelete={true}
          onDeletePhoto={handleDeleteMainPhoto}
        />
      </div>

      {/* Edit Vessel Modal */}
      <EditVesselModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        vessel={vessel}
        onSaveSuccess={() => {
          if (onUpdateVessel) onUpdateVessel();
        }}
      />
    </div>
  );
};

export default BasicInformation;
