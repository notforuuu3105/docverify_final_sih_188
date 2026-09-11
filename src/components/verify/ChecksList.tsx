import React, { useState } from 'react';
import { VerificationCheck, SuspiciousRegion } from '../../lib/types';
import { useLanguage } from '../../context/LanguageContext';
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

const CHECK_TRANSLATIONS_HI: Record<string, { title: string; desc: string }> = {
  'Visual & Compression Analysis': {
    title: 'दृश्य एवं संपीड़न विश्लेषण (ELA)',
    desc: 'संपादित किनारों और दोबारा संपीड़ित जेपीईजी विसंगतियों की पहचान',
  },
  'QR Code & Digital Signature': {
    title: 'क्यूआर कोड एवं डिजिटल हस्ताक्षर',
    desc: 'आधिकारिक क्यूआर रिकॉर्ड और मुद्रित टेक्स्ट का मिलान',
  },
  'Font & Typography Consistency': {
    title: 'फ़ॉन्ट एवं टाइपोग्राफी एकरूपता',
    desc: 'अक्षरों के आकार, कर्निंग और आधार रेखा का परीक्षण',
  },
  'Layout & Structure Verification': {
    title: 'लेआउट एवं संरचनात्मक सत्यापन',
    desc: 'सरकारी प्रारूप ग्रिड और मार्जिन का संरेखण',
  },
  'Biometric Photo Tamper Check': {
    title: 'बायोमेट्रिक फोटो अखंडता जांच',
    desc: 'चेहरे की सीमा और फोटो प्रतिस्थापन के निशानों की पहचान',
  },
  'Metadata & Timestamp Examination': {
    title: 'मेटाडेटा एवं टाइमस्टैम्प विश्लेषण',
    desc: 'सॉफ़्टवेयर संपादन इतिहास और फ़ाइल निर्माण तिथि की जांच',
  },
  'Identity Masking & Privacy Compliance': {
    title: 'पहचान मास्किंग एवं गोपनीयता अनुपालन',
    desc: 'प्रथम 8 अंकों की कानूनी मास्किंग का सत्यापन',
  },
};

export const ChecksList: React.FC<ChecksListProps> = ({ checks, onHighlightRegion }) => {
  const { language, t } = useLanguage();
  const isHi = language === 'hi';

  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(
    checks.find((c) => c.status === 'failed')?.id || checks[0]?.id || null
  );

  const toggleExpand = (id: string) => {
    setExpandedCheckId((prev) => (prev === id ? null : id));
  };

  const passedCount = checks.filter((c) => c.status === 'passed').length;
  const failedCount = checks.filter((c) => c.status === 'failed').length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-gov-line">
        <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-gov-navy-900" />
          {isHi
            ? `बहु-स्तरीय फोरेंसिक निरीक्षण विवरण (${checks.length})`
            : `Multi-Stage Forensic Inspection Breakdown (${checks.length})`}
        </h3>
        <span className="text-[11px] font-semibold text-gov-inksoft">
          <span className="text-emerald-800 font-bold">
            {passedCount} {t('checks_passed')}
          </span>{' '}
          •{' '}
          <span className="text-rose-800 font-bold">
            {failedCount} {t('checks_failed')}
          </span>
        </span>
      </div>

      <div className="space-y-2">
        {checks.map((check) => {
          const isExpanded = expandedCheckId === check.id;

          const statusConfig = {
            passed: {
              icon: CheckCircle2,
              badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
              label: isHi ? 'सफल' : 'PASSED',
            },
            warning: {
              icon: AlertTriangle,
              badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
              label: isHi ? 'चेतावनी' : 'WARNING',
            },
            failed: {
              icon: XCircle,
              badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
              label: isHi ? 'विफल' : 'FAILED',
            },
          }[check.status];

          const Icon = statusConfig.icon;

          const localizedTitle =
            isHi && CHECK_TRANSLATIONS_HI[check.title]
              ? CHECK_TRANSLATIONS_HI[check.title].title
              : check.title;

          const localizedDesc =
            isHi && CHECK_TRANSLATIONS_HI[check.title]
              ? CHECK_TRANSLATIONS_HI[check.title].desc
              : check.description;

          return (
            <div
              key={check.id}
              className={`rounded-sm border transition-all shadow-xs ${
                check.status === 'failed'
                  ? 'bg-rose-50/40 border-rose-300'
                  : check.status === 'warning'
                  ? 'bg-amber-50/40 border-amber-300'
                  : 'bg-white border-gov-line'
              }`}
            >
              {/* Check Header Bar */}
              <div
                onClick={() => toggleExpand(check.id)}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      check.status === 'failed'
                        ? 'text-rose-600'
                        : check.status === 'warning'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gov-navy-950 truncate">{localizedTitle}</h4>
                    <p className="text-[11px] text-gov-inksoft truncate">{localizedDesc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-extrabold tracking-wider border ${statusConfig.badgeClass}`}
                  >
                    {statusConfig.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-gov-navy-950">
                    {check.score.toFixed(0)}%
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gov-inksoft" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gov-inksoft" />
                  )}
                </div>
              </div>

              {/* Expanded Findings Details */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-gov-line/70 space-y-3 animate-fadeIn bg-slate-50/60">
                  {/* Suspicious Regions Jump Buttons */}
                  {check.suspicious_regions && check.suspicious_regions.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gov-inksoft uppercase tracking-wider block">
                        {isHi ? 'चिह्नित विसंगति क्षेत्र:' : 'Flagged Anomaly Regions:'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {check.suspicious_regions.map((region) => (
                          <button
                            key={region.id}
                            type="button"
                            onClick={() => onHighlightRegion?.(region)}
                            className="px-2.5 py-1 rounded-sm bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Crosshair className="w-3.5 h-3.5 text-rose-600" />
                            <span>
                              {isHi ? `स्थान देखें: ${region.label}` : `Locate: ${region.label}`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Human-Readable Key Forensic Indicators */}
                  {check.findings && Object.keys(check.findings).length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-gov-inksoft uppercase tracking-wider block flex items-center gap-1">
                        <FileCode className="w-3 h-3 text-gov-navy-900" />
                        <span>{isHi ? 'मुख्य फोरेंसिक संकेतक' : 'Key Forensic Indicators'}</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {Object.entries(check.findings).map(([key, value]) => {
                          const formattedKey = key
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase());
                          const formattedVal =
                            typeof value === 'boolean'
                              ? value
                                ? isHi ? 'उपस्थित / विसंगति पाई गई' : 'Detected / Positive'
                                : isHi ? 'नहीं पाई गई / सामान्य' : 'Not Detected / Normal'
                              : typeof value === 'number'
                              ? Number.isInteger(value)
                                ? value.toString()
                                : value.toFixed(2)
                              : String(value);

                          return (
                            <div
                              key={key}
                              className="p-2 rounded-sm bg-white border border-gov-line flex items-center justify-between text-xs"
                            >
                              <span className="text-gov-inksoft font-medium text-[11px]">
                                {formattedKey}:
                              </span>
                              <span className="font-mono font-bold text-gov-navy-950 text-[11px]">
                                {formattedVal}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
