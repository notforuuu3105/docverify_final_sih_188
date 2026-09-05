import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockStore } from '../lib/mockAI/mockEngine';
import { VerificationRecord, SuspiciousRegion } from '../lib/types';
import { ResultHeader } from '../components/verify/ResultHeader';
import { ForensicViewer } from '../components/viewer/ForensicViewer';
import { ChecksList } from '../components/verify/ChecksList';
import { ArrowLeft, AlertCircle, FileSearch, Shield } from 'lucide-react';

export const VerificationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [verification, setVerification] = useState<VerificationRecord | null>(null);
  const [activeRegion, setActiveRegion] = useState<SuspiciousRegion | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const all = mockStore.getVerifications();
    const found = all.find((v) => v.id === id);
    if (found) {
      setVerification(found);
    }
  }, [id]);

  if (!verification) {
    return (
      <div className="p-12 text-center glass-card rounded-2xl space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Verification Record Not Found</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          The requested forensic verification ID could not be located in your tenant audit trail.
        </p>
        <Link
          to="/history"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to History
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
          <ArrowLeft className="w-4 h-4" /> Back to Records
        </button>

        <span className="text-xs text-slate-500 font-mono">
          RECORD: {verification.id}
        </span>
      </div>

      {/* Result Header */}
      <ResultHeader verification={verification} />

      {/* Forensic Viewer & Checks Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            Document Inspection Canvas
          </h3>
          <ForensicViewer
            documentUrl={verification.document?.preview_url}
            documentTitle={verification.document?.file_name}
            suspiciousRegions={verification.checks?.flatMap((c) => c.suspicious_regions) || []}
            activeRegionId={activeRegion?.id}
            onSelectRegion={(r) => setActiveRegion(r)}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <ChecksList
            checks={verification.checks || []}
            onHighlightRegion={(region) => setActiveRegion(region)}
          />
        </div>
      </div>
    </div>
  );
};
