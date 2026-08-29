'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IPhotograph } from '@/types';
import { Ship, Camera, Upload, X, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateVesselPage() {
  const router = useRouter();

  const [vesselName, setVesselName] = useState('');
  const [imoNumber, setImoNumber] = useState('');
  const [vesselType, setVesselType] = useState('Bulk Carrier');
  const [flag, setFlag] = useState('');
  const [ownerOperator, setOwnerOperator] = useState('');
  const [callSign, setCallSign] = useState('');
  const [yearBuilt, setYearBuilt] = useState<number>(new Date().getFullYear());
  const [loa, setLoa] = useState('');
  const [beam, setBeam] = useState('');
  const [keelToDeck, setKeelToDeck] = useState('');
  const [numberOfBays, setNumberOfBays] = useState('');
  const [numberOfRows, setNumberOfRows] = useState('');
  const [lashingBridges, setLashingBridges] = useState<'Yes' | 'No' | ''>('');
  const [lashingBridgeHeight, setLashingBridgeHeight] = useState('');
  const [basicInformation, setBasicInformation] = useState('');
  const [photos, setPhotos] = useState<IPhotograph[]>([]);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then((res) => {
      if (!res.ok) {
        router.push('/login');
      }
    });
  }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      setError('');
      const uploadedList = [...photos];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('caption', 'Main Vessel Photograph');

        const res = await fetch('/api/photos', {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          uploadedList.push(data.photo);
        } else {
          const errData = await res.json();
          setError(errData.message || 'Error uploading photo');
        }
      }

      setPhotos(uploadedList);
    } catch (err: any) {
      setError('Network error while uploading photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vesselName || !vesselType) {
      setError('Please fill in Vessel Name and Vessel Type.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const res = await fetch('/api/vessels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vesselName: vesselName.trim(),
          vesselType: vesselType.trim(),
          imoNumber: imoNumber.trim(),
          flag: flag.trim(),
          ownerOperator: ownerOperator.trim(),
          callSign: callSign.trim(),
          yearBuilt,
          loa: loa.trim(),
          beam: beam.trim(),
          keelToDeck: keelToDeck.trim(),
          numberOfBays: numberOfBays.trim(),
          numberOfRows: numberOfRows.trim(),
          lashingBridges,
          lashingBridgeHeight: lashingBridges === 'Yes' ? lashingBridgeHeight : '',
          basicInformation: basicInformation.trim(),
          mainPhotographs: photos,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to create vessel profile.');
        return;
      }

      // Open newly created vessel profile
      router.push(`/vessels/${data.vessel._id}`);
    } catch (err: any) {
      setError('Failed to create vessel profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 uppercase tracking-tight">
            Create New Vessel Profile
          </h1>
          <p className="text-xs text-slate-500 font-medium">Add vessel specifications and initial photographs.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Vessel Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={vesselName}
              onChange={(e) => setVesselName(e.target.value)}
              placeholder="e.g. MV OCEAN STAR"
              required
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 font-bold uppercase text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Vessel Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={vesselType}
              onChange={(e) => setVesselType(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
            >
              <option value="Bulk Carrier">Bulk Carrier</option>
              <option value="Container Ship">Container Ship</option>
              <option value="Oil Tanker">Oil Tanker</option>
              <option value="Chemical Tanker">Chemical Tanker</option>
              <option value="LNG / LPG Carrier">LNG / LPG Carrier</option>
              <option value="General Cargo">General Cargo</option>
              <option value="Ro-Ro Vessel">Ro-Ro Vessel</option>
              <option value="Tugboat / Offshore">Tugboat / Offshore</option>
              <option value="Passenger Ship">Passenger Ship</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              IMO Number (Optional)
            </label>
            <input
              type="text"
              value={imoNumber}
              onChange={(e) => setImoNumber(e.target.value)}
              placeholder="e.g. 9876543"
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-ocean-700 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Flag State (Optional)
            </label>
            <input
              type="text"
              value={flag}
              onChange={(e) => setFlag(e.target.value)}
              placeholder="e.g. Panama, Liberia, Singapore"
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Owner / Operator (Optional)
            </label>
            <input
              type="text"
              value={ownerOperator}
              onChange={(e) => setOwnerOperator(e.target.value)}
              placeholder="e.g. Global Maritime Holdings Ltd."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Call Sign (Optional)
            </label>
            <input
              type="text"
              value={callSign}
              onChange={(e) => setCallSign(e.target.value)}
              placeholder="e.g. 3F2B"
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Year Built (Optional)
            </label>
            <input
              type="number"
              value={yearBuilt}
              onChange={(e) => setYearBuilt(parseInt(e.target.value) || 2020)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
            />
          </div>
        </div>

        {/* TECHNICAL DIMENSIONS & CARGO SPECS */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          <h3 className="text-xs font-extrabold text-navy-900 uppercase tracking-widest">
            Technical Dimensions & Cargo Specs (Optional)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                LOA (Length Over All)
              </label>
              <input
                type="text"
                value={loa}
                onChange={(e) => setLoa(e.target.value)}
                placeholder="e.g. 199.9 m"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Beam
              </label>
              <input
                type="text"
                value={beam}
                onChange={(e) => setBeam(e.target.value)}
                placeholder="e.g. 32.2 m"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Length Keel to Deck
              </label>
              <input
                type="text"
                value={keelToDeck}
                onChange={(e) => setKeelToDeck(e.target.value)}
                placeholder="e.g. 18.5 m"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Number of Bays
              </label>
              <input
                type="text"
                value={numberOfBays}
                onChange={(e) => setNumberOfBays(e.target.value)}
                placeholder="e.g. 24"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Number of Rows
              </label>
              <input
                type="text"
                value={numberOfRows}
                onChange={(e) => setNumberOfRows(e.target.value)}
                placeholder="e.g. 13"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lashing Bridges (Yes / No)
              </label>
              <select
                value={lashingBridges}
                onChange={(e) => {
                  const val = e.target.value as 'Yes' | 'No' | '';
                  setLashingBridges(val);
                  if (val !== 'Yes') setLashingBridgeHeight('');
                }}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-navy-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-navy-600 min-h-[44px]"
              >
                <option value="">-- Select Lashing Bridges --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lashing Bridge Height {lashingBridges === 'Yes' && <span className="text-rose-500">*</span>}
              </label>
              <select
                value={lashingBridgeHeight}
                onChange={(e) => setLashingBridgeHeight(e.target.value)}
                disabled={lashingBridges !== 'Yes'}
                className={`w-full p-3 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                  lashingBridges === 'Yes'
                    ? 'bg-slate-50 border border-slate-300 text-navy-900 focus:ring-2 focus:ring-navy-600'
                    : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <option value="">-- Select Height --</option>
                <option value="1 Height">1 Height</option>
                <option value="2 Height">2 Height</option>
                <option value="3 Height">3 Height</option>
                <option value="4 Height">4 Height</option>
                <option value="5 Height">5 Height</option>
                <option value="6 Height">6 Height</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Basic Information & Specs (Optional)
          </label>
          <textarea
            value={basicInformation}
            onChange={(e) => setBasicInformation(e.target.value)}
            rows={4}
            placeholder="Enter dimensions, gross tonnage, engine specifications, or general overview..."
            className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-navy-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Main Vessel Photographs
          </label>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="flex items-center justify-center gap-2 p-3 bg-ocean-50 border border-ocean-200 hover:bg-ocean-100 rounded-xl text-ocean-800 text-xs font-bold cursor-pointer transition-colors min-h-[44px]">
              <Camera className="w-4 h-4 text-ocean-600" />
              <span>Take Photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            <label className="flex items-center justify-center gap-2 p-3 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-xl text-slate-800 text-xs font-bold cursor-pointer transition-colors min-h-[44px]">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Upload Files</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {uploading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-ocean-700 p-2 bg-ocean-50 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-ocean-600" />
              <span>Uploading photo...</span>
            </div>
          )}

          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-300">
                  <img src={photo.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors min-h-[44px]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-navy-800 hover:bg-navy-900 transition-colors shadow-md min-h-[44px]"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            <span>{saving ? 'Creating Profile...' : 'Save & Open Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
