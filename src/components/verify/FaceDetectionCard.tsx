import React from 'react';
import { FaceDetectionResult } from '../../lib/types';
import { useLanguage } from '../../context/LanguageContext';
import {
  ScanFace,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Sparkles,
  Shield,
  Eye,
} from 'lucide-react';

interface FaceDetectionCardProps {
  faceDetection?: FaceDetectionResult;
  documentUrl?: string;
  documentTitle?: string;
}

export const FaceDetectionCard: React.FC<FaceDetectionCardProps> = ({
  faceDetection,
  documentUrl,
  documentTitle = 'Uploaded Document',
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const isDetected = faceDetection?.detected ?? false;
  const confidence = faceDetection?.confidence ?? 0;
  const count = faceDetection?.count ?? 0;
  const box = faceDetection?.boundingBox;

  return (
    <div className="glass-card p-4 sm:p-5 rounded-sm border border-gov-line space-y-4 shadow-xs bg-white animate-fadeIn">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gov-line">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-gov-navy-900 text-white">
            <ScanFace className="w-4 h-4 text-gov-saffron" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-gov-navy-950 uppercase tracking-wider flex items-center gap-2">
              <span>{isHi ? 'चेहरा पहचान मॉड्यूल' : 'FACE DETECTION'}</span>
              <span className="text-[10px] font-mono text-gov-inksoft font-normal">
                (Section 63 BSA • Substrate Check)
              </span>
            </h3>
            <p className="text-[11px] text-gov-inksoft">
              {isHi
                ? 'दस्तावेज़ पर कार्डधारक के फोटोग्राफ एवं चेहरे के लक्षणों की स्वतः पहचान'
                : 'Automated detection and localization of primary cardholder portrait on document'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isDetected ? (
            <span className="px-2.5 py-1 rounded text-xs font-extrabold font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHi ? '✓ चेहरा पहचाना गया' : '✓ Face Detected'}</span>
              {confidence > 0 && (
                <span className="text-[10px] bg-emerald-200/60 px-1 rounded text-emerald-950">
                  {confidence}%
                </span>
              )}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded text-xs font-extrabold font-mono uppercase bg-amber-50 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{isHi ? '⚠ चेहरा नहीं मिला' : '⚠ Face Not Detected'}</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Visual Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Column: Full Document Preview with Detected Face Bounding Box Overlay */}
        <div className="md:col-span-7 bg-slate-50 border border-gov-line rounded-sm p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-gov-inksoft font-semibold">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-gov-navy-900" />
              <span>{isHi ? 'दस्तावेज़ दृश्य एवं चेहरा सीमांकन' : 'Document Substrate & Face Bounding Box'}</span>
            </span>
            <span className="font-mono text-[10px]">
              {isDetected
                ? isHi
                  ? `पहचाने गए चेहरे: ${count}`
                  : `Faces Located: ${count}`
                : isHi
                ? 'कोई चेहरा नहीं'
                : 'Zero Faces Detected'}
            </span>
          </div>

          <div className="relative aspect-[4/3] max-h-[260px] bg-slate-200 rounded border border-slate-300 overflow-hidden flex items-center justify-center shadow-inner">
            {documentUrl ? (
              <>
                <img
                  src={documentUrl}
                  alt={documentTitle}
                  className="w-full h-full object-contain"
                />

                {/* Bounding Box Highlight Overlay */}
                {isDetected && box && (
                  <div
                    className="absolute border-2 border-emerald-500 bg-emerald-500/15 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all pointer-events-none animate-pulse"
                    style={{
                      left: `${box.x * 100}%`,
                      top: `${box.y * 100}%`,
                      width: `${box.width * 100}%`,
                      height: `${box.height * 100}%`,
                    }}
                  >
                    {/* Corner Reticle Accents */}
                    <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-emerald-400"></span>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-emerald-400"></span>
                    <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-emerald-400"></span>
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-emerald-400"></span>

                    {/* Tag badge */}
                    <span className="absolute -top-5 left-0 bg-emerald-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.2 rounded shadow-xs whitespace-nowrap">
                      CARDHOLDER FACE ({confidence}%)
                    </span>
                  </div>
                )}
              </>
            ) : (
              <span className="text-xs text-slate-400 font-mono">No document preview</span>
            )}
          </div>
        </div>

        {/* Right Column: Extracted Portrait Crop & Substrate Verification */}
        <div className="md:col-span-5 flex flex-col items-center text-center p-3 bg-slate-50 border border-gov-line rounded-sm space-y-3">
          <span className="text-[10px] font-bold text-gov-inksoft uppercase tracking-wider font-mono">
            {isHi ? 'निकाली गई फ़ोटो' : 'EXTRACTED PORTRAIT CROP'}
          </span>

          <div className="w-28 h-36 rounded bg-slate-200 border-2 border-gov-navy-900/40 relative overflow-hidden flex items-center justify-center shadow-md">
            {isDetected && faceDetection?.cropDataUrl ? (
              <img
                src={faceDetection.cropDataUrl}
                alt="Cardholder portrait"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-3 text-center text-slate-400 space-y-1">
                <ScanFace className="w-8 h-8 mx-auto text-slate-400" />
                <span className="text-[10px] font-mono block leading-tight">
                  {isHi ? 'फ़ोटो अनुपस्थित' : 'No Face Extracted'}
                </span>
              </div>
            )}
            <span className="absolute bottom-1 inset-x-1 bg-gov-navy-950/85 text-[8px] font-mono text-white py-0.5 rounded-xs">
              OPTICAL CROP
            </span>
          </div>

          <div className="space-y-1 w-full text-left bg-white p-2.5 rounded border border-gov-line text-[11px]">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-b border-slate-100 pb-1">
              <span>DETECTOR ENGINE</span>
              <span className="text-gov-navy-950 font-bold">CANVAS / CHROMINANCE</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
              <span>FACE STATUS</span>
              <span
                className={`font-bold ${
                  isDetected ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {isDetected ? 'LOCATED (1 CARDHOLDER)' : 'NOT DETECTED'}
              </span>
            </div>
            {isDetected && box && (
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                <span>COORDINATES</span>
                <span className="text-slate-700">
                  x:{Math.round(box.x * 100)}% y:{Math.round(box.y * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Guidance */}
      <div className="text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded border border-slate-200/80 flex items-start gap-2">
        <Shield className="w-3.5 h-3.5 text-gov-navy-900 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {isDetected
            ? isHi
              ? 'कार्डधारक का मुखौटा एवं चेहरे के कंटूर पहचान पत्र पर सफलतापूर्वक पाए गए हैं।'
              : 'Primary cardholder face identified and bounded on document substrate. Facial boundaries confirmed.'
            : isHi
            ? 'दस्तावेज़ पर कोई चेहरा नहीं मिला। कृपया सुनिश्चित करें कि पहचान पत्र का फोटो वाला भाग स्पष्ट और सीधा हो।'
            : 'No face detected on document substrate. Ensure the document photograph is clearly illuminated, unblurred, and not obstructed.'}
        </p>
      </div>
    </div>
  );
};
