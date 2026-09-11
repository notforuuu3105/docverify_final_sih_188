import React from 'react';
import { BiometricFaceMatchResult } from '../../lib/types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Camera,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  ScanFace,
  Sparkles,
  Info,
  HelpCircle,
} from 'lucide-react';

interface BiometricFaceMatchProps {
  biometricMatch?: BiometricFaceMatchResult;
  documentTitle?: string;
}

export const BiometricFaceMatch: React.FC<BiometricFaceMatchProps> = ({
  biometricMatch,
  documentTitle,
}) => {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  if (!biometricMatch) {
    return (
      <div className="p-6 text-center text-gov-inksoft border border-dashed border-gov-line rounded-sm bg-gov-paper">
        <ScanFace className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs font-semibold">
          {isHi
            ? 'इस दस्तावेज़ सत्र के लिए कोई बायोमेट्रिक चेहरा मिलान डेटा उपलब्ध नहीं है।'
            : 'No biometric face match data available for this screening session.'}
        </p>
      </div>
    );
  }

  const score = biometricMatch.similarity_score;

  // Determine comparison verdict & styling
  let verdictText = 'Photo match successful';
  let verdictTextHi = 'फोटो मिलान सफल';
  let verdictClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  let verdictTextClass = 'text-emerald-700';
  let VerdictIcon = ShieldCheck;
  let manualReviewRequired = false;

  if (score >= 80) {
    verdictText = 'Photo match successful';
    verdictTextHi = 'फोटो मिलान सफल';
    verdictClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    verdictTextClass = 'text-emerald-700';
    VerdictIcon = ShieldCheck;
    manualReviewRequired = false;
  } else if (score >= 60) {
    verdictText = 'Photo match requires review';
    verdictTextHi = 'फोटो मिलान समीक्षा आवश्यक';
    verdictClass = 'bg-amber-50 text-amber-800 border-amber-300';
    verdictTextClass = 'text-amber-700';
    VerdictIcon = HelpCircle;
    manualReviewRequired = true;
  } else {
    verdictText = 'Photo match unsuccessful';
    verdictTextHi = 'फोटो मिलान असफल';
    verdictClass = 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse';
    verdictTextClass = 'text-rose-700';
    VerdictIcon = ShieldAlert;
    manualReviewRequired = true;
  }

  return (
    <div className="glass-card p-4 sm:p-5 rounded-sm border border-gov-line space-y-4 shadow-xs animate-fadeIn bg-white">
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gov-line">
        <div className="flex items-center gap-2">
          <ScanFace className="w-4 h-4 text-gov-navy-900" />
          <h3 className="text-xs font-extrabold text-gov-navy-950 uppercase tracking-wider">
            {isHi
              ? 'बायोमेट्रिक चेहरा सत्यापन एवं 1:1 लाइव तुलना'
              : 'Biometric Face Verification & 1:1 Live Comparison'}
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded border ${verdictClass}`}
        >
          <VerdictIcon className="w-3.5 h-3.5" />
          <span>{isHi ? verdictTextHi : verdictText}</span>
        </span>
      </div>

      {/* 2. Side-by-Side Face Comparison Viewport */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Left: Document Extracted Photo */}
        <div className="sm:col-span-4 p-3 bg-gov-paper rounded-sm border border-gov-line text-center space-y-2">
          <span className="text-[10px] font-bold text-gov-inksoft uppercase tracking-wider block font-mono">
            {isHi ? 'दस्तावेज़ में स्थित फोटो' : 'DOCUMENT EXTRACTED PHOTO'}
          </span>
          <div className="w-28 h-36 mx-auto rounded bg-slate-200 border-2 border-gov-navy-900/40 relative overflow-hidden flex items-center justify-center shadow-inner">
            {biometricMatch.document_photo_url ? (
              <img
                src={biometricMatch.document_photo_url}
                alt="Extracted Document Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              /* High-fidelity Vector Document Portrait */
              <svg viewBox="0 0 100 130" className="w-full h-full object-cover">
                <rect width="100" height="130" fill="#f1f5f9" />
                <circle cx="50" cy="50" r="28" fill={score >= 85 ? '#3b82f6' : '#f43f5e'} />
                <path
                  d="M20,115 C20,82 80,82 80,115 Z"
                  fill={score >= 85 ? '#1d4ed8' : '#be123c'}
                />
                <circle cx="40" cy="48" r="3" fill="#ffffff" />
                <circle cx="60" cy="48" r="3" fill="#ffffff" />
                <path d="M42,62 Q50,68 58,62" stroke="#ffffff" strokeWidth="2" fill="none" />
                <circle cx="50" cy="50" r="24" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.6" />
              </svg>
            )}
            <span className="absolute bottom-1 inset-x-1 bg-gov-navy-950/80 text-[8px] font-mono text-white py-0.5 rounded-xs">
              DPI: 300 OPTICAL
            </span>
          </div>
          <span className="text-[10px] text-gov-inksoft block">
            {documentTitle || (isHi ? 'दस्तावेज़ पहचान प्रविष्टि' : 'Extracted Identity Crop')}
          </span>
        </div>

        {/* Center: Biometric Match Dial & Comparison Result */}
        <div className="sm:col-span-4 text-center space-y-2.5 py-2">
          <div className="inline-block p-4 rounded-full bg-white border-2 shadow-xs border-gov-line">
            <span className={`text-3xl font-extrabold font-mono block ${verdictTextClass}`}>
              {score}%
            </span>
            <span className="text-[9px] uppercase font-bold text-gov-inksoft tracking-wider block mt-0.5">
              {isHi ? 'चेहरा समानता स्कोर' : 'Facial Similarity'}
            </span>
          </div>

          <div className="space-y-1">
            <span
              className={`inline-block px-3 py-1 rounded text-xs font-extrabold tracking-wide font-mono ${verdictClass}`}
            >
              {isHi ? verdictTextHi : verdictText}
            </span>
            <p className="text-[10px] text-gov-inksoft font-mono">
              {isHi ? 'स्वचालित थ्रेशोल्ड: ≥80.0%' : 'Automated Baseline: ≥80.0%'}
            </p>
          </div>

          {/* Automated Comparison & Manual Review Notice */}
          {manualReviewRequired ? (
            <div className="p-2 rounded bg-amber-50 border border-amber-300 text-[10px] text-amber-900 font-semibold flex items-center justify-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                {isHi
                  ? 'अनिश्चित/असफल मामला: मैन्युअल अधिकारी समीक्षा हेतु अग्रेषित'
                  : 'Sent for manual review — automated comparison uncertain'}
              </span>
            </div>
          ) : (
            <div className="p-1.5 rounded bg-emerald-50 border border-emerald-300 text-[10px] text-emerald-800 font-semibold inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{isHi ? 'स्वचालित मिलान सफल' : 'Automated 1:1 Match Verified'}</span>
            </div>
          )}
        </div>

        {/* Right: Live Camera Captured Photo */}
        <div className="sm:col-span-4 p-3 bg-gov-paper rounded-sm border border-gov-line text-center space-y-2">
          <span className="text-[10px] font-bold text-gov-inksoft uppercase tracking-wider block font-mono flex items-center justify-center gap-1">
            <Camera className="w-3 h-3 text-gov-navy-900" />{' '}
            {isHi ? 'डिवाइस लाइव कैमरा फोटो' : 'LIVE CAMERA CAPTURE'}
          </span>
          <div className="w-28 h-36 mx-auto rounded bg-slate-900 border-2 border-emerald-600 relative overflow-hidden flex items-center justify-center shadow-inner">
            {biometricMatch.live_booth_photo_url ? (
              <img
                src={biometricMatch.live_booth_photo_url}
                alt="User Live Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              /* Live Camera Silhouette Fallback */
              <svg viewBox="0 0 100 130" className="w-full h-full object-cover">
                <rect width="100" height="130" fill="#0f172a" />
                <circle cx="50" cy="50" r="28" fill="#38bdf8" />
                <path d="M20,115 C20,82 80,82 80,115 Z" fill="#0284c7" />
                <circle cx="40" cy="48" r="3" fill="#ffffff" />
                <circle cx="60" cy="48" r="3" fill="#ffffff" />
                <path d="M42,62 Q50,68 58,62" stroke="#ffffff" strokeWidth="2" fill="none" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="4,3" />
              </svg>
            )}
            <span className="absolute bottom-1 inset-x-1 bg-emerald-950/90 text-[8px] font-mono text-emerald-300 py-0.5 rounded-xs flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              {isHi ? 'लाइव सुरक्षित' : 'LIVE VERIFIED'}
            </span>
          </div>
          <span className="text-[10px] text-gov-inksoft block">
            {isHi ? '68 चेहरे के बायोमेट्रिक बिंदु' : '68 Biometric Facial Landmarks'}
          </span>
        </div>
      </div>

      {/* 3. Discrepancy Warnings / Tampering Flags */}
      {biometricMatch.tamper_flags && biometricMatch.tamper_flags.length > 0 && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-sm text-rose-950 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
            <strong className="text-xs font-bold uppercase tracking-wide">
              {isHi ? 'फोटो विसंगति एवं चेतावनी विवरण:' : 'Photo Replacement & Facial Discrepancy Warnings:'}
            </strong>
          </div>
          <ul className="space-y-1 text-[11px] text-rose-900 list-disc list-inside">
            {biometricMatch.tamper_flags.map((flag, idx) => (
              <li key={idx}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Automated Comparison & Mandatory Manual Review Policy Notice */}
      <div className="p-3 bg-slate-50 border border-gov-line rounded-sm text-[11px] text-gov-inksoft flex items-start gap-2.5 leading-relaxed">
        <Info className="w-4 h-4 text-gov-navy-900 shrink-0 mt-0.5" />
        <div>
          <strong className="text-gov-navy-950 block">
            {isHi ? 'स्वचालित बायोमेट्रिक मिलान नीति:' : 'Automated Biometric Comparison Protocol:'}
          </strong>
          <span>{t('manual_review_notice')}</span>
        </div>
      </div>
    </div>
  );
};
