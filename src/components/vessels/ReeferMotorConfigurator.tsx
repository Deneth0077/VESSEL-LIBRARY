'use client';

import React, { useState, useEffect } from 'react';
import { IVessel, IReeferMotorConfig, IUser } from '@/types';
import { Anchor, ArrowRight, ArrowLeft, Cpu, Save, Check, Sparkles, SlidersHorizontal } from 'lucide-react';

interface ReeferMotorConfiguratorProps {
  vessel: IVessel;
  currentUser?: IUser | null;
  onUpdateVessel?: () => void;
}

export const ReeferMotorConfigurator: React.FC<ReeferMotorConfiguratorProps> = ({
  vessel,
  currentUser,
  onUpdateVessel,
}) => {
  const canModify = !!currentUser && currentUser.status === 'APPROVED';

  // Parse or construct default bay list from vessel.numberOfBays
  const generateInitialBays = (): string[] => {
    if (!vessel.numberOfBays) {
      return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    }

    const raw = vessel.numberOfBays.trim();
    if (/^\d+$/.test(raw)) {
      const count = Math.min(Math.max(parseInt(raw, 10), 1), 60);
      return Array.from({ length: count }, (_, i) => String(i + 1).padStart(2, '0'));
    }

    if (raw.includes(',')) {
      return raw.split(',').map((b) => b.trim()).filter(Boolean);
    }

    return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  };

  const [bays, setBays] = useState<string[]>(generateInitialBays());
  const [config, setConfig] = useState<IReeferMotorConfig>(vessel.reeferMotorConfig || {});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [customBayInput, setCustomBayInput] = useState('');

  useEffect(() => {
    setConfig(vessel.reeferMotorConfig || {});
    setBays(generateInitialBays());
  }, [vessel]);

  const handleToggle = (bay: string, level: 'deck' | 'hold', status: 'FWD' | 'AFT' | 'N/A') => {
    if (!canModify) return;

    setConfig((prev) => {
      const currentBay = prev[bay] || { deck: '', hold: '' };
      const updatedLevel = currentBay[level] === status ? '' : status;

      return {
        ...prev,
        [bay]: {
          ...currentBay,
          [level]: updatedLevel,
        },
      };
    });
  };

  const applyBulkPreset = (level: 'deck' | 'hold' | 'all', value: 'FWD' | 'AFT' | 'N/A') => {
    if (!canModify) return;

    setConfig((prev) => {
      const updated = { ...prev };
      bays.forEach((bay) => {
        const currentBay = updated[bay] || { deck: '', hold: '' };
        if (level === 'all') {
          updated[bay] = { deck: value, hold: value };
        } else {
          updated[bay] = {
            ...currentBay,
            [level]: value,
          };
        }
      });
      return updated;
    });
  };

  const handleSave = async () => {
    if (!canModify) return;

    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await fetch(`/api/vessels/${vessel._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reeferMotorConfig: config }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save reefer motor configuration.');
      }

      setSuccessMessage('Reefer Motor Configuration saved successfully!');
      setTimeout(() => setSuccessMessage(''), 4000);

      if (onUpdateVessel) onUpdateVessel();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving configuration.');
    } finally {
      setSaving(false);
    }
  };

  const addCustomBay = () => {
    if (!customBayInput.trim()) return;
    const formatted = customBayInput.trim().padStart(2, '0');
    if (!bays.includes(formatted)) {
      setBays((prev) => [...prev, formatted].sort((a, b) => parseInt(a, 10) - parseInt(b, 10)));
    }
    setCustomBayInput('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 font-sans">
      {/* Header Bar */}
      <div className="bg-navy-900 text-white p-4 sm:px-5 flex flex-wrap items-center justify-between gap-3 border-b border-navy-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-ocean-500/20 border border-ocean-400/30 text-ocean-300">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-tight text-white flex items-center gap-2">
              <span>Reefer Motor Configuration</span>
              <span className="text-[10px] bg-ocean-500 text-white px-2 py-0.5 rounded-full font-mono font-extrabold">
                {bays.length} BAYS
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Graphical bay layout for container reefer motor orientation (FWD vs AFT) on Deck & Hold levels.
            </p>
          </div>
        </div>

        {canModify && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-md cursor-pointer min-h-[42px]"
          >
            {saving ? <Sparkles className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Messages */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-extrabold">
            {errorMessage}
          </div>
        )}

        {/* Visual Ship Orientation Banner */}
        <div className="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between text-xs font-bold font-mono border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2 text-emerald-400">
            <ArrowLeft className="w-4 h-4" />
            <span>BOW / FORWARD (FWD)</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-slate-400 text-[11px] font-sans">
            <Anchor className="w-4 h-4 text-ocean-400" />
            <span>Vessel Longitudinal Profile Map</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <span>STERN / AFT (AFT)</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Quick Bulk Presets Bar */}
        {canModify && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-navy-900 uppercase tracking-wider flex items-center gap-1.5 font-mono text-[11px]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-navy-700" />
              <span>Bulk Quick Presets:</span>
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => applyBulkPreset('deck', 'FWD')}
                className="px-2.5 py-1 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded-lg font-bold border border-emerald-300 text-[11px] cursor-pointer"
              >
                Deck: All FWD
              </button>
              <button
                type="button"
                onClick={() => applyBulkPreset('deck', 'AFT')}
                className="px-2.5 py-1 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-lg font-bold border border-amber-300 text-[11px] cursor-pointer"
              >
                Deck: All AFT
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => applyBulkPreset('hold', 'FWD')}
                className="px-2.5 py-1 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded-lg font-bold border border-emerald-300 text-[11px] cursor-pointer"
              >
                Hold: All FWD
              </button>
              <button
                type="button"
                onClick={() => applyBulkPreset('hold', 'AFT')}
                className="px-2.5 py-1 bg-amber-100 text-amber-900 hover:bg-amber-200 rounded-lg font-bold border border-amber-300 text-[11px] cursor-pointer"
              >
                Hold: All AFT
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => applyBulkPreset('all', 'FWD')}
                className="px-2.5 py-1 bg-navy-800 text-white hover:bg-navy-900 rounded-lg font-bold text-[11px] cursor-pointer"
              >
                Set All: FWD
              </button>
            </div>
          </div>
        )}

        {/* Graphical Bay Plan Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-stretch gap-3 min-w-max">
            {bays.map((bay) => {
              const bayData = config[bay] || { deck: '', hold: '' };
              const deckStatus = bayData.deck || '';
              const holdStatus = bayData.hold || '';

              return (
                <div
                  key={bay}
                  className="bg-white rounded-xl border border-slate-300 shadow-xs hover:shadow-md transition-shadow flex flex-col w-36 overflow-hidden"
                >
                  {/* Bay Header */}
                  <div className="bg-navy-900 text-white px-3 py-2 text-center border-b border-navy-800">
                    <span className="text-[10px] text-ocean-300 font-mono block font-bold uppercase">CONTAINER BAY</span>
                    <span className="text-sm font-extrabold font-mono tracking-wider">BAY {bay}</span>
                  </div>

                  {/* DECK LEVEL BLOCK */}
                  <div className="p-2.5 bg-slate-50/70 border-b border-slate-200 space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">DECK</span>
                      {deckStatus && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                            deckStatus === 'FWD'
                              ? 'bg-emerald-500 text-white'
                              : deckStatus === 'AFT'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-300 text-slate-700'
                          }`}
                        >
                          {deckStatus}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        disabled={!canModify}
                        onClick={() => handleToggle(bay, 'deck', 'FWD')}
                        className={`p-1.5 rounded-lg border text-[11px] font-extrabold font-mono transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          deckStatus === 'FWD'
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                        } ${!canModify ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>FWD</span>
                      </button>

                      <button
                        type="button"
                        disabled={!canModify}
                        onClick={() => handleToggle(bay, 'deck', 'AFT')}
                        className={`p-1.5 rounded-lg border text-[11px] font-extrabold font-mono transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          deckStatus === 'AFT'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                        } ${!canModify ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <span>AFT</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* HOLD LEVEL BLOCK */}
                  <div className="p-2.5 bg-slate-100/50 space-y-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">HOLD</span>
                      {holdStatus && (
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono ${
                            holdStatus === 'FWD'
                              ? 'bg-emerald-500 text-white'
                              : holdStatus === 'AFT'
                              ? 'bg-amber-500 text-white'
                              : 'bg-slate-300 text-slate-700'
                          }`}
                        >
                          {holdStatus}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-1">
                      <button
                        type="button"
                        disabled={!canModify}
                        onClick={() => handleToggle(bay, 'hold', 'FWD')}
                        className={`p-1.5 rounded-lg border text-[11px] font-extrabold font-mono transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          holdStatus === 'FWD'
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                        } ${!canModify ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>FWD</span>
                      </button>

                      <button
                        type="button"
                        disabled={!canModify}
                        onClick={() => handleToggle(bay, 'hold', 'AFT')}
                        className={`p-1.5 rounded-lg border text-[11px] font-extrabold font-mono transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          holdStatus === 'AFT'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-300'
                        } ${!canModify ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <span>AFT</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Bay Adder for Custom Layouts */}
        {canModify && (
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customBayInput}
                onChange={(e) => setCustomBayInput(e.target.value)}
                placeholder="Add Bay Number (e.g. 29)"
                className="p-2 border border-slate-300 rounded-lg text-slate-900 font-mono text-xs w-44"
              />
              <button
                type="button"
                onClick={addCustomBay}
                className="px-3 py-2 bg-navy-800 text-white rounded-lg font-bold hover:bg-navy-900 cursor-pointer"
              >
                + Add Bay Slot
              </button>
            </div>

            <span className="text-[11px] text-slate-400 italic">
              Note: Click FWD or AFT button to toggle motor direction for each bay's Deck and Hold level.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReeferMotorConfigurator;
