'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share, Plus, CheckCircle2, MoreVertical, ExternalLink } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for PWA (Mandatory for Android WebAPK install)
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('VESSEL LIBRARY Service Worker active:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration note:', err);
        });
    }

    // 2. Check if already installed & running in standalone display mode
    const inStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (inStandaloneMode) {
      setIsStandalone(true);
      return;
    }

    // 3. Device detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    const isAndroidDevice = /android/.test(ua);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);

    // 4. Capture native Chrome / Android PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('pwa_prompt_dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Allow any button in the app (e.g. Header) to trigger the install modal
    const handleOpenInstall = () => {
      if (deferredPrompt) {
        handleInstallClick();
      } else {
        setShowHelpModal(true);
      }
    };

    window.addEventListener('open-pwa-install', handleOpenInstall);

    // 6. For Android or iOS where beforeinstallprompt may not fire automatically (older versions)
    if ((isAndroidDevice || isIosDevice) && !sessionStorage.getItem('pwa_prompt_dismissed')) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('open-pwa-install', handleOpenInstall);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('open-pwa-install', handleOpenInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowHelpModal(true);
      }
    } else {
      // Fallback for older Android / iOS: show step-by-step visual instructions
      setShowHelpModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom Install Banner */}
      {showPrompt && (
        <div className="fixed bottom-3 inset-x-3 z-50 max-w-lg mx-auto bg-navy-900 text-white rounded-2xl shadow-2xl border border-navy-700 p-4 animate-in slide-in-from-bottom duration-300 font-sans print:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-navy-800 border border-white/15 flex items-center justify-center shrink-0 shadow-md">
                <img
                  src="/icon-192.png"
                  alt="Vessel Library Icon"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-sm text-white uppercase tracking-tight truncate">
                    VESSEL LIBRARY Mobile App
                  </h4>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                    ANDROID & iOS
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-0.5 leading-snug">
                  Install on your Android device for fast 1-tap offline-ready mobile access.
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

          <div className="mt-3 pt-2.5 border-t border-navy-800 flex items-center justify-end gap-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              Later
            </button>

            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ocean-500 hover:bg-ocean-600 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer min-h-[38px]"
            >
              <Download className="w-4 h-4" />
              <span>{deferredPrompt ? 'Install App (1-Tap)' : 'Install on Android'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Universal Step-by-Step Installation Modal (For Older Android, Samsung Internet, Firefox & iOS) */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 font-sans">
          <div className="bg-white text-navy-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-navy-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 p-1 border border-white/20">
                  <img src="/icon-192.png" alt="App Icon" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight">Install VESSEL LIBRARY</h3>
                  <p className="text-xs text-ocean-300 font-medium">Compatible with Any Android Version</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div className="p-3 bg-ocean-50 border border-ocean-200 rounded-xl text-xs text-ocean-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-ocean-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Installs directly to your home screen!</strong>
                  Works on older Android (Android 5.0+) and new Android (Android 14/15) without needing the Google Play Store.
                </div>
              </div>

              {/* Android Instructions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-ocean-600" />
                  <span>How to install on Android (Chrome / Samsung / Firefox)</span>
                </h4>

                <ol className="space-y-2.5 text-xs text-slate-700 font-medium">
                  <li className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-navy-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <div>
                      Tap the browser menu <strong className="text-navy-900">⋮ (3 dots)</strong> at the top right (or bottom in Samsung Internet).
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-navy-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <div>
                      Select <strong className="text-ocean-700">"Install app"</strong> or <strong className="text-ocean-700">"Add to Home screen"</strong>.
                    </div>
                  </li>

                  <li className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-navy-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <div>
                      Tap <strong className="text-emerald-700">"Add" / "Install"</strong>. The app icon will appear in your phone's app list!
                    </div>
                  </li>
                </ol>
              </div>

              {/* iOS Instructions */}
              {isIOS && (
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Share className="w-4 h-4 text-ocean-600" />
                    <span>How to install on iPhone (Safari)</span>
                  </h4>
                  <p className="text-xs text-slate-600">
                    Tap the <strong>Share</strong> button 📤 in Safari, scroll down and tap <strong>Add to Home Screen</strong> ➕.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 active:scale-95 text-white font-bold text-xs shadow-sm transition-all"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
