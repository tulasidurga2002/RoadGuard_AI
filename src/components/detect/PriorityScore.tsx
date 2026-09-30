import React from 'react';

interface PriorityScoreProps {
  score: number; // 0 - 100
  showBreakdown?: boolean;
}

export const PriorityScore: React.FC<PriorityScoreProps> = ({ score }) => {
  const getBandInfo = (s: number) => {
    if (s >= 81) {
      return {
        label: 'CRITICAL PRIORITY',
        colorText: 'text-rose-700',
        barColor: 'bg-rose-500',
        bgBadge: 'bg-rose-50 border-rose-200',
      };
    }
    if (s >= 61) {
      return {
        label: 'HIGH PRIORITY',
        colorText: 'text-orange-700',
        barColor: 'bg-orange-500',
        bgBadge: 'bg-orange-50 border-orange-200',
      };
    }
    if (s >= 31) {
      return {
        label: 'MEDIUM PRIORITY',
        colorText: 'text-amber-800',
        barColor: 'bg-amber-500',
        bgBadge: 'bg-amber-50 border-amber-200',
      };
    }
    return {
      label: 'LOW PRIORITY',
      colorText: 'text-emerald-800',
      barColor: 'bg-emerald-500',
      bgBadge: 'bg-emerald-50 border-emerald-200',
    };
  };

  const band = getBandInfo(score);
  const clampedScore = Math.min(Math.max(score, 0), 100);

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-xs uppercase font-semibold text-slate-500 block tracking-wider">
            Maintenance Priority Score
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`text-2xl font-black font-mono tracking-tight ${band.colorText}`}>
              {clampedScore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-md border text-xs font-bold font-mono tracking-wider ${band.bgBadge} ${band.colorText}`}>
          {band.label}
        </div>
      </div>

      {/* Progress Bar 0 to 100 */}
      <div className="space-y-1">
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${band.barColor}`}
            style={{ width: `${clampedScore}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0 (Low)</span>
          <span>31 (Med)</span>
          <span>61 (High)</span>
          <span>81–100 (Crit)</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        Priority is influenced by estimated damage severity, damage characteristics, location/context, and repeated reports.
      </p>

      <p className="text-[10px] text-slate-500 italic">
        * RoadGuard-generated decision-support score. Not an official statutory rating.
      </p>
    </div>
  );
};
