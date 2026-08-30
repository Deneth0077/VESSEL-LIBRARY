'use client';

import React, { useState, useEffect } from 'react';
import { IVessel, IPhotograph } from '@/types';
import { X, Loader2, Save, Camera, Upload, Edit } from 'lucide-react';

interface EditVesselModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessel: IVessel;
  onSaveSuccess: () => void;
}

export const EditVesselModal: React.FC<EditVesselModalProps> = ({
  isOpen,
  onClose,
  vessel,
  onSaveSuccess,
}) => {
  const [vesselName, setVesselName] = useState(vessel.vesselName || '');
  const [imoNumber, setImoNumber] = useState(vessel.imoNumber || '');
  const [vesselType, setVesselType] = useState(vessel.vesselType || 'Bulk Carrier');
  const [flag, setFlag] = useState(vessel.flag || '');
  const [ownerOperator, setOwnerOperator] = useState(vessel.ownerOperator || '');
  const [callSign, setCallSign] = useState(vessel.callSign || '');
  const [yearBuilt, setYearBuilt] = useState<number>(vessel.yearBuilt || 2020);

  const [loa, setLoa] = useState(vessel.loa || '');
  const [beam, setBeam] = useState(vessel.beam || '');
  const [keelToDeck, setKeelToDeck] = useState(vessel.keelToDeck || '');
  const [numberOfBays, setNumberOfBays] = useState(vessel.numberOfBays || '');
  const [numberOfRows, setNumberOfRows] = useState(vessel.numberOfRows || '');
  const [lashingBridges, setLashingBridges] = useState<'Yes' | 'No' | ''>(vessel.lashingBridges || '');
  const [lashingBridgeHeight, setLashingBridgeHeight] = useState(vessel.lashingBridgeHeight || '');

  const [basicInformation, setBasicInformation] = useState(vessel.basicInformation || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vessel) {
      setVesselName(vessel.vesselName || '');
      setImoNumber(vessel.imoNumber || '');
      setVesselType(vessel.vesselType || 'Bulk Carrier');
      setFlag(vessel.flag || '');
      setOwnerOperator(vessel.ownerOperator || '');
      setCallSign(vessel.callSign || '');
      setYearBuilt(vessel.yearBuilt || 2020);
      setLoa(vessel.loa || '');
      setBeam(vessel.beam || '');
      setKeelToDeck(vessel.keelToDeck || '');
      setNumberOfBays(vessel.numberOfBays || '');
      setNumberOfRows(vessel.numberOfRows || '');
      setLashingBridges(vessel.lashingBridges || '');
      setLashingBridgeHeight(vessel.lashingBridgeHeight || '');
      setBasicInformation(vessel.basicInformation || '');
    }
  }, [vessel, isOpen]);

  const handleLashingBridgeChange = (val: 'Yes' | 'No' | '') => {
    setLashingBridges(val);
    if (val !== 'Yes') {
      setLashingBridgeHeight('');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vesselName || !vesselType) {
      setError('Please fill in Vessel Name and Vessel Type.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const res = await fetch(`/api/vessels/${vessel._id}`, {
        method: 'PATCH',
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
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to update vessel specifications.');
        return;
      }

      onSaveSuccess();
      onClose();
    } catch (err: any) {
      setError('Network error updating vessel specifications.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col max-h-[92vh] font-sans my-auto">
        
        {/* Header */}
        <div className="bg-navy-900 text-white px-5 py-4 flex items-center justify-between border-b border-navy-800 shrink-0">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-ocean-300" />
            <h2 className="text-base font-extrabold uppercase tracking-tight">Edit Vessel Specifications</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-600 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Core Info */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy-900 border-b border-slate-100 pb-2">
              Primary Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vessel Name *</label>
                <input
                  type="text"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold uppercase text-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Vessel Type *</label>
                <select
                  value={vesselType}
                  onChange={(e) => setVesselType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-navy-900"
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">IMO Number (Optional)</label>
                <input
                  type="text"
                  value={imoNumber}
                  onChange={(e) => setImoNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-ocean-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Flag State (Optional)</label>
                <input
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Shipping Line (Optional)</label>
                <input
                  type="text"
                  value={ownerOperator}
                  onChange={(e) => setOwnerOperator(e.target.value)}
                  placeholder="e.g. MSC / Maersk / CMA CGM"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Call Sign (Optional)</label>
                <input
                  type="text"
                  value={callSign}
                  onChange={(e) => setCallSign(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Year Built (Optional)</label>
                <input
                  type="number"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(parseInt(e.target.value) || 2020)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-navy-900"
                />
              </div>
            </div>
          </div>

          {/* Technical Dimensions & Cargo Specs */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy-900 border-b border-slate-100 pb-2">
              Technical Dimensions & Cargo Specs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">LOA (Length Over All)</label>
                <input
                  type="text"
                  value={loa}
                  onChange={(e) => setLoa(e.target.value)}
                  placeholder="e.g. 199.9 m"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Beam</label>
                <input
                  type="text"
                  value={beam}
                  onChange={(e) => setBeam(e.target.value)}
                  placeholder="e.g. 32.2 m"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Length Keel to Deck</label>
                <input
                  type="text"
                  value={keelToDeck}
                  onChange={(e) => setKeelToDeck(e.target.value)}
                  placeholder="e.g. 18.5 m"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Number of Bays</label>
                <input
                  type="text"
                  value={numberOfBays}
                  onChange={(e) => setNumberOfBays(e.target.value)}
                  placeholder="e.g. 24"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Number of Rows</label>
                <input
                  type="text"
                  value={numberOfRows}
                  onChange={(e) => setNumberOfRows(e.target.value)}
                  placeholder="e.g. 13"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            {/* Lashing Bridges & Conditional Height */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Lashing Bridges (Yes / No)
                </label>
                <select
                  value={lashingBridges}
                  onChange={(e) => handleLashingBridgeChange(e.target.value as 'Yes' | 'No' | '')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-navy-900"
                >
                  <option value="">-- Select Lashing Bridges --</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Lashing Bridge Height {lashingBridges === 'Yes' && <span className="text-rose-500">*</span>}
                </label>
                <select
                  value={lashingBridgeHeight}
                  onChange={(e) => setLashingBridgeHeight(e.target.value)}
                  disabled={lashingBridges !== 'Yes'}
                  className={`w-full p-2.5 rounded-lg text-xs font-semibold transition-all ${
                    lashingBridges === 'Yes'
                      ? 'bg-slate-50 border border-slate-300 text-navy-900'
                      : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <option value="">-- Select Height --</option>
                  <option value="1 High">1 High</option>
                  <option value="2 High">2 High</option>
                  <option value="3 High">3 High</option>
                  <option value="4 High">4 High</option>
                  <option value="5 High">5 High</option>
                  <option value="6 High">6 High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Basic Notes */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Additional Specifications & Notes
            </label>
            <textarea
              value={basicInformation}
              onChange={(e) => setBasicInformation(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-navy-800 hover:bg-navy-900 active:scale-95 transition-all shadow-xs"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Specifications'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVesselModal;
