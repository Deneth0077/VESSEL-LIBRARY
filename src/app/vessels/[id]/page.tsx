'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { IVessel, IUser, SectionType } from '@/types';
import { BasicInformation } from '@/components/vessels/BasicInformation';
import { VesselSectionAccordion } from '@/components/vessels/VesselSectionAccordion';
import { VesselFullDetailsModal } from '@/components/vessels/VesselFullDetailsModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ArrowLeft, Trash2, Loader2, AlertCircle, Layers, FileText, Printer, Eye, CheckCircle2 } from 'lucide-react';

export default function VesselProfilePage() {
  const router = useRouter();
  const params = useParams();
  const vesselId = params.id as string;

  const [vessel, setVessel] = useState<IVessel | null>(null);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFullDetailsModal, setShowFullDetailsModal] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('ALL');

  const fetchVesselAndUser = async () => {
    try {
      setLoading(true);
      setError('');

      // Check current session
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        router.push('/login');
        return;
      }
      const meData = await meRes.json();
      setCurrentUser(meData.user);

      // Fetch vessel details
      const vesselRes = await fetch(`/api/vessels/${vesselId}`);
      if (!vesselRes.ok) {
        if (vesselRes.status === 404) {
          setError('Vessel profile not found.');
        } else {
          setError('Failed to load vessel profile.');
        }
        return;
      }

      const vesselData = await vesselRes.json();
      setVessel(vesselData.vessel);
    } catch (err) {
      setError('Network error loading vessel profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vesselId) {
      fetchVesselAndUser();
    }
  }, [vesselId]);

  const handleDeleteVessel = async () => {
    try {
      const res = await fetch(`/api/vessels/${vesselId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/');
      } else {
        alert('Failed to delete vessel profile.');
      }
    } catch (err) {
      alert('Error deleting vessel profile.');
    }
  };

  const handleDropdownSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setOpenSection(selected || null);
    if (selected && selected !== 'ALL') {
      const el = document.getElementById(`section-${selected}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePrint = () => {
    setOpenSection('ALL');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-navy-700" />
        <span className="text-sm font-semibold text-slate-600">Loading Vessel Profile...</span>
      </div>
    );
  }

  if (error || !vessel) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-navy-900">{error || 'Vessel Not Found'}</h2>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 text-white font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Vessel Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Vessel Profile Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            title="Back to Directory"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900 uppercase tracking-tight font-sans truncate">
                {vessel.vesselName}
              </h1>
              <span className="bg-ocean-100 text-ocean-800 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border border-ocean-200 shrink-0">
                IMO {vessel.imoNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
              {vessel.vesselType} • {vessel.flag} Flag State
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFullDetailsModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 active:scale-95 text-white font-extrabold text-xs shadow-xs transition-all min-h-[44px] shrink-0 cursor-pointer"
          >
            <Eye className="w-4 h-4 text-ocean-300" />
            <span>View Details</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-navy-900 font-bold text-xs border border-slate-300 transition-all min-h-[44px] shrink-0 cursor-pointer"
            title="Print or Save PDF Report"
          >
            <Printer className="w-4 h-4 text-navy-700" />
            <span>Print / PDF</span>
          </button>

          {currentUser?.role === 'ADMIN' && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 font-bold text-xs border border-rose-200 transition-all min-h-[44px] shrink-0 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Delete Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: BASIC INFORMATION (AUTOMATICALLY VISIBLE BY DEFAULT) */}
      <div id="section-BASIC_INFO" className="scroll-mt-20">
        <BasicInformation vessel={vessel} currentUser={currentUser} onUpdateVessel={fetchVesselAndUser} />
      </div>



      {/* SECTIONS 2-6 ACCORDIONS */}
      <div className="space-y-4 pt-2">
        <div className="px-1 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Vessel Technical Sections & Documentation
          </h2>
          {openSection === 'ALL' && (
            <span className="text-xs font-bold text-teal-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Full Master View Active (All Sections Visible)
            </span>
          )}
        </div>

        {/* 2. Vessel Structure */}
        <VesselSectionAccordion
          vesselId={vesselId}
          section="STRUCTURE"
          title="2. Vessel Structure"
          currentUser={currentUser}
          isOpen={openSection === 'ALL' || openSection === 'STRUCTURE'}
          onToggle={() => setOpenSection(openSection === 'STRUCTURE' ? null : 'STRUCTURE')}
        />

        {/* 3. Vessel Structural Damages */}
        <VesselSectionAccordion
          vesselId={vesselId}
          section="STRUCTURAL_DAMAGE"
          title="3. Vessel Structural Damages"
          currentUser={currentUser}
          isOpen={openSection === 'ALL' || openSection === 'STRUCTURAL_DAMAGE'}
          onToggle={() => setOpenSection(openSection === 'STRUCTURAL_DAMAGE' ? null : 'STRUCTURAL_DAMAGE')}
        />

        {/* 4. Operational Challenges */}
        <VesselSectionAccordion
          vesselId={vesselId}
          section="OPERATIONAL_CHALLENGE"
          title="4. Operational Challenges"
          currentUser={currentUser}
          isOpen={openSection === 'ALL' || openSection === 'OPERATIONAL_CHALLENGE'}
          onToggle={() => setOpenSection(openSection === 'OPERATIONAL_CHALLENGE' ? null : 'OPERATIONAL_CHALLENGE')}
        />

        {/* 5. Special Notes */}
        <VesselSectionAccordion
          vesselId={vesselId}
          section="SPECIAL_NOTE"
          title="5. Special Notes"
          currentUser={currentUser}
          isOpen={openSection === 'ALL' || openSection === 'SPECIAL_NOTE'}
          onToggle={() => setOpenSection(openSection === 'SPECIAL_NOTE' ? null : 'SPECIAL_NOTE')}
        />

        {/* 6. Remarks */}
        <VesselSectionAccordion
          vesselId={vesselId}
          section="REMARK"
          title="6. Remarks"
          currentUser={currentUser}
          isOpen={openSection === 'ALL' || openSection === 'REMARK'}
          onToggle={() => setOpenSection(openSection === 'REMARK' ? null : 'REMARK')}
        />
      </div>

      {/* Admin Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Entire Vessel Profile"
        message={`Are you sure you want to permanently delete "${vessel.vesselName}" (IMO: ${vessel.imoNumber}) and all associated section entries and photographs? This action cannot be undone.`}
        confirmLabel="Permanently Delete Vessel"
        onConfirm={handleDeleteVessel}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Structured Master Technical Dossier Modal */}
      <VesselFullDetailsModal
        isOpen={showFullDetailsModal}
        onClose={() => setShowFullDetailsModal(false)}
        vessel={vessel}
        currentUser={currentUser}
      />
    </div>
  );
}
