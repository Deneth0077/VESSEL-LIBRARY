'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ExportButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ variant = 'secondary', className = '' }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/export/excel');
      if (!res.ok) {
        throw new Error('Failed to download Excel file');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Vessel_Library_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Error exporting Excel report.');
    } finally {
      setLoading(false);
    }
  };

  const styleClasses = {
    primary: 'bg-navy-600 hover:bg-navy-700 text-white shadow-sm',
    secondary: 'bg-ocean-500 hover:bg-ocean-600 text-white shadow-sm',
    outline: 'bg-white hover:bg-slate-50 text-navy-800 border border-slate-300',
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all min-h-[44px] ${styleClasses[variant]} ${className}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <FileSpreadsheet className="w-4 h-4 text-current" />
      )}
      <span>Export to Excel</span>
    </button>
  );
};

export default ExportButton;
