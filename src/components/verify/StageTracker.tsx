import React from 'react';
import { VerificationPipelineStage } from '../../lib/types';
import {
  UploadCloud,
  FileCode2,
  ScanEye,
  FileCheck2,
  AlertCircle,
  Activity,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface StageTrackerProps {
  currentStage: VerificationPipelineStage;
  currentLabel: string;
  progressPercent: number;
}

interface StageStepConfig {
  id: VerificationPipelineStage;
  label: string;
  icon: React.ElementType;
}

const STAGES: StageStepConfig[] = [
  { id: 'uploading', label: 'Document Intake', icon: UploadCloud },
  { id: 'extracting_info', label: 'OCR & Text Vectors', icon: FileCode2 },
  { id: 'visual_analysis', label: 'ELA & Spectral Scan', icon: ScanEye },
  { id: 'metadata_check', label: 'EXIF Integrity', icon: FileCheck2 },
  { id: 'suspicious_region_detection', label: 'Tamper Localization', icon: AlertCircle },
  { id: 'pattern_analysis', label: 'Copy-Move Match', icon: Activity },
  { id: 'result_generation', label: 'Gazette Verdict', icon: CheckCircle2 },
];

export const StageTracker: React.FC<StageTrackerProps> = ({
  currentStage,
  currentLabel,
  progressPercent,
}) => {
  const getStageIndex = (stage: VerificationPipelineStage) => {
    return STAGES.findIndex((s) => s.id === stage);
  };

  const currentIndex = getStageIndex(currentStage);

  return (
    <div className="glass-card p-5 rounded-sm border border-gov-line space-y-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gov-saffron-dark font-mono block">
            AUTOMATED FORENSIC PIPELINE
          </span>
          <h3 className="text-sm font-bold text-gov-navy-950 mt-0.5">{currentLabel}</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-extrabold text-gov-navy-950">{progressPercent}%</span>
          <span className="text-[10px] text-gov-inksoft block -mt-1 font-semibold uppercase">Inspection Status</span>
        </div>
      </div>

      {/* Progress Bar in Government Navy & Saffron */}
      <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gov-navy-900 transition-all duration-300 rounded-full relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute top-0 bottom-0 right-0 w-4 bg-gov-saffron"></div>
        </div>
      </div>

      {/* 7 Stage Nodes Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
        {STAGES.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = currentIndex > idx;
          const isCurrent = currentIndex === idx;

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-sm border transition-all duration-200 flex flex-col items-center text-center ${
                isCurrent
                  ? 'bg-gov-navy-900 text-white border-gov-navy-950 shadow-sm'
                  : isPassed
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-gov-paper text-gov-inksoft border-gov-line'
              }`}
            >
              <div className="mb-1.5">
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-gov-saffron animate-spin" />
                ) : (
                  <Icon className="w-4 h-4 text-gov-inksoft" />
                )}
              </div>
              <span className="text-[11px] font-bold leading-tight line-clamp-1">{step.label}</span>
              <span
                className={`text-[9px] mt-0.5 font-mono ${
                  isCurrent ? 'text-slate-300' : 'text-gov-inksoft'
                }`}
              >
                PASS 0{idx + 1}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
