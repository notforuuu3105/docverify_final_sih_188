import React from 'react';
import { VerificationRecord } from '../../lib/types';
import { getVerdictBadgeClass } from '../../lib/utils/formatters';
import {
  ShieldCheck,
  AlertOctagon,
  HelpCircle,
  FileWarning,
  GitCompare,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResultHeaderProps {
  verification: VerificationRecord;
  onReset?: () => void;
}

export const ResultHeader: React.FC<ResultHeaderProps> = ({ verification, onReset }) => {
  const { verdict, confidence_score, tampering_risk_score, summary } = verification;

  const verdictConfig = {
    authentic: {
      title: 'Document Appears Authentic',
      badge: 'AUTHENTIC',
      icon: ShieldCheck,
      bannerBg: 'bg-emerald-950/40 border-emerald-500/40',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    tampered: {
      title: 'Potential Digital Tampering Detected',
      badge: 'TAMPERED',
      icon: AlertOctagon,
      bannerBg: 'bg-rose-950/40 border-rose-500/40',
      iconBg: 'bg-rose-500/20 text-rose-400',
    },
    forged: {
      title: 'Suspected Document Forgery',
      badge: 'FORGED',
      icon: FileWarning,
      bannerBg: 'bg-purple-950/40 border-purple-500/40',
      iconBg: 'bg-purple-500/20 text-purple-400',
    },
    suspicious: {
      title: 'Suspicious Anomalies / Manual Review Advised',
      badge: 'SUSPICIOUS',
      icon: HelpCircle,
      bannerBg: 'bg-amber-950/40 border-amber-500/40',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
  }[verdict || 'suspicious'];

  const Icon = verdictConfig.icon;

  return (
    <div className={`p-6 rounded-2xl border ${verdictConfig.bannerBg} shadow-xl space-y-6`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Verdict Badge and Title */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl border ${verdictConfig.iconBg} shrink-0`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getVerdictBadgeClass(
                  verdict
                )}`}
              >
                {verdictConfig.badge}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {verification.id.slice(0, 12)}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{verdictConfig.title}</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">{summary}</p>
          </div>
        </div>

        {/* Confidence & Risk Metric Dials */}
        <div className="flex items-center gap-4 shrink-0 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[110px]">
            <span className="text-2xl font-mono font-bold text-white">{confidence_score}%</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              AI Confidence
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center min-w-[110px]">
            <span
              className={`text-2xl font-mono font-bold ${
                tampering_risk_score > 60
                  ? 'text-rose-400'
                  : tampering_risk_score > 30
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {tampering_risk_score}%
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              Tamper Risk
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to={`/compare?suspectedId=${verification.document_id}`}
            className="px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <GitCompare className="w-4 h-4" />
            Compare With Baseline / Original
          </Link>
          <Link
            to={`/reports?verificationId=${verification.id}`}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            Generate Forensic Report
          </Link>
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Verify Another Document
          </button>
        )}
      </div>
    </div>
  );
};
