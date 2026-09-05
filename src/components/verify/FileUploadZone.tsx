import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, X, RefreshCw, Sparkles } from 'lucide-react';
import { calculateSHA256 } from '../../lib/utils/hashing';
import { formatBytes } from '../../lib/utils/formatters';

interface FileUploadZoneProps {
  selectedFile: File | null;
  fileHash: string;
  onFileSelected: (file: File, hash: string, previewUrl?: string) => void;
  onClearFile: () => void;
  onLoadSample: (sampleType: 'tampered' | 'authentic') => void;
  disabled?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  selectedFile,
  fileHash,
  onFileSelected,
  onClearFile,
  onLoadSample,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [computingHash, setComputingHash] = useState(false);

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const processFile = async (file: File) => {
    setError(null);
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
      setError('Unsupported file type. Please upload a PDF, PNG, JPG, or JPEG.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB maximum threshold.');
      return;
    }

    setComputingHash(true);
    try {
      const hash = await calculateSHA256(file);
      const previewUrl = URL.createObjectURL(file);
      onFileSelected(file, hash, previewUrl);
    } catch (e) {
      setError('Failed to compute document cryptographic checksum.');
    } finally {
      setComputingHash(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 relative ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/50 bg-slate-900/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
            disabled={disabled}
          />

          <div className="w-16 h-16 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/10">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-white">
            Upload Document for Forensic Analysis
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Drag and drop your file here, or click to browse.
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono">PDF</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono">PNG</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono">JPEG</span>
            <span className="text-slate-400 font-sans">• Max 25MB</span>
          </div>

          {/* Quick Preloaded Sample Options */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 max-w-md mx-auto" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
              Quick Test With Preloaded Forensic Samples:
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => onLoadSample('tampered')}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Load Tampered Invoice Sample
              </button>
              <button
                type="button"
                onClick={() => onLoadSample('authentic')}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Load Authentic Invoice Sample
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-white truncate">{selectedFile.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatBytes(selectedFile.size)} • {selectedFile.type || 'Document'}
                </p>
              </div>
            </div>

            {!disabled && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors text-xs font-medium flex items-center gap-1"
                  title="Replace document"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Replace</span>
                </button>
                <button
                  type="button"
                  onClick={onClearFile}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Remove document"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Cryptographic SHA-256 Hash Display */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">SHA-256 Hash:</span>
              <span className="text-slate-300 truncate max-w-[280px] sm:max-w-md">
                {computingHash ? 'Computing cryptographic hash...' : fileHash}
              </span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold self-start sm:self-auto">
              Ready for Forensic Scan
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
