import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import { PWAInstallPrompt } from '@/components/ui/PWAInstallPrompt';

export const metadata: Metadata = {
  title: 'VESSEL LIBRARY — Fleet Management & Technical Documentation',
  description: 'Private technical application for managing vessel profiles, structural specifications, operational challenges, damages, and notes.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vessel Library',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0F172A',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-surface" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vessel Library" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased text-navy-900 bg-surface" suppressHydrationWarning>
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <footer className="bg-navy-900 text-white border-t border-navy-800 py-6 mt-12 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-white">VESSEL LIBRARY © {new Date().getFullYear()}</span>
            <span>Maritime Technical Documentation System • IT Support</span>
          </div>
        </footer>

        {/* Mobile PWA Add to Home Screen Banner Prompt */}
        <PWAInstallPrompt />
      </body>
    </html>
  );
}
