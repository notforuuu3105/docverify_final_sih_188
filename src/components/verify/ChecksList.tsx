import React, { useState } from 'react';
import { VerificationCheck, SuspiciousRegion } from '../../lib/types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Crosshair,
  ShieldCheck,
  FileCode,
} from 'lucide-react';

interface ChecksListProps {
  checks: VerificationCheck[];
  onHighlightRegion?: (region: SuspiciousRegion) => void;
}

export const ChecksList: React.FC<ChecksListProps> = ({ checks, onHighlightRegion }) => {
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(
    checks.find((c) => c.status === 'failed')?.id || checks[0]?.id || null
  );

  const toggleExpand = (id: string) => {
    setExpandedCheckId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Individual Forensic Checks ({checks.length})
        </h3>
        <span className="text-xs text-slate-400">
          {checks.filter((c) => c.status === 'passed').length} Passed •{' '}
          {checks.filter((c) => c.status === 'failed').length} Failed
        </span>
      </div>

      <div className="space-y-2.5">
        {checks.map((check) => {
          const isExpanded = expandedCheckId === check.id;

          const statusConfig = {
            passed: {
              icon: CheckCircle2,
              badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
              label: 'PASSED',
            },
            warning: {
              icon: AlertTriangle,
              badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
              label: 'WARNING',
            },
            failed: {
              icon: XCircle,
              badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
              label: 'FAILED',
            },
          }[check.status];

          const Icon = statusConfig.icon;

          return (
            <div
              key={check.id}
              className={`rounded-xl border transition-all ${
                check.status === 'failed'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : check.status === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              {/* Check Header Bar */}
              <div
                onClick={() => toggleExpand(check.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      check.status === 'failed'
                        ? 'text-rose-400'
                        : check.status === 'warning'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-200 truncate">{check.title}</h4>
                    <p className="text-xs text-slate-400 truncate">{check.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider border ${statusConfig.badgeClass}`}
                  >
                    {statusConfig.label}
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-300">
                    {check.score.toFixed(0)}/100
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Findings Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 space-y-3 animate-fadeIn">
                  {/* Suspicious Regions Jump Buttons */}
                  {check.suspicious_regions && check.suspicious_regions.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Flagged Anomaly Regions:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {check.suspicious_regions.map((region) => (
                          <button
                            key={region.id}
                            type="button"
                            onClick={() => onHighlightRegion?.(region)}
                            className="px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                            <span>Locate in Viewer: {region.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Findings JSON */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5 text-indigo-400" /> Forensic Telemetry Data
                    </span>
                    <pre className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-indigo-300/90 overflow-x-auto">
                      {JSON.stringify(check.findings, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
