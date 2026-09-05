import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { mockForensicEngine, mockStore } from '../lib/mockAI/mockEngine';
import { generateMockDocumentSvg, INITIAL_MOCK_DOCUMENTS } from '../lib/mockAI/mockData';
import {
  DocumentRecord,
  VerificationRecord,
  VerificationPipelineStage,
  SuspiciousRegion,
} from '../lib/types';
import { FileUploadZone } from '../components/verify/FileUploadZone';
import { StageTracker } from '../components/verify/StageTracker';
import { ResultHeader } from '../components/verify/ResultHeader';
import { ForensicViewer } from '../components/viewer/ForensicViewer';
import { ChecksList } from '../components/verify/ChecksList';
import { Play, FileSearch, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabaseService } from '../lib/services/supabaseService';

export const VerifyPage: React.FC = () => {
  const { user } = useAuth();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [stage, setStage] = useState<VerificationPipelineStage>('idle');
  const [stageLabel, setStageLabel] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [verificationResult, setVerificationResult] = useState<VerificationRecord | null>(null);
  const [activeRegion, setActiveRegion] = useState<SuspiciousRegion | null>(null);

  // File selected via drag & drop or browse
  const handleFileSelected = (file: File, hash: string, preview?: string) => {
    setSelectedFile(file);
    setFileHash(hash);
    setPreviewUrl(preview || '');
    setVerificationResult(null);
    setStage('idle');
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileHash('');
    setPreviewUrl('');
    setVerificationResult(null);
    setStage('idle');
    setActiveRegion(null);
  };

  // Load preconfigured samples
  const handleLoadSample = (sampleType: 'tampered' | 'authentic') => {
    const isTampered = sampleType === 'tampered';
    const sampleDoc = isTampered ? INITIAL_MOCK_DOCUMENTS[1] : INITIAL_MOCK_DOCUMENTS[0];
    const mockFile = new File(['mock content'], sampleDoc.file_name, { type: sampleDoc.mime_type });

    setSelectedFile(mockFile);
    setFileHash(sampleDoc.sha256_hash);
    setPreviewUrl(sampleDoc.preview_url || generateMockDocumentSvg(isTampered ? 'invoice_tampered' : 'invoice_orig'));
    setVerificationResult(null);
    setStage('idle');
    setActiveRegion(null);
  };

  // Execute verification pipeline
  const handleStartVerification = async () => {
    if (!selectedFile) return;

    setStage('uploading');
    setProgress(5);

    // Create document record
    const docId = 'doc-' + Date.now().toString(36);
    const userId = user?.id || 'user-demo-1';

    // Upload to Supabase Storage if configured
    const storageUrl = await supabaseService.uploadDocument(selectedFile, userId, docId);

    const newDoc: DocumentRecord = {
      id: docId,
      user_id: userId,
      file_name: selectedFile.name,
      file_size: selectedFile.size,
      mime_type: selectedFile.type || 'application/pdf',
      storage_path: `${userId}/${docId}/${selectedFile.name}`,
      sha256_hash: fileHash || 'hash-placeholder',
      page_count: 1,
      document_type: 'invoice',
      uploaded_at: new Date().toISOString(),
      preview_url: storageUrl || previewUrl,
    };

    await supabaseService.saveDocument(newDoc);

    // Run 7-stage forensic engine
    const result = await mockForensicEngine.runForensicVerification(
      newDoc,
      (currentStage, label, prog) => {
        setStage(currentStage);
        setStageLabel(label);
        setProgress(prog);
      }
    );

    // Save verification to Supabase
    await supabaseService.saveVerification(result);

    setVerificationResult(result);
    setStage('completed');

    if (result.verdict === 'authentic') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#6366f1', '#38bdf8'],
      });
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <FileSearch className="w-7 h-7 text-indigo-400" />
          Document Forensic Analysis
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Upload legal documents, contracts, bank invoices, or credentials for automated forgery and alteration inspection.
        </p>
      </div>

      {/* State 1: Idle / Upload State */}
      {stage === 'idle' && !verificationResult && (
        <div className="space-y-6">
          <FileUploadZone
            selectedFile={selectedFile}
            fileHash={fileHash}
            onFileSelected={handleFileSelected}
            onClearFile={handleClearFile}
            onLoadSample={handleLoadSample}
          />

          {selectedFile && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleStartVerification}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-white" />
                Start 7-Stage Forensic Verification
              </button>
            </div>
          )}
        </div>
      )}

      {/* State 2: Active Pipeline Processing */}
      {stage !== 'idle' && stage !== 'completed' && (
        <div className="space-y-6">
          <StageTracker
            currentStage={stage}
            currentLabel={stageLabel}
            progressPercent={progress}
          />

          {/* Real-time scanning visualizer */}
          <div className="glass-card p-6 rounded-2xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Scanning Quantum Pixel Discrepancies & Vector Baselines
            </div>

            <div className="max-w-md mx-auto aspect-[3/4] max-h-[360px] bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Scanning target" className="max-h-full object-contain opacity-70" />
              ) : (
                <div className="text-slate-600 font-mono text-xs">Analyzing Document Canvas...</div>
              )}
              {/* Scan Beam */}
              <div className="absolute inset-x-0 h-12 forensic-scanner-beam animate-scanline"></div>
            </div>
          </div>
        </div>
      )}

      {/* State 3: Completed Verification Results */}
      {verificationResult && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Verdict Header */}
          <ResultHeader
            verification={verificationResult}
            onReset={handleClearFile}
          />

          {/* Dual Layout: Document Viewer (with overlays) + Checks List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Viewer Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Visual Inspection & Anomaly Heatmap
              </h3>
              <ForensicViewer
                documentUrl={verificationResult.document?.preview_url || previewUrl}
                documentTitle={verificationResult.document?.file_name}
                suspiciousRegions={
                  verificationResult.checks?.flatMap((c) => c.suspicious_regions) || []
                }
                activeRegionId={activeRegion?.id}
                onSelectRegion={(r) => setActiveRegion(r)}
              />
            </div>

            {/* Checks Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <ChecksList
                checks={verificationResult.checks || []}
                onHighlightRegion={(region) => setActiveRegion(region)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
