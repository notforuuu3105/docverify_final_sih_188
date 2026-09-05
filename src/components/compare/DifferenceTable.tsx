import React from 'react';
import { ComparisonDifference } from '../../lib/types';
import { getTagColorClass, getSeverityBadgeClass } from '../../lib/utils/formatters';
import { Crosshair, AlertTriangle, ArrowRight } from 'lucide-react';

interface DifferenceTableProps {
  differences: ComparisonDifference[];
  activeDiffId?: string | null;
  onSelectDifference?: (diff: ComparisonDifference) => void;
}

export const DifferenceTable: React.FC<DifferenceTableProps> = ({
  differences,
  activeDiffId,
  onSelectDifference,
}) => {
  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 space-y-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Difference Summary Matrix ({differences.length})
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any row or button to jump directly to the bounding box in both documents.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
              <th className="py-3 px-4">Tag</th>
              <th className="py-3 px-4">Region</th>
              <th className="py-3 px-4">Original Baseline</th>
              <th className="py-3 px-4">Suspected Value</th>
              <th className="py-3 px-4">Difference Type</th>
              <th className="py-3 px-4">Risk</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {differences.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No differences detected between documents.
                </td>
              </tr>
            ) : (
              differences.map((diff) => {
                const isSelected = activeDiffId === diff.id;
                const tagClasses = getTagColorClass(diff.visual_tag);

                return (
                  <tr
                    key={diff.id}
                    onClick={() => onSelectDifference?.(diff)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-rose-500/15 text-white'
                        : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    {/* Visual Tag Badge */}
                    <td className="py-3.5 px-4 font-mono">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${tagClasses.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${tagClasses.indicator}`}></span>
                        {diff.visual_tag}
                      </span>
                    </td>

                    {/* Region */}
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {diff.region_title}
                    </td>

                    {/* Original Value */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] max-w-[160px] truncate">
                      {diff.original_value || 'None (Empty)'}
                    </td>

                    {/* Suspected Value */}
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-rose-400 max-w-[180px] truncate">
                      {diff.suspected_value || 'Empty'}
                    </td>

                    {/* Difference Type */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono capitalize">
                        {diff.difference_type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Risk */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getSeverityBadgeClass(
                          diff.risk_level
                        )}`}
                      >
                        {diff.risk_level}
                      </span>
                    </td>

                    {/* Jump Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDifference?.(diff);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-400 text-[11px] transition-colors"
                      >
                        <Crosshair className="w-3 h-3" />
                        <span>Locate</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
