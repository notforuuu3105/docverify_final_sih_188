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
  { id: 'uploading', label: 'Uploading', icon: UploadCloud },
  { id: 'extracting_info', label: 'Extracting Information', icon: FileCode2 },
  { id: 'visual_analysis', label: 'Visual Analysis', icon: ScanEye },
  { id: 'metadata_check', label: 'Metadata Check', icon: FileCheck2 },
  { id: 'suspicious_region_detection', label: 'Suspicious Region Detection', icon: AlertCircle },
  { id: 'pattern_analysis', label: 'Pattern Analysis', icon: Activity },
  { id: 'result_generation', label: 'Result Generation', icon: CheckCircle2 },
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
    <div className="glass-card p-6 rounded-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Forensic Execution</span>
          <h3 className="text-base font-semibold text-white mt-0.5">{currentLabel}</h3>
        </div>
        <div className="text-right">
          <span className="text-2xl font-mono font-bold text-indigo-400">{progressPercent}%</span>
          <span className="text-xs text-slate-400 block -mt-1">Completed</span>
        </div>
      </div>

      {/* Progress Bar with glowing beam */}
      <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 transition-all duration-300 rounded-full relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute top-0 bottom-0 right-0 w-8 bg-white/40 blur-xs animate-pulse"></div>
        </div>
      </div>

      {/* 7 Stage Nodes Timeline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
        {STAGES.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = currentIndex > idx;
          const isCurrent = currentIndex === idx;

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border transition-all duration-200 flex flex-col items-center text-center ${
                isCurrent
                  ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/20 text-white'
                  : isPassed
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
              }`}
            >
              <div className="mb-2">
                {isPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className="text-[11px] font-semibold leading-tight">{step.label}</span>
              <span className="text-[10px] mt-1 text-slate-400 font-mono">Stage 0{idx + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
