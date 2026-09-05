import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileSearch,
  GitCompare,
  FileText,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 border border-indigo-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">DocVerify <span className="text-indigo-400">AI</span></span>
              <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono ml-2">v1.0 FORENSIC SUITE</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <span>Launch Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Generation Document Tampering & Alteration Detection</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Detect Invisible Forgery & Tampering with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-sky-400">Forensic AI</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Automated multi-stage forensic analysis verifying vector baseline kerning, Error Level Analysis (ELA) pixel variance, metadata discrepancies, and side-by-side differential matrices.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span>Open Forensic Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/compare"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <GitCompare className="w-4 h-4 text-indigo-400" />
            <span>Try REAL vs TAMPERED Diff</span>
          </Link>
        </div>

        {/* Responsible AI Advisory Pill */}
        <div className="mt-10 max-w-xl mx-auto p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Non-definitive AI forensic indicators. Manual verification recommended for high-stakes audits.</span>
        </div>
      </section>

      {/* 3 Core Pillars */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">7-Stage Verification Pipeline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Step-by-step extraction checking typography, Error Level Analysis (ELA), camera/scanner EXIF tags, and copy-move forgery.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <GitCompare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Side-by-Side Synchronized Diffing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dual-document split viewport with lockable pan & zoom. Pinpoints modified numbers, altered signatures, and newly added elements.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Supabase RLS & Signed Storage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-tenant Row Level Security, private storage buckets, cryptographic SHA-256 integrity hashes, and PDF report dossiers.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 DocVerify AI. Designed for forensic document integrity, tamper detection, and audit compliance.</p>
      </footer>
    </div>
  );
};
