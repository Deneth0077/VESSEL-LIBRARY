import React from 'react';
import Link from 'next/link';
import { Ship, Flag, Hash, Calendar, ChevronRight, Radio } from 'lucide-react';
import { IVessel } from '@/types';

interface VesselCardProps {
  vessel: IVessel;
}

export const VesselCard: React.FC<VesselCardProps> = ({ vessel }) => {
  const mainPhoto = vessel.mainPhotographs?.[0]?.url;

  return (
    <Link
      href={`/vessels/${vessel._id}`}
      className="group bg-white rounded-xl border border-slate-200 hover:border-navy-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row overflow-hidden font-sans"
    >
      <div className="relative w-full sm:w-52 h-44 sm:h-auto bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={vessel.vesselName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 p-4">
            <Ship className="w-10 h-10 mb-1 stroke-[1.5] text-slate-300" />
            <span className="text-[10px] font-bold tracking-widest uppercase">No Photograph</span>
          </div>
        )}
        <div className="absolute top-2 left-2 bg-navy-900/85 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
          {vessel.vesselType}
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-base sm:text-lg text-navy-900 group-hover:text-ocean-600 transition-colors uppercase tracking-tight font-sans">
              {vessel.vesselName}
            </h3>
            <span className="inline-flex items-center gap-1 bg-ocean-50 text-ocean-800 font-mono text-xs font-bold px-2.5 py-0.5 rounded-md border border-ocean-200">
              <Hash className="w-3 h-3 text-ocean-600" />
              {vessel.imoNumber}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-ocean-600" />
              <span className="font-medium">Flag:</span>
              <span className="text-navy-900 font-bold">{vessel.flag}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-ocean-600" />
              <span className="font-medium">Built:</span>
              <span className="text-navy-900 font-bold">{vessel.yearBuilt}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-ocean-600" />
              <span className="font-medium">Call Sign:</span>
              <span className="text-navy-900 font-mono font-semibold">{vessel.callSign}</span>
            </div>
            <div className="col-span-2 flex items-center gap-1.5 truncate mt-0.5">
              <span className="font-medium text-slate-400">Owner:</span>
              <span className="text-navy-800 font-semibold truncate">{vessel.ownerOperator}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-ocean-600 group-hover:text-ocean-700">
          <span>Open Technical Profile</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

export default VesselCard;
