import React from 'react';
import { Link } from 'react-router-dom';
import { VerificationRecord, OfficerEndorsement } from '../../lib/types';
import { useLanguage } from '../../context/LanguageContext';
import {
  ShieldCheck,
  AlertOctagon,
  AlertTriangle,
  RotateCcw,
  Microscope,
  ArrowRight,
  HelpCircle,
  ScanFace,
} from 'lucide-react';

interface ResultHeaderProps {
  verification: VerificationRecord;
  onReset?: () => void;
  onEndorse?: (endorsement: OfficerEndorsement) => void;
}

export const ResultHeader: React.FC<ResultHeaderProps> = ({ verification, onReset }) => {
  const { verdict, confidence_score, tampering_risk_score, summary } = verification;
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const hasFailedCheck = Boolean(verification.checks && verification.checks.some((c) => c.status === 'failed'));

  // Multi-state configuration conforming to SIH 2026 verification model
  let verdictConfig = {
    title: isHi ? 'दस्तावेज़ प्रमाणित' : 'Document Authenticated',
    badge: isHi ? 'प्रमाणित' : 'AUTHENTICATED',
    subtext: isHi ? 'सभी परीक्षण सफल' : 'ALL IMPLEMENTED CHECKS PASSED',
    icon: ShieldCheck,
    bannerBg: 'bg-emerald-50/90 border-2 border-emerald-500 text-emerald-950',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-extrabold',
    iconBg: 'bg-emerald-600 text-white shadow-xs',
  };

  if (verdict === 'rejected') {
    verdictConfig = {
      title: isHi ? 'प्रविष्टि अस्वीकृत — गैर-पहचान छवि' : 'Submission Rejected — Non-Credential Image',
      badge: isHi ? 'अस्वीकृत — दस्तावेज़ नहीं' : 'REJECTED — NOT A DOCUMENT',
      subtext: isHi ? 'मान्य पहचान प्रमाण नहीं मिला' : 'CREDENTIAL IDENTIFICATION FAILED',
      icon: AlertOctagon,
      bannerBg: 'bg-zinc-50/95 border-2 border-zinc-500 text-zinc-950',
      badgeBg: 'bg-zinc-200 text-zinc-900 border-zinc-400 font-extrabold',
      iconBg: 'bg-zinc-700 text-white shadow-xs',
    };
  } else if (verdict === 'tampered' || verdict === 'forged' || hasFailedCheck) {
    verdictConfig = {
      title: isHi ? 'दस्तावेज़ में विसंगति / छेड़छाड़ पाई गई' : 'Field Inconsistency / Tampering Flagged',
      badge: isHi ? 'बेमेल / छेड़छाड़' : 'MISMATCH / TAMPERED',
      subtext: isHi ? 'डेटा विसंगति पाई गई' : 'DATA DISCREPANCY DETECTED',
      icon: AlertOctagon,
      bannerBg: 'bg-rose-50/90 border-2 border-rose-500 text-rose-950',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-400 font-extrabold',
      iconBg: 'bg-rose-600 text-white shadow-xs',
    };
  } else if (verdict === 'invalid') {
    verdictConfig = {
      title: isHi ? 'अमान्य दस्तावेज़ प्रारूप' : 'Invalid Document Format',
      badge: isHi ? 'अमान्य प्रारूप' : 'INVALID FORMAT',
      subtext: isHi ? 'मानक सिंटैक्स विफल' : 'SYNTAX / CHECKSUM FAILED',
      icon: AlertOctagon,
      bannerBg: 'bg-rose-50/90 border-2 border-rose-500 text-rose-950',
      badgeBg: 'bg-rose-100 text-rose-900 border-rose-400 font-extrabold',
      iconBg: 'bg-rose-600 text-white shadow-xs',
    };
  } else if (verdict === 'review_required' || verdict === 'suspicious') {
    verdictConfig = {
      title: isHi ? 'अधिकारी समीक्षा आवश्यक' : 'Manual Review Required',
      badge: isHi ? 'समीक्षा आवश्यक' : 'REVIEW REQUIRED',
      subtext: isHi ? 'चेहरा अथवा फ़ील्ड सत्यापन अपूर्ण' : 'INSPECTION RECOMMENDED',
      icon: AlertTriangle,
      bannerBg: 'bg-amber-50/90 border-2 border-amber-500 text-amber-950',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-400 font-extrabold',
      iconBg: 'bg-amber-600 text-white shadow-xs',
    };
  } else if (verdict === 'partially_verified') {
    verdictConfig = {
      title: isHi ? 'आंशिक सत्यापित (प्रारूप मान्य, क्यूआर अनुपलब्ध)' : 'Partially Verified (Format Validated)',
      badge: isHi ? 'आंशिक सत्यापित' : 'PARTIALLY VERIFIED',
      subtext: isHi ? 'क्यूआर कोड अग्र भाग पर अनुपस्थित' : 'QR CODE NOT SCANNED',
      icon: ShieldCheck,
      bannerBg: 'bg-blue-50/90 border-2 border-blue-500 text-blue-950',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-400 font-extrabold',
      iconBg: 'bg-blue-600 text-white shadow-xs',
    };
  }

  const Icon = verdictConfig.icon;
  const isNegative = (verdict === 'tampered' || verdict === 'forged' || verdict === 'invalid' || hasFailedCheck) && verdict !== 'rejected';

  return (
    <div className={`p-6 rounded-sm border ${verdictConfig.bannerBg} shadow-sm space-y-6 animate-fadeIn`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Verdict Badge and Title */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-sm ${verdictConfig.iconBg} shrink-0`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`px-3 py-1 rounded-sm text-xs font-extrabold tracking-wider uppercase border shadow-xs ${verdictConfig.badgeBg}`}
              >
                {verdictConfig.badge}
              </span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-white border border-gov-line text-gov-navy-950">
                CASE: {verification.id.slice(0, 16).toUpperCase()}
              </span>

              {/* Real Face Detection Status Badge */}
              {verification.face_detection && (
                <span
                  className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border flex items-center gap-1 ${
                    verification.face_detection.detected
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}
                >
                  <ScanFace className="w-3 h-3" />
                  <span>
                    {verification.face_detection.detected
                      ? isHi
                        ? `चेहरा उपस्थित (${verification.face_detection.confidence}%)`
                        : `Face Detected (${verification.face_detection.confidence}%)`
                      : isHi
                      ? 'चेहरा नहीं मिला'
                      : 'Face Not Detected'}
                  </span>
                </span>
              )}

              <span className="text-[11px] font-mono font-bold text-gov-inksoft uppercase tracking-wider">
                {verdictConfig.subtext}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-gov-navy-950 mt-1">
              {verdictConfig.title}
            </h2>
            <p className="text-xs sm:text-sm text-gov-ink mt-1 max-w-2xl leading-relaxed font-medium">
              {summary}
            </p>
          </div>
        </div>

        {/* Confidence & Risk Metric Dials */}
        <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-gov-line">
          <div className="p-3 rounded-sm bg-white border border-gov-line text-center min-w-[110px] shadow-xs">
            <span className="text-2xl font-mono font-extrabold text-gov-navy-950 block">
              {confidence_score}%
            </span>
            <span className="text-[10px] text-gov-inksoft uppercase tracking-wider block font-bold">
              {t('authenticity_score')}
            </span>
          </div>

          <div className="p-3 rounded-sm bg-white border border-gov-line text-center min-w-[110px] shadow-xs">
            <span
              className={`text-2xl font-mono font-extrabold block ${
                isNegative ? 'text-rose-700' : tampering_risk_score > 25 ? 'text-amber-700' : 'text-emerald-700'
              }`}
            >
              {tampering_risk_score}%
            </span>
            <span className="text-[10px] text-gov-inksoft uppercase tracking-wider block font-bold">
              {t('tamper_risk')}
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-4 border-t border-gov-line/70 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {verdict !== 'rejected' && (
            <Link
              to={`/physical-measures?docId=${verification.id}&subtype=${verification.document?.subtype || 'aadhaar'}`}
              className="btn-gov-primary px-4 py-2.5 text-xs flex items-center gap-2 font-bold shadow-sm hover:scale-[1.01] transition-transform"
            >
              <Microscope className="w-4 h-4 text-gov-saffron" />
              <span>{isHi ? 'भौतिक लैब में भेजें' : 'Send to Physical Lab'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {verdict === 'rejected' ? (
            <span className="text-[11px] text-zinc-800 bg-zinc-200/80 px-3 py-1 rounded border border-zinc-300 font-semibold flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
              <span>
                {isHi
                  ? 'अमान्य प्रविष्टि: अपलोड की गई छवि किसी आधिकारिक पहचान पत्र या प्रमाण पत्र से मेल नहीं खाती'
                  : 'Invalid submission: Uploaded image does not match any recognized government credential'}
              </span>
            </span>
          ) : isNegative ? (
            <span className="text-[11px] text-rose-900 bg-rose-100 px-3 py-1 rounded border border-rose-300 font-semibold flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>
                {isHi
                  ? 'विसंगति पाई गई — भौतिक मोटाई एवं कागज़ सब्सट्रेट परीक्षण अनुशंसित'
                  : 'Inconsistency detected — physical substrate and typography inspection recommended'}
              </span>
            </span>
          ) : null}
        </div>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-1.5 text-gov-inksoft hover:text-gov-navy-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('check_another_btn')}</span>
          </button>
        )}
      </div>
    </div>
  );
};
