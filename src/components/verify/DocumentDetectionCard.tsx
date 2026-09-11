import React, { useState } from 'react';
import { DocumentDetectionResult } from '../../lib/types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Crop,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Eye,
  FileCheck2,
  Compass,
} from 'lucide-react';

interface DocumentDetectionCardProps {
  detection?: DocumentDetectionResult;
  originalImageUrl?: string;
}

export const DocumentDetectionCard: React.FC<DocumentDetectionCardProps> = ({
  detection,
  originalImageUrl,
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [activeView, setActiveView] = useState<'cropped' | 'comparison'>('comparison');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  if (!detection) return null;

  const isDetected = detection.document_detected;
  const docType = detection.document_type || 'UNKNOWN';
  const confidencePct = Math.round((detection.confidence || 0) * 100);
  const bbox = detection.bounding_box;
  const croppedUrl = detection.cropped_document;
  const effectiveOriginalUrl =
    (originalImageUrl && !originalImageUrl.toLowerCase().endsWith('.pdf') && !originalImageUrl.includes('application/pdf'))
      ? originalImageUrl
      : detection.original_document || detection.cropped_document || originalImageUrl;
  const correction = detection.perspective_correction;
  const multiDocs = detection.all_detected_documents || [];
  const isMulti = detection.multiple_documents_detected && multiDocs.length > 1;

  const getMethodBadge = () => {
    if (!correction?.applied) return isHi ? 'बाउंडिंग बॉक्स क्रॉप' : 'Bounding Box Crop';
    if (correction.method === 'perspective_warp') return isHi ? '4-कॉर्नर पर्सपेक्टिव सुधार' : '4-Corner Perspective Warp';
    if (correction.method === 'min_area_rect_deskew') return `${isHi ? 'डिस्क्यू रोटेशन' : 'Deskewed'} (${correction.skew_angle}°ed)`;
    return isHi ? 'समतलीकरण' : 'Perspective Normalized';
  };

  return (
    <div className="glass-card p-4 sm:p-5 rounded-sm border border-gov-line space-y-4 shadow-xs bg-white animate-fadeIn">
      {/* 1. Header with Detection Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gov-line">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded bg-gov-navy-900 text-white">
            <Crop className="w-4 h-4 text-gov-saffron" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-gov-navy-950 uppercase tracking-wider flex items-center gap-2">
              <span>{isHi ? 'दस्तावेज़ सीमा पहचान एवं पर्सपेक्टिव सुधार' : 'DOCUMENT DETECTION & SUBSTRATE NORMALIZATION'}</span>
              <span className="text-[10px] font-mono text-gov-inksoft font-normal hidden sm:inline">
                (YOLOv8n • Substrate Crop)
              </span>
            </h3>
            <p className="text-[11px] text-gov-inksoft">
              {isHi
                ? 'मूल तस्वीर से दस्तावेज़ की सटीक पहचान, पृष्ठभूमि हटाना एवं स्वचालित समतलीकरण'
                : 'Automated boundary localization, background isolation & geometric perspective correction'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isDetected ? (
            <span className="px-2.5 py-1 rounded text-xs font-extrabold font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHi ? 'दस्तावेज़ स्थित' : 'DOCUMENT DETECTED'}</span>
              <span className="text-[10px] opacity-80">({confidencePct}%)</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded text-xs font-extrabold font-mono uppercase bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1.5 shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>{isHi ? 'दस्तावेज़ नहीं मिला' : 'NO DOCUMENT DETECTED'}</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      {isDetected && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="p-2.5 rounded bg-slate-50 border border-gov-line space-y-1">
            <span className="text-[10px] font-bold uppercase text-gov-inksoft tracking-wider font-mono">
              {isHi ? 'पहचाना गया प्रकार' : 'DETECTED TYPE'}
            </span>
            <p className="font-extrabold text-gov-navy-950 font-mono flex items-center gap-1.5 truncate">
              <FileCheck2 className="w-3.5 h-3.5 text-gov-navy-900 shrink-0" />
              <span>{docType}</span>
            </p>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-gov-line space-y-1">
            <span className="text-[10px] font-bold uppercase text-gov-inksoft tracking-wider font-mono">
              {isHi ? 'मॉडल विश्वास स्कोर' : 'DETECTION CONFIDENCE'}
            </span>
            <div className="flex items-center justify-between">
              <p className="font-extrabold text-gov-navy-950 font-mono">{confidencePct}%</p>
              <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, confidencePct)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-gov-line space-y-1">
            <span className="text-[10px] font-bold uppercase text-gov-inksoft tracking-wider font-mono">
              {isHi ? 'सुधार विधि' : 'CORRECTION METHOD'}
            </span>
            <p className="font-extrabold text-gov-navy-950 font-mono text-[11px] truncate flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-gov-navy-900 shrink-0" />
              <span>{getMethodBadge()}</span>
            </p>
          </div>

          <div className="p-2.5 rounded bg-slate-50 border border-gov-line space-y-1">
            <span className="text-[10px] font-bold uppercase text-gov-inksoft tracking-wider font-mono">
              {isHi ? 'क्रॉप रिज़ॉल्यूशन' : 'CROP BOUNDS'}
            </span>
            <p className="font-bold text-gov-navy-950 font-mono text-[11px] truncate">
              {bbox ? `${bbox.width} × ${bbox.height} px` : 'Auto'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Multi-Document Notification (if multiple credentials present) */}
      {isMulti && (
        <div className="p-3 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>{isHi ? 'मल्टी-डॉक्यूमेंट अलर्ट:' : 'Multi-Document Detected:'}</strong>{' '}
              {isHi
                ? `तस्वीर में ${multiDocs.length} दस्तावेज़ पाए गए। प्राथमिक दस्तावेज़ [${docType}] का सत्यापन किया जा रहा है।`
                : `${multiDocs.length} credentials located in image. Primary [${docType}] selected for verification.`}
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-200/80 text-amber-950">
            {multiDocs.map((d) => d.type).join(' + ')}
          </span>
        </div>
      )}

      {/* 4. Visual Display: Original Upload vs Cropped Substrate */}
      {croppedUrl && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-gov-navy-950 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-gov-navy-900" />
              <span>{isHi ? 'ओसीआर हेतु क्रॉप किया गया दस्तावेज़' : 'Normalized Document Substrate (Fed to OCR)'}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveView(activeView === 'comparison' ? 'cropped' : 'comparison')}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-gov-navy-900 border border-slate-300 font-bold transition-all cursor-pointer"
              >
                {activeView === 'comparison'
                  ? isHi
                    ? 'केवल क्रॉप देखें'
                    : 'Show Crop Only'
                  : isHi
                  ? 'तुलना दृश्य (Comparison)'
                  : 'Compare with Original'}
              </button>

              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-1 rounded text-gov-inksoft hover:text-gov-navy-950 hover:bg-slate-100 transition-all cursor-pointer"
                title={isZoomed ? 'Minimize' : 'Enlarge'}
              >
                {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {activeView === 'comparison' && effectiveOriginalUrl ? (
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-all ${isZoomed ? 'max-h-[600px]' : ''}`}>
              {/* Original With Bounding Box */}
              <div className="border border-gov-line rounded bg-slate-50 p-2 space-y-1.5 text-center">
                <span className="text-[10px] font-mono text-gov-inksoft uppercase font-bold block">
                  {isHi ? '१. मूल अपलोड (कच्ची तस्वीर)' : '1. Original Upload (Raw Image Canvas)'}
                </span>
                <div className="aspect-[4/3] max-h-[260px] bg-slate-100 rounded relative overflow-hidden flex items-center justify-center">
                  <img
                    src={effectiveOriginalUrl}
                    alt="Original Upload"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      if (croppedUrl && e.currentTarget.src !== croppedUrl) {
                        e.currentTarget.src = croppedUrl;
                      }
                    }}
                  />
                  {bbox?.normalized && (
                    <div
                      className="absolute border-2 border-emerald-500 bg-emerald-500/10 pointer-events-none transition-all"
                      style={{
                        left: `${bbox.normalized.x * 100}%`,
                        top: `${bbox.normalized.y * 100}%`,
                        width: `${bbox.normalized.width * 100}%`,
                        height: `${bbox.normalized.height * 100}%`,
                      }}
                    >
                      <span className="absolute top-0 left-0 -translate-y-full bg-emerald-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-t">
                        {docType} ({confidencePct}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cropped & Perspective Warped */}
              <div className="border border-emerald-300 rounded bg-emerald-50/30 p-2 space-y-1.5 text-center">
                <span className="text-[10px] font-mono text-emerald-900 uppercase font-bold flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>{isHi ? '२. क्रॉप एवं समतलीकृत दस्तावेज़ (OCR इनपुट)' : '2. Rectified Document Substrate (OCR Input)'}</span>
                </span>
                <div className="aspect-[4/3] max-h-[260px] bg-white rounded relative overflow-hidden flex items-center justify-center border border-emerald-200">
                  <img
                    src={croppedUrl}
                    alt="Cropped and Rectified Substrate"
                    className="max-h-full max-w-full object-contain"
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] font-mono bg-gov-navy-950/80 text-white px-1.5 py-0.5 rounded">
                    {getMethodBadge()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Single Cropped View */
            <div className="border border-emerald-300 rounded bg-emerald-50/20 p-3 flex flex-col items-center justify-center">
              <div className={`max-h-[320px] overflow-hidden flex items-center justify-center ${isZoomed ? 'max-h-[500px]' : ''}`}>
                <img
                  src={croppedUrl}
                  alt="Cropped Substrate"
                  className="max-h-full object-contain rounded shadow-xs"
                />
              </div>
              <span className="text-[10px] font-mono text-gov-inksoft mt-2">
                {isHi
                  ? `समतलीकरण विधि: ${getMethodBadge()} • रिज़ॉल्यूशन संवर्धित`
                  : `Method: ${getMethodBadge()} • Background Clutter Eliminated`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 5. Non-Document Explanation if not detected */}
      {!isDetected && (
        <div className="p-3.5 rounded bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1.5">
          <p className="font-extrabold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{isHi ? 'मान्य पहचान दस्तावेज़ नहीं मिला' : 'No Valid Identity Document Detected'}</span>
          </p>
          <p className="text-[11px] text-rose-800 leading-relaxed">
            {detection.message ||
              (isHi
                ? 'अपलोड की गई तस्वीर में कोई समर्थित पहचान पत्र (आधार, पैन, पासपोर्ट, ड्राइविंग लाइसेंस, वोटर आईडी या डिग्री) नहीं पाया गया। कृपया पूरे दस्तावेज़ की स्पष्ट और सीधी तस्वीर अपलोड करें।'
                : 'The uploaded image does not contain any recognized identity document (Aadhaar, PAN, Passport, Driving Licence, Voter ID, or Degree). Please upload a well-lit photograph or scan of a complete credential.')}
          </p>
        </div>
      )}
    </div>
  );
};
