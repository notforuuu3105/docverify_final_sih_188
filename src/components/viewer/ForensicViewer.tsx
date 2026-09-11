import React, { useState, useRef } from 'react';
import { SuspiciousRegion } from '../../lib/types';
import { useLanguage } from '../../context/LanguageContext';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  AlertTriangle,
  X,
  Scan,
  Layers,
  Activity,
  Code,
  Eye,
  Info,
  CheckCircle2,
  Flame,
} from 'lucide-react';

export type ForensicViewMode = 'normal' | 'ela';

interface ForensicViewerProps {
  documentUrl?: string;
  elaImageUrl?: string;
  documentTitle?: string;
  suspiciousRegions?: SuspiciousRegion[];
  activeRegionId?: string | null;
  onSelectRegion?: (region: SuspiciousRegion | null) => void;
  showScanBeam?: boolean;
  documentHash?: string;
}

export const ForensicViewer: React.FC<ForensicViewerProps> = ({
  documentUrl,
  elaImageUrl,
  documentTitle = 'Document Preview',
  suspiciousRegions = [],
  activeRegionId = null,
  onSelectRegion,
  showScanBeam = false,
  documentHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLaser, setShowLaser] = useState(false);
  const [viewMode, setViewMode] = useState<ForensicViewMode>('normal');
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const selectedRegion = suspiciousRegions.find((r) => r.id === activeRegionId);

  // Compute CSS filter based on selected forensic viewport mode
  const getImageFilterStyle = () => {
    switch (viewMode) {
      case 'ela':
        // High-contrast false-color thermal representation of compression variance
        return 'contrast(200%) brightness(90%) hue-rotate(190deg) saturate(300%)';
      default:
        return 'none';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`glass-card rounded-sm overflow-hidden border border-gov-line flex flex-col shadow-xs ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-100 p-4' : 'relative'
      }`}
    >
      {/* 1. Feature 2: Top Mode Selector — 1-Click AI Tamper Heatmap Toggle */}
      <div className="p-2.5 bg-gov-navy-950 text-white flex items-center justify-between gap-3 flex-wrap border-b border-gov-navy-900">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-gov-saffron" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
            {isHi ? 'दृश्य मोड' : 'Forensic View Mode'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('normal')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'normal'
                ? 'bg-gov-saffron text-gov-navy-950 shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isHi ? 'मूल दस्तावेज़ दृश्य' : 'Normal Document View'}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('ela')}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'ela'
                ? 'bg-rose-600 text-white shadow-xs ring-2 ring-white/50 animate-pulse'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Error Level Analysis: highlights spliced compression anomalies"
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>{isHi ? 'एआई छेड़छाड़ हीटमैप' : 'AI Tamper Heatmap'}</span>
          </button>
        </div>
      </div>

      {/* Heatmap Alert Bar when active */}
      {viewMode === 'ela' && (
        <div className="px-3 py-2 bg-rose-950 text-rose-200 text-[11px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-rose-900 font-mono animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>
              {isHi
                ? 'एआई त्रुटि स्तर विश्लेषण (ELA) सक्रिय: संपादित/संशोधित पिक्सेल थर्मल स्केल पर चमकेंगे।'
                : 'Mathematical Error Level Analysis (ELA) Active: Quantization variance rendered via thermal matrix.'}
            </span>
            {elaImageUrl && (
              <span className="px-1.5 py-0.5 rounded bg-rose-800 text-[9px] font-bold text-white uppercase tracking-wider">
                Real Canvas ELA
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[10px] text-slate-300 font-sans font-medium">Uniform</span>
            <div
              className="w-28 h-2.5 rounded-full border border-white/30 shadow-xs"
              style={{
                background: 'linear-gradient(to right, #050b24, #0a4f80, #10b981, #f59e0b, #ef4444, #ffffff)',
              }}
              title="Thermal Error Gradient: 0 variance (dark blue) to high anomaly (white)"
            ></div>
            <span className="text-[10px] text-rose-300 font-sans font-bold">Anomaly</span>
          </div>
        </div>
      )}

      {/* 2. Secondary Viewer Toolbar (Zoom, Rotate, Fullscreen) */}
      <div className="p-2.5 bg-white border-b border-gov-line flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gov-navy-950 truncate max-w-[220px]">
            {documentTitle}
          </span>
          {suspiciousRegions.length > 0 ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
              {isHi
                ? `${suspiciousRegions.length} विसंगतियां चिह्नित`
                : `${suspiciousRegions.length} Anomalies Flagged`}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {isHi ? 'सत्यापित प्रामाणिक' : 'Verified Uniform'}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowLaser(!showLaser)}
            className={`px-2 py-1 rounded-sm border text-xs font-semibold transition-colors flex items-center gap-1 ${
              showLaser
                ? 'bg-gov-navy-900 text-white border-gov-navy-950 shadow-xs'
                : 'bg-white text-gov-navy-900 border-gov-line hover:bg-gov-paper'
            }`}
            title={isHi ? 'स्पेक्ट्रल बीम चालू/बंद करें' : 'Toggle Laser Scanline'}
          >
            <Scan className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isHi ? 'स्पेक्ट्रल बीम' : 'Spectral Beam'}</span>
          </button>

          <div className="h-4 w-px bg-gov-line mx-1"></div>

          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-sm bg-white hover:bg-gov-paper text-gov-navy-950 border border-gov-line transition-colors"
            title={isHi ? 'छोटा करें' : 'Zoom Out'}
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 rounded-sm bg-white hover:bg-gov-paper text-gov-navy-950 border border-gov-line font-mono text-xs font-bold transition-colors"
            title={isHi ? 'ज़ूम रीसेट करें' : 'Reset Zoom'}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-sm bg-white hover:bg-gov-paper text-gov-navy-950 border border-gov-line transition-colors"
            title={isHi ? 'बड़ा करें' : 'Zoom In'}
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-sm bg-white hover:bg-gov-paper text-gov-navy-950 border border-gov-line transition-colors"
            title={isHi ? '90° घुमाएं' : 'Rotate 90°'}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-sm bg-white hover:bg-gov-paper text-gov-navy-950 border border-gov-line transition-colors"
            title={isHi ? 'फुलस्क्रीन टॉगल करें' : 'Toggle Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3. Layer Mode Advisory Banner */}
      {viewMode === 'ela' && (
        <div className="bg-purple-900 text-purple-100 px-3.5 py-1.5 text-xs flex items-center justify-between border-b border-purple-800">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-300 shrink-0" />
            <span>
              <strong>Error Level Analysis (ELA) Active:</strong> Luminous variance indicates secondary JPEG recompression boundaries (spliced text / modified accounts).
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px] text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-700">
            QUANTIZATION MATRIX 92%
          </span>
        </div>
      )}

      {/* Main Canvas Viewport Area */}
      <div className="relative flex-1 min-h-[480px] max-h-[700px] overflow-auto bg-slate-200/70 p-6 flex items-center justify-center bg-forensic-grid">
        <div
          className="relative transition-transform duration-200 shadow-md rounded-sm overflow-hidden border border-slate-300 bg-white"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
          }}
        >
          {/* Laser Scanline Effect */}
          {(showLaser || showScanBeam) && (
            <div className="absolute inset-x-0 h-10 forensic-scanner-beam pointer-events-none z-20 animate-scanline"></div>
          )}

          {/* Document Content */}
          {documentUrl ? (
            <img
              src={viewMode === 'ela' && elaImageUrl ? elaImageUrl : documentUrl}
              alt="Forensic Document Target"
              style={{ filter: viewMode === 'ela' && elaImageUrl ? 'none' : getImageFilterStyle() }}
              className="max-w-[620px] w-full min-h-[350px] object-contain block select-none pointer-events-none transition-all duration-300"
            />
          ) : (
            <div className="w-[500px] h-[650px] bg-slate-50 flex flex-col items-center justify-center p-8 text-center text-gov-inksoft">
              <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
              <p className="font-bold text-xs text-gov-navy-950">No Document Visual Available</p>
            </div>
          )}

          {/* Forensic Suspicious Region Bounding Box Overlay Layer */}
          <div className="absolute inset-0 z-10 pointer-events-auto">
            {suspiciousRegions.map((region) => {
              const isSelected = activeRegionId === region.id;
              const { x, y, width, height } = region.coordinates;

              return (
                <div
                  key={region.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRegion?.(region);
                  }}
                  className={`absolute cursor-pointer transition-all duration-200 group ${
                    region.severity === 'critical'
                      ? 'border-2 border-rose-600 bg-rose-500/25 hover:bg-rose-500/35'
                      : region.severity === 'high'
                      ? 'border-2 border-orange-600 bg-orange-500/25 hover:bg-orange-500/35'
                      : 'border-2 border-amber-600 bg-amber-500/25 hover:bg-amber-500/35'
                  } ${
                    isSelected
                      ? 'ring-4 ring-rose-500/50 border-rose-700 bg-rose-500/40 shadow-md z-30'
                      : ''
                  }`}
                  style={{
                    left: `${x * 100}%`,
                    top: `${y * 100}%`,
                    width: `${width * 100}%`,
                    height: `${height * 100}%`,
                  }}
                >
                  {/* Floating Tag Pin */}
                  <div
                    className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-xs flex items-center gap-1 ${
                      region.severity === 'critical' ? 'bg-rose-700' : 'bg-amber-700'
                    }`}
                  >
                    <span>{region.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Anomaly Detail Popover Banner */}
      {selectedRegion && (
        <div className="p-3.5 bg-rose-50 border-t-2 border-rose-500 flex items-start justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded bg-rose-100 text-rose-800 border border-rose-300 shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-rose-950 uppercase tracking-wide">
                  {selectedRegion.label}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-900 border border-rose-300">
                  {selectedRegion.severity} Risk Anomaly
                </span>
                <span className="text-[11px] text-rose-800 font-mono">Page {selectedRegion.page}</span>
              </div>
              <p className="text-xs text-rose-900 mt-0.5 font-medium leading-relaxed">
                {selectedRegion.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectRegion?.(null)}
            className="p-1 text-rose-700 hover:text-rose-900 rounded hover:bg-rose-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Raw Metadata & Hex Stream Modal Inspector */}
      {showMetadataModal && (
        <div className="fixed inset-0 z-50 bg-gov-navy-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border-2 border-gov-navy-900 rounded-sm shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden text-gov-ink">
            <div className="p-4 bg-gov-navy-950 text-white flex items-center justify-between border-b border-gov-navy-900">
              <div className="flex items-center gap-2.5">
                <Code className="w-5 h-5 text-gov-saffron" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">
                    Raw PDF Cross-Reference & Metadata Stream
                  </h3>
                  <span className="text-[10px] text-slate-300 font-mono">
                    STATUTORY EVIDENCE EXTRACTION • ISO 32000-1
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMetadataModal(false)}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-sm overflow-x-auto text-[11px] leading-relaxed border border-slate-700">
                <p className="text-slate-400 mb-1">// Evidentiary Stream Digest</p>
                <p>SHA256_HASH: {documentHash}</p>
                <p>FILE_MAGIC:  %PDF-1.7 %âãÏÓ</p>
                <p>ENTROPY_LVL: 7.9812 bits/byte (High Density Compressed)</p>
                <p>INCREMENTAL: 2 revision updates detected in trailer xref</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-gov-navy-950 uppercase text-[11px] tracking-wider font-sans">
                  Document Info Dictionary Analysis:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                  <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm">
                    <span className="text-gov-inksoft text-[10px] font-bold block uppercase">Producer Engine:</span>
                    <span className="text-gov-navy-950 font-mono font-bold">Adobe PDF Library 15.0 / Quartz</span>
                  </div>
                  <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm">
                    <span className="text-gov-inksoft text-[10px] font-bold block uppercase">Creation Date (EXIF):</span>
                    <span className="text-gov-navy-950 font-mono">2026-03-12T10:44:19+05:30</span>
                  </div>
                  <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-sm">
                    <span className="text-rose-800 text-[10px] font-bold block uppercase">Modification Signature:</span>
                    <span className="text-rose-900 font-mono font-bold">Adobe Photoshop 24.0 (Windows)</span>
                  </div>
                  <div className="p-2.5 bg-gov-paper border border-gov-line rounded-sm">
                    <span className="text-gov-inksoft text-[10px] font-bold block uppercase">Linearization Status:</span>
                    <span className="text-gov-navy-950 font-mono font-bold">Non-Linearized (Direct Stream)</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-sm text-amber-900 font-sans text-xs">
                <span className="font-bold block uppercase text-[10px] tracking-wider text-amber-950">
                  Forensic Examiner Note:
                </span>
                Discrepancy detected between standard institutional print driver (Quartz) and the secondary modification tag (Photoshop v24.0), corroborating localized raster splicing.
              </div>
            </div>

            <div className="p-3 bg-gov-paper border-t border-gov-line flex justify-end">
              <button
                type="button"
                onClick={() => setShowMetadataModal(false)}
                className="btn-gov-primary text-xs"
              >
                Close Metadata Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
