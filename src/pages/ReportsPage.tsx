import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockStore } from '../lib/mockAI/mockEngine';
import { VerificationRecord, ComparisonRecord } from '../lib/types';
import { formatDate, getVerdictBadgeClass } from '../lib/utils/formatters';
import { jsPDF } from 'jspdf';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Lock,
  Calendar,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonRecord[]>([]);
  const [selectedVerifId, setSelectedVerifId] = useState<string>('');

  useEffect(() => {
    const vList = mockStore.getVerifications();
    const cList = mockStore.getComparisons();
    setVerifications(vList);
    setComparisons(cList);

    const queryVerifId = searchParams.get('verificationId');
    if (queryVerifId && vList.some((v) => v.id === queryVerifId)) {
      setSelectedVerifId(queryVerifId);
    } else if (vList.length > 0) {
      setSelectedVerifId(vList[0].id);
    }
  }, [searchParams]);

  const activeVerification = verifications.find((v) => v.id === selectedVerifId);

  // Generate real PDF file using jsPDF
  const handleDownloadPDF = () => {
    if (!activeVerification) return;

    const doc = new jsPDF();
    const v = activeVerification;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('DOCVERIFY AI - FORENSIC AUDIT REPORT', 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Generated on: ' + new Date().toUTCString(), 20, 32);
    doc.text('Verification Record ID: ' + v.id, 20, 38);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 44, 190, 44);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DOCUMENT SUMMARY', 20, 52);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`File Name: ${v.document?.file_name || 'N/A'}`, 20, 60);
    doc.text(`SHA-256 Hash: ${v.document?.sha256_hash || 'N/A'}`, 20, 66);
    doc.text(`Verdict: ${v.verdict?.toUpperCase() || 'COMPLETED'}`, 20, 72);
    doc.text(`AI Confidence: ${v.confidence_score}% | Tampering Risk: ${v.tampering_risk_score}%`, 20, 78);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ANALYSIS NARRATIVE', 20, 92);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitSummary = doc.splitTextToSize(v.summary || 'None provided.', 170);
    doc.text(splitSummary, 20, 100);

    let yOffset = 120;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('FORENSIC CHECKS BREAKDOWN', 20, yOffset);
    yOffset += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    v.checks?.forEach((chk) => {
      doc.text(`• [${chk.status.toUpperCase()}] ${chk.title} (Score: ${chk.score}%)`, 20, yOffset);
      yOffset += 6;
      if (chk.suspicious_regions && chk.suspicious_regions.length > 0) {
        chk.suspicious_regions.forEach((sr) => {
          doc.text(`   - Flagged: ${sr.label} (${sr.severity} risk) - ${sr.description}`, 25, yOffset);
          yOffset += 6;
        });
      }
    });

    yOffset += 10;
    doc.setDrawColor(220, 220, 220);
    doc.line(20, yOffset, 190, yOffset);
    yOffset += 8;
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      'LEGAL DISCLAIMER: DocVerify AI provides automated forensic anomaly indicators for advisory evaluation.',
      20,
      yOffset
    );
    doc.text(
      'Results do not constitute official government, legal, banking, or institutional certification.',
      20,
      yOffset + 5
    );

    doc.save(`DocVerify_Report_${v.id.slice(0, 8)}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-indigo-400" />
            Forensic Audit Reports
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Export comprehensive tamper evaluation dossiers and cryptographic certificates of analysis.
          </p>
        </div>

        {activeVerification && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print Dossier
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        )}
      </div>

      {/* Select Record Dropdown */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center gap-4">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          Select Verification Record:
        </span>
        <select
          value={selectedVerifId}
          onChange={(e) => setSelectedVerifId(e.target.value)}
          className="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-indigo-500"
        >
          {verifications.map((v) => (
            <option key={v.id} value={v.id}>
              {v.document?.file_name} — Verdict: {v.verdict?.toUpperCase()} ({formatDate(v.created_at)})
            </option>
          ))}
        </select>
      </div>

      {/* Printable Report Document Sheet */}
      {activeVerification && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8 max-w-4xl mx-auto text-slate-200">
          {/* Official Document Header */}
          <div className="border-b border-slate-800 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">DOCVERIFY FORENSIC AUDIT REPORT</h2>
                <p className="text-xs text-slate-400 font-mono">
                  CRYPTOGRAPHIC CHAIN OF CUSTODY • RECORD #{activeVerification.id}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getVerdictBadgeClass(
                  activeVerification.verdict
                )}`}
              >
                {activeVerification.verdict || 'COMPLETED'}
              </span>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {formatDate(activeVerification.completed_at || activeVerification.created_at)}
              </p>
            </div>
          </div>

          {/* Section 1: File & Hash Integrity */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              1. Document Metadata & Cryptographic Integrity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono">
              <div>
                <span className="text-slate-400 block">File Name:</span>
                <span className="font-semibold text-slate-200">{activeVerification.document?.file_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block">MIME Specification:</span>
                <span className="text-slate-200">{activeVerification.document?.mime_type}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block">SHA-256 Checksum:</span>
                <span className="text-indigo-300 break-all">{activeVerification.document?.sha256_hash}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Executive Summary */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              2. Forensic Summary & Confidence Metrics
            </h3>
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeVerification.summary}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-center">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-lg font-mono font-bold text-white block">
                    {activeVerification.confidence_score}%
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">AI Confidence</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span
                    className={`text-lg font-mono font-bold block ${
                      activeVerification.tampering_risk_score > 60 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {activeVerification.tampering_risk_score}%
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Tamper Risk</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-lg font-mono font-bold text-sky-400 block">
                    {activeVerification.checks?.length || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Checks Run</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-lg font-mono font-bold text-amber-400 block">
                    {activeVerification.checks?.flatMap((c) => c.suspicious_regions).length || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Anomalies</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Granular Forensic Checks & Findings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              3. Check-by-Check Forensic Evidence
            </h3>
            <div className="space-y-3">
              {activeVerification.checks?.map((chk) => (
                <div key={chk.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{chk.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        chk.status === 'passed'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : chk.status === 'warning'
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {chk.status} • {chk.score}%
                    </span>
                  </div>
                  <p className="text-slate-400">{chk.description}</p>
                  {chk.suspicious_regions && chk.suspicious_regions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 space-y-1">
                      {chk.suspicious_regions.map((sr) => (
                        <div key={sr.id} className="p-2 rounded bg-rose-950/20 border border-rose-500/30 text-rose-300">
                          <strong>{sr.label}:</strong> {sr.description} (Page {sr.page})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legal Notice / Responsible AI Positioning */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Section 19 Advisory & Institutional Boundary:</p>
            <p>
              This report represents AI-assisted document forensic analysis based on vector typography, Error Level Analysis (ELA), and metadata integrity checks. These findings are provided for investigative intelligence and risk scoring. They do not constitute official statutory, government, judicial, or banking certification without institutional legal integration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
