'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Smartphone, Download, CheckCircle2, ArrowRight, ArrowLeft, Shield, Sparkles, HelpCircle } from 'lucide-react';

export default function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if in standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setInstalled(true);
    }

    const ua = window.navigator.userAgent.toLowerCase();
    setIsAndroid(/android/.test(ua));

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      window.dispatchEvent(new Event('open-pwa-install'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-8 font-sans">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to App</span>
        </Link>
        <span className="text-xs font-mono font-bold text-ocean-700 bg-ocean-50 border border-ocean-200 px-2.5 py-1 rounded-md">
          Android PWA WebAPK
        </span>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center p-6 sm:p-8 space-y-6">
        <div className="w-20 h-20 rounded-2xl mx-auto overflow-hidden bg-navy-900 shadow-lg p-2 flex items-center justify-center">
          <img src="/icon-192.png" alt="VESSEL LIBRARY App Icon" className="w-full h-full object-cover rounded-xl" />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 uppercase tracking-tight">
            VESSEL LIBRARY Mobile App
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5 max-w-md mx-auto">
            Install on any Android smartphone or tablet (older & new versions) for 1-tap full-screen access.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="pt-2">
          {installed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold text-sm shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Application is already installed!</span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-navy-800 hover:bg-navy-900 active:scale-98 text-white font-extrabold text-sm sm:text-base shadow-lg transition-all min-h-[52px] w-full sm:w-auto cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>{deferredPrompt ? 'Install App (1-Click)' : 'Install on Android Phone'}</span>
            </button>
          )}
        </div>

        {/* Features Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-left">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compatibility</span>
            <span className="text-xs font-bold text-navy-900">All Android 5.0 - 15+</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">App Size</span>
            <span className="text-xs font-bold text-navy-900">&lt; 1 MB (Super Fast)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">App Store</span>
            <span className="text-xs font-bold text-navy-900">No Play Store needed</span>
          </div>
        </div>
      </div>

      {/* Detailed Installation Instructions by Android Version */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-extrabold text-navy-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-ocean-600" />
            <span>How to Install on Any Android Version</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Follow the quick 3-step guide for your Android browser:
          </p>
        </div>

        {/* Method 1: Modern Android (Chrome / Edge) */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-navy-900 uppercase tracking-wider">
              Method A: Google Chrome / Microsoft Edge (Android 8 to 15)
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Automatic 1-Tap
            </span>
          </div>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1.5 font-medium">
            <li>Tap the <strong>"Install App (1-Click)"</strong> button above or the prompt at the bottom of the screen.</li>
            <li>When the Android dialog appears, tap <strong>"Install"</strong>.</li>
            <li>The app will automatically download to your home screen and app drawer like a native app.</li>
          </ol>
        </div>

        {/* Method 2: Older Android & Samsung Internet */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-navy-900 uppercase tracking-wider">
              Method B: Older Android (Android 5, 6, 7) or Samsung Internet / Firefox
            </span>
            <span className="bg-ocean-100 text-ocean-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Manual Add
            </span>
          </div>
          <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1.5 font-medium">
            <li>Tap the browser menu <strong>⋮ (3 vertical dots)</strong> at the top right of your browser.</li>
            <li>Look for and tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
            <li>Tap <strong>"Add"</strong> or <strong>"Install"</strong> to confirm.</li>
          </ol>
        </div>

        {/* Benefit Highlight */}
        <div className="p-4 bg-ocean-50/70 border border-ocean-200 rounded-xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-ocean-600 shrink-0 mt-0.5" />
          <div className="text-xs text-ocean-950 space-y-1">
            <span className="font-bold block">Why this works without Play Store:</span>
            <p className="text-slate-600 leading-relaxed">
              Android automatically converts this Progressive Web App (PWA) into an independent WebAPK package. It launches in full screen without the browser address bar, updates automatically, and uses almost zero battery or phone storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

