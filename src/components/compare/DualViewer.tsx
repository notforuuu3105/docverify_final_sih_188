import React, { useState, useRef, useEffect } from 'react';
import { ComparisonDifference } from '../../lib/types';
import { getTagColorClass } from '../../lib/utils/formatters';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface DualViewerProps {
  originalUrl?: string;
  suspectedUrl?: string;
  differences?: ComparisonDifference[];
  activeDiffId?: string | null;
  onSelectDifference?: (diff: ComparisonDifference) => void;
}

export const DualViewer: React.FC<DualViewerProps> = ({
  originalUrl,
  suspectedUrl,
  differences = [],
  activeDiffId = null,
  onSelectDifference,
}) => {
  const [zoom, setZoom] = useState(1);
  const [syncLocked, setSyncLocked] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);

  const isSyncing = useRef(false);

  // Synchronized scroll handling
  const handleScroll = (source: 'left' | 'right') => {
    if (!syncLocked || isSyncing.current) return;
    isSyncing.current = true;

    if (source === 'left' && leftPaneRef.current && rightPaneRef.current) {
      rightPaneRef.current.scrollTop = leftPaneRef.current.scrollTop;
      rightPaneRef.current.scrollLeft = leftPaneRef.current.scrollLeft;
    } else if (source === 'right' && leftPaneRef.current && rightPaneRef.current) {
      leftPaneRef.current.scrollTop = rightPaneRef.current.scrollTop;
      leftPaneRef.current.scrollLeft = rightPaneRef.current.scrollLeft;
    }

    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`glass-card rounded-2xl border border-slate-800 overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-slate-950 p-4' : 'relative'
      }`}
    >
      {/* Viewer Header / Toolbar */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
        {/* Color Legend (Red = changed, Yellow = suspicious, Green = unchanged, Blue = added) */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider hidden sm:inline">
            Diff Legend:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-rose-400 font-medium text-[11px]">Changed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-amber-400 font-medium text-[11px]">Suspicious</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-emerald-400 font-medium text-[11px]">Unchanged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span className="text-sky-400 font-medium text-[11px]">Added</span>
          </div>
        </div>

        {/* Viewport Action Controls */}
        <div className="flex items-center gap-2">
          {/* Synchronized Scroll Lock Toggle */}
          <button
            type="button"
            onClick={() => setSyncLocked(!syncLocked)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              syncLocked
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle Synchronized Pan and Zoom"
          >
            {syncLocked ? <Lock className="w-3.5 h-3.5 text-indigo-400" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{syncLocked ? 'Sync Locked' : 'Independent'}</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1"></div>

          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="font-mono text-xs text-slate-300 px-1">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.2, 2.5))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Side-by-Side Split Viewport */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 flex-1 min-h-[500px] max-h-[720px] overflow-hidden">
        {/* LEFT: ORIGINAL / REAL DOCUMENT */}
        <div className="flex flex-col h-full overflow-hidden bg-slate-950/70">
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Baseline (Original Document)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Reference Zero</span>
          </div>

          <div
            ref={leftPaneRef}
            onScroll={() => handleScroll('left')}
            className="flex-1 overflow-auto p-4 flex items-center justify-center bg-forensic-grid"
          >
            <div
              className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-700/80 bg-white transition-transform duration-150"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
              }}
            >
              {originalUrl ? (
                <img src={originalUrl} alt="Original baseline document" className="max-w-[480px] w-full block select-none pointer-events-none" />
              ) : (
                <div className="w-[420px] h-[550px] bg-slate-100 flex items-center justify-center text-slate-500">
                  <FileText className="w-8 h-8" />
                </div>
              )}

              {/* Original Differences Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-auto">
                {differences.map((diff) => {
                  const isSelected = activeDiffId === diff.id;
                  const coords = diff.original_coordinates;
                  const tagClasses = getTagColorClass(diff.visual_tag);

                  return (
                    <div
                      key={'orig-' + diff.id}
                      onClick={() => onSelectDifference?.(diff)}
                      className={`absolute cursor-pointer rounded-xs transition-all duration-200 border-2 ${tagClasses.border} ${tagClasses.bg} ${
                        isSelected ? 'ring-4 ring-rose-500/50 scale-105 z-30 shadow-lg' : 'hover:scale-[1.02]'
                      }`}
                      style={{
                        left: `${coords.x * 100}%`,
                        top: `${coords.y * 100}%`,
                        width: `${coords.width * 100}%`,
                        height: `${coords.height * 100}%`,
                      }}
                    >
                      <div className={`absolute -top-5 left-0 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider text-white ${tagClasses.indicator}`}>
                        {diff.region_title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: SUSPECTED / TAMPERED DOCUMENT */}
        <div className="flex flex-col h-full overflow-hidden bg-slate-950/70">
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Suspected (Target Document)
              </span>
            </div>
            <span className="text-[11px] text-rose-400 font-semibold">
              {differences.length} Differences Highlighted
            </span>
          </div>

          <div
            ref={rightPaneRef}
            onScroll={() => handleScroll('right')}
            className="flex-1 overflow-auto p-4 flex items-center justify-center bg-forensic-grid"
          >
            <div
              className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-700/80 bg-white transition-transform duration-150"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
              }}
            >
              {suspectedUrl ? (
                <img src={suspectedUrl} alt="Suspected altered document" className="max-w-[480px] w-full block select-none pointer-events-none" />
              ) : (
                <div className="w-[420px] h-[550px] bg-slate-100 flex items-center justify-center text-slate-500">
                  <FileText className="w-8 h-8" />
                </div>
              )}

              {/* Suspected Differences Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-auto">
                {differences.map((diff) => {
                  const isSelected = activeDiffId === diff.id;
                  const coords = diff.suspected_coordinates;
                  const tagClasses = getTagColorClass(diff.visual_tag);

                  return (
                    <div
                      key={'susp-' + diff.id}
                      onClick={() => onSelectDifference?.(diff)}
                      className={`absolute cursor-pointer rounded-xs transition-all duration-200 border-2 ${tagClasses.border} ${tagClasses.bg} ${
                        isSelected ? 'ring-4 ring-rose-500/50 scale-105 z-30 shadow-lg' : 'hover:scale-[1.02]'
                      }`}
                      style={{
                        left: `${coords.x * 100}%`,
                        top: `${coords.y * 100}%`,
                        width: `${coords.width * 100}%`,
                        height: `${coords.height * 100}%`,
                      }}
                    >
                      <div className={`absolute -top-5 left-0 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider text-white ${tagClasses.indicator}`}>
                        {diff.visual_tag.toUpperCase()}: {diff.region_title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
