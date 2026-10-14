import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Brain } from 'lucide-react';
import './globals.css';

export const metadata: Metadata = {
  title: 'SyllabusMind AI',
  description: 'Adaptive learning path generator: diagnose knowledge gaps and get a personalised Python roadmap.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 shadow-lg shadow-sky-500/20">
                <Brain className="h-5 w-5 text-white" aria-hidden />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-50">SyllabusMind AI</span>
            </div>
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              ED-01 Hackathon Prototype
            </span>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
