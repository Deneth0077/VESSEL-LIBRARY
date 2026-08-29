import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'VESSEL LIBRARY — Fleet Management & Technical Documentation',
  description: 'Private technical application for managing vessel profiles, structural specifications, operational challenges, damages, and notes.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-surface">
      <body className="min-h-full flex flex-col font-sans antialiased text-navy-900 bg-surface">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <footer className="bg-navy-900 text-white border-t border-navy-800 py-6 mt-12 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-semibold text-white">VESSEL LIBRARY © {new Date().getFullYear()}</span>
            <span>Maritime Technical Documentation System • Confidential Client Access</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
