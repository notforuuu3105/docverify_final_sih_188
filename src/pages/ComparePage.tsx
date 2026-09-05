import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockForensicEngine, mockStore } from '../lib/mockAI/mockEngine';
import { INITIAL_MOCK_DOCUMENTS, generateMockDocumentSvg } from '../lib/mockAI/mockData';
import type { DocumentRecord, ComparisonRecord, ComparisonDifference } from '../lib/types';
import { DualViewer } from '../components/compare/DualViewer';
import { DifferenceTable } from '../components/compare/DifferenceTable';
import {
  GitCompare,
  Upload,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertOctagon,
  Percent,
  Layers,
  FileText,
  RotateCcw,
} from 'lucide-react';

export const ComparePage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [origDoc, setOrigDoc] = useState<DocumentRecord | null>(null);
  const [suspDoc, setSuspDoc] = useState<DocumentRecord | null>(null);

  const [comparison, setComparison] = useState<ComparisonRecord | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('');
  const [activeDiff, setActiveDiff] = useState<ComparisonDifference | null>(null);

  useEffect(() => {
    // If suspectedId was passed via query params, pre-select it
    const suspectedId = searchParams.get('suspectedId');
    if (suspectedId) {
      const docs = mockStore.getDocuments();
      const found = docs.find((d) => d.id === suspectedId);
      if (found) {
        setSuspDoc(found);
      }
    }
  }, [searchParams]);

  // Quick pre-load sample comparison
  const handleLoadSample = () => {
    setOrigDoc(INITIAL_MOCK_DOCUMENTS[0]);
    setSuspDoc(INITIAL_MOCK_DOCUMENTS[1]);
    setComparison(null);
    setActiveDiff(null);
  };

  const handleStartComparison = async () => {
    if (!origDoc || !suspDoc) return;

    setIsAnalyzing(true);
    setAnalysisStatus('Aligning document viewports...');

    const result = await mockForensicEngine.runComparison(
      origDoc,
      suspDoc,
      (status) => setAnalysisStatus(status)
    );

    setComparison(result);
    setIsAnalyzing(false);
    if (result.differences && result.differences.length > 0) {
      setActiveDiff(result.differences[0]);
    }
  };

  const handleReset = () => {
    setOrigDoc(null);
    setSuspDoc(null);
    setComparison(null);
    setActiveDiff(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <GitCompare className="w-7 h-7 text-indigo-400" />
            REAL vs TAMPERED Comparison Studio
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Side-by-side synchronized diffing engine detecting modified dates, altered amounts, and spliced signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3.5 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample Invoice Diff
          </button>
        </div>
      </div>

      {/* Upload Dropzones (when comparison is not yet calculated) */}
      {!comparison && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. ORIGINAL DOCUMENT DROPZONE */}
            <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Document 1: Original / Baseline
                </span>
                {origDoc && (
                  <button
                    onClick={() => setOrigDoc(null)}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {origDoc ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{origDoc.file_name}</p>
                      <p className="text-xs text-slate-400">Verified Authentic Reference</p>
                    </div>
                  </div>
                  {origDoc.preview_url && (
                    <div className="h-36 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                      <img src={origDoc.preview_url} alt="Original preview" className="max-h-full object-contain" />
                    </div>
                  )}
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors block">
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-sm font-semibold text-slate-300">Upload Authentic Baseline</span>
                  <span className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (or click Load Sample above)</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        setOrigDoc({
                          id: 'doc-user-orig-' + Date.now(),
                          user_id: user?.id || 'demo',
                          file_name: file.name,
                          file_size: file.size,
                          mime_type: file.type,
                          storage_path: 'temp/' + file.name,
                          sha256_hash: 'custom-hash',
                          page_count: 1,
                          document_type: 'invoice',
                          uploaded_at: new Date().toISOString(),
                          preview_url: URL.createObjectURL(file),
                        });
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* 2. SUSPECTED DOCUMENT DROPZONE */}
            <div className="glass-card p-6 rounded-2xl space-y-4 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  Document 2: Suspected / Altered
                </span>
                {suspDoc && (
                  <button
                    onClick={() => setSuspDoc(null)}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {suspDoc ? (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-rose-500/30 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{suspDoc.file_name}</p>
                      <p className="text-xs text-slate-400">Target for Tamper Analysis</p>
                    </div>
                  </div>
                  {suspDoc.preview_url && (
                    <div className="h-36 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                      <img src={suspDoc.preview_url} alt="Suspected preview" className="max-h-full object-contain" />
                    </div>
                  )}
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-800 hover:border-rose-500/50 rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer transition-colors block">
                  <Upload className="w-8 h-8 text-slate-500 mb-2" />
                  <span className="text-sm font-semibold text-slate-300">Upload Suspected Altered File</span>
                  <span className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (or click Load Sample above)</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const file = e.target.files[0];
                        setSuspDoc({
                          id: 'doc-user-susp-' + Date.now(),
                          user_id: user?.id || 'demo',
                          file_name: file.name,
                          file_size: file.size,
                          mime_type: file.type,
                          storage_path: 'temp/' + file.name,
                          sha256_hash: 'custom-hash',
                          page_count: 1,
                          document_type: 'invoice',
                          uploaded_at: new Date().toISOString(),
                          preview_url: URL.createObjectURL(file),
                        });
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Trigger Comparison Button */}
          {origDoc && suspDoc && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={handleStartComparison}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all disabled:opacity-50"
              >
                <GitCompare className="w-4 h-4" />
                {isAnalyzing ? analysisStatus : 'Execute Side-by-Side Difference Detection'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comparison Results View */}
      {comparison && (
        <div className="space-y-8 animate-fadeIn">
          {/* Comparison Risk Summary Header */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    CRITICAL RISK DISCREPANCY
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    COMP ID: {comparison.id}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Structural & Forensic Differences Located
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {comparison.total_differences} distinct alterations detected between baseline and suspected target. High risk of fraudulent billing manipulation.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  New Comparison
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/reports?comparisonId=${comparison.id}`)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Generate Audit Report
                </button>
              </div>
            </div>

            {/* Scorecard Metrics Grid (Section 3.2: Similarity Score, Text Diff, Image Diff, Layout Diff, Metadata Diff) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xl font-mono font-bold text-white block">
                  {comparison.similarity_score}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Similarity Score
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xl font-mono font-bold text-rose-400 block">
                  {comparison.text_diff_score}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Text Diff (Red)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xl font-mono font-bold text-amber-400 block">
                  {comparison.image_diff_score}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Image Variance
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xl font-mono font-bold text-emerald-400 block">
                  {comparison.layout_diff_score}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Layout Alignment
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xl font-mono font-bold text-indigo-400 block">
                  {comparison.metadata_diff_score}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Metadata Discrepancy
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                <span className="text-xl font-mono font-bold text-sky-400 block">
                  {comparison.total_differences}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Total Differences
                </span>
              </div>
            </div>
          </div>

          {/* Split Side-by-Side Dual Document Synchronized Viewer */}
          <DualViewer
            originalUrl={origDoc?.preview_url}
            suspectedUrl={suspDoc?.preview_url}
            differences={comparison.differences || []}
            activeDiffId={activeDiff?.id}
            onSelectDifference={(diff) => setActiveDiff(diff)}
          />

          {/* Difference Summary Table */}
          <DifferenceTable
            differences={comparison.differences || []}
            activeDiffId={activeDiff?.id}
            onSelectDifference={(diff) => setActiveDiff(diff)}
          />
        </div>
      )}
    </div>
  );
};
