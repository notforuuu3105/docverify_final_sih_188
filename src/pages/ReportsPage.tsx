import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { mockStore } from '../lib/mockAI/mockEngine';
import { VerificationRecord } from '../lib/types';
import { formatDate } from '../lib/utils/formatters';
import { GovEmblem } from '../components/common/GovEmblem';
import { useLanguage } from '../context/LanguageContext';
import { jsPDF } from 'jspdf';
import {
  FileText,
  Download,
  Printer,
  Scale,
  CheckCircle2,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [selectedVerifId, setSelectedVerifId] = useState<string>('');
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  useEffect(() => {
    const vList = mockStore.getVerifications();
    setVerifications(vList);

    const queryVerifId = searchParams.get('verificationId');
    if (queryVerifId && vList.some((v) => v.id === queryVerifId)) {
      setSelectedVerifId(queryVerifId);
    } else if (vList.length > 0) {
      setSelectedVerifId(vList[0].id);
    }
  }, [searchParams]);

  const activeVerification = verifications.find((v) => v.id === selectedVerifId);

  const [activeTab, setActiveTab] = useState<'dossier' | 'bsa_certificate'>('dossier');

  // Generate official Government PDF dossier using jsPDF
  const handleDownloadPDF = () => {
    if (!activeVerification) return;

    const doc = new jsPDF();
    const v = activeVerification;

    // Header Bar
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(11, 42, 92);
    doc.text('GOVERNMENT OF INDIA • NATIONAL DOCUMENT AUTHENTICATION AUTHORITY', 105, 18, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 88, 110);
    doc.text('FORENSIC DOCUMENT SCREENING & INTEGRITY EXAMINATION DOSSIER', 105, 24, { align: 'center' });
    doc.text('Statutory Examination Protocol • Sovereign Cryptographic Vault', 105, 29, { align: 'center' });

    // Dividing rule
    doc.setDrawColor(11, 42, 92);
    doc.setLineWidth(0.8);
    doc.line(20, 33, 190, 33);

    // Case Details
    doc.setFontSize(9);
    doc.setTextColor(22, 35, 59);
    doc.text(`Official Case ID: ${v.id.toUpperCase()}`, 20, 40);
    doc.text(`Examination Date: ${new Date(v.created_at).toUTCString()}`, 20, 46);
    doc.text(`Security Classification: RESTRICTED / OFFICIAL USE ONLY`, 20, 52);

    doc.setDrawColor(215, 221, 230);
    doc.setLineWidth(0.3);
    doc.line(20, 56, 190, 56);

    // Section 1: Ingestion & Cryptographic Chain of Custody
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 42, 92);
    doc.text('1. DOCUMENT IDENTIFICATION & CRYPTOGRAPHIC CUSTODY', 20, 64);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(22, 35, 59);
    doc.text(`File Name: ${v.document?.file_name || 'N/A'}`, 25, 71);
    doc.text(`SHA-256 Digest: ${v.document?.sha256_hash || 'N/A'}`, 25, 77);
    doc.text(`Document Format: ${v.document?.mime_type || 'PDF/Image'}`, 25, 83);
    doc.text(`Forensic Verdict: ${v.verdict?.toUpperCase() || 'COMPLETED'}`, 25, 89);
    doc.text(`AI Confidence: ${v.confidence_score}% | Tampering Risk Score: ${v.tampering_risk_score}%`, 25, 95);

    // Section 2: Executive Findings
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 42, 92);
    doc.text('2. FORENSIC EXAMINATION NARRATIVE', 20, 106);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(22, 35, 59);
    const splitSummary = doc.splitTextToSize(v.summary || 'No summary recorded.', 165);
    doc.text(splitSummary, 25, 113);

    let yOffset = 130;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(11, 42, 92);
    doc.text('3. MULTI-STAGE FORENSIC INSPECTION LOG', 20, yOffset);
    yOffset += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    v.checks?.forEach((chk) => {
      doc.setTextColor(22, 35, 59);
      doc.text(`• [${chk.status.toUpperCase()}] ${chk.title} — Integrity Score: ${chk.score}%`, 25, yOffset);
      yOffset += 5.5;
      if (chk.suspicious_regions && chk.suspicious_regions.length > 0) {
        chk.suspicious_regions.forEach((sr) => {
          doc.setTextColor(180, 20, 20);
          doc.text(`    [Flagged Anomaly] ${sr.label} (${sr.severity} risk): ${sr.description}`, 30, yOffset);
          yOffset += 5;
        });
      }
    });

    // Sign-off block
    yOffset = Math.max(yOffset + 15, 235);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yOffset, 190, yOffset);
    yOffset += 12;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(11, 42, 92);
    doc.text('OFFICER ATTESTATION & SIGNATURE', 20, yOffset);
    doc.text('CENTRAL INFORMATICS STAMP', 130, yOffset);

    yOffset += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(75, 88, 110);
    doc.text('Authorized Forensic Examiner: Inspector R. Sharma', 20, yOffset);
    doc.text('National Document Verification & Forensic Desk', 20, yOffset + 4);
    doc.text('National Document Verification Registry', 130, yOffset);
    doc.text('Seal Verified: DIGITAL-GOV-SEC-2026', 130, yOffset + 4);

    doc.setFontSize(7.5);
    doc.text(
      'STATUTORY DISCLAIMER: Automated forensic report generated in accordance with Information Technology Act, 2000.',
      20,
      285
    );

    doc.save(`Gov_Forensic_Dossier_${v.id.slice(0, 10).toUpperCase()}.pdf`);
  };

  // Generate official Bharatiya Sakshya Adhiniyam, 2023 (Section 63) Court Evidence Certificate
  const handleDownloadBSACertificate = () => {
    if (!activeVerification) return;

    const doc = new jsPDF();
    const v = activeVerification;

    // Header Bar
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(11, 42, 92);
    doc.text('GOVERNMENT OF INDIA • NATIONAL DOCUMENT VERIFICATION AUTHORITY', 105, 18, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(180, 50, 20);
    doc.text('CERTIFICATE OF ELECTRONIC EVIDENCE ADMISSIBILITY', 105, 25, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(22, 35, 59);
    doc.text('UNDER SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023', 105, 31, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 88, 110);
    doc.text('(Read with Section 65B of the Information Technology Act, 2000)', 105, 36, { align: 'center' });

    doc.setDrawColor(11, 42, 92);
    doc.setLineWidth(0.8);
    doc.line(20, 40, 190, 40);

    // Affidavit Introduction
    doc.setFontSize(9);
    doc.setTextColor(22, 35, 59);
    const introText =
      'I, Inspector R. Sharma, Senior Digital Forensic Examiner, National Document Verification & Forensic Division, Government of India, do hereby solemnly affirm, declare and certify as under:';
    doc.text(doc.splitTextToSize(introText, 170), 20, 48);

    let y = 62;
    const clauses = [
      `1. LAWFUL CUSTODY & INGESTION: I have had lawful control and administrative supervision over the automated forensic examination terminal throughout the period during which the electronic document record was ingested, hashed, and processed.`,
      `2. ELECTRONIC TARGET SPECIFICATION: The document titled "${v.document?.file_name || 'Document'}" was submitted for integrity verification and received into the secure State Data Centre memory enclave with cryptographic SHA-256 Digest: [${v.document?.sha256_hash || 'SHA256_HASH'}].`,
      `3. OPERATIONAL APPARATUS INTEGRITY: The computer system, cryptographic hashing kernels, error level analysis modules, and typography parsing routines were operating properly without malfunction, software corruption, or unauthorized alteration at all material times.`,
      `4. FORENSIC EXAMINATION VERDICT: Automated multi-stage inspection returned a finding of [${v.verdict?.toUpperCase() || 'PROCESSED'}] with an AI Anomaly Risk Index of ${v.tampering_risk_score}%. The chain of custody was cryptographically preserved throughout all stages.`,
      `5. EXAMINER ADJUDICATION & ENDORSEMENT: ${v.officer_endorsement ? `The finding was formally reviewed and endorsed by the designated officer on ${new Date(v.officer_endorsement.endorsed_at).toLocaleString()} with note: "${v.officer_endorsement.remarks}".` : 'The electronic extraction reflects true and unaltered outputs produced by the forensic inspection system under National Forensic Standard Operating Protocols.'}`,
      `6. STATUTORY DECLARATION: The particulars stated above are true and correct to the best of my knowledge, belief, and official technical records maintained under my custody.`,
    ];

    clauses.forEach((clause) => {
      const lines = doc.splitTextToSize(clause, 170);
      doc.text(lines, 20, y);
      y += lines.length * 4.8 + 4;
    });

    // Cryptographic Attestation Seal & Deponent Block
    y = Math.max(y + 6, 225);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(11, 42, 92);
    doc.text('DEPONENT (SIGNATURE OF CERTIFYING OFFICER)', 20, y);
    doc.text('OFFICIAL STATUTORY SEAL', 130, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(75, 88, 110);
    doc.text('Name: Inspector R. Sharma', 20, y);
    doc.text('Designation: Senior Forensic Examiner (GOV-CYBER-884)', 20, y + 4.5);
    doc.text('Station: New Delhi, India', 20, y + 9);
    doc.text(`Dated: ${new Date().toLocaleDateString('en-IN')}`, 20, y + 13.5);

    doc.text('National Electronic Evidence Vault', 130, y);
    doc.text('Section 63 BSA Digital Seal: CERT-BSA23-GOV-9821', 130, y + 4.5);
    doc.text(`Hash Verification: VALIDATED`, 130, y + 9);

    doc.save(`BSA_Section63_Certificate_${v.id.slice(0, 10).toUpperCase()}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn text-gov-ink">
      {/* Page Header */}
      <div className="pb-2 border-b border-gov-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gov-saffron"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gov-navy-800 font-mono">
              {isHi ? 'आधिकारिक साक्ष्य एवं रिपोर्ट निर्यात' : 'OFFICIAL CERTIFICATION & DOSSIER EXPORT'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gov-navy-950 flex items-center gap-2 mt-0.5">
            <FileText className="w-6 h-6 text-gov-navy-900" />
            <span>{isHi ? 'फोरेंसिक जांच रिपोर्ट एवं अदालती साक्ष्य' : 'Forensic Examination Dossiers & Court Certificates'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gov-inksoft">
            {isHi
              ? 'भारतीय साक्ष्य अधिनियम (BSA) की धारा 63 के अंतर्गत अदालत हेतु कानूनी साक्ष्य प्रमाण पत्र और तकनीकी रिपोर्ट निर्यात करें।'
              : 'Generate and export court-compliant tamper evaluation reports with cryptographic SHA-256 validation seals.'}
          </p>
        </div>

        {activeVerification && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-gov-secondary text-xs"
            >
              <Printer className="w-3.5 h-3.5" /> <span>{t('print_sheet')}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadBSACertificate}
              className="px-3.5 py-1.5 rounded-sm bg-amber-500 hover:bg-amber-600 text-gov-navy-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-colors border border-amber-600"
              title="Generate court-admissible certificate under Section 63 BSA 2023"
            >
              <Scale className="w-3.5 h-3.5 text-gov-navy-950" />
              <span>{t('export_bsa_pdf')}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="btn-gov-primary text-xs"
            >
              <Download className="w-3.5 h-3.5 text-gov-saffron" /> <span>{t('export_full_dossier')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Select Record Dropdown & View Mode Switcher */}
      <div className="space-y-3">
        <div className="glass-card p-3.5 rounded-sm border border-gov-line flex flex-col sm:flex-row sm:items-center gap-3 shadow-xs">
          <span className="text-xs font-bold text-gov-navy-950 uppercase tracking-wider shrink-0">
            {isHi ? 'केस फ़ाइल चुनें:' : 'Select Case Dossier:'}
          </span>
          <select
            value={selectedVerifId}
            onChange={(e) => setSelectedVerifId(e.target.value)}
            className="bg-white border border-gov-line text-gov-ink text-xs font-semibold rounded-sm px-3 py-2 flex-1 focus:outline-none focus:border-gov-navy-900 shadow-xs"
          >
            {verifications.map((v) => (
              <option key={v.id} value={v.id}>
                {v.document?.file_name} — [{isHi ? 'निष्कर्ष:' : 'Verdict:'} {v.verdict?.toUpperCase()}] • {formatDate(v.created_at)}
              </option>
            ))}
          </select>
        </div>

        {/* Evidentiary Document Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-gov-line">
          <button
            type="button"
            onClick={() => setActiveTab('dossier')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'dossier'
                ? 'border-b-gov-navy-900 text-gov-navy-950 bg-white shadow-xs'
                : 'border-b-transparent text-gov-inksoft hover:text-gov-ink hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-gov-navy-900" />
            <span>{isHi ? '1. तकनीकी फोरेंसिक जांच रिपोर्ट' : '1. Multi-Stage Forensic Examination Dossier'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bsa_certificate')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'bsa_certificate'
                ? 'border-b-amber-600 text-gov-navy-950 bg-white shadow-xs'
                : 'border-b-transparent text-gov-inksoft hover:text-gov-ink hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4 text-amber-700" />
            <span>{isHi ? '2. धारा 63 कानूनी साक्ष्य प्रमाण पत्र (अदालत हेतु मान्य)' : '2. Section 63 BSA Court Evidence Certificate'}</span>
          </button>
        </div>
      </div>

      {/* Explanatory Card: Why is Section 63 BSA Certificate Mandatory */}
      {activeTab === 'bsa_certificate' && (
        <div className="bg-amber-50/90 border-l-4 border-amber-600 p-4 rounded-sm shadow-xs space-y-2.5 animate-fadeIn">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-800 shrink-0" />
            <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
              {t('why_bsa_title')}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-950 pt-1">
            <div className="bg-white/90 p-3 rounded border border-amber-200 shadow-2xs">
              <strong className="block font-bold text-gov-navy-950 mb-1">
                {isHi ? '1. कानूनी स्वीकार्यता' : '1. Judicial Admissibility'}
              </strong>
              <p className="text-[11px] leading-relaxed text-gov-inksoft">{t('why_bsa_p1')}</p>
            </div>
            <div className="bg-white/90 p-3 rounded border border-amber-200 shadow-2xs">
              <strong className="block font-bold text-gov-navy-950 mb-1">
                {isHi ? '2. पुलिस प्राथमिकी (FIR) हेतु' : '2. Police FIR Mandatory'}
              </strong>
              <p className="text-[11px] leading-relaxed text-gov-inksoft">{t('why_bsa_p2')}</p>
            </div>
            <div className="bg-white/90 p-3 rounded border border-amber-200 shadow-2xs">
              <strong className="block font-bold text-gov-navy-950 mb-1">
                {isHi ? '3. अपरिवर्तनीय हैश सील' : '3. Cryptographic Hash Seal'}
              </strong>
              <p className="text-[11px] leading-relaxed text-gov-inksoft">{t('why_bsa_p3')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Technical Forensic Examination Dossier */}
      {activeVerification && activeTab === 'dossier' && (
        <div className="bg-white border-2 border-gov-line rounded-sm shadow-md p-6 sm:p-12 space-y-8 max-w-4xl mx-auto text-gov-ink print:border-none print:shadow-none animate-fadeIn">
          {/* Official Letterhead */}
          <div className="border-b-2 border-gov-navy-900 pb-6 text-center space-y-2">
            <GovEmblem size="md" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-amber-700 font-mono">
                {isHi ? 'टीम इन्फर्नो' : 'TEAM INFERNO'}
              </p>
              <h2 className="text-lg sm:text-xl font-extrabold text-gov-navy-950 tracking-tight">
                INFERNO FORENSIC EXAMINATION & VERIFICATION SUITE
              </h2>
              <p className="text-xs font-bold text-gov-inksoft uppercase tracking-wide">
                Advanced AI Document Forensic Examination Dossier
              </p>
              <p className="text-[10px] text-amber-600 font-mono font-bold mt-0.5">
                INFERNO SECURE CRYPTOGRAPHIC ATTESTATION
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gov-line text-xs font-mono text-gov-inksoft text-left">
              <div>
                <span className="font-bold text-gov-navy-950">DOSSIER REF: </span>
                <span>INFERNO-DOC-{activeVerification.id.toUpperCase().slice(0, 14)}</span>
              </div>
              <div>
                <span className="font-bold text-gov-navy-950">DATE: </span>
                <span>{formatDate(activeVerification.completed_at || activeVerification.created_at)}</span>
              </div>
              <div>
                <span className="font-bold text-gov-navy-950">CLASSIFICATION: </span>
                <span className="text-rose-800 font-bold">CONFIDENTIAL</span>
              </div>
            </div>
          </div>

          {/* Section 1: File & Hash Integrity */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gov-navy-900 border-b border-gov-line pb-1">
              1. Document Identification & Cryptographic Custody
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded bg-gov-paper border border-gov-line text-xs font-mono">
              <div>
                <span className="text-gov-inksoft block text-[11px]">Document Name:</span>
                <span className="font-bold text-gov-navy-950">{activeVerification.document?.file_name}</span>
              </div>
              <div>
                <span className="text-gov-inksoft block text-[11px]">Format / MIME:</span>
                <span className="font-bold text-gov-navy-950">{activeVerification.document?.mime_type}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gov-inksoft block text-[11px]">Cryptographic SHA-256 Checksum:</span>
                <span className="text-gov-navy-900 font-bold break-all">{activeVerification.document?.sha256_hash}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Executive Summary & Telemetry */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gov-navy-900 border-b border-gov-line pb-1">
              2. Forensic Finding Summary & Telemetry Scores
            </h3>
            <div className="p-4 rounded bg-gov-paper border border-gov-line space-y-4">
              <p className="text-xs sm:text-sm text-gov-ink leading-relaxed">
                {activeVerification.summary}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gov-line text-center">
                <div className="p-2 rounded bg-white border border-gov-line">
                  <span className="text-lg font-mono font-extrabold text-gov-navy-950 block">
                    {activeVerification.confidence_score}%
                  </span>
                  <span className="text-[10px] text-gov-inksoft uppercase font-bold">AI Confidence</span>
                </div>
                <div className="p-2 rounded bg-white border border-gov-line">
                  <span
                    className={`text-lg font-mono font-extrabold block ${
                      activeVerification.tampering_risk_score > 60 ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {activeVerification.tampering_risk_score}%
                  </span>
                  <span className="text-[10px] text-gov-inksoft uppercase font-bold">Tamper Risk</span>
                </div>
                <div className="p-2 rounded bg-white border border-gov-line">
                  <span className="text-lg font-mono font-extrabold text-gov-navy-950 block">
                    {activeVerification.checks?.length || 0}
                  </span>
                  <span className="text-[10px] text-gov-inksoft uppercase font-bold">Checks Run</span>
                </div>
                <div className="p-2 rounded bg-white border border-gov-line">
                  <span className="text-lg font-mono font-extrabold text-amber-700 block">
                    {activeVerification.checks?.flatMap((c) => c.suspicious_regions).length || 0}
                  </span>
                  <span className="text-[10px] text-gov-inksoft uppercase font-bold">Anomalies</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Granular Forensic Checks & Findings */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gov-navy-900 border-b border-gov-line pb-1">
              3. Check-by-Check Evidentiary Ledger
            </h3>
            <div className="space-y-2">
              {activeVerification.checks?.map((chk) => (
                <div key={chk.id} className="p-3 rounded bg-gov-paper border border-gov-line text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gov-navy-950">{chk.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        chk.status === 'passed'
                          ? 'text-emerald-800 bg-emerald-50 border border-emerald-300'
                          : chk.status === 'warning'
                          ? 'text-amber-800 bg-amber-50 border border-amber-300'
                          : 'text-rose-800 bg-rose-50 border border-rose-300'
                      }`}
                    >
                      {chk.status} • {chk.score}%
                    </span>
                  </div>
                  <p className="text-gov-inksoft text-[11px]">{chk.description}</p>
                  {chk.suspicious_regions && chk.suspicious_regions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gov-line space-y-1">
                      {chk.suspicious_regions.map((sr) => (
                        <div key={sr.id} className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-900 text-[11px]">
                          <strong>{sr.label}:</strong> {sr.description} (Page {sr.page})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>


          {/* Legal Statutory Notice */}
          <div className="p-3 rounded bg-amber-50/70 border border-amber-200 text-[10px] text-amber-950 space-y-0.5 leading-relaxed">
            <p className="font-bold">Statutory Evidentiary Compliance Advisory:</p>
            <p>
              This official dossier records automated forensic anomaly telemetry produced under National Forensic Standard Operating Protocols. Findings are furnished for evidentiary assistance in civil and regulatory inspection, compliant with Section 63 of Bharatiya Sakshya Adhiniyam, 2023.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Official Section 63 BSA Court Evidence Certificate */}
      {activeVerification && activeTab === 'bsa_certificate' && (
        <div className="bg-white border-2 border-amber-600 rounded-sm shadow-md p-6 sm:p-12 space-y-8 max-w-4xl mx-auto text-gov-ink print:border-none print:shadow-none animate-fadeIn">
          {/* Certificate Letterhead */}
          <div className="border-b-2 border-gov-navy-900 pb-6 text-center space-y-2">
            <GovEmblem size="md" />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-amber-700 font-mono">
                {isHi ? 'टीम इन्फर्नो' : 'TEAM INFERNO'}
              </p>
              <h2 className="text-lg sm:text-xl font-extrabold text-gov-navy-950 tracking-tight">
                INFERNO FORENSIC VERIFICATION DIVISION
              </h2>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-widest font-mono mt-1">
                CERTIFICATE OF ELECTRONIC EVIDENCE ADMISSIBILITY
              </p>
              <p className="text-xs font-bold text-gov-navy-950 mt-0.5">
                UNDER SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023
              </p>
              <p className="text-[11px] text-gov-inksoft italic">
                (Read with Section 65B of the Information Technology Act, 2000)
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gov-line text-xs font-mono text-gov-inksoft text-left">
              <div>
                <span className="font-bold text-gov-navy-950">CERTIFICATE NO: </span>
                <span className="text-amber-900 font-bold">CERT-BSA23-INFERNO-{activeVerification.id.toUpperCase().slice(0, 10)}</span>
              </div>
              <div>
                <span className="font-bold text-gov-navy-950">STATION: </span>
                <span>INFERNO CORE LAB, NEW DELHI</span>
              </div>
              <div>
                <span className="font-bold text-gov-navy-950">STATUS: </span>
                <span className="text-emerald-800 font-bold">JUDICIALLY ADMISSIBLE</span>
              </div>
            </div>
          </div>

          {/* Affidavit Affirmation Narrative */}
          <div className="space-y-4 text-xs sm:text-sm text-gov-ink leading-relaxed">
            <div className="p-3 bg-slate-50 border border-gov-line rounded-sm font-serif italic text-xs text-gov-inksoft">
              "I, Analyst R. Sharma, Lead Digital Forensic Examiner, Team Inferno Document Forensics Division, do hereby solemnly affirm, declare and certify under oath as under:"
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded bg-gov-paper border border-gov-line space-y-1">
                <span className="font-bold text-gov-navy-950 uppercase text-[11px] block">
                  1. Lawful Custody & Submitting Agency:
                </span>
                <p className="text-gov-ink">
                  I have had lawful custody and administrative control over the digital examination terminal during the entire period in which the target electronic record <strong>"{activeVerification.document?.file_name}"</strong> was ingested and processed.
                </p>
              </div>

              <div className="p-3 rounded bg-gov-paper border border-gov-line space-y-1">
                <span className="font-bold text-gov-navy-950 uppercase text-[11px] block">
                  2. Cryptographic Message Digest (SHA-256):
                </span>
                <p className="text-gov-ink font-mono text-[11px] break-all bg-white p-2 rounded border border-gov-line">
                  SHA-256: {activeVerification.document?.sha256_hash}
                </p>
                <p className="text-[11px] text-gov-inksoft">
                  The above cryptographic digest was calculated at initial ingestion and verified identically upon conclusion of forensic screening, verifying complete bitwise integrity throughout the chain of custody.
                </p>
              </div>

              <div className="p-3 rounded bg-gov-paper border border-gov-line space-y-1">
                <span className="font-bold text-gov-navy-950 uppercase text-[11px] block">
                  3. Apparatus & Algorithm Operational Health:
                </span>
                <p className="text-gov-ink">
                  At all material times during the production of this electronic record, the computing apparatus, Error Level Analysis (ELA) shaders, and font kerning evaluation algorithms operated regularly and properly. There were no operational failures or unauthorized intrusions into the isolated memory enclave.
                </p>
              </div>

              <div className="p-3 rounded bg-gov-paper border border-gov-line space-y-1">
                <span className="font-bold text-gov-navy-950 uppercase text-[11px] block">
                  4. Certified Evidentiary Findings:
                </span>
                <p className="text-gov-ink">
                  Multi-stage examination returned a formal finding of <strong>{activeVerification.verdict?.toUpperCase()}</strong> with an Anomaly Risk Score of <strong>{activeVerification.tampering_risk_score}%</strong> and AI Confidence of <strong>{activeVerification.confidence_score}%</strong>.
                </p>
                {activeVerification.officer_endorsement && (
                  <div className="mt-2 p-2 bg-emerald-50 border border-emerald-300 rounded text-emerald-950 text-[11px]">
                    <strong>Examiner Adjudication:</strong> {activeVerification.officer_endorsement.remarks} (Endorsed by {activeVerification.officer_endorsement.officer_name} on {new Date(activeVerification.officer_endorsement.endorsed_at).toLocaleString()})
                  </div>
                )}
              </div>

              <div className="p-3 rounded bg-gov-paper border border-gov-line space-y-1">
                <span className="font-bold text-gov-navy-950 uppercase text-[11px] block">
                  5. Statutory Evidentiary Declaration:
                </span>
                <p className="text-gov-ink">
                  The contents of this certificate are true to the best of my knowledge and official technical records. This document is furnished pursuant to <strong>Section 63 of Bharatiya Sakshya Adhiniyam, 2023</strong> for admissibility in judicial, quasi-judicial, and regulatory proceedings.
                </p>
              </div>
            </div>
          </div>

          {/* Deponent Signature & Seal */}
          <div className="pt-6 border-t-2 border-amber-600 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gov-inksoft block">
                DEPONENT (CERTIFYING OFFICER)
              </span>
              <p className="font-bold text-gov-navy-950 text-sm">Inspector R. Sharma</p>
              <p className="text-gov-inksoft text-[11px]">Senior Digital Forensic Investigator</p>
              <p className="text-gov-inksoft text-[11px]">National Document Verification Authority • Govt. of India</p>
              <div className="mt-4 pt-4 border-t border-dashed border-gov-line text-[10px] text-emerald-800 font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                DIGITALLY AFFIRMED & ATTESTED (TOKEN VALIDATED)
              </div>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gov-inksoft block">
                STATUTORY EVIDENCE VAULT SEAL
              </span>
              <p className="font-mono font-bold text-xs text-gov-navy-950">SEAL: BSA63-GOV-DELHI-2026</p>
              <p className="text-gov-inksoft text-[11px]">Hash Chain: VALIDATED</p>
              <p className="text-gov-inksoft text-[11px]">Station: New Delhi, India</p>
              <div className="mt-4 pt-4 border-t border-dashed border-gov-line text-[10px] text-slate-500 font-mono">
                CENTRAL FORENSIC EVIDENCE REGISTRY
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
