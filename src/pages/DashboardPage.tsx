import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mockStore } from '../lib/mockAI/mockEngine';
import { VerificationRecord, ComparisonRecord } from '../lib/types';
import { formatDate, getVerdictBadgeClass } from '../lib/utils/formatters';
import {
  FileSearch,
  GitCompare,
  ShieldCheck,
  AlertOctagon,
  FileCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Layers,
  FileText,
} from 'lucide-react';
import { supabaseService } from '../lib/services/supabaseService';

export const DashboardPage: React.FC = () => {
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabaseService.getVerifications().then(setVerifications);
    supabaseService.getComparisons().then(setComparisons);
  }, []);

  // Compute live statistics from records
  const totalVerified = verifications.length;
  const authenticCount = verifications.filter((v) => v.verdict === 'authentic').length;
  const tamperedCount = verifications.filter((v) => v.verdict === 'tampered' || v.verdict === 'forged').length;
  const suspiciousCount = verifications.filter((v) => v.verdict === 'suspicious').length;
  const authenticRate = totalVerified > 0 ? ((authenticCount / totalVerified) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Forensic Intelligence Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time telemetry, tamper detection rates, and verification audit trail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/verify"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30"
          >
            <FileSearch className="w-4 h-4" />
            Verify Document
          </Link>
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-semibold transition-colors"
          >
            <GitCompare className="w-4 h-4 text-indigo-400" />
            Compare
          </Link>
        </div>
      </div>

      {/* Quick Demo Sandbox Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Interactive Forensic Demonstrator</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Experience authentic vs tampered document forensic detection with pre-configured datasets.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            onClick={() => navigate('/verify/verif-tamp-1')}
            className="flex-1 md:flex-none px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            Inspect Tampered Sample
          </button>
          <button
            onClick={() => navigate('/compare/comp-invoice-99')}
            className="flex-1 md:flex-none px-3.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5" />
            Inspect Side-by-Side Diff
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Scans</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <FileSearch className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-white tracking-tight">{totalVerified}</span>
            <span className="text-xs text-slate-400 ml-2">documents</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Forensic pipeline active</span>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Authentic Pass</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-emerald-400 tracking-tight">{authenticCount}</span>
            <span className="text-xs text-slate-400 ml-2">({authenticRate}% rate)</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">No vector/compression flaws</div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tampered / Forged</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-rose-400 tracking-tight">{tamperedCount}</span>
            <span className="text-xs text-rose-400/80 ml-2 font-medium">flagged</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">{suspiciousCount} suspicious pending review</div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Comparisons</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <GitCompare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-sky-400 tracking-tight">{comparisons.length}</span>
            <span className="text-xs text-slate-400 ml-2">dual sessions</span>
          </div>
          <div className="mt-2 text-xs text-slate-400">Synchronized diffing matrix</div>
        </div>
      </div>

      {/* Grid: Recent Verifications & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Verifications (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Recent Forensic Verifications
            </h2>
            <Link to="/history" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all history <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-card divide-y divide-slate-800/80 overflow-hidden">
            {verifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <FileSearch className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm">No documents scanned yet.</p>
                <Link to="/verify" className="mt-3 inline-block text-xs text-indigo-400 hover:underline">
                  Upload your first document &rarr;
                </Link>
              </div>
            ) : (
              verifications.slice(0, 5).map((verif) => (
                <Link
                  key={verif.id}
                  to={`/verify/${verif.id}`}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors group block"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                        {verif.document?.file_name || 'Document #' + verif.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(verif.created_at)} • {verif.checks?.length || 0} checks performed
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getVerdictBadgeClass(
                        verif.verdict
                      )}`}
                    >
                      {verif.verdict || verif.status}
                    </span>
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-mono font-bold text-slate-200 block">
                        {verif.confidence_score}%
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">Confidence</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions & Dual Comparisons (1 col) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Forensic Workflows
            </h3>
            <div className="space-y-2.5">
              <Link
                to="/verify"
                className="w-full p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-3 text-left transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <FileSearch className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300">Single Document Verification</p>
                  <p className="text-[11px] text-slate-400">Inspect typography, ELA artifacts & metadata</p>
                </div>
              </Link>

              <Link
                to="/compare"
                className="w-full p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-3 text-left transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                  <GitCompare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-purple-300">Dual REAL vs TAMPERED</p>
                  <p className="text-[11px] text-slate-400">Side-by-side synchronized diff comparison</p>
                </div>
              </Link>

              <Link
                to="/reports"
                className="w-full p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-3 text-left transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300">Audit Reports & Export</p>
                  <p className="text-[11px] text-slate-400">Generate executive forensic summaries</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Comparisons Mini List */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
                Active Comparisons
              </h3>
              <Link to="/compare" className="text-[11px] text-indigo-400 hover:underline">
                New Compare
              </Link>
            </div>

            {comparisons.length === 0 ? (
              <p className="text-xs text-slate-400">No document comparisons generated yet.</p>
            ) : (
              <div className="space-y-2">
                {comparisons.slice(0, 3).map((comp) => (
                  <Link
                    key={comp.id}
                    to={`/compare/${comp.id}`}
                    className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 flex items-center justify-between transition-colors block text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">
                        {comp.original_document?.file_name.slice(0, 16)}... vs Altered
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {comp.total_differences} differences detected
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/15 text-rose-400 border border-rose-500/30">
                      {comp.overall_risk} Risk
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
