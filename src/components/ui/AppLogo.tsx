import React from 'react';
import Link from 'next/link';
import { Anchor, Ship } from 'lucide-react';

interface AppLogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = '', iconOnly = false }) => {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group focus:outline-none ${className}`}>
      <div className="w-10 h-10 rounded-lg bg-navy-600 group-hover:bg-navy-700 flex items-center justify-center text-white shadow-sm transition-colors">
        <Ship className="w-6 h-6 stroke-[2.2]" />
      </div>
      {!iconOnly && (
        <div className="flex flex-col">
          <span className="font-bold text-navy-800 tracking-tight text-lg leading-none uppercase font-sans">
            VESSEL LIBRARY
          </span>
          <span className="text-[10px] font-semibold text-ocean-600 tracking-widest uppercase mt-0.5">
            Maritime System
          </span>
        </div>
      )}
    </Link>
  );
};

export default AppLogo;
