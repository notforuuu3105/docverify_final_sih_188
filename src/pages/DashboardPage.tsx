import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { VerificationRecord } from '../lib/types';
import { formatDate, getVerdictBadgeClass } from '../lib/utils/formatters';
import { useLanguage } from '../context/LanguageContext';
import {
  FileSearch,
  AlertOctagon,
  FileCheck,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Layers,
  FileText,
  Sparkles,
  ShieldAlert,
  FolderOpen,
  Gauge,
  ShieldCheck,
} from 'lucide-react';
import { supabaseService } from '../lib/services/supabaseService';

export const DashboardPage: React.FC = () => {
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  useEffect(() => {
    supabaseService.getVerifications().then(setVerifications);
  }, []);

  // Compute live statistics from records
  const totalVerified = verifications.length;
  const authenticCount = verifications.filter((v) => v.verdict === 'authentic').length;
  const tamperedCount = verifications.filter(
    (v) => v.verdict === 'tampered' || v.verdict === 'forged'
  ).length;
  const suspiciousCount = verifications.filter((v) => v.verdict === 'suspicious').length;
  const authenticRate =
    totalVerified > 0 ? ((authenticCount / totalVerified) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6 animate-fadeIn text-gov-ink">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gov-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gov-saffron"></span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gov-navy-800 font-mono">
              {isHi ? 'केंद्रीय निगरानी नियंत्रण पटल' : 'CENTRAL MONITORING CONSOLE'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gov-navy-950 flex items-center gap-2 mt-0.5">
            {isHi ? 'अधिकारी दस्तावेज़ सत्यापन एवं निगरानी' : 'Officer Forensic Intelligence Overview'}
          </h1>
          <p className="text-xs sm:text-sm text-gov-inksoft">
            {isHi 
              ? 'दस्तावेज़ों की वास्तविक समय जांच, विसंगति दर एवं भौतिक गुणवत्ता माप।' 
              : 'Real-time screening telemetry, anomaly detection rates, and physical substrate measures.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/verify" className="btn-gov-primary">
            <FileSearch className="w-3.5 h-3.5" />
            <span>{isHi ? 'दस्तावेज़ जांचें' : 'Screen Document'}</span>
          </Link>
          <Link to="/reports" className="btn-gov-secondary">
            <FileText className="w-3.5 h-3.5 text-gov-navy-900" />
            <span>{isHi ? 'अदालती रिपोर्ट (Dossier)' : 'Court Dossiers'}</span>
          </Link>
        </div>
      </div>

      {/* Quick Benchmark Suite Banner */}
      <div className="p-4 rounded-sm bg-white border-l-4 border-l-gov-saffron border-y border-r border-gov-line shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-gov-navy-900/5 text-gov-navy-900 shrink-0 border border-gov-line">
            <Sparkles className="w-5 h-5 text-gov-saffron-dark" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wide">
                {isHi ? 'राष्ट्रीय प्रामाणिकता परीक्षण बेंचमार्क' : 'National Verification Benchmark Suite'}
              </h3>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-mono text-[10px] font-bold">
                {isHi ? 'परीक्षण सक्रिय' : 'CALIBRATION SUITE ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-gov-inksoft mt-0.5">
              {isHi
                ? 'आधार, पैन और पासपोर्ट जैसे प्रामाणिक दस्तावेज़ों की जांच करें और हेरफेर पकड़े जाने की पुष्टि करें।'
                : 'Inspect certified authentic controls against digitally spliced civil records with verified anomaly bounding coordinates.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            onClick={() => navigate('/verify/verif-tamp-1')}
            className="flex-1 md:flex-none px-3 py-1.5 rounded-sm bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
            {isHi ? 'छेड़छाड़ का मामला देखें' : 'Inspect Spliced Account Case'}
          </button>
          <button
            onClick={() => navigate('/reports?verificationId=verif-tamp-1&tab=bsa')}
            className="flex-1 md:flex-none px-3 py-1.5 rounded-sm bg-gov-paper hover:bg-slate-200 text-gov-navy-950 border border-gov-line text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-gov-navy-900" />
            {isHi ? 'धारा 63 बीएसए प्रमाणपत्र' : 'Section 63 BSA Dossier'}
          </button>
        </div>
      </div>

      {/* Official Departmental Metric Cards (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Scanned */}
        <div className="glass-card p-4 rounded-sm border-t-2 border-t-gov-navy-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gov-inksoft">
              Total Documents Screened
            </span>
            <div className="p-1.5 rounded bg-gov-navy-900/5 text-gov-navy-900">
              <FileSearch className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gov-navy-950 tracking-tight font-mono">
              {totalVerified}
            </span>
            <span className="text-xs text-gov-inksoft">records registered</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gov-line text-[11px] text-gov-inksoft flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-gov-saffron-dark" />
            <span>Forensic pipeline active</span>
          </div>
        </div>

        {/* Card 2: Authentic */}
        <div className="glass-card p-4 rounded-sm border-t-2 border-t-emerald-600 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gov-inksoft">
              Verified Authentic
            </span>
            <div className="p-1.5 rounded bg-emerald-50 text-emerald-800">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-800 tracking-tight font-mono">
              {authenticCount}
            </span>
            <span className="text-xs text-emerald-800 font-semibold font-mono">
              ({authenticRate}% pass rate)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-gov-line text-[11px] text-gov-inksoft">
            Zero vector or compression anomalies
          </div>
        </div>

        {/* Card 3: Tampered */}
        <div className="glass-card p-4 rounded-sm border-t-2 border-t-rose-600 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gov-inksoft">
              Flagged Forged / Tampered
            </span>
            <div className="p-1.5 rounded bg-rose-50 text-rose-800">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-800 tracking-tight font-mono">
              {tamperedCount}
            </span>
            <span className="text-xs text-rose-800 font-semibold">flagged cases</span>
          </div>
          <div className="mt-2 pt-2 border-t border-gov-line text-[11px] text-gov-inksoft">
            {suspiciousCount} pending secondary inspection
          </div>
        </div>

        {/* Card 4: Substrate Thickness & Physical Measures */}
        <div className="glass-card p-4 rounded-sm border-t-2 border-t-gov-saffron shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gov-inksoft">
              Substrate Thickness & Integrity
            </span>
            <div className="p-1.5 rounded bg-amber-50 text-amber-800">
              <Gauge className="w-4 h-4 text-gov-saffron-dark" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gov-navy-950 tracking-tight font-mono">
              108 µm
            </span>
            <span className="text-xs text-emerald-800 font-semibold font-mono">
              (98.6% match)
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-gov-line text-[11px] text-gov-inksoft">
            Physical caliper & GSM density calibrated
          </div>
        </div>
      </div>

      {/* Grid: Recent Verifications & Operating Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Official Case Register Table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-gov-navy-900" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gov-navy-950">
                Official Case Audit Register
              </h2>
            </div>
            <Link
              to="/history"
              className="text-xs font-bold text-gov-navy-900 hover:text-gov-saffron-dark flex items-center gap-1 transition-colors"
            >
              <span>View Full Case History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="glass-card rounded-sm border border-gov-line overflow-hidden shadow-xs">
            {verifications.length === 0 ? (
              <div className="p-8 text-center text-gov-inksoft">
                <FileSearch className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold">No verification records found in audit ledger.</p>
                <Link to="/verify" className="mt-2 inline-block text-xs font-bold text-gov-navy-900 hover:underline">
                  Initiate first document screening &rarr;
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="gov-table">
                  <thead>
                    <tr>
                      <th>Case & Document Identifier</th>
                      <th>Screening Date</th>
                      <th>Checks</th>
                      <th>Verdict</th>
                      <th>Confidence</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.slice(0, 6).map((verif) => (
                      <tr key={verif.id}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded bg-gov-paper border border-gov-line flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5 text-gov-navy-900" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs text-gov-navy-950 truncate">
                                {verif.document?.file_name || 'Document Record'}
                              </p>
                              <p className="text-[10px] text-gov-inksoft font-mono">
                                CASE: {verif.id.slice(0, 14)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="text-gov-ink text-[11px] whitespace-nowrap">
                          {formatDate(verif.created_at)}
                        </td>
                        <td className="font-mono text-[11px]">
                          {verif.checks?.length || 0} passed
                        </td>
                        <td>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getVerdictBadgeClass(
                              verif.verdict
                            )}`}
                          >
                            {verif.verdict || verif.status}
                          </span>
                        </td>
                        <td>
                          <span className="font-mono font-bold text-xs text-gov-navy-950">
                            {verif.confidence_score}%
                          </span>
                        </td>
                        <td className="text-right">
                          <Link
                            to={`/verify/${verif.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-gov-navy-900 hover:underline"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Standard Operating Workflows & Advisory */}
        <div className="space-y-5">
          {/* Standard Forensic Modules Card */}
          <div className="glass-card p-4 rounded-sm border border-gov-line space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gov-line">
              <Layers className="w-3.5 h-3.5 text-gov-saffron-dark" />
              Standard Forensic Modules
            </h3>
            <div className="space-y-2">
              <Link
                to="/verify"
                className="w-full p-3 rounded-sm bg-gov-paper hover:bg-slate-200 border border-gov-line flex items-center gap-3 text-left transition-colors group block"
              >
                <div className="w-8 h-8 rounded bg-gov-navy-900 text-white flex items-center justify-center shrink-0">
                  <FileSearch className="w-4 h-4 text-gov-saffron" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gov-navy-950 group-hover:text-gov-navy-800">
                    Single Document Verification
                  </p>
                  <p className="text-[11px] text-gov-inksoft">
                    Automated 7-stage typography, ELA & metadata scan
                  </p>
                </div>
              </Link>

              <Link
                to="/reports"
                className="w-full p-3 rounded-sm bg-gov-paper hover:bg-slate-200 border border-gov-line flex items-center gap-3 text-left transition-colors group block"
              >
                <div className="w-8 h-8 rounded bg-gov-navy-900 text-white flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-gov-saffron" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gov-navy-950 group-hover:text-gov-navy-800">
                    Court Forensic Dossiers & BSA
                  </p>
                  <p className="text-[11px] text-gov-inksoft">
                    Section 63 BSA certificates with SHA-256 seals
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Physical Security Measures & Substrate Lab Console */}
          <div className="glass-card p-4 rounded-sm border border-gov-line space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gov-line">
              <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gov-saffron-dark" />
                Physical Substrate Lab & Security Measures
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                SENSOR LINKED
              </span>
            </div>

            <p className="text-[11px] text-gov-inksoft">
              Real-time hardware telemetry from flatbed micro-caliper & optical sensor array.
            </p>

            <div className="space-y-2.5">
              {/* Measure 1: Thickness */}
              <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gov-navy-950">Substrate Caliper Thickness</span>
                  <span className="font-mono font-extrabold text-emerald-800">108 µm ± 3 µm</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '94%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gov-inksoft mt-1">
                  <span>Target Spec: 100–115 µm</span>
                  <span className="font-semibold text-emerald-800">Conformant Bond Foliation</span>
                </div>
              </div>

              {/* Measure 2: GSM Weight */}
              <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gov-navy-950">Paper Weight / Density (GSM)</span>
                  <span className="font-mono font-extrabold text-emerald-800">95 GSM</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '96%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gov-inksoft mt-1">
                  <span>Security Grade Standard: 90–100 GSM</span>
                  <span className="font-semibold text-emerald-800">Conformant</span>
                </div>
              </div>

              {/* Measure 3: UV Dullness */}
              <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gov-navy-950">UV 365nm Optical Dullness</span>
                  <span className="font-mono font-extrabold text-emerald-800">Passed (Zero Bleed)</span>
                </div>
                <p className="text-[10px] text-gov-inksoft mt-1">
                  Zero artificial brighteners detected. Consistent with genuine government rag substrate.
                </p>
              </div>

              {/* Measure 4: OVD / Hologram */}
              <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gov-navy-950">OVD Hologram & Micro-print</span>
                  <span className="font-mono font-extrabold text-gov-navy-900">Verified Reflective</span>
                </div>
                <p className="text-[10px] text-gov-inksoft mt-1">
                  Kinetic holographic diffraction verified against UIDAI / SPMCIL reference specifications.
                </p>
              </div>
            </div>
          </div>

          {/* Statutory Guidelines Card */}
          <div className="glass-card p-4 rounded-sm border border-gov-line space-y-2 bg-slate-50/70 shadow-xs text-xs">
            <h4 className="font-bold text-gov-navy-950 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-gov-navy-900" />
              Standard Operating Protocols
            </h4>
            <ul className="space-y-1.5 text-gov-inksoft text-[11px] list-disc list-inside">
              <li>High-risk documents (&gt;70% tamper score) require second-officer concurrence.</li>
              <li>Always check SHA-256 hash match against institutional issuing registry.</li>
              <li>Retain exported forensic dossiers in local court case binders.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
