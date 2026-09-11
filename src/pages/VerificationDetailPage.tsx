import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockStore } from '../lib/mockAI/mockEngine';
import { VerificationRecord, SuspiciousRegion } from '../lib/types';
import { ResultHeader } from '../components/verify/ResultHeader';
import { BiometricFaceMatch } from '../components/verify/BiometricFaceMatch';
import { ForensicViewer } from '../components/viewer/ForensicViewer';
import { ChecksList } from '../components/verify/ChecksList';
import { ArrowLeft, AlertCircle, Shield } from 'lucide-react';

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
      <div className="p-10 text-center glass-card rounded-sm space-y-4 border border-gov-line">
        <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="text-lg font-bold text-gov-navy-950">Verification Case Record Not Found</h2>
        <p className="text-xs text-gov-inksoft max-w-sm mx-auto">
          The requested forensic verification ID could not be located in the central departmental ledger.
        </p>
        <Link
          to="/history"
          className="btn-gov-secondary text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Case Audit Register
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn text-gov-ink">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-gov-line">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gov-navy-900 hover:text-gov-navy-950 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Case Register
        </button>

        <span className="text-xs text-gov-navy-900 font-mono font-bold bg-gov-paper px-2.5 py-1 rounded border border-gov-line">
          CASE RECORD: {verification.id.toUpperCase()}
        </span>
      </div>

      {/* Result Header */}
      <ResultHeader verification={verification} />

      {/* Biometric Face Match Result */}
      {verification.biometric_face_match && (
        <div className="space-y-2">
          <BiometricFaceMatch
            biometricMatch={verification.biometric_face_match}
            documentTitle={verification.document?.file_name}
          />
        </div>
      )}

      {/* Forensic Viewer & Checks Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-gov-navy-950 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-gov-navy-900" />
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

        <div className="lg:col-span-5 space-y-4">
          <ChecksList
            checks={verification.checks || []}
            onHighlightRegion={(region) => setActiveRegion(region)}
          />
        </div>
      </div>
    </div>
  );
};
