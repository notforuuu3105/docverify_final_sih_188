import React, { useState, useRef } from 'react';
import { SuspiciousRegion } from '../../lib/types';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  AlertTriangle,
  Info,
  X,
  Scan,
} from 'lucide-react';

interface ForensicViewerProps {
  documentUrl?: string;
  documentTitle?: string;
  suspiciousRegions?: SuspiciousRegion[];
  activeRegionId?: string | null;
  onSelectRegion?: (region: SuspiciousRegion | null) => void;
  showScanBeam?: boolean;
}

export const ForensicViewer: React.FC<ForensicViewerProps> = ({
  documentUrl,
  documentTitle = 'Document Preview',
  suspiciousRegions = [],
  activeRegionId = null,
  onSelectRegion,
  showScanBeam = false,
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLaser, setShowLaser] = useState(false);
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

  return (
    <div
      ref={containerRef}
      className={`glass-card rounded-2xl overflow-hidden border border-slate-800 flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-4' : 'relative'
      }`}
    >
      {/* Viewer Toolbar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px]">
            {documentTitle}
          </span>
          {suspiciousRegions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
              {suspiciousRegions.length} Anomalies Flagged
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowLaser(!showLaser)}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
              showLaser
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Forensic Scanline Laser"
          >
            <Scan className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scanline</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px] transition-colors"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div className="relative flex-1 min-h-[480px] max-h-[700px] overflow-auto bg-slate-950 p-6 flex items-center justify-center bg-forensic-grid">
        <div
          className="relative transition-transform duration-200 shadow-2xl rounded-lg overflow-hidden border border-slate-700/80 bg-white"
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
              src={documentUrl}
              alt="Forensic Document Target"
              className="max-w-[620px] w-full h-auto block select-none pointer-events-none"
            />
          ) : (
            <div className="w-[500px] h-[650px] bg-slate-100 flex flex-col items-center justify-center p-8 text-center text-slate-600">
              <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
              <p className="font-semibold text-sm">No Document Visual Available</p>
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
                  className={`absolute cursor-pointer transition-all duration-200 group rounded-xs ${
                    region.severity === 'critical'
                      ? 'border-2 border-rose-500 bg-rose-500/20 hover:bg-rose-500/30'
                      : region.severity === 'high'
                      ? 'border-2 border-orange-500 bg-orange-500/20 hover:bg-orange-500/30'
                      : 'border-2 border-amber-500 bg-amber-500/20 hover:bg-amber-500/30'
                  } ${
                    isSelected
                      ? 'ring-4 ring-rose-500/40 border-rose-400 bg-rose-500/35 shadow-lg shadow-rose-500/40 z-30'
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
                    className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1 ${
                      region.severity === 'critical' ? 'bg-rose-600' : 'bg-amber-600'
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
        <div className="p-4 bg-slate-900 border-t border-rose-500/40 flex items-start justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{selectedRegion.label}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {selectedRegion.severity} Risk
                </span>
                <span className="text-xs text-slate-400">Page {selectedRegion.page}</span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{selectedRegion.description}</p>
            </div>
          </div>
          <button
            onClick={() => onSelectRegion?.(null)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
