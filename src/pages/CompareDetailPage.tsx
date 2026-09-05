import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockStore } from '../lib/mockAI/mockEngine';
import { ComparisonRecord, ComparisonDifference } from '../lib/types';
import { DualViewer } from '../components/compare/DualViewer';
import { DifferenceTable } from '../components/compare/DifferenceTable';
import { ArrowLeft, AlertCircle, GitCompare, FileText } from 'lucide-react';

export const CompareDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [comparison, setComparison] = useState<ComparisonRecord | null>(null);
  const [activeDiff, setActiveDiff] = useState<ComparisonDifference | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const comps = mockStore.getComparisons();
    const found = comps.find((c) => c.id === id);
    if (found) {
      setComparison(found);
      if (found.differences && found.differences.length > 0) {
        setActiveDiff(found.differences[0]);
      }
    }
  }, [id]);

  if (!comparison) {
    return (
      <div className="p-12 text-center glass-card rounded-2xl space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Comparison Session Not Found</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          The requested dual-document comparison record could not be located.
        </p>
        <Link
          to="/compare"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Compare Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <span className="text-xs text-slate-500 font-mono">
          SESSION ID: {comparison.id}
        </span>
      </div>

      {/* Comparison Risk Summary Header */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {comparison.overall_risk.toUpperCase()} RISK
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {comparison.original_document?.file_name} vs {comparison.suspected_document?.file_name}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Side-by-Side Differential Forensic Matrix
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {comparison.total_differences} distinct alterations identified across vector layout, numeric values, and banking entities.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/reports?comparisonId=${comparison.id}`}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Generate Comparison Report
            </Link>
          </div>
        </div>

        {/* Scorecard Metrics Grid */}
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
              Differences Count
            </span>
          </div>
        </div>
      </div>

      {/* Dual Document Synchronized Viewer */}
      <DualViewer
        originalUrl={comparison.original_document?.preview_url}
        suspectedUrl={comparison.suspected_document?.preview_url}
        differences={comparison.differences || []}
        activeDiffId={activeDiff?.id}
        onSelectDifference={(diff) => setActiveDiff(diff)}
      />

      {/* Difference Table */}
      <DifferenceTable
        differences={comparison.differences || []}
        activeDiffId={activeDiff?.id}
        onSelectDifference={(diff) => setActiveDiff(diff)}
      />
    </div>
  );
};
