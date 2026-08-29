'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, Plus, CheckCircle2 } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (installed as PWA)
    const inStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (inStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    // Handle Chrome / Android PWA Install Event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show prompt if not already dismissed in this session
    if (iosDevice && !sessionStorage.getItem('pwa_ios_prompt_dismissed')) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      sessionStorage.setItem('pwa_ios_prompt_dismissed', 'true');
    }
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-3 inset-x-3 z-50 max-w-lg mx-auto bg-navy-900 text-white rounded-2xl shadow-2xl border border-navy-700 p-4 animate-in slide-in-from-bottom duration-300 font-sans print:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-navy-800 border border-white/15 flex items-center justify-center shrink-0 shadow-md">
            <img src="/icon-192.png" alt="Vessel Library Icon" className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-sm text-white uppercase tracking-tight truncate font-sans">
                VESSEL LIBRARY Mobile App
              </h4>
              <span className="bg-ocean-500/20 text-ocean-300 border border-ocean-400/30 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                APP
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5 leading-snug">
              Add to your phone Home Screen for instant 1-tap mobile access.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Dismiss app install banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Android / Chrome 1-Click Install Button */}
      {deferredPrompt && (
        <div className="mt-3 pt-2.5 border-t border-navy-800 flex items-center justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10"
          >
            Not Now
          </button>

          <button
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ocean-500 hover:bg-ocean-600 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer min-h-[38px]"
          >
            <Download className="w-4 h-4" />
            <span>Install App on Home Screen</span>
          </button>
        </div>
      )}

      {/* iOS Safari Installation Steps Guide */}
      {isIOS && !deferredPrompt && (
        <div className="mt-3 pt-2.5 border-t border-navy-800 space-y-1.5 text-xs text-slate-200">
          <p className="font-semibold text-ocean-300 flex items-center gap-1">
            <Share className="w-3.5 h-3.5" />
            How to install on iPhone / iPad:
          </p>
          <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-0.5 font-medium">
            <li>Tap the <strong className="text-white">Share</strong> button 📤 in Safari.</li>
            <li>Scroll down & tap <strong className="text-white">Add to Home Screen</strong> ➕.</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default PWAInstallPrompt;
