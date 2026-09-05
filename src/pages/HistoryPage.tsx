import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockStore } from '../lib/mockAI/mockEngine';
import type { VerificationRecord } from '../lib/types';
import { formatDate, getVerdictBadgeClass, formatBytes } from '../lib/utils/formatters';
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  ChevronRight,
  ShieldCheck,
  AlertOctagon,
  Eye,
  GitCompare,
  FileSearch,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_risk' | 'lowest_risk'>('newest');

  useEffect(() => {
    setRecords(mockStore.getVerifications());
  }, []);

  // Filter & Search logic
  const filtered = records
    .filter((record) => {
      const matchesFilter =
        filterVerdict === 'all' ? true : record.verdict === filterVerdict || record.status === filterVerdict;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        record.document?.file_name.toLowerCase().includes(q) ||
        record.id.toLowerCase().includes(q) ||
        record.summary.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'highest_risk') {
        return b.tampering_risk_score - a.tampering_risk_score;
      }
      if (sortBy === 'lowest_risk') {
        return a.tampering_risk_score - b.tampering_risk_score;
      }
      return 0;
    });

  const verdicts = ['all', 'authentic', 'tampered', 'forged', 'suspicious', 'processing'];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <History className="w-7 h-7 text-indigo-400" />
          Verification Audit Trail
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Historical log of all scanned documents, cryptographically verified integrity logs, and forensic checks.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by filename, document ID, or forensic summary keywords..."
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950/70 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest Scans First</option>
              <option value="oldest">Oldest Scans First</option>
              <option value="highest_risk">Highest Risk First</option>
              <option value="lowest_risk">Lowest Risk First</option>
            </select>
          </div>
        </div>

        {/* Verdict Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {verdicts.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilterVerdict(v)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 ${filterVerdict === v
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400'
                }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* History Records Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="divide-y divide-slate-800/80">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <FileSearch className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-sm font-medium">No matching verification records found.</p>
              <p className="text-xs text-slate-500">
                Adjust your search terms or verify a new document.
              </p>
            </div>
          ) : (
            filtered.map((record) => {
              const anomalyCount =
                record.checks?.flatMap((c) => c.suspicious_regions).length || 0;

              return (
                <div
                  key={record.id}
                  className="p-4 sm:p-5 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Left: Document Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/verify/${record.id}`}
                          className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors truncate"
                        >
                          {record.document?.file_name || 'Document #' + record.id.slice(0, 8)}
                        </Link>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getVerdictBadgeClass(
                            record.verdict
                          )}`}
                        >
                          {record.verdict || record.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {record.summary}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 font-mono">
                        <span>{formatDate(record.created_at)}</span>
                        <span>•</span>
                        <span>{record.checks?.length || 0} checks</span>
                        <span>•</span>
                        <span className={anomalyCount > 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                          {anomalyCount} anomalies
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Scores & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">
                        {record.confidence_score}%
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Confidence
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-xs font-mono font-bold ${record.tampering_risk_score > 60
                          ? 'text-rose-400'
                          : record.tampering_risk_score > 30
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                          }`}
                      >
                        {record.tampering_risk_score}%
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        Tamper Risk
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/verify/${record.id}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        title="Inspect Forensic Canvas"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Inspect</span>
                      </Link>
                      <Link
                        to={`/compare?suspectedId=${record.document_id}`}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-indigo-300 transition-colors"
                        title="Compare with baseline"
                      >
                        <GitCompare className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
