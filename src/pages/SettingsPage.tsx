import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockStore } from '../lib/mockAI/mockEngine';
import {
  Settings,
  Database,
  Shield,
  Key,
  Server,
  User,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Layers,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, isConfigured } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || 'Dr. Sarah Vance');
  const [organization, setOrganization] = useState(user?.organization || 'Global Forensic Integrity Labs');
  const [useMockAI, setUseMockAI] = useState(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('Profile information updated successfully.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleResetDemoData = () => {
    localStorage.removeItem('docverify_mock_documents');
    localStorage.removeItem('docverify_mock_verifications');
    localStorage.removeItem('docverify_mock_comparisons');
    // re-trigger initial store load
    mockStore.getDocuments();
    mockStore.getVerifications();
    mockStore.getComparisons();
    setSaveMessage('Forensic sandbox records reset to initial state.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-indigo-400" />
          System & Forensic Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage Supabase backend connection parameters, forensic detection engine mode, and auditor credentials.
        </p>
      </div>

      {saveMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* 1. Supabase Backend Infrastructure Status */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Supabase Backend & Storage
              </h3>
              <p className="text-xs text-slate-400">
                PostgreSQL Database, RLS Multi-Tenant Policies & Private Storage Buckets
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
              isConfigured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
            }`}
          >
            {isConfigured ? 'Supabase Connected' : 'Forensic Sandbox Engine'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-1 font-semibold">Row Level Security (RLS)</span>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Strict Tenant Isolation (7 Tables)
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-1 font-semibold">Private Storage Buckets</span>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> /documents & /reports
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block mb-1 font-semibold">SQL Migration DDL</span>
            <span className="text-indigo-400 font-mono font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> 20260905000000.sql
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
          <span>
            Connect your own production cloud database by setting <code className="text-indigo-300 font-mono">VITE_SUPABASE_URL</code> and <code className="text-indigo-300 font-mono">VITE_SUPABASE_ANON_KEY</code> in <code className="text-slate-300 font-mono">.env</code>.
          </span>
          <a
            href="https://supabase.com/docs"
            target="_blank"
            rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-semibold ml-2 shrink-0"
          >
            Supabase Docs <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 2. AI Verification Engine Configuration */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              AI Forensic Analysis Engine
            </h3>
            <p className="text-xs text-slate-400">
              Select verification provider (Local deterministic simulation vs Remote AI microservice)
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-indigo-500/40 transition-colors">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white block">
                Enable Built-in Forensic Simulation (Mock Mode)
              </span>
              <span className="text-[11px] text-slate-400 block">
                Executes 7-stage forensic pipeline in browser with realistic ELA, font kerning baselines, and pre-packaged anomaly suites.
              </span>
            </div>
            <input
              type="checkbox"
              checked={useMockAI}
              onChange={(e) => setUseMockAI(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
            />
          </label>
        </div>
      </div>

      {/* 3. Auditor Profile */}
      <form onSubmit={handleSaveProfile} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Auditor Credentials
            </h3>
            <p className="text-xs text-slate-400">Personalized details appearing on exported reports</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Auditor Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Institution / Organization
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDemoData}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Sandbox Sample Data
          </button>

          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
